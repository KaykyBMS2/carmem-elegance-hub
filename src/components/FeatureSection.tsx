
import { ShoppingBag, Gift, Camera, HeartHandshake } from 'lucide-react';
import { useRef, useEffect } from 'react';

const FeatureSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
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

  const features = [
    {
      icon: <ShoppingBag className="h-10 w-10 text-brand-purple" />,
      title: "Produtos Exclusivos",
      description: "Artigos selecionados para gestantes, com foco no conforto e elegância para o dia a dia."
    },
    {
      icon: <Gift className="h-10 w-10 text-brand-purple" />,
      title: "Aluguel de Vestidos",
      description: "Vestidos exclusivos para ensaios fotográficos, feitos para valorizar a beleza da maternidade."
    },
    {
      icon: <Camera className="h-10 w-10 text-brand-purple" />,
      title: "Ensaios Fotográficos",
      description: "Inspiração e galeria de ensaios reais, mostrando a beleza das nossas clientes."
    },
    {
      icon: <HeartHandshake className="h-10 w-10 text-brand-purple" />,
      title: "Atendimento Personalizado",
      description: "Cuidado especial com cada cliente, para uma experiência única e memorável."
    }
  ];

  return (
    <section ref={sectionRef} className="section-padding opacity-0">
      <div className="main-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="section-title">Nossos Serviços</h2>
          <p className="section-subtitle">
            Na Carmem Bezerra, oferecemos soluções completas para tornar sua experiência de maternidade ainda mais especial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-montserrat font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
