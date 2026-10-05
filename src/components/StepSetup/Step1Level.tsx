import React from 'react';
import { EducationLevel } from '../../types/exam';
import { EDUCATION_LEVELS, SUBJECTS_BY_LEVEL } from '../../constants/curriculum';
import { GraduationCap, School, BookCheck } from 'lucide-react';

interface Step1LevelProps {
  selectedLevel: EducationLevel;
  onSelectLevel: (level: EducationLevel, defaultGrade: number, defaultSubject: string) => void;
}

export const Step1Level: React.FC<Step1LevelProps> = ({ selectedLevel, onSelectLevel }) => {
  const getIcon = (level: EducationLevel) => {
    switch (level) {
      case 'tieuhoc':
        return <School className="w-6 h-6 text-amber-500" />;
      case 'thcs':
        return <BookCheck className="w-6 h-6 text-sky-500" />;
      case 'thpt':
        return <GraduationCap className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            1
          </span>
          CHỌN CẤP HỌC
        </label>
        <span className="text-xs text-slate-400">Bước 1/4</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {EDUCATION_LEVELS.map((item) => {
          const isSelected = selectedLevel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const defaultGrade = item.grades[0];
                const defaultSubj = SUBJECTS_BY_LEVEL[item.id][0].name;
                onSelectLevel(item.id, defaultGrade, defaultSubj);
              }}
              className={`p-3 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-200/50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                  {getIcon(item.id)}
                </div>
                {isSelected && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                )}
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                  {item.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {item.grades.map((g) => `Lớp ${g}`).join(', ')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
