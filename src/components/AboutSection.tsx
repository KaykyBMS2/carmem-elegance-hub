import { useRef, useEffect } from 'react';

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Add the animation class and remove opacity-0 to keep it visible after animation
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0');
          // Disconnect the observer after animation to avoid repetition
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section ref={sectionRef} id="about" className="section-padding bg-white/30 backdrop-blur-sm opacity-0 transition-opacity duration-700">
      <div className="main-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="relative z-10 overflow-hidden rounded-xl border-8 border-white shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1630329273801-8f629dba0a72?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Carmem Bezerra - Fundadora" 
                className="w-full object-cover"
                style={{ height: '500px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 glass-card p-6 max-w-xs z-20">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold text-xs">
                  CB
                </div>
                <h3 className="ml-3 font-montserrat font-semibold">Nossa Missão</h3>
              </div>
              <p className="text-sm">
                "Transformar a maternidade em uma experiência inesquecível, celebrando cada momento dessa jornada com elegância e exclusividade."
              </p>
            </div>
            
            {/* Background Element */}
            <div className="absolute -top-6 -left-6 w-full h-full bg-brand-purple/10 rounded-xl -z-10"></div>
          </div>
          
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-block">
              <span className="inline-block bg-brand-purple/10 text-brand-purple text-xs tracking-wider px-3 py-1 rounded-full font-medium">
                SOBRE NÓS
              </span>
            </div>
            <h2 className="section-title">A História da Carmem Bezerra</h2>
            <p className="text-lg">
              Nascida do sonho de transformar a experiência da maternidade em momentos únicos e inesquecíveis, a Carmem Bezerra iniciou sua trajetória em 2015 com uma visão clara: proporcionar elegância, conforto e exclusividade para gestantes.
            </p>
            <p className="text-muted-foreground">
              Nossa fundadora, apaixonada por moda e pela delicadeza da maternidade, percebeu a falta de opções que valorizassem esse momento tão especial na vida de uma mulher. Com dedicação e um olhar atento aos detalhes, desenvolvemos uma coleção exclusiva de vestidos e acessórios que celebram a beleza da gestação.
            </p>
            <p className="text-muted-foreground">
              Hoje, somos referência em aluguel de vestidos para ensaios fotográficos e oferecemos uma variedade de produtos que combinam qualidade, sofisticação e conforto. Cada peça é cuidadosamente selecionada para garantir que toda gestante se sinta especial.
            </p>
            
            <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <h3 className="text-3xl font-montserrat font-bold text-brand-purple">7+</h3>
                <p className="text-sm text-muted-foreground">Anos de Experiência</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-montserrat font-bold text-brand-purple">500+</h3>
                <p className="text-sm text-muted-foreground">Clientes Atendidas</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-montserrat font-bold text-brand-purple">200+</h3>
                <p className="text-sm text-muted-foreground">Vestidos Exclusivos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
