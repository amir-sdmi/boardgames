import Link from "next/link";

export const LinkButton = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      className="w-80 rounded-lg bg-primary px-1 py-3 text-center text-lg font-bold text-white"
      href={href}
    >
      {children}
    </Link>
  );
};
