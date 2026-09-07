from rest_framework import generics
from .permissions import IsAdminUser, IsAdminOrReadOnly, IsAdminOrPostOnly
from .models import DeviceModel, RepairTicket, GalleryImage, Order
from .serializers import DeviceModelSerializer, RepairTicketSerializer, GalleryImageSerializer, OrderSerializer

class DeviceModelListCreate(generics.ListCreateAPIView):
    queryset = DeviceModel.objects.all()
    serializer_class = DeviceModelSerializer
    permission_classes = [IsAdminOrReadOnly]

class DeviceModelDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DeviceModel.objects.all()
    serializer_class = DeviceModelSerializer
    permission_classes = [IsAdminOrReadOnly]

from rest_framework.permissions import IsAuthenticated

class RepairTicketListCreate(generics.ListCreateAPIView):
    serializer_class = RepairTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.email == 'admin@7star.com':
            return RepairTicket.objects.all()
        return RepairTicket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RepairTicketDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = RepairTicket.objects.all()
    serializer_class = RepairTicketSerializer
    permission_classes = [IsAdminUser]

class GalleryImageListCreate(generics.ListCreateAPIView):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAdminOrReadOnly]

class GalleryImageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAdminOrReadOnly]

class OrderListCreate(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.email == 'admin@7star.com':
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

