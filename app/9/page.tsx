"use client";

import { createElement, useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    katex?: {
      render: (
        expression: string,
        element: HTMLElement,
        options?: {
          displayMode?: boolean;
          throwOnError?: boolean;
        },
      ) => void;
    };
  }
}

type StoredAnswer = { value: string; dontKnow: boolean };
type QuestionType = "text" | "single" | "multi" | "roots";
type DiagramKind =
  | "function-graph"
  | "parallelogram"
  | "trapezoid-midline"
  | "trapezoid-area"
  | "pythagoras"
  | "similar-triangles"
  | "trig-30"
  | "circle-angle";

type Question = {
  id: number;
  part: "Алгебра" | "Геометрия";
  block: string;
  eyebrow: string;
  prompt: string;
  expression?: string;
  diagram?: DiagramKind;
  note?: string;
  type: QuestionType;
  options?: string[];
  correct?: string | string[];
  number?: number;
};

type BlockResult = {
  name: string;
  correct: number;
  total: number;
  unknown: number;
  percent: number;
  status: "good" | "repeat" | "priority";
};
const TELEGRAM_USERNAME = "vxoab";
const STORAGE_KEY = "math-diagnostic-before-9-v3";
const MULTI_SEPARATOR = "|||";

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/ё/g, "е")
    .replace(/\s+/g, "")
    .replace(/[.;]+$/g, "");

function asNumber(value: string) {
  const cleaned = normalize(value)
    .replace(/,/g, ".")
    .replace(/^[a-zа-я]+=/i, "")
    .replace(/[^0-9.+-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
function renderMathText(value: string) {
  const parts = value.split(/(√(?:\([^)]*\)|[0-9a-zа-яё]+))/gi);

  return parts.map((part, index) => {
    if (!part.startsWith("√")) {
      return part;
    }

    const hasParentheses =
      part.startsWith("√(") && part.endsWith(")");

    const radicand = hasParentheses
      ? part.slice(2, -1)
      : part.slice(1);

    return createElement(
      "math",
      {
        className: "math-root",
        key: `${part}-${index}`,
        "aria-label": `квадратный корень из ${radicand}`,
      },
      createElement(
        "msqrt",
        null,
        createElement("mtext", null, radicand),
      ),
    );
  });
}

function rootsAreCorrect(value: string) {
  const roots = value
    .trim()
    .split(/[;,]/)
    .map((part) => asNumber(part))
    .filter((part): part is number => part !== null)
    .sort((a, b) => a - b);

  return roots.length === 2 && roots[0] === 3 && roots[1] === 4;
}
const questions: Question[] = [
  {
    id: 1, part: "Алгебра", block: "Рациональные выражения",
    eyebrow: "Допустимые значения переменной",
    prompt: "При каких значениях x выражение не имеет смысла?",
    expression: String.raw`\frac{x+2}{x(x-5)}`, type: "multi",
    options: ["x = −2", "x = 0", "x = 2", "x = 5"],
    correct: ["x = 0", "x = 5"],
  },
  {
    id: 2, part: "Алгебра", block: "Рациональные выражения",
    eyebrow: "Сокращение алгебраической дроби", prompt: "Сократи дробь:",
    expression: String.raw`\frac{x^2-9}{x^2+3x}`, type: "single",
    options: ["(x − 3) / x", "(x + 3) / x", "(x − 3) / (x + 3)", "(x + 3) / (x − 3)"],
    correct: "(x − 3) / x",
  },
  {
    id: 3, part: "Алгебра", block: "Рациональные выражения",
    eyebrow: "Действия с алгебраическими дробями", prompt: "Упрости выражение:",
    expression: String.raw`\frac{2x}{x-1}\cdot\frac{x^2-1}{4x}`, type: "single",
    options: ["(x + 1) / 2", "(x − 1) / 2", "2(x + 1)", "(x + 1) / 4"],
    correct: "(x + 1) / 2",
  },
  {
    id: 4, part: "Алгебра", block: "Квадратные корни",
    eyebrow: "Вычисление выражения", prompt: "Вычисли:",
    expression: String.raw`\sqrt{144}+\sqrt{25}`, type: "text", number: 17,
  },
  {
    id: 5, part: "Алгебра", block: "Квадратные корни",
    eyebrow: "Преобразование выражения с корнями", prompt: "Упрости:",
    expression: String.raw`\sqrt{75}-\sqrt{12}`, type: "single",
    options: ["3√3", "7√3", "√63", "3"], correct: "3√3",
  },
  {
    id: 6, part: "Алгебра", block: "Квадратные корни",
    eyebrow: "Сравнение выражений с корнями", prompt: "Сравни:",
    expression: String.raw`\sqrt{45}\quad\text{и}\quad3\sqrt{5}`, type: "single",
    options: ["√45 > 3√5", "√45 < 3√5", "√45 = 3√5", "сравнить невозможно"],
    correct: "√45 = 3√5",
  },
  {
    id: 7, part: "Алгебра", block: "Выражения и уравнения",
    eyebrow: "Формулы сокращённого умножения", prompt: "Раскрой скобки:",
    expression: String.raw`(a-4)^2`, type: "single",
    options: ["a² − 8a + 16", "a² − 16", "a² − 4a + 16", "a² + 8a + 16"],
    correct: "a² − 8a + 16",
  },
  {
    id: 8, part: "Алгебра", block: "Выражения и уравнения",
    eyebrow: "Разложение на множители", prompt: "Разложи на множители:",
    expression: String.raw`6x^2-15x`, type: "single",
    options: ["3x(2x − 5)", "3(2x² − 5x)", "x(6x − 15x)", "3x(2x − 15)"],
    correct: "3x(2x − 5)",
  },
  {
    id: 9, part: "Алгебра", block: "Выражения и уравнения",
    eyebrow: "Линейное уравнение", prompt: "Реши уравнение:",
    expression: String.raw`3(2x-1)-5=4x+6`, type: "text", number: 7,
  },
  {
    id: 10, part: "Алгебра", block: "Выражения и уравнения",
    eyebrow: "Квадратное уравнение", prompt: "Реши уравнение:",
    expression: String.raw`x^2-7x+12=0`, type: "roots",
    note: "Запиши оба корня через запятую или точку с запятой. Порядок не важен.",
  },
  {
    id: 11, part: "Алгебра", block: "Неравенства",
    eyebrow: "Линейное неравенство", prompt: "Реши неравенство:",
    expression: String.raw`5-2x>11`, type: "single",
    options: ["x < −3", "x > −3", "x < 3", "x > 3"], correct: "x < −3",
  },
  {
    id: 12, part: "Алгебра", block: "Неравенства",
    eyebrow: "Система неравенств", prompt: "Найди множество решений системы:",
    expression: String.raw`\begin{cases}x\ge -1\\x<4\end{cases}`, type: "single",
    options: ["[−1; 4)", "(−1; 4)", "[−1; 4]", "(−∞; −1] ∪ (4; +∞)"], correct: "[−1; 4)",
  },
  {
    id: 13, part: "Алгебра", block: "Функции и графики",
    eyebrow: "Значение функции", prompt: "Функция задана формулой f(x) = 3x² − 1. Найди f(−2).",
    type: "text", number: 11,
  },
  {
    id: 14, part: "Алгебра", block: "Функции и графики",
    eyebrow: "Чтение графика", prompt: "На рисунке изображён график функции y = f(x). Найди f(2).",
    diagram: "function-graph", type: "text", number: 4,
  },
  {
    id: 15, part: "Алгебра", block: "Функции и графики",
    eyebrow: "Область определения функции", prompt: "Укажи область определения функции:",
    expression: String.raw`y=\sqrt{5-x}`, type: "single",
    options: ["x ≤ 5", "x ≥ 5", "x < 5", "любое число"], correct: "x ≤ 5",
  },
  {
    id: 16, part: "Алгебра", block: "Степени",
    eyebrow: "Степень с отрицательным показателем", prompt: "Вычисли:",
    expression: String.raw`2^{-3}`, type: "single",
    options: ["1/8", "−8", "8", "−1/8"], correct: "1/8",
  },
  {
    id: 17, part: "Алгебра", block: "Степени",
    eyebrow: "Стандартный вид числа", prompt: "Запиши число 0,00042 в стандартном виде.",
    type: "single",
    options: ["4,2 · 10⁻⁴", "4,2 · 10⁴", "42 · 10⁻⁴", "0,42 · 10⁻⁴"], correct: "4,2 · 10⁻⁴",
  },
  {
    id: 18, part: "Алгебра", block: "Статистика",
    eyebrow: "Среднее арифметическое",
    prompt: "Ученик получил за пять работ баллы: 6, 8, 7, 9, 10. Найди средний балл.",
    type: "text", number: 8,
  },
  {
    id: 19, part: "Геометрия", block: "Четырёхугольники",
    eyebrow: "Свойства параллелограмма",
    prompt: "В параллелограмме ABCD угол A равен 68°. Найди угол B.",
    diagram: "parallelogram", type: "text", number: 112,
    note: "Рисунок не обязательно выполнен в масштабе.",
  },
  {
    id: 20, part: "Геометрия", block: "Четырёхугольники",
    eyebrow: "Средняя линия трапеции",
    prompt: "Основания трапеции равны 8 см и 14 см. Найди длину её средней линии.",
    diagram: "trapezoid-midline", type: "text", number: 11,
  },
  {
    id: 21, part: "Геометрия", block: "Площади",
    eyebrow: "Площадь трапеции",
    prompt: "Основания трапеции равны 7 см и 13 см, а высота — 6 см. Найди площадь трапеции.",
    diagram: "trapezoid-area", type: "text", number: 60,
  },
  {
    id: 22, part: "Геометрия", block: "Теорема Пифагора",
    eyebrow: "Нахождение стороны",
    prompt: "Катеты прямоугольного треугольника равны 6 см и 8 см. Найди гипотенузу.",
    diagram: "pythagoras", type: "text", number: 10,
  },
  {
    id: 23, part: "Геометрия", block: "Теорема Пифагора",
    eyebrow: "Обратная теорема Пифагора",
    prompt: "Определи вид треугольника со сторонами 7, 24 и 25.",
    type: "single",
    options: ["прямоугольный", "остроугольный", "тупоугольный", "такого треугольника не существует"],
    correct: "прямоугольный",
  },
  {
    id: 24, part: "Геометрия", block: "Подобие",
    eyebrow: "Стороны подобных треугольников",
    prompt: "Треугольники ABC и A₁B₁C₁ подобны. Стороне AB = 6 см соответствует сторона A₁B₁ = 9 см. Стороне BC = 8 см соответствует сторона B₁C₁. Найди B₁C₁.",
    diagram: "similar-triangles", type: "text", number: 12,
    note: "Рисунок не обязательно выполнен в масштабе.",
  },
  {
    id: 25, part: "Геометрия", block: "Подобие",
    eyebrow: "Площади подобных фигур",
    prompt: "Коэффициент подобия двух треугольников равен 3. Площадь меньшего треугольника равна 10 см². Найди площадь большего треугольника.",
    type: "text", number: 90,
  },
  {
    id: 26, part: "Геометрия", block: "Тригонометрия",
    eyebrow: "Угол 30° в прямоугольном треугольнике",
    prompt: "Гипотенуза прямоугольного треугольника равна 10 см. Один из острых углов равен 30°. Найди катет, лежащий напротив этого угла.",
    diagram: "trig-30", type: "text", number: 5,
  },
  {
    id: 27, part: "Геометрия", block: "Окружность",
    eyebrow: "Центральный и вписанный углы",
    prompt: "Центральный угол AOB равен 116°. Точка C лежит на окружности. Найди вписанный угол ACB, опирающийся на ту же дугу AB.",
    diagram: "circle-angle", type: "text", number: 58,
    note: "Рисунок не обязательно выполнен в масштабе.",
  },
  {
    id: 28, part: "Геометрия", block: "Окружность",
    eyebrow: "Свойства окружности", prompt: "Выбери все верные утверждения.",
    type: "multi",
    options: [
      "Радиус, проведённый в точку касания, перпендикулярен касательной.",
      "Сумма противоположных углов вписанного четырёхугольника равна 180°.",
      "Вписанный угол равен центральному углу, опирающемуся на ту же дугу.",
      "Касательная имеет с окружностью две общие точки.",
    ],
    correct: [
      "Радиус, проведённый в точку касания, перпендикулярен касательной.",
      "Сумма противоположных углов вписанного четырёхугольника равна 180°.",
    ],
  },
];

const blockOrder = [
  "Рациональные выражения", "Квадратные корни", "Выражения и уравнения",
  "Неравенства", "Функции и графики", "Степени", "Статистика",
  "Четырёхугольники", "Площади", "Теорема Пифагора", "Подобие",
  "Тригонометрия", "Окружность",
];

function isCorrect(question: Question, answer?: StoredAnswer) {
  if (!answer || answer.dontKnow || !answer.value.trim()) return false;
  if (question.type === "text") return asNumber(answer.value) === question.number;
  if (question.type === "roots") return rootsAreCorrect(answer.value);
  if (question.type === "single") return normalize(answer.value) === normalize(String(question.correct));
  const selected = answer.value.split(MULTI_SEPARATOR).filter(Boolean).map(normalize).sort();
  const expected = (question.correct as string[]).map(normalize).sort();
  return selected.length === expected.length && selected.every((item, index) => item === expected[index]);
}

function getCorrectAnswer(question: Question) {
  if (question.type === "roots") {
    return "3; 4";
  }

  if (question.type === "text") {
    return String(question.number);
  }

  if (Array.isArray(question.correct)) {
    return question.correct.join("; ");
  }

  return question.correct || "—";
}

function GradeNineDiagram({ kind }: { kind: DiagramKind }) {
  return (
    <div className="geometry-diagram grade-nine-diagram">
      <svg viewBox="0 0 420 260" role="img" aria-label="Геометрическая схема к заданию">
        {kind === "function-graph" && (
          <>
            <g className="graph-grid">
              {[40, 75, 110, 145, 180, 215, 250, 285, 320, 355, 390].map((x) => <line key={`x${x}`} x1={x} y1="18" x2={x} y2="242" />)}
              {[30, 65, 100, 135, 170, 205, 240].map((y) => <line key={`y${y}`} x1="40" y1={y} x2="390" y2={y} />)}
            </g>
            <g className="graph-axes">
              <line x1="40" y1="170" x2="396" y2="170" /><path d="M388 164 L396 170 L388 176" />
              <line x1="180" y1="242" x2="180" y2="12" /><path d="M174 20 L180 12 L186 20" />
              <text x="398" y="181">x</text><text x="190" y="18">y</text><text x="187" y="184">0</text>
              {[-3, -2, -1, 1, 2, 3, 4, 5].map((n) => <text key={`xn${n}`} x={180 + n * 35 - 5} y="188">{n}</text>)}
              {[-2, -1, 1, 2, 3, 4].map((n) => <text key={`yn${n}`} x="157" y={174 - n * 35}>{n}</text>)}
            </g>
            <polyline points="75,135 145,240 250,30 320,170" className="graph-line" />
            {[[75,135],[145,240],[250,30],[320,170]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" className="graph-point" />)}
          </>
        )}
        {kind === "parallelogram" && (
          <>
            <polygon points="80,205 315,205 355,65 120,65" />
            <path d="M113 205 A33 33 0 0 0 91 174" className="angle-arc" />
            <text x="112" y="177" className="value-label">68°</text>
            
            <text x="61" y="225">A</text><text x="318" y="225">B</text>
            <text x="360" y="61">C</text><text x="101" y="61">D</text>
          </>
        )}
        {kind === "trapezoid-midline" && (
          <>
            <polygon points="70,210 350,210 295,55 135,55" />
            <line x1="102" y1="132" x2="323" y2="132" className="midline" />
            <text x="199" y="45" className="value-label">8</text>
            <text x="199" y="238" className="value-label">14</text>
          </>
        )}
        {kind === "trapezoid-area" && (
          <>
            <polygon points="65,210 355,210 300,55 145,55" />
            <line x1="145" y1="55" x2="145" y2="210" className="height-line" />
            <path d="M145 191 h19 v19" className="marker" />
            <text x="198" y="45" className="value-label">7</text>
            <text x="198" y="238" className="value-label">13</text>
            <text x="116" y="137" className="value-label">6</text>
          </>
        )}
        {kind === "pythagoras" && (
          <>
            <polygon points="95,215 95,55 335,215" />
            <path d="M95 193 h22 v22" className="marker" />
            <text x="61" y="140" className="value-label">6</text>
            <text x="202" y="239" className="value-label">8</text>
            <text x="223" y="126" className="question-label">?</text>
          </>
        )}
        {kind === "similar-triangles" && (
          <>
            <polygon points="36,205 112,75 188,205" />
            <polygon points="215,220 310,35 405,220" />
            <path d="M96 102 A23 23 0 0 0 128 102" className="angle-arc" />
            <path d="M291 72 A27 27 0 0 0 329 72" className="angle-arc" />
            <path d="M48 184 A28 28 0 0 1 66 205" className="angle-arc secondary" />
            <path d="M228 195 A31 31 0 0 1 247 220" className="angle-arc secondary" />
            <text x="103" y="66">A</text><text x="21" y="220">B</text><text x="190" y="220">C</text>
            <text x="300" y="27">A₁</text><text x="199" y="239">B₁</text><text x="404" y="239">C₁</text>
            <text x="49" y="136" className="value-label">6</text>
            <text x="103" y="226" className="value-label">8</text>
            <text x="236" y="133" className="value-label">9</text>
<text x="310" y="235" textAnchor="middle" className="question-label">?</text>
          </>
        )}
        {kind === "trig-30" && (
          <>
            <polygon points="85,215 85,55 350,215" />
            <path d="M85 193 h22 v22" className="marker" />
            <path d="M310 215 A40 40 0 0 1 316 192" className="angle-arc" />
<text x="274" y="202" className="value-label">30°</text>
            <text x="211" y="119" className="value-label">10</text>
            <text x="52" y="140" className="question-label">?</text>
          </>
        )}
        {kind === "circle-angle" && (
          <>
            <circle cx="210" cy="130" r="96" />
            <line x1="210" y1="130" x2="129" y2="78" />
            <line x1="210" y1="130" x2="291" y2="78" />
            <line x1="210" y1="226" x2="129" y2="78" />
            <line x1="210" y1="226" x2="291" y2="78" />
            <path d="M184 113 A31 31 0 0 1 236 113" className="angle-arc" />
            <text x="192" y="91" className="value-label">116°</text>
            <text x="112" y="72">A</text><text x="298" y="72">B</text>
          <text x="212" y="142">O</text>
<text x="215" y="248">C</text>
          </>
        )}
      </svg>
    </div>
  );
}


function MathFormula({
  expression,
  displayMode = true,
}: {
  expression: string;
  displayMode?: boolean;
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const renderFormula = () => {
      if (!window.katex) return false;

      window.katex.render(expression, element, {
        displayMode,
        throwOnError: false,
      });

      return true;
    };

    if (renderFormula()) return;

    const timer = window.setInterval(() => {
      if (renderFormula()) window.clearInterval(timer);
    }, 100);

    return () => window.clearInterval(timer);
  }, [element, expression, displayMode]);

  return <div ref={setElement} />;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character,
  );
}

function Doodle() {
  return (
    <div className="doodle grade-eight-doodle grade-nine-doodle" aria-hidden="true">
      <span className="doodle-plus">√x</span>
      <span className="doodle-pi">x²</span>
      <span className="doodle-frac"><b>a</b><i /><b>b</b></span>
      <div className="doodle-paper"><div /><div /><div /><span>9</span></div>
      <span className="doodle-dot dot-one" /><span className="doodle-dot dot-two" />
    </div>
  );
}


export default function GradeNineDiagnostic() {
  const [screen, setScreen] =
    useState<"home" | "test" | "bridge" | "review" | "result">("home");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StoredAnswer>>({});
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [copyFallback, setCopyFallback] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (["home", "test", "bridge", "review"].includes(parsed.screen)) {
          setScreen(parsed.screen);
        }

        setName(parsed.name || "");
        setAccepted(Boolean(parsed.accepted));
        setAnswers(parsed.answers || {});
        setCurrent(
          Math.min(
            Math.max(parsed.current || 0, 0),
            questions.length - 1,
          ),
        );
      }
    } catch {
      // Повреждённое сохранение не мешает начать заново.
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || screen === "result") return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        screen,
        name,
        accepted,
        answers,
        current,
      }),
    );
  }, [
    screen,
    name,
    accepted,
    answers,
    current,
    hydrated,
  ]);

  const status = (question: Question) => {
    const answer = answers[question.id];

    if (!answer || (!answer.dontKnow && !answer.value.trim())) {
      return "unanswered";
    }

    if (answer.dontKnow) return "dont_know";

    return isCorrect(question, answer)
      ? "correct"
      : "incorrect";
  };

  const answeredCount = questions.filter(
    (question) => status(question) !== "unanswered",
  ).length;

  const score = useMemo(
    () =>
      questions.filter((question) =>
        isCorrect(question, answers[question.id]),
      ).length,
    [answers],
  );

  const incorrectCount = questions.filter(
    (question) => status(question) === "incorrect",
  ).length;

  const dontKnowCount = questions.filter(
    (question) => status(question) === "dont_know",
  ).length;


  const unanswered = questions.filter(
    (question) => status(question) === "unanswered",
  );

  const blockResults = useMemo<BlockResult[]>(
    () =>
      blockOrder.map((block) => {
        const items = questions.filter(
          (question) => question.block === block,
        );

        const correct = items.filter((question) =>
          isCorrect(question, answers[question.id]),
        ).length;

        const unknown = items.filter(
          (question) => answers[question.id]?.dontKnow,
        ).length;

        const percent = Math.round(
          (correct / items.length) * 100,
        );

        const blockStatus: BlockResult["status"] =
          percent >= 80
            ? "good"
            : percent >= 50
              ? "repeat"
              : "priority";

        return {
          name: block,
          correct,
          total: items.length,
          unknown,
          percent,
          status: blockStatus,
        };
      }),
    [answers],
  );

  const ordered = (kind: BlockResult["status"]) =>
    blockResults
      .filter((block) => block.status === kind)
      .sort(
        (a, b) =>
          a.percent - b.percent ||
          b.unknown - a.unknown ||
          blockOrder.indexOf(a.name) -
            blockOrder.indexOf(b.name),
      );

  const start = () => {
    if (!name.trim() || !accepted) return;

    setScreen("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    const confirmed = window.confirm(
      "Начать диагностику заново? Сохранённые ответы будут удалены.",
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    setName("");
    setAccepted(false);
    setAnswers({});
    setCurrent(0);
    setScreen("home");
    setCopyState("");
    setCopyFallback("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resultText = () => {
    const section = (
      title: string,
      items: BlockResult[],
    ) =>
      items.length
        ? `${title}:\n${items
            .map((item) => `— ${item.name}`)
            .join("\n")}`
        : "";

    return [
      "Диагностика «Что повторить перед 9 классом?»",
      `Имя: ${name.trim() || "не указано"}`,
      `Результат: ${score} из ${questions.length}`,
      `Ошибок: ${incorrectCount}`,
      `Отмечено «Не знаю»: ${dontKnowCount}`,
      section("С этим всё хорошо", ordered("good")),
      section(
        "Стоит немного повторить",
        ordered("repeat"),
      ),
      section(
        "Нужно повторить в первую очередь",
        ordered("priority"),
      ),
      `Работа выполнена: ${new Date().toLocaleString("ru-RU")}`,
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const copyResult = async (
    message = "Результат скопирован",
  ) => {
    try {
      await navigator.clipboard.writeText(resultText());
      setCopyState(message);
      setCopyFallback("");
    } catch {
      setCopyState(
        "Не получилось скопировать автоматически",
      );
      setCopyFallback(resultText());
    }

    window.setTimeout(
      () => setCopyState(""),
      3000,
    );
  };

  const downloadResult = () => {
    const rows = questions
      .map((question, index) => {
        const questionStatus = status(question);
        const answer = answers[question.id];

        const studentAnswer = answer?.dontKnow
          ? "Не знаю, как решить"
          : answer?.value
            ? answer.value
                .split(MULTI_SEPARATOR)
                .join("; ")
            : "Нет ответа";

        const statusLabel =
          questionStatus === "correct"
            ? "Правильно"
            : questionStatus === "incorrect"
              ? "Неправильно"
              : questionStatus === "dont_know"
                ? "Не знаю"
                : "Нет ответа";

        return `<tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(question.block)}</td>
          <td>${escapeHtml(studentAnswer)}</td>
          <td>${escapeHtml(getCorrectAnswer(question))}</td>
          <td>${escapeHtml(statusLabel)}</td>
        </tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html lang="ru">
<meta charset="utf-8">
<title>Результат диагностики</title>
<style>
body{font-family:Arial,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;color:#28222c}
h1{color:#674fa6}
pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}
table{width:100%;border-collapse:collapse}
td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}
@media print{button{display:none}}
</style>
<body>
<h1>Что повторить перед 9 классом?</h1>
<pre>${escapeHtml(resultText())}</pre>
<h2>Все задания</h2>
<table>
<tr>
<th>№</th>
<th>Тема</th>
<th>Ответ ученика</th>
<th>Правильный ответ</th>
<th>Статус</th>
</tr>
${rows}
</table>
<button onclick="window.print()">Печать / сохранить как PDF</button>
</body>
</html>`;

    const url = URL.createObjectURL(
      new Blob([html], {
        type: "text/html;charset=utf-8",
      }),
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = `Перед_9_классом_${
      name.trim().replace(/\s+/g, "_") ||
      "ученик"
    }.html`;

    link.click();

    window.setTimeout(
      () => URL.revokeObjectURL(url),
      1000,
    );
  };

  if (screen === "test") {
    const question = questions[current];

    const stored =
      answers[question.id] || {
        value: "",
        dontKnow: false,
      };

    const selected = stored.dontKnow
      ? []
      : stored.value
          .split(MULTI_SEPARATOR)
          .filter(Boolean);

    const hasAnswer =
      stored.dontKnow ||
      Boolean(stored.value.trim());

    const goNext = () => {
      if (!hasAnswer) return;

      if (current === 17) {
        setScreen("bridge");
      } else if (
        current === questions.length - 1
      ) {
        setScreen("review");
      } else {
        setCurrent((value) => value + 1);
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const updateAnswer = (value: string) => {
      setAnswers((previous) => ({
        ...previous,
        [question.id]: {
          value,
          dontKnow: false,
        },
      }));
    };

    return (
      <main className="test-shell grade-nine-page">
        <header className="compact-header">
          <a className="brand" href="/">
            <span className="brand-mark">∿</span>
            <span>Математика без стресса</span>
          </a>

          <button
            className="text-button"
            onClick={restart}
          >
            Начать сначала
          </button>
        </header>

        <section className="test-wrap">
          <div className="progress-line">
            <div>
              <span>
                Задание {current + 1} из{" "}
                {questions.length}
              </span>
              <small>
                {answeredCount} ответов сохранено
              </small>
            </div>

            <strong>
              {Math.round(
                ((current + 1) /
                  questions.length) *
                  100,
              )}
              %
            </strong>
          </div>

          <div
            className="progress-track"
            aria-label={`Прогресс: задание ${
              current + 1
            } из ${questions.length}`}
          >
            <span
              style={{
                width: `${
                  ((current + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />
          </div>

          <nav
            className="question-number-nav"
            aria-label="Переход по заданиям"
          >
            {questions.map((item, index) => {
              const itemStatus = status(item);

              const stateClass =
                itemStatus === "dont_know"
                  ? "unknown"
                  : itemStatus === "unanswered"
                    ? "empty"
                    : "answered";

              return (
                <button
                  type="button"
                  className={`${stateClass} ${
                    index === current ? "current" : ""
                  }`}
                  key={item.id}
                  onClick={() => {
                    setCurrent(index);
                    setScreen("test");
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </nav>

          <article className="question-card grade-nine-question">
            <div className="question-meta">
              <span>{question.part}</span>
              <span>{question.block}</span>
            </div>

            <p className="question-eyebrow">
              {question.eyebrow}
            </p>

            <h1>{question.prompt}</h1>

            {question.expression && (
              <div className="expression grade-nine-expression">
                <MathFormula
                  expression={question.expression}
                />
              </div>
            )}

            {question.diagram && (
              <GradeNineDiagram kind={question.diagram} />
            )}

            {question.note && (
              <p className="diagram-note">
                {question.note}
              </p>
            )}

            {(question.type === "text" ||
              question.type === "roots") && (
              <label className="answer-field">
                <span>Твой ответ</span>

                <input
                  autoFocus
                  inputMode={
                    question.type === "text"
                      ? "decimal"
                      : "text"
                  }
                  value={
                    stored.dontKnow
                      ? ""
                      : stored.value
                  }
                  onChange={(event) =>
                    updateAnswer(event.target.value)
                  }
                  placeholder={
                    question.type === "roots"
                      ? "Например: 3; 4"
                      : "Введи ответ"
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      hasAnswer
                    ) {
                      goNext();
                    }
                  }}
                />

                {question.type === "roots" && (
                  <small>
                    Можно через запятую или точку с
                    запятой, в любом порядке
                  </small>
                )}
              </label>
            )}

            {question.type === "single" && (
              <div
                className="options semantic-options"
                role="radiogroup"
                aria-label="Выбери один ответ"
              >
                {question.options?.map((option) => (
                  <label
                    className={`option ${
                      !stored.dontKnow &&
                      stored.value === option
                        ? "selected"
                        : ""
                    }`}
                    key={option}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={
                        !stored.dontKnow &&
                        stored.value === option
                      }
                      onChange={() =>
                        updateAnswer(option)
                      }
                    />

                    <span>
                      {renderMathText(option)}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {question.type === "multi" && (
              <div
                className="options semantic-options"
                aria-label="Выбери все верные ответы"
              >
                {question.options?.map((option) => {
                  const checked =
                    selected.includes(option);

                  return (
                    <label
                      className={`option checkbox-option ${
                        checked ? "selected" : ""
                      }`}
                      key={option}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? selected.filter(
                                (item) =>
                                  item !== option,
                              )
                            : [...selected, option];

                          updateAnswer(
                            next.join(MULTI_SEPARATOR),
                          );
                        }}
                      />

                      <span>
                        {renderMathText(option)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}


            <p className="dont-know-hint">
              Если способ решения совсем непонятен, не
              угадывай — это поможет точнее составить
              рекомендации.
            </p>

            <div className="test-actions grade-seven-actions">
              <button
                className="button secondary"
                disabled={current === 0}
                onClick={() => {
                  setCurrent((value) => value - 1);
                  window.scrollTo({ top: 0 });
                }}
              >
                ← Назад
              </button>

              <button
                className={`button dont-know-button ${
                  stored.dontKnow
                    ? "active-dont-know"
                    : ""
                }`}
                onClick={() =>
                  setAnswers((previous) => ({
                    ...previous,
                    [question.id]: {
                      value: "",
                      dontKnow: true,
                    },
                  }))
                }
              >
                {stored.dontKnow
                  ? "Отмечено: не знаю"
                  : "Не знаю, как решить"}
              </button>

              <button
                className="button primary"
                disabled={!hasAnswer}
                onClick={goNext}
              >
                {current === questions.length - 1
                  ? "К обзору"
                  : "Далее"}{" "}
                →
              </button>
            </div>
          </article>

          <p className="save-note">
            Имя, ответы и прогресс сохраняются только
            в этом браузере
          </p>
        </section>
      </main>
    );
  }

  if (screen === "bridge") {
    return (
      <main className="center-screen grade-nine-page">
        <section className="review-card bridge-card">
          <div className="review-icon">△</div>
          <p className="kicker">
            Алгебра завершена
          </p>
          <h1>Переходим к геометрии</h1>
          <p>
            Впереди 10 заданий по программе 8 класса:
            четырёхугольники, площади, подобие,
            тригонометрия и окружность.
          </p>

          <button
            className="button primary"
            onClick={() => {
              setCurrent(18);
              setScreen("test");
              window.scrollTo({ top: 0 });
            }}
          >
            Перейти к геометрии →
          </button>
        </section>
      </main>
    );
  }

  if (screen === "review") {
    const markUnansweredUnknown = () => {
      setAnswers((previous) => {
        const next = { ...previous };

        unanswered.forEach((question) => {
          next[question.id] = {
            value: "",
            dontKnow: true,
          };
        });

        return next;
      });
    };

    const finish = () => {
      const confirmed = window.confirm(
        "После завершения изменить ответы будет нельзя. Показать результат?",
      );

      if (!confirmed) return;

      setScreen("result");
      localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0 });
    };

    return (
      <main className="result-page grade-nine-page review-overview">
        <header className="compact-header">
          <a className="brand" href="/">
            <span className="brand-mark">∿</span>
            <span>Математика без стресса</span>
          </a>
        </header>

        <section className="result-section overview-heading">
          <p className="kicker">
            Перед результатом
          </p>
          <h1>Обзор всех 28 заданий</h1>

          <p>
            {unanswered.length
              ? `Без ответа осталось: ${unanswered.length}. Вернись к ним или засчитай как «Не знаю, как решить».`
              : "Все задания заполнены или отмечены как «Не знаю, как решить»."}
          </p>
        </section>

        <section className="result-section overview-grid">
          {questions.map((question, index) => {
            const questionStatus = status(question);

            const stateClass =
              questionStatus === "dont_know"
                ? "unknown"
                : questionStatus === "unanswered"
                  ? "empty"
                  : "answered";

            return (
              <button
                className={`overview-item ${stateClass}`}
                key={question.id}
                onClick={() => {
                  setCurrent(index);
                  setScreen("test");
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                <b>№{index + 1}</b>
              </button>
            );
          })}
        </section>

        <section className="result-section review-finish">
          {unanswered.length > 0 && (
            <button
              className="button secondary"
              onClick={markUnansweredUnknown}
            >
              Засчитать пропуски как «Не знаю»
            </button>
          )}

          <button
            className="button primary"
            disabled={unanswered.length > 0}
            onClick={finish}
          >
            Показать результат
          </button>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const percent = Math.round(
      (score / questions.length) * 100,
    );

    const good = ordered("good");
    const repeat = ordered("repeat");
    const priority = ordered("priority");

    const conclusion =
      score === questions.length
        ? "Все задания выполнены правильно. Тем для обязательного повторения нет — можно переходить к программе 9 класса."
        : percent >= 80
          ? "База 8 класса сохранилась уверенно. Перед учебным годом достаточно точечно освежить отдельные темы."
          : percent >= 50
            ? "Многое уже получается. Небольшое повторение поможет начать 9 класс спокойнее и увереннее."
            : "Есть темы, которые стоит восстановить по порядку. Это не оценка, а понятный маршрут для повторения.";

    const telegramMessage = encodeURIComponent(
      `Здравствуйте! Меня зовут ${name.trim()}. ` +
        `Результат моей диагностики перед 9 классом — ${score} из ${questions.length}. ` +
        `Хочу обсудить план повторения.`,
    );

    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${telegramMessage}`;

    return (
      <main className="result-page grade-nine-page">
        <header className="compact-header result-header">
          <a className="brand" href="/">
            <span className="brand-mark">∿</span>
            <span>Математика без стресса</span>
          </a>

          <button
            className="text-button"
            onClick={restart}
          >
            Пройти ещё раз
          </button>
        </header>

        <section className="result-hero">
          <div className="score-orbit">
            <strong>{score}</strong>
            <span>из {questions.length}</span>
          </div>

          <div>
            <p className="kicker">
              Диагностика завершена
            </p>

            <h1>
              {name.trim()
                ? `${name.trim()}, вот твой результат`
                : "Вот твой результат"}
            </h1>

            <p>{conclusion}</p>
          </div>
        </section>

        <section className="result-section result-stats grade-nine-stats">
          <article>
            <strong>
              {score}/{questions.length}
            </strong>
            <span>правильных ответов</span>
          </article>

          <article>
            <strong>{percent}%</strong>
            <span>общий результат</span>
          </article>

          <article>
            <strong>{incorrectCount}</strong>
            <span>с ошибкой</span>
          </article>

          <article>
            <strong>{dontKnowCount}</strong>
            <span>«не знаю»</span>
          </article>

        </section>

        <section className="result-section">
          <div className="section-heading">
            <div>
              <p className="kicker">
                По тематическим блокам
              </p>
              <h2>
                Что уже получается и что повторить
              </h2>
            </div>
          </div>

          <div className="block-results grade-nine-blocks">
            {blockResults.map((block) => (
              <article
                className={`block-card ${
                  block.status === "good"
                    ? "great"
                    : block.status === "repeat"
                      ? "medium"
                      : "restore"
                }`}
                key={block.name}
              >
                <div className="block-topline">
                  <span>
                    {block.correct}/{block.total} ·{" "}
                    {block.percent}%
                  </span>

                  <b>
                    {block.status === "good"
                      ? "Тема усвоена"
                      : block.status === "repeat"
                        ? "Стоит немного повторить"
                        : "Нужно повторить"}
                  </b>
                </div>

                <h3>{block.name}</h3>

                <div className="mini-progress">
                  <span
                    style={{
                      width: `${block.percent}%`,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="result-section three-topic-panels grade-nine-groups">
          <article className="topic-panel strong-panel">
            <p className="kicker">
              {good.length
                ? "Уверенная база"
                : "Пока без уверенных блоков"}
            </p>
            <h2>
              {good.length
                ? "С этим всё хорошо"
                : "Начнём с восстановления базы"}
            </h2>

            <div className="topic-tags">
              {good.length ? (
                good.map((item) => (
                  <span key={item.name}>
                    ✓ {item.name}
                  </span>
                ))
              ) : (
                <p>
                  Это не оценка: темы можно спокойно
                  восстановить по порядку.
                </p>
              )}
            </div>
          </article>

          <article className="topic-panel repeat-panel">
            <p className="kicker">
              {repeat.length
                ? "Небольшое повторение"
                : "Дополнительного повторения нет"}
            </p>
            <h2>
              {repeat.length
                ? "Стоит немного повторить"
                : "Средних по приоритету тем нет"}
            </h2>

            <div className="topic-tags">
              {repeat.length ? (
                repeat.map((item) => (
                  <span key={item.name}>
                    {item.name} · {item.percent}%
                  </span>
                ))
              ) : (
                <p>
                  Здесь не нужно придумывать темы для
                  повторения.
                </p>
              )}
            </div>
          </article>

          <article className="topic-panel restore-panel">
            <p className="kicker">
              {priority.length
                ? "Начать отсюда"
                : "Можно двигаться дальше"}
            </p>
            <h2>
              {priority.length
                ? "Нужно повторить в первую очередь"
                : "Приоритетных пробелов нет"}
            </h2>

            <div className="topic-tags">
              {priority.length ? (
                priority.map((item, index) => (
                  <span key={item.name}>
                    {index + 1}. {item.name} ·{" "}
                    {item.percent}%
                  </span>
                ))
              ) : (
                <p>
                  Нет тем, которые требуется
                  восстанавливать в первую очередь.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="result-section">
          <div className="section-heading">
            <div>
              <p className="kicker">Все задания</p>
              <h2>Посмотри ответы и статусы</h2>
            </div>
          </div>

          <div className="overview-grid result-overview-grid">
            {questions.map((question, index) => {
              const questionStatus = status(question);
              const answer = answers[question.id];

              const stateClass =
                questionStatus === "correct"
                  ? "correct"
                  : questionStatus === "incorrect"
                    ? "wrong"
                    : "unknown";

              const studentAnswer = answer?.dontKnow
                ? "Не знаю, как решить"
                : answer?.value
                  ? answer.value
                      .split(MULTI_SEPARATOR)
                      .join("; ")
                  : "Нет ответа";

              return (
                <details
                  className={`overview-item result-answer-item ${stateClass}`}
                  key={question.id}
                >
                  <summary>
                    <b>№{index + 1}</b>

                    <span>
                      {questionStatus === "correct"
                        ? "Правильно"
                        : questionStatus === "incorrect"
                          ? "Неправильно"
                          : "Не знаю"}
                    </span>
                  </summary>

                  <div>
                    <p>
                      <b>Тема:</b> {question.block}
                    </p>

                    <p>
                      <b>Твой ответ:</b>{" "}
                      {renderMathText(studentAnswer)}
                    </p>

                    <p>
                      <b>Правильный ответ:</b>{" "}
                      {renderMathText(
                        getCorrectAnswer(question),
                      )}
                    </p>

                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <section className="final-cta">
          <div>
            <p className="kicker">Следующий шаг</p>
            <h2>
              Хочешь подготовиться к 9 классу без стресса?
            </h2>
            <p>
              Разберём только те темы, в которых
              остались пробелы, без повторения всей
              программы 8 класса.
            </p>
          </div>

          <div className="cta-actions">
            <button
              className="button secondary"
              onClick={() => copyResult()}
            >
              Скопировать результат
            </button>

            <button
              className="button secondary"
              onClick={downloadResult}
            >
              Скачать результат
            </button>

            <a
              className="button primary"
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                copyResult(
                  "Результат скопирован. Вставь его в сообщение",
                )
              }
            >
              Обсудить результат
            </a>

            <button
              className="button secondary"
              onClick={restart}
            >
              Пройти ещё раз
            </button>
          </div>

          {copyState && (
            <p className="copy-toast" role="status">
              {copyState}
            </p>
          )}

          {copyFallback && (
            <div className="copy-fallback">
              <textarea
                readOnly
                value={copyFallback}
              />
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="home-page grade-nine-page">
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="soft-pill">
            Диагностика по программе 8 класса
          </div>

          <h1>
            Что повторить
            <br />
            перед <em>9 классом?</em>
          </h1>

          <p className="hero-lead">
            Пройди диагностику и узнай, какие темы
            алгебры и геометрии 8 класса стоит
            повторить перед началом нового учебного
            этапа.
          </p>

          <div className="diagnostic-facts">
            <span>
              <b>28</b> заданий
            </span>
            <span>Алгебра и геометрия</span>
            <span>Без оценки и таймера</span>
            <span>Персональные рекомендации</span>
          </div>

          <div className="name-start-card">
            <label htmlFor="student-name">
              Как тебя зовут?
            </label>

            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Введи имя"
              autoComplete="given-name"
            />

            <div className="start-guidance">
              <h2>Перед началом</h2>

              <ul>
                <li>
                  Приготовь лист бумаги для вычислений.
                </li>
                <li>
                  Сначала попробуй решить задание
                  самостоятельно.
                </li>
                <li>
                  Строгого ограничения времени нет.
                </li>
                <li>
                  Если способ решения совсем незнаком,
                  нажми «Не знаю, как решить».
                </li>
              </ul>

              <label className="consent-check">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) =>
                    setAccepted(event.target.checked)
                  }
                />

                <span>
                  Я прочитал(а) рекомендации и готов(а)
                  начать
                </span>
              </label>
            </div>

            <button
              className="button primary big"
              onClick={start}
              disabled={!name.trim() || !accepted}
            >
              Начать диагностику <span>→</span>
            </button>

            <p className="name-start-meta">
              <b>28 заданий</b>
              <span>·</span> около 35–40 минут{" "}
              <span>·</span> результат сразу
            </p>
          </div>

          <div className="calm-note">
            <span>♡</span>
            <p>
              Это не пробный ОГЭ и не школьная оценка.
              Диагностика показывает, что стоит
              повторить перед 9 классом.
            </p>
          </div>

          <p className="privacy-note">
            Без регистрации. Имя и ответы остаются
            только в браузере на этом устройстве.
          </p>
        </div>

        <Doodle />
      </section>

      <section className="how">
        <div className="section-heading home-heading">
          <div>
            <p className="kicker">Важно</p>
            <h2>Это не пробный экзамен</h2>
          </div>

          <p>
            Проверяем программу 8 класса, а не
            готовность к ОГЭ
          </p>
        </div>

        <div className="steps">
          <article className="step-card violet">
            <span>01</span>
            <h3>Решаешь по одному</h3>
            <p>
              18 заданий по алгебре и 10 по геометрии
              — в спокойном темпе.
            </p>
          </article>

          <article className="step-card blue">
            <span>02</span>
            <h3>Можно честно не знать</h3>
            <p>
              Если способ решения незнаком, отмечаешь
              это без случайных догадок.
            </p>
          </article>

          <article className="step-card pink">
            <span>03</span>
            <h3>Получаешь маршрут</h3>
            <p>
              Видишь сильные темы, ошибки и то,
              что стоит разобрать подробнее.
            </p>
          </article>
        </div>
      </section>

      <section className="class-section">
        <div className="section-heading">
          <div>
            <p className="kicker">
              Другие диагностики
            </p>
            <h2>Выбери свой класс</h2>
          </div>
        </div>

        <div className="class-grid compact-class-grid">
          <a className="class-card active" href="/">
            <span>Доступно</span>
            <b>Перед 6 классом</b>
            <i>Программа 5 класса →</i>
          </a>

          <a className="class-card active" href="/7">
            <span>Доступно</span>
            <b>Перед 7 классом</b>
            <i>Программа 6 класса →</i>
          </a>

          <a className="class-card active" href="/8">
            <span>Доступно</span>
            <b>Перед 8 классом</b>
            <i>Программа 7 класса →</i>
          </a>

          <button
            className="class-card active"
            onClick={start}
          >
            <span>Ты здесь</span>
            <b>Перед 9 классом</b>
            <i>Программа 8 класса →</i>
          </button>

          <a
            className="class-card active"
            href="/oge"
          >
            <span>Отдельная диагностика</span>
            <b>Подготовка к ОГЭ</b>
            <i>Определить стартовый уровень →</i>
          </a>
        </div>
      </section>

      <footer>
        <div className="brand">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </div>

        <p>Проверяем знания, а не ставим оценки ♡</p>
      </footer>
    </main>
  );
}
