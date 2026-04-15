import FichasArquivadasPage from "./pages/FichasArquivadasPage";
import EPIList from "./components/EPIList";
import ColaboradorList from "./components/ColaboradorList";
import Dashboard from "./components/Dashboard";
import FichaEPIModelo from "./components/FichaEPIModelo";
import Header from "./components/Header";
import LoginScreen from "./components/LoginScreen";
import EPISelectorList from "./components/EPISelectorList";
import {
  formatDate,
  getOpcoesTamanho,
  getStatusBadge,
  MAX_LINHAS_FICHA_EPI,
  generateId,
  getFichasDoColaborador,
  getFichaAtivaDoColaborador,
  criarNovaFichaEPI,
  arquivarFicha,
  adicionarLinhasNaFicha,
} from "./utils/helpers";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { fazendasMock, ADMIN_SENHA } from "./data/fazendas";
import { tamanhosUniforme, tamanhosBotina, episIniciais } from "./data/epis";
import { colaboradoresIniciais } from "./data/colaboradores";
import type {
  Fazenda,
  UsuarioLogado,
  Colaborador,
  TipoTamanho,
  EPI,
  PedidoItem,
  Pedido,
  Entrega,
  PedidoStatus,
  FichaEPI,
  FichaEPILinha,
  EstoqueEPI,
  MovimentacaoEstoque,
} from "./types";
import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
  FileText,
  LogOut,
  Home,
  Package,
  Users,
  Truck,
  BarChart3,
  Plus,
  Search,
  X,
  Edit,
  ChevronDown,
  ShoppingCart,
  CheckCircle,
  ClipboardList,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function PedidoForm({
  usuario,
  colaboradores,
  epis,
  onSave,
  onShowAlert,
}: {
  usuario: UsuarioLogado;
  colaboradores: Colaborador[];
  epis: EPI[];
  onSave: (pedido: Pedido) => void;
  onShowAlert: (message: string, title?: string, variant?: AppDialogVariant) => void;
}) {
  const [colaboradorId, setColaboradorId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [selectedItems, setSelectedItems] = useState<PedidoItem[]>([]);

  const colaboradoresDaFazenda = colaboradores.filter(
    (c) => c.ativo && c.fazendaId === usuario.fazenda?.id
  );

  const colaboradorSelecionado =
    colaboradoresDaFazenda.find((c) => c.id === colaboradorId) || null;

  const inputClasses =
    "w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-2";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!colaboradorSelecionado) {
      onShowAlert("Selecione um colaborador.", "Atenção", "warning");
      return;
    }

    if (selectedItems.length === 0) {
      onShowAlert("Selecione pelo menos um EPI.", "Atenção", "warning");
      return;
    }

    for (const item of selectedItems) {
      const epi = epis.find((e) => e.id === item.epiId);
      if (epi && epi.tipoTamanho !== "nenhum" && !item.tamanho) {
        onShowAlert(`Selecione o tamanho para ${epi.nome}.`, "Atenção", "warning");
        return;
      }
    }

    onSave({
      id: Date.now().toString(),
      fazendaId: usuario.fazenda!.id,
      colaboradorId: colaboradorSelecionado.id,
      colaboradorNome: colaboradorSelecionado.nome,
      colaboradorCpf: colaboradorSelecionado.cpf,
      colaboradorMatricula: colaboradorSelecionado.matricula,
      cargo: colaboradorSelecionado.cargo,
      departamento: colaboradorSelecionado.departamento,
      dataPedido: new Date().toISOString(),
      observacoes,
      itens: selectedItems,
      status: "pendente",
    });

    setColaboradorId("");
    setObservacoes("");
    setSelectedItems([]);
    onShowAlert("Pedido enviado para o administrador com sucesso.", "Pedido enviado", "success");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6"
    >
      <div>
        <label className={labelClasses}>Colaborador *</label>
        <select
          value={colaboradorId}
          onChange={(e) => setColaboradorId(e.target.value)}
          className={inputClasses}
          required
        >
          <option value="">Selecione um colaborador</option>
          {colaboradoresDaFazenda.map((col) => (
            <option key={col.id} value={col.id}>
              {col.nome} - {col.matricula}
            </option>
          ))}
        </select>
      </div>

      {colaboradorSelecionado && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
          <div>
            <p className="text-xs text-slate-400">Nome</p>
            <p className="text-white font-medium">{colaboradorSelecionado.nome}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">CPF</p>
            <p className="text-white font-medium">
              {colaboradorSelecionado.cpf || "---.---.---.--"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Fazenda</p>
            <p className="text-white font-medium">{usuario.fazenda?.nome}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Matrícula</p>
            <p className="text-white font-medium">{colaboradorSelecionado.matricula}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Cargo</p>
            <p className="text-white font-medium">{colaboradorSelecionado.cargo}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Departamento</p>
            <p className="text-white font-medium">
              {colaboradorSelecionado.departamento}
            </p>
          </div>
        </div>
      )}

      <div>
        <label className={labelClasses}>Selecione os EPIs *</label>
        <EPISelectorList
          epis={epis}
          selectedItems={selectedItems}
          onChange={setSelectedItems}
        />
      </div>

      <div>
        <label className={labelClasses}>Observações</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          className={inputClasses}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
        >
          Enviar Pedido
        </button>
      </div>
    </form>
  );
}

function MeusPedidosList({
  usuario,
  pedidos,
  epis,
}: {
  usuario: UsuarioLogado;
  pedidos: Pedido[];
  epis: EPI[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<"all" | PedidoStatus>("all");
  const [periodoFiltro, setPeriodoFiltro] = useState("30dias");

  function pedidoDentroDoPeriodo(dataPedido: string, periodo: string) {
    if (periodo === "todos") return true;

    const hoje = new Date();
    const data = new Date(dataPedido);
    const limite = new Date();

    if (periodo === "30dias") {
      limite.setDate(hoje.getDate() - 30);
    } else if (periodo === "3meses") {
      limite.setMonth(hoje.getMonth() - 3);
    } else if (periodo === "6meses") {
      limite.setMonth(hoje.getMonth() - 6);
    } else if (periodo === "12meses") {
      limite.setFullYear(hoje.getFullYear() - 1);
    }

    return data >= limite;
  }

  const meusPedidos = pedidos
    .filter((pedido) => pedido.fazendaId === usuario.fazenda?.id)
    .filter((pedido) => pedidoDentroDoPeriodo(pedido.dataPedido, periodoFiltro))
    .filter((pedido) => {
      const texto = searchTerm.toLowerCase();
      const itensTexto = pedido.itens
        .map((item) => {
          const epi = epis.find((e) => e.id === item.epiId);
          return `${epi?.nome || ""} ${item.tamanho || ""}`;
        })
        .join(" ")
        .toLowerCase();

      const bateStatus = statusFiltro === "all" || pedido.status === statusFiltro;

      return (
        bateStatus &&
        (
          pedido.colaboradorNome.toLowerCase().includes(texto) ||
          pedido.colaboradorMatricula.toLowerCase().includes(texto) ||
          itensTexto.includes(texto)
        )
      );
    })
    .sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime());

  const pedidosDaFazenda = pedidos.filter((p) => p.fazendaId === usuario.fazenda?.id);

  const resumo = {
    total: pedidosDaFazenda.filter((p) => pedidoDentroDoPeriodo(p.dataPedido, periodoFiltro)).length,
    pendentes: pedidosDaFazenda.filter(
      (p) => p.status === "pendente" && pedidoDentroDoPeriodo(p.dataPedido, periodoFiltro)
    ).length,
    separados: pedidosDaFazenda.filter(
      (p) => p.status === "separado" && pedidoDentroDoPeriodo(p.dataPedido, periodoFiltro)
    ).length,
    enviados: pedidosDaFazenda.filter(
      (p) => p.status === "enviado" && pedidoDentroDoPeriodo(p.dataPedido, periodoFiltro)
    ).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Meus Pedidos</h3>
        <p className="text-slate-400 mt-1">Acompanhe o andamento dos pedidos da sua fazenda.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-sm text-slate-400">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{resumo.total}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-sm text-slate-400">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{resumo.pendentes}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-sm text-slate-400">Separados</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{resumo.separados}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-sm text-slate-400">Enviados</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{resumo.enviados}</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por colaborador, matrícula ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 min-w-[220px]">
            <div className="relative min-w-[220px]">
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value as "all" | PedidoStatus)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="separado">Separado</option>
                <option value="enviado">Enviado</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative min-w-[220px]">
              <select
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
              >
                <option value="30dias">Últimos 30 dias</option>
                <option value="3meses">Últimos 3 meses</option>
                <option value="6meses">Últimos 6 meses</option>
                <option value="12meses">Últimos 12 meses</option>
                <option value="todos">Todos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {meusPedidos.length === 0 && (
            <div className="text-slate-400 text-sm py-8 text-center">Nenhum pedido encontrado.</div>
          )}

          {meusPedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-semibold">{pedido.colaboradorNome}</span>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(pedido.status)}`}>
                      {pedido.status}
                    </span>
                  </div>

                  <div className="text-sm text-slate-400">
                    Matrícula: {pedido.colaboradorMatricula}
                  </div>
                  <div className="text-sm text-slate-400">Cargo: {pedido.cargo}</div>
                  <div className="text-sm text-slate-500">{formatDate(pedido.dataPedido)}</div>

                  <div className="pt-2 space-y-1">
                    {pedido.itens.map((item, index) => {
                      const epi = epis.find((e) => e.id === item.epiId);
                      return (
                        <div key={index} className="text-sm text-slate-300">
                          {epi?.nome || "EPI"} - {item.quantidade} {epi?.unidade || "un"}
                          {item.tamanho ? ` - Tam: ${item.tamanho}` : ""}
                        </div>
                      );
                    })}
                  </div>

                  {pedido.observacoes && (
                    <div className="text-sm text-slate-400 pt-2">
                      Obs: {pedido.observacoes}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  {pedido.status === "pendente" && "Aguardando separação pelo administrador"}
                  {pedido.status === "separado" && "Pedido separado pelo administrador"}
                  {pedido.status === "enviado" && "Pedido enviado para a fazenda"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FarmPedidosPage({
  usuario,
  colaboradores,
  epis,
  pedidos,
  onSavePedido,
  onShowAlert,
}: {
  usuario: UsuarioLogado;
  colaboradores: Colaborador[];
  epis: EPI[];
  pedidos: Pedido[];
  onSavePedido: (pedido: Pedido) => void;
  onShowAlert: (message: string, title?: string, variant?: AppDialogVariant) => void;
}) {
  const [tab, setTab] = useState<"novo" | "historico">("novo");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Pedidos</h2>
        <p className="text-slate-400 mt-1">
          Faça novos pedidos e acompanhe o histórico da sua fazenda.
        </p>
      </div>

      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 w-full sm:w-fit">
        <button
          onClick={() => setTab("novo")}
          className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
            tab === "novo"
              ? "bg-emerald-500 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Novo Pedido
        </button>
        <button
          onClick={() => setTab("historico")}
          className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
            tab === "historico"
              ? "bg-emerald-500 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Meus Pedidos
        </button>
      </div>

      {tab === "novo" ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Novo Pedido</h3>
            <p className="text-slate-400 mt-1">
              Solicite EPIs para um colaborador da sua fazenda.
            </p>
          </div>

          <PedidoForm
            usuario={usuario}
            colaboradores={colaboradores}
            epis={epis}
            onSave={onSavePedido}
            onShowAlert={onShowAlert}
          />
        </div>
      ) : (
        <MeusPedidosList usuario={usuario} pedidos={pedidos} epis={epis} />
      )}
    </div>
  );
}

function PedidosList({
  pedidos,
  entregas,
  epis,
  onMarcarSeparado,
  onMarcarEnviado,
}: {
  pedidos: Pedido[];
  entregas: Entrega[];
  epis: EPI[];
  onMarcarSeparado: (id: string) => void;
  onMarcarEnviado: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFazenda, setFilterFazenda] = useState("all");
  const [aba, setAba] = useState<"naoFinalizados" | "finalizados">("naoFinalizados");
  const [subAbaNaoFinalizados, setSubAbaNaoFinalizados] = useState<"enviados" | "aceitos">("enviados");
  const [periodoFiltro, setPeriodoFiltro] = useState("30dias");

  function pedidoDentroDoPeriodo(dataPedido: string, periodo: string) {
    if (periodo === "todos") return true;

    const hoje = new Date();
    const data = new Date(dataPedido);
    const limite = new Date();

    if (periodo === "30dias") {
      limite.setDate(hoje.getDate() - 30);
    } else if (periodo === "3meses") {
      limite.setMonth(hoje.getMonth() - 3);
    } else if (periodo === "6meses") {
      limite.setMonth(hoje.getMonth() - 6);
    } else if (periodo === "12meses") {
      limite.setFullYear(hoje.getFullYear() - 1);
    }

    return data >= limite;
  }

  function pedidoEstaFinalizado(pedidoId: string) {
    return entregas.some((entrega) => entrega.pedidoId === pedidoId && entrega.status === "recebido");
  }

  const pedidosFiltrados = pedidos
    .filter((pedido) => filterFazenda === "all" || pedido.fazendaId === filterFazenda)
    .filter((pedido) => pedidoDentroDoPeriodo(pedido.dataPedido, periodoFiltro))
    .filter((pedido) => {
      const texto = searchTerm.toLowerCase();

      const itensTexto = pedido.itens
        .map((item) => {
          const epi = epis.find((e) => e.id === item.epiId);
          return `${epi?.nome || ""} ${item.tamanho || ""}`;
        })
        .join(" ")
        .toLowerCase();

      return (
        pedido.colaboradorNome.toLowerCase().includes(texto) ||
        pedido.colaboradorMatricula.toLowerCase().includes(texto) ||
        itensTexto.includes(texto)
      );
    })
    .filter((pedido) => {
      const finalizado = pedidoEstaFinalizado(pedido.id);

      if (aba === "finalizados") {
        return finalizado;
      }

      if (finalizado) return false;

      if (subAbaNaoFinalizados === "enviados") {
        return pedido.status === "pendente";
      }

      return pedido.status === "separado" || pedido.status === "enviado";
    })
    .sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime());

  const resumo = {
    enviadosPelasFazendas: pedidos.filter(
      (p) =>
        p.status === "pendente" &&
        !pedidoEstaFinalizado(p.id) &&
        pedidoDentroDoPeriodo(p.dataPedido, periodoFiltro)
    ).length,
    aceitos: pedidos.filter(
      (p) =>
        (p.status === "separado" || p.status === "enviado") &&
        !pedidoEstaFinalizado(p.id) &&
        pedidoDentroDoPeriodo(p.dataPedido, periodoFiltro)
    ).length,
    finalizados: pedidos.filter(
      (p) =>
        pedidoEstaFinalizado(p.id) &&
        pedidoDentroDoPeriodo(p.dataPedido, periodoFiltro)
    ).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Pedidos das Fazendas</h2>
        <p className="text-slate-400 mt-1">
          Visualize os pedidos em andamento e os já finalizados.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-sm text-slate-400">Enviados pelas Fazendas</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{resumo.enviadosPelasFazendas}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-sm text-slate-400">Aceitos / Em Andamento</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{resumo.aceitos}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-sm text-slate-400">Finalizados</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{resumo.finalizados}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 w-full sm:w-fit">
          <button
            onClick={() => setAba("naoFinalizados")}
            className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
              aba === "naoFinalizados"
                ? "bg-emerald-500 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pedidos Não Finalizados
          </button>
          <button
            onClick={() => setAba("finalizados")}
            className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
              aba === "finalizados"
                ? "bg-emerald-500 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pedidos Finalizados
          </button>
        </div>

        {aba === "naoFinalizados" && (
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 w-full sm:w-fit">
            <button
              onClick={() => setSubAbaNaoFinalizados("enviados")}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                subAbaNaoFinalizados === "enviados"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Enviados pelas Fazendas
            </button>
            <button
              onClick={() => setSubAbaNaoFinalizados("aceitos")}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                subAbaNaoFinalizados === "aceitos"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Aceitos / Em Andamento
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por colaborador, matrícula ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative min-w-[220px]">
              <select
                value={filterFazenda}
                onChange={(e) => setFilterFazenda(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
              >
                <option value="all">Todas as Fazendas</option>
                {fazendasMock.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative min-w-[220px]">
              <select
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
              >
                <option value="30dias">Últimos 30 dias</option>
                <option value="3meses">Últimos 3 meses</option>
                <option value="6meses">Últimos 6 meses</option>
                <option value="12meses">Últimos 12 meses</option>
                <option value="todos">Todos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {pedidosFiltrados.length === 0 && (
            <div className="text-slate-400 text-sm py-8 text-center">Nenhum pedido encontrado.</div>
          )}

          {pedidosFiltrados.map((pedido) => {
            const fazenda = fazendasMock.find((f) => f.id === pedido.fazendaId);
            const finalizado = pedidoEstaFinalizado(pedido.id);

            return (
              <div
                key={pedido.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white font-semibold">{pedido.colaboradorNome}</span>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(finalizado ? "recebido" : pedido.status)}`}>
                        {finalizado ? "recebido" : pedido.status}
                      </span>
                    </div>

                    <div className="text-sm text-slate-400">
                      {fazenda?.nome} • Matrícula: {pedido.colaboradorMatricula}
                    </div>
                    <div className="text-sm text-slate-400">Cargo: {pedido.cargo}</div>
                    <div className="text-sm text-slate-400">CPF: {pedido.colaboradorCpf || "---.---.---.--"}</div>
                    <div className="text-sm text-slate-500">{formatDate(pedido.dataPedido)}</div>

                    <div className="pt-2 space-y-1">
                      {pedido.itens.map((item, index) => {
                        const epi = epis.find((e) => e.id === item.epiId);
                        return (
                          <div key={index} className="text-sm text-slate-300">
                            {epi?.nome || "EPI"} - {item.quantidade} {epi?.unidade || "un"}
                            {item.tamanho ? ` - Tam: ${item.tamanho}` : ""}
                          </div>
                        );
                      })}
                    </div>

                    {pedido.observacoes && (
                      <div className="text-sm text-slate-400 pt-2">
                        Obs: {pedido.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!finalizado && pedido.status === "pendente" && (
                      <button
                        onClick={() => onMarcarSeparado(pedido.id)}
                        className="px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-sm"
                      >
                        Marcar Separado
                      </button>
                    )}

                    {!finalizado && pedido.status === "separado" && (
                      <button
                        onClick={() => onMarcarEnviado(pedido.id)}
                        className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm"
                      >
                        Marcar Enviado
                      </button>
                    )}

                    {!finalizado && pedido.status === "enviado" && (
                      <span className="text-xs text-slate-500">Aguardando recebimento da fazenda</span>
                    )}

                    {finalizado && (
                      <span className="text-xs text-emerald-400">Pedido finalizado</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EntregasList({
  usuario,
  entregas,
  epis,
  onMarcarRecebido,
}: {
  usuario: UsuarioLogado;
  entregas: Entrega[];
  epis: EPI[];
  onMarcarRecebido: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFazenda, setFilterFazenda] = useState("all");

  const isAdmin = usuario.tipo === "admin";

  const entregasVisiveis = entregas.filter((entrega) => {
    const pertenceFazenda = isAdmin
      ? filterFazenda === "all" || entrega.fazendaId === filterFazenda
      : entrega.fazendaId === usuario.fazenda?.id;

    const itensTexto = entrega.itens
      .map((item) => {
        const epi = epis.find((e) => e.id === item.epiId);
        return `${epi?.nome || ""} ${item.tamanho || ""}`;
      })
      .join(" ")
      .toLowerCase();

    const texto = searchTerm.toLowerCase();

    return (
      pertenceFazenda &&
      (
        entrega.colaboradorNome.toLowerCase().includes(texto) ||
        entrega.colaboradorMatricula.toLowerCase().includes(texto) ||
        itensTexto.includes(texto)
      )
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Entregas</h2>
        <p className="text-slate-400 mt-1">
          {isAdmin ? "Todas as movimentações de entrega." : "Movimentações da sua fazenda."}
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por colaborador, matrícula ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {isAdmin && (
            <div className="relative min-w-[220px]">
              <select
                value={filterFazenda}
                onChange={(e) => setFilterFazenda(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
              >
                <option value="all">Todas as Fazendas</option>
                {fazendasMock.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {entregasVisiveis.length === 0 && (
            <div className="text-slate-400 text-sm py-8 text-center">Nenhuma entrega encontrada.</div>
          )}

          {entregasVisiveis.map((entrega) => {
            const fazenda = fazendasMock.find((f) => f.id === entrega.fazendaId);

            return (
              <div
                key={entrega.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white font-semibold">{entrega.colaboradorNome}</span>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(entrega.status)}`}>
                        {entrega.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {fazenda?.nome} • Matrícula: {entrega.colaboradorMatricula}
                    </div>
                    <div className="text-sm text-slate-500">{formatDate(entrega.dataEntrega)}</div>

                    <div className="pt-2 space-y-1">
                      {entrega.itens.map((item, index) => {
                        const epi = epis.find((e) => e.id === item.epiId);
                        return (
                          <div key={index} className="text-sm text-slate-300">
                            {epi?.nome || "EPI"} - {item.quantidade} {epi?.unidade || "un"}
                            {item.tamanho ? ` - Tam: ${item.tamanho}` : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isAdmin && entrega.status === "enviado" && (
                      <button
                        onClick={() => onMarcarRecebido(entrega.id)}
                        className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm inline-flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar Recebido
                      </button>
                    )}

                    {isAdmin && entrega.status === "recebido" && (
                      <span className="text-xs text-emerald-400">Confirmado pela fazenda</span>
                    )}

                    {isAdmin && entrega.status !== "recebido" && (
                      <span className="text-xs text-slate-500">Aguardando fazenda</span>
                    )}

                    {!isAdmin && entrega.status !== "enviado" && (
                      <span className="text-xs text-slate-500">Sem ação disponível</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Analytics({
  epis,
  colaboradores,
  pedidos,
  entregas,
  estoque,
  movimentacoesEstoque,
}: {
  epis: EPI[];
  colaboradores: Colaborador[];
  pedidos: Pedido[];
  entregas: Entrega[];
  estoque: EstoqueEPI[];
  movimentacoesEstoque: MovimentacaoEstoque[];
}) {
  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const formatarMes = (mes: string) => {
    if (!mes) return "";
    const [ano, numeroMes] = mes.split("-");
    const data = new Date(Number(ano), Number(numeroMes) - 1, 1);
    return data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const estaNoMes = (dataIso: string, mes: string) => {
    if (!dataIso || !mes) return false;
    return dataIso.slice(0, 7) === mes;
  };

  const mesesDisponiveis = Array.from(
    new Set([
      ...pedidos.map((p) => p.dataPedido.slice(0, 7)),
      ...entregas.map((e) => e.dataEntrega.slice(0, 7)),
      ...movimentacoesEstoque.map((m) => m.data.slice(0, 7)),
      new Date().toISOString().slice(0, 7),
    ])
  )
    .filter(Boolean)
    .sort()
    .reverse();

  const pedidosDoMes = pedidos.filter((p) => estaNoMes(p.dataPedido, mesSelecionado));
  const entregasDoMes = entregas.filter((e) => estaNoMes(e.dataEntrega, mesSelecionado));
  const movimentacoesDoMes = movimentacoesEstoque.filter((m) =>
    estaNoMes(m.data, mesSelecionado)
  );

  const totalEPIs = epis.length;
  const totalColaboradores = colaboradores.length;
  const pedidosPendentes = pedidosDoMes.filter((p) => p.status === "pendente").length;
  const pedidosSeparados = pedidosDoMes.filter((p) => p.status === "separado").length;
  const pedidosEnviados = pedidosDoMes.filter((p) => p.status === "enviado").length;
  const entregasRecebidas = entregasDoMes.filter((e) => e.status === "recebido").length;

  const totalItensEstoque = estoque.reduce((acc, item) => acc + item.quantidadeAtual, 0);
  const totalMovimentacoes = movimentacoesDoMes.length;
  const itensZerados = estoque.filter((item) => item.quantidadeAtual === 0).length;

  const dadosPorFazenda = fazendasMock.map((fazenda) => {
    const colaboradoresCount = colaboradores.filter((c) => c.fazendaId === fazenda.id).length;
    const pedidosCount = pedidosDoMes.filter((p) => p.fazendaId === fazenda.id).length;
    const entregasCount = entregasDoMes.filter((e) => e.fazendaId === fazenda.id).length;

    return {
      nome: fazenda.sigla,
      colaboradores: colaboradoresCount,
      pedidos: pedidosCount,
      entregas: entregasCount,
    };
  });

  const dadosStatusPedidos = [
    { name: "Pendentes", value: pedidosPendentes },
    { name: "Separados", value: pedidosSeparados },
    { name: "Enviados", value: pedidosEnviados },
  ];

  const mapaEPIs: Record<string, number> = {};

  pedidosDoMes.forEach((pedido) => {
    pedido.itens.forEach((item) => {
      const epi = epis.find((e) => e.id === item.epiId);
      const nome = epi?.nome || "EPI";
      mapaEPIs[nome] = (mapaEPIs[nome] || 0) + item.quantidade;
    });
  });

  const dadosEPIsMaisPedidos = Object.entries(mapaEPIs)
    .map(([nome, quantidade]) => ({
      nome,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 8);

  const resumoMovimentacoes = movimentacoesDoMes.reduce(
    (acc, mov) => {
      if (mov.tipo === "entrada") acc.entradas += mov.quantidade;
      if (mov.tipo === "saida_pedido" || mov.tipo === "saida_escritorio") acc.saidas += mov.quantidade;
      if (mov.tipo === "ajuste") acc.ajustes += 1;
      return acc;
    },
    { entradas: 0, saidas: 0, ajustes: 0 }
  );

  const dadosMovimentacoesEstoque = [
    { name: "Entradas", quantidade: resumoMovimentacoes.entradas },
    { name: "Saídas", quantidade: resumoMovimentacoes.saidas },
  ];

  const dadosMenorSaldo = estoque
    .map((item) => {
      const epi = epis.find((e) => e.id === item.epiId);
      return {
        nome: epi?.nome || "EPI",
        quantidade: item.quantidadeAtual,
      };
    })
    .sort((a, b) => a.quantidade - b.quantidade)
    .slice(0, 8);

  const cores = ["#eab308", "#8b5cf6", "#3b82f6", "#10b981", "#f97316", "#ef4444"];

  const handleImprimirPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 analytics-print-area">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-slate-400 mt-1">
            Relatório mensal dos dados do sistema e do estoque.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mês do relatório
            </label>
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {mesesDisponiveis.map((mes) => (
                <option key={mes} value={mes}>
                  {formatarMes(mes)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleImprimirPDF}
              className="px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
            >
              PDF / Imprimir
            </button>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-black">Relatório Analytics</h1>
        <p className="text-sm text-black mt-1">
          Competência: {formatarMes(mesSelecionado)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Total de EPIs</p>
          <p className="text-3xl font-bold text-white mt-2">{totalEPIs}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Total de Colaboradores</p>
          <p className="text-3xl font-bold text-white mt-2">{totalColaboradores}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Pedidos Pendentes no Mês</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{pedidosPendentes}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Pedidos Separados no Mês</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{pedidosSeparados}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Pedidos Enviados no Mês</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{pedidosEnviados}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Entregas Recebidas no Mês</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{entregasRecebidas}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Itens em Estoque</p>
          <p className="text-3xl font-bold text-white mt-2">{totalItensEstoque}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Movimentações no Mês</p>
          <p className="text-3xl font-bold text-white mt-2">{totalMovimentacoes}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Itens Zerados</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{itensZerados}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">
            Movimentação por Fazenda no Mês
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorFazenda}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="nome" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="colaboradores" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pedidos" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="entregas" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Status dos Pedidos no Mês</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosStatusPedidos}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {dadosStatusPedidos.map((_, index) => (
                    <Cell key={index} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Entradas x Saídas do Mês</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMovimentacoesEstoque}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="quantidade" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Menor Saldo em Estoque</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMenorSaldo} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="nome" type="category" stroke="#94a3b8" width={160} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="quantidade" fill="#ef4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">EPIs Mais Pedidos no Mês</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosEPIsMaisPedidos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="nome" type="category" stroke="#94a3b8" width={160} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="quantidade" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


type AppDialogVariant = "success" | "error" | "warning" | "info";
type AppDialogMode = "alert" | "confirm";

function AppDialog({
  isOpen,
  mode,
  title,
  message,
  variant,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  mode: AppDialogMode;
  title: string;
  message: string;
  variant: AppDialogVariant;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle className="w-6 h-6 text-emerald-400" />,
    error: <X className="w-6 h-6 text-red-400" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
    info: <ShieldCheck className="w-6 h-6 text-blue-400" />,
  };

  const ringMap = {
    success: "border-emerald-500/20 bg-emerald-500/10",
    error: "border-red-500/20 bg-red-500/10",
    warning: "border-yellow-500/20 bg-yellow-500/10",
    info: "border-blue-500/20 bg-blue-500/10",
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[90] p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${ringMap[variant]}`}>
              {iconMap[variant]}
            </div>

            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-slate-300 mt-2 whitespace-pre-line">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-800">
            {mode === "confirm" && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                variant === "success"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : variant === "error"
                  ? "bg-red-500 hover:bg-red-600"
                  : variant === "warning"
                  ? "bg-yellow-500 hover:bg-yellow-600 text-slate-950"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {mode === "confirm" ? "Confirmar" : "OK"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


type AuthSession = {
  usuario: UsuarioLogado;
  currentPage: string;
  expiresAt: number;
};

const AUTH_SESSION_KEY = "epi_auth_session";
const AUTH_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

function getStoredAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.usuario || !parsed?.expiresAt) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export default function App() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(() => {
    const sessao = getStoredAuthSession();
    return sessao?.usuario || null;
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const sessao = getStoredAuthSession();
    return sessao?.currentPage || "dashboard";
  });
  const [colaboradores, setColaboradores] = useLocalStorage<Colaborador[]>("epi_colaboradores", colaboradoresIniciais);
  const [epis, setEpis] = useLocalStorage<EPI[]>("epi_lista_epis", episIniciais);
  const [pedidos, setPedidos] = useLocalStorage<Pedido[]>("epi_pedidos", []);
  const [entregas, setEntregas] = useLocalStorage<Entrega[]>("epi_entregas", []);
  const [fichasEPI, setFichasEPI] = useLocalStorage<FichaEPI[]>("epi_fichas_epi", []);
  const [estoque, setEstoque] = useLocalStorage<EstoqueEPI[]>("epi_estoque", []);
  const [movimentacoesEstoque, setMovimentacoesEstoque] = useLocalStorage<MovimentacaoEstoque[]>("epi_movimentacoes_estoque", []);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [fichaSelecionada, setFichaSelecionada] = useState<FichaEPI | null>(null);
  const [mostrarAdicionarEPI, setMostrarAdicionarEPI] = useState(false);
  const [colaboradorAdicionarEPI, setColaboradorAdicionarEPI] = useState<Colaborador | null>(null);
  const [itensAdicionarEPI, setItensAdicionarEPI] = useState<PedidoItem[]>([]);
  const [mostrarEntradaEstoque, setMostrarEntradaEstoque] = useState(false);
  const [mostrarAjusteEstoque, setMostrarAjusteEstoque] = useState(false);
  const [epiEstoqueSelecionado, setEpiEstoqueSelecionado] = useState("");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState(1);
  const [observacaoEstoque, setObservacaoEstoque] = useState("");
  const [mostrarRestaurarSite, setMostrarRestaurarSite] = useState(false);
  const [codigoRestauracao, setCodigoRestauracao] = useState("");
  const [senhaRestauracao, setSenhaRestauracao] = useState("");
  const [appDialog, setAppDialog] = useState<{
    isOpen: boolean;
    mode: AppDialogMode;
    title: string;
    message: string;
    variant: AppDialogVariant;
  }>({
    isOpen: false,
    mode: "alert",
    title: "",
    message: "",
    variant: "info",
  });
  const [dialogConfirmAction, setDialogConfirmAction] = useState<(() => void) | null>(null);
  const [dialogCancelAction, setDialogCancelAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    document.body.style.overflow =
      mostrarAdicionarEPI ||
      mostrarFicha ||
      mostrarEntradaEstoque ||
      mostrarAjusteEstoque ||
      mostrarRestaurarSite ||
      appDialog.isOpen
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    mostrarAdicionarEPI,
    mostrarFicha,
    mostrarEntradaEstoque,
    mostrarAjusteEstoque,
    mostrarRestaurarSite,
    appDialog.isOpen,
  ]);

  useEffect(() => {
    setEstoque((estoqueAnterior) => {
      const mapaExistente = new Map(estoqueAnterior.map((item) => [item.epiId, item]));
      const atualizado = epis.map((epi) => {
        const atual = mapaExistente.get(epi.id);
        return (
          atual || {
            epiId: epi.id,
            quantidadeAtual: 0,
            estoqueMinimo: 0,
            updatedAt: new Date().toISOString(),
          }
        );
      });
      return atualizado;
    });
  }, [epis, setEstoque]);

  useEffect(() => {
    if (!usuario) return;

    const sessao: AuthSession = {
      usuario,
      currentPage,
      expiresAt: Date.now() + AUTH_SESSION_DURATION_MS,
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessao));
  }, [usuario, currentPage]);

  useEffect(() => {
    if (!usuario) return;

    const interval = window.setInterval(() => {
      const sessao = getStoredAuthSession();
      if (!sessao) {
        handleLogout();
      }
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, [usuario]);

  const closeAppDialog = () => {
    setAppDialog((prev) => ({ ...prev, isOpen: false }));
    setDialogConfirmAction(null);
    setDialogCancelAction(null);
  };

  const showAppAlert = (
    message: string,
    title = "Aviso",
    variant: AppDialogVariant = "info"
  ) => {
    setDialogConfirmAction(() => closeAppDialog);
    setDialogCancelAction(null);
    setAppDialog({
      isOpen: true,
      mode: "alert",
      title,
      message,
      variant,
    });
  };

  const showAppConfirm = (
    message: string,
    title = "Confirmar ação",
    variant: AppDialogVariant = "warning"
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialogConfirmAction(() => () => {
        closeAppDialog();
        resolve(true);
      });
      setDialogCancelAction(() => () => {
        closeAppDialog();
        resolve(false);
      });
      setAppDialog({
        isOpen: true,
        mode: "confirm",
        title,
        message,
        variant,
      });
    });
  };

  const saveAuthSession = (
    usuarioValue: UsuarioLogado,
    pageValue: string = "dashboard"
  ) => {
    const sessao: AuthSession = {
      usuario: usuarioValue,
      currentPage: pageValue,
      expiresAt: Date.now() + AUTH_SESSION_DURATION_MS,
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessao));
  };

  const handleLogin = (usuarioLogado: UsuarioLogado) => {
    setUsuario(usuarioLogado);
    setCurrentPage("dashboard");
    saveAuthSession(usuarioLogado, "dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setUsuario(null);
    setCurrentPage("dashboard");
  };

  const registrarMovimentacaoEstoque = (
    epiId: string,
    tipo: MovimentacaoEstoque["tipo"],
    quantidade: number,
    observacao?: string
  ) => {
    const epi = epis.find((e) => e.id === epiId);

    setMovimentacoesEstoque((anteriores) => [
      {
        id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        epiId,
        epiNome: epi?.nome || "EPI",
        tipo,
        quantidade,
        data: new Date().toISOString(),
        observacao,
        usuario: usuario?.usuario || "",
      },
      ...anteriores,
    ]);
  };

  const baixarEstoque = (
    itens: PedidoItem[],
    tipo: "saida_pedido" | "saida_escritorio",
    observacao?: string
  ) => {
    setEstoque((estoqueAnterior) => {
      const mapa = new Map(estoqueAnterior.map((item) => [item.epiId, item]));

      for (const item of itens) {
        const atual = mapa.get(item.epiId) || {
          epiId: item.epiId,
          quantidadeAtual: 0,
          estoqueMinimo: 0,
          updatedAt: new Date().toISOString(),
        };

        const novaQuantidade = Math.max(0, atual.quantidadeAtual - item.quantidade);

        mapa.set(item.epiId, {
          ...atual,
          quantidadeAtual: novaQuantidade,
          updatedAt: new Date().toISOString(),
        });

        registrarMovimentacaoEstoque(item.epiId, tipo, item.quantidade, observacao);
      }

      return Array.from(mapa.values());
    });
  };

  const handleSaveColaborador = (col: Colaborador) => {
    const existe = colaboradores.some((c) => c.id === col.id);

    if (existe) {
      setColaboradores(colaboradores.map((c) => (c.id === col.id ? col : c)));
    } else {
      setColaboradores([...colaboradores, col]);
    }
  };

  function handleAbrirFichaAtiva(colaborador: Colaborador) {
    let fichaAtiva = fichasEPI.find(
      (f) => f.colaboradorId === colaborador.id && f.status === "ativa"
    );

    if (!fichaAtiva) {
      const fichasDoColaborador = fichasEPI.filter(
        (f) => f.colaboradorId === colaborador.id
      );

      const proximoNumero =
        fichasDoColaborador.length > 0
          ? Math.max(...fichasDoColaborador.map((f) => f.numeroFicha)) + 1
          : 1;

      fichaAtiva = {
        id: `ficha-${Date.now()}`,
        colaboradorId: colaborador.id,
        colaboradorNome: colaborador.nome,
        colaboradorMatricula: colaborador.matricula,
        colaboradorCpf: colaborador.cpf,
        colaboradorCargo: colaborador.cargo,
        fazendaId: colaborador.fazendaId,
        numeroFicha: proximoNumero,
        status: "ativa",
        maxLinhas: MAX_LINHAS_FICHA_EPI || 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        linhas: [],
      };

      setFichasEPI((prev) => [...prev, fichaAtiva as FichaEPI]);
    }

    setColaboradorSelecionado(colaborador);
    setFichaSelecionada(fichaAtiva as FichaEPI);
    setMostrarFicha(true);
  }

  function handleAbrirFichaEspecifica(ficha: FichaEPI, colaborador: Colaborador) {
    setColaboradorSelecionado(colaborador);
    setFichaSelecionada(ficha);
    setMostrarFicha(true);
  }

  function handleFecharFicha() {
    setMostrarFicha(false);
    setColaboradorSelecionado(null);
    setFichaSelecionada(null);
  }

  function handleAbrirAdicionarEPI(colaborador: Colaborador) {
    setColaboradorAdicionarEPI(colaborador);
    setMostrarAdicionarEPI(true);
    setItensAdicionarEPI([]);
  }

  function handleFecharAdicionarEPI() {
    setColaboradorAdicionarEPI(null);
    setMostrarAdicionarEPI(false);
    setItensAdicionarEPI([]);
  }

  function handleConfirmarAdicionarEPI() {
    if (!colaboradorAdicionarEPI) return;

    if (itensAdicionarEPI.length === 0) {
      showAppAlert("Selecione pelo menos um EPI.", "Atenção", "warning");
      return;
    }

    for (const item of itensAdicionarEPI) {
      const epiSelecionado = epis.find((e) => e.id === item.epiId);

      if (!epiSelecionado) {
        showAppAlert("Existe um EPI inválido na seleção.", "Atenção", "error");
        return;
      }

      if (item.quantidade <= 0) {
        showAppAlert("Informe uma quantidade válida para todos os EPIs.", "Atenção", "warning");
        return;
      }

      if (epiSelecionado.tipoTamanho !== "nenhum" && !item.tamanho) {
        showAppAlert(`Selecione o tamanho para ${epiSelecionado.nome}.`, "Atenção", "warning");
        return;
      }
    }

    setFichasEPI((fichasAnteriores) => {
      let fichasAtualizadas = [...fichasAnteriores];

      let fichaAtiva = getFichaAtivaDoColaborador(
        fichasAtualizadas,
        colaboradorAdicionarEPI.id
      );

      if (!fichaAtiva) {
        const fichasDoColaborador = getFichasDoColaborador(
          fichasAtualizadas,
          colaboradorAdicionarEPI.id
        );

        fichaAtiva = criarNovaFichaEPI({
          colaboradorId: colaboradorAdicionarEPI.id,
          colaboradorNome: colaboradorAdicionarEPI.nome,
          colaboradorMatricula: colaboradorAdicionarEPI.matricula,
          colaboradorCpf: colaboradorAdicionarEPI.cpf,
          colaboradorCargo: colaboradorAdicionarEPI.cargo,
          fazendaId: colaboradorAdicionarEPI.fazendaId,
          numeroFicha: fichasDoColaborador.length + 1,
        });

        fichasAtualizadas.push(fichaAtiva);
      }

      for (const item of itensAdicionarEPI) {
        let fichaAtual = fichasAtualizadas.find((f) => f.id === fichaAtiva!.id);
        if (!fichaAtual) return fichasAtualizadas;

        const linhasDisponiveis = fichaAtual.maxLinhas - fichaAtual.linhas.length;

        if (linhasDisponiveis <= 0) {
          const fichaArquivada = arquivarFicha(fichaAtual, "lotacao");

          fichasAtualizadas = fichasAtualizadas.map((f) =>
            f.id === fichaArquivada.id ? fichaArquivada : f
          );

          const fichasDoColaborador = getFichasDoColaborador(
            fichasAtualizadas,
            colaboradorAdicionarEPI.id
          );

          const novaFicha = criarNovaFichaEPI({
            colaboradorId: colaboradorAdicionarEPI.id,
            colaboradorNome: colaboradorAdicionarEPI.nome,
            colaboradorMatricula: colaboradorAdicionarEPI.matricula,
            colaboradorCpf: colaboradorAdicionarEPI.cpf,
            colaboradorCargo: colaboradorAdicionarEPI.cargo,
            fazendaId: colaboradorAdicionarEPI.fazendaId,
            numeroFicha: fichasDoColaborador.length + 1,
          });

          fichasAtualizadas.push(novaFicha);
          fichaAtual = novaFicha;
          fichaAtiva = novaFicha;
        }

        const epiSelecionado = epis.find((e) => e.id === item.epiId);

        const novaLinha: FichaEPILinha = {
          id: generateId("linha_ficha"),
          dataEntrega: formatDate(new Date().toISOString()),
          entregaId: "",
          pedidoId: "",
          epiId: item.epiId,
          epiNome: epiSelecionado?.nome || "EPI",
          quantidade: item.quantidade,
          tamanho: item.tamanho || "",
          ca: epiSelecionado?.ca || "",
          assinatura: "",
          motivoTroca: "AQ",
          devolucaoData: "",
        };

        const fichaAtualizada = adicionarLinhasNaFicha(fichaAtual, [novaLinha]);

        fichasAtualizadas = fichasAtualizadas.map((f) =>
          f.id === fichaAtualizada.id ? fichaAtualizada : f
        );

        fichaAtiva = fichaAtualizada;
      }

      return fichasAtualizadas;
    });

    baixarEstoque(
      itensAdicionarEPI,
      "saida_escritorio",
      `Saída direta para ${colaboradorAdicionarEPI.nome}`
    );

    showAppAlert("EPIs adicionados na ficha com sucesso.", "Sucesso", "success");
    handleFecharAdicionarEPI();
  }

  const handleDeleteColaborador = async (id: string) => {
    const colaboradorTemMovimento =
      pedidos.some((p) => p.colaboradorId === id) ||
      entregas.some((e) => e.colaboradorId === id);

    if (colaboradorTemMovimento) {
      showAppAlert("Não é possível excluir este colaborador porque ele já possui pedidos ou entregas registradas.", "Atenção", "error");
      return;
    }

    const confirmar = await showAppConfirm("Deseja realmente excluir este colaborador?", "Excluir colaborador", "warning");
    if (!confirmar) return;

    setColaboradores(colaboradores.filter((c) => c.id !== id));
  };

  const handleSaveEPI = (epi: EPI) => {
    const existe = epis.some((e) => e.id === epi.id);

    if (existe) {
      setEpis(epis.map((e) => (e.id === epi.id ? epi : e)));
    } else {
      setEpis([...epis, epi]);
    }
  };

  const handleAdicionarEntradaEstoque = (
    epiId: string,
    quantidade: number,
    observacao?: string
  ) => {
    if (quantidade <= 0) return;

    setEstoque((estoqueAnterior) => {
      const mapa = new Map(estoqueAnterior.map((item) => [item.epiId, item]));
      const atual = mapa.get(epiId) || {
        epiId,
        quantidadeAtual: 0,
        estoqueMinimo: 0,
        updatedAt: new Date().toISOString(),
      };

      mapa.set(epiId, {
        ...atual,
        quantidadeAtual: atual.quantidadeAtual + quantidade,
        updatedAt: new Date().toISOString(),
      });

      return Array.from(mapa.values());
    });

    registrarMovimentacaoEstoque(epiId, "entrada", quantidade, observacao);
  };

  const handleAjustarEstoque = (
    epiId: string,
    quantidade: number,
    observacao?: string
  ) => {
    setEstoque((estoqueAnterior) => {
      const mapa = new Map(estoqueAnterior.map((item) => [item.epiId, item]));
      const atual = mapa.get(epiId) || {
        epiId,
        quantidadeAtual: 0,
        estoqueMinimo: 0,
        updatedAt: new Date().toISOString(),
      };

      mapa.set(epiId, {
        ...atual,
        quantidadeAtual: quantidade,
        updatedAt: new Date().toISOString(),
      });

      return Array.from(mapa.values());
    });

    registrarMovimentacaoEstoque(epiId, "ajuste", quantidade, observacao);
  };

  const handleAbrirEntradaEstoque = (epiId?: string) => {
    setEpiEstoqueSelecionado(epiId || "");
    setQuantidadeEstoque(1);
    setObservacaoEstoque("");
    setMostrarEntradaEstoque(true);
  };

  const handleFecharEntradaEstoque = () => {
    setMostrarEntradaEstoque(false);
    setEpiEstoqueSelecionado("");
    setQuantidadeEstoque(1);
    setObservacaoEstoque("");
  };

  const handleConfirmarEntradaEstoque = () => {
    if (!epiEstoqueSelecionado) {
      showAppAlert("Selecione um EPI.", "Atenção", "warning");
      return;
    }

    if (quantidadeEstoque <= 0) {
      showAppAlert("Informe uma quantidade válida.", "Atenção", "warning");
      return;
    }

    handleAdicionarEntradaEstoque(
      epiEstoqueSelecionado,
      quantidadeEstoque,
      observacaoEstoque || "Entrada manual de estoque"
    );

    showAppAlert("Entrada registrada com sucesso.", "Sucesso", "success");
    handleFecharEntradaEstoque();
  };

  const handleAbrirAjusteEstoque = (epiId?: string, quantidadeAtual?: number) => {
    setEpiEstoqueSelecionado(epiId || "");
    setQuantidadeEstoque(typeof quantidadeAtual === "number" ? quantidadeAtual : 0);
    setObservacaoEstoque("");
    setMostrarAjusteEstoque(true);
  };

  const handleFecharAjusteEstoque = () => {
    setMostrarAjusteEstoque(false);
    setEpiEstoqueSelecionado("");
    setQuantidadeEstoque(1);
    setObservacaoEstoque("");
  };

  const handleConfirmarAjusteEstoque = () => {
    if (!epiEstoqueSelecionado) {
      showAppAlert("Selecione um EPI.", "Atenção", "warning");
      return;
    }

    if (quantidadeEstoque < 0) {
      showAppAlert("A quantidade não pode ser negativa.", "Atenção", "warning");
      return;
    }

    handleAjustarEstoque(
      epiEstoqueSelecionado,
      quantidadeEstoque,
      observacaoEstoque || "Ajuste manual de estoque"
    );

    showAppAlert("Estoque ajustado com sucesso.", "Sucesso", "success");
    handleFecharAjusteEstoque();
  };

  const handleAbrirRestaurarSite = () => {
    setCodigoRestauracao("");
    setSenhaRestauracao("");
    setMostrarRestaurarSite(true);
  };

  const handleFecharRestaurarSite = () => {
    setMostrarRestaurarSite(false);
    setCodigoRestauracao("");
    setSenhaRestauracao("");
  };

  const handleConfirmarRestauracaoSite = async () => {
    const CODIGO_RESTAURACAO = "RESTAURAR-2026";
    const SENHA_RESTAURACAO = "epi@reset2026";

    if (codigoRestauracao !== CODIGO_RESTAURACAO || senhaRestauracao !== SENHA_RESTAURACAO) {
      showAppAlert("Código ou senha inválidos.", "Credenciais inválidas", "error");
      return;
    }

    const confirmar = await showAppConfirm(
      "Tem certeza que deseja restaurar o site? Os históricos de pedidos, entregas, fichas e analytics serão apagados, mas colaboradores, EPIs e estoque serão mantidos.",
      "Restaurar site",
      "warning"
    );

    if (!confirmar) return;

    setPedidos([]);
    setEntregas([]);
    setFichasEPI([]);
    setMovimentacoesEstoque([]);
    setCurrentPage("dashboard");

    showAppAlert("Site restaurado com sucesso. Os históricos foram apagados e o estoque foi mantido.", "Sucesso", "success");
    handleFecharRestaurarSite();
  };

  const handleDeleteEPI = async (id: string) => {
    const epiEmUso =
      pedidos.some((p) => p.itens.some((item) => item.epiId === id)) ||
      entregas.some((e) => e.itens.some((item) => item.epiId === id));

    if (epiEmUso) {
      showAppAlert("Não é possível excluir este EPI porque ele já foi utilizado em pedidos ou entregas.", "Atenção", "error");
      return;
    }

    const confirmar = await showAppConfirm("Deseja realmente excluir este EPI?", "Excluir EPI", "warning");
    if (!confirmar) return;

    setEpis(epis.filter((e) => e.id !== id));
  };

  const handleSavePedido = (pedido: Pedido) => {
    setPedidos([pedido, ...pedidos]);
  };

  const garantirFichaAtiva = (colaborador: Colaborador) => {
    const fichaAtiva = getFichaAtivaDoColaborador(fichasEPI, colaborador.id);
    if (fichaAtiva) return fichaAtiva;

    const fichasDoColaborador = getFichasDoColaborador(fichasEPI, colaborador.id);

    const novaFicha = criarNovaFichaEPI({
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      colaboradorMatricula: colaborador.matricula,
      colaboradorCpf: colaborador.cpf,
      colaboradorCargo: colaborador.cargo,
      fazendaId: colaborador.fazendaId,
      numeroFicha: fichasDoColaborador.length + 1,
    });

    setFichasEPI([...fichasEPI, novaFicha]);
    return novaFicha;
  };

  const handleArquivarFichaManual = async (colaboradorId: string) => {
    const colaborador = colaboradores.find((c) => c.id === colaboradorId);
    const fichaAtiva = fichasEPI.find(
      (f) => f.colaboradorId === colaboradorId && f.status === "ativa"
    );

    if (!fichaAtiva) {
      showAppAlert("Este colaborador não possui ficha ativa para arquivar.", "Atenção", "warning");
      return;
    }

    const confirmar = await showAppConfirm(
      `Deseja arquivar a ficha ${fichaAtiva.numeroFicha} de ${colaborador?.nome || "este colaborador"}?`,
      "Arquivar ficha",
      "warning"
    );

    if (!confirmar) return;

    setFichasEPI((prev) =>
      prev.map((f) =>
        f.id === fichaAtiva.id
          ? {
              ...f,
              status: "arquivada",
              updatedAt: new Date().toISOString(),
            }
          : f
      )
    );

    if (colaboradorSelecionado?.id === colaboradorId && mostrarFicha) {
      handleFecharFicha();
    }

    showAppAlert("Ficha arquivada com sucesso.", "Sucesso", "success");
  };

  const registrarEntregaNasFichas = (entrega: Entrega) => {
    const colaborador = colaboradores.find((c) => c.id === entrega.colaboradorId);
    if (!colaborador) return;

    setFichasEPI((fichasAnteriores) => {
      let fichasAtualizadas = [...fichasAnteriores];

      let fichaAtiva = getFichaAtivaDoColaborador(fichasAtualizadas, colaborador.id);

      if (!fichaAtiva) {
        const fichasDoColaborador = getFichasDoColaborador(fichasAtualizadas, colaborador.id);

        fichaAtiva = criarNovaFichaEPI({
          colaboradorId: colaborador.id,
          colaboradorNome: colaborador.nome,
          colaboradorMatricula: colaborador.matricula,
          colaboradorCpf: colaborador.cpf,
          colaboradorCargo: colaborador.cargo,
          fazendaId: colaborador.fazendaId,
          numeroFicha: fichasDoColaborador.length + 1,
        });

        fichasAtualizadas.push(fichaAtiva);
      }

      for (const item of entrega.itens) {
        let fichaAtual = fichasAtualizadas.find((f) => f.id === fichaAtiva!.id);
        if (!fichaAtual) return fichasAtualizadas;

        const linhasDisponiveis = fichaAtual.maxLinhas - fichaAtual.linhas.length;

        if (linhasDisponiveis <= 0) {
          const fichaArquivada = arquivarFicha(fichaAtual, "lotacao");

          fichasAtualizadas = fichasAtualizadas.map((f) =>
            f.id === fichaArquivada.id ? fichaArquivada : f
          );

          const fichasDoColaborador = getFichasDoColaborador(
            fichasAtualizadas,
            colaborador.id
          );

          const novaFicha = criarNovaFichaEPI({
            colaboradorId: colaborador.id,
            colaboradorNome: colaborador.nome,
            colaboradorMatricula: colaborador.matricula,
            colaboradorCpf: colaborador.cpf,
            colaboradorCargo: colaborador.cargo,
            fazendaId: colaborador.fazendaId,
            numeroFicha: fichasDoColaborador.length + 1,
          });

          fichasAtualizadas.push(novaFicha);
          fichaAtual = novaFicha;
          fichaAtiva = novaFicha;
        }

        const epi = epis.find((e) => e.id === item.epiId);

        const novaLinha: FichaEPILinha = {
          id: generateId("linha_ficha"),
          dataEntrega: formatDate(entrega.dataEntrega),
          entregaId: entrega.id,
          pedidoId: entrega.pedidoId,
          epiId: item.epiId,
          epiNome: epi?.nome || "EPI",
          quantidade: item.quantidade,
          tamanho: item.tamanho,
          ca: epi?.ca || "",
          assinatura: "",
          motivoTroca: "AQ",
          devolucaoData: "",
        };

        const fichaAtualizada = adicionarLinhasNaFicha(fichaAtual, [novaLinha]);

        fichasAtualizadas = fichasAtualizadas.map((f) =>
          f.id === fichaAtualizada.id ? fichaAtualizada : f
        );

        fichaAtiva = fichaAtualizada;
      }

      return fichasAtualizadas;
    });
  };

  const handleMarcarPedidoSeparado = (id: string) => {
    const pedido = pedidos.find((p) => p.id === id);
    if (!pedido) return;

    setPedidos(
      pedidos.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "separado",
              dataSeparacao: new Date().toISOString(),
            }
          : p
      )
    );

    const entregaExistente = entregas.find((e) => e.pedidoId === pedido.id);

    if (entregaExistente) {
      setEntregas(
        entregas.map((e) =>
          e.pedidoId === pedido.id
            ? {
                ...e,
                status: "separado",
              }
            : e
        )
      );
    } else {
      const novaEntrega: Entrega = {
        id: `entrega-${Date.now()}`,
        pedidoId: pedido.id,
        fazendaId: pedido.fazendaId,
        colaboradorId: pedido.colaboradorId,
        colaboradorNome: pedido.colaboradorNome,
        colaboradorMatricula: pedido.colaboradorMatricula,
        dataEntrega: new Date().toISOString(),
        itens: pedido.itens,
        status: "separado",
      };

      setEntregas([novaEntrega, ...entregas]);
    }
  };

  const handleMarcarPedidoEnviado = (id: string) => {
    const pedido = pedidos.find((p) => p.id === id);
    if (!pedido) return;

    setPedidos(
      pedidos.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "enviado",
              dataEnvio: new Date().toISOString(),
            }
          : p
      )
    );

    const entregaExistente = entregas.find((e) => e.pedidoId === pedido.id);

    if (entregaExistente) {
      setEntregas(
        entregas.map((e) =>
          e.pedidoId === pedido.id
            ? {
                ...e,
                status: "enviado",
                dataEntrega: new Date().toISOString(),
              }
            : e
        )
      );
    } else {
      const novaEntrega: Entrega = {
        id: `entrega-${Date.now()}`,
        pedidoId: pedido.id,
        fazendaId: pedido.fazendaId,
        colaboradorId: pedido.colaboradorId,
        colaboradorNome: pedido.colaboradorNome,
        colaboradorMatricula: pedido.colaboradorMatricula,
        dataEntrega: new Date().toISOString(),
        itens: pedido.itens,
        status: "enviado",
      };

      setEntregas([novaEntrega, ...entregas]);
    }
  };

  const handleMarcarEntregaRecebida = (id: string) => {
    const entrega = entregas.find((e) => e.id === id);
    if (!entrega) return;

    if (entrega.status === "recebido") return;

    setEntregas(
      entregas.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "recebido",
            }
          : e
      )
    );

    baixarEstoque(
      entrega.itens,
      "saida_pedido",
      `Entrega recebida por ${entrega.colaboradorNome}`
    );

    registrarEntregaNasFichas({
      ...entrega,
      status: "recebido",
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            usuario={usuario!}
            onNavigate={setCurrentPage}
            epis={epis}
            colaboradores={colaboradores}
            pedidos={pedidos}
            entregas={entregas}
            estoque={estoque}
            movimentacoesEstoque={movimentacoesEstoque}
          />
        );

      case "epis":
        return (
          <EPIList
            epis={epis}
            usuario={usuario!}
            onSave={handleSaveEPI}
            onDelete={handleDeleteEPI}
          />
        );

      case "colaboradores":
        return (
          <ColaboradorList
            usuario={usuario!}
            colaboradores={colaboradores}
            fichasEPI={fichasEPI}
            onArquivarFicha={handleArquivarFichaManual}
            onAbrirFicha={handleAbrirFichaAtiva}
            onAdicionarEPI={handleAbrirAdicionarEPI}
            onSave={handleSaveColaborador}
            onDelete={handleDeleteColaborador}
            getFichaAtivaDoColaborador={getFichaAtivaDoColaborador}
          />
        );

      case "fichas-arquivadas":
        return (
          <FichasArquivadasPage
            usuario={usuario!}
            colaboradores={colaboradores}
            fichasEPI={fichasEPI}
            fazendas={fazendasMock}
            onAbrirFicha={handleAbrirFichaEspecifica}
          />
        );

      case "entregas":
        return (
          <EntregasList
            usuario={usuario!}
            entregas={entregas}
            epis={epis}
            onMarcarRecebido={handleMarcarEntregaRecebida}
          />
        );

      case "pedidos":
        return usuario?.tipo === "admin" ? (
          <PedidosList
            pedidos={pedidos}
            entregas={entregas}
            epis={epis}
            onMarcarSeparado={handleMarcarPedidoSeparado}
            onMarcarEnviado={handleMarcarPedidoEnviado}
          />
        ) : (
          <FarmPedidosPage
            usuario={usuario!}
            colaboradores={colaboradores}
            epis={epis}
            pedidos={pedidos}
            onSavePedido={handleSavePedido}
            onShowAlert={showAppAlert}
          />
        );

      case "estoque":
        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Estoque</h2>
                <p className="text-slate-400 mt-1">
                  Controle de quantidade atual, entradas, ajustes e histórico de movimentações.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleAbrirEntradaEstoque()}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Entrada
                </button>

                <button
                  onClick={() => handleAbrirAjusteEstoque()}
                  className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Ajustar Estoque
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h3 className="text-white font-semibold">Quantidade atual por EPI</h3>
                </div>
                <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                  {estoque.map((item) => {
                    const epi = epis.find((e) => e.id === item.epiId);
                    return (
                      <div
                        key={item.epiId}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-white font-medium">{epi?.nome || "EPI"}</div>
                          <div className="text-xs text-slate-500 mt-1">CA: {epi?.ca || "---"}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xl font-bold text-emerald-400">{item.quantidadeAtual}</div>
                            <div className="text-xs text-slate-500">unidades</div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAbrirEntradaEstoque(item.epiId)}
                              className="px-3 py-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/20"
                            >
                              Entrada
                            </button>
                            <button
                              onClick={() => handleAbrirAjusteEstoque(item.epiId, item.quantidadeAtual)}
                              className="px-3 py-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20"
                            >
                              Ajustar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h3 className="text-white font-semibold">Últimas movimentações</h3>
                </div>
                <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                  {movimentacoesEstoque.length === 0 && (
                    <div className="text-slate-400 text-sm text-center py-8">
                      Nenhuma movimentação registrada.
                    </div>
                  )}

                  {movimentacoesEstoque.slice(0, 50).map((mov) => (
                    <div
                      key={mov.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-white font-medium">{mov.epiNome}</div>
                          <div className="text-sm text-slate-400">{mov.tipo}</div>
                          <div className="text-xs text-slate-500 mt-1">{formatDate(mov.data)}</div>
                          {mov.observacao && (
                            <div className="text-xs text-slate-500 mt-1">{mov.observacao}</div>
                          )}
                        </div>
                        <div className="text-right text-emerald-400 font-semibold">
                          {mov.quantidade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "analytics":
        return (
          <Analytics
            epis={epis}
            colaboradores={colaboradores}
            pedidos={pedidos}
            entregas={entregas}
            estoque={estoque}
            movimentacoesEstoque={movimentacoesEstoque}
          />
        );

      default:
        return (
          <Dashboard
            usuario={usuario!}
            onNavigate={setCurrentPage}
            epis={epis}
            colaboradores={colaboradores}
            pedidos={pedidos}
            entregas={entregas}
            estoque={estoque}
            movimentacoesEstoque={movimentacoesEstoque}
          />
        );
    }
  };

  if (!usuario) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 app-shell">
      <Header
        usuario={usuario}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenRestoreSite={handleAbrirRestaurarSite}
      />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>

      {mostrarFicha && colaboradorSelecionado && fichaSelecionada && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto ficha-print-overlay">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative ficha-print-container">
            <div className="absolute top-3 right-3 z-50 flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 text-white px-3 py-1 rounded"
              >
                Imprimir
              </button>

              <button
                onClick={handleFecharFicha}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Fechar
              </button>
            </div>

            <FichaEPIModelo
              nome={colaboradorSelecionado.nome}
              funcao={colaboradorSelecionado.cargo}
              fazendaSistema={colaboradorSelecionado.fazendaId}
              cpf={colaboradorSelecionado.cpf || ""}
              linhas={fichaSelecionada.linhas || []}
            />
          </div>
        </div>
      )}

      {mostrarAdicionarEPI && colaboradorAdicionarEPI && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Adicionar EPI</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {colaboradorAdicionarEPI.nome}
                </p>
              </div>
              <button
                onClick={handleFecharAdicionarEPI}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Selecione os EPIs
                </label>
                <EPISelectorList
                  epis={epis}
                  selectedItems={itensAdicionarEPI}
                  onChange={setItensAdicionarEPI}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={handleFecharAdicionarEPI}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarAdicionarEPI}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Adicionar na Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    

      {mostrarEntradaEstoque && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Adicionar Entrada</h3>
              <button
                onClick={handleFecharEntradaEstoque}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  EPI
                </label>
                <select
                  value={epiEstoqueSelecionado}
                  onChange={(e) => setEpiEstoqueSelecionado(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Selecione um EPI</option>
                  {epis.map((epi) => (
                    <option key={epi.id} value={epi.id}>
                      {epi.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantidadeEstoque}
                  onChange={(e) => setQuantidadeEstoque(Number(e.target.value))}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Observação
                </label>
                <textarea
                  value={observacaoEstoque}
                  onChange={(e) => setObservacaoEstoque(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={handleFecharEntradaEstoque}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEntradaEstoque}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Salvar Entrada
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarAjusteEstoque && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Ajustar Estoque</h3>
              <button
                onClick={handleFecharAjusteEstoque}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  EPI
                </label>
                <select
                  value={epiEstoqueSelecionado}
                  onChange={(e) => setEpiEstoqueSelecionado(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um EPI</option>
                  {epis.map((epi) => (
                    <option key={epi.id} value={epi.id}>
                      {epi.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nova Quantidade
                </label>
                <input
                  type="number"
                  min={0}
                  value={quantidadeEstoque}
                  onChange={(e) => setQuantidadeEstoque(Number(e.target.value))}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Observação
                </label>
                <textarea
                  value={observacaoEstoque}
                  onChange={(e) => setObservacaoEstoque(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={handleFecharAjusteEstoque}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarAjusteEstoque}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Salvar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarRestaurarSite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Restaurar site</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Essa ação apaga históricos, mas mantém colaboradores, EPIs e estoque.
                </p>
              </div>
              <button
                onClick={handleFecharRestaurarSite}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 mb-5">
              <p className="text-sm text-yellow-300 font-medium">O que será apagado</p>
              <div className="text-sm text-yellow-200/90 mt-2 space-y-1">
                <div>• Pedidos</div>
                <div>• Entregas</div>
                <div>• Fichas ativas e arquivadas</div>
                <div>• Histórico do analytics</div>
                <div>• Movimentações do estoque</div>
              </div>
              <p className="text-sm text-emerald-300 font-medium mt-4">O que será mantido</p>
              <div className="text-sm text-emerald-200/90 mt-2 space-y-1">
                <div>• Colaboradores</div>
                <div>• EPIs cadastrados</div>
                <div>• Estoque atual</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Código de restauração
                </label>
                <input
                  type="text"
                  value={codigoRestauracao}
                  onChange={(e) => setCodigoRestauracao(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite o código"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={senhaRestauracao}
                  onChange={(e) => setSenhaRestauracao(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite a senha"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={handleFecharRestaurarSite}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarRestauracaoSite}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Restaurar site
              </button>
            </div>
          </div>
        </div>
      )}
      <AppDialog
        isOpen={appDialog.isOpen}
        mode={appDialog.mode}
        title={appDialog.title}
        message={appDialog.message}
        variant={appDialog.variant}
        onClose={() => {
          if (appDialog.mode === "confirm" && dialogCancelAction) {
            dialogCancelAction();
            return;
          }
          closeAppDialog();
        }}
        onConfirm={() => {
          if (dialogConfirmAction) {
            dialogConfirmAction();
            return;
          }
          closeAppDialog();
        }}
      />
    </div>
  );
}
