import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SceneLoader } from "@/components/scene/scene-loader";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Path } from "@/components/sections/path";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { site } from "@/lib/site";

export default async function Home() {
  const t = await getTranslations("Meta");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `https://${site.domain}/#person`,
        name: site.author,
        jobTitle: t("jobTitle"),
        url: `https://${site.domain}`,
        email: `mailto:${site.email}`,
        sameAs: [site.github],
        address: { "@type": "PostalAddress", addressLocality: "Vienna", addressCountry: "AT" },
        knowsAbout: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "OAuth 2.0", "Docker"],
      },
      {
        "@type": "WebSite",
        "@id": `https://${site.domain}/#website`,
        url: `https://${site.domain}`,
        name: site.name,
        description: t("description"),
        inLanguage: ["en", "de"],
        publisher: { "@id": `https://${site.domain}/#person` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />
      <SceneLoader />
      <Header />
      <main id="main">
        <Hero />
        <Work />
        <Skills />
        <Path />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
