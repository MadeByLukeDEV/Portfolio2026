import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} – ${site.author}`,
    short_name: site.name,
    description: "Portfolio of Lukas Graf, fullstack web developer from Vienna.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1b3a",
    theme_color: "#2f9bf0",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
