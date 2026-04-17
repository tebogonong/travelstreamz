import { useState, useEffect } from "react";
import { Stream, VideoContent } from "@/types/video";
import { StreamPlayer } from "./StreamPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy,
  Sparkles,
  Zap,
  Coins,
  DollarSign,
  ArrowLeft
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BasePay } from "./BasePay";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

interface SlotMachineViewerProps {
  streams: Stream[];
  onBack?: () => void;
}

type SlotPosition = {
  streamIndex: number;
  videoIndex: number;
  isSpinning: boolean;
};

type MatchType = 'location' | 'category' | 'creator' | 'tag' | 'jackpot' | null;

interface WinResult {
  type: MatchType;
  multiplier: number;
  payout: number;
  message: string;
}

export const SlotMachineViewer = ({ streams, onBack }: SlotMachineViewerProps) => {
  const [slotPositions, setSlotPositions] = useState<SlotPosition[]>([
    { streamIndex: 0, videoIndex: 0, isSpinning: false },
    { streamIndex: 1, videoIndex: 0, isSpinning: false },
    { streamIndex: 2, videoIndex: 0, isSpinning: false }
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [balance, setBalance] = useState(100.00);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const { isConnected } = useAccount();
  const { toast } = useToast();

  const SPIN_COST = 1.00;
  const SPIN_DURATION = 3000; // 3 seconds
  const SLOT_DELAY = 500; // Delay between each slot stopping

  // Get current videos for center alignment
  const getCenterVideos = (): VideoContent[] => {
    return slotPositions.map(pos => {
      const stream = streams[pos.streamIndex];
      return stream.videos[pos.videoIndex];
    });
  };

  // Check for matches in center alignment
  const checkForMatches = (): WinResult | null => {
    const centerVideos = getCenterVideos();
    
    // Jackpot - All three videos from same creator
    if (
      centerVideos[0].creator.id === centerVideos[1].creator.id &&
      centerVideos[1].creator.id === centerVideos[2].creator.id
    ) {
      return {
        type: 'jackpot',
        multiplier: 100,
        payout: SPIN_COST * 100,
        message: '🎰 JACKPOT! Same Creator Triple Match!'
      };
    }

    // Location match - All same location
    if (
      centerVideos[0].location.name === centerVideos[1].location.name &&
      centerVideos[1].location.name === centerVideos[2].location.name
    ) {
      return {
        type: 'location',
        multiplier: 50,
        payout: SPIN_COST * 50,
        message: '🌍 LOCATION TRIPLE! Same Location Match!'
      };
    }

    // Tag match - All share same tag
    const commonTag = centerVideos[0].streamTags.find(tag =>
      centerVideos[1].streamTags.includes(tag) &&
      centerVideos[2].streamTags.includes(tag)
    );
    if (commonTag) {
      return {
        type: 'tag',
        multiplier: 25,
        payout: SPIN_COST * 25,
        message: `🏷️ TAG MATCH! #${commonTag} across all reels!`
      };
    }

    // Category match - All share same category
    const commonCategory = centerVideos[0].categories.find(cat =>
      centerVideos[1].categories.includes(cat) &&
      centerVideos[2].categories.includes(cat)
    );
    if (commonCategory) {
      return {
        type: 'category',
        multiplier: 15,
        payout: SPIN_COST * 15,
        message: `🎯 CATEGORY MATCH! All ${commonCategory}!`
      };
    }

    // Two matching creators
    if (
      centerVideos[0].creator.id === centerVideos[1].creator.id ||
      centerVideos[1].creator.id === centerVideos[2].creator.id ||
      centerVideos[0].creator.id === centerVideos[2].creator.id
    ) {
      return {
        type: 'creator',
        multiplier: 5,
        payout: SPIN_COST * 5,
        message: '👥 CREATOR PAIR! Two matching creators!'
      };
    }

    return null;
  };

  const spinSlots = async () => {
    if (balance < SPIN_COST) {
      toast({
        title: "Insufficient balance",
        description: "Add funds to continue playing",
        variant: "destructive"
      });
      setShowPayDialog(true);
      return;
    }

    if (isSpinning) return;

    // Deduct spin cost
    setBalance(prev => prev - SPIN_COST);
    setIsSpinning(true);
    setWinResult(null);
    setSpinCount(prev => prev + 1);

    // Start all slots spinning
    setSlotPositions(prev => prev.map(pos => ({ ...pos, isSpinning: true })));

    // Stop each slot sequentially
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        setSlotPositions(prev => {
          const newPositions = [...prev];
          const stream = streams[newPositions[i].streamIndex];
          
          // Random video from the stream
          const randomVideoIndex = Math.floor(Math.random() * stream.videos.length);
          
          newPositions[i] = {
            ...newPositions[i],
            videoIndex: randomVideoIndex,
            isSpinning: false
          };
          
          return newPositions;
        });
      }, SPIN_DURATION + (i * SLOT_DELAY));
    }

    // Check for wins after all slots stop
    setTimeout(() => {
      setIsSpinning(false);
      const result = checkForMatches();
      
      if (result) {
        setWinResult(result);
        setBalance(prev => prev + result.payout);
        setTotalWinnings(prev => prev + result.payout);
        
        toast({
          title: "🎉 YOU WIN!",
          description: result.message,
          duration: 5000,
        });
      }
    }, SPIN_DURATION + (3 * SLOT_DELAY) + 500);
  };

  const handleAddFunds = () => {
    setShowPayDialog(true);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-purple-900 via-pink-900 to-red-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-20 animate-pulse" />
      
      {/* Back Button */}
      {onBack && (
        <div className="absolute top-4 left-4 z-[60]">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full backdrop-blur-sm bg-black/90 border-white/30 hover:bg-white/30 shadow-2xl"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}

      {/* Top Bar - Stats */}
      <div className="absolute top-0 left-0 right-0 z-50 p-2 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-6">
            <div className="bg-yellow-500/90 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg">
              <div className="flex items-center gap-2 text-black font-bold">
                <Coins className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-lg sm:text-2xl">${balance.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
              <div className="flex items-center gap-1 sm:gap-2 text-black font-semibold text-xs sm:text-base">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Won: ${totalWinnings.toFixed(2)}</span>
              </div>
            </div>

            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm text-white border-white/30 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
              Spins: {spinCount}
            </Badge>
          </div>

          <Button
            onClick={handleAddFunds}
            variant="outline"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-xs sm:text-sm"
          >
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Add Funds
          </Button>
        </div>
      </div>

      {/* Slot Machine Frame */}
      <div className="absolute inset-0 flex items-center justify-center pt-20 sm:pt-32 pb-32 sm:pb-40 px-2">
        <div className="relative w-full max-w-6xl">
          {/* Decorative Frame */}
          <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl opacity-80 blur-xl animate-pulse" />
          
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl sm:rounded-3xl p-2 sm:p-8 shadow-2xl border-2 sm:border-4 border-yellow-400">
            {/* Center Alignment Indicator with Ticker Symbols */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <div className="relative h-24 sm:h-32 border-t-4 border-b-4 border-yellow-400 bg-yellow-400/10 backdrop-blur-sm">
                {/* Match Line Label */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <Badge className="bg-yellow-400 text-black font-bold text-xs sm:text-base px-3 py-1 shadow-lg">
                    🎯 MATCH LINE 🎯
                  </Badge>
                </div>
                
                {/* Center Ticker Symbols */}
                <div className="grid grid-cols-3 h-full items-center px-1 sm:px-4">
                  {slotPositions.map((position, index) => {
                    const stream = streams[position.streamIndex];
                    const video = stream.videos[position.videoIndex];
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-center h-full"
                      >
                        <div className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                          position.isSpinning ? 'opacity-50 blur-sm' : 'opacity-100'
                        }`}>
                          {/* Token Symbol Badge */}
                          <Badge 
                            className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-black text-base sm:text-2xl px-3 py-1.5 sm:px-6 sm:py-3 shadow-2xl border-2 border-white/50"
                          >
                            ${video.token.symbol}
                          </Badge>
                          {/* Location Name */}
                          <span className="text-white text-[10px] sm:text-sm font-bold bg-black/80 px-2 py-0.5 rounded-full shadow-lg">
                            {video.location.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Winning Highlight Overlay */}
                {winResult && (
                  <div className="absolute inset-0 bg-yellow-400/30 animate-pulse border-t-4 border-b-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
                )}
              </div>
            </div>

            {/* Three Slot Reels */}
            <div className="grid grid-cols-3 gap-1 sm:gap-4">
              {slotPositions.map((position, index) => {
                const stream = streams[position.streamIndex];
                const video = stream.videos[position.videoIndex];

                return (
                  <div
                    key={index}
                    className="relative w-full aspect-[9/16] sm:w-80 sm:h-[600px] rounded-lg sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-gray-700 shadow-xl"
                  >
                    {/* Spinning Effect Overlay */}
                    {position.isSpinning && (
                      <div className="absolute inset-0 z-40 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-slide-down pointer-events-none" />
                    )}
                    
                    {/* Center Zone Highlight */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-24 sm:h-32 z-20 pointer-events-none">
                      <div className="h-full border-l-2 border-r-2 border-yellow-400/30 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent" />
                    </div>
                    
                    {/* Slot Number Badge */}
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-30 bg-gradient-to-br from-purple-600 to-pink-600 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg border border-white/30">
                      <span className="text-white font-bold text-xs sm:text-sm">REEL {index + 1}</span>
                    </div>
                    
                    {/* Current Stream Tag */}
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-30 bg-black/80 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg border border-white/20">
                      <span className="text-white font-bold text-xs sm:text-sm">#{stream.tag.name}</span>
                    </div>

                    {/* Video Stream */}
                    <div className={`h-full transition-all duration-300 ${
                      position.isSpinning ? 'blur-md scale-95' : 'blur-0 scale-100'
                    }`}>
                      <StreamPlayer
                        stream={stream}
                        onVideoChange={() => {}}
                        onVideoEnd={() => {}}
                        autoPlay={false}
                        className="h-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Button
          onClick={spinSlots}
          disabled={isSpinning || balance < SPIN_COST || !isConnected}
          size="lg"
          className={`h-16 w-16 sm:h-24 sm:w-24 rounded-full text-lg sm:text-2xl font-bold shadow-2xl transition-all duration-300 ${
            isSpinning
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 hover:scale-110 animate-pulse'
          }`}
        >
          {isSpinning ? (
            <div className="animate-spin text-2xl sm:text-4xl">⟳</div>
          ) : (
            <div className="flex flex-col items-center">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mb-0.5 sm:mb-1" />
              <span className="text-xs sm:text-sm">SPIN</span>
              <span className="text-[10px] sm:text-xs">${SPIN_COST}</span>
            </div>
          )}
        </Button>
      </div>

      {/* Win Notification */}
      {winResult && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-zoom-in px-4">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border-4 sm:border-8 border-white max-w-sm sm:max-w-2xl">
            <div className="text-center space-y-2 sm:space-y-4">
              <div className="text-4xl sm:text-6xl animate-bounce">🎉</div>
              <h2 className="text-xl sm:text-4xl font-bold text-black">{winResult.message}</h2>
              
              {/* Show Matched Symbols */}
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                {getCenterVideos().map((video, idx) => (
                  <div key={idx} className="flex items-center">
                    <Badge className="bg-blue-600 text-white font-black text-lg sm:text-3xl px-3 py-2 sm:px-6 sm:py-4 shadow-lg">
                      ${video.token.symbol}
                    </Badge>
                    {idx < 2 && <span className="text-black text-2xl sm:text-4xl mx-1 sm:mx-2">•</span>}
                  </div>
                ))}
              </div>
              
              <div className="text-4xl sm:text-6xl font-bold text-black">
                ${winResult.payout.toFixed(2)}
              </div>
              <Badge className="bg-black text-yellow-400 text-base sm:text-xl px-4 py-1 sm:px-6 sm:py-2">
                {winResult.multiplier}x Multiplier
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Paytable */}
      <div className="absolute bottom-20 left-2 sm:bottom-8 sm:left-8 z-40 bg-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-yellow-400/50 max-w-[180px] sm:max-w-none">
        <h3 className="text-yellow-400 font-bold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
          PAYTABLE
        </h3>
        <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-sm text-white">
          <div>🎰 Creator x3: <span className="text-yellow-400">100x</span></div>
          <div>🌍 Location x3: <span className="text-green-400">50x</span></div>
          <div>🏷️ Tag x3: <span className="text-blue-400">25x</span></div>
          <div>🎯 Category x3: <span className="text-purple-400">15x</span></div>
          <div>👥 Pair: <span className="text-pink-400">5x</span></div>
        </div>
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds to Play</DialogTitle>
            <DialogDescription>
              Purchase credits to continue playing the slot machine
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {[10, 25, 50, 100].map(amount => (
              <BasePay
                key={amount}
                amount={amount}
                onSuccess={() => {
                  setBalance(prev => prev + amount);
                  setShowPayDialog(false);
                  toast({
                    title: "Funds added!",
                    description: `Added $${amount} to your balance`
                  });
                }}
              >
                Add ${amount}
              </BasePay>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
