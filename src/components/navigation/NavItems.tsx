
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="text-gray-700 hover:text-accent transition-colors cursor-pointer"
              type="button"
              onClick={onClick}
            >
              Marketplace
            </button>
          </TooltipTrigger>
          <TooltipContent sideOffset={5}>
            <p className="font-bold whitespace-nowrap" style={{ color: '#325AE7' }}>Coming Soon!!!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default NavItems;
