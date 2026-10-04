import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

// In-memory response cache (stale-while-revalidate): revisiting a page renders
// the last response instantly while a fresh copy loads in the background.
const cache = new Map();
const inflight = new Map();

function load(url) {
  if (!inflight.has(url)) {
    const p = api
      .get(url)
      .then((res) => {
        cache.set(url, res.data);
        return res.data;
      })
      .finally(() => inflight.delete(url));
    inflight.set(url, p);
  }
  return inflight.get(url);
}

/** Warm the cache ahead of navigation (e.g. on hover). */
export function prefetch(url) {
  if (!cache.has(url)) load(url).catch(() => {});
}

/** Warm everything the issue detail page needs. */
export function prefetchIssue(id) {
  prefetch(`/issues/${id}`);
  prefetch(`/issues/${id}/comments`);
}

/** Drop cached responses whose URL starts with any of the given prefixes. */
export function invalidate(...prefixes) {
  for (const key of cache.keys()) {
    if (prefixes.some((p) => key.startsWith(p))) cache.delete(key);
  }
}

/** After any issue/comment change: lists and dashboard counts must refetch. */
export function invalidateIssueLists() {
  for (const key of cache.keys()) {
    if (key === "/issues" || key.startsWith("/issues?") || key === "/dashboard") cache.delete(key);
  }
}

export function clearCache() {
  cache.clear();
}

export function setCached(url, data) {
  cache.set(url, data);
}

/** GET `url` with caching. Pass null to skip. */
export function useApi(url) {
  const [data, setData] = useState(() => (url ? cache.get(url) : undefined));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) return;
    let active = true;
    setError("");
    setData(cache.get(url));
    load(url)
      .then((d) => active && setData(d))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [url]);

  // Update local + cached data (for optimistic updates).
  const mutate = useCallback(
    (next) => {
      setData((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        if (url) cache.set(url, value);
        return value;
      });
    },
    [url]
  );

  return { data, error, loading: data === undefined && !error, mutate };
}
