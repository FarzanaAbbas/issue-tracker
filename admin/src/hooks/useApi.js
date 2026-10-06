import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

// In-memory response cache (stale-while-revalidate), same approach as the user app.
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

export function prefetch(url) {
  if (!cache.has(url)) load(url).catch(() => {});
}

/** Drop every cached response (after any change, all admin views may be stale). */
export function invalidateAll() {
  cache.clear();
}

export const clearCache = invalidateAll;

/** GET `url` with caching. */
export function useApi(url) {
  const [data, setData] = useState(() => cache.get(url));
  const [error, setError] = useState("");

  useEffect(() => {
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

  const refresh = useCallback(async () => {
    cache.delete(url);
    const d = await load(url);
    setData(d);
    return d;
  }, [url]);

  return { data, error, loading: data === undefined && !error, refresh };
}
