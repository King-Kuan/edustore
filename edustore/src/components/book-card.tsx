import { Link } from "wouter";
import { Book as BookIcon, TrendingUp, Clock } from "lucide-react";
import { useBooks } from "@/hooks/use-books";
import { formatCurrency } from "@/lib/utils";
import { Book } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORY_COLORS: Record<string, string> = {
  "Science": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  "History": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  "Literature": "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100",
  "Mathematics": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  "Default": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
};

export function BookCard({ book }: { book: Book }) {
  const colorClass = CATEGORY_COLORS[book.category] || CATEGORY_COLORS["Default"];

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="h-full flex flex-col hover-elevate transition-all cursor-pointer overflow-hidden border-border/50 hover:border-primary/30 group">
        <div className={`h-40 w-full flex items-center justify-center p-6 ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity`}>
          <BookIcon className="w-16 h-16 opacity-50" />
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <Badge variant="secondary" className="text-xs font-normal mb-2">
              {book.category}
            </Badge>
            {book.status === "unavailable" && (
              <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
            )}
          </div>
          <CardTitle className="text-lg font-serif line-clamp-2 leading-tight">
            {book.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {book.author}
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {book.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto border-t border-border/50 bg-muted/20">
          <span className="font-bold text-primary">
            {formatCurrency(book.price)}
          </span>
          <div className="flex items-center text-xs text-muted-foreground gap-3">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {book.viewCount}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
