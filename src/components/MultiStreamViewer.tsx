import { useState, useEffect } from "react";
import { Stream, VideoContent, ViewMode } from "@/types/video";
import { StreamPlayer } from "./StreamPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  Trophy,
  Zap,
  ArrowLeft
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BasePay } from "./BasePay";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

interface MultiStreamViewerProps {
  availableStreams: Stream[];
  initialMode?: ViewMode;
  onBack?: () => void;
}

export const MultiStreamViewer = ({ 
  availableStreams,
  initialMode = 'single',
  onBack
}: MultiStreamViewerProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [activeStreams, setActiveStreams] = useState<Stream[]>([availableStreams[0]]);
  const [streamStates, setStreamStates] = useState<Map<string, { xp: number, likes: number }>>(new Map());
  const { isConnected } = useAccount();
  const { toast } = useToast();

  // Update active streams when view mode changes
  useEffect(() => {
    const streamsNeeded = viewMode === 'single' ? 1 : viewMode === 'split-2' ? 2 : 3;
    if (activeStreams.length !== streamsNeeded) {
      const newStreams = availableStreams.slice(0, streamsNeeded);
      setActiveStreams(newStreams);
    }
  }, [viewMode]);

  // Update view mode when initialMode prop changes
  useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);

  const handleVideoChange = (video: VideoContent, streamId: string) => {
    // Update XP for the stream
    const currentState = streamStates.get(streamId) || { xp: 0, likes: 0 };
    setStreamStates(new Map(streamStates.set(streamId, {
      xp: currentState.xp + video.xpEarned,
      likes: currentState.likes + video.likes
    })));
  };

  const handleVideoEnd = (streamId: string) => {
    // Logic for video ending - could trigger XP distribution
    console.log(`Video ended in stream ${streamId}`);
  };

  const handleBetOnWinner = () => {
    if (activeStreams.length < 2) {
      toast({
        title: "Need multiple streams",
        description: "Switch to split view to bet on which stream will win",
        variant: "destructive"
      });
      return;
    }
  };

  const getStreamContainerClass = () => {
    switch (viewMode) {
      case 'single':
        return 'grid-cols-1';
      case 'split-2':
        return 'grid-cols-1 sm:grid-cols-2';
      case 'split-3':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1';
    }
  };

  const getLeadingStream = () => {
    if (activeStreams.length < 2) return null;
    
    let leadingStream = activeStreams[0];
    let maxXP = streamStates.get(activeStreams[0].id)?.xp || 0;
    
    activeStreams.forEach(stream => {
      const xp = streamStates.get(stream.id)?.xp || 0;
      if (xp > maxXP) {
        maxXP = xp;
        leadingStream = stream;
      }
    });
    
    return leadingStream;
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Back Button */}
      {onBack && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full backdrop-blur-sm bg-black/80 border-white/20 hover:bg-white/20 shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </Button>
        </div>
      )}

      {/* Competition Mode Indicator */}
      {activeStreams.length > 1 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 sm:top-4 z-40">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-1 sm:px-6 sm:py-2 rounded-full shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2 text-white font-bold text-xs sm:text-base">
              <Trophy className="w-3 h-3 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">COMPETITION MODE</span>
              <span className="sm:hidden">BATTLE</span>
              <Trophy className="w-3 h-3 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Bet on Winner Button */}
      {activeStreams.length > 1 && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 sm:top-20 z-40">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                disabled={!isConnected}
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Bet on Winner</span>
                <span className="sm:hidden">Bet</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base">Bet on Winning Stream</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Choose which stream will have the most XP and engagement
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3 sm:space-y-4">
                {activeStreams.map(stream => {
                  const state = streamStates.get(stream.id) || { xp: 0, likes: 0 };
                  return (
                    <div key={stream.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          style={{ backgroundColor: stream.tag.color }}
                          className="text-xs sm:text-sm px-2 py-1"
                        >
                          {stream.tag.displayName}
                        </Badge>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {state.xp} XP
                        </div>
                      </div>
                      <BasePay
                        amount={10}
                        onSuccess={() => {
                          toast({
                            title: "Bet placed!",
                            description: `Betting on ${stream.tag.displayName} to win`
                          });
                        }}
                      >
                        <span className="text-xs sm:text-sm">Bet $10 on {stream.tag.displayName}</span>
                      </BasePay>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Stream Grid */}
      <div className={`grid ${getStreamContainerClass()} h-full gap-0.5 sm:gap-1`}>
        {activeStreams.map((stream, index) => {
          const state = streamStates.get(stream.id) || { xp: 0, likes: 0 };
          const isLeading = activeStreams.length > 1 && getLeadingStream()?.id === stream.id;
          
          return (
            <div 
              key={stream.id} 
              className={`relative ${isLeading ? 'ring-2 sm:ring-4 ring-yellow-400' : ''}`}
            >
              <StreamPlayer
                stream={stream}
                onVideoChange={handleVideoChange}
                onVideoEnd={handleVideoEnd}
                autoPlay={true}
                className="h-full w-full"
              />
              
              {/* Stream Stats Overlay for Multi-View */}
              {activeStreams.length > 1 && (
                <div className="absolute bottom-16 sm:bottom-24 left-2 right-2 sm:left-4 sm:right-4 z-30 bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                  <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                      <span className="font-bold">{state.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      <span>{state.likes.toLocaleString()} likes</span>
                    </div>
                  </div>
                  {isLeading && (
                    <div className="mt-1 sm:mt-2 text-center">
                      <Badge className="bg-yellow-500 text-black font-bold text-xs">
                        🏆 LEADING
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stream Selector for switching streams */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 sm:bottom-4 z-40 max-w-[95vw] overflow-x-auto">
        <div className="flex gap-1 sm:gap-2 bg-black/80 backdrop-blur-sm p-1 sm:p-2 rounded-full">
          {availableStreams.slice(0, 6).map(stream => (
            <button
              key={stream.id}
              onClick={() => {
                // Replace the first stream with this one
                const newStreams = [...activeStreams];
                newStreams[0] = stream;
                setActiveStreams(newStreams);
              }}
              className={`px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeStreams.some(s => s.id === stream.id)
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              style={{
                backgroundColor: activeStreams.some(s => s.id === stream.id)
                  ? stream.tag.color
                  : 'transparent'
              }}
            >
              {stream.tag.displayName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
