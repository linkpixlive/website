import { useState } from "react";
import { useSearchParams } from "react-router";
import { Icon } from "../ui/Icon";
import { SelectField } from "../ui/SelectField";
import { FilterSearchField } from "./FilterSearchField";

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "paid", label: "Não exibido" },
  { value: "displayed", label: "Exibido" },
];

const daysOptions = [
  { value: "all", label: "Todos os períodos" },
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
  const days = searchParams.get("days") || "all";
  const searchBy = searchParams.get("searchBy") || "name";
  const searchParam = searchParams.get("search") || "";

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

  const handleDaysChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("days", value);
    } else {
      params.delete("days");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSearchByChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("searchBy", value);
    // keep search as is, but reset page
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSearchCommit = (trimmed: string) => {
    const params = new URLSearchParams(searchParams);
    if (trimmed.length >= 2) {
      params.set("search", trimmed);
      params.set("searchBy", searchBy);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("days");
    params.delete("search");
    params.delete("searchBy");
    params.set("page", "1");
    setSearchParams(params);
  };

  const hasActiveFilters =
    searchParams.has("status") ||
    searchParams.has("days") ||
    searchParams.has("search");

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
          <SelectField
            label="Período"
            options={daysOptions}
            value={days}
            onChange={handleDaysChange}
          />
        </div>

        <div className="w-full sm:flex-1 sm:min-w-[280px]">
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
