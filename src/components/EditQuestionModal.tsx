import React, { useState, useEffect } from 'react';
import { Question, CognitiveLevel, QuestionType } from '../types/exam';
import { X, Save, Check } from 'lucide-react';

interface EditQuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
  onSave: (updatedQ: Question) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  question,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Question | null>(null);

  useEffect(() => {
    if (question) {
      setFormData({ ...question });
    }
  }, [question]);

  if (!isOpen || !formData) return null;

  const handleOptionChange = (idx: number, text: string) => {
    const letters = ['A', 'B', 'C', 'D'];
    const newOpts = [...(formData.options || [])];
    newOpts[idx] = `${letters[idx]}. ${text.replace(/^[A-D]\.\s*/, '')}`;
    setFormData({ ...formData, options: newOpts });
  };

  const handleSubItemChange = (idx: number, statement: string, isCorrect: boolean) => {
    const newItems = [...(formData.subItems || [])];
    newItems[idx] = { ...newItems[idx], statement, isCorrect };
    setFormData({ ...formData, subItems: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              CHỈNH SỬA CÂU HỎI {formData.id}
            </h3>
            <p className="text-xs text-slate-500">
              Điều chỉnh nội dung, các phương án, đáp án đúng và điểm số
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mức độ nhận thức</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as CognitiveLevel })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Điểm số</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề câu hỏi</label>
              <input
                type="text"
                value={formData.topic || ''}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Ngữ liệu đọc hiểu nếu có */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngữ liệu / Đoạn văn đọc hiểu (nếu có)
            </label>
            <textarea
              rows={2}
              value={formData.readingPassage || ''}
              onChange={(e) => setFormData({ ...formData, readingPassage: e.target.value })}
              placeholder="Ngữ liệu, bài thơ hoặc đoạn trích..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
            />
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung câu hỏi <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>

          {/* MCQ Options */}
          {formData.options && formData.options.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Các phương án lựa chọn:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.options.map((opt, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx];
                  const cleanText = opt.replace(/^[A-D]\.\s*/, '');
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center font-bold text-xs text-blue-700">{letter}.</span>
                      <input
                        type="text"
                        value={cleanText}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold text-slate-700">Khóa đáp án đúng:</span>
                {['A', 'B', 'C', 'D'].map((l) => (
                  <label key={l} className="inline-flex items-center gap-1 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="editCorrect"
                      checked={formData.correctAnswer.trim().toUpperCase() === l}
                      onChange={() => setFormData({ ...formData, correctAnswer: l })}
                    />
                    {l}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sub-items for True/False */}
          {formData.subItems && formData.subItems.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Các ý Đúng / Sai (a, b, c, d):
              </label>
              {formData.subItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="font-bold text-xs w-4">{item.id})</span>
                  <input
                    type="text"
                    value={item.statement}
                    onChange={(e) => handleSubItemChange(idx, e.target.value, item.isCorrect)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleSubItemChange(idx, item.statement, !item.isCorrect)}
                    className={`px-3 py-1 rounded text-xs font-bold ${
                      item.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {item.isCorrect ? 'ĐÚNG' : 'SAI'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Correct answer text (for non-MCQ) */}
          {(!formData.options || formData.options.length === 0) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đáp án / Kết quả chính xác
              </label>
              <input
                type="text"
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-bold text-blue-900"
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hướng dẫn giải chi tiết / Hướng dẫn chấm
            </label>
            <textarea
              rows={3}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
