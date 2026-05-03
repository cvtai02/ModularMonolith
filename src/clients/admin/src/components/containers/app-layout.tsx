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
  BellIcon,
  LogOutIcon,
  TagIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { type ComponentType, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotificationHub } from "@/hooks/use-notification-hub";
import { ROUTES } from "@/configs/routes";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useIdentityStore } from "@/stores/identity";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../ui/mode-toggle";

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
      { label: "All Products",    to: ROUTES.products },
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
      { label: "Files",             to: ROUTES.contentFiles },
      { label: "Menus",             to: ROUTES.contentMenus },
      { label: "Blogs Post",        to: ROUTES.contentBlogs },
      { label: "Blog Collections",  to: ROUTES.contentBlogCollections },
      { label: "Metaobjects",       to: ROUTES.contentMetaobjects },
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
  const { state: sidebarState, setOpen: setSidebarOpen } = useSidebar();
  const isActive =
    item.to !== ROUTES.dashboard
      ? location.pathname.startsWith(item.to)
      : location.pathname === item.to;

  const [prevIsActive, setPrevIsActive] = useState(isActive);
  const [open, setOpen] = useState(isActive);

  if (prevIsActive !== isActive) {
    setPrevIsActive(isActive);
    if (isActive) setOpen(true);
  }

  if (item.subItems) {
    return (
      <SidebarMenuItem>
        <Collapsible open={open} onOpenChange={setOpen}>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.label}
            onClick={() => {
              if (sidebarState === "collapsed") {
                setSidebarOpen(true);
              } else {
                setOpen((o) => !o);
              }
            }}
          >
            <item.icon />
            <span>{item.label}</span>
            <ChevronDownIcon
              className={cn(
                "ml-auto size-4 shrink-0 transition-transform",
                open && "rotate-180"
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
  const { notifications, clearAll } = useNotificationHub();

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
                  N
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
          <div className="flex flex-1 items-center gap-2 text-muted-foreground">
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8 relative">
                    <BellIcon className="size-4" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <span className="text-sm font-semibold">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <BellIcon className="size-6 text-muted-foreground/40" />
                      <p className="text-xs text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer border-b last:border-0"
                        onClick={() => {
                          if (n.type === "OrderPlaced") {
                            navigate(`/orders/${n.orderId}`);
                          }
                        }}
                      >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <ShoppingCartIcon className="size-3.5 text-primary" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs font-medium leading-tight">New order {n.orderCode}</span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {new Intl.NumberFormat("vi-VN").format(n.totalAmount)} {n.currencyCode}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(n.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        {notifications.length > 0 && i === 0 && (
                          <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">New</Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Avatar className="size-7 cursor-pointer">
              <AvatarFallback className="bg-emerald-500 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
