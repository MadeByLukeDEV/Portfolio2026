import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SceneLoader } from "@/components/scene/scene-loader";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Path } from "@/components/sections/path";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";

export default function Home() {
  return (
    <>
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
