import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
            Privacy <span className="text-yellow-300">Policy</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We collect information you provide directly to us, such as when you create an account, 
                    make a booking, or contact us for support. This may include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Name, email address, and phone number</li>
                    <li>Event details and preferences</li>
                    <li>Payment information (processed securely through our payment partners)</li>
                    <li>Communications with us</li>
                    <li>Reviews and feedback</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <div className="space-y-4 text-gray-600">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide and maintain our services</li>
                    <li>Process bookings and payments</li>
                    <li>Connect you with vendors</li>
                    <li>Send you important updates and notifications</li>
                    <li>Improve our services and user experience</li>
                    <li>Respond to your inquiries and support requests</li>
                    <li>Ensure platform security and prevent fraud</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>With vendors to facilitate bookings and services</li>
                    <li>With service providers who assist in our operations</li>
                    <li>When required by law or to protect our rights</li>
                    <li>With your explicit consent</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We implement appropriate security measures to protect your personal information against unauthorized access, 
                    alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encryption of sensitive data</li>
                    <li>Regular security assessments</li>
                    <li>Access controls and authentication</li>
                    <li>Secure data transmission</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We use cookies and similar technologies to enhance your experience on our platform. These help us:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Remember your preferences</li>
                    <li>Analyze website traffic and usage</li>
                    <li>Provide personalized content</li>
                    <li>Improve our services</li>
                  </ul>
                  <p>
                    You can control cookie settings through your browser preferences.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
                <div className="space-y-4 text-gray-600">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access your personal information</li>
                    <li>Update or correct your information</li>
                    <li>Request deletion of your account</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request data portability</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our services are not intended for children under 13 years of age. We do not knowingly collect 
                    personal information from children under 13. If you believe we have collected information from 
                    a child under 13, please contact us immediately.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by 
                    posting the new Privacy Policy on this page and updating the "Last updated" date. 
                    We encourage you to review this policy periodically.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
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

      {/* Contact Information Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-lg">No:21/11 Voc colony 3rd street Aminjikarai Chennai</span>
            </div>
            <p className="text-gray-500 mt-2">For any privacy-related questions or concerns</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
