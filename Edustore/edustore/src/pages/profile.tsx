import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Calendar, Shield, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    setLocation("/login");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
        phone
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">My Account</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="h-24 bg-primary/10 flex items-center justify-center">
              <div className="w-20 h-20 bg-background rounded-full border-4 border-background flex items-center justify-center text-primary shadow-sm translate-y-8">
                <User className="w-10 h-10" />
              </div>
            </div>
            <CardContent className="pt-12 text-center pb-6">
              <h2 className="text-xl font-serif font-bold">{profile.displayName}</h2>
              <p className="text-sm text-muted-foreground">{profile.role === "admin" ? "Administrator" : "Reader"}</p>
              
              <div className="mt-6 space-y-3 text-sm text-left">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" /> <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" /> <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
                {profile.role === "admin" && (
                  <div className="flex items-center gap-2 text-primary font-medium mt-4 p-2 bg-primary/5 rounded-md">
                    <Shield className="w-4 h-4" /> <span>Admin Privileges Active</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {profile.role === "admin" && (
            <Link href="/admin">
              <Button className="w-full" variant="outline">
                Go to Admin Dashboard
              </Button>
            </Link>
          )}
        </div>

        <div className="md:col-span-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg font-serif">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      value={profile.email} 
                      disabled 
                      className="pl-9 bg-muted/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-end">
                  <Button type="submit" disabled={isSaving || (displayName === profile.displayName && phone === profile.phone)}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
