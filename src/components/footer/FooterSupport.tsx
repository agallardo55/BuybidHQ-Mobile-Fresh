
type FooterSupportProps = {
  onContactClick: (e: React.MouseEvent) => void;
  onShowTerms: () => void;
  onShowPrivacy: () => void;
};

const FooterSupport = ({ onContactClick, onShowTerms, onShowPrivacy }: FooterSupportProps) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Support</h3>
      <ul className="space-y-3">
        <li>
          <button
            onClick={onContactClick}
            className="text-gray-400 hover:text-white transition-colors text-left"
          >
            Contact Us
          </button>
        </li>
        <li>
          <button
            onClick={onShowTerms}
            className="text-gray-400 hover:text-white transition-colors text-left"
          >
            Terms of Service
          </button>
        </li>
        <li>
          <button
            onClick={onShowPrivacy}
            className="text-gray-400 hover:text-white transition-colors text-left"
          >
            Privacy Policy
          </button>
        </li>
      </ul>
    </div>
  );
};

export default FooterSupport;
