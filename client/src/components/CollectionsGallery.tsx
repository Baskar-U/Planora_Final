import { useState, useEffect } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";
import { Image, ImageOff, X, Eye } from "lucide-react";

interface CollectionsGalleryProps {
  vendorId: string;
}

export default function CollectionsGallery({ vendorId }: CollectionsGalleryProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      if (!vendorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const storage = getStorage();
        const uploadsRef = ref(storage, `users/${vendorId}/uploads`);
        
        // List all files in the uploads directory
        const result = await listAll(uploadsRef);
        
        // Get download URLs for all files
        const imageUrls = await Promise.all(
          result.items.map(async (item) => {
            try {
              const url = await getDownloadURL(item);
              return url;
            } catch (err) {
              console.warn(`Failed to get download URL for ${item.name}:`, err);
              return null;
            }
          })
        );

        // Filter out null values and only include image files
        const validImages = imageUrls.filter((url): url is string => 
          url !== null && 
          (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp'))
        );

        setImages(validImages);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load shop photos');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [vendorId]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Close modal if clicking on the backdrop
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Determine which images to show
  const displayedImages = showAll ? images : images.slice(0, 12);
  const hasMoreImages = images.length > 12;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" text="Loading collections..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ImageOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No shop photos available yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with View All button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {showAll ? `${images.length} photos` : `Showing ${Math.min(12, images.length)} of ${images.length} photos`}
          </div>
          {hasMoreImages && (
            <Button
              onClick={toggleShowAll}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showAll ? 'Show Less' : 'View All'}
            </Button>
          )}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedImages.map((imageUrl, index) => (
            <Card key={index} className="overflow-hidden group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-0">
                <div 
                  className="relative aspect-square overflow-hidden"
                  onClick={() => handleImageClick(imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt={`Shop photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full bg-gray-100">
                            <div class="text-center">
                              <ImageOff class="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p class="text-sm text-gray-500">Image unavailable</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleModalClick}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              onClick={handleCloseModal}
              variant="outline"
              size="icon"
              className="absolute -top-12 right-0 bg-white hover:bg-gray-100 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage}
              alt="Full size shop photo"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
