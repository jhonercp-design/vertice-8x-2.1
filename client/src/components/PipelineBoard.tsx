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
import { GripVertical, DollarSign, Calendar, User, AlertCircle, Filter, X, ArrowUp, ArrowDown } from "lucide-react";

const STAGES = [
  { id: "new", label: "Novo", color: "bg-slate-100 dark:bg-slate-800", textColor: "text-slate-900 dark:text-slate-100" },
  { id: "contacted", label: "Contato", color: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-900 dark:text-blue-100" },
  { id: "qualified", label: "Qualificado", color: "bg-purple-100 dark:bg-purple-900", textColor: "text-purple-900 dark:text-purple-100" },
  { id: "proposal", label: "Proposta", color: "bg-amber-100 dark:bg-amber-900", textColor: "text-amber-900 dark:text-amber-100" },
  { id: "negotiation", label: "Negociação", color: "bg-cyan-100 dark:bg-cyan-900", textColor: "text-cyan-900 dark:text-cyan-100" },
  { id: "won", label: "Ganho", color: "bg-green-100 dark:bg-green-900", textColor: "text-green-900 dark:text-green-100" },
];

interface Lead {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  source?: string | null;
  value?: string | number | null;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost" | string;
  notes?: string | null;
  createdAt?: string | Date | null;
  assignedTo?: number | null;
}

function LeadCard({ lead }: { lead: Lead }) {
  const {
    setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative overflow-hidden rounded-lg border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-3 hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start gap-2">
          <div
            ref={setActivatorNodeRef}
            {...listeners}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate mb-1">{lead.name}</p>
            <p className="text-[10px] text-muted-foreground truncate mb-2">{lead.company || "—"}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {lead.value && (
                <Badge variant="outline" className="text-[10px]">
                  <DollarSign className="w-2.5 h-2.5 mr-0.5" />
                  R$ {Number(lead.value).toLocaleString("pt-BR")}
                </Badge>
              )}
              {lead.source && (
                <Badge variant="secondary" className="text-[10px]">{lead.source}</Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PipelineBoard() {
  const { data: leads = [], isLoading } = trpc.leads.list.useQuery();
  const updateLeadStatus = trpc.leads.update.useMutation();

  const [optimisticLeads, setOptimisticLeads] = useState<Lead[]>(leads);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "value" | "none">("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState({
    minValue: "",
    maxValue: "",
    assignedTo: "",
    dateFrom: "",
    dateTo: "",
  });

  const filteredLeads = useMemo(() => {
    let result = optimisticLeads.filter((lead) => {
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

    // Apply sorting
    if (sortBy === "date") {
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === "value") {
      result.sort((a, b) => {
        const valueA = Number(a.value || 0);
        const valueB = Number(b.value || 0);
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      });
    }

    return result;
  }, [optimisticLeads, filters, sortBy, sortOrder]);

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
    useSensor(PointerSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as number;
    const newStatus = over.id as any;

    const lead = optimisticLeads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    setOptimisticLeads(
      optimisticLeads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );

    // Server update
    updateLeadStatus.mutate(
      { id: leadId, status: newStatus },
      {
        onError: () => {
          setOptimisticLeads(optimisticLeads);
        },
      },
    );
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

  const handleToggleSort = (field: "date" | "value") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");
  const hasActiveSort = sortBy !== "none";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters & Sort Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
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

          {/* Sort Buttons */}
          <div className="flex items-center gap-1 border border-border/30 rounded-lg p-1 bg-card/50">
            <Button
              variant={sortBy === "date" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToggleSort("date")}
              className="gap-1 text-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              Data
              {sortBy === "date" && (
                sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant={sortBy === "value" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToggleSort("value")}
              className="gap-1 text-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Valor
              {sortBy === "value" && (
                sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-lg border border-border/30 bg-card/50 overflow-hidden"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 min-w-max">
            {STAGES.map((stage) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-2 w-80"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5 px-1.5">
                    {leadsByStage[stage.id]?.length || 0}
                  </Badge>
                </div>
                <SortableContext items={leadsByStage[stage.id]?.map((l) => l.id) || []} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 min-h-[400px] p-2 rounded-lg border border-dashed border-border/30 bg-card/20">
                    {leadsByStage[stage.id]?.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Nenhum lead</p>
                        </div>
                      </div>
                    ) : (
                      leadsByStage[stage.id]?.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </motion.div>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
