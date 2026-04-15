import ColaboradorForm from "./ColaboradorForm";
import { useState, useMemo } from "react";
import type { UsuarioLogado, Colaborador, FichaEPI } from "../types";
import {
  Plus,
  Search,
  ChevronDown,
  Edit,
  X,
  FileText,
  Archive,
} from "lucide-react";
import { fazendasMock } from "../data/fazendas";

function ColaboradorList({
  usuario,
  colaboradores,
  fichasEPI,
  onArquivarFicha,
  onAbrirFicha,
  onAdicionarEPI,
  onSave,
  onDelete,
  getFichaAtivaDoColaborador,
}: {
  usuario: UsuarioLogado;
  colaboradores: Colaborador[];
  fichasEPI: FichaEPI[];
  onArquivarFicha: (colaboradorId: string) => void;
  onAbrirFicha: (col: Colaborador) => void;
  onAdicionarEPI: (col: Colaborador) => void;
  onSave: (col: Colaborador) => void;
  onDelete: (id: string) => void;
  getFichaAtivaDoColaborador: (
    fichas: FichaEPI[],
    colaboradorId: string
  ) => FichaEPI | undefined;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFazenda, setFilterFazenda] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<Colaborador | null>(null);

  const isAdmin = usuario.tipo === "admin";

  const visibleColaboradores = useMemo(() => {
    let base = colaboradores;

    if (!isAdmin && usuario.fazenda) {
      base = base.filter((c) => c.fazendaId === usuario.fazenda?.id);
    }

    if (isAdmin && filterFazenda !== "all") {
      if (filterFazenda === "ESC") {
        base = base.filter((c) => c.tipoColaborador === "escritorio");
      } else {
        base = base.filter((c) => c.fazendaId === filterFazenda);
      }
    }

    return base.filter((col) => {
      const texto = searchTerm.toLowerCase();
      return (
        col.nome.toLowerCase().includes(texto) ||
        col.matricula.toLowerCase().includes(texto) ||
        col.cargo.toLowerCase().includes(texto)
      );
    });
  }, [colaboradores, filterFazenda, isAdmin, searchTerm, usuario.fazenda]);

  const handleSave = (col: Colaborador) => {
    onSave(col);
    setEditingCol(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Colaboradores</h2>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingCol(null);
              setIsFormOpen(true);
            }}
            className="sm:ml-auto px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Colaborador
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
          Você pode apenas visualizar os colaboradores da sua fazenda. Cadastro e exclusão são permitidos somente ao administrador.
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome, matrícula ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {isAdmin && (
            <div className="relative w-full sm:w-[220px]">
              <select
                value={filterFazenda}
                onChange={(e) => setFilterFazenda(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
              >
                <option value="all">Todas as Fazendas</option>
                <option value="ESC">Escritório</option>
                {fazendasMock
                  .filter((f) => f.id !== "ESC")
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          )}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="text-left px-3 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[26%]">Colaborador</th>
                <th className="text-left px-3 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[8%]">CPF</th>
                <th className="text-left px-3 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[8%]">Matrícula</th>
                <th className="text-left px-3 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[18%]">Cargo</th>
                <th className="text-left px-3 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[10%]">Fazenda</th>
                <th className="text-left px-3 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[8%]">Tipo</th>
                <th className="text-left px-3 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[8%]">Status</th>
                <th className="text-right px-3 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[14%]">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {visibleColaboradores.map((col) => {
                const fazenda = fazendasMock.find((f) => f.id === col.fazendaId);
                const fichaAtiva = getFichaAtivaDoColaborador(fichasEPI, col.id);

                return (
                  <tr key={col.id} className="hover:bg-slate-800/30 transition-colors align-top">
                    <td className="px-3 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <span className="text-emerald-400 font-semibold text-xs">
                            {col.nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium text-white break-words leading-5">{col.nome}</div>
                          <div className="text-xs text-slate-400 mt-1">{col.email || "Sem e-mail"}</div>
                          <div className="text-[11px] text-slate-500 mt-1 break-words">
                            {fichaAtiva
                              ? `Ficha ativa ${fichaAtiva.numeroFicha} • ${fichaAtiva.linhas.length}/${fichaAtiva.maxLinhas}`
                              : "Nenhuma ficha ativa no momento"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-xs text-slate-300 break-words">{col.cpf || "---.---.---.--"}</td>
                    <td className="px-3 py-4 text-sm font-medium text-slate-300">{col.matricula}</td>
                    <td className="px-3 py-4">
                      <div className="font-medium text-white break-words leading-5">{col.cargo}</div>
                      <div className="text-xs text-slate-400 break-words mt-1">{col.departamento}</div>
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-300 break-words">
                      {col.tipoColaborador === "escritorio" ? "Escritório" : fazenda?.nome || "N/A"}
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-300">
                      {col.tipoColaborador === "escritorio" ? "Escritório" : "Fazenda"}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        col.ativo
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-700 text-slate-400 border border-slate-600"
                      }`}>
                        {col.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => onAbrirFicha(col)}
                          className="px-2.5 py-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/20 whitespace-nowrap"
                        >
                          Ver Ficha
                        </button>

                        {col.tipoColaborador === "escritorio" && isAdmin && (
                          <button
                            onClick={() => onAdicionarEPI(col)}
                            className="px-2.5 py-1.5 text-[11px] text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors border border-yellow-500/20 whitespace-nowrap"
                          >
                            Adicionar EPI
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => onArquivarFicha(col.id)}
                            className="px-2.5 py-1.5 text-[11px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20 whitespace-nowrap"
                          >
                            Arquivar
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingCol(col);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => onDelete(col.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                            title="Excluir"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visibleColaboradores.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden p-4 space-y-3">
          {visibleColaboradores.length === 0 && (
            <div className="px-4 py-10 text-center text-slate-500">
              Nenhum colaborador encontrado.
            </div>
          )}

          {visibleColaboradores.map((col) => {
            const fazenda = fazendasMock.find((f) => f.id === col.fazendaId);
            const fichaAtiva = getFichaAtivaDoColaborador(fichasEPI, col.id);

            return (
              <div key={col.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <span className="text-emerald-400 font-semibold text-xs">
                      {col.nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white break-words">{col.nome}</div>
                    <div className="text-xs text-slate-400 mt-1">{col.email || "Sem e-mail"}</div>
                    <div className="text-[11px] text-slate-500 mt-1 break-words">
                      {fichaAtiva
                        ? `Ficha ativa ${fichaAtiva.numeroFicha} • ${fichaAtiva.linhas.length}/${fichaAtiva.maxLinhas}`
                        : "Nenhuma ficha ativa no momento"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">CPF</div>
                    <div className="text-slate-300 break-words">{col.cpf || "---.---.---.--"}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Matrícula</div>
                    <div className="text-slate-300">{col.matricula}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Cargo</div>
                    <div className="text-slate-300 break-words">{col.cargo}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Departamento</div>
                    <div className="text-slate-300 break-words">{col.departamento}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Fazenda</div>
                    <div className="text-slate-300 break-words">
                      {col.tipoColaborador === "escritorio" ? "Escritório" : fazenda?.nome || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Status</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-1 ${
                      col.ativo
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-700 text-slate-400 border border-slate-600"
                    }`}>
                      {col.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => onAbrirFicha(col)}
                    className="w-full px-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Ver Ficha
                  </button>

                  {col.tipoColaborador === "escritorio" && isAdmin && (
                    <button
                      onClick={() => onAdicionarEPI(col)}
                      className="w-full px-3 py-2 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors border border-yellow-500/20"
                    >
                      Adicionar EPI
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => onArquivarFicha(col.id)}
                      className="w-full px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20 flex items-center justify-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Arquivar
                    </button>
                  )}

                  {isAdmin && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setEditingCol(col);
                          setIsFormOpen(true);
                        }}
                        className="w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>

                      <button
                        onClick={() => onDelete(col.id)}
                        className="w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20 flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdmin && isFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {editingCol ? "Editar Colaborador" : "Novo Colaborador"}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <ColaboradorForm
              colaborador={editingCol}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingCol(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ColaboradorList;
