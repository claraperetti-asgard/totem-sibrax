/**
 * Quais campos aparecem no formulário. O admin liga e desliga cada um;
 * o que estiver desligado não é exibido e vai como null para o banco.
 *
 * O CPF é `locked`: ele identifica a pessoa e é o que garante um giro
 * por CPF, então não pode ser desmarcado.
 */
export type FormFieldId =
    | "nome"
    | "telefone"
    | "email"
    | "cpf"
    | "razao_social"
    | "e_cliente";

export type FormFieldDef = {
    id: FormFieldId;
    label: string;
    hint?: string;
    /** não pode ser desligado no painel */
    locked?: boolean;
};

export const FORM_FIELDS: FormFieldDef[] = [
    { id: "nome", label: "Nome" },
    { id: "telefone", label: "Telefone" },
    { id: "email", label: "E-mail" },
    { id: "cpf", label: "CPF", hint: "Obrigatório", locked: true },
    { id: "razao_social", label: "Razão Social" },
    // obrigatório porque o prêmio máximo é exclusivo de quem não é cliente
    { id: "e_cliente", label: "É cliente", hint: "Obrigatório", locked: true },
];

export type FormFieldsConfig = Record<FormFieldId, boolean>;

export const DEFAULT_FORM_FIELDS: FormFieldsConfig = {
    nome: true,
    telefone: true,
    email: true,
    cpf: true,
    razao_social: true,
    e_cliente: true,
};

/** garante todas as chaves e mantém os campos `locked` sempre ligados */
export function normalizeFormFields(raw: unknown): FormFieldsConfig {
    const source =
        raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

    const out = {} as FormFieldsConfig;

    for (const field of FORM_FIELDS) {
        if (field.locked) {
            out[field.id] = true;
            continue;
        }

        out[field.id] =
            source[field.id] === undefined
                ? DEFAULT_FORM_FIELDS[field.id]
                : Boolean(source[field.id]);
    }

    return out;
}

/** ordem em que os campos de texto recebem foco no teclado virtual */
export const TEXT_FIELD_IDS = FORM_FIELDS.filter(
    (f) => f.id !== "e_cliente",
).map((f) => f.id);
