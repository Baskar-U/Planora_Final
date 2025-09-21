import { usePostorderServices } from "@/hooks/usePostorderServices";
import VendorCard from "./VendorCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import LoadingSpinner from "./LoadingSpinner";

export default function FeaturedVendors() {
  const { data: allServices = [], isLoading, error } = usePostorderServices();

  const allowedCategories = new Set(["Catering", "Photography", "DJ", "Decoration", "Cakes", "Travel"]);
  const vendors = (allServices || [])
    .filter((svc: any) => allowedCategories.has(svc.category))
    .map((service: any) => ({
      id: service.id,
      vendorid: service.vendorid,
      businessname: service.businessname || service.name,
      name: service.name,
      category: service.category,
      eventname: service.eventname,
      location: service.location,
      description: service.description,
      image: service.coverImage || service.image,
      mobilenumber: service.mobilenumber,
      email: service.email,
      exprience: service.experience,
      hours: service.hours || service.workingHours || 'Contact for availability',
      isVerified: service.isVerified,
      packages: service.packages || [],
      menu: service.menu || [],
      createdAt: service.createdAt,
    }));

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Vendors</h2>
            <p className="text-xl text-gray-600">Top-rated vendors in your area</p>
          </div>
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading featured vendors..." />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Vendors</h2>
            <p className="text-xl text-gray-600 mb-8">Unable to load vendors at the moment</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Vendors
          </h2>
          <p className="text-xl text-gray-600">
            Top-rated vendors in your area
          </p>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No vendors found</p>
            <p className="text-gray-500">Be the first to add your business!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {vendors.slice(0, 8).map((vendor, index) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="px-8 py-3 text-lg">
                <Link href="/vendors">
                  Explore all vendors
                </Link>
              </Button>
            </div>

            {/* Ad below Explore all vendors button */}
            <div className="mt-12">
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6343948689807963" crossOrigin="anonymous"></script>
                  <ins className="adsbygoogle"
                       style={{display: 'block'}}
                       data-ad-client="ca-pub-6343948689807963"
                       data-ad-slot="4229250278"
                       data-ad-format="auto"
                       data-full-width-responsive="true"></ins>
                  <script dangerouslySetInnerHTML={{
                    __html: '(adsbygoogle = window.adsbygoogle || []).push({});'
                  }}></script>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
