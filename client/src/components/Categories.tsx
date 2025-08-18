import { useLocation } from "wouter";
import { 
  Utensils, 
  Building, 
  Sparkles, 
  Music, 
  Gift, 
  Car, 
  Cake, 
  Music4 
} from "lucide-react";

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
      name: "Venue",
      description: "Perfect spaces for your events",
      icon: Building,
      gradient: "from-blue-100 to-indigo-100",
      iconColor: "text-blue-600"
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
      name: "Return Gift",
      description: "Memorable gifts for guests",
      icon: Gift,
      gradient: "from-yellow-100 to-orange-100",
      iconColor: "text-yellow-600"
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
      name: "Orchestra",
      description: "Live music performances",
      icon: Music4,
      gradient: "from-purple-100 to-indigo-100",
      iconColor: "text-purple-600"
    }
  ];

  const handleCategoryClick = (categoryName: string) => {
    setLocation(`/?category=${categoryName}`);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore All Categories</h2>
          <p className="text-xl text-gray-600">Find the perfect services for your event</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((category) => {
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
      </div>
    </section>
  );
}
