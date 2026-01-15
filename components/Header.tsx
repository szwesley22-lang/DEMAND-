import React from 'react';
import { Zap, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-brand-900 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-1 text-brand-100 hover:text-white focus:outline-none"
            aria-label="Abrir menu"
          >
            <Menu size={28} />
          </button>
          
          <div className="bg-safety-yellow p-1.5 md:p-2 rounded-lg text-brand-900">
            <Zap size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">DEMAND+</h1>
            <p className="hidden md:block text-xs text-brand-100 font-medium opacity-80 uppercase tracking-wider">Controle Inteligente</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs md:text-sm text-brand-100 hidden sm:block">Sistema de Gestão de Manutenção</div>
          <div className="text-[10px] md:text-xs text-brand-300">v1.1.0</div>
        </div>
      </div>
    </header>
  );
};

export default Header;