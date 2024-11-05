// components/Chip.tsx
import classnames from "classnames";

type ChipProps = {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
};

const Chip = ({ label, isSelected, onClick, disabled = false }: ChipProps) => (
  <button
    onClick={!disabled ? onClick : undefined}
    disabled={disabled}
    className={classnames(
      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
      {
        "bg-[#803977] text-white": isSelected && !disabled,
        "bg-gray-200 text-gray-700 hover:bg-gray-300": !isSelected && !disabled,
        "bg-gray-100 text-gray-400 cursor-not-allowed": disabled,
      }
    )}
  >
    {label}
  </button>
);

export default Chip;
