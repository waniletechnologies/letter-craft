import Image from "next/image";

export const BureauHeader: React.FC<{
  src: string;
  alt: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ src, alt, checked, onToggle, disabled = false }) => (
  <div className="flex items-center justify-center py-3 gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onToggle(e.target.checked)}
      disabled={disabled}
      className={`h-4 w-4 accent-[#2563EB] border-gray-300 rounded flex-shrink-0 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    />
    <Image
      src={src}
      alt={alt}
      width={90}
      height={24}
      className={disabled ? "opacity-50" : ""}
    />
  </div>
);
