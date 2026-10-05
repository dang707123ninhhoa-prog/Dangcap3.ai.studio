import React from 'react';
import { SpecificationItem, ExamConfig } from '../../types/exam';
import { FileSpreadsheet, Check } from 'lucide-react';

interface SpecificationTableProps {
  specifications: SpecificationItem[];
  config: ExamConfig;
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({
  specifications,
  config,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Quy định chi tiết chuẩn kiến thức, kĩ năng, yêu cầu cần đạt và phân bổ câu hỏi theo từng mức độ nhận thức
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">STT</th>
              <th className="py-2.5 px-4 border-r border-slate-300 w-44">Chủ đề</th>
              <th className="py-2.5 px-4 border-r border-slate-300 w-44">Đơn vị kiến thức</th>
              <th className="py-2.5 px-4 border-r border-slate-300">Mức độ đánh giá & Yêu cầu cần đạt</th>
              <th className="py-2.5 px-3 border-r border-slate-300 w-28 text-center">Mức độ</th>
              <th className="py-2.5 px-3 border-r border-slate-300 w-32">Dạng câu hỏi</th>
              <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-center">Vị trí câu</th>
              <th className="py-2.5 px-3 border-r border-slate-300 w-16 text-center">Số câu</th>
              <th className="py-2.5 px-3 text-center w-20">Điểm số</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {specifications.map((spec, idx) => (
              <tr key={spec.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3 border-r border-slate-300 text-center font-semibold text-slate-700">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 border-r border-slate-300 font-bold text-slate-900">
                  {spec.topic}
                </td>
                <td className="py-3 px-4 border-r border-slate-300 text-slate-700 font-medium">
                  {spec.knowledgeUnit}
                </td>
                <td className="py-3 px-4 border-r border-slate-300 text-slate-800 leading-relaxed text-[11px]">
                  {spec.learningOutcome}
                </td>
                <td className="py-3 px-3 border-r border-slate-300 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      spec.level === 'Nhận biết'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : spec.level === 'Thông hiểu'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : spec.level === 'Vận dụng'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {spec.level}
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-300 text-slate-700 font-medium">
                  {spec.questionType}
                </td>
                <td className="py-3 px-3 border-r border-slate-300 text-center font-semibold text-blue-700">
                  {spec.questionNumbers}
                </td>
                <td className="py-3 px-3 border-r border-slate-300 text-center font-bold text-slate-900">
                  {spec.questionCount}
                </td>
                <td className="py-3 px-3 text-center font-extrabold text-blue-800">
                  {spec.totalScore} đ
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
              <td colSpan={7} className="py-3 px-4 text-right">
                TỔNG CỘNG TOÀN BỘ ĐẶC TẢ:
              </td>
              <td className="py-3 px-3 text-center text-blue-800">
                {specifications.reduce((sum, s) => sum + s.questionCount, 0)} câu
              </td>
              <td className="py-3 px-3 text-center text-blue-800">
                {Number(specifications.reduce((sum, s) => sum + s.totalScore, 0).toFixed(2))} đ
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
