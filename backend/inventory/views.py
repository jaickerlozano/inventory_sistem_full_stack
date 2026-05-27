from rest_framework import viewsets
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from django.db.models import Count, F, Sum
from rest_framework.decorators import action
from .serializer import ProductSerializer, CategorySerializer, SupplierSerializer, StockMovementSerializer
from .models import Product, Category, Supplier, StockMovement

# Create your views here.
class DashboardView(APIView):
    def get(self, request, format=None):
        total_products = Product.objects.count()
        total_categories = Category.objects.count()
        total_suppliers = Supplier.objects.count()
        total_stock_movements = StockMovement.objects.count()

        # Total de productos con stock bajo (current_stock < minimum_stock)
        # Usamos F() para comparar dos campos del mismo modelo de forma eficiente
        low_stock_products = Product.objects.filter(current_stock__lt=F('minimum_stock')).count()

        # Valor total del inventario (sumamos el stock actual por el precio de cada producto)
        # Usamos annotate para calcular el valor total por producto y luego sumamos todo
        inventory_value = Product.objects.annotate(total_value=F('current_stock') * F('price')).aggregate(total_inventory_value=Sum('total_value'))['total_inventory_value'] or 0

        # Valor total de movimientos de stock (sumamos la cantidad de movimientos IN y OUT)
        total_in_movements = StockMovement.objects.filter(type='IN').aggregate(total_in=Sum('quantity'))['total_in'] or 0
        total_out_movements = StockMovement.objects.filter(type='OUT').aggregate(total_out=Sum('quantity'))['total_out'] or 0

        total_products_category = Product.objects.values('category__name').annotate(total=Count('id')).order_by('-total')

        # Empaquetamos la lógica de negocio en un diccionario (JSON)
        data = {
            'total_products': total_products,
            'total_categories': total_categories,
            'total_suppliers': total_suppliers,
            'inventory_value': inventory_value,
            'total_stock_movements': total_stock_movements,
            'low_stock_products': low_stock_products,
            'total_in_movements': total_in_movements,
            'total_out_movements': total_out_movements,
            'total_products_category': total_products_category,
        }
        return Response(data)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    # Configuramos los campos por los que se puede filtrar en la API de productos
    filterset_fields = {
        'category': ['exact'], # Permite filtrar por el id de la categoría (exacto)
        'supplier': ['exact'], # Permite filtrar por el id del proveedor (exacto)
        'current_stock': ['lt', 'gt', 'exact'], # Permite filtrar por stock actual (menor que, mayor que, igual a)
        'price': ['lt', 'gt', 'exact'], # Permite filtrar por precio (menor que, mayor que, igual a)
        'minimum_stock': ['lt', 'gt', 'exact'], # Permite filtrar por stock mínimo (menor que, mayor que, igual a)
        'name': ['icontains'], # Permite filtrar por nombre (contiene)
        'sku': ['icontains'], # Permite filtrar por SKU (contiene)
        'description': ['icontains'], # Permite filtrar por descripción (contiene)
    }

    # Sobreescribimos el método create para manejar la lógica de creación de productos con stock inicial
    def create(self, request, *args, **kwargs):
        """
        Crear un producto y registrar un movimiento de stock inicial si se proporciona current_stock
        """
        # Extraemos el stock inicial del request (si se proporciona)
        initial_stock = request.data.get('current_stock', 0)

        # Creamos el producto usando el serializer normal
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()  # Guardamos el producto para obtener su ID

        # Si se proporcionó un stock inicial mayor a 0, registramos un movimiento de stock IN
        if initial_stock and int(initial_stock) > 0:
            StockMovement.objects.create(
                product=product,
                type='IN',
                quantity=int(initial_stock)
            )

        return Response(serializer.data, status=201)    

    # Sobreescribimos el método update para manejar la lógica de actualización de productos con stock
    def update(self, request, *args, **kwargs):
        """
        Actualizar un producto y registrar un movimiento de stock si se cambia el current_stock
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_stock = instance.current_stock  # Guardamos el stock actual antes de actualizar

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()  # Guardamos el producto actualizado

        new_stock = product.current_stock  # Obtenemos el nuevo stock después de actualizar

        # Si el stock ha cambiado, registramos un movimiento de stock
        if new_stock != old_stock:
            movement_type = 'IN' if new_stock > old_stock else 'OUT'
            StockMovement.objects.create(
                product=product,
                type=movement_type,
                quantity=abs(new_stock - old_stock)  # Cantidad del movimiento es la diferencia absoluta
            )

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def lowstockproducts(self, request):
        """
        GET /api/inventory/products/lowstockproducts/
        Retorna productos con stock por debajo del mínimo
        """
        lowstockproducts = self.queryset.filter(current_stock__lt=F('minimum_stock'))
        serializer = self.get_serializer(lowstockproducts, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'name': ['icontains'], # Permite filtrar por nombre (contiene)
        'description': ['icontains'], # Permite filtrar por descripción (contiene)
    }

    # Acción personalizada para obtener el total de productos por categoría
    # detail = False indica que esta acción no requiere un ID específico de categoría, es una acción a nivel de colección
    # GET /api/inventory/categories/total_products/
    # total_products es el nombre de la acción que se usará en la URL para acceder a esta funcionalidad
    @action(detail=False, methods=['get'])
    def total_products(self, request):
        categories = Category.objects.annotate(total_products=Count('products')).values('id', 'name', 'total_products', 'description')

        return Response(categories)

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'name': ['icontains'], # Permite filtrar por nombre (contiene)
        'contact': ['icontains'], # Permite filtrar por persona de contacto (contiene)
        'email': ['icontains'], # Permite filtrar por email de contacto (contiene)
        'phone': ['icontains'], # Permite filtrar por teléfono de contacto (contiene)
    }


from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import Product, StockMovement


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

    # Sobrescribimos el método create para manejar la lógica de actualización de stock
    def create(self, request, *args, **kwargs):
        """
        Crear un movimiento de stock y actualizar el stock del producto
        """
        try:
            with transaction.atomic():  # Garantiza que todo se guarda o nada
                # Obtener los datos
                product_id = request.data.get('product')
                movement_type = request.data.get('type')  # 'IN' o 'OUT'
                quantity = int(request.data.get('quantity'))
                
                # Obtener el producto
                product = Product.objects.get(id=product_id)
                
                # Validar que la cantidad sea positiva
                if quantity <= 0:
                    return Response(
                        {'error': 'La cantidad debe ser mayor a 0'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Validar que no haya stock negativo en salidas
                if movement_type == 'OUT' and product.current_stock < quantity:
                    return Response(
                        {'error': f'Stock insuficiente. Disponible: {product.current_stock}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Actualizar el stock del producto
                if movement_type == 'IN':
                    product.current_stock += quantity
                elif movement_type == 'OUT':
                    product.current_stock -= quantity
                
                product.save()
                
                # Crear el movimiento
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Product.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )