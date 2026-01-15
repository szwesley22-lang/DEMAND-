import React, { useState } from 'react';
import { Zap, Lock, ArrowRight, AlertCircle, ShieldCheck, Eye } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const CODES = {
    ADMIN: '147258369',
    VIEWER: '2201'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessCode === CODES.ADMIN) {
      setError('');
      onLoginSuccess('ADMIN');
    } else if (accessCode === CODES.VIEWER) {
      setError('');
      onLoginSuccess('VIEWER');
    } else {
      setError('Código inválido. Acesso não autorizado.');
      setAccessCode('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        <div className="bg-brand-900 p-8 text-center">
          <div className="bg-safety-yellow w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 text-brand-900">
            <Zap size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DEMAND+</h1>
          <p className="text-brand-100 text-sm opacity-80 uppercase tracking-wider mt-1">Acesso ao Sistema</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Código de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  id="accessCode"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors outline-none"
                  placeholder="Digite o código..."
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Acessar Sistema
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
              <ShieldCheck size={16} className="mx-auto mb-1 text-brand-600" />
              <p className="text-[10px] text-gray-500 font-bold uppercase">Admin</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
              <Eye size={16} className="mx-auto mb-1 text-gray-400" />
              <p className="text-[10px] text-gray-500 font-bold uppercase">Consulta</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-300">v1.1.0 | Segurança Industrial</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;