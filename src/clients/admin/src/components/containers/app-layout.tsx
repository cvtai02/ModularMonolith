import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BoxIcon,
  ChartColumnBigIcon,
  ClipboardListIcon,
  FileTextIcon,
  GiftIcon,
  SettingsIcon,
  UsersIcon,
  ChevronDownIcon,
  SearchIcon,
  BellIcon,
  LogOutIcon,
  TagIcon,
} from "lucide-react";
import { type ComponentType } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/configs/routes";
import { useIdentityStore } from "@/stores/identity";
import { cn } from "@/lib/utils";

type NavSubItem = { label: string; to: string };
type NavItem = {
  label: string;
  to: string;
  icon: ComponentType;
  subItems?: NavSubItem[];
};

const navItems: NavItem[] = [
  { label: "Home", to: ROUTES.dashboard, icon: ChartColumnBigIcon },
  { label: "Orders", to: ROUTES.orders, icon: ClipboardListIcon },
  {
    label: "Products",
    to: ROUTES.products,
    icon: BoxIcon,
    subItems: [
      { label: "Category",        to: ROUTES.productCategory },
      { label: "Collections",     to: ROUTES.productCollections },
      { label: "Inventory",       to: ROUTES.productInventory },
      { label: "Purchase Orders", to: ROUTES.productPurchaseOrders },
    ],
  },
  {
    label: "Content",
    to: ROUTES.content,
    icon: FileTextIcon,
    subItems: [
      { label: "Files",        to: ROUTES.contentFiles },
      { label: "Menus",        to: ROUTES.contentMenus },
      { label: "Blogs Post",   to: ROUTES.contentBlogs },
      { label: "Metaobjects",  to: ROUTES.contentMetaobjects },
    ],
  },
  { label: "Customers", to: ROUTES.customers, icon: UsersIcon },
  {
    label: "Marketing",
    to: ROUTES.marketing,
    icon: GiftIcon,
    subItems: [
      { label: "Campaigns",   to: ROUTES.marketingCampaigns },
      { label: "Attribution", to: ROUTES.marketingAttribution },
      { label: "Automation",  to: ROUTES.marketingAutomation },
    ],
  },
  { label: "Promotion", to: ROUTES.promotion, icon: TagIcon },
  {
    label: "Analytics",
    to: ROUTES.analytics,
    icon: ChartColumnBigIcon,
    subItems: [
      { label: "Reports", to: ROUTES.analyticsReports },
      { label: "Live",    to: ROUTES.analyticsLive },
    ],
  },
  { label: "Settings", to: ROUTES.settings, icon: SettingsIcon },
];

function NavItemRow({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive =
    item.to !== ROUTES.dashboard
      ? location.pathname.startsWith(item.to)
      : location.pathname === item.to;

  if (item.subItems) {
    return (
      <SidebarMenuItem>
        <Collapsible open={isActive}>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.label}
            render={<NavLink to={item.to} />}
          >
            <item.icon />
            <span>{item.label}</span>
            <ChevronDownIcon
              className={cn(
                "ml-auto size-4 shrink-0 transition-transform",
                isActive && "rotate-180"
              )}
            />
          </SidebarMenuButton>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((sub) => (
                <SidebarMenuSubItem key={sub.to}>
                  <SidebarMenuSubButton
                    isActive={location.pathname === sub.to}
                    render={<NavLink to={sub.to} />}
                  >
                    {sub.label}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.label}
        render={<NavLink to={item.to} />}
      >
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout, email } = useIdentityStore();

  const handleSignOut = () => {
    logout();
    navigate(ROUTES.signin);
  };

  const initials = email ? email.slice(0, 2).toUpperCase() : "MS";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        {/* Store header */}
        <SidebarHeader className="border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="My Store">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm leading-tight">My Store</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {email || "admin@store.com"}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Nav items */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <NavItemRow key={item.to} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
                <LogOutIcon />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-1 items-center gap-2 text-muted-foreground">
            <SearchIcon className="size-4" />
            <span className="text-sm">Search</span>
            <kbd className="ml-1 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex">
              CTRL K
            </kbd>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
              View as
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <BellIcon className="size-4" />
            </Button>
            <Avatar className="size-7 cursor-pointer">
              <AvatarFallback className="bg-emerald-500 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
