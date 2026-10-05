import React from 'react';
import { GeneratedExamPackage, Question } from '../../types/exam';
import { ClipboardCheck, Info, CheckCircle } from 'lucide-react';

interface GradingGuideProps {
  examPackage: GeneratedExamPackage;
}

export const GradingGuide: React.FC<GradingGuideProps> = ({ examPackage }) => {
  const currentExam = examPackage.testCodes[0];
  const { questions } = currentExam;
  const { config } = examPackage;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-1">
          <ClipboardCheck className="w-4 h-4 text-blue-600" />
          HƯỚNG DẪN CHẤM & NỘI DUNG CẦN ĐẠT
        </h3>
        <p className="text-xs text-slate-500">
          Quy định tiêu chuẩn đánh giá, thang điểm thành phần và nguyên tắc chấm bài thi
        </p>
      </div>

      {/* General Instructions */}
      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
        <h4 className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-700" />
          NGUYÊN TẮC CHẤM CHUNG:
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>
            <strong>Đối với phần trắc nghiệm:</strong> Chấm đúng đáp án theo bảng đáp án chuẩn. Mỗi câu trả lời đúng được tính trọn số điểm của câu đó; chọn sai hoặc không chọn được 0 điểm.
          </li>
          <li>
            <strong>Đối với bài toán / tự luận:</strong> Nếu học sinh làm bài theo cách khác nhưng đúng bản chất, lập luận chặt chẽ và ra kết quả chính xác thì vẫn cho điểm tối đa theo từng phần tương ứng.
          </li>
          <li>
            <strong>Điểm toàn bài:</strong> Làm tròn đến chữ số thập phân thứ hai hoặc làm tròn theo quy định hiện hành của cơ sở giáo dục.
          </li>
        </ul>
      </div>

      {/* Rubric table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
              <th className="py-2.5 px-3 border-r border-slate-200 w-16 text-center">Câu</th>
              <th className="py-2.5 px-4 border-r border-slate-200">Nội dung yêu cầu cần đạt</th>
              <th className="py-2.5 px-4 border-r border-slate-200 w-32 text-center">Điểm thành phần</th>
              <th className="py-2.5 px-4 border-r border-slate-200 w-24 text-center">Tổng điểm</th>
              <th className="py-2.5 px-4">Lưu ý khi chấm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {questions.map((q, idx) => {
              const qNum = idx + 1;
              const isMcq = q.questionType === 'mcq_4' || q.questionType === 'short_answer';
              return (
                <tr key={q.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 border-r border-slate-200 text-center font-bold text-slate-900">
                    Câu {qNum}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-200 text-slate-800 leading-relaxed">
                    <p className="font-semibold text-slate-900 mb-1">{q.learningOutcome || q.topic}</p>
                    <p className="text-[11px] text-slate-600">
                      {q.explanation || `Yêu cầu đạt chuẩn kiến thức mức độ ${q.level}.`}
                    </p>
                  </td>
                  <td className="py-3 px-4 border-r border-slate-200 text-center text-slate-700">
                    {isMcq ? (
                      <span>Đúng: +{q.score} đ</span>
                    ) : (
                      <span className="text-[11px] block leading-tight">
                        - Bước 1: +{(q.score * 0.4).toFixed(2)} đ<br />
                        - Bước 2: +{(q.score * 0.6).toFixed(2)} đ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-200 text-center font-bold text-blue-700">
                    {q.score} đ
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {isMcq ? 'Tô đúng phương án quy định' : 'Trình bày rõ ràng, không sai bước lập luận'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50/80 font-bold text-slate-900 border-t border-slate-300">
              <td colSpan={3} className="py-3 px-4 text-right">
                TỔNG ĐIỂM TOÀN BÀI THI:
              </td>
              <td className="py-3 px-4 text-center text-blue-800 font-extrabold text-sm">
                {config.scoreScale || 10} điểm
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
