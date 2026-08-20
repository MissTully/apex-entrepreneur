import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * An accessible dropdown for the top navigation.
 *
 * Closes on Escape, on outside click, and on any click inside the panel (so
 * choosing a link dismisses it without every item wiring up its own handler).
 * Focus returns to the trigger on Escape, which is what keyboard users expect
 * and what stops the tab order jumping to the top of the page.
 *
 * Hover is deliberately NOT a trigger: a hover menu is unusable on touch, and a
 * cohort runs on whatever devices people bring.
 */
export default function NavDropdown({
  label,
  children,
  align = "left",
  active = false,
}: {
  label: string;
  children: ReactNode;
  align?: "left" | "right";
  /** Highlight the trigger when the current route lives under this menu. */
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        className={`inline-flex items-center gap-1 text-sm font-medium transition hover:text-glow ${
          active || open ? "text-glow" : "text-foam/80"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          onClick={() => setOpen(false)}
          className={`absolute top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-deep/95 p-1.5 shadow-2xl shadow-abyss/60 backdrop-blur-md animate-fade-up ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
