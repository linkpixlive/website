import { useSearchParams } from "react-router";

/** Reads URL page param and changes page while preserving filters. */
export function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return { searchParams, handlePageChange };
}
