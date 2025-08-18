import { useState } from "react";
import { useSearchParams } from "wouter/use-search-params";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PopularCities from "@/components/PopularCities";
import Categories from "@/components/Categories";
import FeaturedServices from "@/components/FeaturedServices";
import AIAssistantCTA from "@/components/AIAssistantCTA";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const handleGetStarted = () => {
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection onGetStarted={handleGetStarted} />
      <PopularCities />
      <Categories />
      <FeaturedServices />
      <AIAssistantCTA />
      <Footer />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
