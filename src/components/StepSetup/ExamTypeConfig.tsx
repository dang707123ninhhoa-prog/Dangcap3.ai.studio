import React, { useState } from 'react';
import { EXAM_TYPES, DURATION_OPTIONS } from '../../constants/curriculum';
import { Clock, Layers, Award } from 'lucide-react';

interface ExamTypeConfigProps {
  examType: string;
  examTitle: string;
  schoolName: string;
  durationMinutes: number;
  testCodeCount: 1 | 2 | 3 | 4;
  onChange: (fields: Partial<{
    examType: string;
    examTitle: string;
    schoolName: string;
    durationMinutes: number;
    testCodeCount: 1 | 2 | 3 | 4;
  }>) => void;
}

export const ExamTypeConfig: React.FC<ExamTypeConfigProps> = ({
  examType,
  examTitle,
  schoolName,
  durationMinutes,
  testCodeCount,
  onChange,
}) => {
  const [isCustomDuration, setIsCustomDuration] = useState(!DURATION_OPTIONS.includes(durationMinutes));

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <Award className="w-4 h-4 text-blue-600" />
          LOẠI ĐỀ, THỜI GIAN & MÃ ĐỀ
        </label>
        <span className="text-[11px] text-slate-400">Hình thức tổ chức thi</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Loại đề */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Loại đề kiểm tra
          </label>
          <select
            value={examType}
            onChange={(e) => {
              const val = e.target.value;
              let defaultTitle = examTitle;
              if (val === 'Kiểm tra 15 phút') defaultTitle = 'BÀI KIỂM TRA 15 PHÚT';
              else if (val === 'Kiểm tra giữa kỳ') defaultTitle = 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA KỲ';
              else if (val === 'Kiểm tra cuối kỳ') defaultTitle = 'ĐỀ KIỂM TRA ĐÁNH GIÁ CUỐI KỲ';
              onChange({ examType: val, examTitle: defaultTitle });
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 bg-white"
          >
            {EXAM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Tên trường */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên trường / Đơn vị
          </label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => onChange({ schoolName: e.target.value })}
            placeholder="TRƯỜNG THPT / THCS..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Tên đề */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tiêu đề bài kiểm tra
          </label>
          <input
            type="text"
            value={examTitle}
            onChange={(e) => onChange({ examTitle: e.target.value })}
            placeholder="ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 font-semibold uppercase"
          />
        </div>
      </div>

      {/* Thời gian làm bài */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Thời gian làm bài:
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {DURATION_OPTIONS.map((d) => {
            const isSelected = !isCustomDuration && durationMinutes === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setIsCustomDuration(false);
                  onChange({ durationMinutes: d });
                }}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d} phút
              </button>
            );
          })}
          <div className="flex items-center gap-1 ml-1">
            <input
              type="number"
              min="5"
              max="240"
              placeholder="Tự nhập"
              value={isCustomDuration ? durationMinutes : ''}
              onFocus={() => setIsCustomDuration(true)}
              onChange={(e) => {
                setIsCustomDuration(true);
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) {
                  onChange({ durationMinutes: val });
                }
              }}
              className="w-20 px-2 py-1 text-xs rounded-md border border-slate-300 text-slate-800 text-center"
            />
            <span className="text-xs text-slate-500">phút</span>
          </div>
        </div>
      </div>

      {/* Số lượng mã đề (1, 2, 3, 4) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          Số mã đề thi đảo:
        </label>
        <div className="flex items-center gap-1.5">
          {([1, 2, 3, 4] as const).map((num) => {
            const isSelected = testCodeCount === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange({ testCodeCount: num })}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-1 ring-indigo-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {num} mã {num > 1 ? `(101→10${num})` : ''}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
