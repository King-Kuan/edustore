import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "wouter";
import { collection, query, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Book, Ad, AdApplication, User } from "@/lib/types";
import { useBooks, createBook, updateBookData, deleteBook } from "@/hooks/use-books";
import { useAds, useAdApplications, createAd, updateAd, deleteAd, updateApplicationStatus } from "@/hooks/use-ads";
import { useSettings, updateSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Edit, Trash2, Shield, AlertTriangle, BookOpen, Settings as SettingsIcon, Megaphone, Users } from "lucide-react";

export default function Admin() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user || !profile || !isAdmin) {
    setLocation("/");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="mb-8 bg-card border border-border">
          <TabsTrigger value="books"><BookOpen className="w-4 h-4 mr-2" /> Books</TabsTrigger>
          <TabsTrigger value="ads"><Megaphone className="w-4 h-4 mr-2" /> Ads</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" /> Users</TabsTrigger>
          <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-2" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <BooksManager />
        </TabsContent>

        <TabsContent value="ads">
          <AdsManager />
        </TabsContent>
        
        <TabsContent value="applications">
          <AdApplicationsManager />
        </TabsContent>

        <TabsContent value="users">
          <UsersManager />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BooksManager() {
  const { books, loading } = useBooks();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: 0,
    category: "Science",
    status: "available" as "available" | "unavailable",
    chapters: [
      { title: "Chapter 1", content: "" },
      { title: "Chapter 2", content: "" }
    ]
  });

  const handleOpenNew = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      description: "",
      price: 0,
      category: "Science",
      status: "available",
      chapters: [
        { title: "Chapter 1", content: "" },
        { title: "Chapter 2", content: "" }
      ]
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      category: book.category,
      status: book.status,
      chapters: book.chapters.length > 0 ? book.chapters : [
        { title: "Chapter 1", content: "" },
        { title: "Chapter 2", content: "" }
      ]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteBook(id);
      toast({ title: "Book deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBook) {
        await updateBookData(editingBook.id, formData);
        toast({ title: "Book updated" });
      } else {
        await createBook(formData);
        toast({ title: "Book created" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="py-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Book Inventory</CardTitle>
          <CardDescription>Manage your physical book collection</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew}><Plus className="w-4 h-4 mr-2" /> Add Book</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Science", "History", "Literature", "Mathematics", "Business", "Technology", "Art"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Chapter Previews (Max 2)</h3>
                {formData.chapters.map((chapter, idx) => (
                  <div key={idx} className="mb-6 p-4 border rounded-md bg-muted/20">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Chapter {idx + 1} Title</Label>
                        <Input value={chapter.title} onChange={e => {
                          const newChapters = [...formData.chapters];
                          newChapters[idx].title = e.target.value;
                          setFormData({...formData, chapters: newChapters});
                        }} />
                      </div>
                      <div className="space-y-2">
                        <Label>Content (Q&A Format)</Label>
                        <Textarea 
                          rows={6} 
                          placeholder="Q: What is the main idea?\n\nA: The main idea is..."
                          value={chapter.content} 
                          onChange={e => {
                            const newChapters = [...formData.chapters];
                            newChapters[idx].content = e.target.value;
                            setFormData({...formData, chapters: newChapters});
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  {editingBook ? "Update Book" : "Create Book"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map(book => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{formatCurrency(book.price)}</TableCell>
                <TableCell>
                  <Badge variant={book.status === 'available' ? 'default' : 'destructive'}>
                    {book.status}
                  </Badge>
                </TableCell>
                <TableCell>{book.viewCount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(book)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(book.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {books.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No books found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AdsManager() {
  const { ads, loading } = useAds();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "ribbon" as "ribbon" | "redirect" | "popup",
    icon: "Megaphone",
    link: "",
    isActive: true,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  const handleOpenNew = () => {
    setEditingAd(null);
    setFormData({
      title: "",
      description: "",
      type: "ribbon",
      icon: "Megaphone",
      link: "",
      isActive: true,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      type: ad.type,
      icon: ad.icon,
      link: ad.link || "",
      isActive: ad.isActive,
      expiresAt: ad.expiresAt
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;
    try {
      await deleteAd(id);
      toast({ title: "Ad deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleStatus = async (ad: Ad) => {
    try {
      await updateAd(ad.id, { isActive: !ad.isActive });
      toast({ title: `Ad ${!ad.isActive ? 'activated' : 'deactivated'}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAd) {
        await updateAd(editingAd.id, formData);
        toast({ title: "Ad updated" });
      } else {
        await createAd(formData);
        toast({ title: "Ad created" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="py-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ad Campaigns</CardTitle>
          <CardDescription>Manage active advertisements</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew}><Plus className="w-4 h-4 mr-2" /> Create Ad</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAd ? "Edit Ad" : "Create New Ad"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ribbon">Ribbon</SelectItem>
                      <SelectItem value="redirect">Redirect Card</SelectItem>
                      <SelectItem value="popup">Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Icon (Lucide name)</Label>
                  <Input required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex items-center justify-between border rounded-md p-4 bg-muted/20">
                <div>
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Will be shown to users if enabled</p>
                </div>
                <Switch checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  {editingAd ? "Update Ad" : "Create Ad"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map(ad => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell className="capitalize">{ad.type}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={ad.isActive} onCheckedChange={() => handleToggleStatus(ad)} />
                    <span className="text-sm text-muted-foreground">{ad.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(ad.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(ad)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(ad.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No ads found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AdApplicationsManager() {
  const { applications, loading } = useAdApplications();
  const { toast } = useToast();

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateApplicationStatus(id, status);
      toast({ title: `Application ${status}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="py-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad Applications</CardTitle>
        <CardDescription>Review and manage advertising requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map(app => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="font-medium">{app.businessName}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{app.description}</div>
                </TableCell>
                <TableCell className="capitalize">
                  {app.adType}
                  {app.includeInBooks && <Badge variant="outline" className="ml-2 text-[10px]">Print</Badge>}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{app.contactEmail}</div>
                  <div className="text-xs text-muted-foreground">{app.contactPhone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {app.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleStatusChange(app.id, 'approved')}>Approve</Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleStatusChange(app.id, 'rejected')}>Reject</Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Action taken</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No applications found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: User[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="py-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Directory</CardTitle>
        <CardDescription>View registered users on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No users found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SettingsManager() {
  const { settings, loading } = useSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    adminPhone: "",
    adminWhatsApp: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        adminPhone: settings.adminPhone,
        adminWhatsApp: settings.adminWhatsApp
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast({ title: "Settings updated successfully" });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="py-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Global Settings</CardTitle>
        <CardDescription>Configure platform contact details and behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="adminPhone">Publisher Phone Number</Label>
            <Input 
              id="adminPhone" 
              value={formData.adminPhone} 
              onChange={(e) => setFormData({...formData, adminPhone: e.target.value})} 
              placeholder="+1234567890"
              required
            />
            <p className="text-xs text-muted-foreground">Used for direct phone call orders</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminWhatsApp">Publisher WhatsApp Number</Label>
            <Input 
              id="adminWhatsApp" 
              value={formData.adminWhatsApp} 
              onChange={(e) => setFormData({...formData, adminWhatsApp: e.target.value})} 
              placeholder="1234567890"
              required
            />
            <p className="text-xs text-muted-foreground">Numbers only, including country code (e.g. 14155552671)</p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg flex gap-3 text-sm text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-900/50">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>These numbers will be displayed on all book pages. Make sure they are monitored during business hours to avoid missing orders.</p>
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
