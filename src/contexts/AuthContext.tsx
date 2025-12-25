// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  jabatan: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, {
            headers: {
              'Authorization': `Token ${storedToken}`,
            },
          });

          if (!response.ok) {
            // Token invalid, clear auth
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error verifying token:', error);
        }
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.non_field_errors?.[0] || 'Login gagal');
      }

      const data = await response.json();
      
      // Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      router.push('/admin');
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}