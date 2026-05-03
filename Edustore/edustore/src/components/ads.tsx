import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAds } from "@/hooks/use-ads";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import * as Icons from "lucide-react";

function getIcon(iconName: string) {
  const Icon = (Icons as any)[iconName] || Icons.HelpCircle;
  return <Icon className="w-5 h-5" />;
}

export function RibbonAd() {
  const { ads } = useAds({ activeOnly: true, type: "ribbon" });
  const activeAd = ads[0]; // Just show the first active ribbon ad
  const [isVisible, setIsVisible] = useState(true);

  if (!activeAd || !isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 relative flex items-center justify-center text-sm font-medium">
      <div className="flex items-center gap-2">
        {getIcon(activeAd.icon)}
        <span>{activeAd.title}:</span>
        <span className="opacity-90">{activeAd.description}</span>
        {activeAd.link && (
          <a href={activeAd.link} target="_blank" rel="noopener noreferrer" className="ml-2 underline underline-offset-2 flex items-center gap-1 hover:text-accent">
            Learn More <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function PopupAd() {
  const { ads } = useAds({ activeOnly: true, type: "popup" });
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (ads.length > 0 && !hasShown) {
      const timer = setTimeout(() => {
        setOpen(true);
        setHasShown(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [ads, hasShown]);

  if (ads.length === 0) return null;
  const activeAd = ads[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            {getIcon(activeAd.icon)}
          </div>
          <DialogTitle className="text-2xl font-serif text-center">{activeAd.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {activeAd.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          {activeAd.link ? (
            <Button asChild className="w-full">
              <a href={activeAd.link} target="_blank" rel="noopener noreferrer">
                Explore Offer
              </a>
            </Button>
          ) : (
            <Button onClick={() => setOpen(false)} className="w-full">
              Got it
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RedirectAdCard() {
  const { ads } = useAds({ activeOnly: true, type: "redirect" });
  
  if (ads.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {ads.map((ad) => (
        <a key={ad.id} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block group">
          <Card className="h-full border-dashed border-2 bg-muted/30 hover:bg-muted/50 transition-colors hover:border-primary/50">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                {getIcon(ad.icon)}
              </div>
              <div>
                <h3 className="font-semibold text-lg font-serif mb-1">{ad.title}</h3>
                <p className="text-sm text-muted-foreground">{ad.description}</p>
              </div>
              <span className="text-xs font-medium text-primary mt-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Visit Partner <ExternalLink className="w-3 h-3" />
              </span>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
