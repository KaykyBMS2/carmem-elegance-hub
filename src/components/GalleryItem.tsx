
import { Link } from 'react-router-dom';

export interface GalleryItemProps {
  title: string;
  imageUrl: string;
  link: string;
}

const GalleryItem = ({ title, imageUrl, link }: GalleryItemProps) => {
  return (
    <Link
      to={link.startsWith('http') ? link : `/${link}`}
      target={link.startsWith('http') ? '_blank' : undefined}
      className="block group relative overflow-hidden rounded-lg aspect-[3/4] shadow-md transition-all duration-300 hover:shadow-lg"
    >
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
        <h3 className="text-white font-medium text-sm md:text-base">{title}</h3>
      </div>
    </Link>
  );
};

export default GalleryItem;
