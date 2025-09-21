import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { useServices } from "@/hooks/useFirebaseData";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "wouter";

export default function FeaturedServices() {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const { data: services = [], isLoading } = useServices();

  const addToCartMutation = useMutation({
    mutationFn: async ({ serviceId }: { serviceId: string }) => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("POST", "/api/cart", {
        userId: user.uid,
        serviceId,
        quantity: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.uid] });
      toast({
        title: "Success",
        description: "Service added to cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (serviceId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate({ serviceId });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Services
            </h2>
            <p className="text-xl text-gray-600">
              Top-rated services from verified vendors
            </p>
          </div>
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading featured services..." />
          </div>
        </div>
      </section>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Venue': 'bg-blue-100 text-blue-800',
      'Catering': 'bg-orange-100 text-orange-800',
      'Decoration': 'bg-pink-100 text-pink-800',
      'DJ': 'bg-green-100 text-green-800',
      'Cakes': 'bg-red-100 text-red-800',
      'Return Gift': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number | undefined, unit: string | undefined) => {
    if (!price) return "Contact for pricing";
    if (unit === 'person') return `₹${price}/person`;
    if (unit === 'piece') return `₹${price}/piece`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 6).map((service, index) => (
            <Card 
              key={service.id} 
              className="group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={service.images?.[0] || "/placeholder-service.jpg"}
                  alt={service.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getCategoryColor(service.category || "General")}>
                    {service.category || "General"}
                  </Badge>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-700">
                      {service.rating ? service.rating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{service.name || "Unnamed Service"}</h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4">{service.description || "No description available"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(service.price, service.priceUnit)}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleAddToCart(service.id!)}
                  className="w-full"
                  disabled={addToCartMutation.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="px-8 py-3 text-lg">
            <Link href="/services">
              View All Services
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
