"use client";

import { useEffect } from "react";

import { sendSlackNotibotMessage } from "~/utils/sendSlackNotibotMessage";

export function PlatformMergedDownloadButton() {
  "use client";

  useEffect(() => {
    sendSlackNotibotMessage(`앱 다운로드 버튼 노출\n${navigator.userAgent}`);
  }, []);

  return (
    <div className="fixed bottom-12 left-0 right-0 flex justify-center p-4">
      <button
        className="bg-primary w-52 rounded-lg p-5 text-2xl font-bold text-white shadow-2xl"
        onClick={() => {
          sendSlackNotibotMessage("앱 다운로드 버튼 클릭");

          if (isIos() || isMac()) {
            return window.open(appStoreUrl, "_blank");
          }

          if (isAndroid() || isWindows()) {
            return window.open(playStoreUrl, "_blank");
          }
        }}
      >
        앱 다운로드
      </button>
    </div>
  );
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

function isMac() {
  return /Mac/.test(navigator.userAgent);
}

function isWindows() {
  return /Windows/.test(navigator.userAgent);
}

const appStoreUrl =
  "https://apps.apple.com/us/app/%ED%94%8C%EB%9E%AB%ED%99%94%EC%9D%B4%ED%8A%B8/id6470218441";
const playStoreUrl =
  "https://play.google.com/store/apps/details?id=cafe.flatwhite";
