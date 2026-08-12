import { useState } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import LogoSibrax from "../assets/logo-sibrax-branco.png";
import Selo32Anos from "../assets/selo-32-anos.png";
import type { GameSettings } from "../config/gameSettings";
import { PRIZES } from "../config/prizes";
import {
    defaultPrizeChances,
    setPrizeChance,
    type PrizeChances,
} from "../config/prizeChances";

type Props = {
    settings: GameSettings;
    onSave: (settings: GameSettings) => void;
    onClose: () => void;
};

const MIN_ATTEMPTS = 1;
const MAX_ATTEMPTS_LIMIT = 10;
const CHANCE_STEP = 5;

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

// preenche a barra até a posição atual
const trackStyle = (value: number, min: number, max: number) => {
    const percent = ((value - min) / (max - min)) * 100;

    return {
        background: `linear-gradient(to right, #f05f0c ${percent}%, rgba(255,255,255,0.18) ${percent}%)`,
    };
};

export default function AcessoAdmin({ settings, onSave, onClose }: Props) {
    const [attempts, setAttempts] = useState(settings.maxAttempts);
    const [chance, setChance] = useState(Math.round(settings.winChance * 100));
    const [prizeChances, setPrizeChances] = useState<PrizeChances>(
        settings.prizeChances,
    );
    const [saved, setSaved] = useState(false);

    // mexer em um prêmio reacomoda os outros para o total continuar 100%
    const changePrize = (id: string, value: number) =>
        setPrizeChances((current) => setPrizeChance(current, id, value));

    const handleSave = () => {
        onSave({
            maxAttempts: attempts,
            winChance: chance / 100,
            prizeChances,
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        // cor chapada em vez da imagem de fundo: o painel rola, e um fundo
        // posicionado não acompanha o scroll
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1933] text-white">
            <div className="flex min-h-full w-full flex-col items-center gap-12 px-8 py-14">
                {/* topo: fechar + logo + selo, tudo no fluxo para rolar junto */}
                <div className="flex w-full max-w-5xl items-center justify-between gap-6">
                    <button
                        onClick={onClose}
                        className="shrink-0 rounded-full border border-[#f05f0c]/50 bg-[#2e4b82]/60 p-3 transition-colors active:bg-[#f05f0c]/30"
                    >
                        <X color="#ffffff" size={35} />
                    </button>

                    <img
                        src={LogoSibrax}
                        alt="Sibrax Software"
                        className="w-72 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />

                    <img
                        src={Selo32Anos}
                        alt="Selo Sibrax 32 anos"
                        className="w-32 shrink-0 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                    />
                </div>

                <div className="space-y-3 text-center">
                    <h1 className="text-5xl font-black italic uppercase tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                        <span className="text-white">Painel do </span>
                        <span className="text-[#f05f0c] drop-shadow-[0_0_24px_rgba(240,95,12,0.5)]">
                            Administrador
                        </span>
                    </h1>
                    <p className="text-2xl text-white/60">
                        Configurações da Slot Machine
                    </p>
                </div>

                <div className="w-full max-w-3xl space-y-14 rounded-3xl border border-[#f05f0c]/35 bg-gradient-to-b from-[#2e4b82] to-[#16264a] p-10 shadow-[0_30px_70px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.12)]">
                    {/* ---------- TENTATIVAS ---------- */}
                    <div className="space-y-6">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold">
                                    Tentativas por pessoa
                                </h2>
                                <p className="text-xl text-white/60">
                                    Quantos giros cada participante pode dar.
                                </p>
                            </div>

                            <span className="text-6xl font-black italic leading-none text-[#f05f0c] drop-shadow-[0_0_20px_rgba(240,95,12,0.5)]">
                                {attempts}
                            </span>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() =>
                                    setAttempts((v) =>
                                        clamp(v - 1, MIN_ATTEMPTS, MAX_ATTEMPTS_LIMIT)
                                    )
                                }
                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-5 active:bg-[#f05f0c]/30"
                            >
                                <Minus color="#ffffff" size={34} />
                            </button>

                            <input
                                type="range"
                                className="slot-range"
                                min={MIN_ATTEMPTS}
                                max={MAX_ATTEMPTS_LIMIT}
                                step={1}
                                value={attempts}
                                onChange={(e) => setAttempts(Number(e.target.value))}
                                style={trackStyle(
                                    attempts,
                                    MIN_ATTEMPTS,
                                    MAX_ATTEMPTS_LIMIT
                                )}
                            />

                            <button
                                onClick={() =>
                                    setAttempts((v) =>
                                        clamp(v + 1, MIN_ATTEMPTS, MAX_ATTEMPTS_LIMIT)
                                    )
                                }
                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-5 active:bg-[#f05f0c]/30"
                            >
                                <Plus color="#ffffff" size={34} />
                            </button>
                        </div>

                        <div className="flex justify-between px-1 text-lg text-white/50">
                            <span>{MIN_ATTEMPTS}</span>
                            <span>{MAX_ATTEMPTS_LIMIT}</span>
                        </div>
                    </div>

                    {/* ---------- CHANCE DE GANHAR ---------- */}
                    <div className="space-y-6">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold">Chance de ganhar</h2>
                                <p className="text-xl text-white/60">
                                    Chance de acertar 3 figuras iguais em cada giro.
                                </p>
                            </div>

                            <span className="text-6xl font-black italic leading-none text-[#f05f0c] drop-shadow-[0_0_20px_rgba(240,95,12,0.5)]">
                                {chance}%
                            </span>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() =>
                                    setChance((v) => clamp(v - CHANCE_STEP, 0, 100))
                                }
                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-5 active:bg-[#f05f0c]/30"
                            >
                                <Minus color="#ffffff" size={34} />
                            </button>

                            <input
                                type="range"
                                className="slot-range"
                                min={0}
                                max={100}
                                step={CHANCE_STEP}
                                value={chance}
                                onChange={(e) => setChance(Number(e.target.value))}
                                style={trackStyle(chance, 0, 100)}
                            />

                            <button
                                onClick={() =>
                                    setChance((v) => clamp(v + CHANCE_STEP, 0, 100))
                                }
                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-5 active:bg-[#f05f0c]/30"
                            >
                                <Plus color="#ffffff" size={34} />
                            </button>
                        </div>

                        <div className="flex justify-between px-1 text-lg text-white/50">
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* ---------- DISTRIBUIÇÃO DOS PRÊMIOS ---------- */}
                    <div className="space-y-6">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold">
                                    Chance por prêmio
                                </h2>
                               
                            </div>

                            <button
                                onClick={() => setPrizeChances(defaultPrizeChances())}
                                className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-lg font-bold active:bg-[#f05f0c]/30"
                            >
                                <RotateCcw size={22} />
                                Restaurar padrão
                            </button>
                        </div>

                        <div className="space-y-5">
                            {PRIZES.map((prize) => {
                                const value = prizeChances[prize.id] ?? 0;
                                // chance de sair num giro qualquer, já contando o "se ganhar"
                                const real = (chance * value) / 100;

                                return (
                                    <div key={prize.id} className="space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span
                                                    className="h-6 w-6 shrink-0 rounded-md border border-white/30"
                                                    style={{ backgroundColor: prize.bg }}
                                                />
                                                <span className="truncate text-2xl font-bold">
                                                    {prize.label}
                                                </span>
                                            </div>

                                            <div className="flex shrink-0 items-baseline gap-3">
                                                <span className="text-lg text-white/45">
                                                    {real.toFixed(1)}% do total
                                                </span>
                                                <span className="w-24 text-right text-4xl font-black italic leading-none text-[#f05f0c]">
                                                    {value}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() =>
                                                    changePrize(prize.id, value - CHANCE_STEP)
                                                }
                                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-3 active:bg-[#f05f0c]/30"
                                            >
                                                <Minus color="#ffffff" size={24} />
                                            </button>

                                            <input
                                                type="range"
                                                className="slot-range"
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={value}
                                                onChange={(e) =>
                                                    changePrize(prize.id, Number(e.target.value))
                                                }
                                                style={trackStyle(value, 0, 100)}
                                            />

                                            <button
                                                onClick={() =>
                                                    changePrize(prize.id, value + CHANCE_STEP)
                                                }
                                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-3 active:bg-[#f05f0c]/30"
                                            >
                                                <Plus color="#ffffff" size={24} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="rounded-2xl border border-white/15 bg-black/25 px-6 py-4 text-lg text-white/60">
                            Ao mexer em um prêmio, os outros se reajustam
                            proporcionalmente para o total continuar em 100%.
                        </p>
                    </div>

                    {/* ---------- AÇÕES ---------- */}
                    <div className="flex flex-col items-center gap-5">
                        <button
                            onClick={handleSave}
                            className="w-full rounded-full bg-gradient-to-b from-[#ff7a29] to-[#f05f0c] px-12 py-5 text-3xl font-black italic uppercase tracking-widest text-white shadow-[0_12px_30px_rgba(240,95,12,0.45),inset_0_2px_0_rgba(255,255,255,0.35)] transition-transform duration-200 active:scale-95"
                        >
                            Salvar
                        </button>

                        {saved && (
                            <p className="flex items-center gap-3 text-2xl font-bold text-[#45b552]">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#45b552] shadow-[0_0_10px_3px_rgba(69,181,82,0.8)]" />
                                Configurações salvas!
                            </p>
                        )}

                        <button
                            onClick={onClose}
                            className="text-xl text-white/60 underline"
                        >
                            Voltar para o jogo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
