import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.models import DeviceModel, RepairTicket, GalleryImage

initialStoreModels = [
  # Apple
  { 'id': 'm1', 'brand': 'Apple', 'name': 'iPhone 15 Pro Max', 'price': 159900, 'category': 'Smartphone', 'emoji': '📱', 'bgGradient': 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' },
  { 'id': 'm2', 'brand': 'Apple', 'name': 'iPhone 15 Pro', 'price': 134900, 'category': 'Smartphone', 'emoji': '📱', 'bgGradient': 'linear-gradient(150deg, #4f46e5 0%, #3730a3 45%, #1e1b4b 78%)' },
  { 'id': 'm3', 'brand': 'Apple', 'name': 'iPad Pro M4', 'price': 99900, 'category': 'Tablet', 'emoji': '📱', 'bgGradient': 'linear-gradient(150deg, #a8a29e 0%, #57534e 45%, #292524 78%)' },
  { 'id': 'm4', 'brand': 'Apple', 'name': 'AirPods Pro 2', 'price': 24900, 'category': 'Headphones', 'emoji': '🎧', 'bgGradient': 'linear-gradient(150deg, #0ea5e9 0%, #0369a1 45%, #082f49 78%)' },
  { 'id': 'm5', 'brand': 'Apple', 'name': 'Magic Keyboard', 'price': 29900, 'category': 'Keyboard', 'emoji': '⌨️', 'bgGradient': 'linear-gradient(150deg, #dc2626 0%, #991b1b 45%, #450a0a 78%)' },
  { 'id': 'm6', 'brand': 'Apple', 'name': 'Magic Mouse', 'price': 9500, 'category': 'Mouse', 'emoji': '🖱️', 'bgGradient': 'linear-gradient(150deg, #e879f9 0%, #c026d3 45%, #4a044e 78%)' },
  
  # Samsung
  { 'id': 'm7', 'brand': 'Samsung', 'name': 'Galaxy S24 Ultra', 'price': 129999, 'category': 'Smartphone', 'emoji': '🌌', 'bgGradient': 'linear-gradient(150deg, #0ea5e9 0%, #0369a1 45%, #082f49 78%)' },
  { 'id': 'm8', 'brand': 'Samsung', 'name': 'Galaxy Tab S9 Ultra', 'price': 119999, 'category': 'Tablet', 'emoji': '📱', 'bgGradient': 'linear-gradient(150deg, #dc2626 0%, #991b1b 45%, #450a0a 78%)' },
  { 'id': 'm9', 'brand': 'Samsung', 'name': 'Galaxy Buds 2 Pro', 'price': 15999, 'category': 'Headphones', 'emoji': '🎧', 'bgGradient': 'linear-gradient(150deg, #a8a29e 0%, #57534e 45%, #292524 78%)' },
  
  # HP
  { 'id': 'm10', 'brand': 'HP', 'name': 'HP Spectre x360', 'price': 139999, 'category': 'Laptop', 'emoji': '💻', 'bgGradient': 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' },
  { 'id': 'm11', 'brand': 'HP', 'name': 'HP Omen 16', 'price': 124999, 'category': 'Laptop', 'emoji': '💻', 'bgGradient': 'linear-gradient(150deg, #4f46e5 0%, #3730a3 45%, #1e1b4b 78%)' },

  # Google
  { 'id': 'm12', 'brand': 'Google', 'name': 'Pixel 8 Pro', 'price': 106999, 'category': 'Smartphone', 'emoji': '📱', 'bgGradient': 'linear-gradient(150deg, #e879f9 0%, #c026d3 45%, #4a044e 78%)' },
  { 'id': 'm13', 'brand': 'Google', 'name': 'Pixel Tablet', 'price': 49999, 'category': 'Tablet', 'emoji': '📱', 'bgGradient': 'linear-gradient(150deg, #94a3b8 0%, #475569 45%, #0f172a 78%)' },

  # Sony
  { 'id': 'm14', 'brand': 'Sony', 'name': 'Sony WH-1000XM5', 'price': 29999, 'category': 'Headphones', 'emoji': '🎧', 'bgGradient': 'linear-gradient(150deg, #0ea5e9 0%, #0369a1 45%, #082f49 78%)' },

  # OnePlus
  { 'id': 'm15', 'brand': 'OnePlus', 'name': 'OnePlus 12', 'price': 64999, 'category': 'Smartphone', 'emoji': '⚡', 'bgGradient': 'linear-gradient(150deg, #dc2626 0%, #991b1b 45%, #450a0a 78%)' },
  
  # Xiaomi
  { 'id': 'm16', 'brand': 'Xiaomi', 'name': 'Xiaomi 14 Ultra', 'price': 99999, 'category': 'Smartphone', 'emoji': '📱', 'bgGradient': 'linear-gradient(150deg, #94a3b8 0%, #475569 45%, #0f172a 78%)' },
  { 'id': 'm17', 'brand': 'Xiaomi', 'name': 'Xiaomi Pad 6', 'price': 26999, 'category': 'Tablet', 'emoji': '📱', 'bgGradient': 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' }
]

initialRepairs = [
  { 'id': 'TKT-1001', 'customerName': 'Rahul Kumar', 'device': 'Apple iPhone 13', 'issue': 'Screen replacement', 'status': 'Pending', 'date': '2026-07-30' },
  { 'id': 'TKT-1002', 'customerName': 'Priya Singh', 'device': 'Samsung Galaxy S21', 'issue': 'Battery draining', 'status': 'In Progress', 'date': '2026-07-31' }
]

def seed():
    print("Seeding DeviceModels...")
    for model in initialStoreModels:
        DeviceModel.objects.get_or_create(
            name=model['name'],
            defaults={
                'brand': model['brand'],
                'price': model['price'],
                'category': model.get('category', ''),
                'emoji': model.get('emoji', ''),
                'bgGradient': model.get('bgGradient', ''),
            }
        )
        
    from django.contrib.auth import get_user_model
    User = get_user_model()
    dummy_user, created = User.objects.get_or_create(
        email='customer@example.com',
        defaults={'username': 'customer@example.com'}
    )
    
    print("Seeding RepairTickets...")
    for t in initialRepairs:
        RepairTicket.objects.get_or_create(
            ticket_id=t['id'],
            defaults={
                'user': dummy_user,
                'customerName': t['customerName'],
                'device': t['device'],
                'issue': t['issue'],
                'status': t['status']
            }
        )
        
    print("Seeding GalleryImages...")
    for url in ['/storefront.png', '/storefront_interior.png', '/storefront_repair_lab.png']:
        GalleryImage.objects.get_or_create(image_url=url)
        
    print("Done seeding.")

if __name__ == '__main__':
    seed()
