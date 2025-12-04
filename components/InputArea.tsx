import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Send, X, Link as LinkIcon, FileText } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, image: File | null) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    onSend(text, image);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
      <div className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Image Preview */}
          {previewUrl && (
            <div className="relative w-fit group">
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                className="h-32 w-auto object-cover rounded-lg border border-slate-200 shadow-sm"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Text Input */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入荷兰语单词、句子、文章，粘贴网址，或者上传图片..."
              className="w-full min-h-[120px] p-4 pr-12 text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-y text-lg"
              disabled={isLoading}
            />
            
            {/* Input Type Indicators (Visual cues) */}
            <div className="absolute top-4 right-4 text-slate-300 flex flex-col gap-2 pointer-events-none">
               {text.startsWith('http') ? <LinkIcon size={20} className="text-blue-400" /> : <FileText size={20} />}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
              >
                <ImageIcon size={18} />
                <span className="hidden sm:inline">上传图片</span>
              </button>
              
              <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                支持 JPG, PNG. 自动识别内容。
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!text.trim() && !image)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-md transition-all 
                ${isLoading || (!text.trim() && !image)
                  ? 'bg-orange-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transform active:scale-95'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>分析中...</span>
                </>
              ) : (
                <>
                  <span>生成学习资料</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputArea;