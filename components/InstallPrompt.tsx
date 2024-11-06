"use client";

import { useEffect, useState } from "react";
import { FiPlusCircle, FiX, FiShare } from "react-icons/fi";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    setIsAndroid(/android/i.test(userAgent));
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleInstallClick = () => {
    if (isAndroid && deferredPrompt) {
      // @ts-expect-error: defferedPrompt is not nullable
      deferredPrompt.prompt();
      setDeferredPrompt(null);
    } else if (isIOS) {
      // On iOS, expand to show instructions
      setIsExpanded((prev) => !prev);
    }
  };
  // Show only on Android and iOS, and if not already installed
  if (isStandalone || (!isIOS && !isAndroid)) return null;

  return (
    <div
      onClick={handleInstallClick}
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2e2b5f] text-white p-4 rounded-full shadow-lg max-w-sm w-auto text-center z-50 transition-all cursor-pointer ${
        isExpanded ? "py-6" : "py-4"
      }`}
    >
      <div className="flex items-center justify-center">
        {isExpanded ? (
          <FiX className="mr-2" size={18} />
        ) : (
          <FiPlusCircle className="mr-2" size={18} />
        )}
        <span className="text-sm font-medium">Install App</span>
      </div>
      {isExpanded && isIOS && (
        <div className="mt-2 text-xs text-gray-200">
          <p className="flex items-center justify-center">
            Tap <FiShare className="mx-1" size={16} /> then &quot;Add to Home
            Screen&quot;
          </p>
        </div>
      )}
    </div>
  );
}
