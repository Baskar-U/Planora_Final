import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Calendar, Star } from "lucide-react";

const steps = [
  {
    icon: <Users className="h-8 w-8 text-blue-600" />,
    title: "1. Choose Your Service",
    description: "Browse through our extensive list of verified vendors and select the perfect service for your event."
  },
  {
    icon: <Calendar className="h-8 w-8 text-green-600" />,
    title: "2. Book & Schedule",
    description: "Book your chosen service and schedule it for your event date. Our AI helps you find the best deals."
  },
  {
    icon: <Star className="h-8 w-8 text-yellow-600" />,
    title: "3. Enjoy Your Event",
    description: "Sit back and enjoy your perfectly planned event while our vendors take care of everything."
  }
];

export default function HowItWorks() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Planning your perfect event is simple with our three-step process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  {step.icon}
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <CheckCircle className="h-5 w-5 mr-2" />
            Get Started Today
          </div>
        </div>
      </div>
    </div>
  );
}





