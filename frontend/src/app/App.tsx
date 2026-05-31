import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { Dashboard } from "./pages/dashboard"
import { Products } from "./pages/products"
import { Suppliers } from "./pages/suppliers"
import { Categories } from "./pages/categories"
import { StockMovements } from "./pages/stock_movements"
import { Alerts } from "./pages/alerts"
import { Layout } from "./components/layout"

function App() {

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        gutter={16}
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--color-card)",
            color: "var(--color-card-foreground)",
            border: "1px solid var(--color-border)",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="movements" element={<StockMovements />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
