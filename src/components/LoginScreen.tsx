import { useState } from "react";
import { AlertTriangle, Building2, Eye, EyeOff, ShieldCheck, UserCheck } from "lucide-react";
import { ADMIN_SENHA, fazendasMock } from "../data/fazendas";
import type { Fazenda, UsuarioLogado } from "../types";

type Props = {
  onLogin: (user: UsuarioLogado) => void;
};

export default function LoginScreen({ onLogin }: Props) {
  const [modo, setModo] = useState<"fazenda" | "admin">("fazenda");
  const [sigla, setSigla] = useState("");
  const [senha, setSenha] = useState("");
  const [fazendaSelecionada, setFazendaSelecionada] = useState<Fazenda | null>(null);
  const [erro, setErro] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fazendasAtivas = fazendasMock.filter((f) => f.ativa);

  const handleSelecionarFazenda = (fazenda: Fazenda) => {
    setFazendaSelecionada(fazenda);
    setSigla(fazenda.sigla);
    setErro("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (modo === "fazenda") {
      if (!fazendaSelecionada) {
        setErro("Selecione uma fazenda");
        return;
      }
      if (senha !== "epi2026") {
        setErro("Senha incorreta. Use: epi2026");
        return;
      }

      onLogin({
        tipo: "fazenda",
        usuario: fazendaSelecionada.nome,
        fazenda: fazendaSelecionada,
      });
      return;
    }

    if (senha !== ADMIN_SENHA) {
      setErro("Senha de administrador incorreta");
      return;
    }

    onLogin({
      tipo: "admin",
      usuario: "Administrador",
      fazenda: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-10 border-r border-slate-800">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Sistema de
                <br />
                Controle de EPI
              </h1>
              <p className="text-slate-400 mt-5 text-base leading-relaxed">
                Controle pedidos, entregas, colaboradores e EPIs em um único painel.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <p className="text-slate-400 text-sm">Fazendas</p>
                <p className="text-white text-2xl font-bold mt-1">{fazendasAtivas.length}</p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <p className="text-slate-400 text-sm">Acesso</p>
                <p className="text-white text-2xl font-bold mt-1">Admin + Fazenda</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex bg-slate-950 p-1 rounded-2xl mb-8 border border-slate-800">
              <button
                onClick={() => {
                  setModo("fazenda");
                  setSigla("");
                  setFazendaSelecionada(null);
                  setErro("");
                  setSenha("");
                  setShowPassword(false);
                }}
                className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                  modo === "fazenda"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Fazenda
                </div>
              </button>

              <button
                onClick={() => {
                  setModo("admin");
                  setSigla("ADMIN");
                  setFazendaSelecionada(null);
                  setErro("");
                  setSenha("");
                  setShowPassword(false);
                }}
                className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                  modo === "admin"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Administrador
                </div>
              </button>
            </div>

            {modo === "fazenda" && (
              <div className="mb-8">
                <p className="text-slate-300 text-sm font-medium mb-4">
                  <span className="font-bold">{fazendasAtivas.length}</span> fazendas cadastradas
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {fazendasAtivas.map((fazenda) => (
                    <button
                      key={fazenda.id}
                      type="button"
                      onClick={() => handleSelecionarFazenda(fazenda)}
                      className={`aspect-[4/3] sm:aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border ${
                        fazendaSelecionada?.id === fazenda.id
                          ? "bg-slate-800 border-emerald-500/50 shadow-xl scale-[1.02]"
                          : "bg-slate-900/50 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <Building2
                        className={`w-8 h-8 ${
                          fazendaSelecionada?.id === fazenda.id ? "text-emerald-400" : "text-slate-400"
                        }`}
                        strokeWidth={1.5}
                      />
                      <span
                        className={`text-sm font-medium tracking-wide ${
                          fazendaSelecionada?.id === fazenda.id ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {fazenda.sigla}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  {modo === "fazenda" ? "Sigla da Fazenda" : "Usuário"}
                </label>
                <input
                  type="text"
                  value={sigla}
                  onChange={(e) => setSigla(e.target.value.toUpperCase())}
                  placeholder={modo === "fazenda" ? "Selecione uma fazenda acima" : "ADMIN"}
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  readOnly={modo === "fazenda"}
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={modo === "fazenda" ? "epi2026" : "Digite a senha"}
                    className="w-full pl-5 pr-14 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {erro && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {erro}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                Entrar no Sistema
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}