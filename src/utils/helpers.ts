import type { FichaEPI, FichaEPILinha, MotivoArquivamentoFicha } from "../types";
import type { EPI } from "../types";
import { tamanhosBotina, tamanhosUniforme } from "../data/epis";

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function getOpcoesTamanho(epi?: EPI) {
  if (!epi) return [];
  if (epi.tipoTamanho === "numerico") return tamanhosBotina;
  if (epi.tipoTamanho === "letra") return tamanhosUniforme;
  return [];
}

export function getStatusBadge(status: string) {
  if (status === "pendente") {
    return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
  }
  if (status === "separado") {
    return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
  }
  if (status === "enviado") {
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }
  if (status === "recebido") {
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }
  return "bg-slate-700 text-slate-300 border border-slate-600";
}

export const MAX_LINHAS_FICHA_EPI = 30;

export function generateId(prefix: string = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getFichasDoColaborador(
  fichas: FichaEPI[],
  colaboradorId: string
) {
  return fichas
    .filter((f) => f.colaboradorId === colaboradorId)
    .sort((a, b) => a.numeroFicha - b.numeroFicha);
}

export function getFichaAtivaDoColaborador(
  fichas: FichaEPI[],
  colaboradorId: string
) {
  return fichas.find(
    (f) => f.colaboradorId === colaboradorId && f.status === "ativa"
  );
}

export function criarNovaFichaEPI(params: {
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorMatricula: string;
  colaboradorCpf?: string;
  colaboradorCargo: string;
  fazendaId: string;
  numeroFicha: number;
}): FichaEPI {
  const now = new Date().toISOString();

  return {
    id: generateId("ficha_epi"),
    colaboradorId: params.colaboradorId,
    colaboradorNome: params.colaboradorNome,
    colaboradorMatricula: params.colaboradorMatricula,
    colaboradorCpf: params.colaboradorCpf,
    colaboradorCargo: params.colaboradorCargo,
    fazendaId: params.fazendaId,
    numeroFicha: params.numeroFicha,
    status: "ativa",
    maxLinhas: MAX_LINHAS_FICHA_EPI,
    createdAt: now,
    updatedAt: now,
    linhas: [],
  };
}

export function arquivarFicha(
  ficha: FichaEPI,
  motivo: MotivoArquivamentoFicha
): FichaEPI {
  const now = new Date().toISOString();

  return {
    ...ficha,
    status: "arquivada",
    updatedAt: now,
    arquivadaEm: now,
    motivoArquivamento: motivo,
  };
}

export function adicionarLinhasNaFicha(
  ficha: FichaEPI,
  novasLinhas: FichaEPILinha[]
): FichaEPI {
  return {
    ...ficha,
    linhas: [...ficha.linhas, ...novasLinhas],
    updatedAt: new Date().toISOString(),
  };
}