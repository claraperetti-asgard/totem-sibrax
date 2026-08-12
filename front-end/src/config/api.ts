/**
 * Endereço do back-end (o server.js da pasta back-end, porta 3000).
 *
 * Em produção, definir VITE_API_URL no .env do front — no totem o
 * back-end costuma rodar na mesma máquina, então o padrão já serve.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const apiUrl = (path: string) => `${API_URL}${path}`;
