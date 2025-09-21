import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Wedding Planner",
      content: "Planora made my wedding planning so much easier! Found the perfect vendors and saved 30% on costs. The platform is incredibly intuitive and the vendor quality exceeded my expectations.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      event: "Wedding",
      savings: "$2,500"
    },
    {
      name: "Michael Chen",
      role: "Corporate Event Manager",
      content: "We've planned 15+ corporate events through Planora. The vendor quality is outstanding and the booking process is seamless. Our clients are always impressed with the results.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      event: "Corporate Event",
      savings: "$5,200"
    },
    {
      name: "Priya Patel",
      role: "Event Coordinator",
      content: "As a professional event coordinator, I love how Planora streamlines the entire process. The reviews and ratings are spot-on, and the customer support is exceptional.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      event: "Birthday Party",
      savings: "$800"
    },
    {
      name: "David Rodriguez",
      role: "Small Business Owner",
      content: "Planning our company's annual conference was a breeze with Planora. Found amazing vendors within our budget and everything went perfectly. Highly recommend!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      event: "Conference",
      savings: "$3,800"
    },
    {
      name: "Emma Thompson",
      role: "Marketing Director",
      content: "Planora helped us organize our product launch event flawlessly. The vendor selection was excellent and the platform's features made coordination effortless.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      event: "Product Launch",
      savings: "$4,100"
    },
    {
      name: "James Wilson",
      role: "Non-Profit Director",
      content: "For our charity gala, Planora connected us with vendors who understood our mission and budget constraints. The event was a huge success!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      event: "Charity Gala",
      savings: "$6,500"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've planned their perfect events with Planora
          </p>
        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img 
                                src={testimonial.avatar} 
                                alt={testimonial.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                              <p className="text-sm text-gray-600">{testimonial.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center mb-1">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {testimonial.event}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="relative mb-4">
                          <Quote className="w-6 h-6 text-primary-200 mb-2" />
                          <p className="text-gray-700 leading-relaxed text-sm">
                            "{testimonial.content}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-green-600">Saved {testimonial.savings}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Verified Customer
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">10,000+</div>
            <div className="text-gray-600">Events Planned</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">500+</div>
            <div className="text-gray-600">Verified Vendors</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">4.8/5</div>
            <div className="text-gray-600">Customer Rating</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
