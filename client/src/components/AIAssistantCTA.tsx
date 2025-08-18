import { Button } from "@/components/ui/button";
import { Bot, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function AIAssistantCTA() {
  const [, setLocation] = useLocation();

  const handleStartAIChat = () => {
    setLocation("/ai-assistant");
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <Bot className="mx-auto h-16 w-16 text-yellow-300 mb-4" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Your AI Event Assistant</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Get personalized recommendations, budget planning, and instant answers to all your event planning questions. Our AI assistant is here to make your planning process effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleStartAIChat}
              className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Planning with AI
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
