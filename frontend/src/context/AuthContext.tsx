import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, FamilyRole } from '../types';
import { INITIAL_USER, INITIAL_MEMBERS } from '../data/seedData';

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (email: string, role?: FamilyRole) => void;
  logout: () => void;
  switchRole: (role: FamilyRole) => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('pennywise_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('pennywise_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchRole = (role: FamilyRole) => {
    const member = INITIAL_MEMBERS.find(m => m.role === role) || INITIAL_MEMBERS[0];
    const updated: User = {
      id: member.userId,
      name: member.name,
      email: member.email,
      phone: '+91 98765 43210',
      avatar: member.avatar,
      role: member.role,
      familyId: 'fam_sharma_01',
      currency: '₹',
      financialMonthStartDay: 1,
      monthlySalary: role === 'FamilyAdmin' ? 185000 : role === 'FinanceManager' ? 140000 : role === 'AdultMember' ? 45000 : undefined,
      salaryDate: 1,
      permissions: member.permissions,
    };
    setCurrentUser(updated);
  };

  const login = (email: string, role: FamilyRole = 'FamilyAdmin') => {
    switchRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateUser = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, switchRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

