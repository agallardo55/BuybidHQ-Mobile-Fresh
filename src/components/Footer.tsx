
import { Link } from "react-router-dom";

const Footer = () => {
  const directories = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#" },
        { name: "Pricing", href: "#pricing" },
        { name: "How it Works", href: "#how-it-works" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Contact", href: "#contact" },
        { name: "Privacy Policy", href: "#" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "FAQ", href: "#" },
      ]
    }
  ];

  return (
    <footer className="bg-primary text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Trademark */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/5d819dd0-430a-4dee-bdb8-de7c0ea6b46e.png" 
                alt="BuyBidHQ Logo" 
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} BuyBidHQ™. <br />
              All rights reserved.
            </p>
          </div>

          {/* Directory Links */}
          {directories.map((directory) => (
            <div key={directory.title}>
              <h3 className="font-semibold text-lg mb-4">{directory.title}</h3>
              <ul className="space-y-2">
                {directory.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
