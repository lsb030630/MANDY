"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Hammer, MessageSquare } from "lucide-react";
import styles from "./BottomNav.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Compass;
  match: (path: string) => boolean;
};

const items: NavItem[] = [
  { href: "/", label: "탐색", icon: Compass, match: (p) => p === "/" || p.startsWith("/store") },
  { href: "/board", label: "게시판", icon: MessageSquare, match: (p) => p.startsWith("/board") },
  { href: "/showcase", label: "제작후기", icon: Hammer, match: (p) => p.startsWith("/showcase") },
  { href: "/bookmarks", label: "북마크", icon: Bookmark, match: (p) => p.startsWith("/bookmarks") },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className={styles.nav} aria-label="주요 메뉴">
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);

        return (
          <Link
            key={href}
            href={href}
            className={`${styles.item} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className={styles.icon}>
              <Icon size={22} strokeWidth={active ? 2.3 : 1.8} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
