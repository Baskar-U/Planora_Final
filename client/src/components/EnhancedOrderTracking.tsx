import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  FileText,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Star,
  MessageCircle,
  Handshake,
  Percent,
  AlertCircle,
  RefreshCw,
  Edit,
  Send,
  X,
  Zap,
  Shield,
  Award,
  Timer,
  TrendingUp,
  Eye,
  Download
} from "lucide-react";

interface OrderTrackingData {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  budget: number;
  maxBudget?: number;
  status: string;
  paymentStatus: string;
  vendorId: string;
  vendorName: string;
  vendorResponse?: string;
  vendorNotes?: string;
  customerNotes?: string;
  negotiation?: {
    enabled: boolean;
    originalPrice: number;
    offeredPrice: number;
    discountPercent: number;
    status: string;
    vendorCounterOffer?: {
      price: number;
      discountPercent: number;
      message: string;
      timestamp: string;
    };
    finalPrice?: number;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
    actor: string;
    metadata?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedOrderTrackingProps {
  order: OrderTrackingData;
  onBack: () => void;
  onUpdateOrder?: (orderId: string, updates: any) => void;
  userType?: 'customer' | 'vendor';
}

const statusConfig = {
  booking_created: {
    label: "Booking Created",
    color: "bg-blue-500",
    icon: FileText,
    description: "Your booking request has been created"
  },
  pending: {
    label: "Pending Review",
    color: "bg-yellow-500",
    icon: Clock,
    description: "Vendor is reviewing your request"
  },
  vendor_reviewing: {
    label: "Vendor Reviewing",
    color: "bg-orange-500",
    icon: Eye,
    description: "Vendor is reviewing your booking details"
  },
  negotiation_pending: {
    label: "Price Negotiation",
    color: "bg-purple-500",
    icon: Handshake,
    description: "Price negotiation in progress"
  },
  vendor_accepted: {
    label: "Vendor Accepted",
    color: "bg-green-500",
    icon: CheckCircle,
    description: "Vendor has accepted your booking"
  },
  vendor_counter_offered: {
    label: "Counter Offer",
    color: "bg-indigo-500",
    icon: TrendingUp,
    description: "Vendor has made a counter offer"
  },
  price_agreed: {
    label: "Price Agreed",
    color: "bg-emerald-500",
    icon: Handshake,
    description: "Final price has been agreed upon"
  },
  payment_pending: {
    label: "Payment Pending",
    color: "bg-red-500",
    icon: CreditCard,
    description: "Please complete the payment to proceed"
  },
  payment_completed: {
    label: "Payment Completed",
    color: "bg-green-600",
    icon: CheckCircle,
    description: "Payment has been processed successfully"
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-600",
    icon: Truck,
    description: "Your event is being prepared"
  },
  vendor_preparing: {
    label: "Vendor Preparing",
    color: "bg-blue-500",
    icon: Package,
    description: "Vendor is preparing for your event"
  },
  on_the_way: {
    label: "On the Way",
    color: "bg-purple-600",
    icon: Truck,
    description: "Vendor is on the way to your event"
  },
  arrived: {
    label: "Arrived",
    color: "bg-green-600",
    icon: MapPin,
    description: "Vendor has arrived at the event location"
  },
  event_in_progress: {
    label: "Event in Progress",
    color: "bg-orange-600",
    icon: Zap,
    description: "Your event is currently in progress"
  },
  completed: {
    label: "Completed",
    color: "bg-green-700",
    icon: Award,
    description: "Your event has been completed successfully"
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-600",
    icon: X,
    description: "Order has been cancelled"
  }
};

export default function EnhancedOrderTracking({ order, onBack, onUpdateOrder, userType = 'customer' }: EnhancedOrderTrackingProps) {
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const isVendor = userType === 'vendor';

  // Calculate progress percentage based on status
  const getProgressPercentage = () => {
    const statusOrder = [
      'booking_created', 'pending', 'vendor_reviewing', 'negotiation_pending',
      'vendor_accepted', 'vendor_counter_offered', 'price_agreed', 'payment_pending',
      'payment_completed', 'in_progress', 'vendor_preparing', 'on_the_way',
      'arrived', 'event_in_progress', 'completed'
    ];
    
    const currentIndex = statusOrder.indexOf(order.status);
    if (currentIndex === -1) return 0;
    
    return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
  };

  const handleNegotiationResponse = async (action: 'accept' | 'reject' | 'counter') => {
    if (!onUpdateOrder) return;
    
    setIsUpdating(true);
    try {
      const updates = {
        status: action === 'accept' ? 'price_agreed' : 
                action === 'reject' ? 'cancelled' : 'negotiation_pending',
        'negotiation.finalPrice': action === 'accept' ? order.negotiation?.vendorCounterOffer?.price : null,
        timeline: [
          ...order.timeline,
          {
            status: action === 'accept' ? 'price_agreed' : 
                   action === 'reject' ? 'negotiation_rejected' : 'counter_offer_made',
            timestamp: new Date().toISOString(),
            description: action === 'accept' ? 'Customer accepted vendor counter offer' :
                        action === 'reject' ? 'Customer rejected vendor counter offer' :
                        'Customer made a counter offer',
            actor: 'customer'
          }
        ]
      };
      
      await onUpdateOrder(order.orderId, updates);
      setShowNegotiationModal(false);
    } catch (error) {
      console.error('Failed to update negotiation:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!onUpdateOrder || !message.trim()) return;
    
    setIsUpdating(true);
    try {
      const updates = {
        timeline: [
          ...order.timeline,
          {
            status: 'message_sent',
            timestamp: new Date().toISOString(),
            description: `Message: ${message}`,
            actor: userType
          }
        ]
      };
      
      await onUpdateOrder(order.orderId, updates);
      setMessage("");
      setShowMessageModal(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
                <p className="text-gray-600">Order ID: {order.orderId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStatus.color} text-white`}>
                  <currentStatus.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentStatus.label}</h3>
                  <p className="text-sm text-gray-600">{currentStatus.description}</p>
                </div>
              </div>
              <Badge className={`${currentStatus.color} text-white`}>
                {getProgressPercentage()}% Complete
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className={`${currentStatus.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMessageModal(true)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              
              {order.negotiation?.vendorCounterOffer && order.status === 'vendor_counter_offered' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNegotiationModal(true)}
                >
                  <Handshake className="w-4 h-4 mr-2" />
                  Review Counter Offer
                </Button>
              )}
              
              {order.status === 'payment_pending' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Event Date</p>
                      <p className="font-medium">{new Date(order.eventDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{order.eventLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Guest Count</p>
                      <p className="font-medium">{order.guestCount} guests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-medium">₹{order.budget.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Event Description</p>
                  <p className="text-gray-900">{order.eventDescription}</p>
                </div>
                
                {order.specificRequirements && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Specific Requirements</p>
                    <p className="text-gray-900">{order.specificRequirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Negotiation Details */}
            {order.negotiation?.enabled && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Handshake className="w-5 h-5" />
                    Price Negotiation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Original Price</p>
                      <p className="text-lg font-semibold">₹{order.negotiation.originalPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Your Offer</p>
                      <p className="text-lg font-semibold">₹{order.negotiation.offeredPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Potential Savings</p>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{(order.negotiation.originalPrice - order.negotiation.offeredPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {order.negotiation.vendorCounterOffer && (
                    <div className="p-4 bg-white rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">Vendor Counter Offer</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-purple-900">
                            ₹{order.negotiation.vendorCounterOffer.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.negotiation.vendorCounterOffer.discountPercent}% discount
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Savings</p>
                          <p className="text-lg font-semibold text-green-600">
                            ₹{(order.negotiation.originalPrice - order.negotiation.vendorCounterOffer.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {order.negotiation.vendorCounterOffer.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{order.negotiation.vendorCounterOffer.message}"
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline.map((event, index) => {
                    const eventStatus = statusConfig[event.status as keyof typeof statusConfig];
                    const isLast = index === order.timeline.length - 1;
                    
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isLast ? currentStatus.color : 'bg-gray-300'
                          } text-white`}>
                            {eventStatus ? (
                              <eventStatus.icon className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          {!isLast && <div className="w-0.5 h-8 bg-gray-300 mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {eventStatus?.label || event.status.replace('_', ' ')}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          {event.metadata && (
                            <div className="mt-2 text-xs text-gray-500">
                              {JSON.stringify(event.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {isVendor ? 'Customer Info' : 'Vendor Info'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">{isVendor ? order.customerName : order.vendorName}</p>
                    <p className="text-sm text-gray-600">{isVendor ? order.email : order.eventType}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{isVendor ? order.phone : 'Contact vendor for phone'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{isVendor ? order.email : 'Contact vendor for email'}</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="font-semibold">₹{order.budget.toLocaleString()}</span>
                  </div>
                  
                  {order.negotiation?.finalPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Final Price</span>
                      <span className="font-semibold text-green-600">
                        ₹{order.negotiation.finalPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {order.paymentStatus === 'pending' && (
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Make Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Negotiation Modal */}
      <Dialog open={showNegotiationModal} onOpenChange={setShowNegotiationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5" />
              Vendor Counter Offer
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Vendor's Counter Offer</p>
              <p className="text-3xl font-bold text-purple-900">
                ₹{order.negotiation?.vendorCounterOffer?.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                {order.negotiation?.vendorCounterOffer?.discountPercent}% discount
              </p>
            </div>
            
            {order.negotiation?.vendorCounterOffer?.message && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "{order.negotiation.vendorCounterOffer.message}"
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleNegotiationResponse('reject')}
                className="flex-1"
                disabled={isUpdating}
              >
                Reject
              </Button>
              <Button 
                onClick={() => handleNegotiationResponse('accept')}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isUpdating}
              >
                Accept Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Send Message
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowMessageModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                className="flex-1"
                disabled={!message.trim() || isUpdating}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}






