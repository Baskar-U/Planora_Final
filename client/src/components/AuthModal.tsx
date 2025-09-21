import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithGoogle, signInWithEmail, signUpWithEmail, handleRedirectResult } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "./LoadingSpinner";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useRedirect } from "@/contexts/RedirectContext";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const { redirectUrl, clearRedirectUrl } = useRedirect();

  // Handle Google redirect result
  useEffect(() => {
    const handleGoogleRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          onOpenChange(false);
          
          // Check for return URL and redirect
          const urlParams = new URLSearchParams(window.location.search);
          const returnUrl = urlParams.get('return');
          const finalRedirectUrl = redirectUrl || returnUrl;
          
          if (finalRedirectUrl) {
            console.log('🔄 AuthModal: Redirecting to:', finalRedirectUrl);
            setLocation(finalRedirectUrl);
            clearRedirectUrl();
          }
          
          toast({
            title: "Success",
            description: "Signed in successfully with Google",
          });
        }
      } catch (error: any) {
        console.error("Google redirect error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to sign in with Google",
          variant: "destructive",
        });
      }
    };

    handleGoogleRedirect();
  }, [onOpenChange, toast, setLocation]);

  const createUserMutation = useMutation({
    mutationFn: async (userData: { email: string; name: string }) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
  });

  const handleGoogleAuth = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      onOpenChange(false);
      
      // Check for return URL and redirect
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('return');
      const finalRedirectUrl = redirectUrl || returnUrl;
      
      if (finalRedirectUrl) {
        console.log('🔄 AuthModal: Redirecting to:', finalRedirectUrl);
        setLocation(finalRedirectUrl);
        clearRedirectUrl();
      }
      
      toast({
        title: "Success",
        description: "Signed in successfully with Google",
      });
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      onOpenChange(false);
      
      // Check for return URL and redirect
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('return');
      const finalRedirectUrl = redirectUrl || returnUrl;
      
      if (finalRedirectUrl) {
        console.log('🔄 AuthModal: Redirecting to:', finalRedirectUrl);
        setLocation(finalRedirectUrl);
        clearRedirectUrl();
      }
      
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "Failed to sign in";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signUpWithEmail(email, password);
      
      // Create user in our database
      await createUserMutation.mutateAsync({
        email,
        name,
      });

      onOpenChange(false);
      
      // Check for return URL and redirect
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('return');
      const finalRedirectUrl = redirectUrl || returnUrl;
      
      if (finalRedirectUrl) {
        console.log('🔄 AuthModal: Redirecting to:', finalRedirectUrl);
        setLocation(finalRedirectUrl);
        clearRedirectUrl();
      }
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = "Failed to create account";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Welcome to Planora</DialogTitle>
          <p className="text-center text-gray-600">Sign in to start planning your perfect event</p>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" onClick={handleGoogleAuth} className="w-full" disabled={isGoogleLoading}>
          {isGoogleLoading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" text="" />
              <span>Signing in...</span>
            </div>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
