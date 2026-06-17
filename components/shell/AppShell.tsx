import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.viewport}>{children}</div>
      <BottomNav />
    </div>
  );
}
