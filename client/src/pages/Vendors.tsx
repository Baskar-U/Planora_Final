import React, { useState, useEffect, useMemo } from "react";
import { usePostorderServices } from "@/hooks/usePostorderServices";
import { useVendors } from "@/hooks/useFirebaseData";
import VendorCard from "@/components/VendorCard";
import VendorsByDistrict from "@/components/VendorsByDistrict";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Grid, List, ArrowLeft, RefreshCw, Package, Users, Star, Briefcase } from "lucide-react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";

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

// Extended cities list with districts
const cities = [
  "All",
  "Chennai",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Kalyan-Dombivali",
  "Vasai-Virar",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Allahabad",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Guwahati",
  "Chandigarh",
  "Solapur",
  "Hubli-Dharwad",
  "Bareilly",
  "Moradabad",
  "Mysore",
  "Gurgaon",
  "Aligarh",
  "Jalandhar",
  "Tiruchirappalli",
  "Bhubaneswar",
  "Salem",
  "Warangal",
  "Guntur",
  "Bhiwandi",
  "Saharanpur",
  "Gorakhpur",
  "Bikaner",
  "Amravati",
  "Noida",
  "Jamshedpur",
  "Bhilai",
  "Cuttack",
  "Firozabad",
  "Kochi",
  "Nellore",
  "Bhavnagar",
  "Dehradun",
  "Durgapur",
  "Asansol",
  "Rourkela",
  "Nanded",
  "Kolhapur",
  "Ajmer",
  "Akola",
  "Gulbarga",
  "Jamnagar",
  "Ujjain",
  "Loni",
  "Siliguri",
  "Jhansi",
  "Ulhasnagar",
  "Jammu",
  "Sangli-Miraj",
  "Mangalore",
  "Erode",
  "Belgaum",
  "Ambattur",
  "Tirunelveli",
  "Malegaon",
  "Gaya",
  "Jalgaon",
  "Udaipur",
  "Maheshtala",
  "Tirupur",
  "Davanagere",
  "Kozhikode",
  "Akron",
  "Kurnool",
  "Rajpur Sonarpur",
  "Bokaro",
  "South Dumdum",
  "Bellary",
  "Patiala",
  "Gopalpur",
  "Agartala",
  "Bhagalpur",
  "Muzaffarnagar",
  "Bhatpara",
  "Panihati",
  "Latur",
  "Dhule",
  "Rohtak",
  "Korba",
  "Bhilwara",
  "Brahmapur",
  "Muzaffarpur",
  "Ahmednagar",
  "Mathura",
  "Kollam",
  "Avadi",
  "Kadapa",
  "Anantapuram",
  "Tiruvottiyur",
  "Bardhaman",
  "New Delhi",
  "Panvel",
  "Thiruvananthapuram",
  "Bihar Sharif",
  "Panipat",
  "Darbhanga",
  "Bally",
  "Aizawl",
  "Dewas",
  "Ichalkaranji",
  "Tirupati",
  "Karnal",
  "Bathinda",
  "Rampur",
  "Shivamogga",
  "Ratlam",
  "Modinagar",
  "Durg",
  "Shillong",
  "Imphal",
  "Hapur",
  "Ranipet",
  "Anand",
  "Munger",
  "Bhind",
  "Arrah",
  "Karimnagar",
  "Etawah",
  "Ambernath",
  "North Dumdum",
  "Bharatpur",
  "Begusarai",
  "New Delhi",
  "Chhapra",
  "Kadapa",
  "Ramagundam",
  "Pali",
  "Satna",
  "Vizianagaram",
  "Katihar",
  "Hardwar",
  "Sonipat",
  "Nagercoil",
  "Thanjavur",
  "Murwara",
  "Naihati",
  "Sambhal",
  "Nadiad",
  "Yamunanagar",
  "English Bazar",
  "Eluru",
  "Mungeli",
  "Panchkula",
  "Raayachuru",
  "Panvel",
  "Deoghar",
  "Ongole",
  "Nandyal",
  "Morena",
  "Bhiwani",
  "Porbandar",
  "Palakkad",
  "Anand",
  "Puducherry",
  "Karnal",
  "Bathinda",
  "Rampur",
  "Shivamogga",
  "Ratlam",
  "Modinagar",
  "Durg",
  "Shillong",
  "Imphal",
  "Hapur",
  "Ranipet",
  "Anand",
  "Munger",
  "Bhind",
  "Arrah",
  "Karimnagar",
  "Etawah",
  "Ambernath",
  "North Dumdum",
  "Bharatpur",
  "Begusarai",
  "New Delhi",
  "Chhapra",
  "Kadapa",
  "Ramagundam",
  "Pali",
  "Satna",
  "Vizianagaram",
  "Katihar",
  "Hardwar",
  "Sonipat",
  "Nagercoil",
  "Thanjavur",
  "Murwara",
  "Naihati",
  "Sambhal",
  "Nadiad",
  "Yamunanagar",
  "English Bazar",
  "Eluru",
  "Mungeli",
  "Panchkula",
  "Raayachuru",
  "Panvel",
  "Deoghar",
  "Ongole",
  "Nandyal",
  "Morena",
  "Bhiwani",
  "Porbandar",
  "Palakkad",
  "Anand",
  "Puducherry"
];

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"experience" | "services" | "rating" | "name">("experience");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [displayMode, setDisplayMode] = useState<"all" | "districts">("all");
  const [, setLocation] = useLocation();

  // Handle URL parameters for search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const cityParam = urlParams.get('city');
    
    if (searchParam) {
      setSearchTerm(searchParam);
      setSelectedCategory(searchParam);
    }
    if (cityParam) {
      setSelectedCity(cityParam);
    }
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Read URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const cityParam = urlParams.get('city');
    const districtParam = urlParams.get('district');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (cityParam) {
      setSelectedCity(cityParam);
    }
    
    if (districtParam) {
      setSelectedDistrict(districtParam);
      setDisplayMode("districts");
    }
  }, []);

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  // Fetch all services from postorder collection (single source to avoid duplicates)
  const { data: allServices = [], isLoading: servicesLoading } = usePostorderServices();
  
  // Transform postorder services to match vendor format
  const transformedVendors = useMemo(() => {
    const transformedVendors = allServices.map((service: any) => {
      return {
        id: service.id,
        name: service.name,
        businessname: service.businessname,
        serviceName: service.serviceName,
        description: service.description || 'Professional service',
        eventname: service.category,
        subcategory: service.subcategory,
        exprience: service.exprience || '0',
        from: service.from || [],
        hours: service.hours || service.workingHours || 'Contact for availability', // Fix: use 'hours' field from postorder
        image: service.coverImage || service.image || '',
        location: service.location || 'Unknown',
        mobilenumber: service.mobilenumber,
        email: service.email,
        vendorid: service.vendorid,
        rating: 4.5, // Default rating
        reviewCount: 0,
        isVerified: service.isVerified || false,
        packages: service.packages || [],
        collections: service.collections || [],
        menu: service.menu || [],
        features: service.features || [],
        serviceFeatures: service.serviceFeatures || [],
        serviceableCities: service.serviceableCities || [],
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        // Mark as postorder service
        isPostorderService: true
      };
    });
    
    return transformedVendors;
  }, [allServices]);

  // Use only the transformed vendors (no duplicates) and restrict to allowed categories
  const vendors = useMemo(() => {
    return transformedVendors.filter((v: any) => allowedCategoriesSet.has((v.eventname || v.category || '').trim()))
  }, [transformedVendors]);
  
  const isLoading = servicesLoading;



  // Apply category and city filters
  let filteredVendors: any[] = vendors;
  
  if (selectedCategory !== "All") {
    filteredVendors = filteredVendors.filter((vendor: any) => 
      vendor.eventname?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (selectedCity !== "All") {
    filteredVendors = filteredVendors.filter((vendor: any) => 
      vendor.location?.toLowerCase() === selectedCity.toLowerCase()
    );
  }

  // Filter by search term
  if (searchTerm) {
    filteredVendors = filteredVendors.filter((vendor: any) =>
      (vendor.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vendor.businessname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vendor.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vendor.eventname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vendor.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }

  // Sort vendors
  filteredVendors = [...filteredVendors].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "experience":
        aValue = parseInt(String(a.exprience)) || 0;
        bValue = parseInt(String(b.exprience)) || 0;
        break;
      case "services":
        // For now, we'll use a placeholder since we don't have service count in vendor data
        aValue = a.menu?.length || 0;
        bValue = b.menu?.length || 0;
        break;
      case "rating":
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      case "name":
        aValue = a.businessname || a.name || '';
        bValue = b.businessname || b.name || '';
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get unique cities from vendors for dynamic city list
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    vendors.forEach((vendor: any) => {
      if (vendor.location) {
        // Normalize city name: trim whitespace and convert to title case
        const normalizedCity = vendor.location.trim().replace(/\s+/g, ' ');
        if (normalizedCity) {
          cities.add(normalizedCity);
        }
      }
    });
    return ["All", ...Array.from(cities).sort()];
  }, [vendors]);

  // Get unique categories from vendors for dynamic category list (restricted to allowed)
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    vendors.forEach((vendor: any) => {
      const cat = (vendor.eventname || vendor.category || '').trim();
      if (cat && allowedCategoriesSet.has(cat)) {
        cats.add(cat);
      }
    });
    // Ensure consistent order matching categories[] constant
    const ordered = categories.filter((c) => c === 'All' || cats.has(c));
    return ordered;
  }, [vendors]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Venue': 'bg-blue-100 text-blue-800',
      'Catering': 'bg-orange-100 text-orange-800',
      'Decoration': 'bg-pink-100 text-pink-800',
      'DJ': 'bg-green-100 text-green-800',
      'Cakes': 'bg-red-100 text-red-800',
      'Return Gift': 'bg-yellow-100 text-yellow-800',
      'Photography': 'bg-purple-100 text-purple-800',
      'Transport': 'bg-indigo-100 text-indigo-800',
      'Wedding': 'bg-rose-100 text-rose-800',
      'Birthday': 'bg-purple-100 text-purple-800',
      'Corporate': 'bg-slate-100 text-slate-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalServices = vendors.reduce((sum: number, vendor: any) => {
      // Count services from legacy vendors (menu) and new registrations (packages)
      const legacyServices = vendor.menu?.length || 0;
      const registrationServices = vendor.packages?.length || 0;
      return sum + legacyServices + registrationServices;
    }, 0);
    
    const avgExperience = vendors.length > 0 
      ? vendors.reduce((sum: number, vendor: any) => sum + (parseInt(String(vendor.exprience)) || 0), 0) / vendors.length 
      : 0;
    const avgRating = vendors.length > 0
      ? vendors.reduce((sum: number, vendor: any) => sum + (vendor.rating || 0), 0) / vendors.length
      : 0;

    return {
      totalVendors: vendors.length,
      totalServices,
      avgExperience: Math.round(avgExperience * 10) / 10,
      avgRating: Math.round(avgRating * 10) / 10
    };
  }, [vendors]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" text="Loading vendors..." />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header - Reduced padding */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedCategory !== "All" ? `${selectedCategory} Vendors` : "All Vendors"}
            </h1>
            <p className="text-lg text-gray-600">
              {selectedCategory !== "All" 
                ? `Discover amazing ${selectedCategory.toLowerCase()} vendors for your perfect event`
                : "Discover amazing vendors for your perfect event"
              }
            </p>
            {selectedCategory !== "All" && (
              <div className="mt-2">
                <Badge className={`${getCategoryColor(selectedCategory)} text-base px-3 py-1`}>
                  {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'} found
                </Badge>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Vendors</p>
                    <p className="text-xl font-bold text-gray-900">{stats.totalVendors}</p>
                    <p className="text-xs text-gray-500">
                      Services from postorder collection
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="text-xl font-bold text-gray-900">{stats.totalServices}</p>
                    <p className="text-xs text-gray-500">Menu items + packages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Briefcase className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Experience</p>
                    <p className="text-xl font-bold text-gray-900">{stats.avgExperience} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-xl font-bold text-gray-900">{stats.avgRating}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Search and Filters - Reduced spacing */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search vendors by name, business, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Category" />
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
              
              <div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select City" />
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

              <div>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={sortOrder === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortOrder("desc")}
                >
                  ↓ Desc
                </Button>
                <Button
                  variant={sortOrder === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortOrder("asc")}
                >
                  ↑ Asc
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== "All" || selectedCity !== "All" || searchTerm) && (
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== "All" && (
                  <Badge className={getCategoryColor(selectedCategory)}>
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="ml-2 hover:bg-black hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCity !== "All" && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCity}
                    <button
                      onClick={() => setSelectedCity("All")}
                      className="ml-2 hover:bg-black hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge className="bg-green-100 text-green-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-2 hover:bg-black hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedCity("All");
                    setSearchTerm("");
                  }}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results - Reduced padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {displayMode === "districts" ? (
          <VendorsByDistrict 
            selectedDistrict={selectedDistrict === "All" ? undefined : selectedDistrict}
            selectedCategory={selectedCategory}
            onDistrictSelect={(district) => {
              setSelectedDistrict(district);
              // Update URL without navigation
              const url = new URL(window.location.href);
              if (district === "All") {
                url.searchParams.delete('district');
              } else {
                url.searchParams.set('district', district);
              }
              window.history.pushState({}, '', url.toString());
            }}
          />
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
                  {searchTerm && ` for "${searchTerm}"`}
                  {selectedCategory !== "All" && ` in ${selectedCategory}`}
                  {selectedCity !== "All" && ` from ${selectedCity}`}
                  {vendors.length > 0 && ` (${vendors.length} total in database)`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
              {vendors.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Loaded {vendors.length} vendors from Firebase • Sorted by {sortBy} ({sortOrder})
                  <br />
                  <span className="text-blue-600">
                    📊 All vendors from postorder collection
                  </span>
                </p>
              )}
            </div>

            {/* Vendors Grid/List */}
            {filteredVendors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedCategory("All");
                        setSelectedCity("All");
                        setSearchTerm("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  : "space-y-4"
              }>
                {filteredVendors.map((vendor, index) => (
                  <React.Fragment key={vendor.id || index}>
                    <VendorCard 
                      vendor={vendor} 
                      showDetails={viewMode === "list"}
                    />
                    {/* Show ad after every 8 vendors */}
                    {(index + 1) % 8 === 0 && (
                      <div className="col-span-full flex justify-center my-4">
                        <div className="w-full max-w-md">
                          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6343948689807963" crossOrigin="anonymous"></script>
                          <ins className="adsbygoogle"
                               style={{display: 'block'}}
                               data-ad-client="ca-pub-6343948689807963"
                               data-ad-slot="7677540697"
                               data-ad-format="auto"
                               data-full-width-responsive="true"></ins>
                          <script dangerouslySetInnerHTML={{
                            __html: '(adsbygoogle = window.adsbygoogle || []).push({});'
                          }}></script>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </>
        )}

        {/* Back Button - Reduced margin */}
        <div className="text-center mt-8">
          <Button onClick={handleBack} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
