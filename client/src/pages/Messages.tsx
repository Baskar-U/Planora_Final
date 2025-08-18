import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export default function Messages() {
  const [user, setUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      participantId: "vendor1",
      participantName: "Royal Feast Catering",
      lastMessage: "Thank you for your inquiry. We'd love to cater your event!",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 1,
    },
    {
      id: "2",
      participantId: "vendor2",
      participantName: "Grand Palace Wedding Hall",
      lastMessage: "The venue is available for your wedding date. Shall we schedule a visit?",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0,
    },
    {
      id: "3",
      participantId: "vendor3",
      participantName: "Magical Moments Decor",
      lastMessage: "Here are some decoration ideas for your theme.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 0,
    },
  ]);
  const [messages] = useState<Message[]>([
    {
      id: "1",
      senderId: "vendor1",
      receiverId: user?.uid || "user",
      content: "Hello! Thank you for your interest in our catering services. We specialize in traditional and contemporary Indian cuisine.",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: "2",
      senderId: user?.uid || "user",
      receiverId: "vendor1",
      content: "Hi! I'm planning a wedding for 200 guests in Chennai. Could you provide a quote for full catering service?",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: "3",
      senderId: "vendor1",
      receiverId: user?.uid || "user",
      content: "Congratulations on your upcoming wedding! For 200 guests, our full catering package starts at ₹450 per person. This includes appetizers, main course, desserts, and beverages. Would you like to discuss your menu preferences?",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 40),
    },
    {
      id: "4",
      senderId: user?.uid || "user",
      receiverId: "vendor1",
      content: "That sounds reasonable. We'd prefer a mix of North and South Indian cuisine. Can we schedule a tasting session?",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 35),
    },
    {
      id: "5",
      senderId: "vendor1",
      receiverId: user?.uid || "user",
      content: "Thank you for your inquiry. We'd love to cater your event!",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, this would send the message to the backend
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationMessages = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return [];
    
    return messages.filter(msg => 
      msg.senderId === conversation.participantId || 
      msg.receiverId === conversation.participantId
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60 * 60 * 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
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
      </div>
    );
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConversation ? getConversationMessages(selectedConversation) : [];

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
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                        selectedConversation === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.participantImage} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.participantName}
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
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversationData ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversationData.participantImage} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversationData.participantName}
                      </h3>
                      <p className="text-sm text-gray-500">Vendor</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col h-[540px] p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {conversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user.uid
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user.uid ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
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
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
