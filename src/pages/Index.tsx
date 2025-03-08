
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, ShoppingBag, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";

const featuredProducts = [
  {
    id: 1,
    name: "Vestido Serenity para Ensaio",
    description: "Vestido elegante em tom suave, perfeito para ensaios fotográficos externos. Valoriza o corpo da gestante com delicadeza.",
    price: 0,
    rentalPrice: 30,
    image: "https://images.unsplash.com/photo-1556648011-e01aca870a81?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3",
    category: "Vestidos",
    isRental: true,
    rentalIncludes: ["Vestido", "Coroa", "Urso", "Terço", "Sutiã"]
  },
  {
    id: 2,
    name: "Combo Premium 4 Vestidos",
    description: "Pacote completo com 4 vestidos exclusivos para ensaios fotográficos, incluindo todos os acessórios necessários.",
    price: 0,
    rentalPrice: 100,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3",
    category: "Combo",
    isRental: true,
    rentalIncludes: ["4 Vestidos", "4 Coroas", "Terço", "Lousa", "Urso", "Sutiã"]
  },
  {
    id: 3,
    name: "Bolsa Maternidade Luxo",
    description: "Bolsa maternidade espaçosa com múltiplos compartimentos. Design elegante e prático para todas as necessidades do bebê.",
    price: 149.9,
    image: "https://images.unsplash.com/photo-1445796865116-a9254123101a?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3",
    category: "Bolsas",
    isRental: false
  },
  {
    id: 4,
    name: "Kit Enxoval Delicado",
    description: "Kit completo para o enxoval do bebê, com peças de alta qualidade e design exclusivo em tons suaves.",
    price: 299.9,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3",
    category: "Enxoval",
    isRental: false
  }
];

const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setLoaded(true);
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);
  
  return (
    <div className={`min-h-screen transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar />
      
      <HeroSection />
      
      <FeatureSection />
      
      {/* Featured Products Section */}
      <section ref={productsRef} className="section-padding">
        <div className="main-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div className="mb-6 md:mb-0">
              <div className="inline-block">
                <span className="inline-block bg-brand-purple/10 text-brand-purple text-xs tracking-wider px-3 py-1 rounded-full font-medium mb-4">
                  DESTAQUES
                </span>
              </div>
              <h2 className="section-title">Nossos Produtos</h2>
              <p className="section-subtitle">
                Conheça alguns dos nossos produtos mais exclusivos para tornar sua experiência de maternidade ainda mais especial.
              </p>
            </div>
            <Link to="/shop" className="button-secondary flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Ver Todos</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-on-scroll opacity-0"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
          
          <div className="mt-16 glass-card p-8 flex flex-col md:flex-row items-center justify-between animate-on-scroll opacity-0">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-2xl font-montserrat font-semibold mb-3">Ensaios Fotográficos</h3>
              <p className="text-muted-foreground max-w-lg">
                Conheça nossa galeria de ensaios e inspire-se para o seu momento especial. Nossas clientes compartilham a magia de suas sessões fotográficas com nossos vestidos exclusivos.
              </p>
            </div>
            <Link to="/gallery" className="button-primary flex items-center whitespace-nowrap">
              <Camera className="mr-2 h-4 w-4" />
              <span>Ver Galeria</span>
            </Link>
          </div>
        </div>
      </section>
      
      <div className="bg-white/30 backdrop-blur-sm mt-10">
        <AboutSection />
      </div>
      
      <TestimonialsSection />
      
      <ContactSection />
      
      <Footer />
    </div>
  );
};

export default Index;
