import {
  FileText,
  Home,
  LogOut,
  Package,
  Users,
  Truck,
  BarChart3,
  ShoppingCart,
  ChevronDown,
  RotateCcw,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { UsuarioLogado } from "../types";

type Props = {
  usuario: UsuarioLogado;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenRestoreSite?: () => void;
};

export default function Header({
  usuario,
  onLogout,
  currentPage,
  onNavigate,
  onOpenRestoreSite,
}: Props) {
  const [menuAdminAberto, setMenuAdminAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  useEffect(() => {
    setMenuMobileAberto(false);
  }, [currentPage]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "epis", label: "EPIs", icon: Package },
    { id: "colaboradores", label: "Colaboradores", icon: Users },
    { id: "entregas", label: "Entregas", icon: Truck },
    {
      id: "pedidos",
      label: usuario.tipo === "admin" ? "Pedidos das Fazendas" : "Pedidos",
      icon: ShoppingCart,
    },
    ...(usuario.tipo === "admin"
      ? [
          { id: "estoque", label: "Estoque", icon: Package },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white truncate">Controle de EPI</h1>
              <p className="text-xs text-slate-400 truncate">
                {usuario.fazenda?.nome || usuario.usuario}
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    currentPage === item.id
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {usuario.tipo === "admin" ? (
              <div className="relative">
                <button
                  onClick={() => setMenuAdminAberto((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-900 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {usuario.usuario.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm">Administrador</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {menuAdminAberto && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden z-50">
                    <button
                      onClick={() => {
                        setMenuAdminAberto(false);
                        onOpenRestoreSite?.();
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-900 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4 text-yellow-400" />
                      Restaurar site
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {usuario.usuario.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-slate-300">{usuario.usuario}</span>
              </div>
            )}

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMenuMobileAberto((prev) => !prev)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="Menu"
            >
              {menuMobileAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="hidden lg:hidden" />

        {menuMobileAberto && (
          <div className="sm:hidden border-t border-slate-800 py-3 space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full px-3 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                      currentPage === item.id
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              {usuario.tipo === "admin" && (
                <button
                  onClick={() => {
                    setMenuMobileAberto(false);
                    onOpenRestoreSite?.();
                  }}
                  className="w-full px-3 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 text-yellow-400 hover:bg-slate-800 hover:text-yellow-300"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span className="truncate">Restaurar site</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
