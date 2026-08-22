import { Icon } from "./Icon";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 mt-6 py-3 border-t border-gray-100">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <Icon name="alt-arrow-left" size={16} strokeWidth={2} />
          Anterior
        </Button>
        <span className="text-[13px] font-medium text-ink-secondary self-center">
          {page} de {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
          <Icon name="alt-arrow-right" size={16} strokeWidth={2} />
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-ink-secondary">
            Página <span className="font-bold text-ink-heading">{page}</span> de{" "}
            <span className="font-bold text-ink-heading">{totalPages}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <Icon name="alt-arrow-left" size={16} strokeWidth={2} />
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
            <Icon name="alt-arrow-right" size={16} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
