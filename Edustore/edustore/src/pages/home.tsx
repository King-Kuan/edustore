import { Link } from "wouter";
import { BookOpen, Search, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBooks } from "@/hooks/use-books";
import { BookCard } from "@/components/book-card";
import { RibbonAd, PopupAd, RedirectAdCard } from "@/components/ads";

export default function Home() {
  const { books: trendingBooks, loading: trendingLoading } = useBooks({ trending: true, limit: 4 });
  const { books: latestBooks, loading: latestLoading } = useBooks({ latest: true, limit: 8 });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <RibbonAd />
      <PopupAd />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge className="mb-6 bg-accent text-accent-foreground hover:bg-accent/90 border-accent-border">
            <Sparkles className="w-3 h-3 mr-2" /> Discover Knowledge
          </Badge>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground tracking-tight mb-6">
            The Digital Shelf for <span className="text-primary italic">Curious Minds</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Explore our curated collection of physical educational books. Preview chapters, find what you need, and order directly from the publisher.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link href="/books" className="w-full">
              <Button size="lg" className="w-full text-lg h-14">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Library
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 flex flex-col gap-24">
        
        {/* Redirect Ads */}
        <RedirectAdCard />

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
            <h2 className="text-3xl font-serif font-bold flex items-center gap-3 text-foreground">
              <TrendingUp className="text-primary h-8 w-8" />
              Trending Books
            </h2>
            <Link href="/books">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 bg-muted/20 animate-pulse rounded-lg border border-border/50"></div>
              ))}
            </div>
          ) : trendingBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
              No trending books found.
            </div>
          )}
        </section>

        {/* Latest Additions */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
            <h2 className="text-3xl font-serif font-bold flex items-center gap-3 text-foreground">
              <BookOpen className="text-secondary h-8 w-8" />
              Fresh on the Shelf
            </h2>
            <Link href="/books">
              <Button variant="ghost" className="text-secondary hover:text-secondary/80">
                Browse Collection <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {latestLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-80 bg-muted/20 animate-pulse rounded-lg border border-border/50"></div>
              ))}
            </div>
          ) : latestBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
              No new books found.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Needed to avoid errors for missing import
import { Badge } from "@/components/ui/badge";