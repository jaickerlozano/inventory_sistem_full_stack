from django.db import models

# Create your models here.
class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name='products')
    supplier = models.ForeignKey('Supplier', on_delete=models.CASCADE, related_name='products')
    current_stock = models.PositiveIntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=0)
    maximum_stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Products'
        verbose_name = 'Product'

class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Suppliers'
        verbose_name = 'Supplier'
    

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'
        verbose_name = 'Category'


class StockMovement(models.Model):
    TYPES = (('IN', 'Entrada'), ('OUT', 'Salida'))
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='stock_movements')
    type = models.CharField(max_length=3, choices=TYPES)
    quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.type} - {self.quantity}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Stock Movements'
        verbose_name = 'Stock Movement' 