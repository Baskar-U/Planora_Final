import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, User, ArrowLeft, Package, Check, CheckCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useCreateMessage, useMessagesByConversation, useGetConversation, useCreateConversation } from "@/hooks/useFirebaseData";
import { Message, Conversation } from "@/lib/firebaseService";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserType } from "@/contexts/UserTypeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";



export default function Messages() {
  const [, setLocation] = useLocation();
  const { userType } = useUserType();
  const [user, setUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string>("Vendor");
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vendor = urlParams.get('vendor');
    const order = urlParams.get('orderId');
    
    if (vendor) {
      setVendorId(vendor);
      setVendorName(`Vendor ${vendor.slice(-4)}`); // Show last 4 chars of vendor ID
    }
    if (order) {
      setOrderId(order);
    }
  }, []);

  // Firebase hooks
  const createMessageMutation = useCreateMessage();
  const createConversationMutation = useCreateConversation();
  
  // Get conversation between user and vendor
  const { data: conversation } = useGetConversation(
    userType === 'vendor' ? vendorId || "" : user?.uid || "", 
    userType === 'vendor' ? user?.uid || "" : vendorId || ""
  );
  
  // Get messages for the conversation
  const { data: messages = [], isLoading: messagesLoading } = useMessagesByConversation(
    conversation?.id || ""
  );

  // Get user's conversations from Firebase
  const { data: userConversations = [] } = useQuery({
    queryKey: ["conversations", user?.uid, userType],
    queryFn: async () => {
      if (!user?.uid) return [];
      
      try {
        const conversationsRef = collection(db, "conversations");
        const q = query(
          conversationsRef,
          where("participant1Id", "==", user.uid),
          orderBy("lastMessageTime", "desc")
        );
        const querySnapshot1 = await getDocs(q);
        
        const q2 = query(
          conversationsRef,
          where("participant2Id", "==", user.uid),
          orderBy("lastMessageTime", "desc")
        );
        const querySnapshot2 = await getDocs(q2);
        
        const conversations1 = querySnapshot1.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Conversation[];
        
        const conversations2 = querySnapshot2.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Conversation[];
        
        // Combine and deduplicate conversations
        const allConversations = [...conversations1, ...conversations2];
        const uniqueConversations = allConversations.filter((conv, index, self) => 
          index === self.findIndex(c => c.id === conv.id)
        );
        
        return uniqueConversations;
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
    },
    enabled: !!user?.uid
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.uid) return;
    
    try {
      let currentConversationId = conversation?.id;
      
      // If no conversation exists, create one
      if (!currentConversationId && vendorId) {
        const participant1Id = user.uid;
        const participant2Id = vendorId;
        
        const newConversation = await createConversationMutation.mutateAsync({
          participant1Id,
          participant2Id,
          lastMessage: newMessage,
          lastMessageTime: new Date(),
          unreadCount: 0,
          orderId: orderId || undefined
        });
        currentConversationId = newConversation.id;
        setConversationId(newConversation.id || null);
      }
      
      if (currentConversationId) {
        // Create the message
        await createMessageMutation.mutateAsync({
          conversationId: currentConversationId,
          senderId: user.uid,
          receiverId: vendorId || "",
          content: newMessage,
          messageType: 'text',
          status: 'sent',
          isRead: false
        });
        
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: any) => {
    try {
      let date: Date;
      
      // Handle Firebase timestamp
      if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
        // Handle Firestore timestamp
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Invalid Date';
      }
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      if (diff < 1000 * 60 * 60 * 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Invalid Date';
    }
  };

  const renderMessageStatus = (status: string, isOwnMessage: boolean) => {
    if (!isOwnMessage) return null;
    
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your messages</h2>
            <p className="text-gray-600">Please sign in to access your conversations with vendors.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If vendor ID is provided, show specific conversation
  if (vendorId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation("/messages")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Chat with {vendorName}</h1>
            {orderId && (
              <p className="text-gray-600">Order: {orderId}</p>
            )}
          </div>

          <Card>
            <CardContent className="flex flex-col h-[600px] p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message: Message) => {
                      const isOwnMessage = message.senderId === user?.uid;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <div className={`flex items-center justify-between mt-1 ${
                              isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                              <p className="text-xs">
                                {formatTime(message.timestamp)}
                              </p>
                              {renderMessageStatus(message.status, isOwnMessage)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || createMessageMutation.isPending}
                  >
                    {createMessageMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Default messages interface (when no vendor is specified)
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Chat with vendors and manage your conversations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Conversations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1">
                  {userConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No conversations yet
                    </div>
                  ) : (
                    userConversations.map((conversation) => {
                      // Get the other participant's ID
                      const otherParticipantId = conversation.participant1Id === user?.uid 
                        ? conversation.participant2Id 
                        : conversation.participant1Id;
                      
                      return (
                        <div
                          key={conversation.id}
                          className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                            selectedConversation === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                          }`}
                          onClick={() => {
                            setSelectedConversation(conversation.id || null);
                            // Navigate to the specific conversation
                            setLocation(`/messages?vendor=${otherParticipantId}&orderId=${conversation.orderId || ''}`);
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {userType === 'vendor' ? 'Customer' : 'Vendor'} {otherParticipantId.slice(-4)}
                                </h3>
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessageTime)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {conversation.lastMessage}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <div className="mt-2">
                                  <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                                    {conversation.unreadCount}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
