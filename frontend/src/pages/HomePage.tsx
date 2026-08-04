import { Hero } from "../components/home/Hero";
import { NewsSection } from "../components/home/NewsSection";
import { LatestResearch } from "../components/home/LatestResearch";
import { TaxonomyHubPreview } from "../components/home/TaxonomyHubPreview";

export function HomePage() {
  return (
    <>
      <Hero />
      <NewsSection />
      <LatestResearch />
      <TaxonomyHubPreview />
    </>
  );
}
