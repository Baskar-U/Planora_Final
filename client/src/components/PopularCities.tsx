import { useLocation } from "wouter";

export default function PopularCities() {
  const [, setLocation] = useLocation();

  const cities = [
    {
      name: "Chennai",
      services: "250+",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    },
    {
      name: "Madurai",
      services: "180+",
      image: "https://images.unsplash.com/photo-1574914629385-46448b767aec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    },
    {
      name: "Coimbatore",
      services: "160+",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    },
    {
      name: "Trichy",
      services: "120+",
      image: "https://images.unsplash.com/photo-1574914629385-46448b767aec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    },
    {
      name: "Kodaikanal",
      services: "85+",
      image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    }
  ];

  const handleCityClick = (cityName: string) => {
    setLocation(`/?city=${cityName}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Cities</h2>
          <p className="text-xl text-gray-600">Discover amazing services in these top destinations</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {cities.map((city) => (
            <div
              key={city.name}
              className="group cursor-pointer"
              onClick={() => handleCityClick(city.name)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all group-hover:shadow-xl group-hover:scale-105">
                <img
                  src={city.image}
                  alt={`${city.name} cityscape`}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-semibold text-lg">{city.name}</h3>
                  <p className="text-gray-200 text-sm">{city.services} Services</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
