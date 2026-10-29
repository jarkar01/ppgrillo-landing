import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandIdentity } from "@/components/brand-identity";
import {
  AnimatedChat,
  type ChatMessage,
} from "@/components/campaign/animated-chat";
import { CampaignPlans } from "@/components/campaign/campaign-plans";
import { StartFreeButton } from "@/components/web/start-free";
import { FREE_LIFETIME_TASKS } from "@/lib/plans";

export type { ChatMessage };

type CampaignLandingProps = {
  headline: string;
  subhead: string;
  chat: ChatMessage[];
  footerHref: string;
  footerLabel: string;
  ctaLabel?: string;
  ctaNote?: string;
  compact?: boolean;
};

export function CampaignLanding({
  headline,
  subhead,
  chat,
  footerHref,
  footerLabel,
  ctaLabel = "Empezar gratis",
  ctaNote = `Solo nombre y apellido • Sin tarjeta ni teléfono • ${FREE_LIFETIME_TASKS} tareas gratis de por vida`,
  compact = false,
}: CampaignLandingProps) {
  const isAnchor = footerHref.startsWith("#");

  return (
    <>
      <section className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-between gap-3 px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:max-w-lg sm:justify-center sm:gap-4">
        <header>
          <BrandIdentity />
        </header>

        <div
          className={`flex flex-col items-center ${compact ? "gap-1.5 sm:gap-3" : "gap-3"}`}
        >
          <h1
            className={`font-display font-extrabold leading-tight tracking-tight text-balance text-slate-900 sm:text-4xl ${
              compact ? "text-2xl" : "text-3xl"
            }`}
          >
            {headline}
          </h1>
          <p
            className={`text-pretty text-slate-600 sm:text-lg ${
              compact
                ? "text-sm leading-snug sm:leading-relaxed"
                : "text-base leading-relaxed"
            }`}
          >
            {subhead}
          </p>
        </div>

        <AnimatedChat messages={chat} fitViewport={compact} />

        <div className="flex w-full max-w-md flex-col items-center gap-2.5">
          <StartFreeButton>{ctaLabel}</StartFreeButton>
          <a
            href="#planes"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] bg-emerald-50/60 px-5 py-2.5 text-[15px] leading-snug font-semibold text-balance text-[#128C7E] transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]"
          >
            Ver planes
          </a>
          <p className="text-sm font-medium text-pretty text-slate-500">
            {ctaNote}
          </p>
        </div>

        {isAnchor ? (
          <a
            href={footerHref}
            className="group text-sm text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
          >
            {footerLabel}
          </a>
        ) : (
          <Link
            href={footerHref}
            className="group inline-flex items-center gap-1 text-sm text-pretty text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
          >
            {footerLabel}
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </section>
      <CampaignPlans />
    </>
  );
}
