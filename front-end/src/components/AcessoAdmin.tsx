import { useState } from "react";
import {
    Check,
    Lock,
    Minus,
    Plus,
    RotateCcw,
    TriangleAlert,
    X,
} from "lucide-react";
import {
    FORM_FIELDS,
    normalizeFormFields,
    type FormFieldsConfig,
} from "../config/formFields";
import LogoSibrax from "../assets/logo-sibrax-branco.png";
import Selo32Anos from "../assets/selo-32-anos.png";
import type { GameSettings } from "../config/gameSettings";
import { PRIZES } from "../config/prizes";
import {
    defaultPrizeChances,
    setPrizeChance,
    somaSemJackpot,
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
    const [formFields, setFormFields] = useState<FormFieldsConfig>(
        settings.formFields,
    );

    const toggleField = (id: keyof FormFieldsConfig) =>
        setFormFields((current) =>
            // normalizeFormFields devolve os campos travados sempre ligados
            normalizeFormFields({ ...current, [id]: !current[id] }),
        );

    // mexer em um prêmio reacomoda os outros para o total continuar 100%
    const changePrize = (id: string, value: number) =>
        setPrizeChances((current) => setPrizeChance(current, id, value));

    // o prêmio máximo é exclusivo de quem não é cliente: se todos os
    // outros estiverem zerados, quem é cliente fica sem prêmio definido
    const clientesSemPremio = somaSemJackpot(prizeChances) === 0;

    // não há botão Salvar: fechar no X grava o que estiver na tela
    const saveAndClose = () => {
        onSave({
            maxAttempts: attempts,
            winChance: chance / 100,
            prizeChances,
            formFields,
        });

        onClose();
    };

    return (
       
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c1933] text-white">
            <div className="flex min-h-full w-full flex-col items-center gap-8 px-8 py-10">
                {/* topo: fechar + logo + selo, tudo no fluxo para rolar junto */}
                <div className="flex w-full max-w-3xl items-center justify-between gap-6">
                    <button
                        onClick={saveAndClose}
                        className="shrink-0 rounded-full border border-[#f05f0c]/50 bg-[#2e4b82]/60 p-3 transition-colors active:bg-[#f05f0c]/30"
                    >
                        <X color="#ffffff" size={35} />
                    </button>

                    <img
                        src={LogoSibrax}
                        alt="Sibrax Software"
                        className="w-56 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />

                    <img
                        src={Selo32Anos}
                        alt="Selo Sibrax 32 anos"
                        className="w-24 shrink-0 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                    />
                </div>

                <div className="space-y-1 text-center">
                    <h1 className="text-5xl font-black italic uppercase tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                        <span className="text-white">Painel do </span>
                        <span className="text-[#f05f0c] drop-shadow-[0_0_24px_rgba(240,95,12,0.5)]">
                            Administrador
                        </span>
                    </h1>
                    <p className="text-xl text-white/60">
                        Configurações da Slot Machine
                    </p>
                </div>

                <div className="w-full max-w-3xl space-y-8 rounded-3xl border border-[#f05f0c]/35 bg-gradient-to-b from-[#2e4b82] to-[#16264a] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.12)]">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-3xl font-bold">
                                Campos do formulário
                            </h2>
                            <p className="text-lg text-white/60">
                                O que não estiver marcado não aparece no formulário. Alterações salvam ao clicar no X.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {FORM_FIELDS.map((field) => {
                                const active = formFields[field.id];
                                const locked = Boolean(field.locked);

                                return (
                                    <button
                                        key={field.id}
                                        type="button"
                                        disabled={locked}
                                        onClick={() => toggleField(field.id)}
                                        className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                                            active
                                                ? "border-[#45b552]/60 bg-[#45b552]/15"
                                                : "border-white/15 bg-white/5"
                                        } ${locked ? "cursor-not-allowed opacity-80" : "active:bg-[#f05f0c]/20"}`}
                                    >
                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                                                active
                                                    ? "border-[#45b552] bg-[#45b552]"
                                                    : "border-white/30 bg-white/5"
                                            }`}
                                        >
                                            {active && (
                                                <Check
                                                    color="#ffffff"
                                                    size={22}
                                                    strokeWidth={4}
                                                />
                                            )}
                                        </span>

                                        <span className="flex-1 text-xl font-bold">
                                            {field.label}
                                        </span>

                                        {field.hint && (
                                            <span className="flex items-center gap-1.5 text-sm font-semibold text-white/45">
                                                {locked && <Lock size={16} />}
                                                {field.hint}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-base text-white/45">
                            O CPF é obrigatório e não pode ser desativado. Limitado
                            uma participação por CPF. O "É cliente" também é
                            obrigatório: o prêmio máximo só sai para quem não é
                            cliente.
                        </p>
                    </div>

                    {/* ---------- TENTATIVAS ---------- */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold">
                                    Tentativas por pessoa
                                </h2>
                                <p className="text-lg text-white/60">
                                    Quantos giros cada participante pode dar.
                                </p>
                            </div>

                            <span className="text-5xl font-black italic leading-none text-[#f05f0c] drop-shadow-[0_0_20px_rgba(240,95,12,0.5)]">
                                {attempts}
                            </span>
                        </div>

                        <div className="flex items-center gap-5">
                            <button
                                onClick={() =>
                                    setAttempts((v) =>
                                        clamp(v - 1, MIN_ATTEMPTS, MAX_ATTEMPTS_LIMIT)
                                    )
                                }
                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-4 active:bg-[#f05f0c]/30"
                            >
                                <Minus color="#ffffff" size={30} />
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
                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-4 active:bg-[#f05f0c]/30"
                            >
                                <Plus color="#ffffff" size={30} />
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* ---------- CAMPOS DO FORMULÁRIO ---------- */}
                    
                    <div className="h-px bg-white/10" />

                    {/* ---------- CHANCE DE GANHAR ---------- */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold">Chance de ganhar</h2>
                                <p className="text-lg text-white/60">
                                    Chance de acertar 3 figuras iguais em cada giro.
                                </p>
                            </div>

                            <span className="text-5xl font-black italic leading-none text-[#f05f0c] drop-shadow-[0_0_20px_rgba(240,95,12,0.5)]">
                                {chance}%
                            </span>
                        </div>

                        <div className="flex items-center gap-5">
                            <button
                                onClick={() =>
                                    setChance((v) => clamp(v - CHANCE_STEP, 0, 100))
                                }
                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-4 active:bg-[#f05f0c]/30"
                            >
                                <Minus color="#ffffff" size={30} />
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
                                className="shrink-0 rounded-full border border-white/20 bg-white/10 p-4 active:bg-[#f05f0c]/30"
                            >
                                <Plus color="#ffffff" size={30} />
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* ---------- DISTRIBUIÇÃO DOS PRÊMIOS ---------- */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold">Chance por prêmio</h2>
                                <p className="text-lg text-white/60">
                                    Qual a probalidade de cada prêmio sair, em cada giro.
                                </p>
                            </div>

                            <button
                                onClick={() => setPrizeChances(defaultPrizeChances())}
                                className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-base font-bold active:bg-[#f05f0c]/30"
                            >
                                <RotateCcw size={20} />
                                Restaurar padrão
                            </button>
                        </div>

                        <div className="space-y-5">
                            {PRIZES.map((prize) => {
                                const value = prizeChances[prize.id] ?? 0;

                                return (
                                    <div
                                        key={prize.id}
                                        className="flex items-center gap-4"
                                    >
                                        <span
                                            className="h-6 w-6 shrink-0 rounded-md border border-white/30"
                                            style={{ backgroundColor: prize.bg }}
                                        />

                                        <span className="w-56 shrink-0 truncate text-xl font-bold">
                                            {prize.label}
                                        </span>

                                        <button
                                            onClick={() =>
                                                changePrize(prize.id, value - CHANCE_STEP)
                                            }
                                            className="shrink-0 rounded-full border border-white/20 bg-white/10 p-2.5 active:bg-[#f05f0c]/30"
                                        >
                                            <Minus color="#ffffff" size={20} />
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
                                            className="shrink-0 rounded-full border border-white/20 bg-white/10 p-2.5 active:bg-[#f05f0c]/30"
                                        >
                                            <Plus color="#ffffff" size={20} />
                                        </button>

                                        <span className="w-20 shrink-0 text-right text-3xl font-black italic leading-none text-[#f05f0c]">
                                            {value}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {clientesSemPremio && (
                            <div className="flex items-start gap-4 rounded-2xl border-2 border-[#f05f0c] bg-[#f05f0c]/15 px-6 py-5">
                                <TriangleAlert
                                    size={28}
                                    color="#f05f0c"
                                    className="mt-0.5 shrink-0"
                                />
                                <p className="text-lg text-white/85">
                                    <span className="font-bold">
                                        Clientes ficam sem prêmio definido.
                                    </span>{" "}
                                    O prêmio máximo é exclusivo de quem não é
                                    cliente, e todos os outros estão em 0% — quem
                                    marcar "sim" em É cliente vai levar um prêmio
                                    qualquer, sorteado por igual. Deixe pelo menos
                                    um dos outros prêmios acima de 0%.
                                </p>
                            </div>
                        )}

                        <p className="text-base text-white/45">
                            Ao mexer em um prêmio, os outros se reajustam
                            proporcionalmente para o total continuar em 100%.
                        </p>
                    </div>
                </div>

                <p className="text-lg text-white/40">
                    As configurações são salvas ao fechar no X.
                </p>
            </div>
        </div>
    );
}
