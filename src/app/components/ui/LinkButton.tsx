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
      className="bg-primary-500 w-80 rounded-lg px-1 py-3 text-center text-lg font-bold text-black"
      href={href}
    >
      {children}
    </Link>
  );
};
