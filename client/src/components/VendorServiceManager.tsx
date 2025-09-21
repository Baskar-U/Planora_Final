import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Package, DollarSign, MapPin, Image as ImageIcon, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import VendorAddServiceForm from "@/components/VendorAddServiceForm";
import ServicePackagesModal from "@/components/ServicePackagesModal";

interface VendorServiceManagerProps {
  vendorId: string;
  vendorName: string;
}

interface ServiceData {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  priceUnit?: string;
  location: string;
  isActive: boolean;
  createdAt: any;
  packages?: any[];
  coverImage?: string;
  collections?: string[];
}

export default function VendorServiceManager({
  vendorId,
  vendorName
}: VendorServiceManagerProps) {
  const [showAddService, setShowAddService] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [showPackages, setShowPackages] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ServiceData>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vendor services from postorder collection by vendor UID
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["vendorServices", vendorId],
    queryFn: async () => {
      const servicesRef = collection(db, "postorder");
      const q = query(servicesRef, where("vendorid", "==", vendorId));
      const snapshot = await getDocs(q);
      const services = snapshot.docs.map(docSnap => {
        const d: any = docSnap.data();
        const service: ServiceData = {
          id: docSnap.id,
          name: d.businessname || d.serviceName || "Untitled Service",
          description: d.description || "",
          category: d.category || d.eventname || "",
          price: d.price,
          priceUnit: d.priceUnit,
          location: d.location || "",
          isActive: typeof d.isActive === "boolean" ? d.isActive : true,
          createdAt: d.createdAt || null,
          packages: Array.isArray(d.packages) ? d.packages : [],
          coverImage: d.coverImage || d.image,
          collections: Array.isArray(d.collections) ? d.collections : [],
        };
        return service;
      });
      return services as ServiceData[];
    },
    enabled: !!vendorId,
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      await deleteDoc(doc(db, "postorder", serviceId));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["vendorServices", vendorId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const toggleServiceStatusMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) => {
      await updateDoc(doc(db, "postorder", serviceId), { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service status updated",
      });
      queryClient.invalidateQueries({ queryKey: ["vendorServices", vendorId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleToggleServiceStatus = (serviceId: string, isActive: boolean) => {
    toggleServiceStatusMutation.mutate({ serviceId, isActive: !isActive });
  };

  const handlePackagesClick = (service: ServiceData) => {
    setSelectedService(service);
    setShowPackages(true);
  };

  const handleEditClick = (service: ServiceData) => {
    setSelectedService(service);
    setEditForm({
      name: service.name,
      description: service.description,
      category: service.category,
      location: service.location,
      isActive: service.isActive,
      coverImage: service.coverImage,
    });
    setShowEdit(true);
  };

  const saveEditMutation = useMutation({
    mutationFn: async () => {
      if (!selectedService) return;
      await updateDoc(doc(db, "postorder", selectedService.id), {
        businessname: editForm.name,
        description: editForm.description,
        category: editForm.category,
        location: editForm.location,
        isActive: editForm.isActive,
        coverImage: editForm.coverImage,
        updatedAt: new Date()
      });
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Service updated successfully" });
      setShowEdit(false);
      queryClient.invalidateQueries({ queryKey: ["vendorServices", vendorId] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading services...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Services</h3>
          <p className="text-sm text-gray-600">Create, edit and manage your vendor profiles</p>
        </div>
        <Button onClick={() => setShowAddService(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Yet</h3>
            <p className="text-gray-600 mb-6">Add your first vendor profile to start receiving bookings.</p>
            <Button onClick={() => setShowAddService(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <div className="relative h-44 w-full overflow-hidden rounded-t-lg bg-gray-100">
                {service.coverImage ? (
                  <img src={service.coverImage} alt={service.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No cover</div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> {service.location || "Unknown"}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                {service.collections && service.collections.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    {service.collections.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} className="h-14 w-full object-cover rounded" />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePackagesClick(service)}>
                    <Package className="h-3 w-3 mr-1" /> Packages
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(service)}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleServiceStatus(service.id, service.isActive)}>
                    {service.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteService(service.id)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Service */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <VendorAddServiceForm onSuccess={() => setShowAddService(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Service */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editForm.name || ""} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={editForm.category || ""} onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={editForm.location || ""} onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={4} value={editForm.description || ""} onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input value={editForm.coverImage || ""} onChange={(e) => setEditForm(prev => ({ ...prev, coverImage: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button onClick={() => saveEditMutation.mutate()}>
                <CheckCircle className="h-4 w-4 mr-1" /> Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Packages */}
      <Dialog open={showPackages} onOpenChange={setShowPackages}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Service Packages - {selectedService?.name}</DialogTitle>
          </DialogHeader>
          <ServicePackagesModal service={selectedService} onSuccess={() => setShowPackages(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

