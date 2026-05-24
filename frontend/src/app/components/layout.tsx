import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, Users, ShoppingCart, BarChart3, FolderTree, AlertCircle } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Productos", href: "/products", icon: Package },
  { name: "Proveedores", href: "/suppliers", icon: Users },
  { name: "Categorías", href: "/categories", icon: FolderTree },
  { name: "Movimientos", href: "/movements", icon: ShoppingCart },
  { name: "Alertas", href: "/alerts", icon: AlertCircle },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Package className="h-6 w-6 text-primary" />
          <span className="ml-2">Sistema de Inventario</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
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
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
