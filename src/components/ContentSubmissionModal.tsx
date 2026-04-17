import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2 } from "lucide-react";
import { VideoCategory } from "@/types/video";
import { useToast } from "@/hooks/use-toast";
import { BasePay } from "./BasePay";
import { useAccount } from "wagmi";
import { useContentSubmission } from "@/hooks/useVideoActions";

const CATEGORIES: VideoCategory[] = ['safety', 'fun', 'shopping', 'food', 'culture', 'nightlife', 'adventure', 'nature'];

export const ContentSubmissionModal = () => {
  const [open, setOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const { isConnected, address } = useAccount();
  const [selectedCategories, setSelectedCategories] = useState<VideoCategory[]>([]);
  const { toast } = useToast();
  const { submitContent, loading } = useContentSubmission();

  const toggleCategory = (category: VideoCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!embedUrl || !location || selectedCategories.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one category",
        variant: "destructive",
      });
      return;
    }

    const success = await submitContent({
      embedUrl,
      location,
      country: country || undefined,
      categories: selectedCategories,
      streamTags: [location, ...(country ? [country] : [])],
      submitterAddress: address,
    });

    if (success) {
      setEmbedUrl("");
      setLocation("");
      setCountry("");
      setSelectedCategories([]);
      setOpen(false);
    }
  };

  const resetAndClose = () => {
    setEmbedUrl("");
    setLocation("");
    setCountry("");
    setSelectedCategories([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-[4.5rem] right-3 sm:bottom-20 sm:right-4 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:scale-110 transition-transform"
          size="icon"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Post to Stream</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embedUrl">Content URL</Label>
            <Input
              id="embedUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">YouTube, TikTok, Instagram, or direct video URL</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="location">Location / City</Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g. Nairobi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                type="text"
                placeholder="e.g. Kenya"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categories (Select at least one)</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform capitalize"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  {selectedCategories.includes(category) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {isConnected ? (
            <BasePay
              amount={0.10}
              disabled={loading || selectedCategories.length === 0 || !location.trim() || !embedUrl.trim()}
              onSuccess={() => {
                submitContent({
                  embedUrl,
                  location,
                  country: country || undefined,
                  categories: selectedCategories,
                  streamTags: [location, ...(country ? [country] : [])],
                  submitterAddress: address,
                  paidAmount: 0.10,
                }).then(ok => { if (ok) resetAndClose(); });
              }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting…</> : 'Post to Stream ($0.10)'}
            </BasePay>
          ) : (
            <Button
              type="submit"
              className="w-full"
              disabled={loading || selectedCategories.length === 0 || !location.trim() || !embedUrl.trim()}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting…</> : 'Submit (Free Preview)'}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

