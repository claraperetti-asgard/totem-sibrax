import { PRIZES } from "./prizes";


export type PrizeChances = Record<string, number>;

const PRIZE_IDS = PRIZES.map((p) => p.id);

function distribute(weights: number[], target: number): number[] {
    const n = weights.length;

    if (n === 0) return [];
    if (target <= 0) return new Array(n).fill(0);

    const total = weights.reduce((a, b) => a + b, 0);

    // sem nenhum peso para se basear, divide em partes iguais
    const exact =
        total > 0
            ? weights.map((w) => (w / total) * target)
            : weights.map(() => target / n);

    const floors = exact.map(Math.floor);
    const rest = target - floors.reduce((a, b) => a + b, 0);

    const byFraction = exact
        .map((v, i) => ({ i, frac: v - Math.floor(v) }))
        .sort((a, b) => b.frac - a.frac);

    const out = [...floors];
    for (let k = 0; k < rest; k++) out[byFraction[k].i] += 1;

    return out;
}

/**
 * Distribuição padrão, vinda do `weight` de cada prêmio.
 *
 * Os pesos dos 7 brindes já somam 100 e o prêmio máximo entra com 2,
 * dando 102 no total — a normalização espreme tudo proporcionalmente
 * para caber em 100, tirando os 2 pontos das maiores fatias.
 */
export function defaultPrizeChances(): PrizeChances {
    const values = distribute(
        PRIZES.map((p) => p.weight),
        100,
    );

    return Object.fromEntries(PRIZE_IDS.map((id, i) => [id, values[i]]));
}

export function normalizePrizeChances(raw: unknown): PrizeChances {
    if (!raw || typeof raw !== "object") return defaultPrizeChances();

    const source = raw as Record<string, unknown>;

    const weights = PRIZE_IDS.map((id) => {
        const v = Number(source[id]);
        return Number.isFinite(v) && v > 0 ? v : 0;
    });

    if (weights.every((w) => w === 0)) return defaultPrizeChances();

    const values = distribute(weights, 100);

    return Object.fromEntries(PRIZE_IDS.map((id, i) => [id, values[i]]));
}

export function setPrizeChance(
    chances: PrizeChances,
    id: string,
    value: number,
): PrizeChances {
    const target = Math.min(100, Math.max(0, Math.round(value)));

    const otherIds = PRIZE_IDS.filter((p) => p !== id);
    if (otherIds.length === 0) return { [id]: 100 };

    const otherValues = distribute(
        otherIds.map((p) => chances[p] ?? 0),
        100 - target,
    );

    const next: PrizeChances = { [id]: target };
    otherIds.forEach((p, i) => {
        next[p] = otherValues[i];
    });

    return next;
}




export function pickPrizeIndex(chances: PrizeChances): number {
    let point = Math.random() * 100;

    for (let i = 0; i < PRIZES.length; i++) {
        point -= chances[PRIZES[i].id] ?? 0;
        if (point < 0) return i;
    }

    return PRIZES.length - 1;
}
