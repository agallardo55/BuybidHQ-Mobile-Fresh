
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: id } });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "#howitworks" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                alt="BuyBidHQ Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.href.startsWith('#')) {
                    handleScroll(item.href.substring(1));
                  } else {
                    navigate(item.href);
                  }
                }}
                className="text-gray-600 hover:text-accent transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
            <Button 
              variant="default" 
              className="bg-accent hover:bg-accent/90"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.href.startsWith('#')) {
                    handleScroll(item.href.substring(1));
                  } else {
                    navigate(item.href);
                  }
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-accent hover:bg-gray-50"
              >
                {item.name}
              </a>
            ))}
            <Button 
              variant="default" 
              className="w-full bg-accent hover:bg-accent/90 mt-4"
              onClick={() => {
                navigate('/signin');
                setIsOpen(false);
              }}
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
