import { useState } from "react";
import { useSearchParams } from "react-router";
import { DatePicker } from "~/components/ui/DatePicker";
import { SelectField } from "~/components/ui/SelectField";
import { FilterShell } from "~/components/ui/FilterShell";
import { updateParams, setParamOrDelete } from "~/util/search-params";

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
    updateParams(searchParams, setSearchParams, (params) => {
      setParamOrDelete(params, "status", value, "all");
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    updateParams(searchParams, setSearchParams, (params) => {
      if (date) {
        params.set("startDate", date.toISOString().split("T")[0]);
      } else {
        params.delete("startDate");
      }
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    updateParams(searchParams, setSearchParams, (params) => {
      if (date) {
        params.set("endDate", date.toISOString().split("T")[0]);
      } else {
        params.delete("endDate");
      }
    });
  };

  const handleClearFilters = () => {
    updateParams(searchParams, setSearchParams, (params) => {
      params.delete("status");
      params.delete("startDate");
      params.delete("endDate");
    });
  };

  const hasActiveFilters =
    searchParams.has("status") || searchParams.has("startDate") || searchParams.has("endDate");

  return (
    <FilterShell
      hasActiveFilters={hasActiveFilters}
      onClearFilters={handleClearFilters}
      isOpen={isOpen}
      onToggleOpen={() => setIsOpen(!isOpen)}
    >
      <div className="w-full sm:w-44">
        <SelectField
          label="Status"
          options={statusOptions}
          value={status}
          onChange={handleStatusChange}
        />
      </div>

      <div className="w-full sm:w-48">
        <DatePicker
          label="Data de Início"
          value={startDate}
          onChange={handleStartDateChange}
        />
      </div>

      <div className="w-full sm:w-48">
        <DatePicker
          label="Data Final"
          value={endDate}
          onChange={handleEndDateChange}
        />
      </div>
    </FilterShell>
  );
}
