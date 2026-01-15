import React, { useState, useEffect } from 'react';
import { SI, SIStatus, LOCATIONS, Demand } from '../types';
import { Save, X, Calendar, AlertCircle } from 'lucide-react';

interface SIFormProps {
  initialData?: SI;
  demands: Demand[];
  onSave: (si: SI) => void;
  onCancel: () => void;
}

const SIForm: React.FC<SIFormProps> = ({ initialData, demands, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<SI>>({
    number: '',
    demandId: '',
    location: '',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    status: SIStatus.VIGENTE,
    responsible: '',
    responsibleArea: '',
    observations: '',
    newExpirationDate: '',
    extensionJustification: ''
  });

  const [isExtensionMode, setIsExtensionMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.status === SIStatus.EXTENDED || initialData.newExpirationDate) {
        setIsExtensionMode(true);
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExtensionToggle = () => {
    setIsExtensionMode(!isExtensionMode);
    if (!isExtensionMode) {
      // Enabling extension
      setFormData(prev => ({
        ...prev,
        status: SIStatus.EXTENDED
      }));
    } else {
      // Disabling extension (revert logic if needed, or just hide fields)
      setFormData(prev => ({
        ...prev,
        newExpirationDate: '',
        extensionJustification: '',
        status: SIStatus.VIGENTE // Reset to standard, calculation will fix it later if expired
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.location || !formData.expirationDate || !formData.responsible) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (isExtensionMode && (!formData.newExpirationDate || !formData.extensionJustification)) {
      alert("Para prorrogação, a nova data e a justificativa são obrigatórias.");
      return;
    }
    
    // Status Logic will be re-verified by App.tsx, but we set basic flags here
    let finalStatus = formData.status;
    if (isExtensionMode && formData.newExpirationDate) {
      finalStatus = SIStatus.EXTENDED;
    } else if (formData.status === SIStatus.CLOSED) {
      finalStatus = SIStatus.CLOSED;
    }

    const siToSave: SI = {
      id: initialData?.id || crypto.randomUUID(),
      number: formData.number!,
      demandId: formData.demandId || '',
      location: formData.location!,
      description: formData.description || '',
      issueDate: formData.issueDate!,
      expirationDate: formData.expirationDate!,
      status: finalStatus as SIStatus,
      responsible: formData.responsible!,
      responsibleArea: formData.responsibleArea || '',
      observations: formData.observations || '',
      
      // Extension data
      newExpirationDate: isExtensionMode ? formData.newExpirationDate : undefined,
      extensionJustification: isExtensionMode ? formData.extensionJustification : undefined,
      extensionDate: isExtensionMode && !initialData?.extensionDate ? new Date().toISOString().split('T')[0] : initialData?.extensionDate
    };
    
    onSave(siToSave);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in max-w-4xl mx-auto">
      <div className="bg-brand-800 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-white font-semibold text-base md:text-lg">
          {initialData ? 'Editar SI' : 'Nova SI'}
        </h2>
        <button onClick={onCancel} className="text-brand-100 hover:text-white transition-colors p-1">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
        
        {/* Status Alert if needed */}
        {initialData && (
          <div className="bg-gray-50 p-3 md:p-4 rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
             <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 text-sm">Status Atual:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  formData.status === SIStatus.VIGENTE ? 'bg-green-100 text-green-700' :
                  formData.status === SIStatus.EXPIRING ? 'bg-yellow-100 text-yellow-700' :
                  formData.status === SIStatus.EXPIRED ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{formData.status}</span>
             </div>
             
             <div className="flex items-center gap-4 w-full sm:w-auto">
               <label className="flex items-center gap-2 cursor-pointer w-full sm:w-auto p-2 sm:p-0 bg-white sm:bg-transparent rounded border sm:border-0">
                  <input 
                    type="checkbox" 
                    checked={formData.status === SIStatus.CLOSED}
                    onChange={(e) => setFormData(prev => ({...prev, status: e.target.checked ? SIStatus.CLOSED : SIStatus.VIGENTE}))}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Encerrar SI</span>
               </label>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* Main Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número da SI *</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="Ex: SI-2025-0145"
              className="w-full px-4 py-3 md:py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-brand-500 outline-none uppercase font-mono placeholder-gray-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Demanda Vinculada</label>
            <select
              name="demandId"
              value={formData.demandId}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
            >
              <option value="">Sem vínculo</option>
              {demands.map(d => (
                <option key={d.id} value={d.id}>{d.serviceOrder} - {d.location}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Vincular a uma demanda existente.</p>
          </div>

          <div>
             {/* Spacer */}
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão *</label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento *</label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Atividade</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-brand-500 outline-none placeholder-gray-500"
            placeholder="Descreva a atividade a ser executada..."
          />
        </div>

        {/* Extension Module */}
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 md:p-4">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
             <h3 className="font-semibold text-blue-800 flex items-center gap-2">
               <Calendar size={18} />
               Controle de Prorrogação
             </h3>
             <label className="flex items-center gap-2 cursor-pointer p-2 md:p-0 bg-white md:bg-transparent rounded w-full md:w-auto border md:border-0">
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isExtensionMode ? 'bg-blue-600' : 'bg-gray-300'}`} onClick={handleExtensionToggle}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isExtensionMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Prorrogar SI</span>
             </label>
           </div>
           
           {isExtensionMode && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Novo Vencimento *</label>
                  <input
                    type="date"
                    name="newExpirationDate"
                    value={formData.newExpirationDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 md:py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
                    required={isExtensionMode}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-900 mb-1">Justificativa da Prorrogação *</label>
                  <textarea
                    name="extensionJustification"
                    value={formData.extensionJustification}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
                    placeholder="Motivo da prorrogação..."
                    required={isExtensionMode}
                  />
                </div>
             </div>
           )}
        </div>

        {/* Responsibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-2 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável pela SI *</label>
            <input
              type="text"
              name="responsible"
              value={formData.responsible}
              onChange={handleChange}
              placeholder="Nome do responsável"
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área / Empresa</label>
            <input
              type="text"
              name="responsibleArea"
              value={formData.responsibleArea}
              onChange={handleChange}
              placeholder="Ex: Manutenção / Terceirizada"
              className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações Gerais</label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-700"
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

export default SIForm;