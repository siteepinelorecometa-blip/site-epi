import { useState } from "react";
import type { EPI, TipoTamanho } from "../types";

type Props = {
  epi: EPI | null;
  onSave: (epi: EPI) => void;
  onCancel: () => void;
};

export default function EPIForm({ epi, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<EPI>(
    epi || {
      id: "",
      nome: "",
      ca: "",
      unidade: "un",
      tipoTamanho: "nenhum",
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
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClasses}>Nome do EPI *</label>
        <input
          type="text"
          required
          value={formData.nome}
          onChange={(e) =>
            setFormData({ ...formData, nome: e.target.value })
          }
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>CA *</label>
          <input
            type="text"
            required
            value={formData.ca}
            onChange={(e) =>
              setFormData({ ...formData, ca: e.target.value })
            }
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Unidade *</label>
          <select
            value={formData.unidade}
            onChange={(e) =>
              setFormData({ ...formData, unidade: e.target.value })
            }
            className={inputClasses}
          >
            <option value="un">Unidade</option>
            <option value="par">Par</option>
            <option value="pct">Pacote</option>
            <option value="cx">Caixa</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Tipo de Tamanho *</label>
        <select
          value={formData.tipoTamanho}
          onChange={(e) =>
            setFormData({
              ...formData,
              tipoTamanho: e.target.value as TipoTamanho,
            })
          }
          className={inputClasses}
        >
          <option value="nenhum">Não possui tamanho</option>
          <option value="numerico">Tamanho numérico</option>
          <option value="letra">Tamanho por letras</option>
        </select>
      </div>

      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-sm text-slate-400">
        {formData.tipoTamanho === "nenhum" &&
          "Esse EPI será usado sem seleção de tamanho."}
        {formData.tipoTamanho === "numerico" &&
          "Esse EPI usará tamanhos numéricos, como 33, 34, 35..."}
        {formData.tipoTamanho === "letra" &&
          "Esse EPI usará tamanhos como PP, P, M, G, GG e XG."}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        >
          {epi ? "Salvar" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}