import JalizCoinFrontIcon from "@/app/components/ui/icons/JalizCoinFrontIcon";
import NumberBadge from "@/app/components/ui/NumberBadge";

export default function DecCard({
  deckLength,
  type,
}: {
  deckLength?: number;
  type?: "discard";
}) {
  return (
    <div className="relative h-40 w-28">
      {deckLength && <NumberBadge>{deckLength}</NumberBadge>}
      {type === "discard" && (
        <div className="absolute z-10 h-full w-full rounded-md bg-black opacity-30" />
      )}

      <div className="relative h-full w-full rounded-md bg-white p-2">
        <div className="relative flex h-full w-full items-center justify-center rounded-md bg-[#8BCEDB]">
          <div className="absolute">
            <JalizCoinFrontIcon />
          </div>
          <p
            className="absolute text-[15px] text-[#FDD835]"
            style={{
              WebkitTextStrokeWidth: "1px",
              WebkitTextStrokeColor: "#F6931D",
            }}
          >
            JALIZ
          </p>
        </div>
      </div>
    </div>
  );
}
