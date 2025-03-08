
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/70 backdrop-blur-sm border-t border-white/20">
      <div className="main-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Information */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-10 h-10 mr-3">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path 
                    d="M50 7C25.1 7 5 27.1 5 52s20.1 45 45 45s45-20.1 45-45S74.9 7 50 7zm0 80c-19.3 0-35-15.7-35-35s15.7-35 35-35s35 15.7 35 35s-15.7 35-35 35z" 
                    fill="#b982ff"
                  />
                  <path 
                    d="M50 22c-16.5 0-30 13.5-30 30s13.5 30 30 30s30-13.5 30-30s-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20s20 9 20 20s-9 20-20 20z" 
                    fill="#b982ff" 
                    opacity="0.6"
                  />
                  <circle cx="50" cy="52" r="10" fill="#b982ff" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-bold tracking-tight">Carmem Bezerra</h3>
                <p className="text-xs text-muted-foreground -mt-1">Elegância Materna</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Transformando a maternidade em momentos inesquecíveis com elegância e exclusividade. Nossos vestidos e produtos celebram a beleza única de cada gestante.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple hover:bg-brand-purple hover:text-white transition-colors duration-300"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple hover:bg-brand-purple hover:text-white transition-colors duration-300"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="mailto:contato@carmembezerra.com" 
                className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple hover:bg-brand-purple hover:text-white transition-colors duration-300"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-montserrat font-semibold mb-6">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-brand-purple transition-colors duration-200">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-brand-purple transition-colors duration-200">
                  Loja
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-muted-foreground hover:text-brand-purple transition-colors duration-200">
                  Ensaios Fotográficos
                </Link>
              </li>
              <li>
                <Link to="/#about" className="text-muted-foreground hover:text-brand-purple transition-colors duration-200">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/#contact" className="text-muted-foreground hover:text-brand-purple transition-colors duration-200">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-montserrat font-semibold mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-brand-purple mr-3 mt-0.5" />
                <span className="text-muted-foreground">
                  Av. Exemplo, 1234, Bairro, Cidade - Estado, CEP 00000-000
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-brand-purple mr-3" />
                <span className="text-muted-foreground">(00) 00000-0000</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-brand-purple mr-3" />
                <span className="text-muted-foreground">contato@carmembezerra.com</span>
              </li>
              <li className="mt-6">
                <h4 className="text-sm font-medium mb-2">Horário de Atendimento</h4>
                <p className="text-muted-foreground">
                  Segunda a Sexta: 9h às 18h<br />
                  Sábado: 10h às 14h
                </p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Carmem Bezerra. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-brand-purple transition-colors duration-200">
              Privacidade
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-brand-purple transition-colors duration-200">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
