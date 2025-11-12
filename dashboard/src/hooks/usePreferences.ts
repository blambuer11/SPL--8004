import { useCallback, useEffect, useMemo, useState } from "react";

const LS_KEYS = {
  favorites: "noema:favorites", // string[] of agentIds
  routingDefault: "noema:routing:defaultAgentId", // string | null
  alertsEnabled: "noema:alerts:enabled", // "1" | "0"
  alertThreshold: "noema:alerts:threshold", // number (score drop threshold)
} as const;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function usePreferences() {
  const [favorites, setFavorites] = useState<string[]>(() => readJSON(LS_KEYS.favorites, []));
  const [defaultAgentId, setDefaultAgentId] = useState<string | null>(() => {
    const v = localStorage.getItem(LS_KEYS.routingDefault);
    return v && v !== "null" ? v : null;
  });
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => localStorage.getItem(LS_KEYS.alertsEnabled) === "1");
  const [alertThreshold, setAlertThreshold] = useState<number>(() => {
    const v = localStorage.getItem(LS_KEYS.alertThreshold);
    return v ? Number(v) : 100; // default: alert on >=100 score drop
  });

  useEffect(() => writeJSON(LS_KEYS.favorites, favorites), [favorites]);
  useEffect(() => {
    if (defaultAgentId) localStorage.setItem(LS_KEYS.routingDefault, defaultAgentId);
    else localStorage.removeItem(LS_KEYS.routingDefault);
  }, [defaultAgentId]);
  useEffect(() => localStorage.setItem(LS_KEYS.alertsEnabled, alertsEnabled ? "1" : "0"), [alertsEnabled]);
  useEffect(() => localStorage.setItem(LS_KEYS.alertThreshold, String(alertThreshold)), [alertThreshold]);

  const isFavorite = useCallback((agentId: string) => favorites.includes(agentId), [favorites]);
  const toggleFavorite = useCallback((agentId: string) => {
    setFavorites((prev) => (prev.includes(agentId) ? prev.filter((a) => a !== agentId) : [...prev, agentId]));
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    defaultAgentId,
    setDefaultAgentId,
    alertsEnabled,
    setAlertsEnabled,
    alertThreshold,
    setAlertThreshold,
  };
}
