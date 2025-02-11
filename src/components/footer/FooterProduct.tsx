
type FooterProductProps = {
  onSectionScroll: (e: React.MouseEvent, sectionId: string) => void;
};

const FooterProduct = ({ onSectionScroll }: FooterProductProps) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Product</h3>
      <ul className="space-y-3">
        <li>
          <button
            onClick={(e) => onSectionScroll(e, 'features')}
            className="text-gray-400 hover:text-white transition-colors text-left"
          >
            Features
          </button>
        </li>
        <li>
          <button
            onClick={(e) => onSectionScroll(e, 'pricing')}
            className="text-gray-400 hover:text-white transition-colors text-left"
          >
            Pricing
          </button>
        </li>
      </ul>
    </div>
  );
};

export default FooterProduct;
