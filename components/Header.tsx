import classnames from "classnames";
import SpotifyHeader from "@/components/SpotifyHeader";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export interface HeaderProps {
  title: string;
  layout: "default" | "slim";
}

const Header = ({ title, layout = "default" }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={classnames("header relative", {
        "header--slim": layout === "slim",
      })}
    >
      {pathname !== "/" && (
        <button
          onClick={() => router.push("/")}
          className="absolute top-1/2 left-4 -translate-y-1/2 text-indigo-200 hover:text-indigo-500 focus:outline-none"
          aria-label="Go back to Home"
        >
          <FaArrowLeft className="w-6 h-6" />
        </button>
      )}
      <SpotifyHeader
        className={classnames("absolute top-0 left-0", {
          "h-full": layout === "slim",
        })}
      />
      <h1 className="title">
        <Link href="/">{title}</Link>
      </h1>
    </div>
  );
};

export default Header;
