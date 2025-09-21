import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Package, 
  Truck, 
  Home, 
  CreditCard, 
  MessageSquare,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Order, OrderTrackingEvent, OrderStatus } from '@/lib/firebaseService';

interface OrderTrackingTimelineProps {
  order: Order;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ 
  order, 
  onRefresh, 
  isRefreshing = false 
}) => {
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'order_placed':
      case 'order_confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'vendor_notified':
      case 'vendor_accepted':
        return <User className="h-5 w-5 text-green-500" />;
      case 'vendor_declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'quotation_sent':
      case 'quotation_accepted':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'quotation_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'payment_pending':
      case 'payment_received':
        return <CreditCard className="h-5 w-5 text-yellow-500" />;
      case 'preparation_started':
      case 'in_progress':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'ready_for_delivery':
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'refund_initiated':
      case 'refunded':
        return <RefreshCw className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'order_placed':
      case 'order_confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'vendor_notified':
      case 'vendor_accepted':
        return 'bg-green-100 text-green-800';
      case 'vendor_declined':
      case 'quotation_rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'quotation_sent':
      case 'quotation_accepted':
        return 'bg-purple-100 text-purple-800';
      case 'payment_pending':
      case 'payment_received':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparation_started':
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'ready_for_delivery':
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'refund_initiated':
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDescription = (status: OrderStatus) => {
    const descriptions: Record<OrderStatus, string> = {
      'order_placed': 'Order placed successfully',
      'order_confirmed': 'Order confirmed by system',
      'vendor_notified': 'Vendor notified about your order',
      'vendor_accepted': 'Vendor accepted your order',
      'vendor_declined': 'Vendor declined your order',
      'quotation_sent': 'Vendor sent quotation',
      'quotation_accepted': 'Quotation accepted by you',
      'quotation_rejected': 'Quotation rejected',
      'payment_pending': 'Payment pending',
      'payment_received': 'Payment received',
      'preparation_started': 'Vendor started preparation',
      'in_progress': 'Order in progress',
      'ready_for_delivery': 'Order ready for delivery',
      'out_for_delivery': 'Order out for delivery',
      'delivered': 'Order delivered',
      'completed': 'Order completed',
      'cancelled': 'Order cancelled',
      'refund_initiated': 'Refund initiated',
      'refunded': 'Order refunded'
    };
    return descriptions[status] || 'Status updated';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const isCompleted = (status: OrderStatus) => {
    return ['delivered', 'completed', 'cancelled', 'refunded'].includes(status);
  };

  const isInProgress = (status: OrderStatus) => {
    return ['preparation_started', 'in_progress', 'ready_for_delivery', 'out_for_delivery'].includes(status);
  };

  const sortedTimeline = [...(order.timeline || [])].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
              <p className="text-sm text-gray-600">Order ID: {order.orderId}</p>
            </div>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Event Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(order.eventDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{order.eventLocation}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="font-semibold text-gray-900">{order.guestCount}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-semibold text-gray-900">₹{order.budget.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status as OrderStatus)}
              <div>
                <p className="font-semibold text-gray-900">Current Status</p>
                <p className="text-sm text-gray-600">{getStatusDescription(order.status as OrderStatus)}</p>
              </div>
            </div>
            <Badge className={getStatusColor(order.status as OrderStatus)}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Vendor Information */}
          {order.selectedVendor && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Vendor Details</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{order.selectedVendor.businessname || order.selectedVendor.name}</p>
                  <p className="text-sm text-gray-600">{order.selectedVendor.eventname}</p>
                  {order.selectedVendor.mobilenumber && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{order.selectedVendor.mobilenumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-900">{order.deliveryAddress.street}</p>
                  <p className="text-gray-600">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                  {order.deliveryAddress.landmark && (
                    <p className="text-sm text-gray-500">Landmark: {order.deliveryAddress.landmark}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Order Timeline</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTimeline.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No tracking information available yet</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {sortedTimeline.map((event, index) => {
                  const isLast = index === sortedTimeline.length - 1;
                  const isCompletedEvent = isCompleted(event.status);
                  const isInProgressEvent = isInProgress(event.status);
                  const { date, time } = formatTimestamp(event.timestamp);
                  
                  return (
                    <div key={event.id} className="relative flex items-start space-x-4 pb-8">
                      {/* Icon */}
                      <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                        isCompletedEvent 
                          ? 'bg-green-100 border-green-500' 
                          : isInProgressEvent 
                            ? 'bg-blue-100 border-blue-500' 
                            : 'bg-gray-100 border-gray-300'
                      }`}>
                        {getStatusIcon(event.status)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {getStatusDescription(event.status)}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            {event.location && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{date}</p>
                            <p className="text-xs text-gray-500">{time}</p>
                          </div>
                        </div>
                        
                        {/* Metadata */}
                        {event.metadata && (
                          <div className="mt-2 space-y-1">
                            {event.metadata.vendorName && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Vendor:</span> {event.metadata.vendorName}
                              </p>
                            )}
                            {event.metadata.amount && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Amount:</span> ₹{event.metadata.amount.toLocaleString()}
                              </p>
                            )}
                            {event.metadata.paymentMethod && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Payment:</span> {event.metadata.paymentMethod}
                              </p>
                            )}
                            {event.metadata.trackingNumber && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Tracking:</span> {event.metadata.trackingNumber}
                              </p>
                            )}
                            {event.metadata.notes && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Notes:</span> {event.metadata.notes}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="mt-2">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="ml-2 text-xs text-gray-500">
                            Updated by {event.updatedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-semibold text-gray-900">Customer Support</p>
                <p className="text-sm text-gray-600">+91 9876543210</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-semibold text-gray-900">Email Support</p>
                <p className="text-sm text-gray-600">support@planora.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTrackingTimeline;









