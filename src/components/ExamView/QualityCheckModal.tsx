import React from 'react';
import { QualityCheckResult } from '../../types/exam';
import { X, CheckCircle, AlertTriangle, XCircle, ShieldCheck, Wrench } from 'lucide-react';

interface QualityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  qualityCheck: QualityCheckResult;
  onAutoFixScores?: () => void;
}

export const QualityCheckModal: React.FC<QualityCheckModalProps> = ({
  isOpen,
  onClose,
  qualityCheck,
  onAutoFixScores,
}) => {
  if (!isOpen) return null;

  const passedCount = qualityCheck.criteria.filter((c) => c.status === 'pass').length;
  const warningCount = qualityCheck.criteria.filter((c) => c.status === 'warning').length;
  const failCount = qualityCheck.criteria.filter((c) => c.status === 'fail').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                KIỂM TRA CHẤT LƯỢNG ĐỀ THI TỰ ĐỘNG
              </h3>
              <p className="text-xs text-slate-500">
                Hệ thống 12 tiêu chí khảo thí & sư phạm độc quyền
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scorecard Summary */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <div>
            <span className="text-2xl font-black text-emerald-600">{passedCount}/12</span>
            <p className="text-[11px] font-semibold text-slate-600">Đạt chuẩn tuyệt đối</p>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-500">{warningCount}</span>
            <p className="text-[11px] font-semibold text-slate-600">Lưu ý sư phạm</p>
          </div>
          <div>
            <span className="text-2xl font-black text-rose-600">{failCount}</span>
            <p className="text-[11px] font-semibold text-slate-600">Cần chỉnh sửa</p>
          </div>
        </div>

        {/* 12 Criteria List */}
        <div className="space-y-2">
          {qualityCheck.criteria.map((c) => {
            const isPass = c.status === 'pass';
            const isWarn = c.status === 'warning';
            return (
              <div
                key={c.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  isPass
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isWarn
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isPass ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : isWarn ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      Tiêu chí {c.id}: {c.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPass
                          ? 'bg-emerald-100 text-emerald-800'
                          : isWarn
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isPass ? 'ĐẠT' : isWarn ? 'LƯU Ý' : 'CẦN SỬA'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {onAutoFixScores && (
            <button
              type="button"
              onClick={() => {
                onAutoFixScores();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              Tự động cân bằng điểm số
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Đã xem xong
          </button>
        </div>
      </div>
    </div>
  );
};
