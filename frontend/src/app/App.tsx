import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Dashboard } from "./pages/dashboard"
import { Products } from "./pages/products"
import { Suppliers } from "./pages/suppliers"
import { Categories } from "./pages/categories"
import { StockMovements } from "./pages/stock_movements"
import { Alerts } from "./pages/alerts"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="movements" element={<StockMovements />} />
          <Route path="alerts" element={<Alerts />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
