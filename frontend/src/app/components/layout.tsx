import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, Users, ShoppingCart, BarChart3, FolderTree, AlertCircle, Sun, Moon } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Productos", href: "/products", icon: Package },
  { name: "Proveedores", href: "/suppliers", icon: Users },
  { name: "Categorías", href: "/categories", icon: FolderTree },
  { name: "Movimientos", href: "/movements", icon: ShoppingCart },
  { name: "Alertas", href: "/alerts", icon: AlertCircle },
];

function getInitialDarkMode(): boolean {
  try {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
  } catch {
    // localStorage unavailable (SSR, privacy mode)
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function Layout() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(getInitialDarkMode);

  // Sync dark class on html element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("darkMode", String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Package className="h-6 w-6 text-primary" />
          <span className="ml-2 font-medium">Sistema de Inventario</span>
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={isActive
                ? "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors bg-primary text-primary-foreground"
                : "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <div className="border-t border-border p-4">
          <button
            onClick={toggleDarkMode}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
