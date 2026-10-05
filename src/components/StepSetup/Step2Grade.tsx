import React from 'react';
import { EducationLevel } from '../../types/exam';
import { EDUCATION_LEVELS } from '../../constants/curriculum';

interface Step2GradeProps {
  level: EducationLevel;
  selectedGrade: number;
  onSelectGrade: (grade: number) => void;
}

export const Step2Grade: React.FC<Step2GradeProps> = ({ level, selectedGrade, onSelectGrade }) => {
  const currentLevelConfig = EDUCATION_LEVELS.find((l) => l.id === level) || EDUCATION_LEVELS[2];
  const grades = currentLevelConfig.grades;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            2
          </span>
          CHỌN LỚP
        </label>
        <span className="text-xs font-medium text-blue-600">
          {currentLevelConfig.name}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {grades.map((g) => {
          const isSelected = selectedGrade === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => onSelectGrade(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              Lớp {g}
            </button>
          );
        })}
      </div>
    </div>
  );
};
