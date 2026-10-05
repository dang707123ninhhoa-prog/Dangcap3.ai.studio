import React from 'react';
import { BookText, FileText, Target, StickyNote, HelpCircle } from 'lucide-react';

interface Step4KnowledgeProps {
  topic: string;
  chapter: string;
  scope: string;
  testedContent: string;
  learningOutcomes: string;
  teacherNotes: string;
  lessonContent: string;
  onChange: (fields: Partial<{
    topic: string;
    chapter: string;
    scope: string;
    testedContent: string;
    learningOutcomes: string;
    teacherNotes: string;
    lessonContent: string;
  }>) => void;
}

export const Step4Knowledge: React.FC<Step4KnowledgeProps> = ({
  topic,
  chapter,
  scope,
  testedContent,
  learningOutcomes,
  teacherNotes,
  lessonContent,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            4
          </span>
          NỘI DUNG KIẾN THỨC & YÊU CẦU
        </label>
        <span className="text-xs text-slate-400">Trọng tâm ra đề</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Tên bài / chủ đề */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên bài / Chủ đề <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            placeholder="VD: Khảo sát hàm số, Quang học, Chiến dịch Điện Biên Phủ..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Chương */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Chương / Phân môn
          </label>
          <input
            type="text"
            value={chapter}
            onChange={(e) => onChange({ chapter: e.target.value })}
            placeholder="VD: Chương I: Đạo hàm và ứng dụng..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Phạm vi kiến thức */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phạm vi kiến thức
          </label>
          <input
            type="text"
            value={scope}
            onChange={(e) => onChange({ scope: e.target.value })}
            placeholder="VD: Từ tuần 1 đến tuần 8, hoặc từ Bài 1 đến Bài 12"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Nội dung cần kiểm tra */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nội dung cần kiểm tra
          </label>
          <input
            type="text"
            value={testedContent}
            onChange={(e) => onChange({ testedContent: e.target.value })}
            placeholder="VD: Khảo sát tính đơn điệu, cực trị, giải toán thực tế..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Yêu cầu cần đạt */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span>Yêu cầu cần đạt (Chuẩn đầu ra)</span>
          <span className="text-[11px] text-slate-400 font-normal">Theo CT GDPT 2018</span>
        </label>
        <textarea
          rows={2}
          value={learningOutcomes}
          onChange={(e) => onChange({ learningOutcomes: e.target.value })}
          placeholder="VD: Học sinh nhận biết được công thức, tính được nghiệm, vận dụng giải thích hiện tượng thực tiễn..."
          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
        />
      </div>

      {/* Ghi chú của giáo viên */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Ghi chú / Lưu ý của giáo viên
        </label>
        <input
          type="text"
          value={teacherNotes}
          onChange={(e) => onChange({ teacherNotes: e.target.value })}
          placeholder="VD: Không ra câu hỏi liên quan đến phần giảm tải, số liệu bài toán phải chẵn..."
          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
        />
      </div>

      {/* Vùng dán văn bản bài học / SGK */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-blue-700">
            <FileText className="w-3.5 h-3.5" />
            Dán nội dung bài học / Văn bản đọc hiểu / Ngữ liệu SGK
          </span>
          <span className="text-[11px] text-slate-400">Tùy chọn (ưu tiên ra đề từ văn bản này)</span>
        </label>
        <textarea
          rows={4}
          value={lessonContent}
          onChange={(e) => onChange({ lessonContent: e.target.value })}
          placeholder="Giáo viên có thể sao chép và dán toàn bộ nội dung bài học, đoạn trích văn học, bài báo hoặc lý thuyết SGK vào đây. AI sẽ bám sát tuyệt đối ngữ liệu này để đặt câu hỏi..."
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 font-mono"
        />
      </div>
    </div>
  );
};
