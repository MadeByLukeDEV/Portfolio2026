import "server-only";

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; online: boolean }>();

async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    // Any answer below 500 means the server is up, even if it asks for a sign-in.
    return res.status < 500;
  } catch {
    return false;
  }
}

/** Whether each site answers right now. Results are kept for five minutes. */
export async function getOnlineStatus(urls: string[]): Promise<Map<string, boolean>> {
  const now = Date.now();
  const result = new Map<string, boolean>();

  await Promise.all(
    urls.map(async (url) => {
      const hit = cache.get(url);
      if (hit && now - hit.at < TTL_MS) {
        result.set(url, hit.online);
        return;
      }
      const online = await probe(url);
      cache.set(url, { at: now, online });
      result.set(url, online);
    }),
  );
  return result;
}
