"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDashboardCopy, type DashboardLocale } from "@/components/dashboard/dashboardCopy";

const DASHBOARD_LOCALE_KEY = "dashboard.locale";

function normalizeLocale(value: string | null | undefined): DashboardLocale | undefined {
  if (value === "en" || value === "es") return value;
  return undefined;
}

export function useDashboardCopy() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<DashboardLocale>("es");

  useEffect(() => {
    const queryLocale = normalizeLocale(searchParams.get("lang"));

    if (queryLocale) {
      setLocale(queryLocale);
      try {
        localStorage.setItem(DASHBOARD_LOCALE_KEY, queryLocale);
      } catch {
        // Ignore storage errors in restricted browser contexts.
      }
      return;
    }

    try {
      const storedLocale = normalizeLocale(localStorage.getItem(DASHBOARD_LOCALE_KEY));
      if (storedLocale) {
        setLocale(storedLocale);
      }
    } catch {
      // Ignore storage errors in restricted browser contexts.
    }
  }, [searchParams]);

  const copy = useMemo(() => getDashboardCopy(locale), [locale]);

  const setDashboardLocale = (nextLocale: DashboardLocale) => {
    setLocale(nextLocale);
    try {
      localStorage.setItem(DASHBOARD_LOCALE_KEY, nextLocale);
    } catch {
      // Ignore storage errors in restricted browser contexts.
    }
  };

  return { locale, copy, setDashboardLocale };
}

