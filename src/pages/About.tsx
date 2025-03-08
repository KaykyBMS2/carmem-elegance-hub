
import { useRef, useEffect } from 'react';
import { Award, Users, Star, Clock, Calendar, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-8');
            }, index * 150);
            
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      timelineItems.forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-brand-purple/10 to-brand-purple/5 py-16">
          <div className="main-container relative z-10">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              Sobre a Carmem Bezerra
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Conheça nossa história e como nos tornamos referência em moda para gestantes.
            </p>
          </div>
          
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl"></div>
            <div className="absolute top-32 -left-12 w-48 h-48 bg-brand-purple/5 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        {/* Our Story */}
        <section className="py-16 bg-white/30 backdrop-blur-sm">
          <div className="main-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative">
                <div className="relative z-10 overflow-hidden rounded-xl border-8 border-white shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1607290809715-d6dbb4261eaa?q=80&w=2574&auto=format&fit=crop" 
                    alt="Carmem Bezerra - Fundadora" 
                    className="w-full h-[500px] object-cover"
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
                <h2 className="text-3xl font-montserrat font-semibold">Nossa História</h2>
                <p className="text-lg">
                  Nascida do sonho de transformar a experiência da maternidade em momentos únicos e inesquecíveis, a Carmem Bezerra iniciou sua trajetória em 2015 com uma visão clara: proporcionar elegância, conforto e exclusividade para gestantes.
                </p>
                <p className="text-muted-foreground">
                  Nossa fundadora, apaixonada por moda e pela delicadeza da maternidade, percebeu a falta de opções que valorizassem esse momento tão especial na vida de uma mulher. Com dedicação e um olhar atento aos detalhes, desenvolvemos uma coleção exclusiva de vestidos e acessórios que celebram a beleza da gestação.
                </p>
                <p className="text-muted-foreground">
                  Ao longo de 8 anos, ajudamos mais de 900 gestantes a eternizarem suas gestações com nossos vestidos exclusivos para ensaios fotográficos. Cada peça é cuidadosamente criada pensando no conforto e na beleza, tornando os momentos ainda mais especiais.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Values and Stats */}
        <section className="py-16">
          <div className="main-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Values */}
              <div>
                <h2 className="text-3xl font-montserrat font-semibold mb-8">Nossos Valores</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="glass-card p-6 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
                      <Heart className="h-5 w-5 text-brand-purple" />
                    </div>
                    <h3 className="text-lg font-montserrat font-medium mb-2">Amor</h3>
                    <p className="text-muted-foreground text-sm">
                      Colocamos amor em cada detalhe, desde a seleção dos tecidos até o atendimento personalizado.
                    </p>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
                      <Star className="h-5 w-5 text-brand-purple" />
                    </div>
                    <h3 className="text-lg font-montserrat font-medium mb-2">Qualidade</h3>
                    <p className="text-muted-foreground text-sm">
                      Compromisso com a excelência em cada peça, garantindo satisfação e conforto.
                    </p>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
                      <Users className="h-5 w-5 text-brand-purple" />
                    </div>
                    <h3 className="text-lg font-montserrat font-medium mb-2">Empatia</h3>
                    <p className="text-muted-foreground text-sm">
                      Entendemos as necessidades de cada gestante, oferecendo uma experiência acolhedora.
                    </p>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
                      <Award className="h-5 w-5 text-brand-purple" />
                    </div>
                    <h3 className="text-lg font-montserrat font-medium mb-2">Exclusividade</h3>
                    <p className="text-muted-foreground text-sm">
                      Criamos peças únicas que valorizam a beleza da gestação e tornam cada momento inesquecível.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div>
                <h2 className="text-3xl font-montserrat font-semibold mb-8">Nossa Trajetória</h2>
                
                <div className="glass-card p-8 rounded-xl">
                  <div className="grid grid-cols-2 gap-y-8">
                    <div className="text-center">
                      <h3 className="text-5xl font-montserrat font-bold text-brand-purple">8+</h3>
                      <p className="text-muted-foreground mt-2">Anos de Experiência</p>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-5xl font-montserrat font-bold text-brand-purple">900+</h3>
                      <p className="text-muted-foreground mt-2">Clientes Atendidas</p>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-5xl font-montserrat font-bold text-brand-purple">200+</h3>
                      <p className="text-muted-foreground mt-2">Vestidos Exclusivos</p>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-5xl font-montserrat font-bold text-brand-purple">50+</h3>
                      <p className="text-muted-foreground mt-2">Parcerias</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Timeline */}
        <section className="py-16 bg-white/30 backdrop-blur-sm" ref={timelineRef}>
          <div className="main-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-montserrat font-semibold mb-4">Nossa História ao Longo dos Anos</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Acompanhe a evolução da Carmem Bezerra desde sua fundação até se tornar referência em moda para gestantes.
              </p>
            </div>
            
            <div className="relative max-w-3xl mx-auto">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-brand-purple/20 transform md:translate-x-[-50%]"></div>
              
              {/* 2015 */}
              <div className="timeline-item opacity-0 translate-y-8 transition-all duration-700 mb-12 md:mb-24 relative md:ml-0 ml-8">
                <div className="flex flex-col md:flex-row items-start">
                  <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                    <div className="glass-card p-6 rounded-xl inline-block">
                      <h3 className="text-xl font-montserrat font-semibold mb-2">2015</h3>
                      <h4 className="text-brand-purple font-medium mb-2">Fundação</h4>
                      <p className="text-sm text-muted-foreground">
                        Carmem Bezerra foi fundada com a missão de tornar a experiência da maternidade ainda mais especial através da moda.
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 order-1 md:order-2 flex md:justify-start justify-center mb-4 md:mb-0">
                    <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white relative z-10">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 2017 */}
              <div className="timeline-item opacity-0 translate-y-8 transition-all duration-700 mb-12 md:mb-24 relative md:ml-0 ml-8">
                <div className="flex flex-col md:flex-row-reverse items-start">
                  <div className="md:w-1/2 md:pl-12 order-2">
                    <div className="glass-card p-6 rounded-xl inline-block">
                      <h3 className="text-xl font-montserrat font-semibold mb-2">2017</h3>
                      <h4 className="text-brand-purple font-medium mb-2">Expansão</h4>
                      <p className="text-sm text-muted-foreground">
                        Iniciamos nossa coleção de vestidos para ensaios fotográficos, tornando-nos pioneiras no segmento.
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 order-1 flex md:justify-end justify-center mb-4 md:mb-0">
                    <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white relative z-10">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 2019 */}
              <div className="timeline-item opacity-0 translate-y-8 transition-all duration-700 mb-12 md:mb-24 relative md:ml-0 ml-8">
                <div className="flex flex-col md:flex-row items-start">
                  <div className="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                    <div className="glass-card p-6 rounded-xl inline-block">
                      <h3 className="text-xl font-montserrat font-semibold mb-2">2019</h3>
                      <h4 className="text-brand-purple font-medium mb-2">Lançamento de Produtos</h4>
                      <p className="text-sm text-muted-foreground">
                        Ampliamos nosso catálogo com produtos para bebês e acessórios para a maternidade.
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 order-1 md:order-2 flex md:justify-start justify-center mb-4 md:mb-0">
                    <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white relative z-10">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 2022 */}
              <div className="timeline-item opacity-0 translate-y-8 transition-all duration-700 relative md:ml-0 ml-8">
                <div className="flex flex-col md:flex-row-reverse items-start">
                  <div className="md:w-1/2 md:pl-12 order-2">
                    <div className="glass-card p-6 rounded-xl inline-block">
                      <h3 className="text-xl font-montserrat font-semibold mb-2">2022</h3>
                      <h4 className="text-brand-purple font-medium mb-2">Reconhecimento</h4>
                      <p className="text-sm text-muted-foreground">
                        Atingimos a marca de mais de 900 clientes atendidas, consolidando nossa posição como referência no mercado.
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 order-1 flex md:justify-end justify-center mb-4 md:mb-0">
                    <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white relative z-10">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team */}
        <section className="py-16">
          <div className="main-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-montserrat font-semibold mb-4">Nossa Equipe</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conheça os profissionais dedicados que fazem da Carmem Bezerra uma experiência única.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="relative h-72">
                  <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2574&auto=format&fit=crop" 
                    alt="Carmem Bezerra - Fundadora" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl font-montserrat font-semibold">Carmem Bezerra</h3>
                    <p className="text-white/80 text-sm">Fundadora & CEO</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground text-sm">
                    Com ampla experiência em moda e uma paixão pela maternidade, Carmem fundou a empresa com a missão de valorizar a beleza das gestantes.
                  </p>
                </div>
              </div>
              
              {/* Team Member 2 */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="relative h-72">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2522&auto=format&fit=crop" 
                    alt="Ana Silva - Diretora Criativa" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl font-montserrat font-semibold">Ana Silva</h3>
                    <p className="text-white/80 text-sm">Diretora Criativa</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground text-sm">
                    Responsável pelo design exclusivo dos vestidos, Ana combina elegância e conforto em cada peça, criando looks únicos.
                  </p>
                </div>
              </div>
              
              {/* Team Member 3 */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="relative h-72">
                  <img 
                    src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=2574&auto=format&fit=crop" 
                    alt="Marcela Costa - Gerente de Atendimento" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl font-montserrat font-semibold">Marcela Costa</h3>
                    <p className="text-white/80 text-sm">Gerente de Atendimento</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground text-sm">
                    Com seu atendimento acolhedor e personalizado, Marcela garante que cada cliente tenha uma experiência memorável.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
