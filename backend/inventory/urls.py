from django.urls import path, include
from rest_framework import routers
from .views import ProductViewSet, CategoryViewSet, SupplierViewSet, StockMovementViewSet

router = routers.DefaultRouter() # Create a router and register our viewsets with it.
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'stock-movements', StockMovementViewSet)

urlpatterns = [
    path('', include(router.urls)), # The API URLs are now determined automatically by the router.
]
