import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  registerDoctor: (user: User, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuthUsers: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@clinic.com',
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@clinic.com',
      name: 'Dr. Admin',
      role: 'admin' as UserRole,
      createdAt: new Date(),
    },
  },
  {
    email: 'doctor@clinic.com',
    password: 'doctor123',
    user: {
      id: '2',
      email: 'doctor@clinic.com',
      name: 'Dr. Sarah Johnson',
      role: 'doctor' as UserRole,
      specialization: 'General Medicine',
      phone: '+1 234 567 890',
      createdAt: new Date(),
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (raw) {
        return JSON.parse(raw) as User;
      }
    } catch {}
    return null;
  });
  const [authUsers, setAuthUsers] = useState<{ email: string; password: string; user: User }[]>(() => {
    try {
      const raw = localStorage.getItem('auth_users');
      if (raw) {
        const parsed = JSON.parse(raw) as { email: string; password: string; user: User }[];
        return parsed;
      }
    } catch {}
    return initialAuthUsers;
  });

  useEffect(() => {
    try {
      localStorage.setItem('auth_users', JSON.stringify(authUsers));
    } catch {}
  }, [authUsers]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = authUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      setUser(foundUser.user);
      try {
        localStorage.setItem('auth_user', JSON.stringify(foundUser.user));
      } catch {}
      return true;
    }
    return false;
  };

  const registerDoctor = (doctorUser: User, password: string) => {
    setAuthUsers([...authUsers, { email: doctorUser.email, password, user: doctorUser }]);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('auth_user');
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, registerDoctor }}
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
