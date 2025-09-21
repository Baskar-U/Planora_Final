import { useState, useMemo } from "react";
import { useVendors } from "@/hooks/useFirebaseData";
import VendorCard from "@/components/VendorCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Filter, Package, Users, Grid, List, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface VendorsByDistrictProps {
  selectedDistrict?: string;
  selectedCategory?: string;
  onDistrictSelect?: (district: string) => void;
}

export default function VendorsByDistrict({ 
  selectedDistrict, 
  selectedCategory = "All",
  onDistrictSelect
}: VendorsByDistrictProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState(selectedCategory);
  const [currentDistrict, setCurrentDistrict] = useState(selectedDistrict);
  
  const { data: allVendors = [], isLoading } = useVendors();

  // Group vendors by district/city
  const vendorsByDistrict = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    
    allVendors.forEach(vendor => {
      const district = vendor.location || 'Unknown Location';
      if (!grouped[district]) {
        grouped[district] = [];
      }
      grouped[district].push(vendor);
    });

    // Sort districts by number of vendors (descending)
    return Object.entries(grouped)
      .sort(([, vendorsA], [, vendorsB]) => vendorsB.length - vendorsA.length)
      .reduce((acc, [district, vendors]) => {
        acc[district] = vendors;
        return acc;
      }, {} as { [key: string]: any[] });
  }, [allVendors]);

  // Get unique categories from all vendors
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    allVendors.forEach(vendor => {
      if (vendor.eventname) {
        categories.add(vendor.eventname);
      }
    });
    return ["All", ...Array.from(categories).sort()];
  }, [allVendors]);

  // Filter vendors by selected district and category
  const filteredVendors = useMemo(() => {
    if (currentDistrict && currentDistrict !== "All") {
      const districtVendors = vendorsByDistrict[currentDistrict] || [];
      if (categoryFilter === "All") {
        return districtVendors;
      }
      return districtVendors.filter(vendor => 
        vendor.eventname?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    return [];
  }, [currentDistrict, categoryFilter, vendorsByDistrict]);

  const handleDistrictClick = (district: string) => {
    setCurrentDistrict(district);
    if (onDistrictSelect) {
      onDistrictSelect(district);
    }
  };

  const handleBackToDistricts = () => {
    setCurrentDistrict(undefined);
    setCategoryFilter("All");
    if (onDistrictSelect) {
      onDistrictSelect("All");
    }
  };

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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading vendors...</p>
      </div>
    );
  }

  if (!currentDistrict || currentDistrict === "All") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendors by District</h2>
          <p className="text-gray-600">Select a district to view vendors in that area</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(vendorsByDistrict).map(([district, vendors]) => (
            <Card 
              key={district} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleDistrictClick(district)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-gray-900">{district}</h3>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    <span>{vendors.reduce((sum, v) => sum + (v.menu?.length || 0), 0)} total services</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Avg {Math.round(vendors.reduce((sum, v) => sum + (parseInt(String(v.exprience)) || 0), 0) / vendors.length)} years exp</span>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  View Vendors
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Vendors in {currentDistrict}
          </h2>
          <p className="text-gray-600">
            {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
            {categoryFilter !== "All" && ` in ${categoryFilter}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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

      {/* Category Filter Badge */}
      {categoryFilter !== "All" && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Badge className={getCategoryColor(categoryFilter)}>
            {categoryFilter}
            <button
              onClick={() => setCategoryFilter("All")}
              className="ml-2 hover:bg-black hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          </Badge>
        </div>
      )}

      {/* Vendors Grid/List */}
      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
              <p className="text-gray-600 mb-6">
                {categoryFilter !== "All" 
                  ? `No ${categoryFilter.toLowerCase()} vendors found in ${currentDistrict}`
                  : `No vendors found in ${currentDistrict}`
                }
              </p>
              <Button
                onClick={() => setCategoryFilter("All")}
                variant="outline"
              >
                View All Categories
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
          {filteredVendors.map((vendor) => (
            <VendorCard 
              key={vendor.id}
              vendor={vendor} 
              showDetails={viewMode === "list"}
            />
          ))}
        </div>
      )}

      {/* Back to Districts */}
      <div className="text-center">
        <Button variant="outline" onClick={handleBackToDistricts}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          ← Back to All Districts
        </Button>
      </div>
    </div>
  );
}
