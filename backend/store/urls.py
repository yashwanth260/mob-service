from django.urls import path
from .views import (
    DeviceModelListCreate, DeviceModelDetail,
    RepairTicketListCreate, RepairTicketDetail,
    GalleryImageListCreate, GalleryImageDetail,
    OrderListCreate, OrderDetail
)

urlpatterns = [
    path('devices/', DeviceModelListCreate.as_view(), name='device-list-create'),
    path('devices/<int:pk>/', DeviceModelDetail.as_view(), name='device-detail'),
    path('tickets/', RepairTicketListCreate.as_view(), name='ticket-list-create'),
    path('tickets/<int:pk>/', RepairTicketDetail.as_view(), name='ticket-detail'),
    path('gallery/', GalleryImageListCreate.as_view(), name='gallery-list-create'),
    path('gallery/<int:pk>/', GalleryImageDetail.as_view(), name='gallery-detail'),
    path('orders/', OrderListCreate.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetail.as_view(), name='order-detail'),
]
