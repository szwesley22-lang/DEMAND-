
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, PlusCircle, FileText, Activity, X, LogOut, Bell, BellOff } from 'lucide-react';
import { ViewState, UserRole } from '../types';
import { notificationService } from '../services/notificationService';

interface SidebarProps {
  currentView: ViewState;
  userRole: UserRole;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, userRole, onChangeView, isOpen, onClose, onLogout }) => {
  const [notifStatus, setNotifStatus] = useState<string>('default');

  useEffect(() => {
    setNotifStatus(notificationService.getPermissionStatus());
  }, []);

  const handleRequestNotif = async () => {
    const granted = await notificationService.requestPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    if (granted) {
      notificationService.send("Notificações Ativas", "Você receberá avisos sobre atualizações de demandas.");
    }
  };

  const menuItems = [
    { header: 'Gestão de Demandas' },
    { id: 'DASHBOARD' as ViewState, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'LIST' as ViewState, label: 'Todas Demandas', icon: List },
    { id: 'FORM' as ViewState, label: 'Nova Demanda', icon: PlusCircle, adminOnly: true },
    
    { header: 'Solicitação de Intervenção' },
    { id: 'SI_DASHBOARD' as ViewState, label: 'Painel SI', icon: Activity },
    { id: 'SI_LIST' as ViewState, label: 'Gerenciar SIs', icon: FileText },
    { id: 'SI_FORM' as ViewState, label: 'Nova SI', icon: PlusCircle, adminOnly: true },
  ];

  const handleItemClick = (id: ViewState) => {
    onChangeView(id);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-full pt-4 md:pt-6
        shadow-xl md:shadow-none
      `}>
        <div className="md:hidden px-4 mb-6 flex justify-between items-center">
          <span className="font-bold text-lg text-brand-900">Menu Principal</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-1 px-3 mb-6 overflow-y-auto custom-scrollbar flex-1">
          {menuItems.map((item, index) => {
            if (item.header) {
              return (
                <div key={`header-${index}`} className="px-4 pt-6 pb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.header}
                  </p>
                </div>
              );
            }

            if (item.adminOnly && userRole === 'VIEWER') {
              return null;
            }

            const Icon = item.icon!;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id!)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors touch-manipulation ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border-r-4 border-brand-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t space-y-2 bg-gray-50">
          {/* Notification Toggle */}
          {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
            <button
              onClick={handleRequestNotif}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 rounded-lg hover:bg-brand-100 transition-colors"
            >
              <Bell size={14} />
              Ativar Notificações
            </button>
          )}

          <div className="bg-brand-900 rounded-lg p-3 text-white shadow-sm">
            <p className="text-[10px] opacity-75 uppercase font-bold tracking-wider mb-1">Perfil de Acesso</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${userRole === 'ADMIN' ? 'bg-safety-yellow animate-pulse' : 'bg-blue-400'}`}></div>
              <span className="text-xs font-medium truncate">{userRole === 'ADMIN' ? 'Administrador' : 'Consulta (Leitura)'}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
