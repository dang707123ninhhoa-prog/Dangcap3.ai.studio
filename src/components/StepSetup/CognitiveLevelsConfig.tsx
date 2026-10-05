import React from 'react';
import { CognitiveDistribution } from '../../types/exam';
import { Sliders, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CognitiveLevelsConfigProps {
  distribution: CognitiveDistribution;
  totalQuestions: number;
  onChange: (dist: CognitiveDistribution) => void;
}

export const CognitiveLevelsConfig: React.FC<CognitiveLevelsConfigProps> = ({
  distribution,
  totalQuestions,
  onChange,
}) => {
  const { mode, values } = distribution;

  const totalSum =
    (values.recognition || 0) +
    (values.comprehension || 0) +
    (values.application || 0) +
    (values.highApplication || 0);

  const isPercentage = mode === 'percentage';
  const isValid = isPercentage ? totalSum === 100 : totalSum === totalQuestions;

  const handleValChange = (key: keyof typeof values, strVal: string) => {
    const val = Math.max(0, parseInt(strVal, 10) || 0);
    onChange({
      ...distribution,
      values: {
        ...values,
        [key]: val,
      },
    });
  };

  const applyPreset = (rec: number, com: number, app: number, high: number) => {
    if (isPercentage) {
      onChange({
        mode: 'percentage',
        values: { recognition: rec, comprehension: com, application: app, highApplication: high },
      });
    } else {
      // Scale to totalQuestions
      const r = Math.round((rec / 100) * totalQuestions);
      const c = Math.round((com / 100) * totalQuestions);
      const a = Math.round((app / 100) * totalQuestions);
      const h = Math.max(0, totalQuestions - (r + c + a));
      onChange({
        mode: 'count',
        values: { recognition: r, comprehension: c, application: a, highApplication: h },
      });
    }
  };

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-600" />
          PHÂN BỔ 4 MỨC ĐỘ NHẬN THỨC
        </label>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ ...distribution, mode: 'percentage' })}
            className={`px-2.5 py-1 rounded-md transition-all ${
              isPercentage ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tỷ lệ (%)
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...distribution, mode: 'count' })}
            className={`px-2.5 py-1 rounded-md transition-all ${
              !isPercentage ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Số câu
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-500 font-medium">Mẫu chuẩn:</span>
        <button
          type="button"
          onClick={() => applyPreset(40, 30, 20, 10)}
          className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-[11px] font-medium text-slate-700 transition-colors"
        >
          40-30-20-10 (Đánh giá chuẩn)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(50, 30, 20, 0)}
          className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-[11px] font-medium text-slate-700 transition-colors"
        >
          50-30-20-0 (Kiểm tra 15p)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(30, 40, 20, 10)}
          className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-[11px] font-medium text-slate-700 transition-colors"
        >
          30-40-20-10 (Cuối kỳ)
        </button>
      </div>

      {/* 4 Levels Input Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Nhận biết */}
        <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
          <span className="text-[11px] font-bold text-emerald-900 block">1. Nhận biết</span>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              min="0"
              value={values.recognition === 0 ? '' : values.recognition}
              placeholder="0"
              onChange={(e) => handleValChange('recognition', e.target.value)}
              className="w-full px-2 py-1 text-xs font-bold text-emerald-900 bg-white border border-emerald-300 rounded text-center"
            />
            <span className="text-xs font-semibold text-emerald-800">{isPercentage ? '%' : 'câu'}</span>
          </div>
        </div>

        {/* Thông hiểu */}
        <div className="p-2.5 rounded-lg border border-sky-200 bg-sky-50/50">
          <span className="text-[11px] font-bold text-sky-900 block">2. Thông hiểu</span>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              min="0"
              value={values.comprehension === 0 ? '' : values.comprehension}
              placeholder="0"
              onChange={(e) => handleValChange('comprehension', e.target.value)}
              className="w-full px-2 py-1 text-xs font-bold text-sky-900 bg-white border border-sky-300 rounded text-center"
            />
            <span className="text-xs font-semibold text-sky-800">{isPercentage ? '%' : 'câu'}</span>
          </div>
        </div>

        {/* Vận dụng */}
        <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
          <span className="text-[11px] font-bold text-amber-900 block">3. Vận dụng</span>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              min="0"
              value={values.application === 0 ? '' : values.application}
              placeholder="0"
              onChange={(e) => handleValChange('application', e.target.value)}
              className="w-full px-2 py-1 text-xs font-bold text-amber-900 bg-white border border-amber-300 rounded text-center"
            />
            <span className="text-xs font-semibold text-amber-800">{isPercentage ? '%' : 'câu'}</span>
          </div>
        </div>

        {/* Vận dụng cao */}
        <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50">
          <span className="text-[11px] font-bold text-rose-900 block">4. Vận dụng cao</span>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              min="0"
              value={values.highApplication === 0 ? '' : values.highApplication}
              placeholder="0"
              onChange={(e) => handleValChange('highApplication', e.target.value)}
              className="w-full px-2 py-1 text-xs font-bold text-rose-900 bg-white border border-rose-300 rounded text-center"
            />
            <span className="text-xs font-semibold text-rose-800">{isPercentage ? '%' : 'câu'}</span>
          </div>
        </div>
      </div>

      {/* Validation status / alert */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {isValid ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tổng: {totalSum} {isPercentage ? '%' : 'câu'} (Hợp lệ)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Cảnh báo: Tổng hiện tại {totalSum} {isPercentage ? '%' : 'câu'} (Cần bằng{' '}
              {isPercentage ? '100%' : `${totalQuestions} câu`})
            </span>
          )}
        </div>

        {isPercentage && totalSum !== 100 && (
          <button
            type="button"
            onClick={() => {
              const diff = 100 - totalSum;
              handleValChange('recognition', String(values.recognition + diff));
            }}
            className="text-[11px] text-blue-600 hover:underline font-medium"
          >
            Tự động bù đủ 100%
          </button>
        )}
      </div>
    </div>
  );
};
