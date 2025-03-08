import { useRef, useEffect, useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const ContactSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after submission
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <section ref={sectionRef} id="contact" className="section-padding opacity-0 transition-opacity duration-700">
      <div className="main-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="inline-block">
              <span className="inline-block bg-brand-purple/10 text-brand-purple text-xs tracking-wider px-3 py-1 rounded-full font-medium mb-6">
                CONTATO
              </span>
            </div>
            <h2 className="section-title mb-6">Entre em Contato Conosco</h2>
            <p className="text-lg text-muted-foreground mb-10">
              Estamos prontos para atender você e tornar sua experiência ainda mais especial. Entre em contato para tirar dúvidas, agendar uma visita ou fazer um pedido personalizado.
            </p>
            
            <div className="space-y-8">
              <div className="glass-card p-6 flex items-start">
                <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-purple" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-montserrat font-medium mb-1">Telefone</h3>
                  <p className="text-muted-foreground">(00) 00000-0000</p>
                  <p className="text-muted-foreground">(00) 00000-0000</p>
                </div>
              </div>
              
              <div className="glass-card p-6 flex items-start">
                <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-purple" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-montserrat font-medium mb-1">Email</h3>
                  <p className="text-muted-foreground">contato@carmembezerra.com</p>
                  <p className="text-muted-foreground">atendimento@carmembezerra.com</p>
                </div>
              </div>
              
              <div className="glass-card p-6 flex items-start">
                <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-purple" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-montserrat font-medium mb-1">Endereço</h3>
                  <p className="text-muted-foreground">
                    Av. Exemplo, 1234<br />
                    Bairro, Cidade - Estado<br />
                    CEP: 00000-000
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-montserrat font-semibold mb-6">Envie-nos uma mensagem</h3>
            
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-montserrat font-medium mb-2">Mensagem Enviada!</h4>
                <p className="text-muted-foreground">
                  Obrigado pelo seu contato! Retornaremos em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Assunto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button-primary w-full flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="loader"></div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      <span>Enviar Mensagem</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
