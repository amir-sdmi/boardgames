import s from "./board/board.module.css";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={s.gameRoute}>{children}</div>;
}
