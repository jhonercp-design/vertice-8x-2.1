import makeWASocket, { DisconnectReason, useMultiFileAuthState, WASocket } from "@whiskeysockets/baileys";
import Boom from "@hapi/boom";
import QRCode from "qrcode";
import * as db from "../db";
import fs from "fs";
import path from "path";

let sock: WASocket | null = null;
let qrCodeData: string | null = null;
let isConnecting = false;

const authDir = path.join(process.cwd(), ".wbot_auth");

export async function initWhatsApp() {
  if (sock?.user) {
    console.log("[WhatsApp] Already connected");
    return sock;
  }

  if (isConnecting) {
    console.log("[WhatsApp] Connection in progress...");
    return null;
  }

  isConnecting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    // Handle QR Code
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("[WhatsApp] QR Code generated");
        qrCodeData = await QRCode.toDataURL(qr);
      }

      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("[WhatsApp] Connection closed. Reconnecting:", shouldReconnect);
        if (shouldReconnect) {
          setTimeout(() => {
            sock = null;
            isConnecting = false;
            initWhatsApp();
          }, 3000);
        } else {
          sock = null;
          qrCodeData = null;
          isConnecting = false;
        }
      } else if (connection === "open") {
        console.log("[WhatsApp] Connection opened");
        qrCodeData = null;
        isConnecting = false;
      }
    });

    // Handle credentials update
    sock.ev.on("creds.update", saveCreds);

    // Handle incoming messages
    sock.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      try {
        const senderId = msg.key.remoteJid || "";
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (!messageText) return;

        console.log(`[WhatsApp] Message from ${senderId}: ${messageText}`);

        // Save message to database
        await db.createWhatsappMessage({
          companyId: 1,
          sessionId: 1,
          remoteJid: senderId,
          fromMe: false,
          content: messageText,
        });

        // Create or update lead from sender
        const senderPhone = senderId.replace("@c.us", "");
        const leads = await db.getLeads(1, senderPhone);
        const existingLead = leads.find((l) => l.phone === senderPhone);

        if (!existingLead) {
          await db.createLead({
            name: `Contato ${senderPhone}`,
            phone: senderPhone,
            source: "whatsapp",
            companyId: 1,
            assignedTo: 1,
          });
        }

        // Send auto-reply
        await sock?.sendMessage(senderId, {
          text: "Obrigado por sua mensagem! Responderemos em breve.",
        });
      } catch (err) {
        console.error("[WhatsApp] Error processing message:", err);
      }
    });

    return sock;
  } catch (err) {
    console.error("[WhatsApp] Connection error:", err);
    isConnecting = false;
    return null;
  }
}

export async function sendWhatsAppMessage(remoteJid: string, text: string) {
  if (!sock?.user) {
    throw new Error("WhatsApp not connected");
  }

  try {
    const jid = remoteJid.includes("@") ? remoteJid : `${remoteJid}@c.us`;
    await sock.sendMessage(jid, { text });

    // Save sent message to database
    await db.createWhatsappMessage({
      companyId: 1,
      sessionId: 1,
      remoteJid: jid,
      fromMe: true,
      content: text,
    });

    return { success: true };
  } catch (err) {
    console.error("[WhatsApp] Send message error:", err);
    throw err;
  }
}

export function getQRCode() {
  return qrCodeData;
}

export function isConnected() {
  return sock?.user ? true : false;
}

export function getConnectionStatus() {
  return {
    connected: isConnected(),
    connecting: isConnecting,
    qrCode: qrCodeData,
    user: sock?.user?.id || null,
  };
}

// Auto-initialize on server start
setTimeout(() => {
  initWhatsApp().catch(console.error);
}, 1000);
