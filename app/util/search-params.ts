import type { SetURLSearchParams } from "react-router";

export function updateParams(
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
  mutate: (params: URLSearchParams) => void,
) {
  const params = new URLSearchParams(searchParams);
  mutate(params);
  params.set("page", "1");
  setSearchParams(params);
}

export function setParamOrDelete(
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue = "",
) {
  if (value && value !== defaultValue) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
}

export function getPageParam(url: URL, key = "page", fallback = 1): number {
  const raw = url.searchParams.get(key);
  if (raw === null || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}
