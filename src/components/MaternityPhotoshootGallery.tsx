
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Instagram, Loader2 } from 'lucide-react';

interface PhotoshootData {
  id: string;
  title: string;
  description: string | null;
  instagram_handle: string | null;
  image_url: string;
}

const MaternityPhotoshootGallery = () => {
  const [photoshoots, setPhotoshoots] = useState<PhotoshootData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotoshoots = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('maternity_photoshoots')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPhotoshoots(data || []);
      } catch (error) {
        console.error('Error fetching photoshoots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoshoots();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (photoshoots.length === 0) {
    return null; // Don't show anything if there are no photoshoots
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photoshoots.map((photoshoot) => (
        <div 
          key={photoshoot.id} 
          className="group relative overflow-hidden rounded-lg aspect-[4/5]"
        >
          <img 
            src={photoshoot.image_url} 
            alt={photoshoot.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-lg font-semibold mb-1">{photoshoot.title}</h3>
              {photoshoot.description && (
                <p className="text-sm text-gray-200 mb-2 line-clamp-2">{photoshoot.description}</p>
              )}
              {photoshoot.instagram_handle && (
                <a 
                  href={`https://instagram.com/${photoshoot.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-pink-300 hover:text-pink-200"
                >
                  <Instagram size={14} className="mr-1" />
                  {photoshoot.instagram_handle}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaternityPhotoshootGallery;
