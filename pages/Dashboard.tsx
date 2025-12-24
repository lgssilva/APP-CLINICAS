
import React from 'react';
import { Users, CalendarCheck, FileCheck, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../App';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Seg', appointments: 12, revenue: 2400 },
  { name: 'Ter', appointments: 19, revenue: 4500 },
  { name: 'Qua', appointments: 15, revenue: 3200 },
  { name: 'Qui', appointments: 22, revenue: 5800 },
  { name: 'Sex', appointments: 18, revenue: 4100 },
  { name: 'Sab', appointments: 8, revenue: 1500 },
];

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, trend: string, primaryColor: string }> = ({ title, value, icon, trend, primaryColor }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 mt-2">{value}</h3>
      </div>
      <div 
        className="p-4 rounded-2xl" 
        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
      >
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1 text-xs">
      <TrendingUp size={14} className="text-emerald-500" />
      <span className="text-emerald-500 font-black">{trend}</span>
      <span className="text-slate-400 ml-1 font-bold uppercase tracking-tight">este mês</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { brand } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pacientes" value="1.284" icon={<Users size={24} />} trend="+12%" primaryColor={brand.primaryColor} />
        <StatCard title="Confirmados IA" value="89%" icon={<CalendarCheck size={24} />} trend="+5.2%" primaryColor={brand.primaryColor} />
        <StatCard title="Receita Prevista" value="€ 42.5k" icon={<FileCheck size={24} />} trend="+18%" primaryColor={brand.primaryColor} />
        <StatCard title="Taxa de Faltas" value="4.2%" icon={<AlertCircle size={24} />} trend="-2.1%" primaryColor={brand.primaryColor} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Desempenho da Clínica</h3>
            <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos 7 dias</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brand.primaryColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={brand.primaryColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800}}
                />
                <Area type="monotone" dataKey="revenue" stroke={brand.primaryColor} fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-tight">Feed Inteligente</h3>
          <div className="space-y-8">
            <div className="flex gap-4 group">
              <div className="mt-1">
                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 transition-transform group-hover:scale-110">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">Ana Silva confirmou presença</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Há 2 minutos • WhatsApp</p>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="mt-1">
                <div className="bg-rose-100 p-3 rounded-2xl text-rose-600 transition-transform group-hover:scale-110">
                  <AlertCircle size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">Bruno Costa cancelou consulta</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Há 15 minutos • Slot Vago 10:30</p>
                <button className="mt-2 text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                  Acionar Lista de Espera
                </button>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="mt-1">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 transition-transform group-hover:scale-110">
                  <Clock size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">Vaga preenchida automaticamente</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Eduarda Gomes • Lista às 10:31</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
