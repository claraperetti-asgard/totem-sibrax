import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Crown, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import BgSibrax from "../assets/bg-sibrax.png";
import LogoSibrax from "../assets/logo-sibrax-branco.png";
import LogoConviver from "../assets/logo-conviver.png";
import Selo32Anos from "../assets/selo-32-anos.png";
import { getPrize } from "../config/prizes";
import { clearParticipante } from "../config/participante";

const SIBRAX_CONFETTI = ["#f05f0c", "#2465b5", "#45b552", "#02bae8", "#ffffff"];
const GOLD_CONFETTI = ["#ffd700", "#ffb300", "#fff3b0", "#f05f0c", "#ffffff"];

export default function EndScreen() {
    const { state } = useLocation();

    const status = state?.status;
    const prize = getPrize(state?.prizeId);
    const isWin = status === "win";
    const isJackpot = isWin && Boolean(prize?.jackpot);

    // a partida acabou: o próximo participante não pode herdar este
    useEffect(() => {
        clearParticipante();
    }, []);

    useEffect(() => {
        if (!isWin) return;

        const colors = isJackpot ? GOLD_CONFETTI : SIBRAX_CONFETTI;

        confetti({
            particleCount: isJackpot ? 220 : 150,
            spread: isJackpot ? 100 : 70,
            origin: { y: 0.6 },
            scalar: isJackpot ? 1.4 : 1,
            colors,
        });

        const end = Date.now() + (isJackpot ? 5000 : 3000);

        let cancelled = false;

        const frame = () => {
            if (cancelled) return;

            confetti({
                particleCount: isJackpot ? 4 : 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors,
            });
            confetti({
                particleCount: isJackpot ? 4 : 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors,
            });

            if (Date.now() < end) requestAnimationFrame(frame);
        };

        frame();

        return () => {
            cancelled = true;
        };
    }, [isWin, isJackpot]);

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden text-white">
            {/* ---------- FUNDO ---------- */}
            <img
                src={BgSibrax}
                alt=""
                aria-hidden
                className="pointer-events-none fixed inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none fixed inset-0 bg-[#2e4b82]/25" />
            <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#0b1730]/50 via-transparent to-[#0b1730]/85" />

            {/* ---------- SELO 32 ANOS (canto superior direito) ---------- */}
            <img
                src={Selo32Anos}
                alt="Selo Sibrax 32 anos"
                className="fixed right-8 top-8 z-30 w-64 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            />

            {/* ---------- CONTEÚDO ---------- */}
            <div className="relative z-10 flex min-h-screen flex-col items-center gap-10 px-6 pt-15 pb-10">
                <header className="flex w-full max-w-5xl flex-col items-center px-8">
                    <img
                        src={LogoSibrax}
                        alt="Sibrax Software"
                        className="w-90 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />
                </header>

                <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
                    {isWin ? (
                        <WinContent prize={prize} isJackpot={isJackpot} />
                    ) : (
                        <LostContent />
                    )}

                    <NavLink
                        to="/"
                        className="flex items-center gap-4 rounded-full bg-gradient-to-b from-[#ff7a29] to-[#f05f0c] px-12 py-4 text-3xl font-bold italic tracking-widest uppercase text-white shadow-[0_12px_30px_rgba(240,95,12,0.45),inset_0_2px_0_rgba(255,255,255,0.35)] transition-transform duration-200 active:scale-95"
                    >
                        <RotateCcw size={32} />
                        Jogar novamente
                    </NavLink>
                </div>

                <div className="mt-auto flex w-full max-w-5xl flex-col items-center px-8">
                    <img
                        src={LogoConviver}
                        alt="Conviver - App de Condomínios"
                        className="w-135 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />
                </div>
            </div>
        </div>
    );
}

function WinContent({
    prize,
    isJackpot,
}: {
    prize: ReturnType<typeof getPrize>;
    isJackpot: boolean;
}) {
    return (
        <>
            {isJackpot ? (
                <div className="flex flex-col items-center gap-4">
                    <Crown
                        size={90}
                        color="#ffd700"
                        strokeWidth={2}
                        className="drop-shadow-[0_0_35px_rgba(255,215,0,0.95)]"
                    />

                    <h1 className="text-6xl font-black italic uppercase tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                        Parabéns! Você ganhou o
                    </h1>

                    <p
                        className="text-8xl font-black italic uppercase leading-none tracking-tight text-transparent drop-shadow-[0_8px_30px_rgba(0,0,0,0.65)]"
                        style={{
                            backgroundImage:
                                "linear-gradient(100deg,#a86f00,#ffd700,#fff6c2,#ffd700,#a86f00)",
                            backgroundSize: "200% 100%",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            animation: "gold-text-shine 2s linear infinite",
                        }}
                    >
                        Prêmio Máximo!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <h1 className="text-6xl font-black italic uppercase tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                        Parabéns! Você ganhou {prize?.article ?? "um"}
                    </h1>

                    <p className="text-8xl font-black italic uppercase leading-none tracking-tight text-[#f05f0c] drop-shadow-[0_0_28px_rgba(240,95,12,0.55)]">
                        {prize?.label ?? "Prêmio"}
                    </p>

                    <div className="mt-4 flex items-center gap-3 text-white/60">
                        <span className="h-2 w-2 rounded-full bg-[#45b552] shadow-[0_0_10px_2px_rgba(69,181,82,0.8)]" />
                        <span className="text-xl font-semibold tracking-[0.25em] uppercase">
                            Retire seu prêmio no estande
                        </span>
                        <span className="h-2 w-2 rounded-full bg-[#45b552] shadow-[0_0_10px_2px_rgba(69,181,82,0.8)]" />
                    </div>
                </div>
            )}
        </>
    );
}

function LostContent() {
    return (
        <div className="flex flex-col items-center gap-3">
            <h1 className="text-7xl font-black italic uppercase leading-tight tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                Não foi dessa vez!
            </h1>

            <p className="text-5xl font-black italic uppercase leading-tight tracking-tight text-[#f05f0c] drop-shadow-[0_0_24px_rgba(240,95,12,0.45)]">
                Você não acertou 3 iguais
            </p>

            <p className="mt-6 max-w-3xl text-3xl font-medium text-white/70">
                Passe no estande da Sibrax para conhecer mais..
            </p>
        </div>
    );
}
