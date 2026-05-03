import { useState, useMemo } from "react";
import { useBooks } from "@/hooks/use-books";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["All", "Science", "History", "Literature", "Mathematics", "Business", "Technology", "Art"];

export default function BooksPage() {
  const { books, loading } = useBooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "All" || book.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, category]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Our Complete Library</h1>
        <p className="text-muted-foreground text-lg">Browse our curated selection of physical educational materials.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by title or author..." 
            className="pl-10 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 text-base">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-80 bg-muted/20 animate-pulse rounded-lg border border-border/50"></div>
          ))}
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/10 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif font-bold text-foreground mb-2">No books found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't find any books matching your current search and filter criteria.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => {
              setSearchQuery("");
              setCategory("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
