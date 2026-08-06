"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, BookOpen, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV_ITEMS } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function TopNavigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string>("student");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        
        // Fetch Profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setProfile(prof);

        // Fetch Role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authUser.id)
          .single();
        if (roleData) {
          setRole(roleData.role);
        }
      }
    };

    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setRole("student");
      }
    });

    fetchSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Đăng xuất thành công!");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Brand Logo */}
        <Logo />

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-300 hover:text-gold-400 transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right: Auth / Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 outline-none">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-zinc-800 text-gold-400 font-bold">
                      {profile?.full_name?.substring(0, 2).toUpperCase() || "KP"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-zinc-200 hover:text-gold-400 transition-colors">
                    {profile?.full_name || user.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-200">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-white">
                      {profile?.full_name || "Học viên"}
                    </p>
                    <p className="text-xs leading-none text-zinc-400">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4 text-gold-400" />
                    Dashboard Học viên
                  </Link>
                </DropdownMenuItem>
                
                {["super_admin", "content_admin", "instructor"].includes(role) && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4 text-amber-400" />
                      Trang Quản Trị
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link href="/checkout/11111111-1111-1111-1111-111111111111">Đăng ký khóa học</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-3">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-300 hover:text-gold-400 py-1"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          
          {user ? (
            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard Học viên</Link>
              </Button>
              {["super_admin", "content_admin", "instructor"].includes(role) && (
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>Trang Quản Trị</Link>
                </Button>
              )}
              <Button variant="destructive" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full">
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
              </Button>
              <Button variant="gold" asChild className="w-full">
                <Link href="/checkout/11111111-1111-1111-1111-111111111111" onClick={() => setMobileMenuOpen(false)}>Đăng ký khóa học</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
