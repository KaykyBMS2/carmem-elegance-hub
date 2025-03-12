
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="rounded-lg bg-gray-100 flex items-center justify-center h-96">
        <p className="text-gray-500 font-poppins">Sem imagens disponíveis</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setIsZoomed(false);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setIsZoomed(false);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageContainerRef.current || !isZoomed) return;
    
    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  // Find primary image and put it first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div 
        ref={imageContainerRef}
        className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square cursor-pointer"
        onClick={handleImageClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isZoomed && setIsZoomed(false)}
      >
        {sortedImages.length > 0 && (
          <div className={`w-full h-full transition-all duration-300 ease-out ${isZoomed ? 'scale-150' : ''}`}>
            <img 
              src={sortedImages[currentIndex]?.image_url} 
              alt={`Imagem do produto ${currentIndex + 1}`}
              className="object-cover w-full h-full"
              style={isZoomed ? { 
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              } : {}}
              loading="lazy"
            />
          </div>
        )}
        
        <div className="absolute right-3 top-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="rounded-full bg-white/80 p-2 shadow-md text-gray-800 hover:bg-white focus:outline-none"
            aria-label={isZoomed ? "Diminuir zoom" : "Ampliar zoom"}
          >
            {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
        </div>
        
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-md text-gray-800 hover:bg-white focus:outline-none transition-all hover:scale-105"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-md text-gray-800 hover:bg-white focus:outline-none transition-all hover:scale-105"
              aria-label="Próxima imagem"
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
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden snap-start transition-all duration-200 ${
                index === currentIndex ? 'ring-2 ring-brand-purple scale-105' : 'ring-1 ring-gray-200 hover:ring-brand-purple/50'
              }`}
            >
              <img 
                src={image.image_url} 
                alt={`Miniatura ${index + 1}`} 
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
