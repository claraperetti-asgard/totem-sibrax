import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Trophy, Users } from "lucide-react";
import confetti from "canvas-confetti";
import BgSibrax from "../assets/bg-sibrax.png";
import LogoSibrax from "../assets/logo-sibrax-branco.png";
import LogoConviver from "../assets/logo-conviver.png";
import Selo32Anos from "../assets/selo-32-anos.png";
import { apiUrl } from "../config/api";
import LoginAdmin from "../components/LoginAdmin";

type Resposta = {
    id: number;
    nome: string | null;
    email: string | null;
    cpf: string | null;
    telefone: string | null;
    razao_social: string | null;
    sistema_atual: string | null;
    e_cliente: number | null;
    criado_em: string;
};

const SIBRAX_CONFETTI = ["#f05f0c", "#2465b5", "#45b552", "#02bae8", "#ffffff"];

const SUSPENSE_MS = 9000;


const ARRANCADA_INICIO = 0.78;
const ARRANCADA_FIM = 0.87;

const faseTexto = (progresso: number) => {
    if (progresso < 0.45) return "Sorteando...";
    if (progresso < ARRANCADA_FIM) return "Quase lá...";
    return "E o ganhador é...";
};

/** célula vazia vira travessão em vez de sumir */
const ouTraco = (valor: string | null | undefined) =>
    valor && valor.trim() !== "" ? valor : "—";

const formatCPF = (cpf: string | null) => {
    const d = (cpf ?? "").replace(/\D/g, "");
    if (d.length !== 11) return ouTraco(cpf);
    return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
};

const formatTelefone = (telefone: string | null) => {
    const d = (telefone ?? "").replace(/\D/g, "");
    if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    return ouTraco(telefone);
};

/** o CURRENT_TIMESTAMP do SQLite grava em UTC, sem fuso na string */
const formatData = (criado_em: string) => {
    if (!criado_em) return "—";

    const data = new Date(`${criado_em.replace(" ", "T")}Z`);
    if (Number.isNaN(data.getTime())) return criado_em;

    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatCliente = (e_cliente: number | null) => {
    if (e_cliente === 1) return "Sim";
    if (e_cliente === 0) return "Não";
    return "—";
};

export default function Sorteio() {
    const navigate = useNavigate();

    // a tela é de operador: só abre depois do login
    const [autenticado, setAutenticado] = useState(false);

    const [respostas, setRespostas] = useState<Resposta[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroLista, setErroLista] = useState("");

    const [vencedor, setVencedor] = useState<Resposta | null>(null);
    const [sorteando, setSorteando] = useState(false);
    const [erroSorteio, setErroSorteio] = useState("");
    // nome que fica trocando durante o suspense
    const [nomeRoleta, setNomeRoleta] = useState("");
    // 0 a 1 — controla o texto e a intensidade visual do card
    const [progresso, setProgresso] = useState(0);
    const roletaRef = useRef<number | null>(null);

    const [baixando, setBaixando] = useState(false);
    const [erroExport, setErroExport] = useState("");

    const carregarRespostas = useCallback(async () => {
        setCarregando(true);
        setErroLista("");

        try {
            const response = await fetch(apiUrl("/respostas"));

            if (!response.ok) {
                setErroLista("Não foi possível carregar os participantes.");
                return;
            }

            setRespostas(await response.json());
        } catch (error) {
            console.error(error);
            setErroLista("Erro de conexão com o servidor.");
        } finally {
            setCarregando(false);
        }
    }, []);

    // só busca os participantes depois que o login passou
    useEffect(() => {
        if (autenticado) carregarRespostas();
    }, [autenticado, carregarRespostas]);

    // limpa o timer da roleta se sair da página no meio do suspense
    useEffect(() => {
        return () => {
            if (roletaRef.current) window.clearTimeout(roletaRef.current);
        };
    }, []);

    const revelarVencedor = (ganhador: Resposta) => {
        setNomeRoleta("");
        setProgresso(0);
        setVencedor(ganhador);
        setSorteando(false);

        confetti({
            particleCount: 220,
            spread: 100,
            origin: { y: 0.6 },
            colors: SIBRAX_CONFETTI,
            scalar: 1.3,
            startVelocity: 55,
        });
        confetti({
            particleCount: 120,
            spread: 80,
            angle: 60,
            origin: { x: 0, y: 0.7 },
            colors: SIBRAX_CONFETTI,
        });
        confetti({
            particleCount: 120,
            spread: 80,
            angle: 120,
            origin: { x: 1, y: 0.7 },
            colors: SIBRAX_CONFETTI,
        });
    };

    /**
     * Roleta de nomes com três momentos: gira num borrão por vários
     * segundos, começa a perder força, dá uma arrancada quando parecia
     * que ia parar, e só então desacelera até revelar quem a API já
     * tinha sorteado.
     */
    const rodarSuspense = (ganhador: Resposta, inicio: number) => {
        const decorrido = Date.now() - inicio;

        if (decorrido >= SUSPENSE_MS) {
            revelarVencedor(ganhador);
            return;
        }

        const nomes = respostas.map((r) => r.nome?.trim() || `CPF ${r.cpf}`);
        setNomeRoleta(
            nomes.length > 0
                ? nomes[Math.floor(Math.random() * nomes.length)]
                : "...",
        );

        const progresso = decorrido / SUSPENSE_MS;
        setProgresso(progresso);

        // expoente alto segura a velocidade máxima por mais tempo e
        // concentra toda a desaceleração no fim
        let delay = 45 + Math.pow(progresso, 3.4) * 950;

        // a arrancada: volta a girar rápido quando já parecia acabar
        if (progresso >= ARRANCADA_INICIO && progresso < ARRANCADA_FIM) {
            delay = 55;
        }

        roletaRef.current = window.setTimeout(
            () => rodarSuspense(ganhador, inicio),
            delay,
        );
    };

    async function sortear() {
        if (sorteando) return;

        setSorteando(true);
        setErroSorteio("");
        setVencedor(null);
        setNomeRoleta("");
        setProgresso(0);

        try {
            const response = await fetch(apiUrl("/sorteio"));
            const data = await response.json();

            if (!response.ok) {
                setErroSorteio(data?.mensagem ?? "Não foi possível sortear.");
                setSorteando(false);
                return;
            }

            // o vencedor já está definido aqui, mas só aparece depois do
            // suspense — quem encerra o `sorteando` é o revelarVencedor
            rodarSuspense(data.vencedor, Date.now());
        } catch (error) {
            console.error(error);
            setErroSorteio("Erro de conexão com o servidor.");
            setSorteando(false);
        }
    }

    async function baixarExcel() {
        if (baixando) return;

        setBaixando(true);
        setErroExport("");

        try {
            const response = await fetch(apiUrl("/respostas/exportar"));

            if (!response.ok) {
                // sem participantes a API responde 404 com JSON
                const data = await response.json().catch(() => null);
                setErroExport(data?.mensagem ?? "Não foi possível gerar o Excel.");
                return;
            }

            // baixa via blob para conseguir tratar o erro acima em vez de
            // simplesmente navegar para a URL
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "participantes.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            setErroExport("Erro de conexão com o servidor.");
        } finally {
            setBaixando(false);
        }
    }

    // sem login não mostra nada da tela, só o fundo e o modal
    if (!autenticado) {
        return (
            <div className="relative min-h-screen w-full overflow-hidden text-white">
                <img
                    src={BgSibrax}
                    alt=""
                    aria-hidden
                    className="pointer-events-none fixed inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none fixed inset-0 bg-[#2e4b82]/25" />

                <LoginAdmin
                    titulo="Sorteio"
                    onSuccess={() => setAutenticado(true)}
                    onClose={() => navigate("/")}
                />
            </div>
        );
    }

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
                className="fixed right-8 top-8 z-30 w-58 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            />

            {/* ---------- CONTEÚDO ---------- */}
            <div className="relative z-10 flex min-h-screen flex-col items-center gap-10 px-6 pt-15 pb-10">
                <header className="relative flex w-full max-w-5xl flex-col items-center px-8">
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
                    <h1 className="text-7xl font-bold italic uppercase tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
                        <span className="text-white">Sorteio </span>
                        <span className="text-[#f05f0c] drop-shadow-[0_0_28px_rgba(240,95,12,0.55)]">
                            Sibrax
                        </span>
                    </h1>

                    <div className="flex items-center gap-3 text-xl text-white/60">
                        <Users size={22} color="#45b552" />
                        {carregando
                            ? "Carregando participantes..."
                            : `${respostas.length} ${
                                  respostas.length === 1
                                      ? "participante cadastrado"
                                      : "participantes cadastrados"
                              }`}
                    </div>
                </div>

                {/* ---------- SUSPENSE ---------- */}
                {sorteando && (
                    <div className="relative w-full max-w-4xl">
                        {/* o halo aperta o ritmo conforme o sorteio avança */}
                        <div
                            className="absolute -inset-6 rounded-[3rem] bg-[#f05f0c]/20 blur-3xl"
                            style={{
                                animation: `jackpot-glow ${1.1 - progresso * 0.7}s ease-in-out infinite`,
                            }}
                        />

                        <div
                            className="relative flex flex-col items-center gap-5 rounded-3xl border-4 bg-gradient-to-b from-[#2e4b82] to-[#16264a] p-10 text-center shadow-[0_30px_70px_rgba(0,0,0,0.55)] transition-colors duration-500"
                            style={{
                                // a borda vai acendendo até ficar laranja pleno
                                borderColor: `rgba(240,95,12,${0.4 + progresso * 0.6})`,
                            }}
                        >
                            <Trophy
                                size={70}
                                color="#f05f0c"
                                strokeWidth={2}
                                style={{
                                    animation: `jackpot-shake ${0.75 - progresso * 0.35}s ease-in-out infinite`,
                                }}
                            />

                            <h2 className="text-3xl font-black italic uppercase tracking-[0.3em] text-white/70">
                                {faseTexto(progresso)}
                            </h2>

                            {/* nome trocando rápido e desacelerando */}
                            <p className="min-h-[4.5rem] text-6xl font-black italic uppercase leading-none tracking-tight text-[#f05f0c] drop-shadow-[0_0_28px_rgba(240,95,12,0.55)]">
                                {nomeRoleta || "..."}
                            </p>

                            {/* barra de progresso do suspense */}
                            <div className="h-2 w-2/3 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-[#45b552] shadow-[0_0_12px_2px_rgba(69,181,82,0.7)]"
                                    style={{ width: `${progresso * 100}%` }}
                                />
                            </div>

                            <div className="flex gap-2">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="h-3 w-3 rounded-full bg-[#45b552]"
                                        style={{
                                            animation: `slot-glow ${0.9 - progresso * 0.5}s ease-in-out ${i * 0.15}s infinite`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------- VENCEDOR ---------- */}
                {vencedor && (
                    <div className="relative w-full max-w-4xl">
                        <div className="absolute -inset-6 rounded-[3rem] bg-[#f05f0c]/25 blur-3xl" />

                        <div
                            className="relative flex flex-col items-center gap-4 rounded-3xl border-4 border-[#f05f0c] bg-gradient-to-b from-[#2e4b82] to-[#16264a] p-10 text-center shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
                            style={{
                                animation:
                                    "jackpot-pop 0.8s cubic-bezier(.2,1.4,.4,1) both",
                            }}
                        >
                            <Trophy
                                size={70}
                                color="#f05f0c"
                                strokeWidth={2}
                                className="drop-shadow-[0_0_28px_rgba(240,95,12,0.7)]"
                            />

                            <h2 className="text-3xl font-black italic uppercase tracking-widest text-white/70">
                                Participante sorteado
                            </h2>

                            <p className="text-6xl font-black italic uppercase leading-none tracking-tight text-[#f05f0c] drop-shadow-[0_0_28px_rgba(240,95,12,0.55)]">
                                {ouTraco(vencedor.nome)}
                            </p>

                            <div className="mt-2 grid w-full grid-cols-2 gap-x-8 gap-y-3 text-left text-xl">
                                <InfoVencedor rotulo="CPF" valor={formatCPF(vencedor.cpf)} />
                                <InfoVencedor
                                    rotulo="Telefone"
                                    valor={formatTelefone(vencedor.telefone)}
                                />
                                <InfoVencedor
                                    rotulo="E-mail"
                                    valor={ouTraco(vencedor.email)}
                                />
                                <InfoVencedor
                                    rotulo="Razão social"
                                    valor={ouTraco(vencedor.razao_social)}
                                />
                                <InfoVencedor
                                    rotulo="É cliente?"
                                    valor={formatCliente(vencedor.e_cliente)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------- AÇÕES ---------- */}
                <div className="flex flex-wrap items-center justify-center gap-5">
                    <button
                        type="button"
                        onClick={sortear}
                        disabled={sorteando || respostas.length === 0}
                        className="flex items-center gap-4 rounded-full bg-gradient-to-b from-[#ff7a29] to-[#f05f0c] px-12 py-5 text-3xl font-bold italic uppercase tracking-widest text-white shadow-[0_12px_30px_rgba(240,95,12,0.45),inset_0_2px_0_rgba(255,255,255,0.35)] transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trophy size={32} />
                        {sorteando ? "Sorteando..." : vencedor ? "Sortear de novo" : "Sortear"}
                    </button>

                    <button
                        type="button"
                        onClick={baixarExcel}
                        disabled={baixando}
                        className="flex items-center gap-3 rounded-full border-2 border-[#45b552] bg-[#45b552]/15 px-10 py-5 text-2xl font-bold uppercase tracking-wide text-white transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Download size={28} color="#45b552" />
                        {baixando ? "Gerando..." : "Baixar Excel"}
                    </button>

                    <button
                        type="button"
                        onClick={carregarRespostas}
                        disabled={carregando}
                        className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-5 text-xl font-bold uppercase tracking-wide text-white/70 transition-transform duration-200 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={24} />
                        Atualizar
                    </button>
                </div>

                {(erroSorteio || erroExport) && (
                    <p className="text-xl font-semibold text-red-400">
                        {erroSorteio || erroExport}
                    </p>
                )}

                {/* ---------- TABELA ---------- */}
                <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-[#f05f0c]/35 bg-gradient-to-b from-[#2e4b82] to-[#16264a] shadow-[0_30px_70px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.12)]">
                    {carregando ? (
                        <p className="p-10 text-center text-2xl text-white/60">
                            Carregando participantes...
                        </p>
                    ) : erroLista ? (
                        <p className="p-10 text-center text-2xl font-semibold text-red-400">
                            {erroLista}
                        </p>
                    ) : respostas.length === 0 ? (
                        <p className="p-10 text-center text-2xl text-white/60">
                            Nenhum participante cadastrado ainda.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1280px] border-collapse text-left">
                                <thead>
                                    <tr className="bg-[#0c1933]/70 text-lg uppercase tracking-wide text-white/60">
                                        <Th>Nome</Th>
                                        <Th>E-mail</Th>
                                        <Th>CPF</Th>
                                        <Th>Telefone</Th>
                                        <Th>Razão Social</Th>
                                        <Th>É cliente?</Th>
                                        <Th>Sistema que utiliza</Th>
                                        <Th>Data de cadastro</Th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {respostas.map((r) => {
                                        const ganhou = vencedor?.id === r.id;

                                        return (
                                            <tr
                                                key={r.id}
                                                className={`border-t border-white/10 text-xl transition-colors ${
                                                    ganhou
                                                        ? "bg-[#f05f0c]/25 font-bold"
                                                        : "odd:bg-white/[0.03]"
                                                }`}
                                            >
                                                <Td>{ouTraco(r.nome)}</Td>
                                                <Td>{ouTraco(r.email)}</Td>
                                                <Td>{formatCPF(r.cpf)}</Td>
                                                <Td>{formatTelefone(r.telefone)}</Td>
                                                <Td>{ouTraco(r.razao_social)}</Td>
                                                <Td>{formatCliente(r.e_cliente)}</Td>
                                                <Td>{ouTraco(r.sistema_atual)}</Td>
                                                <Td>{formatData(r.criado_em)}</Td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex w-full max-w-5xl flex-col items-center px-8">
                    <img
                        src={LogoConviver}
                        alt="Conviver - App de Condomínios"
                        className="w-110 object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                    />
                </div>
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return <th className="whitespace-nowrap px-6 py-5 font-bold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
    return <td className="whitespace-nowrap px-6 py-4">{children}</td>;
}

function InfoVencedor({ rotulo, valor }: { rotulo: string; valor: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-base uppercase tracking-wide text-white/45">
                {rotulo}
            </span>
            <span className="font-bold text-white">{valor}</span>
        </div>
    );
}
