import { useRef, useEffect, useState } from 'react';
import TestimonialCard from './TestimonialCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonialsData = [
  {
    name: "Ana Paula",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3",
    quote: "Os vestidos da Carmem Bezerra transformaram meu ensaio fotográfico! O atendimento foi impecável, e cada detalhe foi pensado para valorizar minha gestação.",
    rating: 5,
    date: "10 de Março, 2023"
  },
  {
    name: "Juliana Costa",
    image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=2689&auto=format&fit=crop&ixlib=rb-4.0.3",
    quote: "Experiência incrível! Do atendimento à qualidade dos produtos, tudo superou minhas expectativas. Recomendo a todas as mamães!",
    rating: 5,
    date: "22 de Abril, 2023"
  },
  {
    name: "Mariana Silva",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3",
    quote: "Aluguei o combo de 4 vestidos e foi a melhor decisão! Consegui fazer fotos lindas com diferentes looks, e tudo chegou perfeitamente embalado.",
    rating: 5,
    date: "16 de Maio, 2023"
  },
  {
    name: "Fernanda Oliveira",
    image: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3",
    quote: "A qualidade dos vestidos é impressionante! Fiquei encantada com cada peça e acessório. As fotos ficaram mágicas, e me senti uma verdadeira princesa.",
    rating: 5,
    date: "8 de Junho, 2023"
  },
  {
    name: "Carla Mendes",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3",
    quote: "Os produtos para maternidade são de excelente qualidade. Comprei vários itens e estou muito satisfeita com cada um deles. Atendimento nota 10!",
    rating: 4,
    date: "14 de Julho, 2023"
  }
];

const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
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
  
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };
    
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScroll);
      }
    };
  }, []);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };
  
  return (
    <section ref={sectionRef} className="section-padding opacity-0 transition-opacity duration-700">
      <div className="main-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block">
            <span className="inline-block bg-brand-purple/10 text-brand-purple text-xs tracking-wider px-3 py-1 rounded-full font-medium mb-4">
              DEPOIMENTOS
            </span>
          </div>
          <h2 className="section-title">O Que Nossas Clientes Dizem</h2>
          <p className="section-subtitle">
            A satisfação de nossas clientes é nosso maior orgulho. Conheça as experiências de mamães que confiaram na Carmem Bezerra para tornar sua gestação ainda mais especial.
          </p>
        </div>
        
        <div className="relative">
          {/* Navigation Buttons */}
          <button 
            onClick={() => scroll('left')} 
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Ver depoimentos anteriores"
          >
            <ChevronLeft className="h-5 w-5 text-brand-purple" />
          </button>
          
          <button 
            onClick={() => scroll('right')} 
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Ver próximos depoimentos"
          >
            <ChevronRight className="h-5 w-5 text-brand-purple" />
          </button>
          
          {/* Testimonials Slider */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-6 py-6 px-4 -mx-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonialsData.map((testimonial, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-full md:w-[350px] lg:w-[400px]"
              >
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
