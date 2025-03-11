
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
}

const ProductImageGallery = ({ images }: ProductImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="rounded-lg bg-gray-100 flex items-center justify-center h-96">
        <p className="text-gray-500">Sem imagens disponíveis</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Find primary image and put it first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
        {sortedImages.length > 0 && (
          <img 
            src={sortedImages[currentIndex]?.image_url} 
            alt="Product" 
            className="object-cover w-full h-full"
          />
        )}
        
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md text-gray-800 hover:bg-white focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md text-gray-800 hover:bg-white focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 snap-x">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden snap-start ${
                index === currentIndex ? 'ring-2 ring-brand-purple' : 'ring-1 ring-gray-200'
              }`}
            >
              <img 
                src={image.image_url} 
                alt={`Thumbnail ${index + 1}`} 
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
