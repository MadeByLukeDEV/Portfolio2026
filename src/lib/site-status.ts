import "server-only";

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; online: boolean }>();

/** Only public hostnames are probed, so a mistyped or hostile project URL cannot reach internal services. */
function isPublicHost(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") return false;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".internal")) return false;
    // Reject IP literals (private ranges and the rest) and single-label names such as Docker service hosts.
    if (/^[\d.]+$/.test(hostname) || hostname.includes(":") || !hostname.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

async function probe(url: string): Promise<boolean> {
  if (!isPublicHost(url)) return false;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      // A redirect already proves the server answers; following it could lead somewhere internal.
      redirect: "manual",
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
