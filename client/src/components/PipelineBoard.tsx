import { useState, useMemo } from "react";
import {
  DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { GripVertical, DollarSign, Calendar, User, AlertCircle, Filter, X } from "lucide-react";

const STAGES = [
  { id: "new", label: "Novo", color: "bg-slate-100 dark:bg-slate-800", textColor: "text-slate-900 dark:text-slate-100" },
  { id: "contacted", label: "Contato", color: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-900 dark:text-blue-100" },
  { id: "qualified", label: "Qualificado", color: "bg-purple-100 dark:bg-purple-900", textColor: "text-purple-900 dark:text-purple-100" },
  { id: "negotiation", label: "Negociação", color: "bg-amber-100 dark:bg-amber-900", textColor: "text-amber-900 dark:text-amber-100" },
  { id: "won", label: "Ganho", color: "bg-green-100 dark:bg-green-900", textColor: "text-green-900 dark:text-green-100" },
  { id: "lost", label: "Perdido", color: "bg-red-100 dark:bg-red-900", textColor: "text-red-900 dark:text-red-100" },
];

type Lead = {
  id: number;
  name: string;
  email: string | null;
  status: string;
  value?: string | number | null;
  createdAt?: Date | string;
  contactName?: string | null;
  [key: string]: any;
};

function DraggableLeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`cursor-grab active:cursor-grabbing ${isDragging ? "shadow-lg ring-2 ring-primary" : "hover:shadow-md"}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
              {lead.email && <p className="text-xs text-muted-foreground truncate">{lead.email}</p>}
            </div>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {lead.value && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-3.5 h-3.5 text-green-600" />
              <span className="font-medium">R$ {(Number(lead.value) / 1000).toFixed(1)}k</span>
            </div>
          )}

          {lead.contactName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{lead.contactName}</span>
            </div>
          )}

          {lead.createdAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PipelineColumn({ stage, leads, onDrop }: { stage: typeof STAGES[0]; leads: Lead[]; onDrop: (leadId: number) => void }) {
  const { setNodeRef } = useSortable({ id: stage.id, disabled: true });

  return (
    <div ref={setNodeRef} className="flex flex-col gap-4 flex-1 min-w-[300px]">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{stage.label}</h3>
          <Badge variant="secondary">{leads.length}</Badge>
        </div>
        <div className={`h-1 rounded-full ${stage.color}`} />
      </div>

      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className={`flex-1 space-y-2 p-3 rounded-lg border-2 border-dashed border-muted-foreground/20 min-h-[400px] ${stage.color}`}>
          {leads.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum lead</p>
              </div>
            </div>
          ) : (
            leads.map((lead) => <DraggableLeadCard key={lead.id} lead={lead} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function PipelineBoard() {
  const { data: leads = [], isLoading } = trpc.leads.list.useQuery();
  const updateLeadStatus = trpc.leads.update.useMutation();

  const [optimisticLeads, setOptimisticLeads] = useState<Lead[]>(leads);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minValue: "",
    maxValue: "",
    assignedTo: "",
    dateFrom: "",
    dateTo: "",
  });

  const filteredLeads = useMemo(() => {
    return optimisticLeads.filter((lead) => {
      // Filter by value
      if (filters.minValue && lead.value && Number(lead.value) < Number(filters.minValue)) return false;
      if (filters.maxValue && lead.value && Number(lead.value) > Number(filters.maxValue)) return false;

      // Filter by assigned to
      if (filters.assignedTo && lead.assignedTo !== Number(filters.assignedTo)) return false;

      // Filter by date range
      if (filters.dateFrom || filters.dateTo) {
        const leadDate = new Date(lead.createdAt || "");
        if (filters.dateFrom && leadDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && leadDate > new Date(filters.dateTo)) return false;
      }

      return true;
    });
  }, [optimisticLeads, filters]);

  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    STAGES.forEach((stage) => {
      grouped[stage.id] = [];
    });
    filteredLeads.forEach((lead) => {
      const stage = lead.status || "new";
      if (grouped[stage]) {
        grouped[stage].push(lead);
      }
    });
    return grouped;
  }, [filteredLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    } as any)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const leadId = active.id as number;
    const newStageId = over.id as string;

    const lead = optimisticLeads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStageId) return;

    // Optimistic update
    const updatedLeads = optimisticLeads.map((l) =>
      l.id === leadId ? { ...l, status: newStageId } : l
    );
    setOptimisticLeads(updatedLeads);

    // Server update
    try {
      await updateLeadStatus.mutateAsync({ id: leadId, status: newStageId as any });
    } catch (error) {
      // Rollback on error
      setOptimisticLeads(optimisticLeads);
      console.error("Erro ao atualizar status do lead:", error);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      minValue: "",
      maxValue: "",
      assignedTo: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {hasActiveFilters && <Badge variant="secondary" className="ml-2">{Object.values(filters).filter(Boolean).length}</Badge>}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Limpar
            </Button>
          )}
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-lg border border-border/30 bg-card/50"
          >
            {/* Value Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Valor Mínimo</label>
              <Input
                type="number"
                placeholder="R$ 0"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Valor Máximo</label>
              <Input
                type="number"
                placeholder="R$ 999999"
                value={filters.maxValue}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                className="h-9"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Data De</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Data Até</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="h-9"
              />
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Responsável</label>
              <Select value={filters.assignedTo} onValueChange={(v) => setFilters({ ...filters, assignedTo: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {/* Add user options dynamically */}
                  <SelectItem value="1">Você</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Pipeline Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max pr-4">
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] || []}
              onDrop={() => {}}
            />
          ))}
        </div>
      </div>
      </DndContext>
    </div>
  );
}
