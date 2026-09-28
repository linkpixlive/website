import { useSearchParams } from "react-router";

/** Lê os params da URL + troca de página preservando os filtros atuais. */
export function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return { searchParams, handlePageChange };
}
