"use client";

import NextLink from "next/link";
import { BuildingIcon, ClockIcon } from "@/components/shared/Icons";
import { Span } from "@/components/styled/Span";
import { APP_NAME } from "@/constants/global";
import useSidebarNavigation from "@/hooks/useSidebarNavigation";
import type { NavigationIcon } from "@/interfaces/navigation";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

const ICONS: Record<NavigationIcon, typeof ClockIcon> = {
  clients: BuildingIcon,
  timeEntries: ClockIcon,
};

const Sidebar = () => {
  const items = useSidebarNavigation();

  return (
    <nav aria-label="Main navigation" className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>
          <ClockIcon size={17} strokeWidth={2} />
        </span>
        <Span size="normal" weight="bold" className={styles.brandName}>
          {APP_NAME}
        </Span>
      </div>
      <ul className={styles.list}>
        {items.map((item) => {
          const ItemIcon = ICONS[item.icon];
          return (
            <li key={item.href}>
              <NextLink
                href={item.href}
                aria-current={item.isActive ? "page" : undefined}
                className={cx(styles.item, item.isActive && styles.active)}
              >
                <ItemIcon />
                <span>{item.label}</span>
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
