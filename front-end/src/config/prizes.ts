import Icon1Branco from "../assets/icon1-branco-sem-fundo.png";
import Icon3Branco from "../assets/icon3-branco-sem-fundo.png";
import Icon4Colorido from "../assets/icon4-colorido-sem-fundo.png";
import Icon6Branco from "../assets/icon6-branco-sem-fundo.png";
import Icon7Branco from "../assets/icon7-branco-sem-fundo.png";
import Selo32Anos from "../assets/selo-32-anos.png";
import CardSibrax from "../assets/card-sibrax.jpeg";

export type Prize = {
    id: string;
    label: string;
    article: "um" | "uma";
    bg: string;
    image?: string;
    imageFill?: boolean;
    weight: number;

    jackpot?: boolean;
};

export const PRIZES: Prize[] = [
    {
        id: "mouse-pad",
        label: "Mouse pad",
        article: "um",
        bg: "#2465b5",
        image: Icon1Branco,
        weight: 20,
    },
    {
        id: "kit-queijo",
        label: "Kit Queijo",
        article: "um",
        bg: "#2e4b82",
        image: Selo32Anos,
        weight: 5,
    },
    {
        id: "chaveiro-couro",
        label: "Chaveiro em Couro",
        article: "um",
        bg: "#ffffff",
        image: Icon4Colorido,
        weight: 15,
    },
    {
        id: "chaveiro-metal",
        label: "Chaveiro em Metal",
        article: "um",
        bg: "#f05f0c",
        image: Icon3Branco,
        weight: 25,
    },
    {
        id: "caderneta-linho",
        label: "Caderneta de Linho",
        article: "uma",
        bg: "#45b552",
        image: Icon6Branco,
        weight: 20,
    },
    {
        id: "copo-termico",
        label: "Copo Térmico",
        article: "um",
        bg: "#012757",
        image: Icon7Branco,
        weight: 10,
    },
    {
        id: "garrafa-termica",
        label: "Garrafa Térmica",
        article: "uma",
        bg: "#02bae8",
        image: CardSibrax,
        imageFill: true,
        weight: 5,
    },
    {
        id: "premio-maximo",
        label: "Prêmio Máximo",
        article: "um",
        bg: "#f7c948",
        jackpot: true,
        weight: 10,
    },
];

export const JACKPOT_INDEX = PRIZES.findIndex((p) => p.jackpot);

export const getPrize = (id?: string): Prize | undefined =>
    PRIZES.find((p) => p.id === id);
