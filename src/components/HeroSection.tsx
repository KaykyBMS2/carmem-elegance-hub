
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-purple/5"></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-brand-purple/10"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-brand-purple/5"></div>
      </div>
      
      <div className="main-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 z-10 py-16 md:py-24">
        {/* Text Content */}
        <div className={`flex flex-col justify-center transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-block">
            <span className="inline-block bg-brand-purple/10 text-brand-purple text-xs tracking-wider px-3 py-1 rounded-full font-medium mb-6 animate-fade-in">
              ALUGUEL DE VESTIDOS & ARTIGOS PARA GESTANTES
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-semibold leading-tight">
            Elegância e Delicadeza para Momentos 
            <span className="relative inline-block ml-3">
              <span className="relative z-10 text-brand-purple">Especiais</span>
              <span className="absolute bottom-0 left-0 w-full h-3 bg-brand-purple/20 -z-0"></span>
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Na Carmem Bezerra, transformamos a espera do seu bebê em momentos mágicos. Vestidos exclusivos e acessórios cuidadosamente selecionados para celebrar a maternidade com o requinte que você merece.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/shop" className="button-primary flex items-center group">
              <span>Conheça Nossos Produtos</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/gallery" className="button-secondary">
              Ver Ensaios
            </Link>
          </div>
        </div>
        
        {/* Image Section */}
        <div className={`relative transition-all duration-1000 delay-300 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Main Image with Glass Effect */}
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-lg transform rotate-2 border-4 border-white">
            <img 
              src="https://images.unsplash.com/photo-1556648011-e01aca870a81?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3" 
              alt="Gestante usando vestido Carmem Bezerra" 
              className="w-full h-full object-cover"
              style={{ maxHeight: '600px' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          
          {/* Decorative Element 1 */}
          <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-white p-2 rounded-lg shadow-subtle rotate-6 z-0">
            <div className="w-full h-full rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1613765153357-13147a469d02?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Detalhes de vestido" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Decorative Element 2 */}
          <div className="absolute -top-10 -right-3 w-32 h-32 bg-white p-2 rounded-lg shadow-subtle -rotate-12 z-0">
            <div className="w-full h-full rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1578736641330-3155e606cd40?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Acessório para gestante" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Floating Info Card */}
          <div className="absolute bottom-8 right-8 glass-card p-4 max-w-xs animate-float z-20">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-purple text-white font-bold">
                CB
              </div>
              <div className="ml-3">
                <h3 className="font-medium">Exclusividade e Conforto</h3>
                <p className="text-xs text-muted-foreground">Peças selecionadas para o seu momento especial</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-xs text-muted-foreground mb-2">Explore Mais</span>
        <div className="w-6 h-10 border-2 border-brand-purple/30 rounded-full flex justify-center p-1">
          <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
