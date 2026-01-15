import React, { useState, useMemo } from 'react';
import { SI, SIStatus, Demand, LOCATIONS, UserRole } from '../types';
import { Edit2, Trash2, Calendar, MapPin, Search, Filter, AlertTriangle, Link, Clock } from 'lucide-react';

interface SIListProps {
  sis: SI[];
  demands: Demand[];
  userRole: UserRole;
  onEdit: (si: SI) => void;
  onDelete: (id: string) => void;
}

const SIList: React.FC<SIListProps> = ({ sis, demands, userRole, onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: ''
  });

  const getStatusColor = (status: SIStatus) => {
    switch (status) {
      case SIStatus.VIGENTE: return 'bg-green-100 text-green-800 border-green-200';
      case SIStatus.EXPIRING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case SIStatus.EXPIRED: return 'bg-red-100 text-red-800 border-red-200';
      case SIStatus.EXTENDED: return 'bg-blue-100 text-blue-800 border-blue-200';
      case SIStatus.CLOSED: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getDemandOrder = (demandId: string) => {
    const demand = demands.find(d => d.id === demandId);
    return demand ? demand.serviceOrder : 'Não Vinculada';
  };

  const filteredSIs = useMemo(() => {
    let result = [...sis];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(s => 
        s.number.toLowerCase().includes(term) || 
        s.description.toLowerCase().includes(term) ||
        getDemandOrder(s.demandId).toLowerCase().includes(term)
      );
    }
    if (filters.status) {
      result = result.filter(s => s.status === filters.status);
    }
    if (filters.location) {
      result = result.filter(s => s.location === filters.location);
    }

    return result.sort((a, b) => {
      const statusPriority = {
        [SIStatus.EXPIRED]: 0,
        [SIStatus.EXPIRING]: 1,
        [SIStatus.VIGENTE]: 2,
        [SIStatus.EXTENDED]: 2,
        [SIStatus.CLOSED]: 3
      };
      
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      
      const dateA = new Date(a.newExpirationDate || a.expirationDate).getTime();
      const dateB = new Date(b.newExpirationDate || b.expirationDate).getTime();
      return dateA - dateB;
    });
  }, [sis, filters, demands]);

  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Filters Bar */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por Nº SI, OS ou descrição..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm text-gray-600 placeholder-gray-400"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <div className="grid grid-cols-2 md:flex gap-2 w-full">
          <select 
            className="w-full md:w-auto px-2 py-2 border border-gray-300 rounded-md text-xs md:text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none text-gray-600"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          >
            <option value="">Locais</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <select 
            className="w-full md:w-auto px-2 py-2 border border-gray-300 rounded-md text-xs md:text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none text-gray-600"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Status</option>
            {Object.values(SIStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button 
            onClick={() => setFilters({ search: '', status: '', location: '' })}
            className="w-full md:w-auto px-3 py-2 text-xs md:text-sm text-gray-500 border border-gray-200 rounded hover:bg-gray-50 font-medium whitespace-nowrap"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* SI Grid */}
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {filteredSIs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <Filter className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma SI</h3>
            <p className="text-gray-500 text-sm">Tente ajustar os filtros.</p>
          </div>
        ) : (
          filteredSIs.map(si => {
             const expirationDate = si.newExpirationDate || si.expirationDate;
             return (
              <div 
                key={si.id} 
                className={`bg-white rounded-lg shadow-sm border-l-4 p-4 md:p-5 hover:shadow-md transition-shadow relative ${
                  si.status === SIStatus.EXPIRED ? 'border-l-red-500' : 
                  si.status === SIStatus.EXPIRING ? 'border-l-yellow-500' :
                  si.status === SIStatus.EXTENDED ? 'border-l-blue-500' :
                  si.status === SIStatus.CLOSED ? 'border-l-gray-500' :
                  'border-l-green-500'
                }`}
              >
                {si.status === SIStatus.EXPIRED && (
                  <div className="absolute top-0 right-0 bg-red-100 text-red-700 px-2 py-0.5 md:px-3 md:py-1 rounded-bl-lg text-[10px] md:text-xs font-bold flex items-center gap-1">
                    <AlertTriangle size={10} className="md:w-3 md:h-3" />
                    VENCIDA
                  </div>
                )}
                 {si.status === SIStatus.EXPIRING && (
                  <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 px-2 py-0.5 md:px-3 md:py-1 rounded-bl-lg text-[10px] md:text-xs font-bold flex items-center gap-1">
                    <Clock size={10} className="md:w-3 md:h-3" />
                    VENCE BREVE
                  </div>
                )}

                <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-4 mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs text-gray-400 font-mono mb-0.5">NÚMERO DA SI</span>
                    <span className="font-mono font-bold text-base md:text-lg text-gray-800 break-all">{si.number}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:justify-end items-start">
                    <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold border ${getStatusColor(si.status)}`}>
                      {si.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-4">
                  <div className="md:col-span-8">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-600 mb-1">Atividade</h4>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{si.description}</p>
                    {si.demandId && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2 w-fit">
                        <Link size={12} />
                        <span className="font-semibold">Vinculado:</span> {getDemandOrder(si.demandId)}
                      </div>
                    )}
                    {si.status === SIStatus.EXTENDED && (
                       <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-blue-400">
                       <span className="font-semibold text-blue-600">Prorrog.:</span> {si.extensionJustification}
                     </div>
                    )}
                  </div>
                  <div className="md:col-span-4 space-y-1.5 md:space-y-2 text-sm text-gray-600 bg-gray-50 md:bg-transparent p-2 md:p-0 rounded">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="font-medium text-xs md:text-sm">{si.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs md:text-sm">Emissão: {formatDate(si.issueDate)}</span>
                    </div>
                    <div className={`flex items-center gap-2 font-medium ${
                        si.status === SIStatus.EXPIRED ? 'text-red-600' : 
                        si.status === SIStatus.EXPIRING ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                      <Clock size={14} />
                      <span className="text-xs md:text-sm">Vencimento: {formatDate(expirationDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer - Only for Admin */}
                {isAdmin && (
                  <div className="flex justify-end gap-2 md:gap-3 border-t pt-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(si);
                      }}
                      className="flex items-center gap-1 text-xs md:text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors bg-brand-50 px-3 py-1.5 rounded-md md:bg-transparent md:px-0 md:py-0"
                    >
                      <Edit2 size={14} className="md:w-4 md:h-4" /> Editar
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(si.id);
                      }}
                      className="flex items-center gap-1 text-xs md:text-sm text-red-500 hover:text-red-700 font-medium transition-colors bg-red-50 px-3 py-1.5 rounded-md md:bg-transparent md:px-0 md:py-0"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" /> Excluir
                    </button>
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

export default SIList;