import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface VendorProfile {
  id: string;
  vendorid: string;
  businessname: string;
  eventname: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  priceUnit: string;
  location: string;
  image?: string;
  coverImage?: string;
  collections?: string[];
  features?: string[];
  menu?: string[];
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  createdAt?: any;
  updatedAt?: any;
  // New fields from postorder collection
  serviceName?: string;
  serviceFeatures?: string[];
  packages?: Package[];
  workingHours?: string;
  serviceableCities?: string[];
  // Contact details
  name?: string;
  email?: string;
  mobilenumber?: string;
  // Experience and working details
  exprience?: string;
  from?: string[];
}

interface Package {
  packageName: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  capacity: number;
  priceUnit: string;
  packageFeatures: string[];
}

export const useVendorCompanyProfiles = (vendorId: string) => {
  return useQuery<VendorProfile[], Error>({
    queryKey: ["vendorCompanyProfiles", vendorId],
    queryFn: async () => {
      if (!vendorId) {
        console.log("useVendorCompanyProfiles: No vendorId provided.");
        return [];
      }

      console.log(`useVendorCompanyProfiles: Fetching all profiles for vendorId: ${vendorId}`);
      
      try {
        // Query the postorder collection for all profiles with the same vendorid
        const profilesRef = collection(db, "postorder");
        const q = query(profilesRef, where("vendorid", "==", vendorId));
        console.log(`useVendorCompanyProfiles: Query: where("vendorid", "==", "${vendorId}")`);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log("useVendorCompanyProfiles: No profiles found for this vendorId");
          console.log("useVendorCompanyProfiles: Let's check what vendorids exist in postorder collection");
          
          // Let's see what vendorids actually exist in the collection
          const allProfilesRef = collection(db, "postorder");
          const allSnapshot = await getDocs(allProfilesRef);
          console.log("useVendorCompanyProfiles: All documents in postorder collection:");
          allSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`  Document ${doc.id}: vendorid = "${data.vendorid}", businessname = "${data.businessname}"`);
          });
          
          return [];
        }

        const profiles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as VendorProfile[];

        console.log(`useVendorCompanyProfiles: Found ${profiles.length} profiles for vendorId: ${vendorId}`);
        console.log("useVendorCompanyProfiles: Profiles:", profiles.map(p => ({ id: p.id, eventname: p.eventname, category: p.category })));

        return profiles;
      } catch (error) {
        console.error("useVendorCompanyProfiles: Error fetching profiles:", error);
        throw error;
      }
    },
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
