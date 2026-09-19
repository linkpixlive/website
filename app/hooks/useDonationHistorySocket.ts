import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { apiUrl } from "~/api/http/client";
import type { DonationHistory } from "~/api/modules/dashboard";

interface UseDonationHistorySocketReturn {
  items: DonationHistory[];
  total: number;
}

export function useDonationHistorySocket(
  token: string | null,
  initial: { items: DonationHistory[]; meta: { total: number; page: number; limit: number; totalPages: number } },
  currentPage: number,
  filters?: { status?: string; days?: string; search?: string; searchBy?: string }
): UseDonationHistorySocketReturn {
  const [items, setItems] = useState<DonationHistory[]>(initial.items);
  const [total, setTotal] = useState(initial.meta.total);

  // Sync when initial changes due to navigation (page change)
  useEffect(() => {
    setItems(initial.items);
    setTotal(initial.meta.total);
  }, [initial.items, initial.meta.total, currentPage]);

  useEffect(() => {
    if (!token) return;

    const socket = io(`${apiUrl}/dashboard`, {
      auth: { token },
    });

    const matchesFilters = (donation: DonationHistory) => {
      if (filters?.status && donation.status !== filters.status) return false;
      const daysFilter = filters?.days || "30";
      if (["7", "15", "30"].includes(daysFilter)) {
        const daysNum = parseInt(daysFilter, 10);
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        const start = new Date(now);
        start.setDate(now.getDate() - daysNum + 1);
        start.setHours(0, 0, 0, 0);
        if (!donation.approvedAt) return false;
        const approved = new Date(donation.approvedAt);
        if (approved < start || approved > end) return false;
      } else if (daysFilter === "today") {
        // "Hoje" = últimas 24h corridas (mesma regra do backend).
        if (!donation.approvedAt) return false;
        const approved = new Date(donation.approvedAt).getTime();
        if (Number.isNaN(approved)) return false;
        if (approved < Date.now() - 24 * 60 * 60 * 1000) return false;
      }
      const term = filters?.search?.trim();
      if (term && term.length >= 2) {
        const by = filters?.searchBy === "message" ? "message" : "name";
        if (by === "message") {
          const msg = donation.message ?? "";
          const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`\\b${escaped}\\b`, "i");
          if (!regex.test(msg)) return false;
        } else {
          if (!donation.name.toLowerCase().includes(term.toLowerCase())) return false;
        }
      }
      return true;
    };

    const onCreated = (donation: DonationHistory) => {
      if (!matchesFilters(donation)) return;
      setItems((prev) => {
        if (prev.some((d) => d.id === donation.id)) return prev;
        if (currentPage !== 1) return prev;
        return [donation, ...prev].slice(0, initial.meta.limit);
      });
      setTotal((t) => t + 1);
    };

    const onUpdated = (donation: DonationHistory) => {
      const stillMatches = matchesFilters(donation);
      setItems((prev) => {
        const exists = prev.some((d) => d.id === donation.id);
        if (exists && !stillMatches) {
          // No longer matches filter (e.g., paid -> displayed when filtering paid)
          setTotal((t) => Math.max(0, t - 1));
          return prev.filter((d) => d.id !== donation.id);
        }
        if (!exists && stillMatches) {
          // Now matches (rare)
          if (currentPage === 1) {
            setTotal((t) => t + 1);
            return [donation, ...prev].slice(0, initial.meta.limit);
          }
          setTotal((t) => t + 1);
          return prev;
        }
        return prev.map((d) => (d.id === donation.id ? { ...d, ...donation } : d));
      });
    };

    socket.on("donation:created", onCreated);
    socket.on("donation:updated", onUpdated);

    return () => {
      socket.off("donation:created", onCreated);
      socket.off("donation:updated", onUpdated);
      socket.disconnect();
    };
  }, [
    token,
    currentPage,
    initial.meta.limit,
    filters?.status,
    filters?.days,
    filters?.search,
    filters?.searchBy,
  ]);

  return { items, total };
}
