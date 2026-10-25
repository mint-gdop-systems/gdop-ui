import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TopBar() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <SidebarTrigger />
        <ThemeToggle />
      </div>

      <Separator className="my-3" />
    </div>
  );
}
