import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Play, Settings } from "lucide-react";
import BgSibrax from "../assets/bg-sibrax.png";
import LogoSibrax from "../assets/logo-sibrax-branco.png";
import LogoConviver from "../assets/logo-conviver.png";
import Selo32Anos from "../assets/selo-32-anos.png";
import AcessoAdmin from "../components/AcessoAdmin";
import LoginAdmin from "../components/LoginAdmin";
import {
    loadGameSettings,
    saveGameSettings,
    type GameSettings,
} from "../config/gameSettings";


export default function Home() {
    const [settings, setSettings] = useState<GameSettings>(() =>
        loadGameSettings(),
    );

    const [adminOpen, setAdminOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);

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
                className="fixed right-8 top-8 z-30 w-64 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            />

            <div className="relative z-10 flex min-h-screen flex-col items-center gap-10 px-6 pt-15 pb-10">
                <header className="flex w-full max-w-5xl flex-col items-center px-8">
                    <img
                        src={LogoSibrax}
                        alt="Sibrax Software"
                        className="w-110 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />
                </header>

                <div className="flex flex-1 flex-col items-center justify-center gap-12 text-center">
                    <h1 className="text-8xl font-bold italic uppercase tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
                        <span className="text-white">Slot </span>
                        <span className="text-[#f05f0c] drop-shadow-[0_0_28px_rgba(240,95,12,0.55)]">
                            Machine
                        </span>
                    </h1>

                    <p className="text-5xl font-black italic uppercase leading-tight tracking-tight">
                        <span className="text-[#f05f0c]">Gire</span>
                        <span className="text-white"> e ganhe um </span>
                        <span className="text-[#f05f0c]">prêmio</span>
                    </p>

                    <NavLink
                        to="/forms"
                        className="group relative flex items-center justify-center"
                    >
                        {/* halo pulsando atrás do botão */}
                        <span
                            className="absolute h-56 w-56 rounded-full bg-[#f05f0c]/30 blur-2xl"
                            style={{ animation: "jackpot-glow 2s ease-in-out infinite" }}
                        />

                        <span className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-b from-[#ff7a29] to-[#f05f0c] shadow-[0_16px_40px_rgba(240,95,12,0.5),inset_0_3px_0_rgba(255,255,255,0.4)] transition-transform duration-200 group-active:scale-95">
                            <Play size={72} color="#ffffff" fill="#ffffff" />
                        </span>
                    </NavLink>

                    <div className="flex items-center gap-3 text-white/60">
                        <span className="h-2 w-2 rounded-full bg-[#45b552] shadow-[0_0_10px_2px_rgba(69,181,82,0.8)]" />
                        <span className="text-2xl font-semibold tracking-[0.25em] uppercase">
                            Toque para começar
                        </span>
                        <span className="h-2 w-2 rounded-full bg-[#45b552] shadow-[0_0_10px_2px_rgba(69,181,82,0.8)]" />
                    </div>
                </div>

                <div className="mt-auto flex w-full max-w-5xl flex-col items-center px-8">
                    <img
                        src={LogoConviver}
                        alt="Conviver - App de Condomínios"
                        className="w-135 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />
                </div>
            </div>

            <button
                onClick={() => setLoginOpen(true)}
                aria-label="Configurações"
                className="fixed bottom-8 right-8 z-30 rounded-full border  bg-[#f05f0c] p-4 text-white backdrop-blur-sm transition-colors active:bg-[#f05f0c]/30"
            >
                <Settings size={34} />
            </button>

            <NavLink
                to="/sorteio"
                aria-label="Sorteio"
                className="fixed bottom-8 left-8 z-30 rounded-full border text-2xl bg-[#f05f0c] py-4 px-6 text-white backdrop-blur-sm transition-colors active:bg-[#f05f0c]/30"
            >
                Sorteio
            </NavLink>

            {/* ---------- LOGIN ---------- */}
            {loginOpen && (
                <LoginAdmin
                    onSuccess={() => {
                        setLoginOpen(false);
                        setAdminOpen(true);
                    }}
                    onClose={() => setLoginOpen(false)}
                />
            )}

            {/* ---------- PAINEL ADMIN ---------- */}
            {adminOpen && (
                <AcessoAdmin
                    settings={settings}
                    onSave={(next) => setSettings(saveGameSettings(next))}
                    onClose={() => setAdminOpen(false)}
                />
            )}
        </div>
    );
}
