
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { useApp } from '../App';
// Added CheckCircle2 to imports as it was missing and causing a ReferenceError
import { HeartPulse, MessageCircle, Mic, Send, Share2, History, Type, Video, PlayCircle, Loader2, Volume2, CheckCircle2 } from 'lucide-react';

// Helper functions for raw PCM audio decoding as per Gemini API guidelines
// Gemini TTS returns raw PCM data which lacks headers and cannot be played directly by the Audio element.
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const PostCare: React.FC = () => {
  const { brand, addNotification } = useApp();
  const [patient, setPatient] = useState('Daniel Lima');
  const [procedure, setProcedure] = useState('Extração de Siso');
  const [format, setFormat] = useState<'text' | 'audio' | 'video'>('text');
  const [content, setContent] = useState('');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setAudioBase64(null);
    const result = await geminiService.generatePostCare(patient, procedure);
    setContent(result);
    
    if (format === 'audio') {
      const audio = await geminiService.generateAudio(result);
      setAudioBase64(audio);
    }
    
    setIsLoading(false);
    setIsSent(false);
  };

  const playAudio = async () => {
    if (audioBase64) {
      // Fix: Use AudioContext to play raw PCM bytes returned by Gemini
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(
          decode(audioBase64),
          audioContext,
          24000,
          1
        );
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        addNotification("A reproduzir áudio gerado pela IA...", "info");
      } catch (error) {
        console.error("Audio Playback Error:", error);
        addNotification("Erro ao reproduzir áudio.", "warning");
      }
    }
  };

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
    addNotification(`Conteúdo enviado para ${patient} via WhatsApp!`, 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 text-center md:text-left">
           <div className="p-6 rounded-[2rem] bg-primary/10 text-primary">
             <HeartPulse size={48} />
           </div>
           <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pós-Consulta & Fidelização</h2>
             <p className="text-slate-500 font-medium">Automatize o cuidado e garanta que o paciente se sente acompanhado.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paciente</label>
            <input 
              value={patient}
              onChange={e => setPatient(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Procedimento Realizado</label>
            <input 
              value={procedure}
              onChange={e => setProcedure(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700"
            />
          </div>
        </div>

        <div className="mb-10">
           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Formato do Conteúdo</label>
           <div className="flex flex-wrap justify-center gap-4">
              {[
                { id: 'text', icon: <Type size={20} />, label: 'Texto' },
                { id: 'audio', icon: <Mic size={20} />, label: 'Áudio (IA)' },
                { id: 'video', icon: <Video size={20} />, label: 'Vídeo' }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setFormat(f.id as any)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all border-2 ${
                    format === f.id ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20'
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
           </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-black active:scale-95 transition-all shadow-2xl disabled:opacity-50"
        >
          {isLoading ? <><Loader2 className="animate-spin" /> A Processar...</> : 'Gerar Orientações Personalizadas'}
        </button>
      </div>

      {content && (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight text-sm">
              <MessageCircle size={20} className="text-emerald-500" />
              Proposta de Envio
            </h3>
            {audioBase64 && (
              <button onClick={playAudio} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase hover:bg-primary/20 transition-all">
                <Volume2 size={16} /> Ouvir Áudio Gerado
              </button>
            )}
          </div>
          <div className="p-8 md:p-12">
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-72 p-8 border-none bg-slate-50/50 rounded-[2rem] resize-none text-slate-700 leading-relaxed focus:ring-0 text-base font-medium italic"
            />
            
            <div className="mt-10 space-y-4">
              <button 
                onClick={handleSend}
                className={`w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 ${isSent && 'scale-95 opacity-80'}`}
              >
                {isSent ? <><CheckCircle2 size={24} /> Enviado!</> : <><Send size={24} /> Enviar para WhatsApp do Paciente</>}
              </button>
              <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                Certificado pela WhatsApp Business API • {brand.clinicName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCare;
