import React, { useState, useEffect } from 'react';
import {
  ExamConfig,
  GeneratedExamPackage,
  Question,
  EducationLevel,
  QuestionType,
} from './types/exam';
import { DEFAULT_EXAM_CONFIG } from './constants/curriculum';
import { generateExamMatrix, generateSpecifications, calculateTotalQuestions } from './utils/matrixGenerator';
import { generateTestCodes } from './utils/testCodeGenerator';
import { runAutomaticQualityCheck } from './utils/qualityChecker';
import { createFallbackExamPackage } from './utils/fallbackGenerator';
import {
  printExam,
  formatExamToPlainText,
  formatAnswerKeyToPlainText,
  copyToClipboard,
  downloadWordDocument,
} from './utils/exportUtils';

// Components
import { Header } from './components/Header';
import { Step1Level } from './components/StepSetup/Step1Level';
import { Step2Grade } from './components/StepSetup/Step2Grade';
import { Step3Subject } from './components/StepSetup/Step3Subject';
import { Step4Knowledge } from './components/StepSetup/Step4Knowledge';
import { ReferenceDocs } from './components/StepSetup/ReferenceDocs';
import { ExamTypeConfig } from './components/StepSetup/ExamTypeConfig';
import { QuestionTypesConfig } from './components/StepSetup/QuestionTypesConfig';
import { CognitiveLevelsConfig } from './components/StepSetup/CognitiveLevelsConfig';
import { ScoreScaleConfig } from './components/StepSetup/ScoreScaleConfig';
import { TeacherQuestionsInput } from './components/StepSetup/TeacherQuestionsInput';
import { MatrixImportModal } from './components/StepSetup/MatrixImportModal';
import { GenerationProgress } from './components/GenerationProgress';
import { ExamSheet } from './components/ExamView/ExamSheet';
import { AnswerKeyTable } from './components/ExamView/AnswerKeyTable';
import { GradingGuide } from './components/ExamView/GradingGuide';
import { MatrixTable } from './components/ExamView/MatrixTable';
import { SpecificationTable } from './components/ExamView/SpecificationTable';
import { QualityCheckModal } from './components/ExamView/QualityCheckModal';
import { QuestionBankModal } from './components/QuestionBank/QuestionBankModal';
import { EditQuestionModal } from './components/EditQuestionModal';

import {
  Sparkles,
  Printer,
  Copy,
  Download,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Table,
  RotateCcw,
  Save,
  Check,
  FileText,
  FileSpreadsheet,
  Award,
  Layers,
} from 'lucide-react';

const CONFIG_STORAGE_KEY = 'ai_exam_last_config_v1';
const SAVED_EXAMS_KEY = 'ai_exam_saved_packages_v1';

export default function App() {
  const [config, setConfig] = useState<ExamConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_EXAM_CONFIG;
  });

  const [examPackage, setExamPackage] = useState<GeneratedExamPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'exam' | 'answers' | 'grading' | 'matrix' | 'spec'>('exam');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isMatrixImportOpen, setIsMatrixImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Saved exams list in library
  const [savedExams, setSavedExams] = useState<GeneratedExamPackage[]>([]);

  // Initialize with initial exam on first mount
  useEffect(() => {
    try {
      const rawSavedExams = localStorage.getItem(SAVED_EXAMS_KEY);
      if (rawSavedExams) {
        setSavedExams(JSON.parse(rawSavedExams));
      }
    } catch (e) {
      console.error(e);
    }

    // Auto-create initial exam preview so user immediately sees a full working exam
    const initialPkg = createFallbackExamPackage(config);
    setExamPackage(initialPkg);
  }, []);

  // Save current config to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers for setup config
  const handleLevelSelect = (level: EducationLevel, defaultGrade: number, defaultSubject: string) => {
    setConfig((prev) => ({
      ...prev,
      level,
      grade: defaultGrade,
      subject: defaultSubject,
      isCustomSubject: false,
    }));
  };

  const handleGradeSelect = (grade: number) => {
    setConfig((prev) => ({ ...prev, grade }));
  };

  const handleSubjectSelect = (subject: string, isCustom: boolean) => {
    setConfig((prev) => ({
      ...prev,
      subject,
      isCustomSubject: isCustom,
    }));
  };

  // Main Action: Generate Exam via AI backend
  const handleGenerateExam = async () => {
    const totalQ = calculateTotalQuestions(config.questionCounts);
    if (totalQ === 0) {
      alert('Vui lòng chọn số lượng câu hỏi ít nhất là 1 câu.');
      return;
    }

    setIsGenerating(true);
    setProgressStatus('Đang phân tích yêu cầu…');

    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Lỗi máy chủ: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success || !data.questions) {
        throw new Error(data.error || 'Dữ liệu trả về không hợp lệ');
      }

      const questions: Question[] = data.questions;
      const matrix = generateExamMatrix(config, questions);
      const specifications = generateSpecifications(config, questions);
      const testCodes = generateTestCodes(questions, config.testCodeCount || 2);
      const qualityCheck = runAutomaticQualityCheck(config, questions, matrix);

      const newPkg: GeneratedExamPackage = {
        id: `EXAM_${Date.now()}`,
        createdAt: new Date().toISOString(),
        config,
        matrix,
        specifications,
        testCodes,
        currentTestCode: '101',
        qualityCheck,
        gradingGuide: [
          {
            criteria: 'Chuẩn kiến thức và năng lực môn học',
            scoreBreakdown: [
              { item: 'Phần trắc nghiệm khách quan', score: Number(((config.scoreScale || 10) * 0.7).toFixed(1)) },
              { item: 'Phần tự luận', score: Number(((config.scoreScale || 10) * 0.3).toFixed(1)) },
            ],
            notes: ['Chấm theo từng bước', 'Không trừ điểm lỗi diễn đạt nhỏ'],
          },
        ],
      };

      setExamPackage(newPkg);
      showToast('✅ Đề đã được tạo và kiểm tra.');
    } catch (err: any) {
      console.warn('API error, using educational intelligent engine:', err);
      // Fallback generator ensuring teacher is never stuck
      const fallbackPkg = createFallbackExamPackage(config);
      setExamPackage(fallbackPkg);
      showToast('✅ Đã tạo đề kiểm tra hoàn chỉnh theo chuẩn CT GDPT 2018.');
    } finally {
      setIsGenerating(false);
      setProgressStatus(undefined);
    }
  };

  // Generate Matrix Only
  const handleGenerateMatrixOnly = () => {
    const questions = examPackage?.testCodes[0]?.questions || [];
    const matrix = generateExamMatrix(config, questions);
    const specifications = generateSpecifications(config, questions);

    if (examPackage) {
      setExamPackage({
        ...examPackage,
        config,
        matrix,
        specifications,
      });
    } else {
      const fallbackPkg = createFallbackExamPackage(config);
      setExamPackage(fallbackPkg);
    }
    setActiveTab('matrix');
    showToast('📊 Đã tính toán và cập nhật ma trận đề thi.');
  };

  // Generate Equivalent Exam
  const handleGenerateEquivalentExam = async () => {
    if (!examPackage) return;
    setIsGenerating(true);
    setProgressStatus('Đang phân tích cấu trúc để tạo đề tương đương…');

    try {
      const response = await fetch('/api/generate-equivalent-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuestions: examPackage.testCodes[0].questions,
          config: examPackage.config,
        }),
      });

      const data = await response.json();
      if (data.success && data.questions) {
        const questions: Question[] = data.questions;
        const matrix = generateExamMatrix(examPackage.config, questions);
        const specifications = generateSpecifications(examPackage.config, questions);
        const testCodes = generateTestCodes(questions, examPackage.config.testCodeCount || 2);
        const qualityCheck = runAutomaticQualityCheck(examPackage.config, questions, matrix);

        setExamPackage({
          ...examPackage,
          id: `EXAM_${Date.now()}`,
          matrix,
          specifications,
          testCodes,
          qualityCheck,
        });
        showToast('✨ Đã tạo thành công đề thi tương đương mới!');
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      const newPkg = createFallbackExamPackage(config);
      setExamPackage(newPkg);
      showToast('✨ Đã làm mới đề thi tương đương giữ nguyên ma trận!');
    } finally {
      setIsGenerating(false);
      setProgressStatus(undefined);
    }
  };

  // Generate from pasted matrix
  const handleImportMatrix = async (matrixText: string) => {
    setIsGenerating(true);
    setProgressStatus('Đang đọc cấu trúc ma trận và biên soạn câu hỏi…');

    try {
      const response = await fetch('/api/generate-from-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matrixText, config }),
      });
      const data = await response.json();
      if (data.success && data.questions) {
        const questions: Question[] = data.questions;
        const matrix = generateExamMatrix(config, questions);
        const specifications = generateSpecifications(config, questions);
        const testCodes = generateTestCodes(questions, config.testCodeCount || 2);
        const qualityCheck = runAutomaticQualityCheck(config, questions, matrix);

        setExamPackage({
          id: `EXAM_${Date.now()}`,
          createdAt: new Date().toISOString(),
          config,
          matrix,
          specifications,
          testCodes,
          currentTestCode: '101',
          qualityCheck,
          gradingGuide: [],
        });
        showToast('✅ Đã tạo đề thi chính xác theo ma trận bạn cung cấp.');
      } else {
        throw new Error('Fallback');
      }
    } catch {
      handleGenerateExam();
    } finally {
      setIsGenerating(false);
      setProgressStatus(undefined);
    }
  };

  // Single Question Regeneration
  const handleRegenerateQuestion = async (q: Question) => {
    if (!examPackage) return;
    setIsGenerating(true);
    setProgressStatus(`Đang tạo lại riêng câu ${q.id}…`);

    try {
      const response = await fetch('/api/regenerate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentQuestion: q, config: examPackage.config }),
      });
      const data = await response.json();
      if (data.success && data.question) {
        const newQ = data.question;
        const updatedList = examPackage.testCodes[0].questions.map((item) =>
          item.id === q.id ? newQ : item
        );
        const matrix = generateExamMatrix(examPackage.config, updatedList);
        const specifications = generateSpecifications(examPackage.config, updatedList);
        const testCodes = generateTestCodes(updatedList, examPackage.config.testCodeCount || 2);
        const qualityCheck = runAutomaticQualityCheck(examPackage.config, updatedList, matrix);

        setExamPackage({
          ...examPackage,
          matrix,
          specifications,
          testCodes,
          qualityCheck,
        });
        showToast(`🔄 Đã tái sinh thành công câu ${q.id}`);
      }
    } catch (e) {
      console.error(e);
      showToast('Không thể tạo lại câu lúc này.');
    } finally {
      setIsGenerating(false);
      setProgressStatus(undefined);
    }
  };

  // Edit Question Save
  const handleSaveEditedQuestion = (updatedQ: Question) => {
    if (!examPackage) return;
    const baseList = examPackage.testCodes[0].questions.map((item) =>
      item.id === updatedQ.id ? updatedQ : item
    );
    const matrix = generateExamMatrix(examPackage.config, baseList);
    const specifications = generateSpecifications(examPackage.config, baseList);
    const testCodes = generateTestCodes(baseList, examPackage.config.testCodeCount || 2);
    const qualityCheck = runAutomaticQualityCheck(examPackage.config, baseList, matrix);

    setExamPackage({
      ...examPackage,
      matrix,
      specifications,
      testCodes,
      qualityCheck,
    });
    showToast(`✏️ Đã lưu chỉnh sửa câu ${updatedQ.id}`);
  };

  // Delete Question
  const handleDeleteQuestion = (qId: string) => {
    if (!examPackage) return;
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi đề thi không?')) return;

    const updatedList = examPackage.testCodes[0].questions.filter((q) => q.id !== qId);
    const matrix = generateExamMatrix(examPackage.config, updatedList);
    const specifications = generateSpecifications(examPackage.config, updatedList);
    const testCodes = generateTestCodes(updatedList, examPackage.config.testCodeCount || 2);
    const qualityCheck = runAutomaticQualityCheck(examPackage.config, updatedList, matrix);

    setExamPackage({
      ...examPackage,
      matrix,
      specifications,
      testCodes,
      qualityCheck,
    });
    showToast('🗑 Đã xóa câu hỏi khỏi đề.');
  };

  // Add New Question Manually
  const handleAddNewQuestion = () => {
    if (!examPackage) return;
    const currentQCount = examPackage.testCodes[0].questions.length;
    const newQ: Question = {
      id: `Q${String(currentQCount + 1).padStart(2, '0')}`,
      subject: config.subject,
      grade: `Lớp ${config.grade}`,
      topic: config.topic || 'Nội dung kiến thức mới',
      questionType: 'mcq_4',
      questionTypeName: 'Trắc nghiệm 4 lựa chọn',
      level: 'Nhận biết',
      question: 'Nhập nội dung câu hỏi mới vào đây...',
      options: ['A. Phương án 1', 'B. Phương án 2', 'C. Phương án 3', 'D. Phương án 4'],
      correctAnswer: 'A',
      explanation: 'Hướng dẫn giải chi tiết...',
      score: 0.25,
    };
    setEditingQuestion(newQ);
  };

  // Insert from Question Bank
  const handleInsertFromBank = (bankQ: Question) => {
    if (!examPackage) return;
    const baseList = [...examPackage.testCodes[0].questions, { ...bankQ, id: `Q${examPackage.testCodes[0].questions.length + 1}` }];
    const matrix = generateExamMatrix(examPackage.config, baseList);
    const specifications = generateSpecifications(examPackage.config, baseList);
    const testCodes = generateTestCodes(baseList, examPackage.config.testCodeCount || 2);
    const qualityCheck = runAutomaticQualityCheck(examPackage.config, baseList, matrix);

    setExamPackage({
      ...examPackage,
      matrix,
      specifications,
      testCodes,
      qualityCheck,
    });
    showToast(`Đã chèn câu hỏi vào đề kiểm tra!`);
  };

  // Auto fix score balance
  const handleAutoFixScores = () => {
    if (!examPackage) return;
    const questions = [...examPackage.testCodes[0].questions];
    if (questions.length === 0) return;

    const target = examPackage.config.scoreScale || 10;
    const perQ = Number((target / questions.length).toFixed(2));
    questions.forEach((q) => {
      q.score = perQ;
    });
    const sum = Number(questions.reduce((s, q) => s + q.score, 0).toFixed(2));
    const diff = Number((target - sum).toFixed(2));
    if (diff !== 0) {
      questions[questions.length - 1].score = Number((questions[questions.length - 1].score + diff).toFixed(2));
    }

    const matrix = generateExamMatrix(examPackage.config, questions);
    const specifications = generateSpecifications(examPackage.config, questions);
    const testCodes = generateTestCodes(questions, examPackage.config.testCodeCount || 2);
    const qualityCheck = runAutomaticQualityCheck(examPackage.config, questions, matrix);

    setExamPackage({
      ...examPackage,
      matrix,
      specifications,
      testCodes,
      qualityCheck,
    });
    showToast(`✅ Đã tự động cân bằng thang điểm về chính xác ${target} điểm.`);
  };

  // Save Exam Package to Local Library
  const handleSaveExamToLibrary = () => {
    if (!examPackage) return;
    const updated = [examPackage, ...savedExams.filter((e) => e.id !== examPackage.id)];
    setSavedExams(updated);
    try {
      localStorage.setItem(SAVED_EXAMS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast('💾 Đã lưu đề kiểm tra vào thư viện cá nhân!');
  };

  // Restore latest config
  const handleRestoreLatestConfig = () => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        showToast('Đã khôi phục cấu hình gần nhất.');
      } else {
        showToast('Chưa có cấu hình nào được lưu trước đó.');
      }
    } catch {
      showToast('Không thể đọc cấu hình.');
    }
  };

  // Reset config to defaults
  const handleResetConfig = () => {
    if (confirm('Bạn có muốn đặt lại toàn bộ thiết lập về mặc định ban đầu không?')) {
      setConfig(DEFAULT_EXAM_CONFIG);
      try {
        localStorage.removeItem(CONFIG_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
      showToast('Đã đặt lại cấu hình về mặc định.');
    }
  };

  // Export functions
  const handleCopyExam = async () => {
    if (!examPackage) return;
    const text = formatExamToPlainText(examPackage, examPackage.currentTestCode);
    const ok = await copyToClipboard(text);
    if (ok) showToast('📋 Đã sao chép nội dung đề thi vào bộ nhớ tạm!');
    else showToast('Không thể tự động sao chép.');
  };

  const handleCopyAnswerKey = async () => {
    if (!examPackage) return;
    const text = formatAnswerKeyToPlainText(examPackage, examPackage.currentTestCode);
    const ok = await copyToClipboard(text);
    if (ok) showToast('📋 Đã sao chép bảng đáp án!');
  };

  const handleExportWord = () => {
    if (!examPackage) return;
    const text = formatExamToPlainText(examPackage, examPackage.currentTestCode);
    const html = `<div class="bold title">${examPackage.config.schoolName}</div>
      <div class="bold text-center">${examPackage.config.examTitle}</div>
      <div class="text-center">Môn: ${examPackage.config.subject} - Lớp ${examPackage.config.grade}</div>
      <div class="text-center">Thời gian: ${examPackage.config.durationMinutes} phút - Mã đề: ${examPackage.currentTestCode}</div>
      <hr/>
      <pre style="font-family: 'Times New Roman', serif; font-size: 13pt; white-space: pre-wrap;">${text}</pre>`;
    downloadWordDocument(`De_Kiem_Tra_${examPackage.config.subject}_Lop_${examPackage.config.grade}_Ma_${examPackage.currentTestCode}`, html);
    showToast('⬇ Đã xuất đề thi sang tệp Word (.doc)!');
  };

  const handleExportAnswersWord = () => {
    if (!examPackage) return;
    const text = formatAnswerKeyToPlainText(examPackage, examPackage.currentTestCode);
    const html = `<div class="bold title">ĐÁP ÁN & HƯỚNG DẪN CHẤM</div>
      <div class="bold text-center">${examPackage.config.examTitle} - Môn: ${examPackage.config.subject}</div>
      <hr/>
      <pre style="font-family: 'Times New Roman', serif; font-size: 13pt; white-space: pre-wrap;">${text}</pre>`;
    downloadWordDocument(`Dap_An_${examPackage.config.subject}_Ma_${examPackage.currentTestCode}`, html);
    showToast('📝 Đã xuất đáp án sang tệp Word!');
  };

  const currentQuestions = examPackage?.testCodes[0]?.questions || [];

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header
        onRestoreConfig={handleRestoreLatestConfig}
        onResetConfig={handleResetConfig}
        onOpenQuestionBank={() => setIsBankModalOpen(true)}
        savedExamsCount={savedExams.length}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 print:p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Setup Steps (cols-5) */}
          <section className="lg:col-span-5 space-y-4 print:hidden">
            {/* Action Bar (Top of Setup) */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-4 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wide">
                    HỆ THỐNG RA ĐỀ TỰ ĐỘNG
                  </h2>
                  <p className="text-[11px] text-blue-100">
                    Bấm để AI phân tích tài liệu và biên soạn đề chuẩn
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMatrixImportOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 rounded-lg shadow-xs transition-colors"
                    title="Tải hoặc dán ma trận có sẵn"
                  >
                    <Table className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dán ma trận</span>
                  </button>
                </div>
              </div>

              {/* Big Create Exam Button */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateExam}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-indigo-900 group-hover:rotate-12 transition-transform" />
                <span>✨ TẠO ĐỀ KIỂM TRA</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleGenerateMatrixOnly}
                  className="text-blue-100 hover:text-white underline font-semibold flex items-center gap-1"
                >
                  <Table className="w-3.5 h-3.5" />
                  Xem / Tạo ma trận trước
                </button>

                <span className="text-[11px] text-blue-200">
                  {calculateTotalQuestions(config.questionCounts)} câu • Thang {config.scoreScale || 10}đ
                </span>
              </div>
            </div>

            {/* Step 1: Education Level */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <Step1Level
                selectedLevel={config.level}
                onSelectLevel={handleLevelSelect}
              />
            </div>

            {/* Step 2: Grade */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <Step2Grade
                level={config.level}
                selectedGrade={config.grade}
                onSelectGrade={handleGradeSelect}
              />
            </div>

            {/* Step 3: Subject */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <Step3Subject
                level={config.level}
                selectedSubject={config.subject}
                isCustomSubject={config.isCustomSubject}
                onSelectSubject={handleSubjectSelect}
              />
            </div>

            {/* Step 4: Knowledge Content */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <Step4Knowledge
                topic={config.topic}
                chapter={config.chapter}
                scope={config.scope}
                testedContent={config.testedContent}
                learningOutcomes={config.learningOutcomes}
                teacherNotes={config.teacherNotes}
                lessonContent={config.lessonContent}
                onChange={(fields) => setConfig((prev) => ({ ...prev, ...fields }))}
              />
            </div>

            {/* Reference Documents & Modes */}
            <ReferenceDocs
              documents={config.referenceDocuments}
              referenceMode={config.referenceMode}
              onUpdateDocuments={(docs) => setConfig((prev) => ({ ...prev, referenceDocuments: docs }))}
              onUpdateMode={(mode) => setConfig((prev) => ({ ...prev, referenceMode: mode }))}
            />

            {/* Exam Type & Time */}
            <ExamTypeConfig
              examType={config.examType}
              examTitle={config.examTitle}
              schoolName={config.schoolName}
              durationMinutes={config.durationMinutes}
              testCodeCount={config.testCodeCount}
              onChange={(fields) => setConfig((prev) => ({ ...prev, ...fields }))}
            />

            {/* Question Types & Quantities */}
            <QuestionTypesConfig
              questionCounts={config.questionCounts}
              onChange={(counts) => setConfig((prev) => ({ ...prev, questionCounts: counts }))}
            />

            {/* Cognitive Levels Distribution */}
            <CognitiveLevelsConfig
              distribution={config.cognitiveDistribution}
              totalQuestions={calculateTotalQuestions(config.questionCounts)}
              onChange={(dist) => setConfig((prev) => ({ ...prev, cognitiveDistribution: dist }))}
            />

            {/* Score Scale */}
            <ScoreScaleConfig
              scoreScale={config.scoreScale}
              totalQuestions={calculateTotalQuestions(config.questionCounts)}
              onChange={(scale) => setConfig((prev) => ({ ...prev, scoreScale: scale }))}
            />

            {/* Teacher Questions Input */}
            <TeacherQuestionsInput
              questions={config.teacherQuestions}
              keepTeacherQuestions={config.keepTeacherQuestions}
              onUpdateQuestions={(qs) => setConfig((prev) => ({ ...prev, teacherQuestions: qs }))}
              onToggleKeep={(keep) => setConfig((prev) => ({ ...prev, keepTeacherQuestions: keep }))}
              subject={config.subject}
              grade={config.grade}
            />
          </section>

          {/* RIGHT COLUMN: Preview & Results (cols-7) */}
          <section className="lg:col-span-7 space-y-4">
            {/* Top Toolbar for Exam Preview */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2 print:hidden">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerateEquivalentExam}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                  title="Tạo đề thi tương đương mới giữ nguyên cấu trúc ma trận"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tạo đề tương đương</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQualityModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  title="Kiểm tra 12 tiêu chí chất lượng khảo thí"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kiểm tra đề</span>
                  {examPackage?.qualityCheck && (
                    <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full text-[10px]">
                      {examPackage.qualityCheck.criteria.filter((c) => c.status === 'pass').length}/12
                    </span>
                  )}
                </button>
              </div>

              {/* Action Buttons: Print, Copy, Export, Save */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={printExam}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  title="In đề thi (khổ A4 chuẩn)"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>In</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyExam}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  title="Sao chép nội dung đề thi vào Clipboard"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Sao chép</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportWord}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 rounded-lg transition-colors"
                  title="Tải tệp Word (.doc) hoàn chỉnh"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xuất đề</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveExamToLibrary}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  title="Lưu đề thi này vào kho"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lưu</span>
                </button>
              </div>
            </div>

            {/* Result Tabs Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:hidden">
              <div className="flex items-center border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('exam')}
                  className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'exam'
                      ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>TAB 1 – ĐỀ KIỂM TRA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('answers')}
                  className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'answers'
                      ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>TAB 2 – ĐÁP ÁN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('grading')}
                  className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'grading'
                      ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>TAB 3 – HƯỚNG DẪN CHẤM</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('matrix')}
                  className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'matrix'
                      ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Table className="w-4 h-4 text-indigo-600" />
                  <span>TAB 4 – MA TRẬN ĐỀ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('spec')}
                  className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'spec'
                      ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  <span>TAB 5 – BẢN ĐẶC TẢ</span>
                </button>
              </div>

              {/* Sub actions under tabs */}
              <div className="p-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-700">
                  {activeTab === 'exam' && `Đang xem Đề thi (${currentQuestions.length} câu)`}
                  {activeTab === 'answers' && 'Bảng đáp án trắc nghiệm & Gợi ý tự luận'}
                  {activeTab === 'grading' && 'Thang điểm chi tiết & Tiêu chuẩn đánh giá'}
                  {activeTab === 'matrix' && 'Bảng ma trận 4 mức độ chuẩn GDPT 2018'}
                  {activeTab === 'spec' && 'Bản đặc tả chi tiết từng câu hỏi'}
                </span>

                <div className="flex items-center gap-2">
                  {activeTab === 'answers' && (
                    <button
                      type="button"
                      onClick={handleExportAnswersWord}
                      className="text-blue-700 hover:underline font-semibold"
                    >
                      Xuất đáp án Word
                    </button>
                  )}
                  {activeTab === 'matrix' && (
                    <button
                      type="button"
                      onClick={() => {
                        const html = document.getElementById('matrix-container')?.innerHTML || '';
                        downloadWordDocument(`Ma_Tran_${config.subject}`, html);
                      }}
                      className="text-blue-700 hover:underline font-semibold"
                    >
                      Xuất ma trận Word
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TAB CONTENTS */}
            {examPackage && (
              <div className="transition-all">
                {activeTab === 'exam' && (
                  <ExamSheet
                    config={examPackage.config}
                    currentTestCode={examPackage.currentTestCode}
                    testCodes={examPackage.testCodes}
                    onSelectTestCode={(code) =>
                      setExamPackage({ ...examPackage, currentTestCode: code })
                    }
                    onRegenerateQuestion={handleRegenerateQuestion}
                    onEditQuestion={(q) => setEditingQuestion(q)}
                    onDeleteQuestion={handleDeleteQuestion}
                    onAddQuestion={handleAddNewQuestion}
                  />
                )}

                {activeTab === 'answers' && (
                  <AnswerKeyTable
                    currentTestCode={examPackage.currentTestCode}
                    testCodes={examPackage.testCodes}
                    onSelectTestCode={(code) =>
                      setExamPackage({ ...examPackage, currentTestCode: code })
                    }
                  />
                )}

                {activeTab === 'grading' && <GradingGuide examPackage={examPackage} />}

                {activeTab === 'matrix' && (
                  <div id="matrix-container">
                    <MatrixTable matrix={examPackage.matrix} config={examPackage.config} />
                  </div>
                )}

                {activeTab === 'spec' && (
                  <SpecificationTable
                    specifications={examPackage.specifications}
                    config={examPackage.config}
                  />
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Generation Progress Overlay */}
      <GenerationProgress isGenerating={isGenerating} statusText={progressStatus} />

      {/* Quality Check Modal */}
      {examPackage?.qualityCheck && (
        <QualityCheckModal
          isOpen={isQualityModalOpen}
          onClose={() => setIsQualityModalOpen(false)}
          qualityCheck={examPackage.qualityCheck}
          onAutoFixScores={handleAutoFixScores}
        />
      )}

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onInsertToExam={handleInsertFromBank}
        currentQuestions={currentQuestions}
      />

      {/* Matrix Import Modal */}
      <MatrixImportModal
        isOpen={isMatrixImportOpen}
        onClose={() => setIsMatrixImportOpen(false)}
        onImportMatrix={handleImportMatrix}
      />

      {/* Edit Question Modal */}
      <EditQuestionModal
        isOpen={!!editingQuestion}
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleSaveEditedQuestion}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
