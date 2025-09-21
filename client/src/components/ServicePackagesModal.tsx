import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc } from "firebase/firestore";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  DollarSign,
  Users,
  Package,
  CheckCircle
} from "lucide-react";

interface PackageData {
  id?: string;
  name?: string; // legacy
  packageName?: string; // new schema
  description: string;
  price?: number; // legacy
  originalPrice?: number; // new schema
  discountPrice?: number; // new schema (optional)
  discount?: number; // percentage
  capacity: number;
  features?: string[]; // legacy
  packageFeatures?: string[]; // new schema
  isActive: boolean;
  serviceId: string;
  priceUnit?: string;
}

interface ServicePackagesModalProps {
  service: any;
  onSuccess: () => void;
}

export default function ServicePackagesModal({ service, onSuccess }: ServicePackagesModalProps) {
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [packageForm, setPackageForm] = useState<PackageData>({
    packageName: "",
    description: "",
    originalPrice: 0,
    capacity: 0,
    packageFeatures: [],
    isActive: true,
    serviceId: service?.id || "",
    discount: 0,
    priceUnit: "per_event"
  });
  const [currentFeature, setCurrentFeature] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch packages for this service from postorder/{service.id}
  const { data: packages = [], isLoading, refetch } = useQuery({
    queryKey: ["postorderPackages", service?.id],
    queryFn: async () => {
      if (!service?.id) return [];
      const serviceRef = doc(db, "postorder", service.id);
      const snap = await getDoc(serviceRef);
      const d: any = snap.data() || {};
      const pkgs: any[] = Array.isArray(d.packages) ? d.packages : [];
      // normalize
      return pkgs.map((p: any) => ({
        id: p.id || String(Date.now() + Math.random()),
        packageName: p.packageName || p.name,
        description: p.description || "",
        originalPrice: p.originalPrice ?? p.price ?? 0,
        discountPrice: p.discountPrice,
        discount: p.discount ?? 0,
        capacity: p.capacity ?? 0,
        packageFeatures: p.packageFeatures ?? p.features ?? [],
        isActive: typeof p.isActive === "boolean" ? p.isActive : true,
        serviceId: service.id,
        priceUnit: p.priceUnit || "per_event",
      })) as PackageData[];
    },
    enabled: !!service?.id
  });

  const createPackageMutation = useMutation({
    mutationFn: async (packageData: PackageData) => {
      const serviceRef = doc(db, "postorder", service.id);
      const snap = await getDoc(serviceRef);
      const d: any = snap.data() || {};
      const existing: any[] = Array.isArray(d.packages) ? d.packages : [];
      const newPkg = {
        id: String(Date.now()),
        packageName: packageData.packageName || packageData.name,
        description: packageData.description,
        originalPrice: packageData.originalPrice ?? packageData.price ?? 0,
        discountPrice: packageData.discountPrice ?? null,
        discount: packageData.discount ?? 0,
        capacity: packageData.capacity,
        packageFeatures: packageData.packageFeatures ?? packageData.features ?? [],
        priceUnit: packageData.priceUnit || "per_event",
        isActive: packageData.isActive,
      };
      await updateDoc(serviceRef, { packages: [...existing, newPkg], updatedAt: new Date() });
      return newPkg;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package created successfully",
      });
      setPackageForm({
        packageName: "",
        description: "",
        originalPrice: 0,
        capacity: 0,
        packageFeatures: [],
        isActive: true,
        serviceId: service?.id || "",
        discount: 0,
        priceUnit: "per_event"
      });
      setShowAddPackage(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["vendorServices"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ packageId, packageData }: { packageId: string; packageData: PackageData }) => {
      const serviceRef = doc(db, "postorder", service.id);
      const snap = await getDoc(serviceRef);
      const d: any = snap.data() || {};
      const existing: any[] = Array.isArray(d.packages) ? d.packages : [];
      const updated = existing.map((p: any) =>
        (p.id || "") === packageId
          ? {
              ...p,
              packageName: packageData.packageName || packageData.name,
              description: packageData.description,
              originalPrice: packageData.originalPrice ?? packageData.price ?? 0,
              discountPrice: packageData.discountPrice ?? p.discountPrice ?? null,
              discount: packageData.discount ?? p.discount ?? 0,
              capacity: packageData.capacity,
              packageFeatures: packageData.packageFeatures ?? packageData.features ?? [],
              priceUnit: packageData.priceUnit || p.priceUnit || "per_event",
              isActive: packageData.isActive,
            }
          : p
      );
      await updateDoc(serviceRef, { packages: updated, updatedAt: new Date() });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
      setEditingPackage(null);
      setPackageForm({
        packageName: "",
        description: "",
        originalPrice: 0,
        capacity: 0,
        packageFeatures: [],
        isActive: true,
        serviceId: service?.id || "",
        discount: 0,
        priceUnit: "per_event"
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["vendorServices"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const serviceRef = doc(db, "postorder", service.id);
      const snap = await getDoc(serviceRef);
      const d: any = snap.data() || {};
      const existing: any[] = Array.isArray(d.packages) ? d.packages : [];
      const updated = existing.filter((p: any) => (p.id || "") !== packageId);
      await updateDoc(serviceRef, { packages: updated, updatedAt: new Date() });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["vendorServices"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPackage) {
      updatePackageMutation.mutate({
        packageId: editingPackage.id!,
        packageData: packageForm
      });
    } else {
      createPackageMutation.mutate(packageForm);
    }
  };

  const handleEdit = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setPackageForm({
      ...pkg,
      packageName: pkg.packageName || pkg.name || "",
      originalPrice: pkg.originalPrice ?? pkg.price ?? 0,
      packageFeatures: pkg.packageFeatures ?? pkg.features ?? [],
      discount: pkg.discount ?? 0,
      priceUnit: pkg.priceUnit || "per_event",
    });
    setShowAddPackage(true);
  };

  const handleDelete = (packageId: string) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      deletePackageMutation.mutate(packageId);
    }
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setPackageForm(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setPackageForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setPackageForm({
      packageName: "",
      description: "",
      originalPrice: 0,
      capacity: 0,
      packageFeatures: [],
      isActive: true,
      serviceId: service?.id || "",
      discount: 0,
      priceUnit: "per_event"
    });
    setEditingPackage(null);
    setShowAddPackage(false);
  };

  if (!service) return null;

  return (
    <div className="space-y-6">
      {/* Service Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {service.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{service.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Starting from ₹{service.price?.toLocaleString()}
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {service.category}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Packages Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Service Packages</h3>
        <Button onClick={() => setShowAddPackage(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      {/* Packages List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Packages Yet</h4>
            <p className="text-gray-600 mb-4">Create packages to offer different pricing options for your service.</p>
            <Button onClick={() => setShowAddPackage(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pkg.packageName || pkg.name}</CardTitle>
                    <div className="flex items-center mt-2">
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(pkg)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(pkg.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-lg font-semibold text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {service.category === 'Decoration' && pkg.decoration ? (
                      <span>₹{pkg.decoration.originalPrice?.toLocaleString() || '0'}</span>
                    ) : service.category === 'Photography' && pkg.photography ? (
                      <span>₹{pkg.photography.perEvent?.originalPrice?.toLocaleString() || pkg.photography.perHour?.originalPrice?.toLocaleString() || '0'}</span>
                    ) : service.category === 'DJ' && pkg.dj ? (
                      <span>₹{pkg.dj.perEvent?.originalPrice?.toLocaleString() || pkg.dj.perHour?.originalPrice?.toLocaleString() || '0'}</span>
                    ) : (
                      <span>₹{(pkg.originalPrice || pkg.price || 0).toLocaleString()}</span>
                    )}
                  </div>
                  {service.category !== 'Photography' && service.category !== 'DJ' && service.category !== 'Decoration' && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {pkg.capacity} people
                    </div>
                  )}
                </div>
                {(pkg.packageFeatures?.length || pkg.features?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(pkg.packageFeatures || pkg.features || []).slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {(pkg.packageFeatures?.length || pkg.features?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(pkg.packageFeatures?.length || pkg.features?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Package Modal */}
      <Dialog open={showAddPackage} onOpenChange={resetForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Add New Package"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packageName">Package Name *</Label>
                <Input
                  id="packageName"
                  value={packageForm.packageName}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, packageName: e.target.value }))}
                  placeholder="e.g., Non-Veg for 200 people"
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity (People) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={packageForm.capacity}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  placeholder="200"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={packageForm.originalPrice}
                onChange={(e) => setPackageForm(prev => ({ ...prev, originalPrice: parseInt(e.target.value) || 0 }))}
                placeholder="12000"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={packageForm.description}
                onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what's included in this package..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label>Features</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    placeholder="Add a feature (e.g., Free delivery)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(packageForm.packageFeatures || []).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
              >
                {createPackageMutation.isPending || updatePackageMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingPackage ? "Update Package" : "Create Package"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}



