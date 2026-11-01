export type NavigationIcon = "clients" | "timeEntries";

export interface NavigationItem {
  label: string;
  href: string;
  icon: NavigationIcon;
}

export interface NavigationItemState extends NavigationItem {
  isActive: boolean;
}
