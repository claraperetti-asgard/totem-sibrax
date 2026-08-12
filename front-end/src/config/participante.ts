/**
 * Dados de quem acabou de se cadastrar, guardados só até o fim da
 * partida. Servem para o jogo saber a quem está entregando o prêmio.
 *
 * Fica no sessionStorage em vez de ir pelo state da navegação porque o
 * state do React Router se perde num F5 ou se alguém abrir /slotmachine
 * direto pela URL — e aí o jogo perderia a informação.
 */
const STORAGE_KEY = "slot_participante";

export type Participante = {
    /** 1 = é cliente Sibrax, 0 = não é */
    eCliente: 0 | 1;
};

export function saveParticipante(participante: Participante) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(participante));
    } catch {
        // sessionStorage indisponível: o jogo segue sem a informação
    }
}

export function loadParticipante(): Participante | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Partial<Participante>;

        return { eCliente: parsed.eCliente === 1 ? 1 : 0 };
    } catch {
        return null;
    }
}

export function clearParticipante() {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // nada a fazer
    }
}
