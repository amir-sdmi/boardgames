type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

const Button = ({ children, onClick, disabled = false }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg bg-amber-500 px-1 py-1 text-center text-xs font-bold text-white"
    >
      {children}
    </button>
  );
};
export default Button;
