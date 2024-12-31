export default function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-red-700 p-2 text-center font-semibold text-white">
      {children}
    </div>
  );
}
