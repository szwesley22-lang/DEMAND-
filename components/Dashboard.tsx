import React, { useMemo } from 'react';
import { Demand, Status, Difficulty, UserRole } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, List, Database, Download, Upload, Trash2, ShieldAlert, ShieldCheck, Eye, Info, ChevronRight } from 'lucide-react';

interface DashboardProps {
  demands: Demand[];
  userRole: UserRole;
  onExport: () => void;
  onImport: () => void;
  onClearAll: () => void;
  onNavigate: (filter: string) => void;
}

const COLORS_DIFFICULTY = {
  [Difficulty.LOW]: '#22c55e', // Green-500
  [Difficulty.MEDIUM]: '#fbbf24', // Amber-400
  [Difficulty.HIGH]: '#ef4444', // Red-500
};

const COLORS_STATUS = {
  [Status.NOT_STARTED]: '#94a3b8', // Slate-400
  [Status.REQUEST_CALL]: '#f97316', // Orange-500
  [Status.IN_PROGRESS]: '#3b82f6', // Blue-500
  [Status.COMPLETED]: '#10b981', // Emerald-500
};

const Dashboard: React.FC<DashboardProps> = ({ demands, userRole, onExport, onImport, onClearAll, onNavigate }) => {
  const stats = useMemo(() => {
    const total = demands.length;
    const completed = demands.filter(d => d.status === Status.COMPLETED).length;
    const pending = demands.filter(d => d.status !== Status.COMPLETED).length;
    const overdue = demands.filter(d => {
      const isOverdue = new Date(d.deadline) < new Date() && new Date(d.deadline).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);
      return isOverdue && d.status !== Status.COMPLETED;
    }).length;

    return { total, completed, pending, overdue };
  }, [demands]);

  const difficultyData = useMemo(() => {
    return Object.values(Difficulty).map(diff => ({
      name: diff,
      value: demands.filter(d => d.difficulty === diff).length,
      color: COLORS_DIFFICULTY[diff]
    })).filter(d => d.value > 0);
  }, [demands]);

  const statusData = useMemo(() => {
    return Object.values(Status).map(st => ({
      name: st,
      value: demands.filter(d => d.status === st).length,
      color: COLORS_STATUS[st]
    })).filter(d => d.value > 0);
  }, [demands]);

  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">Painel de Controle</h2>
          {isAdmin ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-50 border border-brand-100 rounded text-brand-700 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
              <ShieldCheck size={12} className="text-brand-600" />
              Administrador
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-gray-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
              <Eye size={12} />
              Consulta
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Database size={14} />
          Local DB
        </div>
      </div>

      {/* Access Status - Subtle version */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2 rounded border border-gray-100 shadow-sm px-4">
        {isAdmin ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>Você está navegando com <strong>permissão total</strong> para edição e gestão.</span>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span>Navegação em <strong>modo leitura</strong>. Ações de criação e edição estão desativadas.</span>
          </>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div 
          onClick={() => onNavigate('')}
          className="cursor-pointer group bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:border-brand-300 transition-all hover:shadow-md"
        >
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total</p>
            <p className="text-2xl md:text-3xl font-bold text-brand-900">{stats.total}</p>
          </div>
          <div className="p-2 md:p-3 bg-brand-50 rounded-full text-brand-600 self-end md:self-center group-hover:bg-brand-100">
            <List size={20} className="md:w-6 md:h-6" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('PENDING')}
          className="cursor-pointer group bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:border-blue-300 transition-all hover:shadow-md"
        >
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Em Aberto</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.pending}</p>
              <ChevronRight size={14} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="p-2 md:p-3 bg-blue-50 rounded-full text-blue-600 self-end md:self-center group-hover:bg-blue-100">
            <Clock size={20} className="md:w-6 md:h-6" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate(Status.COMPLETED)}
          className="cursor-pointer group bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:border-green-300 transition-all hover:shadow-md"
        >
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Concluídas</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.completed}</p>
              <ChevronRight size={14} className="text-green-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="p-2 md:p-3 bg-green-50 rounded-full text-green-600 self-end md:self-center group-hover:bg-green-100">
            <CheckCircle size={20} className="md:w-6 md:h-6" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('OVERDUE')}
          className="cursor-pointer group bg-white p-4 md:p-6 rounded-lg shadow-sm border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:border-red-300 transition-all hover:shadow-md"
        >
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Vencidas</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.overdue}</p>
              <ChevronRight size={14} className="text-red-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="p-2 md:p-3 bg-red-50 rounded-full text-red-600 self-end md:self-center group-hover:bg-red-100">
            <AlertTriangle size={20} className="md:w-6 md:h-6" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Demandas por Status</h3>
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-gray-600 truncate">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Dificuldade</h3>
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 11}} />
                <BarTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Admin Persistence Controls */}
      {isAdmin && (
        <div className="mt-8 bg-white p-6 rounded-lg border-2 border-dashed border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-900 p-2 rounded-md text-white">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Gestão de Banco de Dados</h3>
              <p className="text-xs text-gray-500">Ações administrativas para manutenção e backup de dados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={onExport}
              className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-lg text-brand-700 font-bold hover:bg-brand-50 transition-colors shadow-sm"
            >
              <Download size={18} />
              Exportar Backup (.JSON)
            </button>
            <button 
              onClick={onImport}
              className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-lg text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Upload size={18} />
              Importar Backup
            </button>
            <button 
              onClick={onClearAll}
              className="flex items-center justify-center gap-2 p-4 bg-white border border-red-200 rounded-lg text-red-600 font-bold hover:bg-red-50 transition-colors shadow-sm"
            >
              <Trash2 size={18} />
              Limpeza Total do Sistema
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-100 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-normal">
              <strong>Nota:</strong> O sistema utiliza armazenamento local do navegador. Para garantir a segurança dos dados em caso de troca de computador ou limpeza do cache, realize exportações de backup regularmente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;