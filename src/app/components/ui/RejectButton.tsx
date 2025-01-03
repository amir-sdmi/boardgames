type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

const RejectButton = ({ children, onClick, disabled = false }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-badge w-full rounded-lg px-1 py-1 text-center text-xs font-bold text-white"
    >
      {children}
    </button>
  );
};
export default RejectButton;
