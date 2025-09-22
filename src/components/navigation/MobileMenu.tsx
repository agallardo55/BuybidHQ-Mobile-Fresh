
import NavItems from "./NavItems";
import UserActions from "./UserActions";
import { UserData } from "@/hooks/useCurrentUser";

interface MobileMenuProps {
  isOpen: boolean;
  navItems: Array<{ name: string; href: string; }>;
  unreadCount: number;
  onLogout: () => void;
  onClose: () => void;
  currentUser?: UserData | null;
}

const MobileMenu = ({ isOpen, navItems, unreadCount, onLogout, onClose, currentUser }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-b">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <NavItems 
          items={navItems} 
          onClick={onClose}
          className="flex flex-col space-y-1"
        />
        <div className="flex items-center space-x-4 px-3 py-2">
          <UserActions 
            unreadCount={unreadCount}
            onLogout={onLogout}
            onClick={onClose}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
