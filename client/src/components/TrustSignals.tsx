import { Shield, Users, Star, Award, CheckCircle } from "lucide-react";

export default function TrustSignals() {
  const trustItems = [
    {
      icon: Shield,
      label: "Secure & Trusted",
      value: "10,000+ Events Planned"
    },
    {
      icon: Users,
      label: "Verified Vendors",
      value: "500+ Professional Partners"
    },
    {
      icon: Star,
      label: "Customer Rating",
      value: "4.8/5 Stars"
    },
    {
      icon: Award,
      label: "Industry Leader",
      value: "Since 2020"
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="text-white">
                <div className="text-sm font-medium opacity-90">{item.label}</div>
                <div className="text-lg font-bold">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Security Badges */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
        <div className="flex flex-wrap justify-center items-center gap-4 text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
