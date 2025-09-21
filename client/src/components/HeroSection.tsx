import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import { usePostorderServices } from "@/hooks/usePostorderServices";
import TrustSignals from "./TrustSignals";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

// Categories from Vendors page
const categories = [
  "All",
  "Catering", 
  "Decoration",
  "DJ",
  "Cakes",
  "Photography",
  "Travel"
];

// Only these categories are supported throughout the app
const allowedCategoriesSet = new Set<string>([
  "Catering",
  "Decoration",
  "DJ",
  "Cakes",
  "Travel",
  "Photography",
]);

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [user, setUser] = useState<any>(null);
  
  // Get vendors data for dynamic cities
  const { data: allServices = [], isLoading: servicesLoading } = usePostorderServices();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Transform services to vendors format (same as Vendors page)
  const transformedVendors = useMemo(() => {
    const transformed = allServices.map((service: any) => ({
      id: service.id,
      vendorid: service.vendorid,
      businessname: service.businessname || service.name,
      name: service.name,
      category: service.category,
      eventname: service.eventname,
      location: service.location,
      description: service.description,
      image: service.coverImage || service.image,
      mobilenumber: service.mobilenumber,
      email: service.email,
      exprience: service.experience,
      hours: service.hours || service.workingHours || 'Contact for availability',
      isVerified: service.isVerified,
      packages: service.packages || [],
      menu: service.menu || [],
      createdAt: service.createdAt,
      isPostorderService: true
    }));
    // Filter to only include allowed categories
    return transformed.filter((vendor: any) => allowedCategoriesSet.has(vendor.category));
  }, [allServices]);

  // Get unique cities from vendors for dynamic city list (same as Vendors page)
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    transformedVendors.forEach((vendor: any) => {
      if (vendor.location) {
        // Normalize city name: trim whitespace and convert to title case
        const normalizedCity = vendor.location.trim().replace(/\s+/g, ' ');
        if (normalizedCity) {
          cities.add(normalizedCity);
        }
      }
    });
    return ["All", ...Array.from(cities).sort()];
  }, [transformedVendors]);

  // Get unique categories from vendors for dynamic category list (restricted to allowed)
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    transformedVendors.forEach((vendor: any) => {
      const cat = (vendor.eventname || vendor.category || '').trim();
      if (cat && allowedCategoriesSet.has(cat)) {
        cats.add(cat);
      }
    });
    // Ensure consistent order matching categories[] constant
    const orderedCats = categories.filter(cat => cats.has(cat));
    return orderedCats;
  }, [transformedVendors]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedCity && selectedCity !== "All") params.set("city", selectedCity);
    
    const vendorsUrl = `/vendors?${params.toString()}`;
    
    // Redirect to vendors page with search parameters
    setLocation(vendorsUrl);
  };

  return (
    <section className="relative bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 text-white min-h-[600px] sm:min-h-[700px]">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
        role="img"
        aria-label="Event planning background with people celebrating"
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 flex flex-col justify-center min-h-[600px] sm:min-h-[700px]">
        <div className="text-center w-full">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4">
            Plan Your Events <span className="text-yellow-300">Perfectly</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 text-yellow-200 font-semibold max-w-3xl mx-auto px-4">
            The #1 Event Planning Platform - Connect with 500+ Verified Vendors
          </p>
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 text-gray-100 max-w-4xl mx-auto px-4">
            From weddings to corporate events, find the perfect vendors, compare prices, and book everything in one place. 
            <span className="font-semibold text-yellow-200"> Trusted by 10,000+ event planners.</span>
          </p>

          {/* Trust Signals */}
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <TrustSignals />
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-6 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8">
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12 md:h-14 text-base md:text-lg bg-white text-gray-900 border-gray-300 focus:border-primary-500 focus:ring-primary-500 tap-target">
                      <SelectValue placeholder="Search for services..." className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-12 md:h-14 text-base md:text-lg bg-white text-gray-900 border-gray-300 focus:border-primary-500 focus:ring-primary-500 tap-target">
                      <SelectValue placeholder="Select City" className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSearch}
                  className="btn-primary h-12 md:h-14 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg font-semibold tap-target"
                >
                  <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center items-center px-4 mt-6">
            <Button 
              onClick={() => setLocation('/vendors')}
              className="bg-white text-primary-600 hover:bg-gray-50 px-4 sm:px-6 md:px-8 py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold tap-target transition-smooth"
            >
              Browse Vendors
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
