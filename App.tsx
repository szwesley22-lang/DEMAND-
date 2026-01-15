import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DemandList from './components/DemandList';
import DemandForm from './components/DemandForm';
import SIDashboard from './components/SIDashboard';
import SIList from './components/SIList';
import SIForm from './components/SIForm';
import Login from './components/Login';
import { Demand, ViewState, Status, SI, SIStatus, UserRole } from './types';
import { notificationService } from './services/notificationService';

const STORAGE_KEY = 'demand_plus_data_v1';
const STORAGE_KEY_SI = 'demand_plus_si_data_v1';
const AUTH_KEY = 'demand_plus_auth_session';
const ROLE_KEY = 'demand_plus_user_role';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [sis, setSIs] = useState<SI[]>([]);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [editingDemand, setEditingDemand] = useState<Demand | undefined>(undefined);
  const [editingSI, setEditingSI] = useState<SI | undefined>(undefined);
  
  // State for contextual filtering when navigating from Dashboard
  const [initialDemandFilter, setInitialDemandFilter] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic Helpers ---

  const updateSIStatus = (si: SI): SI => {
    if (si.status === SIStatus.CLOSED) return si;

    const dateString = si.newExpirationDate || si.expirationDate;
    if (!dateString) return si;

    const [year, month, day] = dateString.split('-').map(Number);
    const expiration = new Date(year, month - 1, day);
    expiration.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStatus = SIStatus.VIGENTE;

    if (diffDays < 0) {
      newStatus = SIStatus.EXPIRED;
    } else if (diffDays <= 3) {
      newStatus = SIStatus.EXPIRING;
    } else if (si.newExpirationDate) {
      newStatus = SIStatus.EXTENDED;
    }

    return { ...si, status: newStatus };
  };

  // --- Auth Check & Load Data ---
  useEffect(() => {
    const isAuth = localStorage.getItem(AUTH_KEY);
    const savedRole = localStorage.getItem(ROLE_KEY) as UserRole;
    
    if (isAuth === 'true' && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }

    const savedDemands = localStorage.getItem(STORAGE_KEY);
    if (savedDemands) {
      try {
        setDemands(JSON.parse(savedDemands));
      } catch (e) {
        console.error("Failed to load demands", e);
      }
    }

    const savedSIs = localStorage.getItem(STORAGE_KEY_SI);
    if (savedSIs) {
      try {
        const parsedSIs: SI[] = JSON.parse(savedSIs);
        const updatedSIs = parsedSIs.map(updateSIStatus);
        setSIs(updatedSIs);
      } catch (e) {
        console.error("Failed to load SIs", e);
      }
    }
  }, []);

  // --- Save Data ---
  useEffect(() => {
    if (demands.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demands));
    }
  }, [demands]);

  useEffect(() => {
    if (sis.length > 0 || localStorage.getItem(STORAGE_KEY_SI)) {
      localStorage.setItem(STORAGE_KEY_SI, JSON.stringify(sis));
    }
  }, [sis]);

  // --- Database Actions ---
  const handleExportData = () => {
    const data = {
      demands,
      sis,
      exportDate: new Date().toISOString(),
      version: '1.2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_demand_plus_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.demands && json.sis) {
          if (window.confirm("Isso irá substituir os dados atuais pelos dados do arquivo. Deseja continuar?")) {
            setDemands(json.demands);
            setSIs(json.sis.map(updateSIStatus));
            notificationService.send("Dados Importados", "O banco de dados foi atualizado via arquivo.");
            alert("Dados importados com sucesso!");
          }
        } else {
          alert("Arquivo inválido. Certifique-se de que é um backup do DEMAND+.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleClearDatabase = () => {
    if (userRole !== 'ADMIN') return;
    const confirm1 = window.confirm("ATENÇÃO: Você está prestes a apagar TODO o histórico de demandas e SIs. Esta ação é irreversível!");
    if (confirm1) {
      const confirm2 = window.prompt("Para confirmar a exclusão total, digite 'APAGAR TUDO':");
      if (confirm2 === 'APAGAR TUDO') {
        setDemands([]);
        setSIs([]);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY_SI);
        alert("Banco de dados limpo com sucesso.");
      } else {
        alert("Operação cancelada.");
      }
    }
  };

  // --- Auth Handlers ---
  const handleLoginSuccess = (role: UserRole) => {
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(ROLE_KEY, role);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
    setIsAuthenticated(false);
    setUserRole(null);
    setView('DASHBOARD');
  };

  // --- Demand Handlers ---
  const handleSaveDemand = (demand: Demand) => {
    if (userRole !== 'ADMIN') return;
    const isNew = !demands.find(d => d.id === demand.id);
    
    setDemands(prev => {
      const exists = prev.find(d => d.id === demand.id);
      if (exists) {
        return prev.map(d => d.id === demand.id ? demand : d);
      }
      return [demand, ...prev]; 
    });

    notificationService.send(
      isNew ? "Nova Demanda" : "Demanda Atualizada",
      `OS ${demand.serviceOrder} em ${demand.location}`
    );

    setEditingDemand(undefined);
    setView('LIST');
  };

  const handleDeleteDemand = (id: string) => {
    if (userRole !== 'ADMIN') return;
    const demand = demands.find(d => d.id === id);
    if (window.confirm("Tem certeza que deseja excluir esta demanda?")) {
      setDemands(prev => prev.filter(d => d.id !== id));
      notificationService.send("Demanda Excluída", `A OS ${demand?.serviceOrder} foi removida.`);
    }
  };

  const handleCompleteDemand = (id: string) => {
    if (userRole !== 'ADMIN') return;
    const demand = demands.find(d => d.id === id);
    const linkedSI = sis.find(s => s.demandId === id && s.status !== SIStatus.CLOSED);
    
    if (linkedSI) {
        if (linkedSI.status === SIStatus.EXPIRED) {
            alert(`BLOQUEADO: A SI vinculada (${linkedSI.number}) está VENCIDA. Não é possível executar a demanda.`);
            return;
        }
    } else {
        if(!window.confirm("AVISO: Não foi encontrada uma SI ativa vinculada a esta demanda. Deseja prosseguir mesmo assim?")) {
            return;
        }
    }

    if (window.confirm("Deseja dar baixa e marcar esta demanda como CONCLUÍDA?")) {
      setDemands(prev => prev.map(d => 
        d.id === id ? { ...d, status: Status.COMPLETED } : d
      ));
      notificationService.send("Demanda Concluída", `OS ${demand?.serviceOrder} finalizada com sucesso.`);
    }
  };

  const handleEditDemand = (demand: Demand) => {
    if (userRole !== 'ADMIN') return;
    setEditingDemand(demand);
    setView('FORM');
  };

  const handleCancelForm = () => {
    setEditingDemand(undefined);
    setView('LIST');
  };

  // --- SI Handlers ---
  const handleSaveSI = (si: SI) => {
    if (userRole !== 'ADMIN') return;
    const isNew = !sis.find(s => s.id === si.id);
    const processedSI = updateSIStatus(si);
    setSIs(prev => {
      const exists = prev.find(s => s.id === si.id);
      if (exists) {
        return prev.map(s => s.id === si.id ? processedSI : s);
      }
      return [processedSI, ...prev];
    });

    notificationService.send(
      isNew ? "Nova SI Criada" : "SI Atualizada",
      `Nº ${si.number} - Status: ${si.status}`
    );

    setEditingSI(undefined);
    setView('SI_LIST');
  };

  const handleDeleteSI = (id: string) => {
    if (userRole !== 'ADMIN') return;
    if (window.confirm("Tem certeza que deseja excluir esta SI permanentemente?")) {
      setSIs(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEditSI = (si: SI) => {
    if (userRole !== 'ADMIN') return;
    setEditingSI(si);
    setView('SI_FORM');
  };

  const handleCancelSIForm = () => {
    setEditingSI(undefined);
    setView('SI_LIST');
  };

  // --- View Switcher Logic ---
  const handleViewChange = (v: ViewState) => {
    if (userRole === 'VIEWER' && (v === 'FORM' || v === 'SI_FORM')) return;
    if (v === 'FORM') setEditingDemand(undefined);
    if (v === 'SI_FORM') setEditingSI(undefined);
    
    // If navigating from sidebar, reset contextual filters
    if (v === 'LIST') setInitialDemandFilter(''); 
    
    setView(v);
  };

  const handleDashboardNavigate = (filter: string) => {
    setInitialDemandFilter(filter);
    setView('LIST');
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        accept=".json" 
        className="hidden" 
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          currentView={view} 
          userRole={userRole!}
          onChangeView={handleViewChange} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar w-full">
          <div className="max-w-6xl mx-auto pb-10">
            {view === 'DASHBOARD' && (
              <Dashboard 
                demands={demands} 
                userRole={userRole!}
                onExport={handleExportData}
                onImport={handleImportClick}
                onClearAll={handleClearDatabase}
                onNavigate={handleDashboardNavigate}
              />
            )}
            {view === 'LIST' && (
              <DemandList 
                demands={demands} 
                userRole={userRole!} 
                initialStatusFilter={initialDemandFilter}
                onEdit={handleEditDemand} 
                onDelete={handleDeleteDemand} 
                onComplete={handleCompleteDemand} 
              />
            )}
            {view === 'FORM' && <DemandForm initialData={editingDemand} onSave={handleSaveDemand} onCancel={handleCancelForm} />}

            {view === 'SI_DASHBOARD' && <SIDashboard sis={sis} />}
            {view === 'SI_LIST' && <SIList sis={sis} demands={demands} userRole={userRole!} onEdit={handleEditSI} onDelete={handleDeleteSI} />}
            {view === 'SI_FORM' && <SIForm initialData={editingSI} demands={demands} onSave={handleSaveSI} onCancel={handleCancelSIForm} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;