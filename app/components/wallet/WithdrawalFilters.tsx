import { Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../ui/Button";
import { DatePicker } from "../ui/DatePicker";
import { SelectField } from "../ui/SelectField";

interface WithdrawalFiltersProps {
  onFilterChange: (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
];

export function WithdrawalFilters({ onFilterChange }: WithdrawalFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [startDate, setStartDate] = useState<Date | null>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : null
  );

  const [isOpen, setIsOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setStatus(searchParams.get("status") || "all");
    setStartDate(
      searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : null
    );
    setEndDate(
      searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : null
    );
  }, [searchParams]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams);
    
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    if (startDate) {
      params.set("startDate", startDate.toISOString().split("T")[0]);
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate.toISOString().split("T")[0]);
    } else {
      params.delete("endDate");
    }

    params.set("page", "1"); // Reset to page 1 on filter apply
    setSearchParams(params);

    onFilterChange({
      status: status !== "all" ? status : undefined,
      startDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
      endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
    });
  };

  const handleClear = () => {
    setStatus("all");
    setStartDate(null);
    setEndDate(null);

    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");
    setSearchParams(params);

    onFilterChange({});
  };

  const hasActiveFilters =
    searchParams.has("status") || searchParams.has("startDate") || searchParams.has("endDate");

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-6">
      {/* Mobile filter button trigger */}
      <div className="flex md:hidden items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-text-heading cursor-pointer outline-none"
        >
          <Filter className="h-4 w-4" />
          {isOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="text-xs text-error font-medium flex items-center gap-1 cursor-pointer outline-none"
          >
            <X className="h-3 w-3" /> Limpar
          </button>
        )}
      </div>

      {/* Filter panel contents */}
      <div className={`mt-4 md:mt-0 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 ${isOpen ? "block" : "hidden md:flex"}`}>
        <div className="w-full md:max-w-xs">
          <SelectField
            label="Status"
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>

        <div className="w-full md:max-w-xs">
          <DatePicker
            label="Data de Início"
            value={startDate}
            onChange={setStartDate}
          />
        </div>

        <div className="w-full md:max-w-xs">
          <DatePicker
            label="Data Final"
            value={endDate}
            onChange={setEndDate}
          />
        </div>

        <div className="flex items-center gap-2 pt-2 md:pt-0 w-full md:w-auto">
          <Button
            onClick={handleApply}
            className="flex-1 md:flex-initial"
          >
            Aplicar
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClear}
              className="flex-1 md:flex-initial"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
