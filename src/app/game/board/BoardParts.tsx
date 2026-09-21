import Image from "next/image";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Coins, Sprout } from "lucide-react";
import { cardData } from "../utils/cardData";
import type { CardsType } from "@/types/gameTypes";
import s from "./board.module.css";

export function BoardButton({
  tone = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "quiet" | "danger";
}) {
  return (
    <button
      type="button"
      className={`${s.button} ${s[tone]} ${className}`}
      {...props}
    />
  );
}
export function CropArt({
  id,
  small = false,
}: {
  id: number;
  small?: boolean;
}) {
  const crop = cardData.find((c) => c.id === id);
  return crop ? (
    <Image
      src={crop.svg}
      alt=""
      width={small ? 28 : 62}
      height={small ? 32 : 74}
      className={small ? s.smallCrop : s.cropArt}
    />
  ) : (
    <Sprout aria-hidden="true" />
  );
}
export const cropName = (id: number) =>
  cardData.find((c) => c.id === id)?.name ?? "Unknown crop";
export function CoinAmount({ amount }: { amount: number }) {
  return (
    <span className={s.coin}>
      <Coins size={16} aria-hidden="true" />
      {amount}
      <span className={s.srOnly}> coins</span>
    </span>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.sectionHeading}>
      <div>
        <span className={s.eyebrow}>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function CardList({
  cards,
  empty = "Nothing requested",
}: {
  cards: CardsType[];
  empty?: string;
}) {
  if (!cards.length) return <p className={s.muted}>{empty}</p>;
  return (
    <ul className={s.summaryList}>
      {cards.map((c, i) => (
        <li key={`${c.id}:${i}`}>
          <CropArt id={c.id} small />
          <span className={s.cropName}>{cropName(c.id)}</span>
          <strong>×{c.quantity}</strong>
        </li>
      ))}
    </ul>
  );
}
