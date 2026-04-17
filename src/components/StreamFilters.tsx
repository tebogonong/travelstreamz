import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X } from "lucide-react";
import { VideoCategory } from "@/types/video";

const CATEGORIES: VideoCategory[] = ['safety', 'fun', 'shopping', 'food', 'culture', 'nightlife', 'adventure', 'nature'];

interface StreamFiltersProps {
  selectedCategories: VideoCategory[];
  onCategoryToggle: (category: VideoCategory) => void;
  locationSearch: string;
  onLocationSearch: (location: string) => void;
  onClearFilters: () => void;
}

export const StreamFilters = ({
  selectedCategories,
  onCategoryToggle,
  locationSearch,
  onLocationSearch,
  onClearFilters,
}: StreamFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="absolute top-3 sm:top-4 left-0 right-0 z-20 px-3 sm:px-4 space-y-2">
      {/* Location Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search location..."
          value={locationSearch}
          onChange={(e) => onLocationSearch(e.target.value)}
          className="pl-10 bg-card/90 backdrop-blur-sm text-sm"
          onFocus={() => setShowFilters(true)}
        />
        {locationSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onLocationSearch("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Filter by Category</span>
            </div>
            {(selectedCategories.length > 0 || locationSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-7 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform capitalize"
                onClick={() => onCategoryToggle(category)}
              >
                {category}
                {selectedCategories.includes(category) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowFilters(false)}
          >
            Apply Filters
          </Button>
        </div>
      )}

      {/* Active Filters Display */}
      {!showFilters && (selectedCategories.length > 0 || locationSearch) && (
        <div className="flex items-center gap-2 flex-wrap">
          {locationSearch && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="w-3 h-3" />
              {locationSearch}
            </Badge>
          )}
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="capitalize gap-1">
              {category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onCategoryToggle(category)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
