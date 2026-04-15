import type { EPI, PedidoItem } from "../types";
import { getOpcoesTamanho } from "../utils/helpers";

type Props = {
  epis: EPI[];
  selectedItems: PedidoItem[];
  onChange: (items: PedidoItem[]) => void;
};

export default function EPISelectorList({
  epis,
  selectedItems,
  onChange,
}: Props) {
  const getSelectedItem = (epiId: string) =>
    selectedItems.find((item) => item.epiId === epiId);

  const toggleItem = (epi: EPI) => {
    const exists = getSelectedItem(epi.id);

    if (exists) {
      onChange(selectedItems.filter((item) => item.epiId !== epi.id));
      return;
    }

    onChange([
      ...selectedItems,
      {
        epiId: epi.id,
        quantidade: 1,
        tamanho: "",
      },
    ]);
  };

  const updateItem = (
    epiId: string,
    field: "quantidade" | "tamanho",
    value: string | number
  ) => {
    onChange(
      selectedItems.map((item) =>
        item.epiId === epiId ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-3">
      {epis.map((epi) => {
        const selected = getSelectedItem(epi.id);
        const precisaTamanho = epi.tipoTamanho !== "nenhum";
        const opcoesTamanho = getOpcoesTamanho(epi);

        return (
          <div
            key={epi.id}
            className={`border rounded-2xl px-4 py-4 transition-all ${
              selected
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-slate-800 bg-slate-950/50"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <button
                  type="button"
                  onClick={() => toggleItem(epi)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    selected
                      ? "border-emerald-500"
                      : "border-slate-500 hover:border-slate-300"
                  }`}
                >
                  {selected && <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />}
                </button>

                <div className="min-w-0">
                  <div className="text-white font-medium">{epi.nome}</div>
                  <div className="text-sm text-slate-400">
                    CA: {epi.ca} • Unidade: {epi.unidade}
                  </div>
                </div>
              </div>

              {selected && (
                <div className="flex items-end gap-3">
                  <div className="w-20">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Qtd
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={selected.quantidade}
                      onChange={(e) =>
                        updateItem(
                          epi.id,
                          "quantidade",
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className="w-full h-10 px-2 text-center bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {precisaTamanho && (
                    <div className="w-28">
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Tam.
                      </label>
                      <select
                        value={selected.tamanho || ""}
                        onChange={(e) =>
                          updateItem(epi.id, "tamanho", e.target.value)
                        }
                        className="w-full h-10 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Selecione</option>
                        {opcoesTamanho.map((tam) => (
                          <option key={tam} value={tam}>
                            {tam}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}