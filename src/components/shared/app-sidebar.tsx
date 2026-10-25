"use client";

import { PlaceholderIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_ITEMS } from "@/lib/sidebar-items";

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton size="lg">
            <Image
              src="/images/gdop-logo.png"
              width={40}
              height={40}
              alt="GDOP logo"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold">
                GDOP UI
              </span>
              <span className="text-muted-foreground block truncate text-xs">
                v0.1
              </span>
            </span>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {SIDEBAR_ITEMS.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            {group.items.map((item) => {
              const IconComponent = item.icon ?? PlaceholderIcon;
              const isDisabled = item.badge === "Soon";

              return (
                <SidebarGroupContent key={item.title}>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      {isDisabled ? (
                        <SidebarMenuButton
                          disabled={isDisabled}
                          isActive={pathname === item.href}
                        >
                          <IconComponent weight="duotone" />
                          {item.title}
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          isActive={pathname === item.href}
                          render={
                            <Link href={item.href}>
                              <IconComponent weight="duotone" />
                              {item.title}
                            </Link>
                          }
                        />
                      )}

                      {item.badge && (
                        <SidebarMenuBadge
                          className={cn(
                            "text-[10px] ",
                            isDisabled && "opacity-50",
                          )}
                        >
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              );
            })}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
