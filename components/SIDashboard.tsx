import React, { useMemo } from 'react';
import { SI, SIStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, FileText, AlertOctagon } from 'lucide-react';

interface SIDashboardProps {
  sis: SI[];
}

const COLORS_SI_STATUS = {
  [SIStatus.VIGENTE]: '#10b981', // Emerald-500
  [SIStatus.EXPIRING]: '#fbbf24', // Amber-400
  [SIStatus.EXPIRED]: '#ef4444', // Red-500
  [SIStatus.EXTENDED]: '#3b82f6', // Blue-500
  [SIStatus.CLOSED]: '#64748b', // Slate-500
};

const SIDashboard: React.FC<SIDashboardProps> = ({ sis }) => {
  const stats = useMemo(() => {
    const total = sis.length;
    const active = sis.filter(s => s.status === SIStatus.VIGENTE || s.status === SIStatus.EXTENDED).length;
    const expiring = sis.filter(s => s.status === SIStatus.EXPIRING).length;
    const expired = sis.filter(s => s.status === SIStatus.EXPIRED).length;
    const closed = sis.filter(s => s.status === SIStatus.CLOSED).length;

    return { total, active, expiring, expired, closed };
  }, [sis]);

  const statusData = useMemo(() => {
    return Object.values(SIStatus).map(st => ({
      name: st,
      value: sis.filter(d => d.status === st).length,
      color: COLORS_SI_STATUS[st]
    })).filter(d => d.value > 0);
  }, [sis]);

  const locationData = useMemo(() => {
    const locMap: Record<string, number> = {};
    sis.forEach(s => {
      locMap[s.location] = (locMap[s.location] || 0) + 1;
    });
    return Object.keys(locMap)
      .map(k => ({ name: k, value: locMap[k], color: '#0ea5e9' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 locations
  }, [sis]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b pb-2">Painel de SIs</h2>

      {/* KPI Cards - Grid 2 cols for mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-start gap-1">
          <div className="flex justify-between w-full">
            <p className="text-xs md:text-sm font-medium text-gray-500">Ativas</p>
            <CheckCircle size={18} className="text-green-600 md:hidden" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.active}</p>
          <p className="text-[10px] md:text-xs text-gray-400">Vigentes/Prorrog.</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-start gap-1">
          <div className="flex justify-between w-full">
            <p className="text-xs md:text-sm font-medium text-gray-500">A Vencer</p>
            <Clock size={18} className="text-yellow-600 md:hidden" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-yellow-500">{stats.expiring}</p>
          <p className="text-[10px] md:text-xs text-gray-400">&lt; 5 dias</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-red-100 flex flex-col items-start gap-1">
           <div className="flex justify-between w-full">
            <p className="text-xs md:text-sm font-medium text-gray-500">Vencidas</p>
            <AlertOctagon size={18} className="text-red-600 md:hidden" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.expired}</p>
          <p className="text-[10px] md:text-xs text-gray-400">Urgente</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-start gap-1">
           <div className="flex justify-between w-full">
            <p className="text-xs md:text-sm font-medium text-gray-500">Fechadas</p>
            <FileText size={18} className="text-slate-600 md:hidden" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-600">{stats.closed}</p>
          <p className="text-[10px] md:text-xs text-gray-400">Encerradas</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Status das SIs</h3>
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
          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">Top Locais</h3>
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} />
                <BarTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIDashboard;