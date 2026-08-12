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
 * O prêmio máximo é o único com fatia exata: o `weight` dele já é a
 * porcentagem final (10%). Os 7 brindes dividem os 90 restantes
 * mantendo a proporção entre si — como os pesos deles somam 100,
 * cada um acaba valendo 90% do que foi configurado.
 */
export function defaultPrizeChances(): PrizeChances {
    const jackpot = PRIZES.find((p) => p.jackpot);
    const fatiaJackpot = jackpot
        ? Math.min(100, Math.max(0, jackpot.weight))
        : 0;

    const outros = PRIZES.filter((p) => !p.jackpot);
    const valores = distribute(
        outros.map((p) => p.weight),
        100 - fatiaJackpot,
    );

    const chances: PrizeChances = {};

    if (jackpot) chances[jackpot.id] = fatiaJackpot;
    outros.forEach((p, i) => {
        chances[p.id] = valores[i];
    });

    return chances;
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




/**
 * Soma das fatias dos prêmios que não são o prêmio máximo — ou seja,
 * o que sobra para quem é cliente. Se der zero, a configuração deixa
 * clientes sem nenhum prêmio definido.
 */
export function somaSemJackpot(chances: PrizeChances): number {
    return PRIZES.filter((p) => !p.jackpot).reduce(
        (soma, p) => soma + (chances[p.id] ?? 0),
        0,
    );
}

/**
 * Sorteia o índice do prêmio da combinação vencedora, ponderado pelas
 * chances configuradas no painel.
 *
 * Com `permitirJackpot: false` o prêmio máximo sai da roleta e a fatia
 * dele é redistribuída sozinha: o total passa a ser a soma dos prêmios
 * elegíveis em vez de 100 fixo, então os 90% restantes viram os novos
 * 100% e cada prêmio cresce proporcionalmente.
 */
export function pickPrizeIndex(
    chances: PrizeChances,
    { permitirJackpot = true }: { permitirJackpot?: boolean } = {},
): number {
    const elegiveis = PRIZES.map((prize, index) => ({ prize, index })).filter(
        ({ prize }) => permitirJackpot || !prize.jackpot,
    );

    const total = elegiveis.reduce(
        (soma, { prize }) => soma + (chances[prize.id] ?? 0),
        0,
    );

    // Todas as fatias elegíveis zeradas — acontece, por exemplo, com o
    // prêmio máximo em 100% e um jogador que é cliente. Não há roleta
    // ponderada possível, então sorteia igualmente entre os elegíveis:
    // devolver sempre o primeiro faria o resultado depender da ordem da
    // lista de prêmios, o que é arbitrário.
    if (total <= 0) {
        return elegiveis[Math.floor(Math.random() * elegiveis.length)].index;
    }

    let point = Math.random() * total;

    for (const { prize, index } of elegiveis) {
        point -= chances[prize.id] ?? 0;
        if (point < 0) return index;
    }

    // só chega aqui por resíduo de ponto flutuante
    return elegiveis[elegiveis.length - 1].index;
}
