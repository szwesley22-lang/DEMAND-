import React, { useState, useMemo, useEffect } from 'react';
import { Demand, Difficulty, Status, UserRole } from '../types';
import { Edit2, Trash2, MapPin, Search, Filter, Clock, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';

interface DemandListProps {
  demands: Demand[];
  userRole: UserRole;
  initialStatusFilter?: string;
  onEdit: (demand: Demand) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const DemandList: React.FC<DemandListProps> = ({ demands, userRole, initialStatusFilter, onEdit, onDelete, onComplete }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: initialStatusFilter || '',
    difficulty: '',
    location: ''
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (initialStatusFilter !== undefined) {
      setFilters(prev => ({ ...prev, status: initialStatusFilter }));
    }
  }, [initialStatusFilter]);

  const handleCopyToClipboard = (demand: Demand) => {
    const text = `🔧 MANUTENÇÃO CONCLUÍDA\nDescrição: ${demand.description}\nOS: ${demand.serviceOrder}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(demand.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Criado há pouco';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Criado há ${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Criado há ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Criado há ${diffInDays}d`;
  };

  const uniqueLocations = useMemo(() => Array.from(new Set(demands.map(d => d.location))), [demands]);

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.LOW: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">{diff}</span>;
      case Difficulty.MEDIUM: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 uppercase">{diff}</span>;
      case Difficulty.HIGH: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase">{diff}</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case Status.COMPLETED: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 uppercase">{status}</span>;
      case Status.IN_PROGRESS: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">{status}</span>;
      case Status.REQUEST_CALL: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase">CHAMADO</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">{status}</span>;
    }
  };

  const isOverdue = (deadline: string, status: Status) => {
    if (status === Status.COMPLETED) return false;
    const d = new Date(deadline);
    const today = new Date();
    d.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return d < today;
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredAndSortedDemands = useMemo(() => {
    let result = [...demands];
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(d => d.serviceOrder.toLowerCase().includes(term) || d.description.toLowerCase().includes(term));
    }
    if (filters.status) {
      if (filters.status === 'PENDING') result = result.filter(d => d.status !== Status.COMPLETED);
      else if (filters.status === 'OVERDUE') result = result.filter(d => isOverdue(d.deadline, d.status));
      else result = result.filter(d => d.status === filters.status);
    }
    if (filters.difficulty) result = result.filter(d => d.difficulty === filters.difficulty);
    if (filters.location) result = result.filter(d => d.location === filters.location);
    
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.openingDate).getTime();
      const timeB = new Date(b.createdAt || b.openingDate).getTime();
      return timeB - timeA;
    });
    return result;
  }, [demands, filters]);

  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por OS ou descrição..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm text-gray-600 placeholder-gray-400"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 md:flex gap-2 w-full">
          <select className="w-full md:w-auto px-2 py-2 border border-gray-300 rounded-md text-xs md:text-sm bg-white text-gray-600 outline-none" value={filters.location} onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}>
            <option value="">Locais</option>
            {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select className="w-full md:w-auto px-2 py-2 border border-gray-300 rounded-md text-xs md:text-sm bg-white text-gray-600 outline-none" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
            <option value="">Status</option>
            <option value="PENDING">EM ABERTO</option>
            <option value="OVERDUE">VENCIDAS</option>
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="w-full md:w-auto px-2 py-2 border border-gray-300 rounded-md text-xs md:text-sm bg-white text-gray-600 outline-none" value={filters.difficulty} onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}>
            <option value="">Dificuldade</option>
            {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button onClick={() => setFilters({ search: '', status: '', difficulty: '', location: '' })} className="w-full md:w-auto px-3 py-2 text-xs md:text-sm text-gray-500 border border-gray-200 rounded hover:bg-gray-50 font-medium">
            Limpar
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredAndSortedDemands.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <Filter className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm font-medium">Nenhuma demanda encontrada.</p>
          </div>
        ) : (
          filteredAndSortedDemands.map(demand => {
            const overdue = isOverdue(demand.deadline, demand.status);
            const timeAgo = getTimeAgo(demand.createdAt);
            const isCompleted = demand.status === Status.COMPLETED;

            return (
              <div 
                key={demand.id} 
                className={`bg-white rounded-lg shadow-sm border border-gray-100 relative overflow-hidden transition-all
                  ${overdue ? 'border-l-4 border-l-red-500' : isCompleted ? 'border-l-4 border-l-green-500 opacity-90' : 'border-l-4 border-l-brand-500'}
                `}
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">OS</span>
                        {timeAgo && <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-1.5 rounded">{timeAgo}</span>}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">{demand.serviceOrder}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:self-start">
                      {getDifficultyBadge(demand.difficulty)}
                      {getStatusBadge(demand.status)}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mb-2">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Descrição</span>
                      <p className="text-gray-800 text-sm font-medium leading-relaxed">{demand.description}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end justify-center gap-2 min-w-[160px]">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-xs font-semibold uppercase">{demand.location}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                        <Clock size={14} className={overdue ? 'text-red-500' : 'text-gray-400'} />
                        <span className="text-xs font-medium">Prazo: {formatDate(demand.deadline)}</span>
                      </div>
                    </div>
                  </div>

                  {/* BOX MANUTENÇÃO CONCLUÍDA */}
                  {isCompleted && (
                    <div className="mt-4 bg-slate-900 border-l-4 border-green-500 rounded-r-lg p-3 md:p-4 relative group shadow-lg">
                      <div className="flex flex-col gap-1 pr-10">
                        <span className="text-green-400 font-bold text-xs md:text-sm flex items-center gap-2">
                          🔧 MANUTENÇÃO CONCLUÍDA
                        </span>
                        <div className="text-slate-100 text-[11px] md:text-xs font-mono space-y-1 mt-1">
                          <p><span className="text-slate-400">Descrição:</span> {demand.description}</p>
                          <p><span className="text-slate-400">OS:</span> {demand.serviceOrder}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleCopyToClipboard(demand)}
                        className={`absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-md transition-all flex flex-col items-center gap-1
                          ${copiedId === demand.id ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}
                        `}
                        title="Copiar mensagem de fechamento"
                      >
                        {copiedId === demand.id ? <Check size={18} /> : <Copy size={18} />}
                        <span className="text-[8px] font-bold uppercase">{copiedId === demand.id ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                {isAdmin && (
                  <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                    {!isCompleted ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onComplete(demand.id); }}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-bold text-sm transition-colors group w-full sm:w-auto justify-center"
                      >
                        <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                        Concluir Atividade
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 text-xs font-black uppercase tracking-widest w-full sm:w-auto justify-center">
                        <CheckCircle size={16} /> Finalizada
                      </div>
                    )}

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(demand); }} className="flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium text-xs">
                        <Edit2 size={14} /> Editar
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(demand.id); }} className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium text-xs">
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DemandList;