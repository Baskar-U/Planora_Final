import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc, serverTimestamp, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, XCircle, Eye, Clock, DollarSign, User, Calendar } from "lucide-react";

interface PendingPayment {
  id: string;
  amount: number;
  transactionId: string;
  screenshotUrl: string;
  paymentType: 'full' | 'partial';
  status: 'pending_review';
  submittedAt: any;
  customerName: string;
  orderId: string;
}

interface VendorPaymentReviewProps {
  payment: PendingPayment;
  onClose: () => void;
}

export default function VendorPaymentReview({ payment, onClose }: VendorPaymentReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Approve payment mutation
  const approvePaymentMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      
      // Get current booking data
      const bookingRef = doc(db, 'bookings', payment.orderId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();
      
      if (!bookingData) {
        throw new Error('Booking not found');
      }

      // Calculate new amounts
      const currentPaidAmount = bookingData.paidAmount || 0;
      const currentRemainingAmount = bookingData.remainingAmount || bookingData.totalAmount || 0;
      const newPaidAmount = currentPaidAmount + payment.amount;
      const newRemainingAmount = Math.max(0, currentRemainingAmount - payment.amount);
      const paymentStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

      // Update booking with approved payment
      await updateDoc(bookingRef, {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        paymentStatus,
        lastPayment: {
          amount: payment.amount,
          transactionId: payment.transactionId,
          screenshotUrl: payment.screenshotUrl,
          at: serverTimestamp(),
          approvedAt: serverTimestamp()
        },
        transaction_id: [...(bookingData.transaction_id || []), payment.transactionId],
        paymentscreenshot: payment.screenshotUrl,
        updatedAt: serverTimestamp()
      });

      // Create customer notification in customerNotifications collection
      await addDoc(collection(db, 'customerNotifications'), {
        customerEmail: bookingData.customerEmail,
        title: 'Payment Approved',
        message: `Your payment of ₹${payment.amount.toLocaleString()} has been approved by the vendor.`,
        type: 'payment_approved',
        data: {
          orderId: payment.orderId,
          amount: payment.amount,
          transactionId: payment.transactionId
        },
        isRead: false,
        createdAt: serverTimestamp()
      });

      // Remove from pending payments
      await deleteDoc(doc(db, 'pendingPayments', payment.id));
    },
    onSuccess: () => {
      toast({ 
        title: 'Payment Approved', 
        description: 'Payment has been approved and amounts updated successfully.' 
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendorPayments'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to approve payment', 
        variant: 'destructive' 
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // Reject payment mutation
  const rejectPaymentMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      
      // Get booking data for customer notification
      const bookingRef = doc(db, 'bookings', payment.orderId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();

      // Create customer notification in customerNotifications collection
      if (bookingData) {
        await addDoc(collection(db, 'customerNotifications'), {
          customerEmail: bookingData.customerEmail,
          title: 'Payment Rejected',
          message: `Your payment of ₹${payment.amount.toLocaleString()} has been rejected. Please make a payment correctly.`,
          type: 'payment_rejected',
          data: {
            orderId: payment.orderId,
            amount: payment.amount,
            transactionId: payment.transactionId
          },
          isRead: false,
          createdAt: serverTimestamp()
        });
      }

      // Remove from pending payments
      await deleteDoc(doc(db, 'pendingPayments', payment.id));
    },
    onSuccess: () => {
      toast({ 
        title: 'Payment Rejected', 
        description: 'Payment has been rejected and customer has been notified.' 
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendorPayments'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to reject payment', 
        variant: 'destructive' 
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Payment Review</h2>
          <Button variant="outline" onClick={onClose}>
            <XCircle className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>

        <div className="space-y-6">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-lg font-semibold">₹{payment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Type</label>
                  <Badge variant={payment.paymentType === 'full' ? 'default' : 'secondary'}>
                    {payment.paymentType === 'full' ? 'Full Payment' : 'Partial Payment'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="font-mono text-sm">{payment.transactionId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {payment.customerName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted</label>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {payment.submittedAt?.toDate?.()?.toLocaleString() || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Review
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Screenshot */}
          {payment.screenshotUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Payment Screenshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img 
                    src={payment.screenshotUrl} 
                    alt="Payment Screenshot" 
                    className="max-w-full max-h-96 rounded-lg border"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={() => rejectPaymentMutation.mutate()}
              variant="destructive"
              disabled={isProcessing}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Payment
            </Button>
            <Button
              onClick={() => approvePaymentMutation.mutate()}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Payment
            </Button>
          </div>

          {isProcessing && (
            <div className="text-center text-sm text-gray-500">
              Processing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
