import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, Users, ShoppingCart, BarChart3, FolderTree, AlertCircle, Sun, Moon, Menu, X } from "lucide-react";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync dark class on html element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen]);

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

  // Shared sidebar content (reused for both mobile overlay and desktop)
  const sidebarContent = (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-primary" />
          <span className="ml-2 font-medium">Sistema de Inventario</span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent md:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
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
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden w-64 border-r border-border md:flex md:flex-col">
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header with hamburger */}
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <Package className="h-5 w-5 text-primary" />
            <span className="ml-2 text-sm font-medium">Sistema de Inventario</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
