import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Menu, ShoppingBag, User2, LogOut, LayoutDashboard, Package, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { isAdminQuery } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: isAdmin } = useQuery({ ...isAdminQuery(user?.id ?? ""), enabled: Boolean(user) });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="bg-background/85 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "hover:text-foreground hover:bg-secondary rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                pathname === item.to ? "text-foreground bg-secondary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="relative rounded-full">
            <Link to="/cart" aria-label={`Cart with ${count} items`}>
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full text-[11px] font-bold">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <User2 className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserCircle2 className="mr-2 size-4" /> My profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders">
                    <Package className="mr-2 size-4" /> My orders
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="mr-2 size-4" /> Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-6">
              <SheetHeader className="p-0">
                <SheetTitle className="text-left">
                  <Logo compact />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="hover:bg-secondary rounded-xl px-4 py-3 text-base font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="hover:bg-secondary rounded-xl px-4 py-3 text-base font-medium"
                >
                  Cart ({count})
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="hover:bg-secondary rounded-xl px-4 py-3 text-base font-medium"
                    >
                      My orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="hover:bg-secondary rounded-xl px-4 py-3 text-base font-medium"
                    >
                      My profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="hover:bg-secondary rounded-xl px-4 py-3 text-base font-medium"
                      >
                        Admin dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <Button asChild className="mt-4 h-12 rounded-xl text-base">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}