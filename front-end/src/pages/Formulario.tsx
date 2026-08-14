import { useState, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { PatternFormat } from "react-number-format";
import KeyboardReact from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import BgSibrax from "../assets/bg-sibrax.png";
import LogoSibrax from "../assets/logo-sibrax-branco.png";
import LogoConviver from "../assets/logo-conviver.png";
import Selo32Anos from "../assets/selo-32-anos.png";
import { apiUrl } from "../config/api";
import { loadGameSettings } from "../config/gameSettings";
import { TEXT_FIELD_IDS } from "../config/formFields";
import { saveParticipante } from "../config/participante";

const Keyboard = (KeyboardReact as any).default || KeyboardReact;

/** classes compartilhadas pelos campos de texto */
const fieldBase =
    "w-full h-16 px-6 text-2xl rounded-2xl bg-[#0c1933]/70 text-white placeholder-white/35 border-2 transition-all outline-none";

const fieldBorder = (focused: boolean, hasError: boolean) =>
    focused
        ? "border-[#f05f0c] shadow-[0_0_18px_rgba(240,95,12,0.35)]"
        : hasError
          ? "border-red-400"
          : "border-white/15";

export default function Formulario() {
    const navigate = useNavigate();

    // quais campos o admin deixou ligados
    const [fields] = useState(() => loadGameSettings().formFields);

    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [company, setCompany] = useState("");
    const [isClient, setIsClient] = useState<boolean | null>(null);
    // só perguntado a quem não é cliente
    const [sistema, setSistema] = useState("");
    const [emailOptions, setEmailOptions] = useState(false);
    // o primeiro campo de texto ligado começa em foco
    const [inputName, setInputName] = useState<string>(
        () => TEXT_FIELD_IDS.find((id) => fields[id]) ?? "cpf",
    );
    const [layoutName, setLayoutName] = useState("default");
    const [emailError, setEmailError] = useState("");
    const [cpfError, setCpfError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const keyboardRef = useRef<any>(null);

    const emailsType = [
        { id: 1, value: "gmail.com" },
        { id: 2, value: "hotmail.com" },
        { id: 3, value: "outlook.com" },
        { id: 4, value: "yahoo.com" },
        { id: 5, value: "icloud.com" },
        { id: 6, value: "uol.com.br" },
    ];

    const validateEmail = (email: string) => {
        const re =
            /^(?!\.)(?!.*?\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const validateCPF = (value: string) => {
        const cpf = value.replace(/\D/g, "");
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
        let check = (sum * 10) % 11;
        if (check === 10) check = 0;
        if (check !== parseInt(cpf.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
        check = (sum * 10) % 11;
        if (check === 10) check = 0;
        if (check !== parseInt(cpf.charAt(10))) return false;

        return true;
    };

    // campo desligado não entra na validação
    const emailOk = !fields.email || (email !== "" && validateEmail(email));
    const cpfOk = cpf !== "" && validateCPF(cpf);

    // a pergunta sobre o sistema pode ser desligada no painel e, mesmo
    // ligada, só aparece para quem marca que não é cliente
    const perguntarSistema =
        fields.sistema_atual && fields.e_cliente && isClient === false;

    const isFormValid =
        (!fields.nome || name !== "") &&
        (!fields.telefone || phone !== "") &&
        (!fields.razao_social || company !== "") &&
        (!fields.e_cliente || isClient !== null) &&
        (!perguntarSistema || sistema !== "") &&
        emailOk &&
        cpfOk;

    const handleFocus = (name: string, value: string) => {
        setInputName(name);
        if (keyboardRef.current) {
            keyboardRef.current.setInput(value);
        }
    };

    /**
     * Marcar "sim" esconde a pergunta do sistema. Se ela estava em foco,
     * o teclado ficaria digitando num campo invisível — então o foco
     * volta para o CPF.
     */
    const escolherCliente = (valor: boolean) => {
        setIsClient(valor);

        if (valor && inputName === "sistema_atual") {
            handleFocus("cpf", cpf);
        }
    };

    const onKeyboardChange = (inputVal: string) => {
        if (inputName === "nome") setName(inputVal);

        if (inputName === "razao_social") setCompany(inputVal);

        if (inputName === "sistema_atual") setSistema(inputVal);

        if (inputName === "email") {
            const sanitized = inputVal
                .toLowerCase()
                .replace(/\s/g, "")
                .replace(/\.{2,}/g, ".")
                .replace(/\._/g, ".")
                .replace(/_\./g, "_");

            setEmail(sanitized);

            const hasAt = sanitized.includes("@");
            const afterAt = hasAt ? sanitized.split("@")[1] : "";
            setEmailOptions(hasAt && afterAt.length === 0);

            if (sanitized === "" || validateEmail(sanitized)) {
                setEmailError("");
            } else {
                setEmailError("E-mail com formato inválido");
            }
        }

        if (inputName === "telefone") {
            setPhone(inputVal.replace(/\D/g, "").slice(0, 11));
        }

        if (inputName === "cpf") {
            const digits = inputVal.replace(/\D/g, "").slice(0, 11);
            setCpf(digits);
            setSubmitError("");

            if (digits === "" || validateCPF(digits)) {
                setCpfError("");
            } else if (digits.length === 11) {
                setCpfError("CPF inválido");
            } else {
                setCpfError("");
            }
        }
    };

    const handleShift = () => {
        setLayoutName(layoutName === "default" ? "shift" : "default");
    };

    const onKeyPress = (button: string) => {
        if (button === "{shift}" || button === "{lock}") {
            handleShift();
        }
    };

    async function createLead() {
        if (fields.email && !validateEmail(email)) {
            setEmailError("Verifique o formato do e-mail (ex: nome@dominio.com)");
            return;
        }

        if (!validateCPF(cpf)) {
            setCpfError("CPF inválido");
            return;
        }

        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch(apiUrl("/respostas"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // mesmos nomes e formatos que o back-end grava: cpf e
                // telefone só com dígitos, e_cliente como 1 ou 0.
                // Campo desligado no admin vai como null.
                body: JSON.stringify({
                    nome: fields.nome ? name : null,
                    email: fields.email ? email : null,
                    cpf: cpf,
                    telefone: fields.telefone ? phone : null,
                    razao_social: fields.razao_social ? company : null,
                    sistema_atual: perguntarSistema ? sistema : null,
                    e_cliente: fields.e_cliente ? (isClient ? 1 : 0) : null,
                }),
            });

            if (response.ok) {
                // o jogo precisa saber disso: o prêmio máximo é exclusivo
                // de quem não é cliente
                saveParticipante({ eCliente: isClient ? 1 : 0 });

                navigate("/slotmachine");
                return;
            }

            if (response.status === 409) {
                setSubmitError("Este CPF já participou.");
            } else {
                setSubmitError(
                    "Não foi possível concluir o cadastro. Tente novamente.",
                );
            }
        } catch (error) {
            console.error(error);
            setSubmitError("Erro de conexão. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const buttonLabel = isSubmitting
        ? "Enviando..."
        : fields.email && email !== "" && !validateEmail(email)
          ? "E-mail inválido"
          : cpf !== "" && !validateCPF(cpf)
            ? "CPF inválido"
            : isFormValid
              ? "Confirmar cadastro"
              : "Preencha os dados";

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

                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-6xl font-bold italic uppercase tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
                        <span className="text-white">Preencha seus </span>
                        <span className="text-[#f05f0c] drop-shadow-[0_0_28px_rgba(240,95,12,0.55)]">
                            dados
                        </span>
                    </h1>

                    <div className="flex items-center gap-3 text-xl text-white/60">
                        <span className="h-2 w-2 rounded-full bg-[#45b552] shadow-[0_0_10px_2px_rgba(69,181,82,0.8)]" />
                        Para participar da Slot Machine
                    </div>
                </div>

                {/* ---------- CARD DO FORMULÁRIO ---------- */}
                <div className="flex w-full max-w-4xl flex-col gap-6 rounded-3xl border border-[#f05f0c]/35 bg-gradient-to-b from-[#2e4b82] to-[#16264a] p-10 shadow-[0_30px_70px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.12)]">
                    {/* um grid só: campo desligado some e os outros se
                        reacomodam sozinhos */}
                    <div className="grid grid-cols-2 gap-6">
                        {fields.nome && (
                            <div className="flex flex-col gap-2">
                                <label className="ml-2 text-xl font-bold text-white/70">
                                    Nome completo
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    readOnly
                                    value={name}
                                    onFocus={() => handleFocus("nome", name)}
                                    placeholder="Digite seu nome"
                                    className={`${fieldBase} ${fieldBorder(inputName === "nome", false)}`}
                                />
                            </div>
                        )}

                        {fields.telefone && (
                            <div className="flex flex-col gap-2">
                                <label className="ml-2 text-xl font-bold text-white/70">
                                    Telefone
                                </label>
                                <PatternFormat
                                    id="phone"
                                    format="(##) #####-####"
                                    mask="_"
                                    value={phone}
                                    readOnly
                                    onFocus={() => handleFocus("telefone", phone)}
                                    placeholder="(99) 99999-9999"
                                    className={`${fieldBase} ${fieldBorder(inputName === "telefone", false)}`}
                                />
                            </div>
                        )}

                        {fields.email && (
                            <div className="col-span-2 flex flex-col gap-2">
                                <label className="ml-2 text-xl font-bold text-white/70">
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    readOnly
                                    onFocus={() => handleFocus("email", email)}
                                    placeholder="email@exemplo.com"
                                    className={`${fieldBase} ${fieldBorder(inputName === "email", Boolean(emailError))}`}
                                />
                                {emailError && inputName !== "email" && (
                                    <span className="ml-2 font-semibold text-red-400">
                                        {emailError}
                                    </span>
                                )}
                                {emailOptions && (
                                    <div className="mt-2 grid grid-cols-3 gap-3">
                                        {emailsType.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className="rounded-xl border border-white/15 bg-white/10 p-3 text-lg font-bold text-white transition-colors active:bg-[#f05f0c]/40"
                                                onClick={() => {
                                                    const prefix = email.split("@")[0];
                                                    const newEmail =
                                                        prefix + "@" + item.value;
                                                    setEmail(newEmail);
                                                    setEmailOptions(false);
                                                    setEmailError("");
                                                    if (keyboardRef.current)
                                                        keyboardRef.current.setInput(
                                                            newEmail,
                                                        );
                                                }}
                                            >
                                                @{item.value}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CPF é obrigatório e sempre aparece */}
                        <div className="flex flex-col gap-2">
                            <label className="ml-2 text-xl font-bold text-white/70">
                                CPF
                            </label>
                            <PatternFormat
                                id="cpf"
                                format="###.###.###-##"
                                mask="_"
                                value={cpf}
                                readOnly
                                onFocus={() => handleFocus("cpf", cpf)}
                                placeholder="000.000.000-00"
                                className={`${fieldBase} ${fieldBorder(inputName === "cpf", Boolean(cpfError))}`}
                            />
                            {cpfError && (
                                <span className="ml-2 font-semibold text-red-400">
                                    {cpfError}
                                </span>
                            )}
                        </div>

                        {fields.razao_social && (
                            <div className="flex flex-col gap-2">
                                <label className="ml-2 text-xl font-bold text-white/70">
                                    Razão social
                                </label>
                                <input
                                    id="company"
                                    type="text"
                                    readOnly
                                    value={company}
                                    onFocus={() => handleFocus("razao_social", company)}
                                    placeholder="Nome da empresa"
                                    className={`${fieldBase} ${fieldBorder(inputName === "razao_social", false)}`}
                                />
                            </div>
                        )}
                    </div>

                    {/* ---------- TECLADO VIRTUAL ---------- */}
                    <div className="mt-2 rounded-3xl border border-white/10 bg-[#0c1933]/70 p-5">
                        <Keyboard
                            keyboardRef={(r: any) => (keyboardRef.current = r)}
                            baseClass="slot-keyboard"
                            layoutName={layoutName}
                            onChange={onKeyboardChange}
                            onKeyPress={onKeyPress}
                            disableCaretPositioning={true}
                            layout={{
                                default: [
                                    "1 2 3 4 5 6 7 8 9 0",
                                    "q w e r t y u i o p á é í",
                                    "a s d f g h j k l ó ú ç",
                                    "{shift} z x c v b n m ã {backspace}",
                                    "@ . _ - + * .com .br {space}",
                                ],
                                shift: [
                                    "! @ # $ % ¨ & * ( )",
                                    "Q W E R T Y U I O P Á É Í",
                                    "A S D F G H J K L Ó Ú Ç",
                                    "{shift} Z X C V B N M Ã {backspace}",
                                    "@ . _ - + ? ^ ~ .com .br {space}",
                                ],
                            }}
                            display={{
                                "{backspace}": "⌫ Apagar",
                                "{shift}": "⇧",
                                "{space}": "Espaço",
                                ".com": ".com",
                                ".br": ".br",
                                "@": "@",
                            }}
                        />
                    </div>

                    {/* ---------- É CLIENTE ---------- */}
                    <div
                        className={`items-center gap-8 rounded-2xl border border-white/15 bg-[#0c1933]/60 p-6 ${
                            fields.e_cliente ? "flex" : "hidden"
                        }`}
                    >
                        <span className="whitespace-nowrap text-2xl font-bold">
                            É cliente Sibrax?
                        </span>

                        <div className="flex gap-6">
                            {[
                                { label: "Sim", value: true },
                                { label: "Não", value: false },
                            ].map((option) => {
                                const active = isClient === option.value;

                                return (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => escolherCliente(option.value)}
                                        className="flex items-center gap-3"
                                    >
                                        <span
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors ${
                                                active
                                                    ? "border-[#45b552] bg-[#45b552]"
                                                    : "border-white/30 bg-white/5"
                                            }`}
                                        >
                                            {active && (
                                                <Check
                                                    color="#ffffff"
                                                    size={26}
                                                    strokeWidth={4}
                                                />
                                            )}
                                        </span>
                                        <span
                                            className={`text-2xl font-bold ${
                                                active ? "text-white" : "text-white/50"
                                            }`}
                                        >
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ---------- SISTEMA ATUAL (só para não clientes) ---------- */}
                    {perguntarSistema && (
                        <div className="flex flex-col gap-2 rounded-2xl border border-[#f05f0c]/40 bg-[#0c1933]/60 p-6">
                            <label className="text-2xl font-bold">
                                Qual sistema você utiliza?
                            </label>
                            <input
                                id="sistema_atual"
                                type="text"
                                readOnly
                                value={sistema}
                                onFocus={() => handleFocus("sistema_atual", sistema)}
                                placeholder="Nome do sistema"
                                className={`${fieldBase} ${fieldBorder(inputName === "sistema_atual", false)}`}
                            />
                        </div>
                    )}

                    {submitError && (
                        <span className="text-center text-xl font-semibold text-red-400">
                            {submitError}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={createLead}
                        disabled={!isFormValid || isSubmitting}
                        className="mt-2 w-full rounded-full bg-gradient-to-b from-[#ff7a29] to-[#f05f0c] px-12 py-5 text-3xl font-bold italic uppercase tracking-widest text-white shadow-[0_12px_30px_rgba(240,95,12,0.45),inset_0_2px_0_rgba(255,255,255,0.35)] transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {buttonLabel}
                    </button>
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
