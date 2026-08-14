import { useRef, useState } from "react";
import { ArrowLeft, Crown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import BgSibrax from "../assets/bg-sibrax.png";
import LogoSibrax from "../assets/logo-sibrax-branco.png";
import LogoConviver from "../assets/logo-conviver.png";
import Selo32Anos from "../assets/selo-32-anos.png";
import PrizeCard from "../components/PrizeCard";
import { JACKPOT_INDEX, PRIZES } from "../config/prizes";
import { pickPrizeIndex } from "../config/prizeChances";
import { loadGameSettings, type GameSettings } from "../config/gameSettings";
import { loadParticipante } from "../config/participante";

const CELL = 240;
const REEL_W = 260;
const REPEATS = 14;

const symbols = PRIZES;

const JACKPOT_CELEBRATION_MS = 4600;

const GOLD_CONFETTI = ["#ffd700", "#ffb300", "#fff3b0", "#f05f0c", "#ffffff"];

function fireJackpotConfetti() {
    confetti({
        particleCount: 180,
        spread: 95,
        angle: 60,
        origin: { x: 0, y: 0.75 },
        colors: GOLD_CONFETTI,
        scalar: 1.4,
        startVelocity: 60,
    });
    confetti({
        particleCount: 180,
        spread: 95,
        angle: 120,
        origin: { x: 1, y: 0.75 },
        colors: GOLD_CONFETTI,
        scalar: 1.4,
        startVelocity: 60,
    });

    const end = Date.now() + JACKPOT_CELEBRATION_MS - 900;

    const rain = () => {
        confetti({
            particleCount: 7,
            startVelocity: 25,
            spread: 360,
            ticks: 220,
            gravity: 0.85,
            scalar: 1.2,
            origin: { x: Math.random(), y: -0.1 },
            colors: GOLD_CONFETTI,
        });

        if (Date.now() < end) requestAnimationFrame(rain);
    };

    rain();
}

const L = symbols.length;

const STRIP = Array.from({ length: REPEATS * L }, (_, i) => symbols[i % L]);

const centerPos = (t: number) => (t - 1 + L) % L;

const SPIN_MS = [2200, 2800, 3400];

export default function SlotMachine() {
     const [settings] = useState<GameSettings>(() => loadGameSettings());
    const MAX_ATTEMPTS = settings.maxAttempts;
    const WIN_CHANCE = settings.winChance;

     
    const [participante] = useState(() => loadParticipante());
    const permitirJackpot = participante?.eCliente !== 1;

    const [positions, setPositions] = useState([
        centerPos(0),
        centerPos(1),
        centerPos(2),
    ]);
    const [snap, setSnap] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [won, setWon] = useState(false);
    const [jackpot, setJackpot] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const posRef = useRef(positions);
    const navigate = useNavigate();

    const getRandomSymbol = () => Math.floor(Math.random() * L);

    const drawResult = () => {
        if (Math.random() < WIN_CHANCE) {
           
            const s = pickPrizeIndex(settings.prizeChances, { permitirJackpot });
            return [s, s, s];
        }

        const a = getRandomSymbol();
        const b = getRandomSymbol();
        let c = getRandomSymbol();

        if (a === b && b === c) {
            c = (c + 1 + Math.floor(Math.random() * (L - 1))) % L;
        }

        return [a, b, c];
    };

    const spin = () => {
        if (spinning) return;
        if (attempts >= MAX_ATTEMPTS) return;

        setSpinning(true);
        setWon(false);
        setJackpot(false);
        setSnap(false);

        const target = drawResult();

        const next = posRef.current.map((pos, i) => {
            const loops = 6 + i * 2;
            const base = pos + loops * L;
            const delta = (centerPos(target[i]) - (base % L) + L) % L;
            return base + delta;
        });

        posRef.current = next;
        setPositions(next);

        window.setTimeout(() => {
            const normalized = target.map(centerPos);
            posRef.current = normalized;
            setSnap(true);
            setPositions(normalized);
            requestAnimationFrame(() => setSnap(false));

            const isThreeEqual = target[0] === target[1] && target[1] === target[2];

            if (isThreeEqual) {
                const isJackpot = target[0] === JACKPOT_INDEX;

                setWon(true);
                setJackpot(isJackpot);
                setSpinning(false);

                if (isJackpot) fireJackpotConfetti();

                // no jackpot a comemoração precisa de tempo para acontecer
                setTimeout(
                    () => {
                        navigate("/end", {
                            state: {
                                status: "win",
                                prizeId: symbols[target[0]].id,
                                jackpot: isJackpot,
                            },
                        });
                    },
                    isJackpot ? JACKPOT_CELEBRATION_MS : 1000,
                );

                return;
            }

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setSpinning(false);

                setTimeout(() => {
                    navigate("/end", { state: { status: "lost" } });
                }, 1000);

                return;
            }

            setSpinning(false);
        }, SPIN_MS[SPIN_MS.length - 1] + 150);
    };

    // no prêmio máximo os LEDs viram dourados e piscam bem mais rápido
    const ledClass = jackpot
        ? "bg-[#ffd700] shadow-[0_0_28px_10px_rgba(255,215,0,0.85)]"
        : "bg-[#f05f0c] shadow-[0_0_20px_5px_rgba(240,95,12,0.7)]";
    const ledSpeed = jackpot ? "0.32s" : "1.8s";
    const ledDelay = jackpot ? "0.16s" : "0.9s";

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden text-white">
            <img
                src={BgSibrax}
                alt=""
                aria-hidden
                className="pointer-events-none fixed inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none fixed inset-0 bg-[#2e4b82]/25" />
            <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#0b1730]/50 via-transparent to-[#0b1730]/85" />

            <img
                src={Selo32Anos}
                alt="Selo Sibrax 32 anos"
                className="fixed right-8 top-8 z-30 w-58 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            />

            <div className="relative z-10 flex min-h-screen flex-col items-center gap-10 px-6 pt-15 pb-10">
                {/* topo: voltar + logos */}
                <header className="relative flex w-full max-w-5xl flex-col items-center gap-6 px-8">
                    <NavLink
                        to="/"
                        className="absolute left-8 top-0 rounded-full border border-[#f05f0c]/50 bg-[#2e4b82]/60 p-3 backdrop-blur-sm transition-colors active:bg-[#f05f0c]/30"
                    >
                        <ArrowLeft color="#ffffff" size={35} />
                    </NavLink>

                    <img
                        src={LogoSibrax}
                        alt="Sibrax Software"
                        className="w-80 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />
                </header>

                <div className="flex flex-col items-center gap-3">
                    <h1 className="text-8xl font-bold italic tracking-tight uppercase drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
                        <span className="text-white">Slot </span>
                        <span className="text-[#f05f0c] drop-shadow-[0_0_28px_rgba(240,95,12,0.55)]">
                            Machine
                        </span>
                    </h1>

                    <div className="flex items-center gap-3 text-xl text-white/60">
                        <span className="h-2 w-2 rounded-full bg-[#45b552] shadow-[0_0_10px_2px_rgba(69,181,82,0.8)]" />
                        Tentativas: {attempts}/{MAX_ATTEMPTS}
                    </div>
                </div>

                <div className="relative">
                    {/* raios de luz girando atrás da máquina — só no prêmio máximo */}
                    {jackpot && (
                        <div
                            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[1800px] w-[1800px] -translate-x-1/2 -translate-y-1/2 opacity-45"
                            style={{
                                background:
                                    "repeating-conic-gradient(from 0deg,rgba(255,215,0,0.55) 0deg 9deg,transparent 9deg 22deg)",
                                maskImage:
                                    "radial-gradient(circle,#000 12%,rgba(0,0,0,0.5) 40%,transparent 70%)",
                                WebkitMaskImage:
                                    "radial-gradient(circle,#000 12%,rgba(0,0,0,0.5) 40%,transparent 70%)",
                                animation: "jackpot-rays 12s linear infinite",
                            }}
                        />
                    )}

                    {/* brilho ambiente atrás do gabinete */}
                    <div
                        className={`absolute -inset-10 rounded-[3.5rem] blur-3xl transition-colors duration-500 ${
                            jackpot
                                ? "bg-[#ffd700]/60"
                                : won
                                  ? "bg-[#45b552]/35"
                                  : "bg-[#f05f0c]/20"
                        }`}
                        style={
                            jackpot
                                ? { animation: "jackpot-glow 0.7s ease-in-out infinite" }
                                : undefined
                        }
                    />

                    {/* gabinete */}
                    <div
                        className={`relative rounded-[2.75rem] border-2 bg-gradient-to-b from-[#2e4b82] via-[#223a68] to-[#16264a] p-6 transition-colors duration-300 ${
                            jackpot
                                ? "border-[#ffd700] shadow-[0_30px_70px_rgba(0,0,0,0.55),0_0_60px_18px_rgba(255,215,0,0.45),inset_0_2px_0_rgba(255,255,255,0.3)]"
                                : "border-[#f05f0c]/60 shadow-[0_30px_70px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.18),inset_0_-4px_14px_rgba(0,0,0,0.45)]"
                        }`}
                        style={
                            jackpot
                                ? { animation: "jackpot-shake 0.55s ease-in-out 4" }
                                : undefined
                        }
                    >
                        {/* barra de luz superior */}
                        <div
                            className={`mx-auto mb-5 h-2.5 w-[82%] rounded-full ${ledClass}`}
                            style={{
                                animation: `slot-glow ${ledSpeed} ease-in-out infinite`,
                            }}
                        />

                        {/* moldura interna escura */}
                        <div className="relative rounded-3xl bg-[#101d3a] p-3.5 shadow-[inset_0_8px_26px_rgba(0,0,0,0.75)]">
                            {/* luzes verticais laterais */}
                            <div
                                className={`absolute left-2.5 top-1/2 h-[70%] w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${ledClass}`}
                                style={{
                                    animation: `slot-glow ${ledSpeed} ease-in-out infinite`,
                                }}
                            />
                            <div
                                className={`absolute right-2.5 top-1/2 h-[70%] w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full ${ledClass}`}
                                style={{
                                    animation: `slot-glow ${ledSpeed} ease-in-out infinite ${ledDelay}`,
                                }}
                            />

                            <div className="flex gap-3.5">
                                {positions.map((pos, i) => (
                                    <div
                                        key={i}
                                        className="relative overflow-hidden rounded-2xl bg-[#16264a] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.06)]"
                                        style={{ width: REEL_W, height: CELL * 3 }}
                                    >
                                        {/* fita de símbolos */}
                                        <div
                                            className="will-change-transform"
                                            style={{
                                                transform: `translate3d(0, ${-pos * CELL}px, 0)`,
                                                transitionProperty: "transform",
                                                transitionDuration: snap ? "0ms" : `${SPIN_MS[i]}ms`,
                                                transitionTimingFunction:
                                                    "cubic-bezier(0.12, 0.62, 0.16, 1)",
                                                filter: spinning ? "blur(1.5px)" : "none",
                                            }}
                                        >
                                            {STRIP.map((symbol, j) => (
                                                <div
                                                    key={`${symbol.id}-${j}`}
                                                    className="p-2"
                                                    style={{ height: CELL }}
                                                >
                                                    <PrizeCard prize={symbol} size={CELL} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* curvatura do cilindro */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b1730]/75 via-transparent to-[#0b1730]/75" />
                                        {/* reflexo lateral do vidro */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-[#0b1730]/25" />

                                        {/* linha de pagamento */}
                                        <div
                                            className={`pointer-events-none absolute left-0 right-0 border-y transition-colors duration-300 ${
                                                jackpot
                                                    ? "border-[#ffd700]"
                                                    : won
                                                      ? "border-[#45b552]"
                                                      : "border-[#f05f0c]/30"
                                            }`}
                                            style={{ top: CELL, height: CELL }}
                                        />

                                       
                                        {won && (
                                            <div
                                                className={`pointer-events-none absolute left-0 right-0 ${
                                                    jackpot
                                                        ? "border-[6px] border-[#ffd700] shadow-[0_0_50px_18px_rgba(255,215,0,0.75),inset_0_0_45px_rgba(255,215,0,0.6)]"
                                                        : "border-4 border-[#45b552] shadow-[0_0_30px_10px_rgba(69,181,82,0.55),inset_0_0_30px_rgba(69,181,82,0.45)]"
                                                }`}
                                                style={{
                                                    top: CELL,
                                                    height: CELL,
                                                    animation: `slot-win-flash ${
                                                        jackpot ? ".28s" : ".5s"
                                                    } ease-in-out infinite`,
                                                }}
                                            />
                                        )}

                                        {/* faíscas subindo na célula premiada */}
                                        {jackpot &&
                                            [0, 1, 2, 3, 4].map((k) => (
                                                <span
                                                    key={k}
                                                    className="pointer-events-none absolute h-2 w-2 rounded-full bg-[#ffe680] shadow-[0_0_12px_4px_rgba(255,215,0,0.9)]"
                                                    style={{
                                                        left: `${12 + k * 19}%`,
                                                        top: CELL * 2 - 10,
                                                        animation: `jackpot-spark 1.6s ease-out ${
                                                            k * 0.22
                                                        }s infinite`,
                                                    }}
                                                />
                                            ))}
                                    </div>
                                ))}
                            </div>

                            {/* reflexo diagonal que percorre o vidro */}
                            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                                <div
                                    className="h-full w-1/4 bg-white/12"
                                    style={{ animation: "slot-shine 4.5s ease-in-out infinite" }}
                                />
                            </div>
                        </div>

                        {/* barra de luz inferior */}
                        <div
                            className={`mx-auto mt-5 h-2.5 w-[82%] rounded-full ${ledClass}`}
                            style={{
                                animation: `slot-glow ${ledSpeed} ease-in-out infinite ${ledDelay}`,
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={spin}
                    disabled={spinning || attempts >= MAX_ATTEMPTS}
                    className="rounded-full bg-gradient-to-b from-[#ff7a29] to-[#f05f0c] px-12 py-4 text-3xl font-bold italic tracking-widest uppercase text-white shadow-[0_12px_30px_rgba(240,95,12,0.45),inset_0_2px_0_rgba(255,255,255,0.35)] transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {spinning ? "Girando..." : "Girar"}
                </button>

                <div className="mt-5 flex flex-col items-center gap-1 text-center">
                    <h2 className="text-7xl font-black italic tracking-tight uppercase leading-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                        Acerte 3 iguais
                    </h2>
                    <h2 className="text-7xl font-black italic tracking-tight uppercase leading-tight text-[#f05f0c] drop-shadow-[0_0_24px_rgba(240,95,12,0.45)]">
                        e ganhe um prêmio!
                    </h2>

                  
                </div>

                <div className="mt-auto flex w-full max-w-5xl flex-col items-center px-8">
                    <img
                        src={LogoConviver}
                        alt="Conviver - App de Condomínios"
                        className="w-130 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />
                </div>
            </div>

            {/* ---------- COMEMORAÇÃO DO PRÊMIO MÁXIMO ---------- */}
            {jackpot && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
                    {/* clarão dourado inicial */}
                    <div
                        className="absolute inset-0 bg-[#ffe27a]/25"
                        style={{ animation: "jackpot-flash 1.1s ease-out 2" }}
                    />

                    {/* halo pulsando atrás do banner */}
                    <div
                        className="absolute h-[900px] w-[900px] rounded-full bg-[#ffd700]/20 blur-[120px]"
                        style={{ animation: "jackpot-glow 0.9s ease-in-out infinite" }}
                    />

                    {/* banner */}
                    <div
                        className="relative flex flex-col items-center gap-4 px-10 text-center"
                        style={{ animation: "jackpot-pop 0.8s cubic-bezier(.2,1.4,.4,1) both" }}
                    >
                        <Crown
                            size={110}
                            color="#ffd700"
                            strokeWidth={2}
                            className="drop-shadow-[0_0_35px_rgba(255,215,0,0.95)]"
                        />

                        <h2
                            className="text-8xl font-black italic uppercase leading-[0.95] tracking-tight text-transparent drop-shadow-[0_8px_30px_rgba(0,0,0,0.65)]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(100deg,#a86f00,#ffd700,#fff6c2,#ffd700,#a86f00)",
                                backgroundSize: "200% 100%",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                animation: "gold-text-shine 2s linear infinite",
                            }}
                        >
                            Prêmio
                            <br />
                            Máximo!
                        </h2>

                        <p className="text-3xl font-bold tracking-[0.3em] uppercase text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
                            Você acertou o maior prêmio
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}
