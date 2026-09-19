import Image from "next/image";
import homepageBG from "../../../public/homepageBG.png";

/** Shared decorative scene for the homepage and lobby. */
export function GameBackdrop() {
  return (
    <>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[rgba(13,13,13,0.7)] via-[rgba(25,25,25,0.7)] to-[rgba(115,115,115,0.7)]" />
      <Image
        src={homepageBG}
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
        className="-z-20"
      />
    </>
  );
}
