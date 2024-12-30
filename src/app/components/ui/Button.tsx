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
      className="rounded-lg bg-amber-500 px-6 py-3 text-center text-lg font-bold text-black"
    >
      {children}
    </button>
  );
};
export default Button;
