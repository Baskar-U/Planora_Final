import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { query, where, getDocs } from "firebase/firestore";
import { X, Upload, CheckCircle } from "lucide-react";

interface PaymentFormInlineProps {
  order: {
    id: string;
    totalAmount?: number;
    paidAmount?: number;
    remainingAmount?: number;
    vendorId: string;
    customerName?: string;
    selectedPackages?: any[];
  };
  onClose: () => void;
}

export default function PaymentFormInline({ order, onClose }: PaymentFormInlineProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState<number>(order.totalAmount || 0);
  const [transactionId, setTransactionId] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [vendorUpi, setVendorUpi] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Calculate payment amount based on type
  const totalAmount = order.totalAmount || 0;
  const paymentAmount = paymentType === 'full' 
    ? (order.remainingAmount ?? totalAmount) 
    : amount;

  // Fetch vendor UPI QR
  useEffect(() => {
    if (vendorUpi) return;
    (async () => {
      try {
        const q = query(collection(db, 'postorder'), where('vendorid', '==', order.vendorId));
        const snap = await getDocs(q);
        const upi = snap.docs[0]?.data()?.upiQrImage || null;
        if (upi) setVendorUpi(upi);
      } catch {}
    })();
  }, [order.vendorId, vendorUpi]);

  // Handle screenshot upload
  const handleScreenshotUpload = async (file: File) => {
    console.log('📤 PaymentFormInline: Starting image upload');
    console.log('📤 PaymentFormInline: File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    if (!file) {
      console.log('❌ PaymentFormInline: No file provided');
      return;
    }
    if (!file.type.startsWith('image/')) {
      console.log('❌ PaymentFormInline: Invalid file type:', file.type);
      toast({ title: 'Invalid file', description: 'Please select an image', variant: 'destructive' });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ PaymentFormInline: File too large:', file.size);
      toast({ title: 'File too large', description: 'Please select an image smaller than 5MB', variant: 'destructive' });
      return;
    }
    
    console.log('⏳ PaymentFormInline: Setting uploading state to true');
    setUploading(true);
    try {
      // Sanitize filename to avoid issues
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `payments/${order.id}/${Date.now()}_${sanitizedFileName}`;
      console.log('📤 PaymentFormInline: Upload path:', path);
      
      const r = ref(storage, path);
      console.log('📤 PaymentFormInline: Starting Firebase upload...');
      const snap = await uploadBytes(r, file);
      console.log('✅ PaymentFormInline: Upload successful, getting download URL...');
      const url = await getDownloadURL(snap.ref);
      console.log('✅ PaymentFormInline: Download URL obtained:', url);
      
      setScreenshotUrl(url);
      toast({ title: 'Uploaded', description: 'Screenshot uploaded successfully' });
      console.log('✅ PaymentFormInline: Image upload completed successfully');
    } catch (e: any) {
      console.error('❌ PaymentFormInline: Upload error:', e);
      console.error('❌ PaymentFormInline: Error details:', {
        code: e.code,
        message: e.message,
        stack: e.stack
      });
      toast({ 
        title: 'Upload failed', 
        description: e.code === 'storage/unauthorized' 
          ? 'Permission denied. Please try again.' 
          : e.message || 'Failed to upload image. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      console.log('⏳ PaymentFormInline: Setting uploading state to false');
      setUploading(false);
    }
  };

  // Payment mutation
  const payMutation = useMutation({
    mutationFn: async () => {
      console.log('💳 PaymentFormInline: Starting payment submission');
      console.log('💳 PaymentFormInline: Payment details:', {
        transactionId: transactionId.trim(),
        paymentType,
        amount: paymentAmount,
        totalAmount,
        orderId: order.id
      });
      
      if (!transactionId.trim()) {
        console.log('❌ PaymentFormInline: Transaction ID is required');
        throw new Error('Transaction ID is required');
      }
      if (paymentType === 'partial' && amount <= 0) {
        console.log('❌ PaymentFormInline: Invalid amount for partial payment:', amount);
        throw new Error('Please enter a valid amount');
      }

      // Store payment details for vendor review instead of updating amounts directly
      console.log('💳 PaymentFormInline: Storing payment for vendor review...');
      const paymentData = {
        amount: paymentAmount,
        transactionId: transactionId.trim(),
        screenshotUrl,
        paymentType,
        status: 'pending_review',
        submittedAt: serverTimestamp(),
        customerName: order.customerName || 'Customer',
        orderId: order.id
      };
      console.log('💳 PaymentFormInline: Payment data for review:', paymentData);
      
      // Add payment to pending payments collection
      const docRef = await addDoc(collection(db, 'pendingPayments'), paymentData);
      console.log('✅ PaymentFormInline: Payment stored for vendor review with ID:', docRef.id);
      console.log('✅ PaymentFormInline: Payment data stored:', paymentData);

      // Create vendor notification for payment review
      console.log('💳 PaymentFormInline: Creating vendor notification for payment review...');
      await addDoc(collection(db, 'notifications'), {
        userId: order.vendorId,
        title: 'Payment Review Required',
        message: `${order.customerName || 'Customer'} has submitted a payment of ₹${paymentAmount.toLocaleString()} for review. Please verify and approve.`,
        type: 'payment_review_required',
        data: {
          orderId: order.id,
          customerName: order.customerName || 'Customer',
          amount: paymentAmount,
          transactionId: transactionId.trim(),
          paymentType,
          paymentId: docRef.id, // Use the actual payment document ID
          screenshotUrl
        },
        isRead: false,
        createdAt: serverTimestamp()
      });
      console.log('✅ PaymentFormInline: Vendor notification created successfully');
    },
    onSuccess: () => {
      console.log('✅ PaymentFormInline: Payment submission successful');
      toast({ 
        title: 'Payment Submitted', 
        description: 'Your payment form is submitted. Our vendor will review and update the payment status.' 
      });
      
      // Load recommendations and show congratulations
      console.log('🎉 PaymentFormInline: Loading recommendations and showing congratulations...');
      (async () => {
        try {
          const q = query(collection(db, 'postorder'), where('vendorid', '==', order.vendorId));
          const snap = await getDocs(q);
          setRecommendations(snap.docs.slice(0, 3).map(d => ({ id: d.id, ...d.data() })));
          console.log('✅ PaymentFormInline: Recommendations loaded:', snap.docs.length);
        } catch (e) {
          console.error('❌ PaymentFormInline: Error loading recommendations:', e);
        }
        setShowCongrats(true);
        console.log('🎉 PaymentFormInline: Congratulations modal shown');
      })();
    },
    onError: (e: any) => {
      console.error('❌ PaymentFormInline: Payment submission failed:', e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  });

  // Reset form when component mounts
  useEffect(() => {
    console.log('🔄 PaymentFormInline: Component mounted/opened');
    setPaymentType('full');
    setAmount(totalAmount);
    setTransactionId('');
    setScreenshotFile(null);
    setScreenshotUrl('');
    setShowCongrats(false);
  }, [totalAmount]);

  // Debug when component unmounts/closes
  useEffect(() => {
    return () => {
      console.log('❌ PaymentFormInline: Component unmounted/closed');
      console.log('❌ PaymentFormInline: Upload state at unmount:', { uploading, screenshotUrl });
    };
  }, [uploading, screenshotUrl]);

  if (showCongrats) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => {
          // Prevent any background clicks from closing the form even during congrats
          e.preventDefault();
          e.stopPropagation();
          console.log('❌ PaymentFormInline: Background clicked during congrats - form is sticky');
        }}
      >
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-green-200 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Payment Submitted!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your payment form has been submitted successfully. Our vendor will review and update the payment status.
            </p>
            
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">Transaction ID: <span className="font-mono font-semibold">{transactionId}</span></p>
              <p className="text-sm text-gray-500">Amount: ₹{paymentAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">The vendor will verify your payment and update the status accordingly.</p>
            </div>

            {recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4">🌟 Recommended Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium">{rec.businessname || rec.name}</h4>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      <p className="text-sm text-blue-600 mt-2">₹{rec.price?.toLocaleString() || 'Contact for price'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button onClick={() => {
                console.log('✅ PaymentFormInline: Close button clicked in congrats - closing form');
                onClose();
              }} variant="outline">
                Close
              </Button>
              <Button onClick={() => {
                console.log('✅ PaymentFormInline: View My Orders clicked - closing form');
                onClose();
              }} className="bg-blue-600 hover:bg-blue-700">
                View My Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Prevent any background clicks from closing the form
        e.preventDefault();
        e.stopPropagation();
        console.log('❌ PaymentFormInline: Background clicked - form is sticky and cannot be closed');
      }}
    >
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-red-200 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">💳 Payment Details</h2>
            <p className="text-gray-600">Complete your payment securely. We'll notify the vendor once submitted.</p>
            <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                🔒 This form is locked and cannot be closed until payment is submitted. Complete your payment to proceed.
              </p>
            </div>
            {(uploading || payMutation.isPending) && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {uploading ? '📤 Uploading file...' : '⏳ Processing payment...'} Please wait...
                </p>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log('❌ PaymentFormInline: Close button clicked - form is sticky');
              toast({ 
                title: 'Form is Locked', 
                description: 'This form cannot be closed until payment is submitted', 
                variant: 'destructive' 
              });
            }}
            disabled={true}
            className="text-gray-400 cursor-not-allowed opacity-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Already Paid:</span>
                  <span className="text-green-600">₹{((order as any).paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Remaining:</span>
                  <span className="text-red-600">₹{((order as any).remainingAmount ?? totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Type</label>
              <select 
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={paymentType} 
                onChange={(e) => {
                  console.log('🔄 PaymentFormInline: Payment type changed to:', e.target.value);
                  setPaymentType(e.target.value as any);
                  if (e.target.value === 'full') {
                    setAmount((order as any).remainingAmount ?? totalAmount);
                    console.log('🔄 PaymentFormInline: Amount set to full payment:', (order as any).remainingAmount ?? totalAmount);
                  }
                }}
              >
                <option value="full">Full Payment (₹{((order as any).remainingAmount ?? totalAmount).toLocaleString()})</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>

            {/* Partial Payment Amount */}
            {paymentType === 'partial' && (
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Pay</label>
                <input 
                  type="number" 
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={amount} 
                  onChange={(e) => {
                    const newAmount = parseInt(e.target.value) || 0;
                    console.log('🔄 PaymentFormInline: Amount changed to:', newAmount);
                    setAmount(newAmount);
                  }}
                  max={(order as any).remainingAmount ?? totalAmount}
                  min="1"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ₹{((order as any).remainingAmount ?? totalAmount).toLocaleString()}
                </p>
              </div>
            )}

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium mb-2">Transaction ID *</label>
              <input 
                type="text" 
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter UPI reference or transaction ID"
                value={transactionId} 
                  onChange={(e) => {
                    console.log('🔄 PaymentFormInline: Transaction ID changed to:', e.target.value);
                    setTransactionId(e.target.value);
                  }}
                required
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Screenshot</label>
              {screenshotUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <img src={screenshotUrl} className="w-16 h-16 object-cover border rounded-lg" />
                    <div>
                      <p className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Uploaded successfully
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setScreenshotUrl('');
                          setScreenshotFile(null);
                        }}
                        className="mt-1"
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => {
                      console.log('📤 PaymentFormInline: Upload area clicked');
                      document.getElementById('screenshot-upload')?.click();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        const file = files[0];
                        console.log('📤 PaymentFormInline: File dropped:', file.name);
                        setScreenshotFile(file);
                        handleScreenshotUpload(file);
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      id="screenshot-upload"
                      onChange={(e) => {
                        console.log('📤 PaymentFormInline: File input changed');
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('📤 PaymentFormInline: File selected:', file.name);
                          setScreenshotFile(file);
                          handleScreenshotUpload(file);
                        } else {
                          console.log('📤 PaymentFormInline: No file selected');
                        }
                      }}
                    />
                    <div className="text-blue-600 hover:text-blue-700 font-medium mb-2">
                      Click here to choose file
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('📤 PaymentFormInline: Choose file button clicked');
                        document.getElementById('screenshot-upload')?.click();
                      }}
                      className="mb-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <p className="text-sm text-gray-500">or drag and drop an image here</p>
                    {uploading && <p className="text-sm text-blue-600 mt-2">📤 Uploading...</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              onClick={() => {
                console.log('💳 PaymentFormInline: Submit payment button clicked');
                payMutation.mutate();
              }} 
              disabled={payMutation.isPending || uploading || !transactionId.trim()}
            >
              {payMutation.isPending || uploading ? '⏳ Processing...' : '💳 Submit Payment'}
            </Button>
          </div>

          {/* UPI QR Code */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center shadow-lg w-full">
              <h3 className="font-semibold text-lg mb-4">Scan & Pay</h3>
              {vendorUpi ? (
                <div className="space-y-4">
                  <img src={vendorUpi} alt="UPI QR Code" className="w-64 h-64 mx-auto" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-lg">Amount: ₹{paymentAmount.toLocaleString()}</p>
                    <p className="text-xs">Scan with any UPI app</p>
                  </div>
                </div>
              ) : (
                <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 text-sm">UPI QR not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
