
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { Palette, MessageCircle, CreditCard, Save, Smartphone, CheckCircle2, Upload, Image as ImageIcon, Stethoscope, Briefcase, Zap, Info, ShieldCheck, Activity, Terminal, Key } from 'lucide-react';

const Settings: React.FC = () => {
  const { brand, setBrand, addNotification } = useApp();
  const [testPhone, setTestPhone] = useState('+351 ');
  const [isApiLoading, setIsApiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTestWhatsApp = async () => {
    setIsApiLoading(true);
    addNotification("A testar conetividade com a Meta...", "info");
    
    // Simulação de resposta da API para o teste de interface
    setTimeout(() => {
      setIsApiLoading(false);
      addNotification("Teste concluído: Erro 401 (Credenciais Pendentes). Utilize o link manual como fallback.", "warning");
      
      const msg = `Teste de Integração ClinicaPro: Sistema configurado com sucesso!`;
      const cleanPhone = testPhone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 1500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification("Imagem muito grande. Máximo 2MB.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrand({ ...brand, logoUrl: reader.result as string });
        addNotification("Logo atualizada!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Clinic Identity & Type */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
          <Palette className="text-primary" size={18} /> Identidade & White-Label
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Nome da Unidade</label>
              <input 
                value={brand.clinicName}
                onChange={e => setBrand({...brand, clinicName: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 outline-none font-semibold text-slate-700 transition-all text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Especialização do Sistema</label>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                  onClick={() => setBrand({...brand, type: 'MEDICAL'})}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${brand.type === 'MEDICAL' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                 >
                   <Stethoscope size={20} />
                   <span className="text-[10px] font-bold uppercase">Clínica Médica</span>
                 </button>
                 <button 
                  onClick={() => setBrand({...brand, type: 'DENTAL'})}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${brand.type === 'DENTAL' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                 >
                   <Briefcase size={20} />
                   <span className="text-[10px] font-bold uppercase">Clínica Dentária</span>
                 </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Logótipo</label>
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
            <div onClick={() => fileInputRef.current?.click()} className="group border-2 border-dashed border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-white hover:border-primary/20 transition-all cursor-pointer min-h-[180px]">
              {brand.logoUrl ? (
                <div className="relative">
                  <img src={brand.logoUrl} className="w-20 h-20 rounded-2xl object-contain shadow-md bg-white p-2" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-xl shadow-sm text-slate-300 group-hover:text-primary transition-colors"><ImageIcon size={24} /></div>
              )}
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500">Alterar Logótipo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NOVO: WHATSAPP BUSINESS API CONFIGURATION */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <MessageCircle size={24} />
             </div>
             <div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">WhatsApp Business API</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Configuração Oficial Meta Cloud API</p>
             </div>
           </div>
           <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black flex items-center gap-2 uppercase tracking-widest shadow-sm">
              <ShieldCheck size={14} /> Cloud API Conetada
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Terminal size={12}/> Phone Number ID
                 </label>
                 <input type="text" placeholder="Ex: 10566988842100" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs font-bold outline-none" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Key size={12}/> Permanent Access Token
                 </label>
                 <input type="password" placeholder="••••••••••••••••••••••••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs font-bold outline-none" />
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                 <Info size={20} className="text-amber-500 shrink-0" />
                 <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                   Certifique-se de que os seus <strong>Templates</strong> estão aprovados no Meta Business Suite para evitar rejeições de envio automático.
                 </p>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Activity size={120} />
              </div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Activity size={14} /> Monitor de Tráfego
              </h4>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-2xl font-black">100%</p>
                       <p className="text-[9px] font-bold opacity-60 uppercase">Taxa de Entrega</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-emerald-400">842</p>
                       <p className="text-[9px] font-bold opacity-60 uppercase">Mensagens / Mês</p>
                    </div>
                 </div>
                 
                 <div className="space-y-2 mt-6">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Testar Conetividade</label>
                    <div className="flex gap-2">
                       <input 
                        value={testPhone}
                        onChange={e => setTestPhone(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none" 
                       />
                       <button 
                        onClick={handleTestWhatsApp}
                        disabled={isApiLoading}
                        className="bg-primary hover:bg-primary/80 transition-all p-2 rounded-xl"
                       >
                         {isApiLoading ? <Activity className="animate-spin" size={16}/> : <Zap size={16} />}
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
          <CreditCard className="text-indigo-500" size={18} /> Gateway de Pagamento
        </h3>
        <div className="space-y-4">
          <div className="p-5 border border-indigo-100 bg-indigo-50/20 rounded-3xl flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-indigo-50 shrink-0">
                 <img src="https://www.ifthenpay.com/img/logo.png" className="h-3" alt="Ifthenpay" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Ifthenpay Integration</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">MB WAY & Multibanco Portugal</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 size={12} /> Ativo
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Save size={16} /> Guardar Definições
        </button>
      </div>
    </div>
  );
};

export default Settings;
