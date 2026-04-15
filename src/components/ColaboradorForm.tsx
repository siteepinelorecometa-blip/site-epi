import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { fazendasMock } from "../data/fazendas";
import type { Colaborador } from "../types";

type Props = {
  colaborador: Colaborador | null;
  onSave: (col: Colaborador) => void;
  onCancel: () => void;
};

export default function ColaboradorForm({
  colaborador,
  onSave,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState<Colaborador>(
    colaborador || {
      id: "",
      nome: "",
      cpf: "",
      matricula: "",
      cargo: "",
      departamento: "",
      email: "",
      telefone: "",
      dataAdmissao: new Date().toISOString().split("T")[0],
      ativo: true,
      fazendaId: "",
      tipoColaborador: "fazenda",
    }
  );

  const inputClasses =
    "w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-1.5";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...formData,
      id: formData.id || Date.now().toString(),
      fazendaId:
        formData.tipoColaborador === "escritorio" ? "ESC" : formData.fazendaId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Nome Completo *</label>
          <input
            type="text"
            required
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value.toUpperCase() })
            }
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>CPF</label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) =>
              setFormData({ ...formData, cpf: e.target.value })
            }
            className={inputClasses}
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Matrícula *</label>
          <input
            type="text"
            required
            value={formData.matricula}
            onChange={(e) =>
              setFormData({ ...formData, matricula: e.target.value })
            }
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Cargo *</label>
          <input
            type="text"
            required
            value={formData.cargo}
            onChange={(e) =>
              setFormData({ ...formData, cargo: e.target.value.toUpperCase() })
            }
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Departamento *</label>
          <input
            type="text"
            required
            value={formData.departamento}
            onChange={(e) =>
              setFormData({
                ...formData,
                departamento: e.target.value.toUpperCase(),
              })
            }
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Data de Admissão *</label>
          <input
            type="date"
            required
            value={formData.dataAdmissao}
            onChange={(e) =>
              setFormData({ ...formData, dataAdmissao: e.target.value })
            }
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>E-mail</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Telefone</label>
          <input
            type="text"
            value={formData.telefone}
            onChange={(e) =>
              setFormData({ ...formData, telefone: e.target.value })
            }
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className={labelClasses}>Tipo de Colaborador *</label>
        <div className="relative">
          <select
            required
            value={formData.tipoColaborador}
            onChange={(e) =>
              setFormData({
                ...formData,
                tipoColaborador: e.target.value as "fazenda" | "escritorio",
                fazendaId: e.target.value === "escritorio" ? "ESC" : formData.fazendaId,
              })
            }
            className={`${inputClasses} appearance-none`}
          >
            <option value="fazenda">Fazenda</option>
            <option value="escritorio">Escritório</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {formData.tipoColaborador === "fazenda" && (
        <div>
          <label className={labelClasses}>Fazenda *</label>
          <div className="relative">
            <select
              required
              value={formData.fazendaId}
              onChange={(e) =>
                setFormData({ ...formData, fazendaId: e.target.value })
              }
              className={`${inputClasses} appearance-none`}
            >
              <option value="">Selecione uma fazenda</option>
              {fazendasMock.filter((f) => f.id !== "ESC").map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="flex items-center pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) =>
              setFormData({ ...formData, ativo: e.target.checked })
            }
            className="w-4 h-4 text-emerald-500 rounded bg-slate-950 border-slate-700"
          />
          <span className="text-sm text-slate-300">Colaborador Ativo</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          {colaborador ? "Salvar" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
