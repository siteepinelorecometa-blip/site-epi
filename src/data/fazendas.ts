import type { Fazenda } from "../types";

export const fazendasMock: Fazenda[] = [
  { id: "ESC", nome: "Escritório", sigla: "ESC", senha: "epi2026", ativa: false },
  { id: "EC", nome: "Estância Cometa", sigla: "EC", senha: "epi2026", ativa: true },
  { id: "FL", nome: "Furna Linda", sigla: "FL", senha: "epi2026", ativa: true },
  { id: "FPI", nome: "Pantanal I", sigla: "FPI", senha: "epi2026", ativa: true },
  { id: "FPII", nome: "Pantanal II", sigla: "FPII", senha: "epi2026", ativa: true },
  { id: "VJ", nome: "Vale do Jauru", sigla: "VJ", senha: "epi2026", ativa: true },
  { id: "SR", nome: "Santa Rita", sigla: "SR", senha: "epi2026", ativa: true },
  { id: "EM", nome: "Estância Maristela", sigla: "EM", senha: "epi2026", ativa: true },
  { id: "SS", nome: "São Sebastião", sigla: "SS", senha: "epi2026", ativa: true },
  { id: "LI", nome: "Liberdade", sigla: "LI", senha: "epi2026", ativa: true },
  { id: "SL", nome: "São Lucas", sigla: "SL", senha: "epi2026", ativa: true },
];

export const ADMIN_SENHA = "admin2026";