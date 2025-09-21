import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Save, X } from "lucide-react";

interface VendorData {
  id: string;
  businessName: string;
  name: string;
  email: string;
  mobileNumber: string;
  description: string;
  category: string;
  subcategory: string;
  experience: string;
  features: string[];
  from: string[];
  hours: string;
  location: string;
  image: string;
  collections: string[];
  isVerified: boolean;
}

interface EditVendorDetailsModalProps {
  vendorData: VendorData;
  onSuccess: () => void;
}

const categories = [
  "Catering",
  "Wedding",
  "Decoration",
  "Photography",
  "Venue",
  "DJ",
  "Transportation",
  "Makeup & Beauty",
  "Event Planning",
  "Cakes",
  "Flowers",
  "Lighting",
  "Security",
  "Birthday",
  "Corporate",
  "Other"
];

const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
  "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
  "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
  "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad",
  "Navi Mumbai", "Solapur", "Vijayawada", "Kolhapur", "Amritsar", "Sangli", "Malegaon",
  "Ulhasnagar", "Jalgaon", "Akola", "Latur", "Ahmadnagar", "Dhule", "Ichalkaranji", "Parbhani",
  "Jalna", "Bhusawal", "Panvel", "Satara", "Beed", "Yavatmal", "Kamptee", "Gondia", "Barshi",
  "Achalpur", "Osmanabad", "Nanded-Waghala", "Wardha", "Udgir", "Amalner",
  "Akot", "Pandharpur", "Shirpur-Warwade", "Shirur", "Malkapur", "Wani", "Lonavla", "Talegaon Dabhade",
  "Anjangaon", "Umred", "Palghar", "Shegaon", "Ozar", "Phaltan"
];

export default function EditVendorDetailsModal({ vendorData, onSuccess }: EditVendorDetailsModalProps) {
  const [formData, setFormData] = useState<Partial<VendorData>>({
    businessName: "",
    name: "",
    email: "",
    mobileNumber: "",
    description: "",
    category: "",
    subcategory: "",
    experience: "",
    features: [],
    from: [],
    hours: "",
    location: "",
    image: "",
    collections: [],
    isVerified: false
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (vendorData) {
      setFormData(vendorData);
      setSelectedFeatures(vendorData.features || []);
      setSelectedLocations(vendorData.from || []);
    }
  }, [vendorData]);

  const updateVendorMutation = useMutation({
    mutationFn: async (data: Partial<VendorData>) => {
      if (!auth.currentUser) throw new Error("User not authenticated");
      
      await updateDoc(doc(db, "vendors", vendorData.id), {
        ...data,
        updatedAt: new Date()
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["vendorProfile"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof VendorData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    
    setSelectedFeatures(newFeatures);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleLocationToggle = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    
    setSelectedLocations(newLocations);
    setFormData(prev => ({
      ...prev,
      from: newLocations
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorMutation.mutate(formData);
  };

  const availableFeatures = formData.category ? getCategoryFeatures(formData.category) : [];

  function getCategoryFeatures(category: string): string[] {
    const categoryFeatures: Record<string, string[]> = {
      "Catering": [
        "Vegetarian Options", "Non-Vegetarian Options", "Live Counters", "Buffet Service",
        "Plated Service", "Custom Menu", "Free Delivery", "Setup & Cleanup", "Staff Provided", "Equipment Included"
      ],
      "Wedding": [
        "Complete Wedding Planning", "Venue Selection", "Vendor Coordination", "Timeline Management",
        "Budget Planning", "Guest Management", "Reception Planning", "Ceremony Planning", "Day-of Coordination", "Emergency Support"
      ],
      "Decoration": [
        "Floral Arrangements", "Lighting Design", "Backdrop Creation", "Table Settings",
        "Stage Decoration", "Entrance Decoration", "Custom Themes", "Setup & Breakdown", "Rental Equipment", "Color Coordination"
      ],
      "Photography": [
        "Pre-wedding Shoots", "Wedding Photography", "Candid Photography", "Videography",
        "Drone Photography", "Photo Editing", "Album Design", "Online Gallery", "Same Day Edit", "Multiple Photographers"
      ],
      "Venue": [
        "Indoor Venues", "Outdoor Venues", "Garden Venues", "Beach Venues",
        "Hotel Venues", "Banquet Halls", "Catering Included", "Decoration Included", "Parking Available", "Air Conditioning"
      ],
      "DJ": [
        "Live Music", "DJ Services", "Sound System", "Lighting Effects",
        "Karaoke", "Custom Playlists", "MC Services", "Dance Floor", "Multiple Genres", "Equipment Setup"
      ],
      "Transportation": [
        "Wedding Cars", "Bus Services", "Luxury Vehicles", "Airport Transfers",
        "Group Transportation", "Driver Services", "Vehicle Decoration", "Multiple Stops", "Flexible Timing", "Insurance Coverage"
      ],
      "Makeup & Beauty": [
        "Bridal Makeup", "Groom Makeup", "Hair Styling", "Mehendi Design",
        "Saree Draping", "Jewelry Selection", "Trial Sessions", "On-site Service", "Multiple Looks", "Professional Products"
      ],
      "Event Planning": [
        "Complete Event Management", "Vendor Coordination", "Timeline Creation", "Budget Management",
        "Guest Management", "Venue Selection", "Theme Development", "Day-of Coordination", "Emergency Support", "Post-event Follow-up"
      ],
      "Cakes": [
        "Wedding Cakes", "Birthday Cakes", "Custom Designs", "Multiple Flavors",
        "Sugar-free Options", "Delivery Service", "Setup Service", "Cake Toppers", "Fresh Ingredients", "Tasting Sessions"
      ],
      "Flowers": [
        "Fresh Flowers", "Artificial Flowers", "Bridal Bouquets", "Centerpieces",
        "Garlands", "Flower Walls", "Custom Arrangements", "Same Day Delivery", "Seasonal Flowers", "Color Matching"
      ],
      "Lighting": [
        "LED Lighting", "Spot Lighting", "Ambient Lighting", "Color Changing",
        "Pattern Projection", "Stage Lighting", "Dance Floor Lighting", "Outdoor Lighting", "Energy Efficient", "Custom Designs"
      ],
      "Security": [
        "Event Security", "Crowd Management", "VIP Protection", "Parking Security",
        "Emergency Response", "Trained Personnel", "24/7 Service", "Background Checked", "Uniformed Staff", "Communication Systems"
      ],
      "Birthday": [
        "Theme Parties", "Entertainment", "Decoration", "Cake & Food",
        "Games & Activities", "Photo Booth", "Party Favors", "Invitation Design", "Venue Setup", "Cleanup Service"
      ],
      "Corporate": [
        "Conference Management", "Team Building", "Product Launches", "Award Ceremonies",
        "Networking Events", "Catering Services", "Audio Visual Setup", "Registration Management", "Branding Services", "Follow-up Services"
      ],
      "Other": [
        "Custom Services", "Consultation", "Flexible Packages", "Specialized Equipment",
        "Expert Staff", "Quality Assurance", "Timely Delivery", "Customer Support", "Innovative Solutions", "Competitive Pricing"
      ]
    };
    return categoryFeatures[category] || [];
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={formData.businessName || ""}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="name">Contact Person Name *</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input
            id="mobileNumber"
            value={formData.mobileNumber || ""}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Business Description *</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          required
        />
      </div>

      {/* Category and Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category || ""} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="experience">Years of Experience *</Label>
          <Select value={formData.experience || ""} onValueChange={(value) => handleInputChange("experience", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10+"].map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {exp} {exp === "10+" ? "years" : exp === "1" ? "year" : "years"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="subcategory">Subcategory</Label>
        <Input
          id="subcategory"
          value={formData.subcategory || ""}
          onChange={(e) => handleInputChange("subcategory", e.target.value)}
          placeholder="e.g., South Indian Catering"
        />
      </div>

      {/* Dynamic Features */}
      {formData.category && availableFeatures.length > 0 && (
        <div>
          <Label>Features *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {availableFeatures.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={selectedFeatures.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <Label htmlFor={feature} className="text-sm">{feature}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location and Working Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Primary Location *</Label>
          <Input
            id="location"
            value={formData.location || ""}
            onChange={(e) => handleInputChange("location", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="hours">Working Hours *</Label>
          <Input
            id="hours"
            value={formData.hours || ""}
            onChange={(e) => handleInputChange("hours", e.target.value)}
            placeholder="e.g., 24/7, 9 AM - 6 PM"
            required
          />
        </div>
      </div>

      {/* Service Areas */}
      <div>
        <Label>Service Areas *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto">
          {indianCities.map((city) => (
            <div key={city} className="flex items-center space-x-2">
              <Checkbox
                id={city}
                checked={selectedLocations.includes(city)}
                onCheckedChange={() => handleLocationToggle(city)}
              />
              <Label htmlFor={city} className="text-sm">{city}</Label>
            </div>
          ))}
        </div>
        {selectedLocations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedLocations.map((location) => (
              <div key={location} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {location}
                <button
                  type="button"
                  onClick={() => handleLocationToggle(location)}
                  className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={updateVendorMutation.isPending}
        >
          {updateVendorMutation.isPending ? (
            "Updating..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Update Details
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
