import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { BookOpen, User, LogOut, Shield } from "lucide-react";

export function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    setLocation("/");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-serif font-bold text-primary">
          <BookOpen className="h-6 w-6" />
          <span>EduStore</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/books" className="text-muted-foreground hover:text-foreground font-medium">
            Browse Books
          </Link>
          <Link href="/advertise" className="text-muted-foreground hover:text-foreground font-medium">
            Advertise
          </Link>
          
          <div className="flex items-center gap-2 ml-4 border-l pl-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="icon" title="Admin Dashboard">
                      <Shield className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="icon" title="Profile">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log Out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
