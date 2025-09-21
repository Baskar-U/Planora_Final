import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Menu, User, LogOut, ArrowLeft, Users, Store } from "lucide-react";
import { auth, signOutUser, onAuthStateChange } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { useUserType } from "@/contexts/UserTypeContext";
import AuthModal from "./AuthModal";
import NotificationBell from "./NotificationBell";
import CustomerNotificationBell from "./CustomerNotificationBell";

export default function Navbar() {
  const [location] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { userType, toggleUserType } = useUserType();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Handle authentication redirects from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    
    if (authParam === 'login' || authParam === 'signup') {
      setAuthModalOpen(true);
    }
  }, [location]);

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart", user?.uid],
    enabled: !!user,
  });

  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  // Navigation items based on authentication status and user type
  const getNavigationItems = () => {
    if (!user) {
      // Not logged in - only show basic navigation
      return [
        { path: "/", label: "Home" },
        { path: "/vendors", label: "Browse Vendors" },
        { path: "/about", label: "About" },
        { path: "/contact", label: "Contact" },
      ];
    }

    const baseItems = [
      { path: "/", label: "Home" },
      { path: "/messages", label: "Messages" },
    ];

    if (userType === 'customer') {
      return [
        ...baseItems,
        { path: "/my-orders", label: "My Orders" },
        { path: "/order-tracking", label: "Track Order" },
        { path: "/vendors", label: "Find Vendors" },
      ];
    } else {
      return [
        ...baseItems,
        { path: "/vendor-dashboard", label: "Dashboard" },
        { path: "/orders", label: "Orders" },
        { path: "/vendor-requests", label: "Requests" },
        { path: "/add-service", label: "Add Service" },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50 transition-shadow duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src="/logo.jpg" 
                  alt="Planora Events" 
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                />
                <h1 className="text-xl sm:text-2xl font-bold text-primary-600 leading-none self-center pt-5">Planora Events</h1>
              </Link>
            </div>

            {/* Right side: Navigation + User Actions */}
            <div className="flex items-center space-x-6">
              {/* Navigation Items */}
              <div className="hidden lg:flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <span className={`text-gray-700 hover:text-primary-600 transition-colors ${
                      location === item.path ? 'text-primary-600 font-medium' : ''
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
              
              {/* Compact navigation for medium screens */}
              <div className="hidden md:flex lg:hidden items-center space-x-3">
                {navigationItems.slice(0, 3).map((item) => (
                  <Link key={item.path} href={item.path}>
                    <span className={`text-gray-700 hover:text-primary-600 transition-colors text-sm ${
                      location === item.path ? 'text-primary-600 font-medium' : ''
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
                {navigationItems.length > 3 && (
                  <span className="text-gray-400 text-sm">...</span>
                )}
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Back Button (show only on non-home pages) */}
                {location !== "/" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}

                {/* Cart - Only show for logged-in customers */}
                {user && userType === 'customer' && (
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="relative tap-target">
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                {/* Notifications - Only show when user is logged in */}
                {user && userType === 'vendor' && <NotificationBell />}
                {user && userType === 'customer' && (
                  <CustomerNotificationBell 
                    customerEmail={localStorage.getItem('customerEmail') || ''} 
                  />
                )}

                {/* User Type Toggle - Only show when logged in */}
                {user && (
                  <div className="hidden sm:flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('🔘 Navbar: Customer button clicked, current type:', userType);
                        if (userType !== 'customer') {
                          console.log('🔄 Navbar: Calling toggleUserType to switch to customer');
                          toggleUserType();
                        } else {
                          console.log('⏸️ Navbar: Already in customer mode, no action needed');
                        }
                      }}
                      className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                        userType === 'customer'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Customer
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('🔘 Navbar: Vendor button clicked, current type:', userType);
                        if (userType !== 'vendor') {
                          console.log('🔄 Navbar: Calling toggleUserType to switch to vendor');
                          toggleUserType();
                        } else {
                          console.log('⏸️ Navbar: Already in vendor mode, no action needed');
                        }
                      }}
                      className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                        userType === 'vendor'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Vendor
                    </button>
                  </div>
                )}

                {/* User Profile or Auth */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full tap-target">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.photoURL} alt={user.displayName} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden sm:flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setAuthModalOpen(true)}
                      className="tap-target"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => setAuthModalOpen(true)}
                      className="btn-primary tap-target"
                    >
                      Get Started
                    </Button>
                  </div>
                )}

                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <nav className="flex flex-col space-y-4 mt-8">
                      {/* User Type Toggle in Mobile - Only show when logged in */}
                      {user && (
                        <div className="pb-4 border-b border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">User Mode</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-medium transition-colors ${
                                userType === 'customer' ? 'text-primary-600' : 'text-gray-400'
                              }`}>
                                Customer
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log('🔘 Navbar Mobile: Toggle switch clicked, current type:', userType);
                                  console.log('🔄 Navbar Mobile: Calling toggleUserType');
                                  toggleUserType();
                                }}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                  userType === 'vendor' ? 'bg-primary-600 shadow-md' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                                aria-label={`Switch to ${userType === 'customer' ? 'vendor' : 'customer'} mode`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-all duration-200 ease-in-out ${
                                    userType === 'vendor' ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className={`text-xs font-medium transition-colors ${
                                userType === 'vendor' ? 'text-primary-600' : 'text-gray-400'
                              }`}>
                                Vendor
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Currently in <span className="font-medium text-primary-600">{userType}</span> mode
                          </div>
                        </div>
                      )}
                      
                      {navigationItems.map((item) => (
                        <Link key={item.path} href={item.path}>
                          <span className="text-gray-900 hover:text-primary-600 transition-colors block py-2">
                            {item.label}
                          </span>
                        </Link>
                      ))}

                      {/* Sign In / Get Started buttons for non-logged-in users */}
                      {!user && (
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setAuthModalOpen(true)}
                          >
                            Sign In
                          </Button>
                          <Button
                            className="w-full bg-primary-600 hover:bg-primary-700"
                            onClick={() => setAuthModalOpen(true)}
                          >
                            Get Started
                          </Button>
                        </div>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>


      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}