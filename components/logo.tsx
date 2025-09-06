import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const Logo: React.FC<Props> = ({ className }) => (
  <img
    src="/logo.png"
    alt="Cinematon logo"
    className={cn("h-14 mr-2", className)}
  />
);

export default Logo;
