import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface TouchInputState {
  accelerate: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
}

interface TouchControlsProps {
  onInput: (input: Partial<TouchInputState>) => void;
}

export function TouchControls({ onInput }: TouchControlsProps) {
  const handleStart = (key: keyof TouchInputState) => (e: React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    onInput({ [key]: true });
  };
  const handleEnd = (key: keyof TouchInputState) => (e: React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    onInput({ [key]: false });
  };

  const btn = (
    key: keyof TouchInputState,
    icon: React.ReactNode,
    label: string,
    className: string,
  ) => (
    <button
      className={`flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 active:bg-white/30 active:scale-95 transition-all touch-none select-none ${className}`}
      onPointerDown={handleStart(key)}
      onPointerUp={handleEnd(key)}
      onPointerLeave={handleEnd(key)}
      onPointerCancel={handleEnd(key)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {icon}
      <span className="text-[10px] font-bold text-white/70 mt-0.5">{label}</span>
    </button>
  );

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
      <div className="flex items-end justify-between p-4 pb-6">
        {/* Left: steering */}
        <div className="flex gap-3 pointer-events-auto">
          {btn("left", <ChevronLeft size={28} className="text-white" />, "GAUCHE", "w-16 h-16")}
          {btn("right", <ChevronRight size={28} className="text-white" />, "DROITE", "w-16 h-16")}
        </div>

        {/* Right: pedals */}
        <div className="flex gap-3 pointer-events-auto">
          {btn("brake", <ChevronDown size={28} className="text-red-400" />, "FREIN", "w-16 h-16")}
          {btn("accelerate", <ChevronUp size={28} className="text-green-400" />, "GAS", "w-20 h-20")}
        </div>
      </div>
    </div>
  );
}
