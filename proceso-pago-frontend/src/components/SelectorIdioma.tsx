"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

export default function LanguageSelector() {
  const initRef = useRef(false);

  const tryInit = () => {
    if (initRef.current) return;
    if (typeof (window as any).initMultiLang === "function") {
      (window as any).initMultiLang({ pageLanguage: "es" });
      initRef.current = true;
    }
  };

  useEffect(() => {
    const timer = setTimeout(tryInit, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div id="multilang" className="p-4" />
      <Script
        src="https://cdn.jsdelivr.net/npm/google-translate-pure-js@1.0.9/js/multilang.js"
        strategy="lazyOnload"
        onLoad={tryInit}
      />
    </>
  );
}