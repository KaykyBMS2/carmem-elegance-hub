
import { useState } from 'react';
import { Send, Map, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      toast({
        title: "Mensagem enviada!",
        description: "Agradecemos seu contato! Retornaremos em breve.",
      });
      
      // Reset form after submission
      setTimeout(() => {
        setIsSubmitted(false);
        (e.target as HTMLFormElement).reset();
      }, 2000);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-brand-purple/10 to-brand-purple/5 py-16">
          <div className="main-container relative z-10">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              Entre em Contato
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Estamos prontos para atender você e tornar sua experiência com a Carmem Bezerra ainda mais especial.
            </p>
          </div>
          
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl"></div>
            <div className="absolute top-32 -left-12 w-48 h-48 bg-brand-purple/5 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="main-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-montserrat font-semibold mb-6">Informações de Contato</h2>
              
              <div className="space-y-6 mb-12">
                <div className="glass-card p-6 flex items-start">
                  <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-montserrat font-medium mb-1">Telefone</h3>
                    <p className="text-muted-foreground">(00) 00000-0000</p>
                    <p className="text-muted-foreground">(00) 00000-0000</p>
                  </div>
                </div>
                
                <div className="glass-card p-6 flex items-start">
                  <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-montserrat font-medium mb-1">Email</h3>
                    <p className="text-muted-foreground">contato@carmembezerra.com</p>
                    <p className="text-muted-foreground">atendimento@carmembezerra.com</p>
                  </div>
                </div>
                
                <div className="glass-card p-6 flex items-start">
                  <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                    <Map className="h-5 w-5 text-brand-purple" />
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
                
                <div className="glass-card p-6 flex items-start">
                  <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-montserrat font-medium mb-1">Horário de Funcionamento</h3>
                    <p className="text-muted-foreground">
                      Segunda a Sexta: 9h às 18h<br />
                      Sábado: 9h às 13h<br />
                      Domingo: Fechado
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="glass-card p-3 rounded-xl overflow-hidden h-[300px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.356219550619!2d-43.18058098503517!3d-22.906392785014823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x997f5fd24e0847%3A0x53ade34e723b48d4!2sCentro%2C%20Rio%20de%20Janeiro%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1653441032042!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa da Localização"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-montserrat font-semibold mb-6">Envie-nos uma mensagem</h2>
              
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
