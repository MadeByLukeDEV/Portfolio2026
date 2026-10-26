import { ImageResponse } from "next/og";
import { getLocale, getTranslations } from "next-intl/server";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MadeByLuke";

export default async function OpenGraphImage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Meta" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#eaf6ff",
          background: "#0d1b3a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#2f8ee0",
              fontSize: 44,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            L
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            {t("ogTagline")}
          </div>
          <div style={{ fontSize: 32, color: "#8fd3ff" }}>
            {`${site.author} · ${t("jobTitle")}`}
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#8aa4c4" }}>{site.domain}</div>
      </div>
    ),
    size,
  );
}
