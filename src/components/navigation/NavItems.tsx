
import { Link, useLocation } from "react-router-dom";

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
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className={className}>
      {items.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className="relative py-1 group"
          onClick={onClick}
        >
          <span
            className={`text-base font-medium tracking-normal transition-colors ${
              isActive(item.href)
                ? "text-brand"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {item.name}
          </span>
          {isActive(item.href) && (
            <div className="absolute -bottom-[14px] left-0 right-0 h-0.5 bg-brand rounded-full" />
          )}
        </Link>
      ))}
    </div>
  );
};

export default NavItems;
