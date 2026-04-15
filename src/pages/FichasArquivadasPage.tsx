import { useMemo, useState } from "react";
import type { UsuarioLogado, Colaborador, FichaEPI, Fazenda } from "../types";
import { X, FileText } from "lucide-react";

function FichasArquivadasPage({
  usuario,
  colaboradores,
  fichasEPI,
  fazendas,
  onAbrirFicha,
}: {
  usuario: UsuarioLogado;
  colaboradores: Colaborador[];
  fichasEPI: FichaEPI[];
  fazendas: Fazenda[];
  onAbrirFicha: (ficha: FichaEPI, colaborador: Colaborador) => void;
}) {
  const [filtroFazenda, setFiltroFazenda] = useState<string>("todas");
  const [colaboradorExpandido, setColaboradorExpandido] = useState<{
    colaborador: Colaborador;
    fichas: FichaEPI[];
  } | null>(null);

  const fichasArquivadas = useMemo(() => {
    return fichasEPI
      .filter((f) => f.status === "arquivada")
      .sort((a, b) => {
        if (b.numeroFicha !== a.numeroFicha) {
          return b.numeroFicha - a.numeroFicha;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [fichasEPI]);

  const colaboradoresPermitidos = useMemo(() => {
    return colaboradores.filter((col) => {
      if (usuario.tipo === "admin") {
        return filtroFazenda === "todas" ? true : col.fazendaId === filtroFazenda;
      }
      return col.fazendaId === usuario.fazenda?.id;
    });
  }, [colaboradores, usuario, filtroFazenda]);

  const gruposPorColaborador = useMemo(() => {
    const mapa = new Map<
      string,
      { colaborador: Colaborador; fichas: FichaEPI[] }
    >();

    for (const ficha of fichasArquivadas) {
      const colaborador = colaboradoresPermitidos.find((c) => c.id === ficha.colaboradorId);
      if (!colaborador) continue;

      const atual = mapa.get(colaborador.id);

      if (atual) {
        atual.fichas.push(ficha);
      } else {
        mapa.set(colaborador.id, {
          colaborador,
          fichas: [ficha],
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) =>
      a.colaborador.nome.localeCompare(b.colaborador.nome, "pt-BR")
    );
  }, [fichasArquivadas, colaboradoresPermitidos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fichas Arquivadas</h1>
          <p className="text-slate-400">
            Histórico de fichas finalizadas dos colaboradores
          </p>
        </div>

        {usuario.tipo === "admin" && (
          <select
            value={filtroFazenda}
            onChange={(e) => setFiltroFazenda(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
          >
            <option value="todas">Todas as fazendas</option>
            {fazendas.map((fazenda) => (
              <option key={fazenda.id} value={fazenda.id}>
                {fazenda.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/60">
            <tr>
              <th className="text-left px-4 py-3 text-slate-400">Colaborador</th>
              <th className="text-left px-4 py-3 text-slate-400">Fazenda</th>
              <th className="text-left px-4 py-3 text-slate-400">Qtd. de fichas</th>
              <th className="text-left px-4 py-3 text-slate-400">Última ficha</th>
              <th className="text-right px-4 py-3 text-slate-400">Ações</th>
            </tr>
          </thead>

          <tbody>
            {gruposPorColaborador.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma ficha arquivada encontrada.
                </td>
              </tr>
            ) : (
              gruposPorColaborador.map(({ colaborador, fichas }) => {
                const fazenda = fazendas.find((f) => f.id === colaborador.fazendaId);
                const ultimaFicha = fichas[0];

                return (
                  <tr key={colaborador.id} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-slate-200">{colaborador.nome}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {fazenda?.nome ?? colaborador.tipoColaborador === "escritorio" ? "Escritório" : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{fichas.length}</td>
                    <td className="px-4 py-3 text-slate-300">
                      Ficha {ultimaFicha?.numeroFicha ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          setColaboradorExpandido({
                            colaborador,
                            fichas,
                          })
                        }
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                      >
                        Ver Fichas
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {colaboradorExpandido && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-3xl border border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Fichas de {colaboradorExpandido.colaborador.nome}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Escolha a ficha arquivada que deseja visualizar ou imprimir
                </p>
              </div>

              <button
                onClick={() => setColaboradorExpandido(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {colaboradorExpandido.fichas.map((ficha) => (
                <div
                  key={ficha.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>

                    <div>
                      <div className="text-white font-medium">
                        Ficha {ficha.numeroFicha}
                      </div>
                      <div className="text-sm text-slate-400">
                        {ficha.linhas.length} linha(s)
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Arquivada em {new Date(ficha.updatedAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        onAbrirFicha(ficha, colaboradorExpandido.colaborador)
                      }
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FichasArquivadasPage;
