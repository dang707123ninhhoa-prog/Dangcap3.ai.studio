import { GeneratedExamPackage, TestCodeExam, Question } from '../types/exam';

export function printExam() {
  window.print();
}

export function formatExamToPlainText(examPackage: GeneratedExamPackage, testCode?: string): string {
  const currentCode = testCode || examPackage.currentTestCode || '101';
  const testExam = examPackage.testCodes.find((t) => t.code === currentCode) || examPackage.testCodes[0];
  const { config } = examPackage;

  let out = `SỞ GD&ĐT ...................................         ${config.schoolName.toUpperCase()}\n`;
  out += `ĐỀ THI: ${config.examTitle.toUpperCase()}\n`;
  out += `MÔN: ${config.subject.toUpperCase()} - LỚP ${config.grade}\n`;
  out += `Thời gian làm bài: ${config.durationMinutes} phút (không kể thời gian giao đề)\n`;
  out += `Mã đề thi: ${currentCode}\n`;
  out += `------------------------------------------------------------------------------------\n`;
  out += `Họ và tên thí sinh: ....................................................\n`;
  out += `Số báo danh: ...........................................................\n\n`;

  // Group by question type
  testExam.questions.forEach((q, idx) => {
    const qNum = idx + 1;
    out += `Câu ${qNum} (${q.score} điểm) [${q.level}]: ${q.question}\n`;
    if (q.readingPassage) {
      out += `[Ngữ liệu]: ${q.readingPassage}\n\n`;
    }
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt) => {
        out += `   ${opt}\n`;
      });
    }
    if (q.subItems && q.subItems.length > 0) {
      q.subItems.forEach((sub) => {
        out += `   ${sub.id}) ${sub.statement}\n`;
      });
    }
    out += `\n`;
  });

  out += `\n----------------- HẾT -----------------\n`;
  out += `(Cán bộ coi thi không giải thích gì thêm)\n`;
  return out;
}

export function formatAnswerKeyToPlainText(examPackage: GeneratedExamPackage, testCode?: string): string {
  const currentCode = testCode || examPackage.currentTestCode || '101';
  const testExam = examPackage.testCodes.find((t) => t.code === currentCode) || examPackage.testCodes[0];
  const { config } = examPackage;

  let out = `ĐÁP ÁN & HƯỚNG DẪN CHẤM\n`;
  out += `ĐỀ THI: ${config.examTitle} - MÔN: ${config.subject} (LỚP ${config.grade})\n`;
  out += `Mã đề thi: ${currentCode}\n\n`;
  out += `I. BẢNG ĐÁP ÁN TRẮC NGHIỆM\n`;
  out += `Câu\tĐáp án\tĐiểm\n`;

  testExam.answerKey.forEach((k) => {
    out += `${k.questionNumber}\t${k.correctAnswer}\t${k.score}\n`;
  });

  out += `\nII. LỜI GIẢI CHI TIẾT & HƯỚNG DẪN CHẤM\n`;
  testExam.questions.forEach((q, idx) => {
    out += `Câu ${idx + 1}: ${q.question}\n`;
    out += `-> Đáp án: ${q.correctAnswer}\n`;
    out += `-> Hướng dẫn: ${q.explanation}\n\n`;
  });

  return out;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve(true);
    } catch {
      textArea.remove();
      return Promise.resolve(false);
    }
  }
}

export function downloadWordDocument(filename: string, htmlContent: string) {
  const header = `<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>${filename}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #000; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .header-table { border: none; margin-bottom: 20px; }
    .header-table td { border: none; padding: 4px; }
    .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 10px 0; }
    .question { margin-bottom: 12px; }
    .bold { font-weight: bold; }
    .text-center { text-align: center; }
  </style></head><body>`;
  const footer = `</body></html>`;
  const source = header + htmlContent + footer;

  const blob = new Blob(['\ufeff', source], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
