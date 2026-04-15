import { useState } from "react";
import type { UsuarioLogado, EPI, TipoTamanho } from "../types";
import { Search, Plus, Edit, X } from "lucide-react";
import EPIForm from "./EPIForm";

function EPIList({
  epis,
  usuario,
  onSave,
  onDelete,
}: {
  epis: EPI[];
  usuario: UsuarioLogado;
  onSave: (epi: EPI) => void;
  onDelete: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEPI, setEditingEPI] = useState<EPI | null>(null);

  const isAdmin = usuario.tipo === "admin";

  const episFiltrados = epis.filter((epi) => {
    const texto = searchTerm.toLowerCase();
    return epi.nome.toLowerCase().includes(texto) || epi.ca.toLowerCase().includes(texto);
  });

  const textoTamanho = (tipo: TipoTamanho) => {
    if (tipo === "numerico") return "Numérico";
    if (tipo === "letra") return "P/M/G/GG";
    return "Não se aplica";
  };

  const handleSave = (epi: EPI) => {
    onSave(epi);
    setEditingEPI(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">EPIs</h2>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingEPI(null);
              setIsFormOpen(true);
            }}
            className="ml-auto px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo EPI
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
          Você pode visualizar os EPIs, mas somente o administrador pode cadastrar, editar ou excluir.
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou CA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">EPI</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">CA</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Unidade</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Tamanho</th>
                {isAdmin && (
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {episFiltrados.map((epi) => (
                <tr key={epi.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{epi.nome}</td>
                  <td className="px-6 py-4 text-slate-300">{epi.ca}</td>
                  <td className="px-6 py-4 text-slate-300">{epi.unidade}</td>
                  <td className="px-6 py-4 text-slate-300">{textoTamanho(epi.tipoTamanho)}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingEPI(epi);
                          setIsFormOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(epi.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && isFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingEPI ? "Editar EPI" : "Novo EPI"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <EPIForm
              epi={editingEPI}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingEPI(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EPIList;