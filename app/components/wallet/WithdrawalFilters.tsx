import { Filter } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { DatePicker } from "../ui/DatePicker";
import { SelectField } from "../ui/SelectField";

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
];

export function WithdrawalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const status = searchParams.get("status") || "all";
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : null;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : null;

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleStartDateChange = (date: Date | null) => {
    const params = new URLSearchParams(searchParams);
    if (date) {
      params.set("startDate", date.toISOString().split("T")[0]);
    } else {
      params.delete("startDate");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleEndDateChange = (date: Date | null) => {
    const params = new URLSearchParams(searchParams);
    if (date) {
      params.set("endDate", date.toISOString().split("T")[0]);
    } else {
      params.delete("endDate");
    }
    params.set("page", "1");
    setSearchParams(params);
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
      </div>

      {/* Filter panel contents */}
      <div className={`mt-4 md:mt-0 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 ${isOpen ? "block" : "hidden md:flex"}`}>
        <div className="w-full md:max-w-xs">
          <SelectField
            label="Status"
            options={statusOptions}
            value={status}
            onChange={handleStatusChange}
          />
        </div>

        <div className="w-full md:max-w-xs">
          <DatePicker
            label="Data de Início"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>

        <div className="w-full md:max-w-xs">
          <DatePicker
            label="Data Final"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
    </div>
  );
}
