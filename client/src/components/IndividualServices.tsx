import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Gift, 
  Music, 
  Building2, 
  Award,
  Baby,
  Users
} from "lucide-react";
import { useLocation } from "wouter";

const eventCategories = [
  {
    id: "wedding",
    name: "Wedding",
    icon: Heart,
    description: "Make your special day unforgettable",
    color: "bg-rose-100 text-rose-800",
    iconColor: "text-rose-600"
  },
  {
    id: "birthday",
    name: "Birthday",
    icon: Gift,
    description: "Celebrate in style",
    color: "bg-purple-100 text-purple-800",
    iconColor: "text-purple-600"
  },
  {
    id: "concert",
    name: "Concert",
    icon: Music,
    description: "Amplify your event",
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-600"
  },
  {
    id: "corporate",
    name: "Corporate Event",
    icon: Building2,
    description: "Professional and polished",
    color: "bg-slate-100 text-slate-800",
    iconColor: "text-slate-600"
  },
  {
    id: "graduation",
    name: "Graduation",
    icon: Award,
    description: "Mark this achievement",
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-600"
  },
  {
    id: "babyshower",
    name: "Baby Shower",
    icon: Baby,
    description: "Welcome the little one",
    color: "bg-yellow-100 text-yellow-800",
    iconColor: "text-yellow-600"
  },
  {
    id: "conference",
    name: "Conference",
    icon: Users,
    description: "Knowledge sharing events",
    color: "bg-indigo-100 text-indigo-800",
    iconColor: "text-indigo-600"
  }
];

export default function IndividualServices() {
  const [, setLocation] = useLocation();

  const handleEventClick = (eventId: string) => {
    setLocation(`/order/${eventId}`);
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Individual Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your event type and let us connect you with the perfect vendors. 
            Get personalized quotes and professional service for your special occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {eventCategories.map((event) => {
            const IconComponent = event.icon;
            return (
              <Card 
                key={event.id}
                className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-0 shadow-md"
                onClick={() => handleEventClick(event.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <IconComponent className={`h-8 w-8 ${event.iconColor}`} />
                    <Badge className={event.color}>
                      {event.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {event.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Don't see your event type? Contact us for custom solutions.
          </p>
          <Button variant="outline" size="lg">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
}
