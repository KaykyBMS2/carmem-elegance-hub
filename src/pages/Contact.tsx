
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white/80 to-brand-purple/5">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-purple-50 to-indigo-50 py-24">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 text-gray-800">
              Entre em Contato
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos prontos para atender você e tornar sua experiência com a Carmem Bezerra ainda mais especial.
            </p>
          </div>
          
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl"></div>
            <div className="absolute top-32 -left-12 w-48 h-48 bg-brand-purple/5 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <h2 className="text-2xl font-montserrat font-semibold mb-8 text-gray-800">Informações de Contato</h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md flex items-start transition-all hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-montserrat font-medium mb-1 text-gray-800">Telefone</h3>
                    <p className="text-muted-foreground">(00) 00000-0000</p>
                    <p className="text-muted-foreground">(00) 00000-0000</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md flex items-start transition-all hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-montserrat font-medium mb-1 text-gray-800">Email</h3>
                    <p className="text-muted-foreground">contato@carmembezerra.com</p>
                    <p className="text-muted-foreground">atendimento@carmembezerra.com</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md flex items-start transition-all hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Map className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-montserrat font-medium mb-1 text-gray-800">Endereço</h3>
                    <p className="text-muted-foreground">
                      Av. Exemplo, 1234<br />
                      Bairro, Cidade - Estado<br />
                      CEP: 00000-000
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md flex items-start transition-all hover:shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-montserrat font-medium mb-1 text-gray-800">Horário de Funcionamento</h3>
                    <p className="text-muted-foreground">
                      Segunda a Sexta: 9h às 18h<br />
                      Sábado: 9h às 13h<br />
                      Domingo: Fechado
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-montserrat font-semibold mb-6 text-gray-800">Envie-nos uma mensagem</h2>
                
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-montserrat font-medium mb-3 text-gray-800">Mensagem Enviada!</h4>
                    <p className="text-muted-foreground text-lg max-w-md">
                      Obrigado pelo seu contato! Nossa equipe irá retornar em breve.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
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
                        <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
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
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2 text-gray-700">
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
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700">
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
                      className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-medium py-3 px-6 rounded-md transition-all flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
          
          {/* Map */}
          <div className="mt-16 bg-white p-3 rounded-xl shadow-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.356219550619!2d-43.18058098503517!3d-22.906392785014823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x997f5fd24e0847%3A0x53ade34e723b48d4!2sCentro%2C%20Rio%20de%20Janeiro%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1653441032042!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa da Localização"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
