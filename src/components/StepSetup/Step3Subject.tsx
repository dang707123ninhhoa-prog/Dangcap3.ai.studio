import React, { useState } from 'react';
import { EducationLevel } from '../../types/exam';
import { SUBJECTS_BY_LEVEL } from '../../constants/curriculum';
import { PlusCircle, Check } from 'lucide-react';

interface Step3SubjectProps {
  level: EducationLevel;
  selectedSubject: string;
  isCustomSubject?: boolean;
  onSelectSubject: (subject: string, isCustom: boolean) => void;
}

export const Step3Subject: React.FC<Step3SubjectProps> = ({
  level,
  selectedSubject,
  isCustomSubject = false,
  onSelectSubject,
}) => {
  const popularSubjects = SUBJECTS_BY_LEVEL[level] || [];
  const [customInput, setCustomInput] = useState(isCustomSubject ? selectedSubject : '');

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    if (val.trim()) {
      onSelectSubject(val.trim(), true);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            3
          </span>
          CHỌN MÔN HỌC
        </label>
        <span className="text-xs text-slate-400">Tất cả các môn</span>
      </div>

      {/* Preset Subject Chips */}
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
        {popularSubjects.map((sub) => {
          const isSelected = !isCustomSubject && selectedSubject === sub.name;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => {
                onSelectSubject(sub.name, false);
                setCustomInput('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* Custom Subject Input */}
      <div className="pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={handleCustomChange}
              onFocus={() => {
                if (customInput.trim()) {
                  onSelectSubject(customInput.trim(), true);
                }
              }}
              placeholder="Nhập tên môn học khác (VD: Tiếng Pháp, Lập trình Python, STEM...)"
              className={`w-full px-3 py-2 text-xs rounded-lg border transition-all ${
                isCustomSubject
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30 font-medium text-blue-900'
                  : 'border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
          </div>
          {isCustomSubject && (
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md shrink-0">
              Đang chọn môn tùy chỉnh
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
