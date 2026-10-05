import React, { useState } from 'react';
import { Question, QuestionType, CognitiveLevel } from '../../types/exam';
import { Lock, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface TeacherQuestionsInputProps {
  questions: Question[];
  keepTeacherQuestions: boolean;
  onUpdateQuestions: (qs: Question[]) => void;
  onToggleKeep: (keep: boolean) => void;
  subject: string;
  grade: number;
}

export const TeacherQuestionsInput: React.FC<TeacherQuestionsInputProps> = ({
  questions,
  keepTeacherQuestions,
  onUpdateQuestions,
  onToggleKeep,
  subject,
  grade,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newType, setNewType] = useState<QuestionType>('mcq_4');
  const [newLevel, setNewLevel] = useState<CognitiveLevel>('Nhận biết');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('A');
  const [newScore, setNewScore] = useState<number>(0.5);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    const formattedOptions =
      newType === 'mcq_4'
        ? newOptions.map((opt, i) => `${['A', 'B', 'C', 'D'][i]}. ${opt.trim()}`)
        : undefined;

    const newQ: Question = {
      id: `TQ_${Date.now()}`,
      subject,
      grade: `Lớp ${grade}`,
      topic: 'Nội dung giáo viên tự soạn',
      questionType: newType,
      questionTypeName: newType === 'mcq_4' ? 'Trắc nghiệm 4 lựa chọn' : 'Tự luận',
      level: newLevel,
      question: newQuestionText.trim(),
      options: formattedOptions,
      correctAnswer: newCorrectAnswer,
      explanation: 'Đáp án chuẩn do giáo viên trực tiếp cung cấp',
      score: newScore,
      isTeacherProvided: true,
    };

    onUpdateQuestions([...questions, newQ]);
    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
  };

  const handleRemove = (id: string) => {
    onUpdateQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            CÂU HỎI CÓ SẴN CỦA GIÁO VIÊN ({questions.length})
          </label>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
        >
          {isOpen ? 'Thu gọn' : 'Thêm câu hỏi có sẵn'}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Checkbox "Giữ nguyên câu hỏi giáo viên đã nhập" */}
      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={keepTeacherQuestions}
            onChange={(e) => onToggleKeep(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
          />
          <span>Giữ nguyên câu hỏi giáo viên đã nhập (AI không chỉnh sửa)</span>
        </label>
        {keepTeacherQuestions && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Khóa bảo vệ
          </span>
        )}
      </div>

      {/* Input panel if open */}
      {isOpen && (
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Dạng câu</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as QuestionType)}
                className="w-full px-2 py-1 text-xs border rounded bg-white text-slate-800"
              >
                <option value="mcq_4">Trắc nghiệm 4 lựa chọn</option>
                <option value="short_answer">Trả lời ngắn</option>
                <option value="essay_solve">Tự luận giải bài</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Mức độ</label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as CognitiveLevel)}
                className="w-full px-2 py-1 text-xs border rounded bg-white text-slate-800"
              >
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Điểm số</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                value={newScore}
                onChange={(e) => setNewScore(parseFloat(e.target.value) || 0.5)}
                className="w-full px-2 py-1 text-xs border rounded bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nội dung câu hỏi</label>
            <textarea
              rows={2}
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Nhập nội dung câu hỏi..."
              className="w-full px-2 py-1.5 text-xs border rounded text-slate-800"
            />
          </div>

          {newType === 'mcq_4' && (
            <div className="grid grid-cols-2 gap-1.5">
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <div key={letter} className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-500 w-4">{letter}.</span>
                  <input
                    type="text"
                    value={newOptions[idx]}
                    onChange={(e) => {
                      const opts = [...newOptions];
                      opts[idx] = e.target.value;
                      setNewOptions(opts);
                    }}
                    placeholder={`Phương án ${letter}`}
                    className="w-full px-2 py-1 text-xs border rounded text-slate-800"
                  />
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-700">Đáp án đúng:</span>
                {['A', 'B', 'C', 'D'].map((l) => (
                  <label key={l} className="inline-flex items-center gap-1 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="correctKey"
                      checked={newCorrectAnswer === l}
                      onChange={() => setNewCorrectAnswer(l)}
                    />
                    {l}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Lưu câu hỏi này
            </button>
          </div>
        </div>
      )}

      {/* List of teacher questions */}
      {questions.length > 0 && (
        <div className="space-y-1.5">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-start justify-between p-2 bg-white rounded-lg border border-emerald-200 text-xs shadow-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-emerald-800">Câu {idx + 1}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                    {q.level} • {q.score}đ
                  </span>
                </div>
                <p className="text-slate-800 line-clamp-1">{q.question}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(q.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
