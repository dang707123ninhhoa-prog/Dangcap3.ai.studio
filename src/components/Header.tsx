import React from 'react';
import { BookOpen, Sparkles, RotateCcw, Trash2, Library, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onRestoreConfig: () => void;
  onResetConfig: () => void;
  onOpenQuestionBank: () => void;
  savedExamsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRestoreConfig,
  onResetConfig,
  onOpenQuestionBank,
  savedExamsCount,
}) => {
  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  RA ĐỀ KIỂM TRA AI – 3 CẤP
                </h1>
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Tiểu học • THCS • THPT • Áp dụng cho mọi môn học
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenQuestionBank}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Mở kho ngân hàng câu hỏi đã lưu"
            >
              <Library className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ngân hàng câu hỏi</span>
              {savedExamsCount > 0 && (
                <span className="ml-1 bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {savedExamsCount}
                </span>
              )}
            </button>

            <button
              onClick={onRestoreConfig}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-white hover:bg-blue-50/50 border border-slate-200 rounded-lg transition-colors"
              title="Khôi phục cấu hình đề vừa lưu gần nhất"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Khôi phục cấu hình</span>
            </button>

            <button
              onClick={onResetConfig}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Xóa toàn bộ cấu hình về mặc định"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Xóa toàn bộ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
