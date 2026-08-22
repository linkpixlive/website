import { useState } from "react";
import { useSearchParams } from "react-router";
import { DatePicker } from "../ui/DatePicker";
import { Icon } from "../ui/Icon";
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

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");
    setSearchParams(params);
  };

  const hasActiveFilters =
    searchParams.has("status") || searchParams.has("startDate") || searchParams.has("endDate");

  return (
    <div>
      <div className="flex md:hidden items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-[13px] font-semibold text-ink-body hover:text-ink-heading cursor-pointer outline-none"
        >
          <Icon name="filter" size={16} strokeWidth={1.9} className="text-chrome-icon" />
          {isOpen ? "Ocultar filtros" : "Filtros"}
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand" />}
        </button>
        {hasActiveFilters && !isOpen && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-semibold text-info hover:text-blue-700 underline cursor-pointer outline-none"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div
        className={`mt-4 gap-4 flex-col sm:flex-row sm:flex-wrap sm:items-end ${
          isOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <div className="w-full sm:w-44">
          <SelectField
            label="Status"
            options={statusOptions}
            value={status}
            onChange={handleStatusChange}
          />
        </div>

        <div className="w-full sm:w-44">
          <DatePicker
            label="Data de Início"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>

        <div className="w-full sm:w-44">
          <DatePicker
            label="Data Final"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="hidden md:block self-end pb-2.5 text-xs font-semibold text-info hover:text-blue-700 underline cursor-pointer outline-none"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
