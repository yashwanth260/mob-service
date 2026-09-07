from django.db import models
from django.utils import timezone

class DeviceModel(models.Model):
    brand = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    price = models.IntegerField()
    category = models.CharField(max_length=100, blank=True, null=True, default='Device')
    emoji = models.CharField(max_length=10, blank=True, null=True, default='📱')
    bgGradient = models.CharField(max_length=200, blank=True, null=True, default='linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)')
    image = models.TextField(blank=True, null=True) # can hold base64 or URL

    def __str__(self):
        return f"{self.brand} - {self.name}"

from django.contrib.auth.models import User

class RepairTicket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='tickets')
    ticket_id = models.CharField(max_length=20, unique=True)
    customerName = models.CharField(max_length=200)
    device = models.CharField(max_length=200)
    issue = models.TextField()
    status = models.CharField(max_length=50, default='Pending')
    date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.ticket_id} - {self.customerName}"

class GalleryImage(models.Model):
    image_url = models.TextField() # can hold base64 or URL
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Gallery Image {self.id}"

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=50, default='Pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"
