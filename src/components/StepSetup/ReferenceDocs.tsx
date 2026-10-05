import React, { useRef } from 'react';
import { ReferenceDocument, ReferenceMode } from '../../types/exam';
import { UploadCloud, File, FileText, Image as ImageIcon, Trash2, ShieldAlert, CheckSquare } from 'lucide-react';

interface ReferenceDocsProps {
  documents: ReferenceDocument[];
  referenceMode: ReferenceMode;
  onUpdateDocuments: (docs: ReferenceDocument[]) => void;
  onUpdateMode: (mode: ReferenceMode) => void;
}

export const ReferenceDocs: React.FC<ReferenceDocsProps> = ({
  documents,
  referenceMode,
  onUpdateDocuments,
  onUpdateMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: ReferenceDocument[] = [...documents];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');

      if (isTxt) {
        const text = await file.text();
        newDocs.push({
          id: `DOC_${Date.now()}_${i}`,
          name: file.name,
          type: 'txt',
          content: text,
          size: file.size,
        });
      } else if (isImg || isPdf) {
        const reader = new FileReader();
        reader.onload = () => {
          newDocs.push({
            id: `DOC_${Date.now()}_${i}`,
            name: file.name,
            type: isImg ? 'image' : 'pdf',
            content: reader.result as string,
            mimeType: file.type,
            size: file.size,
          });
          onUpdateDocuments([...newDocs]);
        };
        reader.readAsDataURL(file);
      } else {
        // Fallback for Word or other text files
        try {
          const text = await file.text();
          newDocs.push({
            id: `DOC_${Date.now()}_${i}`,
            name: file.name,
            type: 'docx',
            content: text,
            size: file.size,
          });
        } catch {
          newDocs.push({
            id: `DOC_${Date.now()}_${i}`,
            name: file.name,
            type: 'text',
            content: `Tệp tin: ${file.name}`,
            size: file.size,
          });
        }
      }
    }

    onUpdateDocuments(newDocs);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDoc = (id: string) => {
    onUpdateDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <UploadCloud className="w-4 h-4 text-blue-600" />
          TÀI LIỆU THAM CHIẾU & NGUỒN DỮ LIỆU
        </label>
        <span className="text-[11px] text-slate-500">
          PDF, Word, TXT, Ảnh chụp SGK, Đề cũ...
        </span>
      </div>

      {/* Upload button area */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept=".pdf,.docx,.txt,image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors shadow-xs"
        >
          <UploadCloud className="w-4 h-4 text-blue-600" />
          Tải tài liệu lên (PDF, Docx, TXT, Ảnh)
        </button>

        <span className="text-[11px] text-slate-500 italic">
          {documents.length === 0 ? 'Chưa có tệp nào' : `Đã tải ${documents.length} tệp tài liệu`}
        </span>
      </div>

      {/* Uploaded files list */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-xs"
            >
              {doc.type === 'image' ? (
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span className="max-w-[140px] truncate font-medium">{doc.name}</span>
              <button
                type="button"
                onClick={() => removeDoc(doc.id)}
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                title="Xóa tài liệu này"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reference Modes */}
      <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 block">
          Chế độ sử dụng nguồn tài liệu:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label
            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-start gap-2 transition-all ${
              referenceMode === 'only_reference'
                ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900 ring-1 ring-blue-300'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="refMode"
              checked={referenceMode === 'only_reference'}
              onChange={() => onUpdateMode('only_reference')}
              className="mt-0.5"
            />
            <div>
              <span>Chỉ dùng tài liệu tải lên</span>
              <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                Không tự bổ sung kiến thức ngoài
              </p>
            </div>
          </label>

          <label
            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-start gap-2 transition-all ${
              referenceMode === 'reference_and_curriculum'
                ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900 ring-1 ring-blue-300'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="refMode"
              checked={referenceMode === 'reference_and_curriculum'}
              onChange={() => onUpdateMode('reference_and_curriculum')}
              className="mt-0.5"
            />
            <div>
              <span>Tài liệu + CT phổ thông</span>
              <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                Ưu tiên tài liệu kết hợp chuẩn GDPT
              </p>
            </div>
          </label>

          <label
            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-start gap-2 transition-all ${
              referenceMode === 'teacher_custom'
                ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900 ring-1 ring-blue-300'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="refMode"
              checked={referenceMode === 'teacher_custom'}
              onChange={() => onUpdateMode('teacher_custom')}
              className="mt-0.5"
            />
            <div>
              <span>Tự nhập nội dung</span>
              <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                Chỉ dựa vào yêu cầu giáo viên gõ
              </p>
            </div>
          </label>
        </div>

        {referenceMode === 'only_reference' && documents.length === 0 && (
          <div className="flex items-center gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Lưu ý: Bạn đang chọn chế độ chỉ sử dụng tài liệu nhưng chưa tải tệp nào hoặc chưa dán nội dung bài học. Hãy tải tệp hoặc dán nội dung ở Bước 4.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
