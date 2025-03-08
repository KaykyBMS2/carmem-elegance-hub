
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  image: string;
  quote: string;
  rating: number;
  date: string;
}

const TestimonialCard = ({ name, image, quote, rating, date }: TestimonialCardProps) => {
  return (
    <div className="glass-card p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="ml-4">
          <h4 className="font-montserrat font-medium">{name}</h4>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < rating ? "text-amber-400 fill-amber-400" : "text-gray-300"} 
              />
            ))}
          </div>
        </div>
      </div>
      
      <p className="italic text-muted-foreground flex-grow">"{quote}"</p>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
