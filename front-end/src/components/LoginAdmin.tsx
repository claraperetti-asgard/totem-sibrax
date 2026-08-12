import { useState } from "react";
import { X } from "lucide-react";
import { ADMIN_PASSWORD, ADMIN_USER } from "../config/gameSettings";

type Props = {
    /** chamado quando usuário e senha conferem */
    onSuccess: () => void;
    /** chamado no X — quem usa decide se fecha o modal ou sai da página */
    onClose: () => void;
    /** texto do topo, para dizer a que o login dá acesso */
    titulo?: string;
};

export default function LoginAdmin({ onSuccess, onClose, titulo }: Props) {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const entrar = () => {
        if (
            user.trim().toLowerCase() === ADMIN_USER &&
            password === ADMIN_PASSWORD
        ) {
            onSuccess();
            return;
        }

        setError("Usuário ou senha inválidos");
    };

    return (
        // text-white aqui e não herdado do pai: senão a cor do texto muda
        // conforme a página que abre o modal
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0c1933]/85 px-8 text-white">
            <div className="relative w-full max-w-2xl space-y-8 rounded-3xl border border-[#f05f0c]/40 bg-gradient-to-b from-[#2e4b82] to-[#16264a] p-10 shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-full border border-white/20 bg-white/10 p-2"
                >
                    <X color="#ffffff" size={28} />
                </button>

                <h2 className="text-4xl font-black italic uppercase">
                    Acesso <span className="text-[#f05f0c]">{titulo ?? "Admin"}</span>
                </h2>

                <div className="space-y-3">
                    <label className="block text-2xl font-bold">Usuário</label>
                    <input
                        autoFocus
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") entrar();
                        }}
                        className="w-full rounded-2xl bg-white px-6 py-4 text-3xl font-bold text-[#2e4b82] outline-none focus:ring-4 focus:ring-[#f05f0c]/50"
                    />
                </div>

                <div className="space-y-3">
                    <label className="block text-2xl font-bold">Senha</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") entrar();
                        }}
                        className="w-full rounded-2xl bg-white px-6 py-4 text-3xl font-bold text-[#2e4b82] outline-none focus:ring-4 focus:ring-[#f05f0c]/50"
                    />
                </div>

                {error && (
                    <p className="text-xl font-bold text-[#ff9a6b]">{error}</p>
                )}

                <button
                    onClick={entrar}
                    className="w-full rounded-full bg-gradient-to-b from-[#ff7a29] to-[#f05f0c] px-12 py-4 text-3xl font-black uppercase text-white shadow-[0_10px_26px_rgba(240,95,12,0.4)] active:scale-95"
                >
                    Entrar
                </button>
            </div>
        </div>
    );
}
