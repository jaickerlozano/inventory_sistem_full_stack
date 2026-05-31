# Inventory System

A full-stack inventory management application with real-time stock tracking, alert system, and responsive UI. Built with Django REST Framework and React.

**Live Demo:** [inventory-sistem-full-stack.onrender.com](https://inventory-sistem-full-stack.onrender.com)

---

## Features

- **Product Management** — Full CRUD with SKU, pricing, and stock tracking
- **Stock Movements** — Register entries (IN) and exits (OUT) with automatic stock updates
- **3-Level Alert System** — Critical (≤30%), High (≤60%), Low (<100%) stock thresholds
- **Dashboard** — Real-time metrics: total products, low stock alerts, inventory value
- **Responsive Design** — Mobile-first UI with collapsible sidebar and dark mode
- **Concurrency Safety** — Row-level locking (`select_for_update()`) prevents race conditions on stock operations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Django 6.0, Django REST Framework 3.17 |
| **Frontend** | React 19, TypeScript 6, Vite 8 |
| **Styling** | Tailwind CSS v4 (dark mode support) |
| **Database** | PostgreSQL (production), SQLite (development) |
| **Forms** | react-hook-form |
| **Notifications** | react-hot-toast |
| **Icons** | lucide-react |
| **API Docs** | drf-spectacular (Swagger + ReDoc) |
| **Deployment** | Render (free tier) |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                    │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ │
│  │Dashboard│ │ Products │ │Suppliers │ │  Alerts  │ │
│  └─────────┘ └──────────┘ └─────────┘ └──────────┘ │
│  ┌─────────┐ ┌──────────┐                           │
│  │Categories│ │Movements │                           │
│  └─────────┘ └──────────┘                           │
└────────────────────┬────────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────────┐
│                  Backend (Django)                    │
│  ┌────────────┐ ┌────────────────────────────────┐  │
│  │ ViewSets   │ │  Custom Views                  │  │
│  │ Products   │ │  DashboardView                 │  │
│  │ Categories │ │  AlertsView                    │  │
│  │ Suppliers  │ └────────────────────────────────┘  │
│  │ Movements  │                                     │
│  └─────┬──────┘ ┌────────────────────────────────┐  │
│        │        │  Concurrency Protection        │  │
│        │        │  select_for_update()           │  │
│        │        │  transaction.atomic()          │  │
│        │        └────────────────────────────────┘  │
└────────┼────────────────────────────────────────────┘
         ▼
┌─────────────────────┐
│   PostgreSQL /      │
│   SQLite (dev)      │
└─────────────────────┘
```

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 22+
- pnpm

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

API available at `http://localhost:8000/api/inventory/`

### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local

# Start development server
pnpm run dev
```

App available at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|------------|---------|
| `SECRET_KEY` | Django secret key | _(required)_ |
| `DEBUG` | Debug mode | `True` |
| `DATABASE_URL` | Database connection | `sqlite:///db.sqlite3` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins | `http://localhost:5173` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/inventory` |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory/products/` | List all products |
| `POST` | `/api/inventory/products/` | Create product |
| `GET` | `/api/inventory/products/{id}/` | Get product detail |
| `PUT` | `/api/inventory/products/{id}/` | Update product |
| `DELETE` | `/api/inventory/products/{id}/` | Delete product |
| `GET` | `/api/inventory/categories/` | List categories |
| `GET` | `/api/inventory/suppliers/` | List suppliers |
| `GET` | `/api/inventory/stock-movements/` | List movements |
| `POST` | `/api/inventory/stock-movements/` | Register movement |
| `GET` | `/api/inventory/dashboard/` | Dashboard metrics |
| `GET` | `/api/inventory/alerts/` | Stock alerts (3 levels) |
| `GET` | `/api/inventory/products/lowstockproducts/` | Low stock products |
| `GET` | `/api/docs/` | Swagger UI |
| `GET` | `/api/redoc/` | ReDoc UI |

### Query Parameters

- **Products:** `?name__icontains=`, `?category=`, `?supplier=`, `?current_stock__lt=`, `?price__gt=`
- **Categories:** `?search=` (searches name + description)
- **Suppliers:** `?name__icontains=`, `?contact__icontains=`, `?email__icontains=`
- **Alerts:** `?alert=CRITICAL|HIGH|LOW`, `?category=<id>`

---

## Deployment

### Render (Recommended)

The project includes `render.yaml` for one-click deployment:

1. Connect your GitHub repo to Render
2. Create a **Blueprint** from `render.yaml`
3. Render auto-provisions:
   - Python web service (backend + gunicorn)
   - PostgreSQL database
   - Static site (frontend)

**Environment variables to set in Render dashboard:**

| Service | Key | Value |
|---------|-----|-------|
| Backend | `SECRET_KEY` | _(auto-generated)_ |
| Backend | `DEBUG` | `false` |
| Backend | `ALLOWED_HOSTS` | `your-domain.onrender.com` |
| Backend | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.onrender.com` |
| Frontend | `VITE_API_URL` | `https://your-backend.onrender.com/api/inventory` |

> **Note:** After the first deploy, update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` with the actual URLs Render assigns.

---

## Stock Alert System

The alert system classifies products into 3 levels based on the ratio of `current_stock / minimum_stock`:

| Level | Threshold | Color | Meaning |
|-------|-----------|-------|---------|
| **Critical** | ≤ 30% | 🔴 Red | Immediate restocking required |
| **High** | ≤ 60% | 🟠 Amber | Restocking needed soon |
| **Low** | < 100% | 🟡 Yellow | Preventive monitoring |
| **OK** | ≥ 100% | 🟢 Green | Healthy stock level |

---

## Concurrency Protection

Stock operations use **row-level locking** to prevent race conditions:

```python
with transaction.atomic():
    product = Product.objects.select_for_update().get(id=product_id)
    # Read → Validate → Write (atomic)
    if product.current_stock < quantity:
        raise ValidationError("Insufficient stock")
    product.current_stock -= quantity
    product.save()
```

This ensures that concurrent OUT requests on the same product cannot read the same stock value and both succeed, which would result in negative stock.

---

## Project Structure

```
inventory_sistem/
├── backend/
│   ├── core/                  # Django settings, URLs, WSGI
│   ├── inventory/             # Main app
│   │   ├── models.py          # Product, Category, Supplier, StockMovement
│   │   ├── views.py           # ViewSets + Dashboard/Alerts views
│   │   ├── serializer.py      # DRF serializers
│   │   └── tests/             # Test suite
│   ├── requirements.txt       # Python dependencies
│   ├── Procfile               # Production server (gunicorn)
│   ├── build.sh               # Render build script
│   └── render.yaml            # Infrastructure as Code
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/         # Dashboard, Products, Suppliers, etc.
│   │   │   ├── components/    # Layout, Button, Modal, Card
│   │   │   └── App.tsx        # Router + Toaster
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript interfaces
│   │   └── lib/utils.ts       # Utility functions
│   ├── package.json
│   └── vite.config.ts
└── .gitignore
```

---

## Development Rules

- **Fat Models, Thin Views** — Business logic lives in models or dedicated services
- **Atomic Transactions** — All stock operations wrapped in `transaction.atomic()`
- **Strict TypeScript** — No `any`; interfaces must match DRF serializer responses
- **Defensive Programming** — Validate null/undefined data in both TS and Python
- **No Raw SQL** — Always use Django ORM
- **Permission Classes** — No unprotected endpoints

---

## License

MIT
