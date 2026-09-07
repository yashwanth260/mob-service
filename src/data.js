export const mockProducts = [
  { id: 1, name: 'iPhone 15 Pro', brand: 'APPLE', price: 134900, category: 'Smartphone', emoji: '📱', stock: 12, bgGradient: 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' },
  { id: 2, name: 'Galaxy S24 Ultra', brand: 'SAMSUNG', price: 129999, category: 'Smartphone', emoji: '🌌', stock: 8, bgGradient: 'linear-gradient(150deg, #4f46e5 0%, #3730a3 45%, #1e1b4b 78%)' },
  { id: 3, name: 'OnePlus 12R', brand: 'ONEPLUS', price: 39999, category: 'Smartphone', emoji: '⚡', stock: 15, bgGradient: 'linear-gradient(150deg, #dc2626 0%, #991b1b 45%, #450a0a 78%)' },
  { id: 4, name: 'AirPods Pro 2', brand: 'APPLE', price: 24900, category: 'Accessories', emoji: '🎧', stock: 20, bgGradient: 'linear-gradient(150deg, #a8a29e 0%, #57534e 45%, #292524 78%)' },
  { id: 5, name: 'Smart TV 55"', brand: 'SONY', price: 65000, category: 'Electronics', emoji: '📺', stock: 5, bgGradient: 'linear-gradient(150deg, #0ea5e9 0%, #0369a1 45%, #082f49 78%)' },
  { id: 6, name: 'Vivo V30', brand: 'VIVO', price: 33999, category: 'Smartphone', emoji: '📷', stock: 10, bgGradient: 'linear-gradient(150deg, #e879f9 0%, #c026d3 45%, #4a044e 78%)' },
  { id: 7, name: 'MacBook Air M3', brand: 'APPLE', price: 114900, category: 'Laptop', emoji: '💻', stock: 7, bgGradient: 'linear-gradient(150deg, #94a3b8 0%, #475569 45%, #0f172a 78%)' }
];

export const mockBrands = [
  'Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Redmi', 'Realme', 'Vivo', 
  'Oppo', 'Poco', 'Honor', 'Infinix', 'LG', 'iQOO', 'Motorola', 'Tecno', 'Nothing', 'HP',
  'Nokia', 'Karbonn', 'Jio', 'Lava', 'Itel'
];

export const mockServices = [
  { id: 's1', name: 'Glass replacement (front)', img: 'https://www.fixma.in/storage/defects/cracked-smartphone.png' },
  { id: 's2', name: 'Display replacement (front)', img: 'https://www.fixma.in/storage/defects/glassdisplay.png' },
  { id: 's3', name: 'Back Glass Replacement', img: 'https://www.fixma.in/storage/defects/Back Glass Replacement.png' },
  { id: 's4', name: 'Battery replacement', img: 'https://www.fixma.in/storage/defects/battery.png' },
  { id: 's5', name: 'Body Housing Replacement', img: 'https://www.fixma.in/storage/defects/Body Housing Replacement.png' },
  { id: 's6', name: 'Charging port replacement', img: 'https://www.fixma.in/storage/defects/charger.png' },
  { id: 's7', name: 'Speaker replacement', img: 'https://www.fixma.in/storage/defects/speaker.png' },
  { id: 's8', name: 'Camera replacement (front)', img: 'https://www.fixma.in/storage/defects/glasscamera.png' },
  { id: 's9', name: 'Camera replacement (back)', img: 'https://www.fixma.in/storage/defects/back camera.png' },
  { id: 's10', name: 'Ringer replacement', img: 'https://www.fixma.in/storage/defects/ringer.png' },
  { id: 's11', name: 'Mic replacement', img: 'https://www.fixma.in/storage/defects/microphone.png' },
  { id: 's12', name: 'Vibrator replacement', img: 'https://www.fixma.in/storage/defects/vibrator.png' },
  { id: 's13', name: 'Handsfree jack replacement', img: 'https://www.fixma.in/storage/defects/headphone.png' },
  { id: 's14', name: 'Power button replacement', img: 'https://www.fixma.in/storage/defects/power.png' },
  { id: 's15', name: 'Volume keys replacement', img: 'https://www.fixma.in/storage/defects/volume-button.png' },
  { id: 's16', name: 'Home button replacement', img: 'https://www.fixma.in/storage/defects/home.png' },
  { id: 's17', name: 'Finger print sensor replacement', img: 'https://www.fixma.in/storage/defects/mobile (1).png' },
  { id: 's18', name: 'Other Service', img: 'https://www.fixma.in/storage/defects/other.png' }
];

export const initialRepairs = [
  { id: 'TKT-1001', customerName: 'Rahul Kumar', device: 'Apple iPhone 13', issue: 'Screen replacement', status: 'Pending', date: '2026-07-30' },
  { id: 'TKT-1002', customerName: 'Priya Singh', device: 'Samsung Galaxy S21', issue: 'Battery draining', status: 'In Progress', date: '2026-07-31' }
];

export const mockTestimonials = [
  { id: 1, name: 'Arjun M.', rating: 5, text: 'The 3D coverflow preview is insane! Booked a repair and got my iPhone back same day. Premium service.', img: 'https://www.fixma.in/phonfix/img/testimonial-1.jpg' },
  { id: 2, name: 'Sneha P.', rating: 5, text: 'Finally a repair shop that feels like an Apple store. Transparency on pricing and great coffee while you wait.', img: 'https://www.fixma.in/phonfix/img/testimonial-2.jpg' },
  { id: 3, name: 'Rahul K.', rating: 4, text: 'Super fast battery replacement for my OnePlus. The dark mode website is a vibe.', img: 'https://www.fixma.in/phonfix/img/testimonial-3.jpg' },
  { id: 4, name: 'Priya S.', rating: 5, text: 'The best mobile service center in Bangalore. Highly recommend their transparent process and quick turnaround.', img: 'https://www.fixma.in/phonfix/img/testimonial-4.jpg' }
];

export const initialStoreModels = [
  // Apple
  { id: 'm1', brand: 'Apple', name: 'iPhone 15 Pro Max', price: 159900, category: 'Smartphone', emoji: '📱', bgGradient: 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' },
  { id: 'm2', brand: 'Apple', name: 'iPhone 15 Pro', price: 134900, category: 'Smartphone', emoji: '📱', bgGradient: 'linear-gradient(150deg, #4f46e5 0%, #3730a3 45%, #1e1b4b 78%)' },
  { id: 'm3', brand: 'Apple', name: 'iPad Pro M4', price: 99900, category: 'Tablet', emoji: '📱', bgGradient: 'linear-gradient(150deg, #a8a29e 0%, #57534e 45%, #292524 78%)' },
  { id: 'm4', brand: 'Apple', name: 'AirPods Pro 2', price: 24900, category: 'Headphones', emoji: '🎧', bgGradient: 'linear-gradient(150deg, #0ea5e9 0%, #0369a1 45%, #082f49 78%)' },
  { id: 'm5', brand: 'Apple', name: 'Magic Keyboard', price: 29900, category: 'Keyboard', emoji: '⌨️', bgGradient: 'linear-gradient(150deg, #dc2626 0%, #991b1b 45%, #450a0a 78%)' },
  { id: 'm6', brand: 'Apple', name: 'Magic Mouse', price: 9500, category: 'Mouse', emoji: '🖱️', bgGradient: 'linear-gradient(150deg, #e879f9 0%, #c026d3 45%, #4a044e 78%)' },
  
  // Samsung
  { id: 'm7', brand: 'Samsung', name: 'Galaxy S24 Ultra', price: 129999, category: 'Smartphone', emoji: '🌌', bgGradient: 'linear-gradient(150deg, #0ea5e9 0%, #0369a1 45%, #082f49 78%)' },
  { id: 'm8', brand: 'Samsung', name: 'Galaxy Tab S9 Ultra', price: 119999, category: 'Tablet', emoji: '📱', bgGradient: 'linear-gradient(150deg, #dc2626 0%, #991b1b 45%, #450a0a 78%)' },
  { id: 'm9', brand: 'Samsung', name: 'Galaxy Buds 2 Pro', price: 15999, category: 'Headphones', emoji: '🎧', bgGradient: 'linear-gradient(150deg, #a8a29e 0%, #57534e 45%, #292524 78%)' },
  
  // HP
  { id: 'm10', brand: 'HP', name: 'HP Spectre x360', price: 139999, category: 'Laptop', emoji: '💻', bgGradient: 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' },
  { id: 'm11', brand: 'HP', name: 'HP Omen 16', price: 124999, category: 'Laptop', emoji: '💻', bgGradient: 'linear-gradient(150deg, #4f46e5 0%, #3730a3 45%, #1e1b4b 78%)' },

  // Google
  { id: 'm12', brand: 'Google', name: 'Pixel 8 Pro', price: 106999, category: 'Smartphone', emoji: '📱', bgGradient: 'linear-gradient(150deg, #e879f9 0%, #c026d3 45%, #4a044e 78%)' },
  { id: 'm13', brand: 'Google', name: 'Pixel Tablet', price: 49999, category: 'Tablet', emoji: '📱', bgGradient: 'linear-gradient(150deg, #94a3b8 0%, #475569 45%, #0f172a 78%)' },

  // OnePlus
  { id: 'm15', brand: 'OnePlus', name: 'OnePlus 12', price: 64999, category: 'Smartphone', emoji: '⚡', bgGradient: 'linear-gradient(150deg, #dc2626 0%, #991b1b 45%, #450a0a 78%)' },
  
  // Xiaomi
  { id: 'm16', brand: 'Xiaomi', name: 'Xiaomi 14 Ultra', price: 99999, category: 'Smartphone', emoji: '📱', bgGradient: 'linear-gradient(150deg, #94a3b8 0%, #475569 45%, #0f172a 78%)' },
  { id: 'm17', brand: 'Xiaomi', name: 'Xiaomi Pad 6', price: 26999, category: 'Tablet', emoji: '📱', bgGradient: 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' }
];
