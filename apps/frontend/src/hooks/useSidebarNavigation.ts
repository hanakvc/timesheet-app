import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "@/constants/global";
import type { NavigationItemState } from "@/interfaces/navigation";

export default function useSidebarNavigation(): NavigationItemState[] {
  const pathname = usePathname();

  return NAVIGATION_ITEMS.map((item) => ({
    ...item,
    isActive: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));
}
