import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail, CheckCircle, Package, Briefcase, Clock, Calendar } from "lucide-react";
import { Link } from "wouter";
import { type Vendor } from "@/lib/firebaseService";
import BookingDetails from "./BookingDetails";
import { useAuthRequired } from "@/hooks/useAuthRequired";

interface VendorCardProps {
  vendor: Vendor;
  showDetails?: boolean;
}

export default function VendorCard({ vendor, showDetails = false }: VendorCardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { requireAuth } = useAuthRequired();
  
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

  // Helper function to get business name with fallbacks
  const getBusinessName = (vendor: Vendor) => {
    return vendor.businessname || 
           vendor.business_name || 
           vendor.companyName || 
           vendor.company_name || 
           vendor.name || 
           'Business name not available';
  };

  // Calculate service count from menu items and packages
  const legacyServiceCount = vendor.menu?.length || 0;
  const packageCount = vendor.packages?.length || 0;
  const serviceCount = legacyServiceCount + packageCount;

  return (
    <>
      <Card className="group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden border-0 shadow-md">
      <div className="relative overflow-hidden">
        <img
          src={vendor.image || "/placeholder-vendor.jpg"}
          alt={getBusinessName(vendor)}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {vendor.isVerified && (
          <div className="absolute top-4 right-4">
            <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full shadow-md" />
          </div>
        )}
        {/* Category badge overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(vendor.eventname)} shadow-md`}>
            {vendor.eventname}
          </Badge>
        </div>
        {/* Experience badge overlay */}
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-black bg-opacity-70 text-white shadow-md">
            <Briefcase className="h-3 w-3 mr-1" />
            {vendor.exprience || vendor.experience || '0'} years
          </Badge>
        </div>
        {/* New vendor registration badge */}
        {vendor.isVendorRegistration && (
          <div className="absolute bottom-4 right-4">
            <Badge className="bg-green-600 text-white shadow-md">
              ✨ New Registration
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {getBusinessName(vendor)}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-1">{vendor.name}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{vendor.description}</p>
        
        {/* Quick info row */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{vendor.location}</span>
          </div>
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            <span>
              {serviceCount} service{serviceCount !== 1 ? 's' : ''}
              {vendor.isVendorRegistration && packageCount > 0 && (
                <span className="text-xs text-blue-600 ml-1">
                  ({packageCount} packages)
                </span>
              )}
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>{vendor.mobilenumber}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{vendor.hours}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
              <span>{vendor.exprience || vendor.experience || '0'} years experience</span>
            </div>
            {serviceCount > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  {legacyServiceCount > 0 && `${legacyServiceCount} menu items`}
                  {legacyServiceCount > 0 && packageCount > 0 && ' + '}
                  {packageCount > 0 && `${packageCount} packages`}
                  {serviceCount > 0 && ' available'}
                </span>
              </div>
            )}
            {vendor.isVendorRegistration && vendor.website && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <a 
                  href={vendor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
            {vendor.isVendorRegistration && vendor.instagram && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2 text-gray-400">📷</span>
                <a 
                  href={`https://instagram.com/${vendor.instagram?.replace('@', '') || ''}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:underline"
                >
                  {vendor.instagram}
                </a>
              </div>
            )}
            {vendor.rating && vendor.rating > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" />
                <span>{vendor.rating.toFixed(1)} rating</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button asChild className="flex-1 text-sm">
            <Link href={`/vendor/${vendor.id}`}>
              View Profile
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="text-sm"
            onClick={() => requireAuth(() => setShowBookingForm(true))}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Booking Details Modal */}
    {showBookingForm && (
      <BookingDetails
        vendor={{
          id: vendor.id || '',
          name: vendor.name || '',
          businessname: getBusinessName(vendor) || '',
          packages: vendor.packages || []
        }}
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
      />
    )}
  </>
  );
}

