export type Fazenda = {
  id: string;
  nome: string;
  sigla: string;
  senha: string;
  ativa: boolean;
};

export type UsuarioLogado = {
  tipo: "fazenda" | "admin";
  usuario: string;
  fazenda: { id: string; nome: string; sigla: string } | null;
};

export type Colaborador = {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  cargo: string;
  departamento: string;
  email: string;
  telefone: string;
  dataAdmissao: string;
  ativo: boolean;
  fazendaId: string;
  tipoColaborador: "fazenda" | "escritorio";
};

export type TipoTamanho = "nenhum" | "numerico" | "letra";

export type EPI = {
  id: string;
  nome: string;
  ca: string;
  unidade: string;
  tipoTamanho: TipoTamanho;
};

export type PedidoItem = {
  epiId: string;
  quantidade: number;
  tamanho?: string;
};

export type PedidoStatus = "pendente" | "separado" | "enviado";

export type Pedido = {
  id: string;
  fazendaId: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorCpf: string;
  colaboradorMatricula: string;
  cargo: string;
  departamento: string;
  dataPedido: string;
  observacoes: string;
  itens: PedidoItem[];
  status: PedidoStatus;
  dataSeparacao?: string;
  dataEnvio?: string;
};

export type EntregaStatus = "separado" | "enviado" | "recebido";

export type Entrega = {
  id: string;
  pedidoId: string;
  fazendaId: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorMatricula: string;
  dataEntrega: string;
  itens: PedidoItem[];
  status: EntregaStatus;
};

export type FichaEPIStatus = "ativa" | "arquivada";

export type MotivoArquivamentoFicha = "manual" | "lotacao";

export type FichaEPILinha = {
  id: string;
  dataEntrega: string;
  entregaId: string;
  pedidoId?: string;
  epiId: string;
  epiNome: string;
  quantidade: number;
  tamanho?: string;
  ca: string;
  assinatura?: string;
  motivoTroca?: string;
  devolucaoData?: string;
};

export type FichaEPI = {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorMatricula: string;
  colaboradorCpf?: string;
  colaboradorCargo: string;
  fazendaId: string;
  numeroFicha: number;
  status: FichaEPIStatus;
  maxLinhas: number;
  createdAt: string;
  updatedAt: string;
  arquivadaEm?: string;
  motivoArquivamento?: MotivoArquivamentoFicha;
  linhas: FichaEPILinha[];
};

export type TipoMovimentacaoEstoque =
  | "entrada"
  | "saida_pedido"
  | "saida_escritorio"
  | "ajuste";

export type MovimentacaoEstoque = {
  id: string;
  epiId: string;
  epiNome: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  data: string;
  observacao?: string;
  usuario?: string;
};

export type EstoqueEPI = {
  epiId: string;
  quantidadeAtual: number;
  estoqueMinimo?: number;
  updatedAt: string;
};

export type ItemEntradaEstoque = {
  epiId: string;
  quantidade: number;
  observacao?: string;
};

export type ItemAjusteEstoque = {
  epiId: string;
  quantidade: number;
  observacao?: string;
};