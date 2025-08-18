import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: "Hello! I'm your AI Event Planning Assistant. I can help you with:\n\n• Event planning recommendations\n• Budget estimates\n• Vendor suggestions\n• Timeline planning\n• FAQ about services\n\nWhat would you like to know about planning your event?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const quickQuestions = [
    "What's the average cost for a wedding in Chennai?",
    "Help me plan a birthday party timeline",
    "Recommend vendors for a corporate event",
    "What decorations work best for outdoor events?",
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('cost') || input.includes('budget') || input.includes('price')) {
      return "Event costs can vary significantly based on your requirements. Here are some general estimates for Chennai:\n\n• Wedding (200 guests): ₹3-8 lakhs\n• Birthday party (50 guests): ₹25,000-75,000\n• Corporate event (100 people): ₹1-3 lakhs\n\nFactors affecting cost:\n- Venue type and location\n- Number of guests\n- Catering preferences\n- Decoration themes\n- Entertainment options\n\nWould you like me to help you create a detailed budget for your specific event?";
    }
    
    if (input.includes('timeline') || input.includes('schedule') || input.includes('plan')) {
      return "Here's a typical event planning timeline:\n\n**2-3 months before:**\n• Set budget and guest list\n• Book venue and main vendors\n• Send save-the-dates\n\n**1 month before:**\n• Finalize menu and decorations\n• Confirm all vendor details\n• Send invitations\n\n**1 week before:**\n• Final headcount to caterer\n• Confirm timeline with all vendors\n• Prepare day-of coordination\n\nWould you like a customized timeline for your specific event type?";
    }
    
    if (input.includes('vendor') || input.includes('recommend') || input.includes('suggest')) {
      return "I'd be happy to recommend vendors! Based on our platform, here are top-rated options:\n\n**Venues:** Grand Palace Wedding Hall, Royal Gardens\n**Catering:** Royal Feast Catering, Spice Route\n**Decoration:** Magical Moments Decor, Dream Themes\n**DJ/Music:** Beat Masters DJ, Rhythm Nation\n**Photography:** Capture Moments, Lens Art Studio\n\nFor personalized recommendations, please tell me:\n• Event type and date\n• Expected guest count\n• Location preference\n• Budget range";
    }
    
    if (input.includes('decoration') || input.includes('theme') || input.includes('decor')) {
      return "Great decoration ideas by event type:\n\n**Outdoor Events:**\n• Garden themes with fairy lights\n• Rustic setups with wooden elements\n• Bohemian style with colorful fabrics\n\n**Indoor Events:**\n• Elegant draping and uplighting\n• Floral centerpieces and backdrops\n• Modern minimalist designs\n\n**Popular Themes:**\n• Traditional Indian with marigolds\n• Royal palace with gold accents\n• Beach/tropical with palms\n• Vintage with antique elements\n\nWhat type of event are you planning? I can suggest specific decoration ideas!";
    }
    
    return "I'm here to help with your event planning needs! I can assist with:\n\n• Budget planning and cost estimates\n• Vendor recommendations\n• Event timelines and checklists\n• Theme and decoration ideas\n• Catering suggestions\n• Venue selection tips\n\nPlease let me know more details about your event, and I'll provide personalized advice!";
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-2 rounded-full">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Event Assistant</h1>
            <Badge className="bg-gradient-to-r from-primary-500 to-blue-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart
            </Badge>
          </div>
          <p className="text-gray-600">Get instant help with event planning, vendor recommendations, and more!</p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary-600" />
              <span>Chat Assistant</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'assistant' && (
                    <div className="bg-primary-100 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-line ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white ml-12'
                        : 'bg-gray-100 text-gray-900 mr-12'
                    }`}
                  >
                    {message.content}
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="bg-gray-200 p-2 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="bg-primary-100 p-2 rounded-full">
                    <Bot className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg mr-12">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Quick questions to get started:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left h-auto p-2 whitespace-normal"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about event planning..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">AI Assistant Features</h3>
              <p className="text-sm text-blue-800">
                Get personalized recommendations, budget estimates, vendor suggestions, timeline planning, and answers to frequently asked questions about event planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
