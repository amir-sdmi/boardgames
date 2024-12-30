import Image from "next/image";
import logo from "../../../../public/Logo.png";

export default function Logo({ width = 472, height = 189 }) {
  return (
    <div>
      <Image src={logo} alt="logo" width={width} height={height} />
    </div>
  );
}
