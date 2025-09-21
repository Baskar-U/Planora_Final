import { useLocation } from "wouter";
import { 
  Utensils, 
  Sparkles, 
  Music, 
  Car, 
  Cake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Categories() {
  const [, setLocation] = useLocation();

  const categories = [
    {
      name: "Catering",
      description: "Delicious food for every occasion",
      icon: Utensils,
      gradient: "from-orange-100 to-red-100",
      iconColor: "text-orange-600"
    },
    {
      name: "Decoration",
      description: "Beautiful themes and setups",
      icon: Sparkles,
      gradient: "from-pink-100 to-purple-100",
      iconColor: "text-pink-600"
    },
    {
      name: "DJ",
      description: "Music that moves your crowd",
      icon: Music,
      gradient: "from-green-100 to-teal-100",
      iconColor: "text-green-600"
    },
    {
      name: "Travel",
      description: "Transportation solutions",
      icon: Car,
      gradient: "from-cyan-100 to-blue-100",
      iconColor: "text-cyan-600"
    },
    {
      name: "Cakes",
      description: "Sweet treats for celebrations",
      icon: Cake,
      gradient: "from-red-100 to-pink-100",
      iconColor: "text-red-600"
    },
    {
      name: "Photography",
      description: "Capture moments that matter",
      icon: Music, // reuse icon pack; ideally a camera icon if available
      gradient: "from-blue-100 to-indigo-100",
      iconColor: "text-blue-600"
    }
  ];

  const handleCategoryClick = (categoryName: string) => {
    setLocation(`/vendors?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Explore All Categories
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            Find the perfect services for your event
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.name}
                className="group text-center cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className={`bg-gradient-to-br ${category.gradient} rounded-3xl p-8 mb-4 group-hover:shadow-lg transition-all group-hover:scale-105`}>
                  <IconComponent className={`mx-auto text-4xl ${category.iconColor} mb-4 h-10 w-10`} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Removed Browse All Categories button as requested */}
      </div>
    </section>
  );
}
