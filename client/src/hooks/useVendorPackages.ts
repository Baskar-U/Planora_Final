import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Package {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  price: number;
  discount: number;
  capacity: number;
  priceUnit: string;
  features: string[];
  isActive: boolean;
}

export const useVendorPackages = (vendorId: string) => {
  return useQuery<Package[], Error>({
    queryKey: ["vendorPackages", vendorId],
    queryFn: async () => {
      if (!vendorId) {
        console.log("useVendorPackages: No vendorId provided");
        return [];
      }

      console.log(`useVendorPackages: Fetching packages for vendorId: ${vendorId}`);
      
      try {
        // Query the postorder collection for documents with the matching vendorid
        const postorderRef = collection(db, "postorder");
        const q = query(postorderRef, where("vendorid", "==", vendorId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log("useVendorPackages: No documents found for this vendorId");
          return [];
        }

        // Get all packages from all matching documents
        const allPackages: Package[] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`useVendorPackages: Document ${doc.id} - Full data:`, data);
          console.log(`useVendorPackages: Document ${doc.id} - packages field:`, data.packages);
          console.log(`useVendorPackages: Document ${doc.id} - packages type:`, typeof data.packages);
          console.log(`useVendorPackages: Document ${doc.id} - packages is array:`, Array.isArray(data.packages));
          
          if (data.packages && Array.isArray(data.packages)) {
            console.log(`useVendorPackages: Document ${doc.id} - packages length:`, data.packages.length);
            data.packages.forEach((pkg: any, index: number) => {
              console.log(`useVendorPackages: Document ${doc.id} - Package ${index}:`, pkg);
              allPackages.push({
                id: pkg.id || Math.random().toString(),
                name: pkg.name || 'Package',
                description: pkg.description || '',
                originalPrice: pkg.originalPrice || pkg.price || 0,
                price: pkg.price || pkg.originalPrice || 0,
                discount: pkg.discount || 0,
                capacity: pkg.capacity || 0,
                priceUnit: pkg.priceUnit || 'per_event',
                features: pkg.features || [],
                isActive: pkg.isActive !== false
              });
            });
          } else {
            console.log(`useVendorPackages: Document ${doc.id} - No packages array found or not an array`);
          }
        });

        console.log(`useVendorPackages: Found ${allPackages.length} packages for vendorId: ${vendorId}`);
        console.log("useVendorPackages: Packages:", allPackages);
        
        return allPackages;
      } catch (error) {
        console.error("useVendorPackages: Error fetching packages:", error);
        throw error;
      }
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
