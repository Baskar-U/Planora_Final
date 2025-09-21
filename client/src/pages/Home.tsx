import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PopularCities from "@/components/PopularCities";
import IndividualServices from "@/components/IndividualServices";
import Categories from "@/components/Categories";
import FeaturedServices from "@/components/FeaturedServices";
import FeaturedVendors from "@/components/FeaturedVendors";
import QuickStartGuide from "@/components/QuickStartGuide";
import FloatingQuickStart from "@/components/FloatingQuickStart";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import OnboardingModal from "@/components/OnboardingModal";
import { useUserType } from "@/contexts/UserTypeContext";
import { auth } from "@/lib/firebase";

export default function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { userType } = useUserType();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      
      // Show onboarding for new users (you can add a flag in user profile to track this)
      if (user && !localStorage.getItem(`onboarding-${user.uid}`)) {
        setOnboardingOpen(true);
        localStorage.setItem(`onboarding-${user.uid}`, 'true');
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle authentication redirects from URL params
  // Auth modal is now handled by Navbar component


    return (
    <div className="bg-white">
      <Navbar />
      <div>
        <HeroSection />
      </div>
      
      {/* QuickStartGuide - Moved to top for immediate access
      <div className="py-8 bg-white">
        <QuickStartGuide />
      </div> */}
      
      {/* How It Works Section */}
      <HowItWorks />
      
      {/* Ad between How It Works and Popular Cities */}
      <div className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6343948689807963" crossOrigin="anonymous"></script>
              <ins className="adsbygoogle"
                   style={{display: 'block'}}
                   data-ad-client="ca-pub-6343948689807963"
                   data-ad-slot="4229250278"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              <script dangerouslySetInnerHTML={{
                __html: '(adsbygoogle = window.adsbygoogle || []).push({});'
              }}></script>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50">
        <PopularCities />
      </div>
      <div className="bg-white">
        <IndividualServices />
      </div>
      
      {/* Ad between Individual Services and Explore Categories */}
      <div className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6343948689807963" crossOrigin="anonymous"></script>
              <ins className="adsbygoogle"
                   style={{display: 'block'}}
                   data-ad-client="ca-pub-6343948689807963"
                   data-ad-slot="4229250278"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              <script dangerouslySetInnerHTML={{
                __html: '(adsbygoogle = window.adsbygoogle || []).push({});'
              }}></script>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50">
        <Categories />
      </div>
      {/* <div className="bg-white">
        <FeaturedServices />
      </div> */}
      <div className="bg-gray-50">
        <FeaturedVendors />
      </div>
      {/* <Testimonials /> */}
      <Footer />
      {/* <FloatingQuickStart /> */}
      <OnboardingModal 
        open={onboardingOpen} 
        onOpenChange={setOnboardingOpen} 
        userType={userType}
      />
    </div>
  );
}
