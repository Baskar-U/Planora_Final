import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Package, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  CreditCard
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderTrackingTimeline from '@/components/OrderTrackingTimeline';
import { firebaseService, Order } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';

const OrderTracking: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'orderId' | 'phone' | 'email'>('orderId');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch user's orders if logged in
  const { data: userOrders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['userOrders', currentUser?.uid],
    queryFn: () => firebaseService.getOrdersByUser(currentUser?.uid || ''),
    enabled: !!currentUser?.uid,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchedOrder(null);

    try {
      let order: Order | null = null;

      switch (searchType) {
        case 'orderId':
          order = await firebaseService.getOrder(searchQuery.trim());
          break;
        case 'phone':
          // Search orders by phone number
          const phoneOrders = userOrders.filter((o: Order) => 
            o.phone?.includes(searchQuery.trim())
          );
          order = phoneOrders[0] || null;
          break;
        case 'email':
          // Search orders by email
          const emailOrders = userOrders.filter((o: Order) => 
            o.email?.toLowerCase().includes(searchQuery.trim().toLowerCase())
          );
          order = emailOrders[0] || null;
          break;
      }

      if (order) {
        setSearchedOrder(order);
      } else {
        setSearchError('No order found with the provided information');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'vendor_accepted':
        return 'bg-green-100 text-green-800';
      case 'payment_pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-2">
                Track your orders and stay updated with real-time status
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Search Order</h2>
            <p className="text-sm text-gray-600">
              Enter your order ID, phone number, or email to track your order
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Type Selection */}
              <div className="flex space-x-4">
                <Button
                  variant={searchType === 'orderId' ? 'default' : 'outline'}
                  onClick={() => setSearchType('orderId')}
                  size="sm"
                >
                  Order ID
                </Button>
                <Button
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  onClick={() => setSearchType('phone')}
                  size="sm"
                >
                  Phone Number
                </Button>
                <Button
                  variant={searchType === 'email' ? 'default' : 'outline'}
                  onClick={() => setSearchType('email')}
                  size="sm"
                >
                  Email
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder={
                      searchType === 'orderId' 
                        ? 'Enter Order ID (e.g., ORD123456)' 
                        : searchType === 'phone'
                        ? 'Enter Phone Number'
                        : 'Enter Email Address'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="flex items-center gap-2"
                >
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Search Error */}
              {searchError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">{searchError}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchedOrder && (
          <div className="mb-8">
            <OrderTrackingTimeline 
              order={searchedOrder}
              onRefresh={() => handleSearch()}
              isRefreshing={isSearching}
            />
          </div>
        )}

        {/* User's Orders (if logged in) */}
        {currentUser && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchOrders()}
                  disabled={ordersLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Loading your orders..." />
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                  <Button onClick={() => setLocation('/vendors')}>
                    Browse Vendors
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order: Order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSearchedOrder(order)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Order #{order.orderId}
                              </h3>
                              <p className="text-sm text-gray-600">{order.eventType}</p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(order.eventDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{order.eventLocation}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{order.guestCount} guests</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>₹{order.budget.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchedOrder(order);
                          }}
                        >
                          Track Order
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Need Help?</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Issues</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Having trouble with your order? We're here to help.
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Refund & Returns</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Need to return or refund an item? We'll guide you through it.
                </p>
                <Button variant="outline" size="sm">
                  Start Return
                </Button>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Find answers to common questions about orders and tracking.
                </p>
                <Button variant="outline" size="sm">
                  View FAQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTracking;