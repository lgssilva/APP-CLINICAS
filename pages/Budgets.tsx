
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { useApp } from '../App';
import { Sparkles, Send, CheckCircle, FileText, Plus, Trash2, Calendar, User, Upload, Paperclip, X, Image as ImageIcon, File } from 'lucide-react';

const Budgets: React.FC = () => {
  const { brand, addNotification, patients } = useApp();
  const [patientName, setPatientName] = useState('Ana Silva');
  const [budgetDate, setBudgetDate] = useState(new Date().toISOString().split('T')[0]);
  const [procedure, setProcedure] = useState('Implante Dentário');
  const [items, setItems] = useState([
    { description: 'Pino de Titânio', price: 1200 },
    { description: 'Coroa em Porcelana', price: 1800 },
    { description: 'Mão de Obra Cirúrgica', price: 500 },
  ]);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  const [attachment, setAttachment] = useState<{name: string, data: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addItem = () => setItems([...items, { description: '', price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const total = items.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const handleSimplify = async () => {
    setIsLoading(true);
    const text = await geminiService.simplifyBudget(procedure, items);
    setExplanation(text);
    setIsLoading(false);
  };

  const handleApprove = () => {
    setIsApproved(true);
    const patientObj = patients.find(p => p.name.includes(patientName));
    
    // Notificação Clínica com Categoria BUDGET para ativar o Ticker e o ícone de aprovação no header
    addNotification(`Orçamento Aprovado: ${patientName} aceitou o plano para "${procedure}".`, 'success', patientObj, 'BUDGET');
    
    // Notificação de Faturamento
    addNotification(
      `URGENTE FATURAMENTO: Orçamento de €${total.toLocaleString('pt-PT')} aprovado por ${patientName}. Iniciar emissão de fatura/contrato.`, 
      'info', 
      patientObj,
      'BUDGET'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          name: file.name,
          data: reader.result as string,
          type: file.type
        });
        addNotification(`Documento "${file.name}" anexado.`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <FileText className="text-primary" size={20} /> Orçamento Clínico
          </h3>
          
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paciente</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                    />
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                  <input 
                    type="date"
                    value={budgetDate}
                    onChange={e => setBudgetDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                  />
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tratamento Principal</label>
              <input 
                value={procedure}
                onChange={e => setProcedure(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Procedimentos</label>
                <button onClick={addItem} className="text-[10px] font-black text-primary uppercase hover:bg-primary/5 px-2 py-1 rounded-lg">
                  + Adicionar Item
                </button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 group">
                  <input 
                    placeholder="Descrição"
                    value={item.description}
                    onChange={e => updateItem(idx, 'description', e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium"
                  />
                  <input 
                    type="number"
                    placeholder="€"
                    value={item.price}
                    onChange={e => updateItem(idx, 'price', e.target.value)}
                    className="w-24 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black"
                  />
                  <button onClick={() => removeItem(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Documentos & Exames (PDF/IMG)</label>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*, application/pdf" />
              
              {!attachment ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <Upload size={24} className="text-slate-300" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Incluir Anexo</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    {attachment.type.startsWith('image/') ? <ImageIcon size={18} className="text-primary" /> : <File size={18} className="text-primary" />}
                    <span className="text-xs font-black text-slate-600 truncate max-w-[150px]">{attachment.name}</span>
                  </div>
                  <button onClick={() => setAttachment(null)} className="p-1 hover:bg-rose-100 text-rose-500 rounded-lg">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Previsto</span>
              <span className="text-2xl font-black text-slate-800 tracking-tighter">€ {total.toLocaleString('pt-PT')}</span>
            </div>

            <button 
              onClick={handleSimplify}
              disabled={isLoading}
              className={`w-full py-4 bg-primary/5 text-primary border border-primary/20 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-primary/10 transition-all ${isLoading && 'opacity-50'}`}
            >
              <Sparkles size={18} /> {isLoading ? 'A Processar...' : 'Simplificar com IA'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex justify-center">
        <div className="bg-slate-900 rounded-[3.5rem] p-4 shadow-2xl relative overflow-hidden border-[12px] border-slate-800 w-full max-w-[360px] h-[720px]">
          <div className="bg-white rounded-[2.5rem] h-full overflow-y-auto no-scrollbar flex flex-col">
            <div className="p-8 bg-primary text-white shrink-0">
              <img src={brand.logoUrl} className="w-14 h-14 rounded-2xl mb-4 bg-white p-2 shadow-lg object-contain" alt="logo" />
              <h2 className="text-2xl font-black tracking-tight leading-tight">Olá, {patientName.split(' ')[0]}!</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Plano de Tratamento Digital</p>
            </div>

            <div className="p-6 flex-1 space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-1">
                   <Sparkles size={14} /> Entenda o seu Cuidado
                </h4>
                <div className="text-sm text-slate-600 leading-relaxed italic font-medium">
                  {explanation || "O seu médico está a preparar uma explicação simples para si..."}
                </div>
              </div>

              {attachment && (
                <div className="space-y-2">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Documentos Anexos</h4>
                   <div className="bg-white border border-slate-100 p-4 rounded-3xl flex items-center gap-4 shadow-sm">
                      {attachment.type.startsWith('image/') ? (
                        <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                          <img src={attachment.data} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <File size={24} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-black text-slate-800 truncate">{attachment.name}</p>
                         <p className="text-[8px] text-slate-400 font-bold uppercase">Toque para abrir</p>
                      </div>
                   </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Investimento Total</h4>
                <div className="flex justify-between items-center p-5 bg-slate-900 text-white rounded-[2rem] shadow-xl">
                   <span className="text-xs font-bold opacity-60">Valor Total</span>
                   <span className="text-2xl font-black tracking-tighter">€ {total.toLocaleString('pt-PT')}</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-50 shrink-0">
              {isApproved ? (
                <div className="bg-emerald-500 text-white py-5 rounded-[2rem] flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20">
                  <CheckCircle size={28} />
                  <span className="font-black text-lg">Proposta Aceite</span>
                </div>
              ) : (
                <button onClick={handleApprove} className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                  Aceitar com 1 Clique
                </button>
              )}
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-200/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
