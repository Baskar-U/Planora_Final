import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthRequired } from "@/hooks/useAuthRequired";
import { Eye, Clock, DollarSign, User, Calendar } from "lucide-react";
import VendorPaymentReview from "./VendorPaymentReview";

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

export default function VendorPendingPayments() {
  const { user } = useAuthRequired();
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);

  // Fetch pending payments for this vendor
  const { data: pendingPayments = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-payments', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      
      // Get all pending payments
      const q = query(
        collection(db, 'pendingPayments'),
        where('status', '==', 'pending_review')
      );
      
      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PendingPayment[];

      console.log('🔍 VendorPendingPayments: Found pending payments:', payments.length);
      console.log('🔍 VendorPendingPayments: All pending payments:', payments);

      // Filter payments for orders belonging to this vendor
      const vendorPayments = [];
      for (const payment of payments) {
        try {
          const orderRef = doc(db, 'bookings', payment.orderId);
          const orderDoc = await getDoc(orderRef);
          const orderData = orderDoc.data();
          
          console.log('🔍 VendorPendingPayments: Checking payment:', payment.id, 'for order:', payment.orderId);
          console.log('🔍 VendorPendingPayments: Order data vendorId:', orderData?.vendorId, 'vs user.uid:', user.uid);
          
          if (orderData?.vendorId === user.uid) {
            vendorPayments.push(payment);
            console.log('✅ VendorPendingPayments: Payment added to vendor payments:', payment.id);
          }
        } catch (error) {
          console.error('❌ VendorPendingPayments: Error checking order:', error);
        }
      }
      
      console.log('🔍 VendorPendingPayments: Final vendor payments:', vendorPayments.length);
      
      // Sort by submittedAt descending
      return vendorPayments.sort((a, b) => {
        const aTime = a.submittedAt?.toDate?.()?.getTime() || 0;
        const bTime = b.submittedAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
    },
    enabled: !!user?.uid,
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Payment Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading pending payments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pending Payment Reviews</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pending payments to review</p>
            <p className="text-sm text-gray-400 mt-2">
              Check the browser console for debug information about pending payments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Payment Reviews ({pendingPayments.length})
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingPayments.map((payment) => (
              <Card key={payment.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          <span className="font-semibold text-lg">₹{payment.amount.toLocaleString()}</span>
                        </div>
                        <Badge variant="outline" className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                        <Badge variant={payment.paymentType === 'full' ? 'default' : 'secondary'}>
                          {payment.paymentType === 'full' ? 'Full Payment' : 'Partial Payment'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {payment.customerName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {payment.submittedAt?.toDate?.()?.toLocaleString() || 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-500">Transaction ID: </span>
                        <span className="font-mono">{payment.transactionId}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setSelectedPayment(payment)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Review Modal */}
      {selectedPayment && (
        <VendorPaymentReview
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
}
