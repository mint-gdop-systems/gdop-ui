import { Icon } from "@phosphor-icons/react";
import {
  CornersOutIcon,
  DownloadIcon,
  HouseLineIcon,
  PaletteIcon,
  TextAaIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Route } from "next";

export interface NavItem {
  icon: Icon;
  title: string;
  href: Route;
  badge?: "New" | "Soon";
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Items marked "Soon" render as disabled until their page exists. */
export const SIDEBAR_ITEMS: NavGroup[] = [
  {
    title: "Getting started",
    items: [
      { icon: HouseLineIcon, title: "Introduction", href: "/" },
      {
        icon: DownloadIcon,
        title: "Installation",
        href: "/installation",
        badge: "Soon",
      },
    ],
  },
  {
    title: "Foundations",
    items: [
      {
        icon: PaletteIcon,
        title: "Colors",
        href: "/foundations/colors",
        badge: "New",
      },
      {
        icon: TextAaIcon,
        title: "Typography",
        href: "/foundations/typography",
        badge: "Soon",
      },
      {
        icon: CornersOutIcon,
        title: "Spacing & radius",
        href: "/foundations/spacing",
        badge: "Soon",
      },
    ],
  },
  {
    title: "Components",
    items: [],
  },
];
