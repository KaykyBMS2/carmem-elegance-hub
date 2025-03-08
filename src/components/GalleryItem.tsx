
import { useState } from 'react';
import { Eye, X } from 'lucide-react';

export interface GalleryItemProps {
  id: number;
  image: string;
  title: string;
  description: string;
  category: string;
}

const GalleryItem = ({ image, title, description, category }: GalleryItemProps) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <div 
        className="overflow-hidden rounded-xl group cursor-pointer relative"
        onClick={() => setShowModal(true)}
      >
        {/* Image */}
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay with info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block px-2 py-1 bg-brand-purple/90 text-white text-xs rounded mb-2">
              {category}
            </span>
            <h3 className="text-white font-montserrat font-medium">{title}</h3>
            <div className="flex items-center mt-2">
              <Eye className="h-4 w-4 text-white mr-2" />
              <span className="text-white text-xs">Ver detalhes</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div 
            className="relative max-w-5xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
              onClick={() => setShowModal(false)}
            >
              <X className="h-5 w-5 text-brand-dark" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-[500px] overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </div>
              
              <div className="p-8 flex flex-col">
                <span className="inline-block px-2 py-1 bg-brand-purple/10 text-brand-purple text-xs rounded mb-4">
                  {category}
                </span>
                <h2 className="text-2xl font-montserrat font-semibold mb-4">{title}</h2>
                <p className="text-muted-foreground flex-grow">{description}</p>
                
                <div className="mt-6 flex flex-col space-y-4">
                  <h3 className="text-sm font-medium">Vestidos utilizados neste ensaio:</h3>
                  <div className="flex space-x-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                      <img src={image} alt="Vestido" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                      <img src={image} alt="Vestido" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">+2</span>
                    </div>
                  </div>
                  
                  <button className="button-primary mt-4">
                    Alugar Vestidos Semelhantes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryItem;
