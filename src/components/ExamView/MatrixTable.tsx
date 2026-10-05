import React from 'react';
import { ExamMatrix, ExamConfig } from '../../types/exam';
import { Table, Sparkles, Award } from 'lucide-react';

interface MatrixTableProps {
  matrix: ExamMatrix;
  config: ExamConfig;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ matrix, config }) => {
  const { rows, totals } = matrix;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-600" />
            MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Môn: {config.subject} • Khối {config.grade} • Thời gian: {config.durationMinutes} phút • Thang điểm {config.scoreScale || 10}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Khớp đề: 100%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
            Tổng: {totals.totalCount} câu / {totals.totalScore} đ
          </span>
        </div>
      </div>

      {/* Standard Ministry Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse border border-slate-300">
          <thead>
            {/* Header Level 1 */}
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 w-12">
                TT
              </th>
              <th rowSpan={2} className="py-2.5 px-4 border-r border-slate-300 text-left min-w-[160px]">
                Chủ đề / Nội dung kiến thức
              </th>
              <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 min-w-[110px]">
                Đơn vị kiến thức / Kĩ năng
              </th>
              <th colSpan={3} className="py-2 px-2 border-r border-slate-300 bg-emerald-50 text-emerald-900">
                1. Mức độ Nhận biết
              </th>
              <th colSpan={3} className="py-2 px-2 border-r border-slate-300 bg-sky-50 text-sky-900">
                2. Mức độ Thông hiểu
              </th>
              <th colSpan={3} className="py-2 px-2 border-r border-slate-300 bg-amber-50 text-amber-900">
                3. Mức độ Vận dụng
              </th>
              <th colSpan={3} className="py-2 px-2 border-r border-slate-300 bg-rose-50 text-rose-900">
                4. Mức độ Vận dụng cao
              </th>
              <th colSpan={3} className="py-2 px-2 bg-blue-100/70 text-blue-900 font-extrabold">
                TỔNG CỘNG
              </th>
            </tr>

            {/* Header Level 2 (Sub-columns) */}
            <tr className="bg-slate-50 text-[11px] font-semibold text-slate-700 border-b border-slate-300">
              {/* Nhận biết */}
              <th className="py-1 px-1.5 border-r border-slate-300 w-10">Số câu</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-11">Điểm</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-10">%</th>

              {/* Thông hiểu */}
              <th className="py-1 px-1.5 border-r border-slate-300 w-10">Số câu</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-11">Điểm</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-10">%</th>

              {/* Vận dụng */}
              <th className="py-1 px-1.5 border-r border-slate-300 w-10">Số câu</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-11">Điểm</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-10">%</th>

              {/* Vận dụng cao */}
              <th className="py-1 px-1.5 border-r border-slate-300 w-10">Số câu</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-11">Điểm</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-10">%</th>

              {/* Tổng */}
              <th className="py-1 px-1.5 border-r border-slate-300 w-12 font-bold">Số câu</th>
              <th className="py-1 px-1.5 border-r border-slate-300 w-12 font-bold">Điểm</th>
              <th className="py-1 px-1.5 font-bold">%</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {rows.map((row, idx) => {
              const { cells } = row;
              return (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-2 border-r border-slate-300 font-semibold">{idx + 1}</td>
                  <td className="py-2.5 px-3 border-r border-slate-300 text-left font-bold text-slate-900">
                    {row.topic}
                  </td>
                  <td className="py-2.5 px-2 border-r border-slate-300 text-left text-slate-600">
                    {row.content}
                  </td>

                  {/* Nhận biết */}
                  <td className="py-2 px-1.5 border-r border-slate-300 font-medium">
                    {cells.recognitionCount || '-'}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300">
                    {cells.recognitionScore > 0 ? cells.recognitionScore : '-'}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300 text-slate-500">
                    {cells.recognitionScore > 0 ? `${Math.round((cells.recognitionScore / (config.scoreScale || 10)) * 100)}%` : '-'}
                  </td>

                  {/* Thông hiểu */}
                  <td className="py-2 px-1.5 border-r border-slate-300 font-medium">
                    {cells.comprehensionCount || '-'}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300">
                    {cells.comprehensionScore > 0 ? cells.comprehensionScore : '-'}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300 text-slate-500">
                    {cells.comprehensionScore > 0 ? `${Math.round((cells.comprehensionScore / (config.scoreScale || 10)) * 100)}%` : '-'}
                  </td>

                  {/* Vận dụng */}
                  <td className="py-2 px-1.5 border-r border-slate-300 font-medium">
                    {cells.applicationCount || '-'}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300">
                    {cells.applicationScore > 0 ? cells.applicationScore : '-'}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300 text-slate-500">
                    {cells.applicationScore > 0 ? `${Math.round((cells.applicationScore / (config.scoreScale || 10)) * 100)}%` : '-'}
                  </td>

                  {/* Vận dụng cao */}
                  <td className="py-2 px-1.5 border-r border-slate-300 font-medium">
                    {cells.highApplicationCount || '-'}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300">
                    {cells.highApplicationScore > 0 ? cells.highApplicationScore : '-'}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300 text-slate-500">
                    {cells.highApplicationScore > 0 ? `${Math.round((cells.highApplicationScore / (config.scoreScale || 10)) * 100)}%` : '-'}
                  </td>

                  {/* Tổng hàng */}
                  <td className="py-2 px-1.5 border-r border-slate-300 font-bold text-slate-900 bg-slate-50">
                    {cells.totalCount}
                  </td>
                  <td className="py-2 px-1.5 border-r border-slate-300 font-bold text-blue-700 bg-slate-50">
                    {cells.totalScore}
                  </td>
                  <td className="py-2 px-1.5 font-bold text-slate-700 bg-slate-50">
                    {cells.percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Bottom Totals */}
          <tfoot>
            <tr className="bg-blue-50/90 text-slate-900 font-extrabold border-t-2 border-slate-400">
              <td colSpan={3} className="py-3 px-4 text-center tracking-wider">
                TỔNG SỐ CÂU / TỔNG ĐIỂM
              </td>

              {/* Nhận biết */}
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-emerald-900">
                {totals.recognitionCount}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-emerald-900">
                {totals.recognitionScore}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-emerald-900">
                {totals.recognitionPercent}%
              </td>

              {/* Thông hiểu */}
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-sky-900">
                {totals.comprehensionCount}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-sky-900">
                {totals.comprehensionScore}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-sky-900">
                {totals.comprehensionPercent}%
              </td>

              {/* Vận dụng */}
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-amber-900">
                {totals.applicationCount}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-amber-900">
                {totals.applicationScore}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-amber-900">
                {totals.applicationPercent}%
              </td>

              {/* Vận dụng cao */}
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-rose-900">
                {totals.highApplicationCount}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-rose-900">
                {totals.highApplicationScore}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-rose-900">
                {totals.highApplicationPercent}%
              </td>

              {/* Tổng chung */}
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-blue-900 text-sm">
                {totals.totalCount}
              </td>
              <td className="py-2.5 px-1.5 border-r border-slate-300 text-blue-900 text-sm">
                {totals.totalScore}
              </td>
              <td className="py-2.5 px-1.5 text-blue-900 text-sm">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
