"use client";

import { useEffect, useRef, useState } from "react";
import type { InstallPlatform, InstallPromptEvent } from "./install-guide-dialog";

export const SHARE_DATA = {
  title: "PpGrillo",
  text: "Conoce PpGrillo: tu tutor que te ayuda a resolver tus tareas paso a paso, sin darte las respuestas.",
  url: "https://www.ppgrillo.io",
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export function useInstallAndShare() {
  const [copied, setCopied] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("desktop");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setInstalled(isStandalone());

    if ("serviceWorker" in navigator && window.self === window.top) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setInstallEvent(null);
      dialogRef.current?.close();
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(SHARE_DATA);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(SHARE_DATA.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copia este enlace para compartir PpGrillo:", SHARE_DATA.url);
    }
  }

  function openGuide() {
    setPlatform(detectPlatform());
    dialogRef.current?.showModal();
  }

  async function nativeInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") {
      setInstalled(true);
      dialogRef.current?.close();
    }
  }

  return {
    copied,
    installed,
    platform,
    dialogRef,
    canPromptInstall: installEvent !== null,
    share,
    openGuide,
    nativeInstall,
  };
}
