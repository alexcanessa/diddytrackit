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
      <div className="absolute p-7 top-0 right-0 left-0 flex justify-between items-center">
        <BurgerMenuTrigger />
        <SpotifyHeader />
      </div>
      <h1 className="title">{title}</h1>
    </div>
  );
};

export default Header;
