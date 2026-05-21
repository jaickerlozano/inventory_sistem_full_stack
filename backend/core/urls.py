from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework import routers
from inventory.views import ProductViewSet, CategoryViewSet, SupplierViewSet, StockMovementViewSet

router = routers.DefaultRouter() # Create a router and register our viewsets with it.
router.register(r'products', ProductViewSet, 'products')
router.register(r'categories', CategoryViewSet, 'categories')
router.register(r'suppliers', SupplierViewSet, 'suppliers')
router.register(r'stock-movements', StockMovementViewSet, 'stock-movements')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/inventory/', include(router.urls)),
    # API schema (JSON o YAML)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # UI Swagger
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # ReDoc
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
