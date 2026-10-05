import React, { useState } from 'react';
import { Target } from 'lucide-react';

interface ScoreScaleConfigProps {
  scoreScale: number;
  totalQuestions: number;
  onChange: (scale: number) => void;
}

export const ScoreScaleConfig: React.FC<ScoreScaleConfigProps> = ({
  scoreScale,
  totalQuestions,
  onChange,
}) => {
  const [isCustom, setIsCustom] = useState(![10, 20, 100].includes(scoreScale));

  const standardScales = [10, 20, 100];
  const avgScore = totalQuestions > 0 ? (scoreScale / totalQuestions).toFixed(2) : '0';

  return (
    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <Target className="w-4 h-4 text-blue-600" />
          THANG ĐIỂM ĐỀ THI
        </label>
        <span className="text-xs font-medium text-slate-500">
          Trung bình: ~{avgScore} đ / câu
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {standardScales.map((scale) => {
          const isSelected = !isCustom && scoreScale === scale;
          return (
            <button
              key={scale}
              type="button"
              onClick={() => {
                setIsCustom(false);
                onChange(scale);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-1 ring-blue-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Thang {scale} điểm
            </button>
          );
        })}

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-slate-600 font-medium">Tùy chỉnh:</span>
          <input
            type="number"
            min="1"
            max="1000"
            value={isCustom ? scoreScale : ''}
            placeholder="Khác"
            onFocus={() => setIsCustom(true)}
            onChange={(e) => {
              setIsCustom(true);
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val > 0) {
                onChange(val);
              }
            }}
            className="w-20 px-2.5 py-1 text-xs font-bold text-center border border-slate-300 rounded-lg text-blue-900 bg-white"
          />
          <span className="text-xs text-slate-500 font-medium">điểm</span>
        </div>
      </div>
    </div>
  );
};
