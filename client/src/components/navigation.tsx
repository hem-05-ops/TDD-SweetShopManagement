import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, authStore } from "@/lib/auth";
import { CartItemWithSweet } from "@/lib/types";
import { Link } from "wouter";
import { Search, ShoppingCart, Candy, Menu, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShowLogin: () => void;
  onShowRegister: () => void;
  onShowCart: () => void;
}

export default function Navigation({
  searchQuery,
  onSearchChange,
  onShowLogin,
  onShowRegister,
  onShowCart,
}: NavigationProps) {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: cartItems = [] } = useQuery<CartItemWithSweet[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    authStore.clearAuth();
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 hero-gradient rounded-lg flex items-center justify-center">
              <Candy className="text-white text-lg" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sweet Delights</h1>
              <p className="text-xs text-gray-500">Premium Indian Sweets</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search sweets by name or category..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
                Home
              </Link>
              <a href="#products" className="text-gray-700 hover:text-primary transition-colors">
                Products
              </a>
              {user?.role === "admin" && (
                <Link href="/admin" className="text-gray-700 hover:text-primary transition-colors">
                  Admin
                </Link>
              )}
            </div>

            {/* Cart and User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              {isAuthenticated && (
                <button
                  onClick={onShowCart}
                  className="relative p-2 text-gray-700 hover:text-primary transition-colors"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.username}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="w-full cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button onClick={onShowLogin} className="bg-primary hover:bg-orange-600">
                    Sign In
                  </Button>
                  <Button
                    onClick={onShowRegister}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <div className="px-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search sweets..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/" className="block px-2 py-2 text-gray-700 hover:text-primary">
                  Home
                </Link>
                <a href="#products" className="block px-2 py-2 text-gray-700 hover:text-primary">
                  Products
                </a>
                {user?.role === "admin" && (
                  <Link href="/admin" className="block px-2 py-2 text-gray-700 hover:text-primary">
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
