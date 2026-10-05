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

// Multi-model executor with fallback for high demand spikes
async function generateWithFallback(options: {
  contents: any;
  systemInstruction: string;
}) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: 'application/json',
        },
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying fallback:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối đến mô hình AI');
}

// System instruction for Vietnamese Exam Generation
const EXAM_SYSTEM_INSTRUCTION = `Bạn là Chuyên gia Khảo thí và Đo lường Đánh giá Giáo dục hàng đầu Việt Nam, chuyên biên soạn đề kiểm tra, ma trận đề và bản đặc tả theo đúng Chương trình Giáo dục Phổ thông (GDPT 2018) cho cả 3 cấp: Tiểu học, THCS và THPT.

QUY TẮC SỐNG CÒN:
1. TUYỆT ĐỐI KHÔNG TRÙNG LẶP: Mỗi câu hỏi trong đề PHẢI KHÁC BIỆT HOÀN TOÀN 100% về nội dung, tình huống, số liệu bài toán và khía cạnh khảo sát. Nghiêm cấm dùng một mẫu câu lặp lại cho nhiều câu hỏi!
2. ĐÚNG CHUẨN KIẾN THỨC MÔN VÀ KHỐI LỚP: Phù hợp lứa tuổi học sinh Việt Nam.
3. RẢI ĐỀU NỘI DUNG: Các câu hỏi trắc nghiệm và tự luận phải bao quát toàn diện các nhánh kiến thức khác nhau của chủ đề (khái niệm, tính chất, đồ thị/sơ đồ, giải toán, bài toán liên hệ thực tế đời sống).
4. MÔN TÍNH TOÁN: Nghiệm chẵn, số liệu thực tế, giải đúng từng bước, phương án nhiễu hợp lý và cùng kiểu dữ liệu.
5. ĐỊNH DẠNG CÂU HỎI:
   - mcq_4: Đúng 4 lựa chọn ['A. ...', 'B. ...', 'C. ...', 'D. ...'], đáp án là 'A', 'B', 'C' hoặc 'D'.
   - true_false: 4 ý a, b, c, d rõ ràng với statement và isCorrect boolean.
   - short_answer: Trả lời ngắn là giá trị số hoặc từ khóa cô đọng.
   - essay_*: Tự luận có đề bài cụ thể và explanation là hướng dẫn chấm chi tiết từng ý/bước.
6. ĐẦU RA BẮT BUỘC LÀ JSON ARRAY CÁC CÂU HỎI.`;

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

    const requestedTypes = Object.entries(questionCounts || {})
      .filter(([_, count]) => Number(count) > 0)
      .map(([type, count]) => `${type}: ${count} câu`);

    const totalQuestions = Object.values(questionCounts || {}).reduce(
      (a: number, b: any) => a + (Number(b) || 0),
      0
    );

    const teacherQs = Array.isArray(teacherQuestions) && keepTeacherQuestions ? teacherQuestions : [];
    const neededCount = Math.max(0, totalQuestions - teacherQs.length);

    // Build prompt with heavy emphasis on diversity
    let prompt = `YÊU CẦU BIÊN SOẠN BỘ ĐỀ KIỂM TRA ĐA DẠNG:
- Cấp học: ${level.toUpperCase()}
- Khối lớp: Lớp ${grade}
- Môn học: ${subject}
- Tên chủ đề / bài học: ${topic}
- Chương: ${chapter || 'Theo chương trình'}
- Phạm vi kiến thức: ${scope || topic}
- Nội dung trọng tâm cần kiểm tra: ${testedContent || topic}
- Yêu cầu cần đạt: ${learningOutcomes || 'Chuẩn kiến thức kĩ năng GDPT 2018'}
- Ghi chú giáo viên: ${teacherNotes || 'Không có'}
- Thang điểm đề thi: ${scoreScale || 10} điểm
- Tổng số câu cần sinh: đúng ${neededCount} câu hỏi MỚI KHÁC NHAU HOÀN TOÀN.

Cơ cấu các dạng câu hỏi cần sinh:
${requestedTypes.join('\n')}

Phân bổ 4 mức độ nhận thức:
- Nhận biết: ${cognitiveDistribution?.values?.recognition}%
- Thông hiểu: ${cognitiveDistribution?.values?.comprehension}%
- Vận dụng: ${cognitiveDistribution?.values?.application}%
- Vận dụng cao: ${cognitiveDistribution?.values?.highApplication}%

QUY ĐỊNH BẮT BUỘC:
Mỗi câu hỏi từ câu 1 đến câu ${neededCount} phải là một bài toán / câu hỏi độc lập, hỏi về một khía cạnh riêng biệt của bài học "${topic}", với các con số, công thức, ngữ liệu và tình huống KHÔNG ĐƯỢC GIỐNG NHAU.
`;

    if (referenceMode === 'only_reference') {
      prompt += `\nLƯU Ý: Chế độ "Chỉ sử dụng tài liệu đã cung cấp". Hãy bám sát ngữ liệu bên dưới.\n`;
    }

    if (lessonContent && lessonContent.trim().length > 0) {
      prompt += `\n--- VĂN BẢN / NỘI DUNG BÀI HỌC GIÁO VIÊN CUNG CẤP ---\n${lessonContent.slice(0, 8000)}\n----------------------------------------------------\n`;
    }

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

    prompt += `\nHãy trả về đúng ${neededCount} câu hỏi đa dạng, chất lượng cao dưới dạng JSON array:
[
  {
    "id": "Q01",
    "subject": "${subject}",
    "grade": "Lớp ${grade}",
    "topic": "${topic}",
    "questionType": "mcq_4",
    "questionTypeName": "Trắc nghiệm 4 lựa chọn",
    "level": "Nhận biết",
    "question": "Nội dung câu hỏi cụ thể, giàu tính khoa học...",
    "readingPassage": "",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctAnswer": "A",
    "explanation": "Lời giải thích rõ ràng chi tiết...",
    "score": 0.5,
    "learningOutcome": "Chuẩn đầu ra cụ thể của câu này",
    "subItems": [],
    "needsReview": false,
    "reviewReason": ""
  }
]`;

    contents.push({ text: prompt });

    const rawResponse = await generateWithFallback({
      contents: contents.length === 1 ? prompt : { parts: contents },
      systemInstruction: EXAM_SYSTEM_INSTRUCTION,
    });

    const generatedQuestions = extractJsonFromText(rawResponse || '[]');
    const finalQuestions = [...teacherQs, ...generatedQuestions];

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

    const currentSum = Number(finalQuestions.reduce((s, q) => s + (q.score || 0), 0).toFixed(2));
    const scoreDiff = Number((totalScoreTarget - currentSum).toFixed(2));
    if (scoreDiff !== 0 && finalQuestions.length > 0) {
      finalQuestions[finalQuestions.length - 1].score = Number(
        (finalQuestions[finalQuestions.length - 1].score + scoreDiff).toFixed(2)
      );
    }

    return res.json({ success: true, questions: finalQuestions });
  } catch (error: any) {
    console.error('Error generating exam:', error);
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

    const rawText = await generateWithFallback({
      contents: prompt,
      systemInstruction: EXAM_SYSTEM_INSTRUCTION,
    });

    const newQuestion = extractJsonFromText(rawText || '{}');
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

    const rawText = await generateWithFallback({
      contents: prompt,
      systemInstruction: EXAM_SYSTEM_INSTRUCTION,
    });

    const newQuestions = extractJsonFromText(rawText || '[]');
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

    const rawText = await generateWithFallback({
      contents: prompt,
      systemInstruction: EXAM_SYSTEM_INSTRUCTION,
    });

    const questions = extractJsonFromText(rawText || '[]');
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
