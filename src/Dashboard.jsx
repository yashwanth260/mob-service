import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { LogOut, User } from 'lucide-react';

export default function Dashboard({ session }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getProfile();
      fetchTickets();
      fetchOrders();
    }
  }, [session]);

  async function fetchOrders() {
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      if (data) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function fetchTickets() {
    try {
      setLoadingTickets(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      if (data) {
        setTickets(data);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  }

  async function getProfile() {
    try {
      setLoading(true);
      const { user } = session;
      
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url, website`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else if (user.user_metadata) {
        setProfile({
          full_name: user.user_metadata.full_name || user.user_metadata.name,
          avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture
        });
      }
    } catch (error) {
      console.warn("Could not load profile:", error.message);
      if (session?.user?.user_metadata) {
        setProfile({
          full_name: session.user.user_metadata.full_name || session.user.user_metadata.name,
          avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f14] p-6 text-white">
      <nav className="flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/10 mb-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-aqua to-magenta shadow-lg shadow-aqua/20">
            <User className="h-5 w-5 text-ink" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">My Dashboard</h1>
            <p className="text-xs text-slate-400">Manage your profile</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-red-500/80 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </nav>

      <div className="max-w-4xl mx-auto w-full grid gap-6">
        <div className="glass rounded-3xl p-8 border border-white/10">
          <h2 className="text-2xl font-display font-bold mb-6">Account Overview</h2>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-white/5 rounded-xl w-1/3"></div>
              <div className="h-12 bg-white/5 rounded-xl w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="h-20 w-20 rounded-full object-cover border-2 border-aqua shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-ink2 flex items-center justify-center border border-white/10">
                    <User className="h-8 w-8 text-slate-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{profile?.full_name || 'Guest User'}</h3>
                  <p className="text-aqua font-medium mt-1">{session?.user?.email}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">User ID</div>
                  <div className="text-sm text-slate-300 font-mono truncate">{session?.user?.id}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Last Sign In</div>
                  <div className="text-sm text-slate-300">
                    {new Date(session?.user?.last_sign_in_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tickets Section */}
        <div className="glass rounded-3xl p-8 border border-white/10 mt-2">
          <h2 className="text-2xl font-display font-bold mb-6">My Repair Tickets</h2>
          {loadingTickets ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-white/5 rounded-xl w-full"></div>
              <div className="h-16 bg-white/5 rounded-xl w-full"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-8 border border-white/5 rounded-2xl bg-white/5">
              <p className="text-slate-400">You have no repair tickets history.</p>
              <button onClick={() => navigate('/')} className="mt-4 text-aqua text-sm font-semibold hover:underline">
                Book a repair now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-white/10">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-aqua font-bold">{ticket.ticket_id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        ticket.status.toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        ticket.status.toLowerCase() === 'in progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="text-white font-semibold mb-1">{ticket.device}</div>
                    <div className="text-sm text-slate-400">{ticket.issue}</div>
                  </div>
                  <div className="text-sm text-slate-500 whitespace-nowrap">
                    Submitted on: {new Date(ticket.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="glass rounded-3xl p-8 border border-white/10 mt-2">
          <h2 className="text-2xl font-display font-bold mb-6">My Orders</h2>
          {loadingOrders ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-white/5 rounded-xl w-full"></div>
              <div className="h-20 bg-white/5 rounded-xl w-full"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-8 border border-white/5 rounded-2xl bg-white/5">
              <p className="text-slate-400">You haven't placed any orders yet.</p>
              <button onClick={() => navigate('/')} className="mt-4 text-aqua text-sm font-semibold hover:underline">
                Explore the Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-white/10">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-white/50 text-sm">Order #{order.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        order.status.toLowerCase() === 'delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        order.status.toLowerCase() === 'shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map(item => (
                        <div key={item.id} className="text-sm text-slate-300">
                          <span className="text-slate-500 mr-2">{item.quantity}x</span> 
                          {item.product_name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <div className="text-lg font-bold text-aqua mb-2">₹{Number(order.total_amount).toLocaleString()}</div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
