import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Terms of <span className="text-yellow-300">Service</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </section>

      {/* Terms of Service Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    By accessing and using Planora's website and services, you accept and agree to be bound by the terms 
                    and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Planora provides an online platform that connects event planners and customers with verified vendors 
                    offering various event services including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Wedding planning and coordination</li>
                    <li>Catering services</li>
                    <li>Photography and videography</li>
                    <li>Event decoration and design</li>
                    <li>Venue booking and management</li>
                    <li>Entertainment and music services</li>
                    <li>Transportation services</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                <div className="space-y-4 text-gray-600">
                  <p>When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Maintaining the security of your account and password</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                    <li>Ensuring your account information is up to date</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Booking and Payment</h2>
                <div className="space-y-4 text-gray-600">
                  <p>When making bookings through our platform:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All payments are processed securely through our payment partners</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Booking confirmations will be sent via email</li>
                    <li>Cancellation policies vary by vendor and service</li>
                    <li>Refunds are processed according to vendor policies</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Vendor Services</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    While we verify our vendors, we are not responsible for the quality of services provided by vendors. 
                    Vendors are independent contractors and not employees of Planora. We recommend:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Reading vendor reviews and ratings</li>
                    <li>Reviewing vendor terms and conditions</li>
                    <li>Communicating directly with vendors about specific requirements</li>
                    <li>Obtaining written agreements for complex services</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
                <div className="space-y-4 text-gray-600">
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the service for any illegal or unauthorized purpose</li>
                    <li>Violate any laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with the proper functioning of the service</li>
                    <li>Submit false or misleading information</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The service and its original content, features, and functionality are owned by Planora and are 
                    protected by international copyright, trademark, patent, trade secret, and other intellectual 
                    property laws.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    In no event shall Planora, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                    be liable for any indirect, incidental, special, consequential, or punitive damages, including 
                    without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your use or inability to use the service</li>
                    <li>Any conduct or content of any third party on the service</li>
                    <li>Any unauthorized access to or use of our servers</li>
                    <li>Any interruption or cessation of transmission to or from the service</li>
                    <li>Any bugs, viruses, or other harmful code</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    The service is provided on an "AS IS" and "AS AVAILABLE" basis. Planora makes no warranties, 
                    expressed or implied, and hereby disclaims all warranties, including without limitation:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Warranties of merchantability and fitness for a particular purpose</li>
                    <li>Warranties that the service will be uninterrupted or error-free</li>
                    <li>Warranties regarding the accuracy or reliability of any information</li>
                    <li>Warranties that defects will be corrected</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We may terminate or suspend your account and bar access to the service immediately, without prior 
                    notice or liability, under our sole discretion, for any reason whatsoever, including without 
                    limitation if you breach the Terms.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    These Terms shall be interpreted and governed by the laws of India, without regard to its conflict 
                    of law provisions. Our failure to enforce any right or provision of these Terms will not be 
                    considered a waiver of those rights.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                    we will provide at least 30 days notice prior to any new terms taking effect. What constitutes 
                    a material change will be determined at our sole discretion.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="ml-4">
                    <p><strong>Email:</strong> infoplanoraevents@gmail.com</p>
                    <p><strong>Phone:</strong> +91 9025415399, +91 9952930953</p>
                    <p><strong>Address:</strong> No:21/11 Voc colony 3rd street Aminjikarai Chennai</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
