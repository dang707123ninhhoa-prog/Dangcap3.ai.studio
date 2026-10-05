import React from 'react';
import { QuestionType } from '../../types/exam';
import { QUESTION_TYPES_META } from '../../constants/curriculum';
import { calculateTotalQuestions } from '../../utils/matrixGenerator';
import { CheckSquare, Edit3, HelpCircle } from 'lucide-react';

interface QuestionTypesConfigProps {
  questionCounts: Record<QuestionType, number>;
  onChange: (counts: Record<QuestionType, number>) => void;
}

export const QuestionTypesConfig: React.FC<QuestionTypesConfigProps> = ({
  questionCounts,
  onChange,
}) => {
  const totalQuestions = calculateTotalQuestions(questionCounts);

  const handleCountChange = (type: QuestionType, valStr: string) => {
    const val = Math.max(0, parseInt(valStr, 10) || 0);
    onChange({
      ...questionCounts,
      [type]: val,
    });
  };

  const mcqMeta = QUESTION_TYPES_META.filter((m) => m.category === 'trac_nghiem');
  const essayMeta = QUESTION_TYPES_META.filter((m) => m.category === 'tu_luan');

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-blue-600" />
          HÌNH THỨC CÂU HỎI & SỐ LƯỢNG CÂU
        </label>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
          Tổng số: {totalQuestions} câu
        </span>
      </div>

      {/* Phần Trắc nghiệm */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <span>1. Phần trắc nghiệm khách quan</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {mcqMeta.map((meta) => {
            const count = questionCounts[meta.id] || 0;
            return (
              <div
                key={meta.id}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  count > 0 ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-100' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="pr-2">
                  <span className="text-xs font-medium text-slate-800 block leading-tight">
                    {meta.name}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{meta.description}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={count === 0 ? '' : count}
                    placeholder="0"
                    onChange={(e) => handleCountChange(meta.id, e.target.value)}
                    className="w-14 px-2 py-1 text-xs text-center font-bold text-blue-900 border border-slate-300 rounded-md bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-500">câu</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phần Tự luận */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>2. Phần tự luận</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {essayMeta.map((meta) => {
            const count = questionCounts[meta.id] || 0;
            return (
              <div
                key={meta.id}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  count > 0 ? 'bg-amber-50/60 border-amber-200 ring-1 ring-amber-100' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="pr-2">
                  <span className="text-xs font-medium text-slate-800 block leading-tight">
                    {meta.name}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{meta.description}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={count === 0 ? '' : count}
                    placeholder="0"
                    onChange={(e) => handleCountChange(meta.id, e.target.value)}
                    className="w-14 px-2 py-1 text-xs text-center font-bold text-amber-900 border border-slate-300 rounded-md bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500">câu</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
