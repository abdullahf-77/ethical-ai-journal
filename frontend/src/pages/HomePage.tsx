import { Hero } from "../components/home/Hero";
import { About } from "../components/home/About";
import { NewsSection } from "../components/home/NewsSection";
import { SubmissionSection } from "../components/home/SubmissionSection";
import { TaxonomyHubPreview } from "../components/home/TaxonomyHubPreview";

export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <NewsSection />
      <TaxonomyHubPreview />
      <SubmissionSection />
    </>
  );
}
