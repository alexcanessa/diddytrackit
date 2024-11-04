"use client";

import classnames from "classnames";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSpotify } from "@/components/SpotifyContext";

type BurgerMenuContextProps = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const BurgerMenuContext = createContext<BurgerMenuContextProps | undefined>(
  undefined
);

export const BurgerMenuProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <BurgerMenuContext.Provider
      value={{ isOpen, openMenu, closeMenu, toggleMenu }}
    >
      {children}
    </BurgerMenuContext.Provider>
  );
};

export const useBurgerMenu = () => {
  const context = useContext(BurgerMenuContext);
  if (!context) {
    throw new Error("useBurgerMenu must be used within a BurgerMenuProvider");
  }

  return context;
};

type MenuItem = {
  label: string;
  href: string;
};

export type BurgerMenuWindowProps = {
  menuItems: MenuItem[];
};

const linkClasses = "block py-4 text-xl font-medium  px-2";

export const BurgerMenuWindow = ({ menuItems }: BurgerMenuWindowProps) => {
  const { isOpen, closeMenu } = useBurgerMenu();
  const pathname = usePathname();
  const { userId, logout } = useSpotify();

  return (
    <>
      <div
        className={classnames(
          "px-5 py-20 text-white",
          "bg-black w-2/3 max-w-96 h-full fixed top-0 right-full z-40 transition-transform duration-500",
          {
            "translate-x-full": isOpen,
          }
        )}
      >
        <ul className="flex flex-col w-full">
          {menuItems.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <li
                key={`${label.toLocaleLowerCase().trim()}`}
                className="border-b border-gray-800"
              >
                {isActive ? (
                  <span className={classnames(linkClasses, "text-indigo-500")}>
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    onClick={closeMenu}
                    className={classnames(
                      linkClasses,
                      "hover:text-indigo-500 transition-all duration-200"
                    )}
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        {userId && (
          <div className="absolute bottom-0 left-0 p-5 flex flex-col justify-center items-center w-full">
            <button
              onClick={logout}
              className="px-4 py-1 rounded-full bg-red-500 text-white text-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div
        onClick={closeMenu}
        className={classnames(
          "bg-black w-full h-full fixed top-0 left-0 z-30 opacity-0 transition-opacity pointer-events-none",
          {
            "opacity-60 pointer-events-auto": isOpen,
          }
        )}
      />
    </>
  );
};

type BurgerMenuTriggerProps = {
  className?: string;
};

export const BurgerMenuTrigger = ({ className }: BurgerMenuTriggerProps) => {
  const { isOpen, toggleMenu } = useBurgerMenu();

  return (
    <button
      onClick={toggleMenu}
      aria-label="Toggle menu"
      className={classnames("w-8 h-8 focus:outline-none z-50", className)}
    >
      <div className="relative">
        <div
          className={`absolute top-1/2 w-full h-0.5 bg-current transform transition-transform duration-300 ${
            isOpen ? "rotate-45" : "-translate-y-2"
          }`}
        />
        <div
          className={`absolute top-1/2 w-full h-0.5 bg-current transition-opacity duration-300 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          className={`absolute top-1/2 w-full h-0.5 bg-current transform transition-transform duration-300 ${
            isOpen ? "-rotate-45" : "translate-y-2"
          }`}
        />
      </div>
    </button>
  );
};
