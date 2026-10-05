import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize and parse JSON from Gemini text response
function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// System instruction for Vietnamese Exam Generation
const EXAM_SYSTEM_INSTRUCTION = `Bạn là Chuyên gia Khảo thí và Đo lường Đánh giá Giáo dục hàng đầu Việt Nam, chuyên biên soạn đề kiểm tra, ma trận đề và bản đặc tả theo đúng Chương trình Giáo dục Phổ thông (GDPT 2018) cho cả 3 cấp: Tiểu học, THCS và THPT.

QUY TẮC BẮT BUỘC:
1. ĐÚNG CHUẨN KIẾN THỨC: Phù hợp đúng lứa tuổi, khối lớp, môn học và cấp học của Việt Nam.
2. TÀI LIỆU THAM CHIẾU: Nếu giáo viên yêu cầu "Chỉ sử dụng tài liệu đã cung cấp", BẮT BUỘC ưu tiên tuyệt đối ngữ liệu trong tài liệu, KHÔNG tự bịa đặt hoặc mở rộng ngoài phạm vi. Nếu dữ liệu không đủ, đánh dấu needsReview = true và nêu rõ trong reviewReason.
3. MÔN TÍNH TOÁN (Toán, Vật lí, Hóa học, KHTN):
   - Đảm bảo giải lại từng bài toán trước khi ra đề.
   - Số liệu chẵn, đẹp, không tạo phương trình vô nghiệm ngoài ý muốn.
   - Các phương án nhiễu trắc nghiệm phải cùng kiểu dữ liệu, hợp lý, không chênh lệch vô lý.
4. MÔN NGỮ VĂN, TIẾNG VIỆT, TIẾNG ANH:
   - Ngữ liệu đọc hiểu giàu giá trị thẩm mĩ, nhân văn, phù hợp lứa tuổi.
   - Có câu hỏi nhận biết, thông hiểu, vận dụng và viết đoạn/bài.
5. MÔN LỊCH SỬ, ĐỊA LÍ, GDCD, KINH TẾ PHÁP LUẬT:
   - Mốc thời gian, nhân vật, địa danh, thuật ngữ và số liệu lịch sử phải chính xác 100%.
6. ĐỊNH DẠNG CÂU HỎI:
   - mcq_4: Trắc nghiệm 4 lựa chọn, options gồm đúng 4 chuỗi ['A. ...', 'B. ...', 'C. ...', 'D. ...'], correctAnswer là 'A', 'B', 'C' hoặc 'D'.
   - true_false: Trắc nghiệm Đúng/Sai gồm 4 ý a, b, c, d (chuẩn ĐGNL/GDPT 2018), subItems: [{ id: 'a', statement: '...', isCorrect: true/false }, ...]
   - short_answer: Trả lời ngắn, correctAnswer là con số hoặc cụm từ ngắn gọn.
   - Các câu tự luận (essay_*): Lời giải thích (explanation) phải là hướng dẫn chấm và đáp án chi tiết từng bước.
7. AN TOÀN HỌC THUẬT:
   - Nếu có bất kỳ nghi vấn hoặc phương án cần giáo viên kiểm tra lại, đặt needsReview: true kèm reviewReason.
8. ĐẦU RA BẮT BUỘC LÀ JSON ARRAY CÁC CÂU HỎI.`;

// API: Generate Exam Questions
app.post('/api/generate-exam', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    const {
      level,
      grade,
      subject,
      topic,
      chapter,
      scope,
      testedContent,
      learningOutcomes,
      teacherNotes,
      lessonContent,
      referenceDocuments,
      referenceMode,
      questionCounts,
      cognitiveDistribution,
      scoreScale,
      teacherQuestions,
      keepTeacherQuestions,
    } = config;

    // Filter which question types are requested
    const requestedTypes = Object.entries(questionCounts || {})
      .filter(([_, count]) => Number(count) > 0)
      .map(([type, count]) => `${type}: ${count} câu`);

    const totalQuestions = Object.values(questionCounts || {}).reduce(
      (a: number, b: any) => a + (Number(b) || 0),
      0
    );

    const teacherQs = Array.isArray(teacherQuestions) && keepTeacherQuestions ? teacherQuestions : [];
    const neededCount = Math.max(0, totalQuestions - teacherQs.length);

    // Build prompt
    let prompt = `YÊU CẦU RA ĐỀ KIỂM TRA:
- Cấp học: ${level.toUpperCase()}
- Khối lớp: Lớp ${grade}
- Môn học: ${subject}
- Tên chủ đề / bài học: ${topic}
- Chương: ${chapter || 'Theo chương trình'}
- Phạm vi kiến thức: ${scope || topic}
- Nội dung trọng tâm cần kiểm tra: ${testedContent || topic}
- Yêu cầu cần đạt: ${learningOutcomes || 'Chuẩn kiến thức kĩ năng'}
- Ghi chú thêm của giáo viên: ${teacherNotes || 'Không có'}
- Thang điểm đề thi: ${scoreScale || 10} điểm
- Tổng số câu cần sinh mới: ${neededCount} câu (Giáo viên đã cung cấp sẵn ${teacherQs.length} câu)
- Cơ cấu các dạng câu hỏi yêu cầu sinh:
${requestedTypes.join('\n')}

- Phân bổ 4 mức độ nhận thức (${cognitiveDistribution?.mode === 'count' ? 'Theo số câu' : 'Theo tỷ lệ %'}):
  + Nhận biết: ${cognitiveDistribution?.values?.recognition}%
  + Thông hiểu: ${cognitiveDistribution?.values?.comprehension}%
  + Vận dụng: ${cognitiveDistribution?.values?.application}%
  + Vận dụng cao: ${cognitiveDistribution?.values?.highApplication}%
`;

    if (referenceMode === 'only_reference') {
      prompt += `\nĐẶC BIỆT LƯU Ý: Chế độ "Chỉ sử dụng tài liệu đã cung cấp". Chỉ sử dụng kiến thức, ngữ liệu và dữ kiện có trong nội dung bài học hoặc tài liệu đính kèm bên dưới. Tuyệt đối không thêm kiến thức ngoài.\n`;
    }

    if (lessonContent && lessonContent.trim().length > 0) {
      prompt += `\n--- VĂN BẢN / NỘI DUNG BÀI HỌC GIÁO VIÊN CUNG CẤP ---\n${lessonContent.slice(0, 8000)}\n----------------------------------------------------\n`;
    }

    // Assemble parts (text + any document contents/images)
    const contents: any[] = [];
    if (referenceDocuments && Array.isArray(referenceDocuments)) {
      referenceDocuments.forEach((doc: any) => {
        if (doc.type === 'image' && doc.content) {
          const match = doc.content.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
          if (match) {
            contents.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        } else if (doc.type === 'pdf' && doc.content) {
          const match = doc.content.match(/^data:application\/pdf;base64,(.+)$/);
          if (match) {
            contents.push({
              inlineData: {
                mimeType: 'application/pdf',
                data: match[1],
              },
            });
          }
        } else if (doc.content) {
          prompt += `\n[Tài liệu đính kèm: ${doc.name}]:\n${doc.content.slice(0, 4000)}\n`;
        }
      });
    }

    prompt += `\nHãy sinh đúng ${neededCount} câu hỏi chuẩn xác, có tính phân loại cao, không trùng lặp, chia đều điểm theo thang ${scoreScale || 10}.
Trả về định dạng JSON array danh sách các câu hỏi theo schema sau:
[
  {
    "id": "Q01",
    "subject": "${subject}",
    "grade": "Lớp ${grade}",
    "topic": "${topic}",
    "questionType": "mcq_4" (hoặc true_false, short_answer, essay_solve, reading_comp, ...),
    "questionTypeName": "Tên loại câu",
    "level": "Nhận biết" (hoặc "Thông hiểu", "Vận dụng", "Vận dụng cao"),
    "question": "Nội dung câu hỏi...",
    "readingPassage": "Ngữ liệu đọc hiểu nếu có (hoặc để trống)",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."] (nếu là trắc nghiệm),
    "correctAnswer": "A",
    "explanation": "Lời giải thích chi tiết, từng bước tính toán hoặc căn cứ trong bài...",
    "score": 0.5,
    "learningOutcome": "Yêu cầu cần đạt",
    "subItems": [
      { "id": "a", "statement": "...", "isCorrect": true },
      { "id": "b", "statement": "...", "isCorrect": false },
      { "id": "c", "statement": "...", "isCorrect": true },
      { "id": "d", "statement": "...", "isCorrect": false }
    ],
    "needsReview": false,
    "reviewReason": ""
  }
]`;

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length === 1 ? prompt : { parts: contents },
      config: {
        systemInstruction: EXAM_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const generatedQuestions = extractJsonFromText(response.text || '[]');
    
    // Combine with teacher questions if any
    const finalQuestions = [...teacherQs, ...generatedQuestions];

    // Ensure all questions have proper sequential IDs and valid scores
    const totalScoreTarget = scoreScale || 10;
    const baseScorePerQ = finalQuestions.length > 0 ? Number((totalScoreTarget / finalQuestions.length).toFixed(2)) : 0.5;

    finalQuestions.forEach((q, idx) => {
      q.id = `Q${String(idx + 1).padStart(2, '0')}`;
      if (!q.score || q.score <= 0) {
        q.score = baseScorePerQ;
      }
      if (!q.subject) q.subject = subject;
      if (!q.grade) q.grade = `Lớp ${grade}`;
      if (!q.topic) q.topic = topic;
    });

    // Adjust slight score difference so sum matches totalScoreTarget exactly
    const currentSum = Number(finalQuestions.reduce((s, q) => s + (q.score || 0), 0).toFixed(2));
    const scoreDiff = Number((totalScoreTarget - currentSum).toFixed(2));
    if (scoreDiff !== 0 && finalQuestions.length > 0) {
      finalQuestions[finalQuestions.length - 1].score = Number(
        (finalQuestions[finalQuestions.length - 1].score + scoreDiff).toFixed(2)
      );
    }

    return res.json({ success: true, questions: finalQuestions });
  } catch (error: any) {
    console.error('Error generating exam with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi kết nối với mô hình AI tạo đề',
    });
  }
});

// API: Regenerate single question
app.post('/api/regenerate-question', async (req: Request, res: Response) => {
  try {
    const { currentQuestion, config } = req.body;
    const prompt = `Hãy tạo lại 01 câu hỏi mới THAY THẾ cho câu sau nhưng giữ nguyên cấp học, lớp học, môn học, dạng câu và mức độ nhận thức:
- Cấp: ${config.level}
- Lớp: Lớp ${config.grade}
- Môn: ${config.subject}
- Chủ đề: ${currentQuestion.topic || config.topic}
- Dạng câu: ${currentQuestion.questionType} (${currentQuestion.questionTypeName})
- Mức độ: ${currentQuestion.level}
- Điểm số: ${currentQuestion.score}
- Câu cũ cần thay thế: "${currentQuestion.question}"

Yêu cầu: Câu mới phải khác nội dung câu cũ, hoàn toàn chuẩn xác về mặt khoa học và sư phạm, phương án nhiễu hợp lý.
Trả về JSON duy nhất 1 object theo cấu trúc câu hỏi:
{
  "id": "${currentQuestion.id}",
  "subject": "${config.subject}",
  "grade": "Lớp ${config.grade}",
  "topic": "${currentQuestion.topic || config.topic}",
  "questionType": "${currentQuestion.questionType}",
  "questionTypeName": "${currentQuestion.questionTypeName}",
  "level": "${currentQuestion.level}",
  "question": "Nội dung câu hỏi mới...",
  "readingPassage": "",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": "A",
  "explanation": "Hướng dẫn giải chi tiết...",
  "score": ${currentQuestion.score},
  "learningOutcome": "Yêu cầu cần đạt",
  "subItems": [],
  "needsReview": false,
  "reviewReason": ""
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: EXAM_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const newQuestion = extractJsonFromText(response.text || '{}');
    newQuestion.id = currentQuestion.id;
    newQuestion.score = currentQuestion.score;

    return res.json({ success: true, question: newQuestion });
  } catch (error: any) {
    console.error('Error regenerating question:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API: Generate Equivalent Exam
app.post('/api/generate-equivalent-exam', async (req: Request, res: Response) => {
  try {
    const { originalQuestions, config } = req.body;
    const prompt = `Bạn nhận được danh sách ${originalQuestions.length} câu hỏi của đề thi hiện tại.
Hãy tạo một ĐỀ THI TƯƠNG ĐƯƠNG với số lượng câu, dạng câu, mức độ nhận thức, thang điểm của từng câu GIỐNG NGUYÊN BẢN nhưng NỘI DUNG CÂU HỎI VÀ DỮ KIỆN ĐƯỢC THAY ĐỔI HOÀN TOÀN MỚI.

Môn: ${config.subject} - Lớp ${config.grade} (${config.level})
Chủ đề: ${config.topic}

Danh sách câu hỏi gốc:
${JSON.stringify(
  originalQuestions.map((q: any) => ({
    id: q.id,
    questionType: q.questionType,
    level: q.level,
    score: q.score,
    topic: q.topic,
  }))
)}

Trả về JSON array các câu hỏi mới tương đương:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: EXAM_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const newQuestions = extractJsonFromText(response.text || '[]');
    return res.json({ success: true, questions: newQuestions });
  } catch (error: any) {
    console.error('Error generating equivalent exam:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API: Generate Exam from Matrix
app.post('/api/generate-from-matrix', async (req: Request, res: Response) => {
  try {
    const { matrixText, config } = req.body;
    const prompt = `Dưới đây là MA TRẬN / BẢN ĐẶC TẢ ĐỀ THI được giáo viên cung cấp:
${matrixText}

Thông tin bổ sung:
- Môn: ${config.subject}
- Khối lớp: Lớp ${config.grade} (${config.level})
- Thang điểm: ${config.scoreScale || 10} điểm

Nhiệm vụ của bạn: Đọc và phân tích chính xác từng ô trong ma trận (Chủ đề, Dạng câu hỏi, Mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao, Số câu, Điểm số) và tạo ra một bộ câu hỏi khớp TUYỆT ĐỐI 100% với ma trận đó.
Không tự ý thay đổi số lượng câu hoặc tỷ lệ điểm.
Trả về JSON array danh sách các câu hỏi theo schema chuẩn.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: EXAM_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const questions = extractJsonFromText(response.text || '[]');
    return res.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error generating from matrix:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
