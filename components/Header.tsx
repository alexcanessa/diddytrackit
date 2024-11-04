import classnames from "classnames";
import SpotifyHeader from "@/components/SpotifyHeader";
import { BurgerMenuTrigger } from "@/components/BurgerMenu";

export interface HeaderProps {
  title: string;
  layout: "default" | "slim";
}

const Header = ({ title, layout = "default" }: HeaderProps) => {
  return (
    <div
      className={classnames("header relative", {
        "header--slim": layout === "slim",
      })}
    >
      <BurgerMenuTrigger className="absolute top-8 left-6" />
      <SpotifyHeader className="absolute top-7 right-6" />
      <h1 className="title">{title}</h1>
    </div>
  );
};

export default Header;
