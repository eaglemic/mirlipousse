"use client";
import { useEffect } from "react";

/** Progressive enhancement: navigation, dialogs and cart never wait for motion. */
export default function MotionDesign() {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const hero = document.querySelector<HTMLElement>(".hero-visual");
    let observer: IntersectionObserver | undefined;
    let changes: MutationObserver | undefined;
    let frame = 0;
    const targets = ".age-card,.product-card,.section-intro,.story-art,.story-copy,.values>div,.faq>div,.footer-top>div";
    const clearReveals = () => {
      document.querySelectorAll<HTMLElement>("[data-motion-reveal]").forEach(node => {
        delete node.dataset.motionReveal;
        delete node.dataset.motionVisible;
        delete node.dataset.motionImmediate;
        node.style.removeProperty("--reveal-delay");
      });
    };
    const configure = () => {
      observer?.disconnect(); changes?.disconnect(); clearReveals();
      reset();
      document.documentElement.classList.toggle("motion-enabled", !preference.matches);
      if (preference.matches || typeof IntersectionObserver === "undefined") return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.motionVisible = "true";
          observer?.unobserve(entry.target);
        }
      }, { threshold: 0.08, rootMargin: "0px 0px -18px 0px" });
      const connect = () => {
        document.querySelectorAll<HTMLElement>(targets).forEach((node, index) => {
          if (node.dataset.motionReveal) return;
          node.dataset.motionReveal = "true";
          node.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 65}ms`);
          // Never obscure content already in view, keyboard focus or an anchor target.
          if (node.getBoundingClientRect().top < innerHeight * 0.92 || node.contains(document.activeElement)) node.dataset.motionVisible = "true";
          else observer?.observe(node);
        });
      };
      connect();
      changes = new MutationObserver(connect);
      const main = document.querySelector("main");
      if (main) changes.observe(main, { childList: true, subtree: true });
    };
    const point = (event: PointerEvent) => {
      if (!hero || preference.matches || event.pointerType !== "mouse") return;
      const bounds = hero.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        hero.style.setProperty("--pointer-x", `${x * 7}px`);
        hero.style.setProperty("--pointer-y", `${y * 6}px`);
        hero.style.setProperty("--pointer-r", `${x * 0.7}deg`);
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      for (const key of ["--pointer-x", "--pointer-y", "--pointer-r"]) hero?.style.removeProperty(key);
    };
    const revealFocus = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        const parent = event.target.closest<HTMLElement>("[data-motion-reveal]");
        if (parent) { parent.dataset.motionImmediate = "true"; parent.dataset.motionVisible = "true"; observer?.unobserve(parent); }
      }
    };
    configure();
    preference.addEventListener("change", configure);
    hero?.addEventListener("pointermove", point, { passive: true });
    hero?.addEventListener("pointerleave", reset, { passive: true });
    document.addEventListener("focusin", revealFocus);
    return () => {
      preference.removeEventListener("change", configure);
      hero?.removeEventListener("pointermove", point);
      hero?.removeEventListener("pointerleave", reset);
      document.removeEventListener("focusin", revealFocus);
      observer?.disconnect(); changes?.disconnect(); reset(); clearReveals();
      document.documentElement.classList.remove("motion-enabled");
    };
  }, []);
  return null;
}

export function flyToBag(image: string, color: string, button: HTMLElement) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches || button.closest("dialog")) return;
  const target = document.querySelector(".cart-toggle");
  if (!target || typeof Element.prototype.animate !== "function") return;
  const from = button.getBoundingClientRect(), to = target.getBoundingClientRect();
  const flying = document.createElement("img");
  flying.src = image; flying.alt = ""; flying.setAttribute("aria-hidden", "true");
  Object.assign(flying.style, { position: "fixed", left: `${from.left + from.width / 2 - 28}px`, top: `${from.top + from.height / 2 - 28}px`, width: "56px", height: "56px", borderRadius: "50%", background: color, padding: "7px", pointerEvents: "none", zIndex: "80", boxShadow: "0 8px 24px #243d3320" });
  document.body.appendChild(flying);
  const dx = to.left + to.width / 2 - from.left - from.width / 2;
  const dy = to.top + to.height / 2 - from.top - from.height / 2;
  const animation = flying.animate([
    { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
    { transform: `translate3d(${dx * 0.55}px,${dy * 0.55 - 55}px,0) scale(.8)`, opacity: 0.95, offset: 0.55 },
    { transform: `translate3d(${dx}px,${dy}px,0) scale(.12)`, opacity: 0.1 },
  ], { duration: 650, easing: "cubic-bezier(.24,.64,.3,1)" });
  const stop = () => { if (preference.matches) animation.cancel(); };
  const cleanup = () => { flying.remove(); preference.removeEventListener("change", stop); };
  preference.addEventListener("change", stop);
  animation.finished.then(cleanup, cleanup);
  setTimeout(cleanup, 900);
}
