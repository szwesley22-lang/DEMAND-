
import React, { useState, useEffect } from 'react';
import { Demand, Difficulty, Status, LOCATIONS } from '../types';
import { Save, X, Sparkles, Loader2 } from 'lucide-react';
import { enhanceDescription } from '../services/geminiService';

interface DemandFormProps {
  initialData?: Demand;
  onSave: (demand: Demand) => void;
  onCancel: () => void;
}

const DemandForm: React.FC<DemandFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Demand>>({
    openingDate: new Date().toISOString().split('T')[0],
    deadline: '',
    difficulty: Difficulty.LOW,
    location: '',
    serviceOrder: '',
    description: '',
    status: Status.NOT_STARTED,
    observation: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.openingDate || !formData.deadline || !formData.location || !formData.serviceOrder || !formData.description) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    const demandToSave: Demand = {
      id: initialData?.id || crypto.randomUUID(),
      openingDate: formData.openingDate!,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      deadline: formData.deadline!,
      difficulty: formData.difficulty as Difficulty,
      location: formData.location!,
      serviceOrder: formData.serviceOrder!,
      description: formData.description!,
      status: formData.status as Status,
      observation: formData.observation || '',
    };
    onSave(demandToSave);
  };

  const handleAIEnhance = async () => {
    if (!formData.description) return;
    
    setIsGenerating(true);
    const enhanced = await enhanceDescription(formData.description, formData.location || 'Instalação Elétrica Geral');
    setFormData(prev => ({ ...prev, description: enhanced }));
    setIsGenerating(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in max-w-4xl mx-auto">
      <div className="bg-brand-800 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-white font-semibold text-base md:text-lg">
          {initialData ? 'Editar Demanda' : 'Nova Demanda'}
        </h2>
        <button onClick={onCancel} className="text-brand-100 hover:text-white transition-colors p-1">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de Serviço (OS) *</label>
            <input
              type="text"
              name="serviceOrder"
              value={formData.serviceOrder}
              onChange={handleChange}
              placeholder="Ex: FACTASK0016135"
              className="w-full px-4 py-3 md:py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-brand-500 outline-none uppercase font-mono tracking-wide text-base placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Abertura *</label>
            <input
              type="date"
              name="openingDate"
              value={formData.openingDate}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo *</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local *</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
              required
            >
              <option value="">Selecione o local</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade *</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
            >
              {Object.values(Difficulty).map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
            >
              {Object.values(Status).map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Reparo / Descrição *</label>
            <button
              type="button"
              onClick={handleAIEnhance}
              disabled={isGenerating || !formData.description}
              className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-800 disabled:opacity-50 transition-colors bg-brand-50 px-2 py-1 rounded border border-brand-100"
              title="Melhorar descrição com IA"
            >
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Refinar com IA
            </button>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm placeholder-gray-500"
            placeholder="Descreva detalhadamente o serviço..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="observation"
            value={formData.observation}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm text-gray-700"
            placeholder="Observações adicionais..."
          />
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="w-full md:w-auto px-6 py-3 md:py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 md:py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Save size={18} />
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default DemandForm;
