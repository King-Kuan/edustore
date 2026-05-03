import { useRoute } from "wouter";
import { useBook } from "@/hooks/use-books";
import { useSettings } from "@/hooks/use-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, User, Tag, Calendar, MessageCircle, Phone, ArrowLeft, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "wouter";

export default function BookDetail() {
  const [, params] = useRoute("/books/:id");
  const id = params?.id;
  const { book, loading } = useBook(id);
  const { settings } = useSettings();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-serif font-bold mb-4">Book Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The book you are looking for does not exist or has been removed from our catalog.
        </p>
        <Link href="/books">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    if (!settings?.adminWhatsApp) return;
    const message = `Hello! I am interested in purchasing the book "${book.title}" by ${book.author}.`;
    const url = `https://wa.me/${settings.adminWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    if (!settings?.adminPhone) return;
    window.location.href = `tel:${settings.adminPhone}`;
  };

  const renderQAContent = (content: string) => {
    // Assuming simple format: Q: Question text A: Answer text
    // Or paragraphs where every odd paragraph is a question and even is an answer
    const blocks = content.split('\n\n').filter(b => b.trim() !== '');
    
    return (
      <div className="space-y-6">
        {blocks.map((block, idx) => {
          const isQuestion = block.startsWith('Q:') || block.startsWith('Question:') || idx % 2 === 0;
          const cleanBlock = block.replace(/^(Q:|Question:|A:|Answer:)\s*/i, '');
          
          if (isQuestion) {
            return (
              <div key={idx} className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                <h4 className="font-serif font-bold text-lg text-foreground mb-2 flex items-start gap-2">
                  <span className="text-primary mt-1"><Sparkles className="w-4 h-4" /></span>
                  {cleanBlock}
                </h4>
              </div>
            );
          } else {
            return (
              <div key={idx} className="pl-6 pr-4 py-2 text-muted-foreground leading-relaxed">
                <p>{cleanBlock}</p>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/books" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Book Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-accent/30 rounded-xl p-8 border border-border/50 aspect-[3/4] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-50"></div>
            <BookOpen className="w-32 h-32 text-primary opacity-80 group-hover:scale-110 transition-transform duration-500" />
            {book.status === "unavailable" && (
              <div className="absolute top-4 right-4">
                <Badge variant="destructive" className="shadow-sm">Out of Stock</Badge>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="font-normal">{book.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(book.createdAt)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground font-serif italic">
                by {book.author}
              </p>
            </div>

            <div className="text-3xl font-bold text-primary">
              {formatCurrency(book.price)}
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <Button 
                className="w-full h-12 text-lg hover-elevate" 
                size="lg"
                onClick={handleWhatsApp}
                disabled={book.status === "unavailable"}
              >
                <MessageCircle className="mr-2 h-5 w-5" /> 
                Order via WhatsApp
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 text-lg hover-elevate bg-background" 
                size="lg"
                onClick={handleCall}
                disabled={book.status === "unavailable"}
              >
                <Phone className="mr-2 h-5 w-5" /> 
                Call to Order
              </Button>
              {book.status === "unavailable" && (
                <p className="text-sm text-destructive text-center mt-2 font-medium">
                  Currently out of stock. Check back later.
                </p>
              )}
            </div>

            <div className="bg-muted/20 p-4 rounded-lg text-sm text-muted-foreground border border-border/30">
              <p className="flex items-center gap-2 mb-2"><User className="w-4 h-4 text-primary" /> Direct from publisher</p>
              <p className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Physical copy only</p>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start h-14 bg-transparent border-b border-border/50 rounded-none p-0 mb-8">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-6 font-medium text-base"
              >
                Overview
              </TabsTrigger>
              {book.chapters?.map((chapter, idx) => (
                <TabsTrigger 
                  key={idx} 
                  value={`chapter-${idx}`}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-6 font-medium text-base"
                >
                  {chapter.title} (Preview)
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-0">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-serif font-bold mb-4">About this Book</h3>
                  <div className="prose dark:prose-invert prose-lg max-w-none text-muted-foreground">
                    {book.description.split('\n').map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {book.chapters?.map((chapter, idx) => (
              <TabsContent key={idx} value={`chapter-${idx}`} className="mt-0">
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-8">
                    <div className="mb-8 pb-6 border-b border-border/50">
                      <Badge className="mb-3">Chapter Preview</Badge>
                      <h3 className="text-3xl font-serif font-bold text-foreground">{chapter.title}</h3>
                    </div>
                    {renderQAContent(chapter.content)}
                    
                    <div className="mt-12 pt-8 border-t border-border/50 text-center">
                      <p className="text-muted-foreground mb-4">Enjoying the preview? Order the physical book to read more.</p>
                      <Button variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        Order Full Book <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
