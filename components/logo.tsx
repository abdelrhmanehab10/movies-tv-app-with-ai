import Image from "next/image";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const Logo: React.FC<Props> = ({ className }) => (
  <Image
    src="/logo.png"
    alt="Cinematon logo"
    width={189}
    height={189}
    className={cn("h-14 mr-2", className)}
  />
);

export default Logo;
