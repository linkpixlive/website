import { useState } from "react";
import { useSearchParams } from "react-router";
import { SelectField } from "~/components/ui/SelectField";
import { FilterSearchField } from "./FilterSearchField";
import { FilterShell } from "~/components/ui/FilterShell";
import { DEFAULT_HISTORY_DAYS } from "~/util/history-filters";
import { updateParams, setParamOrDelete } from "~/util/search-params";

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "paid", label: "Não exibido" },
  { value: "displayed", label: "Exibido" },
];

const daysOptions = [
  { value: "today", label: "Hoje" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "15", label: "Últimos 15 dias" },
  { value: "30", label: "Últimos 30 dias" },
];

const searchByOptions = [
  { value: "name", label: "Nome" },
  { value: "message", label: "Mensagem" },
];

export function DonationHistoryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const status = searchParams.get("status") || "all";
  // Padrão = últimos 30 dias (teto de retenção, alinhado ao lifecycle do R2).
  const days = searchParams.get("days") || DEFAULT_HISTORY_DAYS;
  const searchBy = searchParams.get("searchBy") || "name";
  const searchParam = searchParams.get("search") || "";

  const handleStatusChange = (value: string) => {
    updateParams(searchParams, setSearchParams, (params) => {
      setParamOrDelete(params, "status", value, "all");
    });
  };

  const handleDaysChange = (value: string) => {
    updateParams(searchParams, setSearchParams, (params) => {
      // Padrão não precisa ir para a URL.
      setParamOrDelete(params, "days", value, DEFAULT_HISTORY_DAYS);
    });
  };

  const handleSearchByChange = (value: string) => {
    updateParams(searchParams, setSearchParams, (params) => {
      params.set("searchBy", value);
    });
  };

  const handleSearchCommit = (trimmed: string) => {
    updateParams(searchParams, setSearchParams, (params) => {
      if (trimmed.length >= 2) {
        params.set("search", trimmed);
        params.set("searchBy", searchBy);
      } else {
        params.delete("search");
      }
    });
  };

  const handleClearFilters = () => {
    updateParams(searchParams, setSearchParams, (params) => {
      params.delete("status");
      params.delete("days");
      params.delete("search");
      params.delete("searchBy");
    });
  };

  const daysParam = searchParams.get("days");
  const hasActiveFilters =
    searchParams.has("status") ||
    (daysParam !== null && daysParam !== DEFAULT_HISTORY_DAYS) ||
    searchParams.has("search");

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

      <div className="w-full sm:w-44">
        <SelectField
          label="Período"
          options={daysOptions}
          value={days}
          onChange={handleDaysChange}
        />
      </div>

      <div className="w-full sm:w-[320px] sm:flex-none sm:shrink-0">
        <FilterSearchField
          label="Buscar"
          options={searchByOptions}
          value={searchBy}
          onValueChange={handleSearchByChange}
          searchValue={searchParam}
          onSearchCommit={handleSearchCommit}
          placeholder={
            searchBy === "message"
              ? "Buscar na mensagem (mín. 2 letras)"
              : "Buscar por nome (mín. 2 letras)"
          }
        />
      </div>
    </FilterShell>
  );
}
