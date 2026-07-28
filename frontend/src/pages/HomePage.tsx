import { Hero } from "../components/home/Hero";
import { NewsSection } from "../components/home/NewsSection";
import { TaxonomyHubPreview } from "../components/home/TaxonomyHubPreview";

export function HomePage() {
  return (
    <>
      <Hero />
      <NewsSection />
      <TaxonomyHubPreview />
    </>
  );
}
