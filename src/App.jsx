import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Storefront from './Storefront';
import Auth from './Auth';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import UpdatePassword from './UpdatePassword';

export default function App() {
  const [session, setSession] = useState(null);
  const [requiresPasswordUpdate, setRequiresPasswordUpdate] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setRequiresPasswordUpdate(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      {requiresPasswordUpdate && <UpdatePassword onPasswordUpdated={() => setRequiresPasswordUpdate(false)} />}
      <Routes>
        <Route path="/" element={<Storefront session={session} />} />
        <Route path="/login" element={<Auth />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard session={session} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
