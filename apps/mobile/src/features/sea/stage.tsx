import { createContext, useContext, type ReactNode } from "react";
import type { CritterKind } from "../../data/illustrations";

/** Kinds living in the current tank; null outside a tank (everything shows). */
export const OnStage = createContext<Set<CritterKind> | null>(null);

/** False when the diver hasn't met this critter yet — it stays out of the tank. */
export function useOnStage(kind: CritterKind) {
  const set = useContext(OnStage);
  return !set || set.has(kind);
}

export function InTank({ kind, children }: { kind: CritterKind; children: ReactNode }) {
  return useOnStage(kind) ? <>{children}</> : null;
}
