export default function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-badge rounded-3xl p-2 text-center font-semibold text-white">
      {children}
    </div>
  );
}
