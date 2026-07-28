import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { TaxonomyPage } from "./pages/TaxonomyPage";
import { DomainPage } from "./pages/DomainPage";

function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0a0a0d]">
      <ScrollManager />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/taxonomy" element={<TaxonomyPage />} />
          <Route path="/taxonomy/:domainId" element={<DomainPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
