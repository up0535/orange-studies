import React, { useState } from 'react';
import InputArea from './components/InputArea';
import ResultDisplay from './components/ResultDisplay';
import { analyzeContent } from './services/geminiService';
import { AnalysisState } from './types';

const App: React.FC = () => {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: false,
    data: null,
    error: null,
  });
  const [sources, setSources] = useState<string[]>([]);

  const handleSend = async (text: string, image: File | null) => {
    setAnalysisState({ isLoading: true, data: null, error: null });
    setSources([]);

    try {
      const { text: resultText, sources: resultSources } = await analyzeContent(text, image || undefined);
      setAnalysisState({
        isLoading: false,
        data: resultText,
        error: null,
      });
      if (resultSources) {
          setSources(resultSources);
      }
    } catch (error: any) {
      setAnalysisState({
        isLoading: false,
        data: null,
        error: error.message || "生成内容时发生错误，请稍后重试。",
      });
    }
  };

  const handleReset = () => {
    setAnalysisState({
      isLoading: false,
      data: null,
      error: null,
    });
    setSources([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50">
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-orange-500 text-white p-2 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 17h6"/></svg>
          </div>
          <div>
             <h1 className="text-xl font-bold text-slate-800 tracking-tight">OranjeStudie</h1>
             <p className="text-xs text-orange-600 font-medium">荷兰语 A2-B1 备考助手</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Intro Section - Only show when no data and no error */}
        {!analysisState.data && !analysisState.error && (
          <div className="text-center mb-10 space-y-4 animate-fade-in">
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
               开启你的<span className="text-orange-500">荷兰语</span>学习之旅
             </h2>
             <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
               上传图片、输入文本或粘贴网址。AI 助教会为您生成 A2-B1 等级的双语沉浸式学习资料。
             </p>
          </div>
        )}

        {/* Error Message */}
        {analysisState.error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <div>
              <p className="font-bold">出错啦</p>
              <p className="text-sm">{analysisState.error}</p>
            </div>
            <button onClick={handleReset} className="ml-auto text-sm underline hover:text-red-900">重试</button>
          </div>
        )}

        {/* Main Interface */}
        {!analysisState.data ? (
           <InputArea onSend={handleSend} isLoading={analysisState.isLoading} />
        ) : (
           <ResultDisplay 
             content={analysisState.data} 
             sources={sources}
             onReset={handleReset} 
           />
        )}
      </main>

      <footer className="w-full py-6 text-center text-slate-400 text-sm mt-auto border-t border-slate-100">
        <p>© {new Date().getFullYear()} OranjeStudie. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;