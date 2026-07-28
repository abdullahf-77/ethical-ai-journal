import { Hero } from "../components/home/Hero";
import { NewsSection } from "../components/home/NewsSection";
import { SubmissionSection } from "../components/home/SubmissionSection";
import { TaxonomyHubPreview } from "../components/home/TaxonomyHubPreview";

export function HomePage() {
  return (
    <>
      <Hero />
      <NewsSection />
      <SubmissionSection />
      <TaxonomyHubPreview />
    </>
  );
}
