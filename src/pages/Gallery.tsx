import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryItem from "@/components/GalleryItem";
import MaternityPhotoshootGallery from "@/components/MaternityPhotoshootGallery";

const Gallery = () => {
  // Sample gallery items
  const galleryItems = [
    {
      id: 1,
      title: "Vestido Elegance Rose",
      imageUrl: "https://images.unsplash.com/photo-1556648011-e01aca870a81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      link: "/product/1",
    },
    {
      id: 2,
      title: "Vestido Serena Blue",
      imageUrl: "https://images.unsplash.com/photo-1623068481812-89ed6e3035d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      link: "/product/2",
    },
    {
      id: 3,
      title: "Vestido Aurora White",
      imageUrl: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      link: "/product/3",
    },
    {
      id: 4,
      title: "Ensaio Temático Natureza",
      imageUrl: "https://images.unsplash.com/photo-1575997759258-91792eaaf87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      link: "/gallery",
    },
    {
      id: 5,
      title: "Vestido Diana Rose",
      imageUrl: "https://images.unsplash.com/photo-1623664304296-f549f5462065?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      link: "/product/5",
    },
    {
      id: 6,
      title: "Ensaio Temático Clássico",
      imageUrl: "https://images.unsplash.com/photo-1617077644557-64be144aa306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80",
      link: "/gallery",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-3xl font-montserrat font-bold text-gray-800 mb-3">Nossa Galeria</h1>
          <p className="text-gray-600 max-w-3xl">
            Explore nossa seleção de peças e ensaios exclusivos para o período mais especial da sua vida. Cada peça é escolhida com cuidado para realçar a beleza da maternidade.
          </p>
        </div>
        
        {/* Maternity Photoshoots Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-montserrat font-semibold text-gray-800 mb-6">
            Ensaios de Gestante
          </h2>
          <MaternityPhotoshootGallery />
        </section>
        
        {/* Existing Gallery Section */}
        <section>
          <h2 className="text-2xl font-montserrat font-semibold text-gray-800 mb-6">
            Nossas Peças em Destaque
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <GalleryItem
                key={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                link={item.link}
              />
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Gallery;
