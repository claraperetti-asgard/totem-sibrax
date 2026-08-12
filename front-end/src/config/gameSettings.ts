import {
    defaultPrizeChances,
    normalizePrizeChances,
    type PrizeChances,
} from "./prizeChances";
import {
    DEFAULT_FORM_FIELDS,
    normalizeFormFields,
    type FormFieldsConfig,
} from "./formFields";

export type GameSettings = {
    maxAttempts: number;
    winChance: number;
    prizeChances: PrizeChances;
    /** quais campos aparecem no formulário */
    formFields: FormFieldsConfig;
};

export const DEFAULT_SETTINGS: GameSettings = {
    maxAttempts: 1,
    winChance: 0.45,
    prizeChances: defaultPrizeChances(),
    formFields: DEFAULT_FORM_FIELDS,
};

const STORAGE_KEY = "slot_game_settings";

export const ADMIN_USER = "sibrax";
export const ADMIN_PASSWORD = "sibrax2026";

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

export function loadGameSettings(): GameSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;

        const parsed = JSON.parse(raw) as Partial<GameSettings>;

        return {
            maxAttempts: Number.isFinite(parsed.maxAttempts)
                ? clamp(Math.round(parsed.maxAttempts as number), 1, 10)
                : DEFAULT_SETTINGS.maxAttempts,
            winChance: Number.isFinite(parsed.winChance)
                ? clamp(parsed.winChance as number, 0, 1)
                : DEFAULT_SETTINGS.winChance,
            // a lista de prêmios pode ter mudado desde o último save
            prizeChances: normalizePrizeChances(parsed.prizeChances),
            formFields: normalizeFormFields(parsed.formFields),
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveGameSettings(settings: GameSettings): GameSettings {
    const safe: GameSettings = {
        maxAttempts: clamp(Math.round(settings.maxAttempts), 1, 10),
        winChance: clamp(settings.winChance, 0, 1),
        prizeChances: normalizePrizeChances(settings.prizeChances),
        formFields: normalizeFormFields(settings.formFields),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));

    return safe;
}