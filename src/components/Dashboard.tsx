import {
  Package,
  Users,
  Truck,
  BarChart3,
  ShoppingCart,
  ClipboardList,
  Send,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { formatDate, getStatusBadge } from "../utils/helpers";
import type {
  UsuarioLogado,
  EPI,
  Colaborador,
  Pedido,
  Entrega,
  EstoqueEPI,
  MovimentacaoEstoque,
} from "../types";

function Dashboard({
  usuario,
  onNavigate,
  epis,
  colaboradores,
  pedidos,
  entregas,
  estoque,
  movimentacoesEstoque,
}: {
  usuario: UsuarioLogado;
  onNavigate: (page: string) => void;
  epis: EPI[];
  colaboradores: Colaborador[];
  pedidos: Pedido[];
  entregas: Entrega[];
  estoque: EstoqueEPI[];
  movimentacoesEstoque: MovimentacaoEstoque[];
}) {
  const isAdmin = usuario.tipo === "admin";

  const visibleColaboradores = isAdmin
    ? colaboradores
    : colaboradores.filter((c) => c.fazendaId === usuario.fazenda?.id);

  const visiblePedidos = isAdmin
    ? pedidos
    : pedidos.filter((p) => p.fazendaId === usuario.fazenda?.id);

  const visibleEntregas = isAdmin
    ? entregas
    : entregas.filter((e) => e.fazendaId === usuario.fazenda?.id);

  const totalItensEstoque = estoque.reduce((acc, item) => acc + item.quantidadeAtual, 0);
  const itensZerados = estoque.filter((item) => item.quantidadeAtual === 0).length;
  const estoqueBaixo = estoque.filter(
    (item) => item.quantidadeAtual > 0 && item.quantidadeAtual <= (item.estoqueMinimo || 0)
  ).length;

  const stats = [
    {
      titulo: "EPIs Cadastrados",
      valor: epis.length,
      texto: "Itens disponíveis no sistema",
      icon: Package,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      page: "epis",
    },
    {
      titulo: "Colaboradores",
      valor: visibleColaboradores.length,
      texto: isAdmin ? "Todos os colaboradores" : "Da sua fazenda",
      icon: Users,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      page: "colaboradores",
    },
    {
      titulo: isAdmin ? "Pedidos" : "Meus Pedidos",
      valor: visiblePedidos.length,
      texto: "Total registrado",
      icon: ClipboardList,
      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      page: "pedidos",
    },
    {
      titulo: "Entregas",
      valor: visibleEntregas.length,
      texto: "Movimentações registradas",
      icon: Truck,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      page: "entregas",
    },
    ...(isAdmin
      ? [
          {
            titulo: "Itens em Estoque",
            valor: totalItensEstoque,
            texto: "Quantidade total disponível",
            icon: Package,
            color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
            page: "estoque",
          },
          {
            titulo: "Itens Zerados",
            valor: itensZerados,
            texto: "EPIs sem saldo",
            icon: AlertTriangle,
            color: "bg-red-500/10 text-red-400 border-red-500/20",
            page: "estoque",
          },
        ]
      : []),
  ];

  const pedidosRecentes = [...visiblePedidos]
    .sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime())
    .slice(0, 5);

  const entregasRecentes = [...visibleEntregas]
    .sort((a, b) => new Date(b.dataEntrega).getTime() - new Date(a.dataEntrega).getTime())
    .slice(0, 5);

  const movimentacoesRecentes = [...movimentacoesEstoque]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  const itensComMenorSaldo = estoque
    .map((item) => {
      const epi = epis.find((e) => e.id === item.epiId);
      return {
        epiId: item.epiId,
        nome: epi?.nome || "EPI",
        quantidadeAtual: item.quantidadeAtual,
      };
    })
    .sort((a, b) => a.quantidadeAtual - b.quantidadeAtual)
    .slice(0, 5);

  const acoes = isAdmin
    ? [
        { titulo: "Cadastrar EPI", icon: Package, page: "epis" },
        { titulo: "Ver Pedidos", icon: ShoppingCart, page: "pedidos" },
        { titulo: "Fichas Arquivadas", icon: FileText, page: "fichas-arquivadas" },
        { titulo: "Estoque", icon: Package, page: "estoque" },
        { titulo: "Ver Analytics", icon: BarChart3, page: "analytics" },
      ]
    : [
        { titulo: "Fazer Pedido", icon: ShoppingCart, page: "pedidos" },
        { titulo: "Ver Entregas", icon: Send, page: "entregas" },
        { titulo: "Colaboradores", icon: Users, page: "colaboradores" },
        { titulo: "Fichas Arquivadas", icon: FileText, page: "fichas-arquivadas" },
      ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 sm:gap-6">
          <div>
            <p className="text-emerald-400 text-xs sm:text-sm font-medium mb-2">
              {isAdmin ? "Painel Administrativo" : "Painel da Fazenda"}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white break-words">
              Bem-vindo, {usuario.usuario}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-2xl">
              {isAdmin
                ? "Acompanhe pedidos, entregas, colaboradores, estoque e indicadores do sistema."
                : "Acompanhe pedidos, entregas e os colaboradores vinculados à sua fazenda."}
            </p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? "xl:grid-cols-5" : "xl:grid-cols-4"} gap-3 w-full xl:w-auto`}>
            {acoes.map((acao) => {
              const Icon = acao.icon;
              return (
                <button
                  key={acao.titulo}
                  onClick={() => onNavigate(acao.page)}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl px-4 py-4 text-left transition-all min-w-0"
                >
                  <Icon className="w-5 h-5 text-emerald-400 mb-3" />
                  <div className="text-white font-medium text-sm break-words">{acao.titulo}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isAdmin && (itensZerados > 0 || estoqueBaixo > 0) && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-red-300 font-semibold">Atenção no estoque</h3>
              <p className="text-sm text-red-200/80 mt-1">
                {itensZerados} item(ns) zerado(s) e {estoqueBaixo} com estoque baixo.
              </p>
              <button
                onClick={() => onNavigate("estoque")}
                className="mt-3 text-sm text-red-300 hover:text-red-200"
              >
                Ir para o estoque
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isAdmin ? "2xl:grid-cols-6" : "xl:grid-cols-4"} gap-4`}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.titulo}
              onClick={() => onNavigate(stat.page)}
              className="text-left bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-slate-700 transition-all min-w-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-400">{stat.titulo}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-2">{stat.valor}</p>
                  <p className="text-xs text-slate-500 mt-2 break-words">{stat.texto}</p>
                </div>
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? "2xl:grid-cols-3" : "xl:grid-cols-2"} gap-4 sm:gap-6`}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <h3 className="text-white font-semibold">Pedidos Recentes</h3>
            <button
              onClick={() => onNavigate("pedidos")}
              className="text-sm text-emerald-400 hover:text-emerald-300 shrink-0"
            >
              Ver todos
            </button>
          </div>

          <div className="p-4 space-y-3">
            {pedidosRecentes.length === 0 && (
              <div className="text-slate-400 text-sm px-2 py-8 text-center">
                Nenhum pedido registrado.
              </div>
            )}

            {pedidosRecentes.map((pedido) => (
              <div
                key={pedido.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white font-medium break-words">{pedido.colaboradorNome}</div>
                    <div className="text-sm text-slate-400">{pedido.colaboradorMatricula}</div>
                    <div className="text-xs text-slate-500 mt-1">{formatDate(pedido.dataPedido)}</div>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusBadge(pedido.status)}`}>
                    {pedido.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <h3 className="text-white font-semibold">Entregas Recentes</h3>
            <button
              onClick={() => onNavigate("entregas")}
              className="text-sm text-emerald-400 hover:text-emerald-300 shrink-0"
            >
              Ver todas
            </button>
          </div>

          <div className="p-4 space-y-3">
            {entregasRecentes.length === 0 && (
              <div className="text-slate-400 text-sm px-2 py-8 text-center">
                Nenhuma entrega registrada.
              </div>
            )}

            {entregasRecentes.map((entrega) => (
              <div
                key={entrega.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white font-medium break-words">{entrega.colaboradorNome}</div>
                    <div className="text-sm text-slate-400">{entrega.colaboradorMatricula}</div>
                    <div className="text-xs text-slate-500 mt-1">{formatDate(entrega.dataEntrega)}</div>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusBadge(entrega.status)}`}>
                    {entrega.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <h3 className="text-white font-semibold">Resumo do Estoque</h3>
              <button
                onClick={() => onNavigate("estoque")}
                className="text-sm text-emerald-400 hover:text-emerald-300 shrink-0"
              >
                Abrir estoque
              </button>
            </div>

            <div className="p-4 space-y-3">
              {itensComMenorSaldo.map((item) => (
                <div
                  key={item.epiId}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-white font-medium break-words">{item.nome}</div>
                      <div className="text-xs text-slate-500 mt-1">Saldo atual</div>
                    </div>
                    <div
                      className={`text-lg font-bold shrink-0 ${
                        item.quantidadeAtual === 0 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {item.quantidadeAtual}
                    </div>
                  </div>
                </div>
              ))}

              {itensComMenorSaldo.length === 0 && (
                <div className="text-slate-400 text-sm px-2 py-8 text-center">
                  Nenhum item no estoque.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <h3 className="text-white font-semibold">Últimas Movimentações do Estoque</h3>
            <button
              onClick={() => onNavigate("analytics")}
              className="text-sm text-emerald-400 hover:text-emerald-300 shrink-0"
            >
              Ver analytics
            </button>
          </div>

          <div className="p-4 space-y-3">
            {movimentacoesRecentes.length === 0 && (
              <div className="text-slate-400 text-sm px-2 py-8 text-center">
                Nenhuma movimentação registrada.
              </div>
            )}

            {movimentacoesRecentes.map((mov) => (
              <div
                key={mov.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white font-medium break-words">{mov.epiNome}</div>
                    <div className="text-sm text-slate-400">{mov.tipo}</div>
                    <div className="text-xs text-slate-500 mt-1">{formatDate(mov.data)}</div>
                    {mov.observacao && (
                      <div className="text-xs text-slate-500 mt-1 break-words">{mov.observacao}</div>
                    )}
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-emerald-400 font-semibold">{mov.quantidade}</div>
                    <div className="text-xs text-slate-500">{mov.usuario || "sistema"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
