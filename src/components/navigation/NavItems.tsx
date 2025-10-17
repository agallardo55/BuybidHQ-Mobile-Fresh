
import { Link } from "react-router-dom";

interface NavItem {
  name: string;
  href: string;
}

interface NavItemsProps {
  items: NavItem[];
  onClick?: () => void;
  className?: string;
}

const NavItems = ({ items, onClick, className = "" }: NavItemsProps) => {
  return (
    <div className={className}>
      {items.map((item) => (
        <div key={item.name}>
          <Link
            to={item.href}
            className="text-gray-700 hover:text-accent transition-colors"
            onClick={onClick}
          >
            {item.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default NavItems;
