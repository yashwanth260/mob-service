import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { mockBrands } from '../data.js'; // Keep only mockBrands for dropdown

export default function AdminApp() {
  const [notification, setNotification] = useState(null);
  const [adminTab, setAdminTab] = useState('tickets');
  const [repairs, setRepairs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeModels, setStoreModels] = useState([]);
  const [storeImages, setStoreImages] = useState([]);
  
  const [newModelData, setNewModelData] = useState({ brand: mockBrands[0], name: '', price: '', image: '' });
  const [session, setSession] = useState(null);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      checkAdminSession(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      checkAdminSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminSession = (currentSession) => {
    if (currentSession) {
      setSession(currentSession);
      fetchData(currentSession?.access_token);
    } else {
      setSession(null);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authData.email,
      password: authData.password,
    });

    if (error) {
      setAuthError(error.message);
    }
    setIsLoggingIn(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin.html'
      }
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
    };
  };

  const fetchData = async () => {
    try {
      const [{ data: ticketsData }, { data: modelsData }, { data: galleryData }, { data: ordersData }] = await Promise.all([
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('devices').select('*').order('id', { ascending: true }),
        supabase.from('gallery').select('*').order('id', { ascending: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ]);
      setRepairs(ticketsData || []);
      setStoreModels(modelsData || []);
      setStoreImages(galleryData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { data, error } = await supabase.storage
        .from('store-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('store-images')
        .getPublicUrl(filePath);

      callback(publicUrl);
    } catch (err) {
      console.error("Error uploading image:", err);
      setNotification({ type: 'error', title: 'Upload Failed', message: "Make sure the 'store-images' public bucket exists in Supabase." });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    const newModel = {
      brand: newModelData.brand,
      name: newModelData.name,
      price: Number(newModelData.price),
      image: newModelData.image,
      emoji: '📱'
    };
    try {
      const { data, error } = await supabase.from('devices').insert([newModel]).select().single();
      if (!error && data) {
        setStoreModels([...storeModels, data]);
        setNewModelData({ ...newModelData, name: '', price: '', image: '' });
        setNotification({ type: 'success', title: 'Success', message: `${data.name} added successfully!` });
        setTimeout(() => setNotification(null), 3500);
      } else {
        console.error("Error adding model", error);
      }
    } catch(err) {
      console.error("Error adding model", err);
    }
  };

  const handleDeleteModel = async (id) => {
    try {
      await supabase.from('devices').delete().eq('id', id);
      setStoreModels(storeModels.filter(m => m.id !== id));
    } catch(err) {
      console.error("Error deleting model", err);
    }
  };

  const handleUpdateModelImage = async (id, base64) => {
    try {
      const { error } = await supabase.from('devices').update({ image: base64 }).eq('id', id);
      if (!error) {
        setStoreModels(storeModels.map(m => m.id === id ? { ...m, image: base64 } : m));
      }
    } catch(err) {
      console.error("Error updating image", err);
    }
  };

  const handleAddGalleryImage = async (base64) => {
    try {
      const { data, error } = await supabase.from('gallery').insert([{ image_url: base64 }]).select().single();
      if (!error && data) {
        setStoreImages([...storeImages, data]);
        setNotification({ type: 'success', title: 'Success', message: "Image added to gallery!" });
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (err) {
      console.error("Error adding gallery image", err);
    }
  };

  const handleDeleteGalleryImage = async (id) => {
    try {
      await supabase.from('gallery').delete().eq('id', id);
      setStoreImages(storeImages.filter(img => img.id !== id));
    } catch(err) {
      console.error("Error deleting gallery image", err);
    }
  };

  const handleUpdateTicketStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('tickets').update({ status: newStatus }).eq('id', id);
      if (!error) {
        setRepairs(repairs.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch(err) {
      console.error("Error updating ticket status", err);
    }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (!error) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch(err) {
      console.error("Error updating order status", err);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#0b0f14] p-6">
        <div className="mx-auto max-w-md relative z-10 text-center w-full">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-aqua to-magenta mx-auto mb-6 shadow-[0_0_20px_rgba(45,212,191,0.3)]">
            <span className="iconify text-ink text-[24px]" data-icon="ph:lock-key-fill"></span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white mb-2">Admin Portal</h2>
          <p className="text-slate-400 mb-8">Secure login for authorized personnel.</p>
          
          <div className="glass rounded-2xl p-8 text-left space-y-5">
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input required type="email" value={authData.email} onChange={(e) => setAuthData({...authData, email: e.target.value})} className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" placeholder="admin@7star.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <input required type="password" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" placeholder="••••••••" />
              </div>
              {authError && (
                <p className="text-sm text-center font-medium text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
                  {authError}
                </p>
              )}
              <button disabled={isLoggingIn} type="submit" className="w-full mt-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink hover:bg-aqua transition-colors disabled:opacity-50">
                {isLoggingIn ? 'Authenticating...' : 'Access Dashboard'}
              </button>
            </form>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-widest font-semibold">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              type="button" 
              className="w-full flex items-center justify-center gap-3 rounded-full bg-white/5 border border-white/10 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <div className="text-center pt-2 mt-4 border-t border-white/10">
              <a href="/" className="text-xs text-slate-400 hover:text-aqua transition-colors mt-4 inline-block">← Back to Store</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f14]">
      {/* Admin Header */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/20 shadow-lg shadow-red-500/20">
              <span className="iconify text-red-500 text-[18px]" data-icon="ph:shield-check-fill"></span>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">7 Star Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm font-medium text-slate-300 hover:text-white transition">Exit to Store</a>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500/80">Logout</button>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <section className="relative w-full py-12 flex-grow">
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h2>
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 w-fit">
              <button onClick={() => setAdminTab('tickets')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${adminTab === 'tickets' ? 'bg-aqua text-ink' : 'text-slate-400 hover:text-white'}`}>Repair Tickets</button>
              <button onClick={() => setAdminTab('orders')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${adminTab === 'orders' ? 'bg-aqua text-ink' : 'text-slate-400 hover:text-white'}`}>Orders</button>
              <button onClick={() => setAdminTab('models')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${adminTab === 'models' ? 'bg-aqua text-ink' : 'text-slate-400 hover:text-white'}`}>Models Inventory</button>
              <button onClick={() => setAdminTab('gallery')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${adminTab === 'gallery' ? 'bg-aqua text-ink' : 'text-slate-400 hover:text-white'}`}>Store Gallery</button>
            </div>
          </div>
          
          {adminTab === 'tickets' && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20">
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">ID</th>
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Customer</th>
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Device & Issue</th>
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {repairs.map(t => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-5 font-mono text-aqua text-sm">{t.ticket_id}</td>
                        <td className="p-5 text-white font-medium">{t.customer_name}</td>
                        <td className="p-5">
                          <div className="text-white font-semibold">{t.device}</div>
                          <div className="text-sm text-slate-400 mt-1 max-w-xs">{t.issue}</div>
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${t.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>{t.status}</span>
                        </td>
                        <td className="p-5">
                          <select 
                            value={t.status} 
                            onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                            className="bg-ink2 border border-white/10 text-sm text-white rounded-lg p-2 outline-none"
                          >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Ready</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'orders' && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20">
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Order ID</th>
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Items</th>
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Total</th>
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
                      <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-5 font-mono text-aqua text-sm">#{o.id}</td>
                        <td className="p-5">
                          <ul className="text-sm text-slate-300">
                            {o.items?.map(item => (
                              <li key={item.id}><span className="text-slate-500">{item.quantity}x</span> {item.product_name}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-5 font-bold text-white">₹{Number(o.total_amount).toLocaleString()}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${o.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>{o.status}</span>
                        </td>
                        <td className="p-5">
                          <select 
                            value={o.status} 
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-ink2 border border-white/10 text-sm text-white rounded-lg p-2 outline-none"
                          >
                            <option>Pending</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'models' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <form onSubmit={handleAddModel} className="glass rounded-2xl p-6 space-y-5 sticky top-28">
                  <h3 className="font-display text-xl font-bold text-white">Add New Model</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Brand</label>
                    <select 
                      required 
                      value={newModelData.brand} 
                      onChange={e => setNewModelData({...newModelData, brand: e.target.value})}
                      className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition"
                    >
                      {mockBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Model Name</label>
                    <input 
                      required 
                      type="text" 
                      value={newModelData.name} 
                      onChange={e => setNewModelData({...newModelData, name: e.target.value})} 
                      placeholder="e.g. Galaxy Z Fold 5"
                      className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Base Price (₹)</label>
                    <input 
                      required 
                      type="number" 
                      value={newModelData.price} 
                      onChange={e => setNewModelData({...newModelData, price: e.target.value})} 
                      placeholder="e.g. 150000"
                      className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Device Image (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleImageUpload(e, (base64) => setNewModelData({...newModelData, image: base64}))} 
                      className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-aqua outline-none transition text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-aqua file:text-ink hover:file:bg-aqua/80" 
                    />
                  </div>
                  <button type="submit" className="w-full rounded-full bg-gradient-to-r from-aqua to-magenta px-4 py-3 text-sm font-bold text-ink hover:shadow-[0_0_15px_rgba(45,212,191,0.4)] transition">
                    Add to Inventory
                  </button>
                </form>
              </div>
              <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Brand</th>
                        <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Model Name</th>
                        <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Price</th>
                        <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Image</th>
                        <th className="p-5 text-xs font-semibold uppercase tracking-widest text-slate-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {storeModels.map(m => (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 text-white font-medium text-sm">{m.brand}</td>
                          <td className="p-5 text-white font-bold">{m.name}</td>
                          <td className="p-5 text-aqua font-mono text-sm">₹{m.price.toLocaleString()}</td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              {m.image ? (
                                <img src={m.image} alt={m.name} className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">{m.emoji || '📱'}</div>
                              )}
                              <div className="relative cursor-pointer group" title="Upload Image">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={e => handleImageUpload(e, (base64) => handleUpdateModelImage(m.id, base64))} 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <button className="p-1.5 rounded bg-white/10 text-slate-300 hover:text-aqua transition-colors pointer-events-none">
                                  <span className="iconify" data-icon="ph:upload-simple-bold"></span>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <button onClick={() => handleDeleteModel(m.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2" title="Delete Model">
                              <span className="iconify text-lg" data-icon="ph:trash-bold"></span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adminTab === 'gallery' && (
            <div className="glass rounded-2xl p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-1">Store Gallery</h3>
                  <p className="text-sm text-slate-400">Manage images displayed in the Visit our Flagship Store section.</p>
                </div>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageUpload(e, handleAddGalleryImage)} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-aqua to-magenta px-6 py-2.5 text-sm font-bold text-ink shadow-lg shadow-aqua/20 pointer-events-none">
                    <span className="iconify" data-icon="ph:upload-simple-bold"></span> Upload Image
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {storeImages.map((img) => (
                  <div key={img.id} className="group relative rounded-xl overflow-hidden border border-white/10 aspect-video">
                    <img src={img.image_url} alt={`Gallery ${img.id}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDeleteGalleryImage(img.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <span className="iconify text-sm" data-icon="ph:trash-bold"></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-aqua/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${notification.type === 'error' ? 'from-red-500 to-orange-500' : 'from-aqua to-magenta'}`}></div>
               <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${notification.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-aqua/20 text-aqua'}`}>
                 <span className="iconify text-3xl" data-icon={notification.type === 'error' ? 'ph:x-circle-fill' : 'ph:check-circle-fill'}></span>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">{notification.title}</h3>
               <p className="text-slate-300 mb-6">{notification.message}</p>
               <button onClick={() => setNotification(null)} className="w-full py-3 rounded-full bg-white text-ink font-semibold hover:bg-aqua transition-colors">
                 Done
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
