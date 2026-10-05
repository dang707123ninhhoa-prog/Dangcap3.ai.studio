import { ExamConfig, Question, GeneratedExamPackage, CognitiveLevel, QuestionType } from '../types/exam';
import { generateExamMatrix, generateSpecifications } from './matrixGenerator';
import { generateTestCodes } from './testCodeGenerator';
import { runAutomaticQualityCheck } from './qualityChecker';
import { QUESTION_TYPES_META } from '../constants/curriculum';

interface QuestionTemplate {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  level: CognitiveLevel;
  learningOutcome?: string;
  subItems?: { id: string; statement: string; isCorrect: boolean }[];
  readingPassage?: string;
}

// Rich domain-specific question pools for Vietnamese curriculum
function getMathQuestionsPool(topic: string, grade: number): {
  mcq: QuestionTemplate[];
  trueFalse: QuestionTemplate[];
  shortAnswer: QuestionTemplate[];
  essay: QuestionTemplate[];
} {
  return {
    mcq: [
      {
        question: 'Cho hàm số $y = f(x)$ có bảng biến thiên trên đoạn $[-2; 3]$. Mệnh đề nào sau đây đúng về khoảng đồng biến của hàm số?',
        options: [
          'A. Hàm số đồng biến trên khoảng $(-2; 0)$.',
          'B. Hàm số đồng biến trên khoảng $(0; 2)$.',
          'C. Hàm số nghịch biến trên khoảng $(-2; 0)$.',
          'D. Hàm số nghịch biến trên khoảng $(2; 3)$.',
        ],
        correctAnswer: 'A',
        explanation: 'Dựa vào bảng biến thiên, trên khoảng $(-2; 0)$, đạo hàm mang dấu dương nên hàm số đồng biến.',
        level: 'Nhận biết',
        learningOutcome: 'Nhận biết được tính đơn điệu của hàm số qua bảng biến thiên.',
      },
      {
        question: 'Đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có đường tiệm cận đứng là đường thẳng nào sau đây?',
        options: ['A. $x = -1$', 'B. $x = 2$', 'C. $y = 2$', 'D. $y = -1$'],
        correctAnswer: 'A',
        explanation: 'Ta có $\\lim_{x \\to -1^+} \\frac{2x-1}{x+1} = -\\infty$, suy ra đường tiệm cận đứng là $x = -1$.',
        level: 'Nhận biết',
        learningOutcome: 'Xác định được phương trình đường tiệm cận đứng của hàm phân thức.',
      },
      {
        question: 'Điểm cực đại của đồ thị hàm số $y = x^3 - 3x^2 + 2$ là điểm nào?',
        options: ['A. $M(0; 2)$', 'B. $N(2; -2)$', 'C. $P(1; 0)$', 'D. $Q(-1; -2)$'],
        correctAnswer: 'A',
        explanation: 'Đạo hàm $y\' = 3x^2 - 6x = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Tại $x = 0$, $y\'$ đổi dấu từ dương sang âm nên $M(0; 2)$ là điểm cực đại của đồ thị.',
        level: 'Thông hiểu',
        learningOutcome: 'Tìm được tọa độ điểm cực trị của đồ thị hàm đa thức bậc ba.',
      },
      {
        question: 'Giá trị lớn nhất của hàm số $f(x) = x^4 - 2x^2 + 3$ trên đoạn $[0; 2]$ bằng bao nhiêu?',
        options: ['A. 11', 'B. 3', 'C. 2', 'D. 19'],
        correctAnswer: 'A',
        explanation: '$f\'(x) = 4x^3 - 4x = 0 \\Leftrightarrow x = 0, x = 1$ (nhận trên $[0; 2]$). Ta tính: $f(0) = 3, f(1) = 2, f(2) = 11$. Vậy GTLN là 11 tại $x = 2$.',
        level: 'Thông hiểu',
        learningOutcome: 'Tính được giá trị lớn nhất của hàm số trên một đoạn đóng.',
      },
      {
        question: 'Đường cong trong hình vẽ bên là đồ thị của hàm số nào dưới đây?',
        options: [
          'A. $y = -x^3 + 3x - 1$',
          'B. $y = x^3 - 3x - 1$',
          'C. $y = x^4 - 2x^2 - 1$',
          'D. $y = -x^4 + 2x^2 - 1$',
        ],
        correctAnswer: 'B',
        explanation: 'Đồ thị có dạng chữ N của hàm số bậc ba với hệ số $a > 0$ và cắt trục tung tại điểm $(0; -1)$.',
        level: 'Thông hiểu',
        learningOutcome: 'Nhận diện hàm số tương ứng với dạng đồ thị cho trước.',
      },
      {
        question: 'Phương trình tiếp tuyến của đồ thị hàm số $y = x^3 - 2x + 1$ tại điểm có hoành độ $x_0 = 1$ là:',
        options: ['A. $y = x - 1$', 'B. $y = x + 1$', 'C. $y = 3x - 3$', 'D. $y = 2x - 2$'],
        correctAnswer: 'A',
        explanation: 'Ta có $y_0 = 1^3 - 2(1) + 1 = 0$. Đạo hàm $y\' = 3x^2 - 2 \\Rightarrow y\'(1) = 1$. Phương trình tiếp tuyến: $y = 1(x - 1) + 0 \\Leftrightarrow y = x - 1$.',
        level: 'Thông hiểu',
        learningOutcome: 'Viết được phương trình tiếp tuyến của đồ thị tại điểm cho trước.',
      },
      {
        question: 'Tìm tất cả các giá trị thực của tham số $m$ để hàm số $y = x^3 - 3mx^2 + 3(2m - 1)x + 1$ đồng biến trên $\\mathbb{R}$.',
        options: ['A. $m = 1$', 'B. $m \\ge 1$', 'C. $m \\le 1$', 'D. $0 < m < 1$'],
        correctAnswer: 'A',
        explanation: 'Hàm số đồng biến trên $\\mathbb{R} \\Leftrightarrow y\' = 3x^2 - 6mx + 3(2m-1) \\ge 0, \\forall x \\in \\mathbb{R} \\Leftrightarrow \\Delta\' = 9m^2 - 9(2m-1) = 9(m-1)^2 \\le 0 \\Leftrightarrow m = 1$.',
        level: 'Vận dụng',
        learningOutcome: 'Tìm tham số $m$ để hàm số đơn điệu trên toàn tập xác định.',
      },
      {
        question: 'Số giao điểm của đồ thị hàm số $y = x^3 - 3x^2 + 4$ và đường thẳng $y = 2x + 4$ là:',
        options: ['A. 3', 'B. 1', 'C. 2', 'D. 0'],
        correctAnswer: 'A',
        explanation: 'Phương trình hoành độ giao điểm: $x^3 - 3x^2 + 4 = 2x + 4 \\Leftrightarrow x(x^2 - 3x - 2) = 0 \\Leftrightarrow x = 0$ hoặc $x^2 - 3x - 2 = 0$ (có 2 nghiệm phân biệt khác 0). Vậy có 3 giao điểm.',
        level: 'Vận dụng',
        learningOutcome: 'Xác định số nghiệm của phương trình tương giao giữa hai đồ thị.',
      },
      {
        question: 'Một chất điểm chuyển động theo phương trình $s(t) = -t^3 + 6t^2 + 9t$ ($t$ tính bằng giây, $s$ tính bằng mét). Vận tốc của chất điểm đạt giá trị lớn nhất tại thời điểm nào?',
        options: ['A. $t = 2$ giây', 'B. $t = 3$ giây', 'C. $t = 1$ giây', 'D. $t = 4$ giây'],
        correctAnswer: 'A',
        explanation: 'Vận tốc $v(t) = s\'(t) = -3t^2 + 12t + 9 = -3(t - 2)^2 + 21 \\le 21$. Đạt giá trị lớn nhất khi $t = 2$ giây.',
        level: 'Vận dụng',
        learningOutcome: 'Ứng dụng đạo hàm giải quyết bài toán vật lý về vận tốc lớn nhất.',
      },
      {
        question: 'Đồ thị hàm số $y = \\frac{\\sqrt{x^2 - 4}}{x - 3}$ có tất cả bao nhiêu đường tiệm cận (bao gồm cả đứng và ngang)?',
        options: ['A. 3', 'B. 2', 'C. 1', 'D. 4'],
        correctAnswer: 'A',
        explanation: 'Tập xác định $D = (-\\infty; -2] \\cup [2; +\\infty) \\setminus \\{3\\}$. Tiệm cận đứng: $x = 3$. Tiệm cận ngang: $\\lim_{x \\to +\\infty} y = 1 \\Rightarrow y = 1$; $\\lim_{x \\to -\\infty} y = -1 \\Rightarrow y = -1$. Tổng cộng 3 đường tiệm cận.',
        level: 'Vận dụng',
        learningOutcome: 'Tìm số đường tiệm cận của đồ thị hàm số chứa căn thức.',
      },
      {
        question: 'Một người thợ muốn làm một chiếc bể cá hình hộp chữ nhật không nắp có thể tích $V = 4$ $\\text{m}^3$, đáy hình chữ nhật có chiều dài gấp đôi chiều rộng. Giá kính làm đáy là 200.000 đ/$\\text{m}^2$ và kính làm thành bể là 150.000 đ/$\\text{m}^2$. Chi phí mua kính nhỏ nhất gần với số nào sau đây?',
        options: ['A. 2.100.000 đồng', 'B. 1.850.000 đồng', 'C. 2.500.000 đồng', 'D. 3.200.000 đồng'],
        correctAnswer: 'A',
        explanation: 'Gọi chiều rộng đáy là $x > 0$, chiều dài $2x$, chiều cao $h = \\frac{4}{2x^2} = \\frac{2}{x^2}$. Tổng chi phí $C(x) = 200.000(2x^2) + 150.000(2xh + 4xh) = 400.000 x^2 + \\frac{1.800.000}{x}$. Khảo sát hàm số ta tìm được $x \\approx 1.31$ m và chi phí tối thiểu xấp xỉ 2.100.000 đồng.',
        level: 'Vận dụng cao',
        learningOutcome: 'Giải quyết bài toán tối ưu hóa chi phí sản xuất trong thực tiễn.',
      },
      {
        question: 'Có bao nhiêu giá trị nguyên của tham số $m \\in [-10; 10]$ để đồ thị hàm số $y = x^3 - 3mx^2 + 4m^3$ có hai điểm cực trị $A$ và $B$ sao cho tam giác $OAB$ có diện tích bằng 4?',
        options: ['A. 2', 'B. 1', 'C. 4', 'D. 0'],
        correctAnswer: 'A',
        explanation: 'Hàm số có cực trị khi $m \\ne 0$. Hai điểm cực trị là $A(0; 4m^3)$ và $B(2m; 0)$. Diện tích $S_{OAB} = \\frac{1}{2} OA \\cdot OB = \\frac{1}{2} |4m^3| \\cdot |2m| = 4m^4 = 4 \\Leftrightarrow m^4 = 1 \\Leftrightarrow m = \\pm 1$. Có 2 giá trị nguyên.',
        level: 'Vận dụng cao',
        learningOutcome: 'Vận dụng cực trị hàm số kết hợp hình học giải tích giải bài toán tham số nâng cao.',
      },
    ],
    trueFalse: [
      {
        question: 'Cho hàm số $y = f(x) = x^3 - 3x^2 + 2$ có đồ thị là $(C)$. Xét tính đúng/sai của các mệnh đề sau:',
        subItems: [
          { id: 'a', statement: 'Hàm số đã cho đồng biến trên các khoảng $(-\\infty; 0)$ và $(2; +\\infty)$.', isCorrect: true },
          { id: 'b', statement: 'Đồ thị $(C)$ có điểm cực đại là $(2; -2)$.', isCorrect: false },
          { id: 'c', statement: 'Điểm uốn của đồ thị $(C)$ là $I(1; 0)$.', isCorrect: true },
          { id: 'd', statement: 'Phương trình $f(x) = m$ có 3 nghiệm phân biệt khi và chỉ khi $-2 < m < 2$.', isCorrect: true },
        ],
        correctAnswer: 'a-Đ, b-S, c-Đ, d-Đ',
        explanation: 'a) $f\'(x) = 3x^2 - 6x > 0 \\Leftrightarrow x < 0$ hoặc $x > 2$ (Đúng). b) Điểm cực đại là $(0; 2)$, $(2; -2)$ là điểm cực tiểu (Sai). c) $f\'\'(x) = 6x - 6 = 0 \\Leftrightarrow x = 1, y = 0$ (Đúng). d) Đồ thị có cực đại bằng 2 và cực tiểu bằng -2 nên cắt tại 3 điểm khi $-2 < m < 2$ (Đúng).',
        level: 'Thông hiểu',
        learningOutcome: 'Đánh giá toàn diện các tính chất biến thiên và cực trị của hàm bậc ba.',
      },
      {
        question: 'Cho hàm số phân thức $y = f(x) = \\frac{2x - 1}{x + 1}$ có đồ thị là $(H)$. Xét tính đúng/sai của các mệnh đề sau:',
        subItems: [
          { id: 'a', statement: 'Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{-1\\}$.', isCorrect: true },
          { id: 'b', statement: 'Hàm số đồng biến trên toàn bộ tập xác định $\\mathbb{R} \\setminus \\{-1\\}$.', isCorrect: false },
          { id: 'c', statement: 'Đồ thị $(H)$ có đường tiệm cận đứng $x = -1$ và tiệm cận ngang $y = 2$.', isCorrect: true },
          { id: 'd', statement: 'Giao điểm của hai đường tiệm cận là tâm đối xứng của đồ thị $(H)$.', isCorrect: true },
        ],
        correctAnswer: 'a-Đ, b-S, c-Đ, d-Đ',
        explanation: 'b) Sai vì phải kết luận hàm số đồng biến trên từng khoảng xác định $(-\\infty; -1)$ và $(-1; +\\infty)$, không dùng ký hiệu hiệu tập hợp.',
        level: 'Thông hiểu',
        learningOutcome: 'Nắm vững quy tắc kết luận tính đơn điệu và tiệm cận của hàm phân thức.',
      },
      {
        question: 'Một chất điểm chuyển động thẳng xác định bởi phương trình quãng đường $s(t) = t^3 - 6t^2 + 9t + 5$ với $t \\ge 0$ tính bằng giây. Xét các mệnh đề sau:',
        subItems: [
          { id: 'a', statement: 'Vận tốc tức thời của chất điểm tại thời điểm $t$ là $v(t) = 3t^2 - 12t + 9$.', isCorrect: true },
          { id: 'b', statement: 'Tại thời điểm $t = 1$ giây và $t = 3$ giây chất điểm tạm dừng chuyển động ($v = 0$).', isCorrect: true },
          { id: 'c', statement: 'Gia tốc tức thời của chất điểm luôn không đổi theo thời gian.', isCorrect: false },
          { id: 'd', statement: 'Trong khoảng thời gian từ $t = 1$ đến $t = 3$ giây, chất điểm chuyển động theo chiều âm.', isCorrect: true },
        ],
        correctAnswer: 'a-Đ, b-Đ, c-S, d-Đ',
        explanation: 'Gia tốc $a(t) = v\'(t) = 6t - 12$ phụ thuộc vào thời gian $t$, không phải hằng số nên c) Sai.',
        level: 'Vận dụng',
        learningOutcome: 'Ứng dụng đạo hàm khảo sát chuyển động thẳng trong cơ học.',
      },
      {
        question: 'Cho hàm số $y = f(x) = x^4 - 2x^2 + 3$. Xét tính đúng/sai của các nhận định sau:',
        subItems: [
          { id: 'a', statement: 'Hàm số đã cho là hàm số chẵn, đồ thị nhận trục tung làm trục đối xứng.', isCorrect: true },
          { id: 'b', statement: 'Hàm số có đúng 3 điểm cực trị tạo thành 3 đỉnh của một tam giác vuông cân.', isCorrect: true },
          { id: 'c', statement: 'Giá trị nhỏ nhất của hàm số trên $\\mathbb{R}$ bằng 2.', isCorrect: true },
          { id: 'd', statement: 'Đồ thị hàm số cắt trục hoành tại 4 điểm phân biệt.', isCorrect: false },
        ],
        correctAnswer: 'a-Đ, b-Đ, c-Đ, d-S',
        explanation: 'Vì GTNN bằng 2 > 0 nên đồ thị nằm hoàn toàn phía trên trục hoành, không có giao điểm với trục hoành, do đó d) Sai.',
        level: 'Thông hiểu',
        learningOutcome: 'Khảo sát và suy luận tính chất hình học của đồ thị hàm trùng phương.',
      },
    ],
    shortAnswer: [
      {
        question: 'Biết đồ thị hàm số $y = x^3 - 3x^2 + 2$ có điểm cực đại $A$ và điểm cực tiểu $B$. Tính độ dài đoạn thẳng $AB$ (kết quả viết dưới dạng số thập phân làm tròn đến hàng phần mười).',
        correctAnswer: '4.5',
        explanation: '$A(0; 2), B(2; -2) \\Rightarrow AB = \\sqrt{(2-0)^2 + (-2-2)^2} = \\sqrt{4 + 16} = \\sqrt{20} \\approx 4.5$.',
        level: 'Thông hiểu',
        learningOutcome: 'Tính khoảng cách giữa hai điểm cực trị của đồ thị hàm số.',
      },
      {
        question: 'Tìm giá trị lớn nhất của hàm số $y = \\frac{x - 2}{x + 1}$ trên đoạn $[0; 4]$. (Nhập kết quả dưới dạng số thập phân).',
        correctAnswer: '0.4',
        explanation: 'Đạo hàm $y\' = \\frac{3}{(x+1)^2} > 0, \\forall x \\in [0; 4]$ nên hàm số đồng biến. GTLN đạt tại $x = 4$: $y(4) = \\frac{4-2}{4+1} = \\frac{2}{5} = 0.4$.',
        level: 'Thông hiểu',
        learningOutcome: 'Tìm giá trị lớn nhất của hàm phân thức trên một đoạn.',
      },
      {
        question: 'Một người nông dân muốn rào một khu vườn hình chữ nhật cạnh một bờ sông thẳng (không cần rào phía bờ sông). Bác có tổng cộng 60 mét lưới rào. Diện tích lớn nhất của khu vườn có thể rào được là bao nhiêu mét vuông?',
        correctAnswer: '450',
        explanation: 'Gọi chiều rộng vuông góc với bờ sông là $x$ ($0 < x < 30$), chiều dài song song bờ sông là $60 - 2x$. Diện tích $S(x) = x(60 - 2x) = -2x^2 + 60x = -2(x - 15)^2 + 450 \\le 450$. Diện tích lớn nhất là 450 $\\text{m}^2$.',
        level: 'Vận dụng',
        learningOutcome: 'Giải bài toán tối ưu hóa diện tích hình học trong thực tế.',
      },
      {
        question: 'Đồ thị hàm số $y = \\frac{2x - 3}{x - 1}$ có hai đường tiệm cận cắt nhau tại điểm $I(a; b)$. Tính tổng $a + b$.',
        correctAnswer: '3',
        explanation: 'Tiệm cận đứng $x = 1 \\Rightarrow a = 1$. Tiệm cận ngang $y = 2 \\Rightarrow b = 2$. Suy ra $a + b = 1 + 2 = 3$.',
        level: 'Nhận biết',
        learningOutcome: 'Xác định tọa độ giao điểm hai đường tiệm cận.',
      },
    ],
    essay: [
      {
        question: 'Cho hàm số $y = \\frac{x + 2}{x - 1}$ có đồ thị là $(C)$. \na) Khảo sát sự biến thiên và vẽ đồ thị hàm số $(C)$. \nb) Viết phương trình tiếp tuyến của $(C)$ tại điểm có hoành độ $x_0 = 2$.',
        correctAnswer: 'a) Khảo sát đầy đủ TXĐ, đạo hàm, tiệm cận, bảng biến thiên, đồ thị. b) Tiếp tuyến: y = -3x + 10.',
        explanation: '- TXĐ: $D = \\mathbb{R} \\setminus \\{1\\}$. (0.25đ)\n- Đạo hàm $y\' = \\frac{-3}{(x-1)^2} < 0, \\forall x \\ne 1$. Hàm số nghịch biến trên $(-\\infty; 1)$ và $(1; +\\infty)$. (0.25đ)\n- Tiệm cận đứng $x = 1$, tiệm cận ngang $y = 1$. Lập BBT và vẽ đúng dạng đồ thị. (0.25đ)\n- Tại $x_0 = 2 \\Rightarrow y_0 = 4; y\'(2) = -3$. PTTT: $y = -3(x - 2) + 4 \\Leftrightarrow y = -3x + 10$. (0.25đ)',
        level: 'Vận dụng',
        learningOutcome: 'Trình bày trọn vẹn quy trình khảo sát hàm số và viết phương trình tiếp tuyến.',
      },
      {
        question: 'Một công ty sản xuất đồ gia dụng ước tính rằng nếu sản xuất $x$ chiếc quạt điện mỗi ngày ($x \\in [10; 200]$) thì tổng chi phí sản xuất (tính bằng triệu đồng) được cho bởi hàm số: $C(x) = 0.05 x^2 + 20 x + 800$.\nMỗi chiếc quạt bán ra thị trường với giá cố định là 80 triệu đồng. Xác định mức sản xuất mỗi ngày để công ty đạt được lợi nhuận lớn nhất và tính giá trị lợi nhuận cực đại đó.',
        correctAnswer: 'Sản xuất 600 chiếc/ngày (hoặc tối đa theo miền xác định) và tính lợi nhuận cực đại tương ứng.',
        explanation: '- Hàm doanh thu: $R(x) = 80x$ (triệu đồng). (0.25đ)\n- Hàm lợi nhuận: $P(x) = R(x) - C(x) = -0.05x^2 + 60x - 800$. (0.25đ)\n- Đạo hàm $P\'(x) = -0.1x + 60 = 0 \\Leftrightarrow x = 600$. (0.25đ)\n- Xét bảng biến thiên trên miền xác định để kết luận sản lượng tối ưu và mức lợi nhuận cao nhất đạt được. (0.25đ)',
        level: 'Vận dụng cao',
        learningOutcome: 'Mô hình hóa bài toán kinh tế và vận dụng đạo hàm tìm giá trị tối ưu.',
      },
    ],
  };
}

// Literature pool (Ngữ văn, Tiếng Việt)
function getLiteratureQuestionsPool(topic: string, grade: number): {
  mcq: QuestionTemplate[];
  trueFalse: QuestionTemplate[];
  shortAnswer: QuestionTemplate[];
  essay: QuestionTemplate[];
} {
  return {
    mcq: [
      {
        question: 'Phương thức biểu đạt chính được sử dụng trong văn bản đọc hiểu là phương thức nào?',
        options: ['A. Tự sự', 'B. Nghị luận', 'C. Biểu cảm', 'D. Miêu tả'],
        correctAnswer: 'B',
        explanation: 'Văn bản sử dụng hệ thống luận điểm, luận cứ và lập luận chặt chẽ để thuyết phục người đọc.',
        level: 'Nhận biết',
        learningOutcome: 'Nhận biết phương thức biểu đạt chính trong văn bản.',
      },
      {
        question: 'Biện pháp tu từ nào được sử dụng chủ yếu trong câu văn: "Tri thức là chiếc chìa khóa vạn năng mở ra cánh cửa tương lai"?',
        options: ['A. So sánh', 'B. Nhân hóa', 'C. Hoán dụ', 'D. Điệp từ'],
        correctAnswer: 'A',
        explanation: 'Tác giả dùng từ so sánh "là" để đối chiếu tri thức với chiếc chìa khóa vạn năng.',
        level: 'Nhận biết',
        learningOutcome: 'Chỉ ra biện pháp tu từ trong ngữ cảnh cụ thể.',
      },
      {
        question: 'Theo nội dung đoạn trích, điều gì là trở ngại lớn nhất ngăn cản con người đạt tới ước mơ?',
        options: [
          'A. Sự tự ti và nỗi sợ hãi thất bại của chính bản thân.',
          'B. Thiếu thốn về điều kiện vật chất và tài chính.',
          'C. Sự cạnh tranh gay gắt từ xã hội bên ngoài.',
          'D. Thời gian tuổi trẻ trôi qua quá nhanh.',
        ],
        correctAnswer: 'A',
        explanation: 'Tác giả khẳng định trong đoạn 2: "Kẻ thù lớn nhất kìm hãm bước chân bạn chính là nỗi sợ hãi ẩn sâu bên trong".',
        level: 'Thông hiểu',
        learningOutcome: 'Nắm bắt ý nghĩa và thông tin trọng tâm của văn bản đọc hiểu.',
      },
      {
        question: 'Từ ngữ nào sau đây thể hiện thái độ, cảm xúc trân trọng của tác giả đối với thế hệ trẻ?',
        options: ['A. "Mầm xanh tương lai"', 'B. "Thách thức"', 'C. "Chông gai"', 'D. "Học hỏi"'],
        correctAnswer: 'A',
        explanation: 'Cụm từ "mầm xanh tương lai" ẩn dụ cho sức sống, niềm hy vọng và sự tin tưởng gửi gắm vào thế hệ trẻ.',
        level: 'Thông hiểu',
        learningOutcome: 'Giải thích tầng nghĩa biểu cảm của từ ngữ trong ngữ liệu.',
      },
      {
        question: 'Tác dụng nghệ thuật nổi bật của phép điệp cấu trúc câu trong đoạn văn thứ ba là gì?',
        options: [
          'A. Tạo nhịp điệu dồn dập, nhấn mạnh khát vọng cống hiến không ngừng của con người.',
          'B. Liệt kê các sự việc theo trình tự thời gian biên niên sử.',
          'C. Tạo sự hài hước, dí dỏm cho câu chuyện.',
          'D. Làm giảm nhẹ tính nghiêm trọng của vấn đề.',
        ],
        correctAnswer: 'A',
        explanation: 'Phép điệp cấu trúc giúp tăng tính nhạc, giọng điệu hùng hồn và khắc sâu tư tưởng chủ đạo.',
        level: 'Vận dụng',
        learningOutcome: 'Phân tích hiệu quả nghệ thuật của các biện pháp tu từ cú pháp.',
      },
      {
        question: 'Qua đoạn trích, tác giả muốn gửi gắm thông điệp nhân sinh sâu sắc nào đến người đọc?',
        options: [
          'A. Hãy dũng cảm bước ra khỏi vùng an toàn để khám phá và khẳng định giá trị bản thân.',
          'B. Cần chấp nhận mọi sự an bài của số phận để có cuộc sống bình yên.',
          'C. Thành công chỉ dành cho những người may mắn và có tài năng thiên bẩm.',
          'D. Nên tránh xa những công việc khó khăn để bảo vệ bản thân.',
        ],
        correctAnswer: 'A',
        explanation: 'Toàn bộ mạch lập luận hướng tới việc thức tỉnh tinh thần chủ động, vượt qua giới hạn của tuổi trẻ.',
        level: 'Vận dụng',
        learningOutcome: 'Rút ra bài học tư tưởng và thông điệp nhân văn từ văn bản.',
      },
    ],
    trueFalse: [
      {
        question: 'Dựa vào văn bản đọc hiểu, xét tính đúng/sai của các nhận định dưới đây:',
        subItems: [
          { id: 'a', statement: 'Văn bản được viết theo phong cách ngôn ngữ chính luận.', isCorrect: true },
          { id: 'b', statement: 'Tác giả phủ nhận hoàn toàn vai trò của sự giúp đỡ từ gia đình và xã hội.', isCorrect: false },
          { id: 'c', statement: 'Các dẫn chứng trong bài mang tính thời sự, chân thực và có sức thuyết phục cao.', isCorrect: true },
          { id: 'd', statement: 'Mục đích chính của người viết là kêu gọi hành động thay vì chỉ dừng lại ở lời nói.', isCorrect: true },
        ],
        correctAnswer: 'a-Đ, b-S, c-Đ, d-Đ',
        explanation: 'Tác giả vẫn khẳng định gia đình là điểm tựa, chỉ phê phán tính ỷ lại; do đó ý b là sai.',
        level: 'Thông hiểu',
        learningOutcome: 'Đánh giá tính đúng đắn của các luận điểm trong văn bản nghị luận.',
      },
    ],
    shortAnswer: [
      {
        question: 'Chỉ ra 01 từ Hán Việt mang ý nghĩa trang trọng được tác giả sử dụng trong câu mở đầu văn bản.',
        correctAnswer: 'Tri ân (hoặc Cống hiến / Bản lĩnh)',
        explanation: 'Học sinh chỉ đúng từ Hán Việt tạo sắc thái trang trọng, thiêng liêng cho lời văn.',
        level: 'Nhận biết',
        learningOutcome: 'Nhận diện và phân loại từ Hán Việt trong ngữ cảnh.',
      },
    ],
    essay: [
      {
        question: 'Viết một đoạn văn ngắn (khoảng 200 chữ) trình bày suy nghĩ của anh/chị về ý nghĩa của "tinh thần trách nhiệm đối với cộng đồng" của thế hệ trẻ ngày nay.',
        correctAnswer: 'Mở đoạn giới thiệu vấn đề; Thân đoạn giải thích, phân tích biểu hiện và ý nghĩa; Dẫn chứng thực tế; Phản đề và bài học hành động cá nhân; Kết đoạn.',
        explanation: '- Đảm bảo cấu trúc đoạn văn, dung lượng khoảng 200 chữ (0.25đ).\n- Nêu rõ vấn đề: Tinh thần trách nhiệm với cộng đồng (0.25đ).\n- Phân tích sâu sắc: Trách nhiệm giúp gắn kết xã hội, lan tỏa yêu thương, tôi luyện bản lĩnh (0.75đ).\n- Dẫn chứng người thật việc thật thuyết phục và bài học hành động thiết thực (0.5đ).\n- Sáng tạo, diễn đạt mạch lạc, không sai chính tả (0.25đ).',
        level: 'Vận dụng cao',
        learningOutcome: 'Viết đoạn văn nghị luận xã hội thể hiện tư duy phản biện và góc nhìn cá nhân sâu sắc.',
      },
    ],
  };
}

// General domain question generator for Science / History / Primary / Custom Subjects
function getDynamicQuestions(config: ExamConfig, index: number, typeKey: string, level: CognitiveLevel): QuestionTemplate {
  const { subject, grade, topic } = config;
  const t = topic || subject;

  const topicsVariations = [
    { aspect: 'khái niệm và định nghĩa bản chất', action: 'Nêu bản chất cốt lõi của' },
    { aspect: 'quy luật vận động và tính chất đặc trưng', action: 'Phân tích quy luật chi phối' },
    { aspect: 'mối quan hệ nguyên nhân - kết quả', action: 'Làm rõ mối quan hệ tương tác trong' },
    { aspect: 'phương pháp đo lường và tính toán định lượng', action: 'Xác định giá trị tham số trong' },
    { aspect: 'ý nghĩa và vai trò thực tiễn đời sống', action: 'Đánh giá tác động thực tế của' },
    { aspect: 'điều kiện áp dụng và giới hạn lý thuyết', action: 'Chỉ ra điều kiện tiên quyết khi vận dụng' },
    { aspect: 'so sánh điểm tương đồng và khác biệt', action: 'So sánh và phân biệt các trường hợp của' },
    { aspect: 'nhận diện biểu hiện thực tế và hiện tượng', action: 'Nhận diện hiện tượng đặc trưng của' },
    { aspect: 'ứng dụng công nghệ và cải tiến', action: 'Đề xuất giải pháp tối ưu hóa liên quan đến' },
    { aspect: 'các sai lầm thường gặp khi áp dụng', action: 'Phân tích lỗi sai điển hình khi giải quyết' },
    { aspect: 'tổng hợp kiến thức liên môn', action: 'Kết hợp kiến thức thực tiễn để giải thích' },
    { aspect: 'định hướng phát triển và xu thế tương lai', action: 'Đánh giá xu hướng và triển vọng của' },
  ];

  const variant = topicsVariations[index % topicsVariations.length];

  if (typeKey === 'mcq_4') {
    const letters = ['A', 'B', 'C', 'D'];
    const correctLetter = letters[index % 4];
    const options = [
      `A. Phản ánh đúng quy luật khách quan và có tính hệ thống trong ${t}.`,
      `B. Biến đổi ngẫu nhiên phụ thuộc hoàn toàn vào cảm tính chủ quan.`,
      `C. Chỉ có giá trị lý thuyết hình thức, không áp dụng được vào thực tế.`,
      `D. Mâu thuẫn với các nguyên lý khoa học nền tảng của môn ${subject}.`,
    ];
    // Rotate to make correctLetter the right choice
    const correctText = `Thể hiện chính xác ${variant.aspect} theo chuẩn chương trình môn ${subject} Lớp ${grade}.`;
    const wrong1 = `Chỉ áp dụng trong một số trường hợp ngoại lệ hiếm gặp.`;
    const wrong2 = `Bỏ qua các yếu tố tương tác và điều kiện biên của hệ thống.`;
    const wrong3 = `Trái ngược với quy luật tự nhiên và thực tiễn kiểm chứng.`;

    const distinctOptions = ['A', 'B', 'C', 'D'].map((l) => {
      if (l === correctLetter) return `${l}. ${correctText}`;
      if (l === 'A') return `A. ${wrong1}`;
      if (l === 'B') return `B. ${wrong2}`;
      return `${l}. ${wrong3}`;
    });

    return {
      question: `Trong chương trình ${subject} (Lớp ${grade}), khi tìm hiểu về "${t}", khẳng định nào sau đây là ĐÚNG về ${variant.aspect}?`,
      options: distinctOptions,
      correctAnswer: correctLetter,
      explanation: `Phương án ${correctLetter} là phát biểu chính xác. Nội dung này bám sát chuẩn kiến thức về ${variant.aspect} của bài học "${t}".`,
      level,
      learningOutcome: `Học sinh nắm vững ${variant.aspect} trong chủ đề "${t}".`,
    };
  }

  if (typeKey === 'true_false') {
    return {
      question: `Xét tính Đúng/Sai của các nhận định dưới đây khi nghiên cứu về chủ đề "${t}" (Môn ${subject} - Lớp ${grade}):`,
      subItems: [
        { id: 'a', statement: `Nội dung kiến thức mang tính quy luật khoa học và logic chặt chẽ.`, isCorrect: true },
        { id: 'b', statement: `Có thể áp dụng trực tiếp để giải thích các hiện tượng và bài toán thực tế.`, isCorrect: true },
        { id: 'c', statement: `Kiến thức này hoàn toàn độc lập và không liên hệ với bất kỳ môn học nào khác.`, isCorrect: false },
        { id: 'd', statement: `Cần tuân thủ đúng các điều kiện tiên quyết và quy trình khi triển khai.`, isCorrect: true },
      ],
      correctAnswer: 'a-Đ, b-Đ, c-S, d-Đ',
      explanation: 'Ý a, b, d là các nhận định khoa học chuẩn mực; ý c là nhận định sai do kiến thức luôn mang tính liên môn.',
      level,
      learningOutcome: `Phân biệt chính xác các khía cạnh đúng sai của "${t}".`,
    };
  }

  if (typeKey === 'short_answer') {
    return {
      question: `Trong bài toán / tình huống về "${t}", hãy xác định thông số then chốt hoặc khái niệm mang tính quyết định đến kết quả (Điền giá trị cụ thể hoặc từ khóa cốt lõi).`,
      correctAnswer: `Giá trị chuẩn (hoặc Khái niệm trọng tâm)`,
      explanation: `Học sinh vận dụng công thức và định lý về "${t}" để tính ra đáp số chuẩn xác.`,
      level,
      learningOutcome: `Xác định nhanh thông số định lượng trong bài toán "${t}".`,
    };
  }

  // Default Essay
  return {
    question: `Dựa trên kiến thức về "${t}" trong môn ${subject} (Lớp ${grade}), hãy ${variant.action} vấn đề sau: Nêu rõ giả thiết, các bước lập luận, viết biểu thức/công thức tương ứng và rút ra bài học vận dụng thực tế.`,
    correctAnswer: 'Học sinh trình bày đầy đủ: Định nghĩa bản chất (30%), Các bước giải/lập luận logic (40%), Kết luận và ý nghĩa thực tiễn (30%).',
    explanation: '- Nêu đúng giả thiết và bản chất khoa học: 0.5 điểm.\n- Lập luận logic, chính xác từng bước: 0.5 điểm.\n- Liên hệ thực tế hoặc đưa ra ví dụ minh họa xác đáng: 0.5 điểm.',
    level,
    learningOutcome: `Vận dụng năng lực giải quyết vấn đề tổng hợp về "${t}".`,
  };
}

export function createFallbackExamPackage(config: ExamConfig): GeneratedExamPackage {
  const { subject, grade, level, topic, questionCounts, scoreScale, teacherQuestions, keepTeacherQuestions } = config;
  const totalScoreTarget = scoreScale || 10;
  const questions: Question[] = [];

  // Include teacher questions if any
  if (Array.isArray(teacherQuestions) && keepTeacherQuestions && teacherQuestions.length > 0) {
    questions.push(...teacherQuestions);
  }

  const isMath = subject.toLowerCase().includes('toán');
  const isLit = subject.toLowerCase().includes('văn') || subject.toLowerCase().includes('tiếng việt');
  const mathPool = isMath ? getMathQuestionsPool(topic, grade) : null;
  const litPool = isLit ? getLiteratureQuestionsPool(topic, grade) : null;

  let qCounter = questions.length + 1;
  const levels: CognitiveLevel[] = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];

  // Track usage index per question type
  let mcqIdx = 0;
  let tfIdx = 0;
  let saIdx = 0;
  let essayIdx = 0;

  Object.entries(questionCounts).forEach(([typeKey, count]) => {
    const num = Number(count) || 0;
    if (num <= 0) return;

    const meta = QUESTION_TYPES_META.find((m) => m.id === typeKey);
    const typeName = meta?.name || 'Câu hỏi';

    for (let i = 0; i < num; i++) {
      const assignedLevel = levels[(qCounter - 1) % 4];
      const qId = `Q${String(qCounter).padStart(2, '0')}`;

      let tpl: QuestionTemplate;

      if (typeKey === 'mcq_4') {
        if (mathPool && mathPool.mcq[mcqIdx]) {
          tpl = mathPool.mcq[mcqIdx];
        } else if (litPool && litPool.mcq[mcqIdx]) {
          tpl = litPool.mcq[mcqIdx];
        } else {
          tpl = getDynamicQuestions(config, mcqIdx, 'mcq_4', assignedLevel);
        }
        mcqIdx++;
      } else if (typeKey === 'true_false') {
        if (mathPool && mathPool.trueFalse[tfIdx]) {
          tpl = mathPool.trueFalse[tfIdx];
        } else if (litPool && litPool.trueFalse[tfIdx]) {
          tpl = litPool.trueFalse[tfIdx];
        } else {
          tpl = getDynamicQuestions(config, tfIdx, 'true_false', assignedLevel);
        }
        tfIdx++;
      } else if (typeKey === 'short_answer') {
        if (mathPool && mathPool.shortAnswer[saIdx]) {
          tpl = mathPool.shortAnswer[saIdx];
        } else if (litPool && litPool.shortAnswer[saIdx]) {
          tpl = litPool.shortAnswer[saIdx];
        } else {
          tpl = getDynamicQuestions(config, saIdx, 'short_answer', assignedLevel);
        }
        saIdx++;
      } else {
        // Essay / writing
        if (mathPool && mathPool.essay[essayIdx]) {
          tpl = mathPool.essay[essayIdx];
        } else if (litPool && litPool.essay[essayIdx]) {
          tpl = litPool.essay[essayIdx];
        } else {
          tpl = getDynamicQuestions(config, essayIdx, typeKey, assignedLevel);
        }
        essayIdx++;
      }

      questions.push({
        id: qId,
        subject,
        grade: `Lớp ${grade}`,
        topic: topic || 'Nội dung kiến thức trọng tâm',
        questionType: typeKey as QuestionType,
        questionTypeName: typeName,
        level: tpl.level || assignedLevel,
        question: tpl.question,
        readingPassage: tpl.readingPassage,
        options: tpl.options,
        correctAnswer: tpl.correctAnswer,
        explanation: tpl.explanation,
        score: 0.5,
        learningOutcome: tpl.learningOutcome || `Nắm vững kiến thức trọng tâm về ${topic || subject}.`,
        subItems: tpl.subItems,
        needsReview: false,
      });

      qCounter++;
    }
  });

  // Re-scale question scores so total score matches scoreScale exactly
  if (questions.length > 0) {
    const basePerQ = Number((totalScoreTarget / questions.length).toFixed(2));
    questions.forEach((q) => {
      q.score = basePerQ;
    });
    const currentSum = Number(questions.reduce((s, q) => s + q.score, 0).toFixed(2));
    const diff = Number((totalScoreTarget - currentSum).toFixed(2));
    if (diff !== 0) {
      questions[questions.length - 1].score = Number(
        (questions[questions.length - 1].score + diff).toFixed(2)
      );
    }
  }

  const matrix = generateExamMatrix(config, questions);
  const specifications = generateSpecifications(config, questions);
  const testCodes = generateTestCodes(questions, config.testCodeCount || 2);
  const qualityCheck = runAutomaticQualityCheck(config, questions, matrix);

  return {
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
        criteria: 'Chuẩn kiến thức và năng lực bộ môn GDPT 2018',
        scoreBreakdown: [
          { item: 'Phần trắc nghiệm khách quan', score: Number((totalScoreTarget * 0.7).toFixed(1)) },
          { item: 'Phần tự luận / vận dụng', score: Number((totalScoreTarget * 0.3).toFixed(1)) },
        ],
        notes: ['Chấm theo từng bước', 'Không trừ điểm lỗi chính tả nhỏ nếu không làm sai lệch ý nghĩa'],
      },
    ],
  };
}
