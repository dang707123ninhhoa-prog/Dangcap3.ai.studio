import React, { useState } from 'react';
import { X, Table, FileUp, Sparkles, AlertCircle } from 'lucide-react';

interface MatrixImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportMatrix: (matrixText: string) => void;
}

export const MatrixImportModal: React.FC<MatrixImportModalProps> = ({
  isOpen,
  onClose,
  onImportMatrix,
}) => {
  const [matrixText, setMatrixText] = useState('');

  if (!isOpen) return null;

  const sampleMatrix = `CHỦ ĐỀ: ĐẠO HÀM VÀ KHẢO SÁT HÀM SỐ
1. Tính đơn điệu:
- Nhận biết: 2 câu trắc nghiệm (0.5 điểm)
- Thông hiểu: 2 câu trắc nghiệm (0.5 điểm)
- Vận dụng: 1 câu tự luận (1.0 điểm)
2. Cực trị hàm số:
- Nhận biết: 2 câu trắc nghiệm (0.5 điểm)
- Thông hiểu: 2 câu trắc nghiệm (0.5 điểm)
- Vận dụng: 1 câu trắc nghiệm trả lời ngắn (0.5 điểm)
3. Giá trị lớn nhất - nhỏ nhất & Tiệm cận:
- Thông hiểu: 2 câu trắc nghiệm (0.5 điểm)
- Vận dụng cao: 1 câu tự luận giải toán thực tế (1.5 điểm)
Tổng: 10 câu - 10.0 điểm`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                TẢI MA TRẬN / BẢN ĐẶC TẢ CÓ SẴN
              </h3>
              <p className="text-xs text-slate-500">
                Dán bảng ma trận phân phối câu hỏi hoặc bản đặc tả của Bộ/Sở/Trường
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Dán nội dung ma trận (dạng văn bản, bảng hoặc danh sách):
            </label>
            <button
              type="button"
              onClick={() => setMatrixText(sampleMatrix)}
              className="text-[11px] text-indigo-600 hover:underline font-semibold"
            >
              Chèn mẫu tham khảo
            </button>
          </div>
          <textarea
            rows={10}
            value={matrixText}
            onChange={(e) => setMatrixText(e.target.value)}
            placeholder="Dán ma trận đề thi tại đây... AI sẽ tự động phân tích cấu trúc, chủ đề, số câu và thang điểm để tạo đề chuẩn 100% theo ma trận này."
            className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>
            Hệ thống AI sẽ bảo toàn tỷ lệ và cấu trúc các ô trong ma trận bạn cung cấp, không tự động thay đổi số lượng câu hỏi hay điểm số.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!matrixText.trim()}
            onClick={() => {
              onImportMatrix(matrixText);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Tạo đề từ ma trận này
          </button>
        </div>
      </div>
    </div>
  );
};
