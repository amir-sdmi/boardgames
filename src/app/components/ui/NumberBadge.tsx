export default function NumberBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-badge absolute -right-2 -top-2 z-10 h-6 w-6 rounded-full text-center text-sm font-semibold text-white">
      {children}
    </div>
  );
}
