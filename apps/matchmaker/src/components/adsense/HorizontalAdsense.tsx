import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export function HorizontalAdsense() {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-2182485735586891"
      data-ad-slot="5494035370"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
