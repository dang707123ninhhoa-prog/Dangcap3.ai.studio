import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  isGenerating: boolean;
  statusText?: string;
}

const STEPS = [
  'Đang phân tích yêu cầu…',
  'Đang xây dựng ma trận…',
  'Đang tạo câu hỏi…',
  'Đang kiểm tra đáp án…',
  'Đang hoàn thiện đề…',
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  isGenerating,
  statusText,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  const currentDisplay = statusText || STEPS[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-200 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
          <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            AI ĐANG SOẠN THẢO ĐỀ KIỂM TRA
          </h3>
          <p className="text-xs font-semibold text-blue-700 mt-1 min-h-[20px]">
            {currentDisplay}
          </p>
        </div>

        {/* Step indicators */}
        <div className="space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-all ${
                  isDone
                    ? 'text-emerald-700 font-semibold'
                    : isCurrent
                    ? 'text-blue-700 font-bold scale-[1.02]'
                    : 'text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] shrink-0 text-slate-400">
                    {idx + 1}
                  </div>
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 italic">
          Hệ thống đang đối soát dữ kiện, nghiệm số và các tiêu chuẩn của Bộ GD&ĐT...
        </p>
      </div>
    </div>
  );
};
