import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface PostorderService {
  id: string;
  businessname: string;
  serviceName: string;
  description: string;
  category: string;
  subcategory?: string;
  location: string;
  coverImage?: string;
  image?: string;
  name: string;
  email: string;
  mobilenumber: string;
  serviceFeatures: string[];
  workingHours: string;
  serviceableCities: string[];
  exprience: string;
  from: string[];
  collections: string[];
  menu: string[];
  features: string[];
  packages: any[];
  isActive: boolean;
  isVerified: boolean;
  vendorid: string;
  createdAt: any;
  updatedAt: any;
}

export const usePostorderServices = () => {
  return useQuery<PostorderService[], Error>({
    queryKey: ["postorderServices"],
    queryFn: async () => {
      console.log("usePostorderServices: Fetching all services from postorder collection");
      const postorderRef = collection(db, "postorder");
      const snapshot = await getDocs(postorderRef);

      if (snapshot.empty) {
        console.log("usePostorderServices: No services found in postorder collection");
        return [];
      }

      const services = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`usePostorderServices: Document ${doc.id}:`, data.businessname, data.serviceName);
        return {
          id: doc.id,
          ...data
        };
      }) as PostorderService[];

      console.log(`usePostorderServices: Found ${services.length} services`);
      console.log(`usePostorderServices: Service names:`, services.map(s => s.businessname + " - " + s.serviceName));
      return services;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
