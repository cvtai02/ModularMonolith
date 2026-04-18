import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BoxIcon,
  ChartColumnBigIcon,
  ClipboardListIcon,
  FileTextIcon,
  FolderTreeIcon,
  GiftIcon,
  MessageSquareMoreIcon,
  PackageSearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { type ComponentType, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/configs/routes";
import { useIdentityStore } from "@/stores/identity";

type NavItem = {
  label: string;
  to: string;
  icon: ComponentType;
};

const navItems: NavItem[] = [
  { label: "Dashboard", to: ROUTES.dashboard, icon: ChartColumnBigIcon },
  { label: "Products", to: ROUTES.products, icon: BoxIcon },
  { label: "Categories", to: ROUTES.categories, icon: FolderTreeIcon },
  { label: "Contents", to: ROUTES.contents, icon: FileTextIcon },
  { label: "Orders", to: ROUTES.orders, icon: ClipboardListIcon },
  { label: "Customers", to: ROUTES.customers, icon: UsersIcon },
  { label: "Inventory", to: ROUTES.inventory, icon: PackageSearchIcon },
  { label: "Promotions", to: ROUTES.promotions, icon: GiftIcon },
  { label: "Reviews", to: ROUTES.reviews, icon: MessageSquareMoreIcon },
  { label: "Settings", to: ROUTES.settings, icon: SettingsIcon },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useIdentityStore();

  const currentTitle = useMemo(() => {
    const activeItem = navItems.find((item) => location.pathname.startsWith(item.to));
    return activeItem?.label ?? "Admin";
  }, [location.pathname]);

  const handleSignOut = () => {
    logout();
    navigate(ROUTES.signin);
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
              NKM
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">NEKOMIN</p>
              <p className="truncate text-xs text-muted-foreground">Admin Console</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      render={<NavLink to={item.to} />}
                      isActive={location.pathname.startsWith(item.to)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-sm font-medium text-foreground">{currentTitle}</h1>
        </header>
        <div className="flex flex-1 flex-col p-4">
          <div className="min-h-[calc(100svh-5rem)] rounded-xl border bg-card p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
