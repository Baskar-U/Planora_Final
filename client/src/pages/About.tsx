import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Award, Heart, Zap, Shield, Globe, Mail, Phone, MapPin } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
export default function About() {
  const [, setLocation] = useLocation();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-blue-600 to-purple-700 text-white py-16 sm:py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
              About <span className="text-yellow-300">Planora Events</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-100 max-w-4xl mx-auto leading-relaxed px-4">
              Revolutionizing event planning through innovative technology and seamless vendor connections
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 sm:px-4 py-2 text-sm sm:text-base">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Trusted Platform
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 sm:px-4 py-2 text-sm sm:text-base">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                50+ Users
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Goals Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our <span className="text-primary-600">Mission, Vision & Goals</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-primary-600 to-blue-600 mx-auto mb-6 sm:mb-8"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Mission */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 sm:p-8 rounded-2xl border border-primary-100">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">Our Mission</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                To democratize event planning by providing a comprehensive, user-friendly platform that connects event organizers with verified, high-quality vendors. We strive to make every event memorable by leveraging technology to streamline the planning process while ensuring transparency, reliability, and exceptional service quality.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 sm:p-8 rounded-2xl border border-blue-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">Our Vision</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                To become the leading global platform for event planning, recognized for innovation, trust, and excellence. We envision a world where planning any event from intimate gatherings to large scale celebrations is seamless, enjoyable, and accessible to everyone, regardless of their location or budget.
              </p>
            </div>

            {/* Goals */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 sm:p-8 rounded-2xl border border-green-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">Our Goals</h3>
              <ul className="text-base sm:text-lg text-gray-600 leading-relaxed space-y-2">
                <li>• Expand to 50+ cities across India by 2025</li>
                <li>• Serve 100,000+ successful events annually</li>
                <li>• Partner with 10,000+ verified vendors</li>
                <li>• Achieve 95% customer satisfaction rate</li>
                <li>• Launch mobile app for enhanced accessibility</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              About <span className="text-primary-600">Planora</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-primary-600 to-blue-600 mx-auto mb-6 sm:mb-8"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Company Overview</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                  Founded in 2024, Planora is a technology-driven event planning platform headquartered in Madurai, Tamil Nadu. We specialize in connecting event organizers with verified vendors across multiple categories including venues, catering, decoration, photography, entertainment, and more.
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                  Our platform serves customers across major Tamil Nadu cities including Chennai, Madurai, Tiruppur, Coimbatore, Erode, Salem, Tiruchirappalli with plans for rapid expansion to cover the entire country.
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  We are committed to providing exceptional customer service, maintaining high standards of vendor verification, and continuously improving our platform based on user feedback and market demands.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">12+ Cities</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Coverage across Tamil Nadu</p>
                </div>
                <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">2 Events</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Successfully planned</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Why Choose Planora?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Verified Vendors</h4>
                    <p className="text-sm text-gray-600">All vendors are thoroughly verified and quality-checked</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Transparent Pricing</h4>
                    <p className="text-sm text-gray-600">No hidden costs, clear pricing for all services</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                    <p className="text-sm text-gray-600">Round-the-clock customer support for all your needs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure Payments</h4>
                    <p className="text-sm text-gray-600">Safe and secure payment processing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our <span className="text-primary-600">Values</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-primary-600 to-blue-600 mx-auto mb-6 sm:mb-8"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Passion</h3>
                <p className="text-sm sm:text-base text-gray-600">We're passionate about creating perfect events and helping our users achieve their dreams.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Innovation</h3>
                <p className="text-sm sm:text-base text-gray-600">We constantly innovate to provide cutting-edge solutions for event planning.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Trust</h3>
                <p className="text-sm sm:text-base text-gray-600">We build trust through transparency, reliability, and exceptional service quality.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Community</h3>
                <p className="text-sm sm:text-base text-gray-600">We foster a strong community of event planners, vendors, and customers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements & Statistics */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Our <span className="text-yellow-300">Achievements</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-yellow-300 mx-auto mb-6 sm:mb-8"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-300 mb-2">12+</div>
              <div className="text-sm sm:text-base text-blue-100">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-300 mb-2">2</div>
              <div className="text-sm sm:text-base text-blue-100">Events Planned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-300 mb-2">40+</div>
              <div className="text-sm sm:text-base text-blue-100">Verified Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-300 mb-2">97%</div>
              <div className="text-sm sm:text-base text-blue-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Meet Our <span className="text-primary-600">Team</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-primary-600 to-blue-600 mx-auto mb-6 sm:mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind Planora who are dedicated to revolutionizing event planning
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
                  <AvatarImage src="/team/ananth.jpg" />
                  <AvatarFallback className="text-2xl sm:text-3xl">A</AvatarFallback>
                </Avatar>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Ananth</h3>
                <p className="text-sm sm:text-base text-primary-600 font-medium mb-2 sm:mb-3">Founder & CEO</p>
                <p className="text-sm sm:text-base text-gray-600">Visionary leader driving innovation in event planning technology.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
                  <AvatarImage src="/team/baskar.jpg" />
                  <AvatarFallback className="text-2xl sm:text-3xl">B</AvatarFallback>
                </Avatar>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Baskar</h3>
                <p className="text-sm sm:text-base text-primary-600 font-medium mb-2 sm:mb-3">CTO</p>
                <p className="text-sm sm:text-base text-gray-600">Technical expert ensuring seamless platform performance.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
                  <AvatarImage src="/team/harish.jpg" />
                  <AvatarFallback className="text-2xl sm:text-3xl">H</AvatarFallback>
                </Avatar>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Harish</h3>
                <p className="text-sm sm:text-base text-primary-600 font-medium mb-2 sm:mb-3">Lead Developer</p>
                <p className="text-sm sm:text-base text-gray-600">Full-stack developer crafting exceptional user experiences.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
                  <AvatarImage src="/team/sanjay.jpg" />
                  <AvatarFallback className="text-2xl sm:text-3xl">S</AvatarFallback>
                </Avatar>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Sanjay</h3>
                <p className="text-sm sm:text-base text-primary-600 font-medium mb-2 sm:mb-3">UI/UX Designer</p>
                <p className="text-sm sm:text-base text-gray-600">Creative designer making beautiful and intuitive interfaces.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Get In <span className="text-primary-600">Touch</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-primary-600 to-blue-600 mx-auto mb-6 sm:mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to start planning your perfect event? We'd love to hear from you!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Email</h3>
                <p className="text-sm sm:text-base text-gray-600">infoplanoraevents@gmail.com</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Phone</h3>
                <p className="text-sm sm:text-base text-gray-600">+91 9025415399</p>
                <p className="text-sm sm:text-base text-gray-600">+91 9952930953</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Location</h3>
                <p className="text-sm sm:text-base text-gray-600">No:21/11 Voc colony 3rd street Aminjikarai Chennai</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <Button 
              onClick={() => setLocation('/contact')}
              size="lg" 
              className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Information Section
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Us</h2>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">No:21/11 Voc colony 3rd street Aminjikarai Chennai</span>
            </div>
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
    </>
  );
}
