import classnames from "classnames";

export interface HeaderProps {
  title: string;
  layout: "default" | "slim";
}

const Header = ({ title, layout = "default" }: HeaderProps) => {
  return (
    <div className={classnames("header", {
      "header--slim": layout === "slim",
    })}>
      <h1 className="title">{title}</h1>
    </div>
  );
};

export default Header;
