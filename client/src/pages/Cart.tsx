import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";

interface CartItemWithService {
  id: string;
  serviceId: string;
  quantity: number;
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    priceUnit: string;
    image: string;
  };
}

export default function Cart() {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart", user?.uid],
    enabled: !!user,
    select: async (data: any[]) => {
      // Fetch service details for each cart item
      const itemsWithServices = await Promise.all(
        data.map(async (item) => {
          try {
            const response = await fetch(`/api/services/${item.serviceId}`);
            const service = await response.json();
            return { ...item, service };
          } catch (error) {
            console.error("Failed to fetch service:", error);
            return { ...item, service: null };
          }
        })
      );
      return itemsWithServices.filter(item => item.service) as CartItemWithService[];
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async ({ serviceId }: { serviceId: string }) => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("DELETE", `/api/cart/${user.uid}/${serviceId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.uid] });
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("DELETE", `/api/cart/${user.uid}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.uid] });
      toast({
        title: "Success",
        description: "Cart cleared successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const handleRemoveItem = (serviceId: string) => {
    removeFromCartMutation.mutate({ serviceId });
  };

  const handleClearCart = () => {
    clearCartMutation.mutate();
  };

  const formatPrice = (price: number, unit: string) => {
    if (unit === 'person') return `₹${price}/person`;
    if (unit === 'piece') return `₹${price}/piece`;
    return `₹${price.toLocaleString()}`;
  };

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

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.service.price * item.quantity);
    }, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your cart</h2>
            <p className="text-gray-600">Please sign in to access your shopping cart.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your selected services and proceed to checkout</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <Skeleton className="h-20 w-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start exploring our services to add items to your cart</p>
            <Button onClick={() => window.location.href = '/'}>
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={clearCartMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <img
                        src={item.service.image}
                        alt={item.service.name}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge className={getCategoryColor(item.service.category)}>
                              {item.service.category}
                            </Badge>
                            <h3 className="text-lg font-semibold text-gray-900 mt-1">
                              {item.service.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {item.service.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.service.id)}
                            disabled={removeFromCartMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {formatPrice(item.service.price, item.service.priceUnit)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-600">
                                Total: ₹{(item.service.price * item.quantity).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service charges</span>
                      <span>₹{Math.round(calculateTotal() * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (18%)</span>
                      <span>₹{Math.round(calculateTotal() * 0.18).toLocaleString()}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">
                        ₹{Math.round(calculateTotal() * 1.23).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button className="w-full" size="lg">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                      Continue Shopping
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">Next Steps</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Review service details and requirements</li>
                      <li>• Provide event date and venue information</li>
                      <li>• Vendors will confirm availability</li>
                      <li>• Finalize bookings and make payments</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
