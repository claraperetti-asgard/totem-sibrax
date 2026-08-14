import { Crown } from "lucide-react";
import type { Prize } from "../config/prizes";


export default function PrizeCard({ prize, size }: { prize: Prize; size: number }) {
    if (prize.jackpot) return <JackpotFace size={size} />;

    return (
  
        <div
            className="relative h-full w-full overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(0,0,0,0.18)]"
            style={{ backgroundColor: prize.bg }}
        >
            {prize.imageFill ? (
               
                <img
                    src={prize.image}
                    alt={prize.label}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/25" />

            {!prize.imageFill && (
                <div className="relative flex h-full w-full items-center justify-center p-6">
                    <img
                        src={prize.image}
                        alt={prize.label}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
                    />
                </div>
            )}
        </div>
    );
}

function JackpotFace({ size }: { size: number }) {
    return (
        <div
            className="relative h-full w-full overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.75),inset_0_0_0_1px_rgba(120,75,0,0.45),0_0_18px_rgba(255,200,60,0.35)]"
            style={{
                background:
                    "linear-gradient(150deg,#8a5a00 0%,#dfa416 16%,#ffe98f 34%,#f7c948 48%,#b87700 66%,#ffdd6b 84%,#8a5a00 100%)",
            }}
        >
            {/* brilho varrendo o ouro */}
            <div
                className="pointer-events-none absolute -inset-y-1/2 left-0 w-1/4 bg-white/50 blur-md"
                style={{ animation: "gold-shimmer 2.8s linear infinite" }}
            />

            <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
                <Crown
                    size={size * 0.24}
                    color="#5c3200"
                    strokeWidth={2}
                    className="drop-shadow-[0_2px_0_rgba(255,255,255,0.5)]"
                />
                <span
                    className="font-black italic uppercase leading-none tracking-tight text-[#5c3200] drop-shadow-[0_1px_0_rgba(255,255,255,0.55)]"
                    style={{ fontSize: size * 0.14 }}
                >
                    Prêmio
                </span>
                <span
                    className="font-black italic uppercase leading-none tracking-tight text-[#5c3200] drop-shadow-[0_1px_0_rgba(255,255,255,0.55)]"
                    style={{ fontSize: size * 0.185 }}
                >
                    Máximo
                </span>
            </div>
        </div>
    );
}
