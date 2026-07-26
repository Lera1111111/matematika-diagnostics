"use client";

import { useEffect, useMemo, useState } from "react";
import GeometryDiagram, { type DiagramKind } from "../components/GeometryDiagram";

type Answer = string;
type StoredAnswer = { value: Answer; dontKnow: boolean };
type Question = {
  id: number;
  eyebrow: string;
  prompt: string;
  expression?: string;
  diagram?: DiagramKind;
  suffix?: string;
  part?: "geometry";
  type: "text" | "choice" | "system";
  options?: string[];
  topic: string;
  block: string;
  correctLabel: string;
  solution: string;
  check: (answer: string) => boolean;
};

const TELEGRAM_USERNAME = "vxoab";
const STORAGE_KEY = "math-diagnostic-8-v2";

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");

function asNumber(value: string) {
  const cleaned = normalize(value)
    .replace(/^[a-zа-яё]+=/i, "")
    .replace(/[^0-9.+-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

const equalsNumber = (target: number) => (answer: string) => asNumber(answer) === target;

const questions: Question[] = [
  {
    id: 1, eyebrow: "Действия с рациональными числами", prompt: "Вычисли:",
    expression: "−3,6 + 2,4 · (−5) − (−7,2) : 3", type: "text",
    topic: "Действия с рациональными числами", block: "Вычисления и буквенные выражения",
    correctLabel: "−13,2",
    solution: "Сначала умножение и деление: 2,4 · (−5) = −12, (−7,2) : 3 = −2,4. Получаем −3,6 − 12 − (−2,4) = −13,2.",
    check: equalsNumber(-13.2),
  },
  {
    id: 2, eyebrow: "Значение буквенного выражения", prompt: "Найди значение выражения, если a = −2, b = 5:",
    expression: "2a² − 3b", type: "text",
    topic: "Подстановка значений в буквенное выражение", block: "Вычисления и буквенные выражения",
    correctLabel: "−7", solution: "2 · (−2)² − 3 · 5 = 2 · 4 − 15 = −7.",
    check: equalsNumber(-7),
  },
  {
    id: 3, eyebrow: "Стандартный вид одночлена", prompt: "Приведи одночлен к стандартному виду:",
    expression: "−3a²b · 4ab³", type: "choice",
    options: ["−12a²b³", "−12a³b⁴", "12a³b⁴", "−7a³b⁴"],
    topic: "Умножение одночленов", block: "Одночлены и многочлены",
    correctLabel: "−12a³b⁴", solution: "−3 · 4 = −12, a² · a = a³, b · b³ = b⁴.",
    check: (answer) => normalize(answer) === normalize("−12a³b⁴"),
  },
  {
    id: 5, eyebrow: "Вычитание многочленов", prompt: "Упрости выражение:",
    expression: "(4x² − 3x + 7) − (x² + 5x − 2)", type: "choice",
    options: ["3x² + 2x + 5", "3x² − 8x + 9", "5x² + 2x + 5", "3x² − 8x + 5"],
    topic: "Сложение и вычитание многочленов", block: "Одночлены и многочлены",
    correctLabel: "3x² − 8x + 9", solution: "Меняем знаки во вторых скобках и приводим подобные: 4x² − 3x + 7 − x² − 5x + 2 = 3x² − 8x + 9.",
    check: (answer) => normalize(answer) === normalize("3x² − 8x + 9"),
  },
  {
    id: 6, eyebrow: "Одночлен и многочлен", prompt: "Раскрой скобки:",
    expression: "−3x(2x² − 5x + 4)", type: "choice",
    options: ["−6x³ + 15x² − 12x", "−6x³ − 15x² − 12x", "−6x² + 15x − 12", "6x³ − 15x² + 12x"],
    topic: "Умножение одночлена на многочлен", block: "Одночлены и многочлены",
    correctLabel: "−6x³ + 15x² − 12x", solution: "Умножаем −3x на каждый член: −6x³ + 15x² − 12x.",
    check: (answer) => normalize(answer) === normalize("−6x³ + 15x² − 12x"),
  },
  {
    id: 7, eyebrow: "Умножение многочленов", prompt: "Выполни умножение:",
    expression: "(x + 4)(2x − 3)", type: "choice",
    options: ["2x² + 5x − 12", "2x² + 11x − 12", "2x² − 5x − 12", "2x² + 5x + 12"],
    topic: "Умножение многочленов", block: "Одночлены и многочлены",
    correctLabel: "2x² + 5x − 12", solution: "2x² − 3x + 8x − 12 = 2x² + 5x − 12.",
    check: (answer) => normalize(answer) === normalize("2x² + 5x − 12"),
  },
  {
    id: 8, eyebrow: "Квадрат суммы", prompt: "Раскрой скобки:",
    expression: "(2x + 3)²", type: "choice",
    options: ["4x² + 9", "4x² + 6x + 9", "4x² + 12x + 9", "2x² + 12x + 9"],
    topic: "Квадрат суммы", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "4x² + 12x + 9", solution: "По формуле (a + b)² = a² + 2ab + b²: 4x² + 12x + 9.",
    check: (answer) => normalize(answer) === normalize("4x² + 12x + 9"),
  },
  {
    id: 9, eyebrow: "Квадрат разности", prompt: "Раскрой скобки:",
    expression: "(3a − 2b)²", type: "choice",
    options: ["9a² − 4b²", "9a² − 12ab + 4b²", "9a² + 12ab + 4b²", "6a² − 12ab + 4b²"],
    topic: "Квадрат разности", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "9a² − 12ab + 4b²", solution: "По формуле (a − b)² = a² − 2ab + b²: 9a² − 12ab + 4b².",
    check: (answer) => normalize(answer) === normalize("9a² − 12ab + 4b²"),
  },
  {
    id: 10, eyebrow: "Разность квадратов", prompt: "Разложи на множители:",
    expression: "25x² − 16", type: "choice",
    options: ["(5x − 4)²", "(25x − 16)(25x + 16)", "(5x − 4)(5x + 4)", "(5x − 8)(5x + 2)"],
    topic: "Разность квадратов", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "(5x − 4)(5x + 4)", solution: "25x² − 16 = (5x)² − 4² = (5x − 4)(5x + 4).",
    check: (answer) => normalize(answer) === normalize("(5x − 4)(5x + 4)"),
  },
  {
    id: 11, eyebrow: "Общий множитель", prompt: "Вынеси за скобки наибольший общий множитель:",
    expression: "12x³ − 18x²", type: "choice",
    options: ["6x(2x² − 3x)", "6x²(2x − 3)", "3x²(4x − 6)", "6x²(2x + 3)"],
    topic: "Вынесение общего множителя за скобки", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "6x²(2x − 3)", solution: "Общий множитель — 6x². После вынесения остаётся 2x − 3.",
    check: (answer) => normalize(answer) === normalize("6x²(2x − 3)"),
  },
  {
    id: 12, eyebrow: "Способ группировки", prompt: "Разложи на множители:",
    expression: "ax + ay + bx + by", type: "choice",
    options: ["(a + b)(x + y)", "(a − b)(x − y)", "(a + x)(b + y)", "ab(x + y)"],
    topic: "Разложение на множители способом группировки", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "(a + b)(x + y)", solution: "Группируем: a(x + y) + b(x + y) = (a + b)(x + y).",
    check: (answer) => normalize(answer) === normalize("(a + b)(x + y)"),
  },
  {
    id: 13, eyebrow: "Свойства степеней", prompt: "Упрости выражение:",
    expression: "a⁷ : a³ · a²", type: "choice",
    options: ["a²", "a⁶", "a⁸", "a¹²"],
    topic: "Умножение и деление степеней", block: "Свойства степеней",
    correctLabel: "a⁶", solution: "a⁷ : a³ · a² = a⁷⁻³⁺² = a⁶.",
    check: (answer) => normalize(answer) === normalize("a⁶"),
  },
  {
    id: 14, eyebrow: "Линейное уравнение", prompt: "Реши уравнение:",
    expression: "5(2x − 3) − 4 = 3x + 16", type: "text",
    topic: "Линейное уравнение со скобками", block: "Линейные уравнения и текстовые задачи",
    correctLabel: "x = 5", solution: "10x − 15 − 4 = 3x + 16. Тогда 7x = 35, поэтому x = 5.",
    check: equalsNumber(5),
  },
  {
    id: 15, eyebrow: "Уравнение с дробями", prompt: "Реши уравнение:",
    expression: "x/3 − x/4 = 2", type: "text",
    topic: "Линейное уравнение с дробными коэффициентами", block: "Линейные уравнения и текстовые задачи",
    correctLabel: "x = 24", solution: "Умножаем обе части на 12: 4x − 3x = 24, откуда x = 24.",
    check: equalsNumber(24),
  },
  {
    id: 16, eyebrow: "Текстовая задача", prompt: "Одно число на 7 больше другого. Их сумма равна 35. Найди меньшее число.",
    type: "text", topic: "Решение текстовых задач с помощью уравнения", block: "Линейные уравнения и текстовые задачи",
    correctLabel: "14", solution: "Пусть меньшее число x, тогда большее x + 7. x + x + 7 = 35, 2x = 28, x = 14.",
    check: equalsNumber(14),
  },
  {
    id: 17, eyebrow: "Система линейных уравнений", prompt: "Реши систему:",
    expression: "x + y = 11,\nx − y = 3", type: "system",
    topic: "Системы линейных уравнений", block: "Системы линейных уравнений",
    correctLabel: "x = 7, y = 4", solution: "Складываем уравнения: 2x = 14, x = 7. Тогда y = 11 − 7 = 4.",
    check: (answer) => {
      const [x, y] = answer.split("|");
      return asNumber(x || "") === 7 && asNumber(y || "") === 4;
    },
  },
  {
    id: 19, eyebrow: "Значение функции", prompt: "Дана функция y = −3x + 2. Найди значение y, если x = −2.",
    type: "text", topic: "Вычисление значения функции по формуле", block: "Функции и графики",
    correctLabel: "8", solution: "y = −3 · (−2) + 2 = 6 + 2 = 8.",
    check: equalsNumber(8),
  },
  {
    id: 20, eyebrow: "Точка на графике", prompt: "Дана функция y = 2x − 5. Какая точка принадлежит её графику?",
    type: "choice", options: ["A(1; −3)", "B(2; 0)", "C(3; 2)", "D(4; 4)"],
    topic: "Принадлежность точки графику линейной функции", block: "Функции и графики",
    correctLabel: "A(1; −3)", solution: "Для x = 1 получаем y = 2 · 1 − 5 = −3, значит подходит точка A(1; −3).",
    check: (answer) => normalize(answer) === normalize("A(1; −3)"),
  },
  {
    id: 101, eyebrow: "Смежные углы", prompt: "Один из смежных углов равен 124°. Найди второй угол.",
    diagram: "adjacent-angles", suffix: "°", type: "text", part: "geometry",
    topic: "Смежные углы", block: "Углы",
    correctLabel: "56°", solution: "Сумма смежных углов равна 180°. Поэтому второй угол равен 180° − 124° = 56°.",
    check: equalsNumber(56),
  },
  {
    id: 102, eyebrow: "Вертикальные углы", prompt: "Две прямые пересекаются. Один угол равен 67°. Найди отмеченный вертикальный ему угол.",
    diagram: "vertical-angles", suffix: "°", type: "text", part: "geometry",
    topic: "Вертикальные углы", block: "Углы",
    correctLabel: "67°", solution: "Вертикальные углы равны, поэтому отмеченный угол тоже равен 67°.",
    check: equalsNumber(67),
  },
  {
    id: 103, eyebrow: "Равнобедренный треугольник", prompt: "В равнобедренном треугольнике угол при вершине равен 46°. Найди угол при основании.",
    diagram: "isosceles-angle", suffix: "°", type: "text", part: "geometry",
    topic: "Равнобедренный треугольник и сумма углов", block: "Треугольники",
    correctLabel: "67°", solution: "Углы при основании равны. Их сумма равна 180° − 46° = 134°, поэтому каждый равен 134° : 2 = 67°.",
    check: equalsNumber(67),
  },
  {
    id: 104, eyebrow: "Элементы треугольника", prompt: "На стороне BC треугольника ABC расположена точка M. Отрезки BM и MC равны. Чем является отрезок AM?",
    diagram: "median", type: "choice", part: "geometry",
    options: ["Медианой", "Биссектрисой", "Высотой", "Серединным перпендикуляром"],
    topic: "Медианы, биссектрисы и высоты треугольника", block: "Треугольники",
    correctLabel: "Медианой", solution: "Точка M — середина стороны BC. Отрезок из вершины A к середине противоположной стороны называется медианой.",
    check: (answer) => normalize(answer) === normalize("Медианой"),
  },
  {
    id: 105, eyebrow: "Признак равенства треугольников", prompt: "По какому признаку можно доказать равенство этих треугольников?",
    diagram: "congruence", type: "choice", part: "geometry",
    options: ["По двум сторонам и углу между ними", "По стороне и двум прилежащим к ней углам", "По трём сторонам", "Данных недостаточно"],
    topic: "Признаки равенства треугольников", block: "Треугольники",
    correctLabel: "По двум сторонам и углу между ними", solution: "На рисунке отмечены две пары равных сторон и равные углы между ними — это первый признак равенства треугольников.",
    check: (answer) => normalize(answer) === normalize("По двум сторонам и углу между ними"),
  },
  {
    id: 106, eyebrow: "Параллельные прямые и секущая", prompt: "Две параллельные прямые пересечены секущей. Один внутренний односторонний угол равен 72°. Найди отмеченный угол.",
    diagram: "parallel-transversal", suffix: "°", type: "text", part: "geometry",
    topic: "Углы при параллельных прямых и секущей", block: "Параллельные прямые",
    correctLabel: "108°", solution: "Сумма внутренних односторонних углов равна 180°. Значит, отмеченный угол равен 180° − 72° = 108°.",
    check: equalsNumber(108),
  },
  {
    id: 107, eyebrow: "Неравенство треугольника", prompt: "Из каких трёх отрезков можно составить треугольник?",
    type: "choice", part: "geometry",
    options: ["2 см, 3 см и 6 см", "4 см, 5 см и 8 см", "3 см, 7 см и 10 см", "1 см, 4 см и 7 см"],
    topic: "Неравенство треугольника", block: "Треугольники",
    correctLabel: "4 см, 5 см и 8 см", solution: "Сумма любых двух сторон треугольника должна быть больше третьей. Только для 4, 5 и 8 выполняется 4 + 5 > 8.",
    check: (answer) => normalize(answer) === normalize("4 см, 5 см и 8 см"),
  },
  {
    id: 108, eyebrow: "Прямоугольный треугольник", prompt: "В прямоугольном треугольнике один острый угол равен 34°. Найди второй острый угол.",
    diagram: "right-triangle", suffix: "°", type: "text", part: "geometry",
    topic: "Прямоугольный треугольник", block: "Треугольники",
    correctLabel: "56°", solution: "Сумма двух острых углов прямоугольного треугольника равна 90°. Поэтому второй угол равен 90° − 34° = 56°.",
    check: equalsNumber(56),
  },
];

const recommendations: Record<string, string> = {
  "Вычисления и буквенные выражения":
    "Повтори действия с положительными и отрицательными числами, порядок действий и подстановку значений в выражения. Эти навыки понадобятся при работе с рациональными дробями, корнями и уравнениями.",
  "Одночлены и многочлены":
    "Повтори стандартный вид одночлена, раскрытие скобок и действия с многочленами. На этой базе в 8 классе строятся преобразования рациональных выражений.",
  "Формулы сокращённого умножения и разложение на множители":
    "Повтори квадрат суммы, квадрат разности, разность квадратов и способы разложения на множители. Они понадобятся при сокращении рациональных дробей и преобразовании выражений.",
  "Свойства степеней":
    "Повтори свойства степеней с натуральным показателем. В 8 классе появятся степени с целыми и отрицательными показателями.",
  "Линейные уравнения и текстовые задачи":
    "Повтори линейные уравнения со скобками и дробями. В 8 классе начнётся изучение квадратных и дробно-рациональных уравнений.",
  "Системы линейных уравнений":
    "Повтори способы решения систем линейных уравнений и составление системы по условию задачи. Эти навыки понадобятся при работе с более сложными системами.",
  "Функции и графики":
    "Повтори вычисление значений функции и проверку принадлежности точки графику. В 8 классе появятся новые функции и их свойства.",
  Углы:
    "Повтори свойства смежных и вертикальных углов. Эти знания постоянно используются в задачах на треугольники и параллельные прямые.",
  Треугольники:
    "Повтори сумму углов, свойства равнобедренного и прямоугольного треугольников, элементы треугольника и признаки равенства.",
  "Параллельные прямые":
    "Повтори свойства накрест лежащих, соответственных и внутренних односторонних углов.",
};

function resultCopy(score: number) {
  if (score <= 9) return {
    title: "Давай восстановим базу вместе",
    text: "Перед 8 классом особенно важно восстановить основные преобразования выражений, уравнения и геометрию 7 класса: углы, треугольники и параллельные прямые.",
    extra: "Не нужно пытаться самостоятельно повторить весь учебник. Можно спокойно восстановить основные темы и начать учебный год увереннее.",
    cta: "Повторить вместе",
    card: "Вместе восстановим основные темы алгебры и геометрии 7 класса и подготовимся к новой программе.",
  };
  if (score <= 17) return {
    title: "База есть, но остались пробелы",
    text: "Основная база есть, но некоторые алгебраические и геометрические темы стоит повторить. Посмотри рекомендации ниже — они покажут, на чём сосредоточиться.",
    extra: "Посмотри рекомендации ниже — повторять всё подряд не понадобится.",
    cta: "Подтянуть сложные темы",
    card: "Разберём только те алгебраические и геометрические темы, в которых остались пробелы.",
  };
  if (score <= 22) return {
    title: "Ты хорошо готов к 8 классу",
    text: "Ты хорошо готов к 8 классу. Осталось освежить отдельные правила по алгебре и геометрии, и можно двигаться дальше.",
    extra: "Можно быстро закрыть оставшиеся пробелы и заранее познакомиться с темами 8 класса.",
    cta: "Подготовиться к 8 классу",
    card: "Быстро повторим сложные моменты и заранее познакомимся с программой 8 класса.",
  };
  return {
    title: "Отличный результат!",
    text: "У тебя крепкая база по алгебре и геометрии 7 класса. Можно переходить к рациональным дробям, квадратным корням, четырёхугольникам и площадям.",
    extra: "Ты готов двигаться дальше.",
    cta: "Начать темы 8 класса",
    card: "Можно двигаться дальше и заранее изучать рациональные дроби, квадратные корни, четырёхугольники и площади.",
  };
}

function MathDoodle() {
  return (
    <div className="doodle grade-seven-doodle grade-eight-doodle" aria-hidden="true">
      <span className="doodle-plus">x²</span>
      <span className="doodle-pi">(a+b)²</span>
      <span className="doodle-frac"><b>x</b><i /><b>3</b></span>
      <div className="doodle-paper">
        <div /><div /><div /><span>ƒ</span>
      </div>
      <span className="doodle-dot dot-one" />
      <span className="doodle-dot dot-two" />
    </div>
  );
}

export default function GradeEight() {
  const [screen, setScreen] = useState<"home" | "test" | "geometry" | "review" | "result">("home");
  const [studentName, setStudentName] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StoredAnswer>>({});
  const [notice, setNotice] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setCurrent(Math.min(parsed.current || 0, questions.length - 1));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && screen !== "result") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, current }));
    }
  }, [answers, current, hydrated, screen]);

  const getStatus = (question: Question) => {
    const answer = answers[question.id];
    if (answer?.dontKnow) return "dont_know";
    if (!answer?.value.trim()) return "unanswered";
    return question.check(answer.value) ? "correct" : "incorrect";
  };

  const score = useMemo(
    () => questions.filter((question) => getStatus(question) === "correct").length,
    [answers],
  );
  const incorrectCount = questions.filter((q) => getStatus(q) === "incorrect").length;
  const dontKnowCount = questions.filter((q) => getStatus(q) === "dont_know").length;
  const answeredCount = questions.filter((q) => getStatus(q) !== "unanswered").length;

  const goNext = () => {
    setNotice(false);
    if (current === 17) setScreen("geometry");
    else if (current === questions.length - 1) setScreen("review");
    else setCurrent((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
const start = () => {
  if (!studentName.trim()) return;

  setScreen("test");
  window.scrollTo({ top: 0, behavior: "smooth" });
};
  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setCurrent(0);
    setScreen("home");
    setNotice(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (screen === "test") {
    const question = questions[current];
    const stored = answers[question.id] || { value: "", dontKnow: false };
    const hasResponse = question.type === "system"
      ? stored.value.split("|").every((value) => value.trim())
      : Boolean(stored.value.trim());
    return (
      <main className="test-shell">
        <header className="compact-header">
          <a className="brand brand-button" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a>
          <button className="text-button" onClick={restart}>Начать сначала</button>
        </header>
        <section className="test-wrap">
          <div className="progress-line">
            <div><span>Задание {current + 1} из {questions.length}</span><small>{answeredCount} ответов сохранено</small></div>
            <strong>{Math.round(((current + 1) / questions.length) * 100)}%</strong>
          </div>
          <div className="progress-track" aria-label={`Прогресс: задание ${current + 1} из ${questions.length}`}>
            <span style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
          <article className="question-card grade-seven-question grade-eight-question">
            <p className="question-eyebrow">{question.eyebrow}</p>
            <h1>{question.prompt}</h1>
            {question.expression && <div className="expression">{question.expression}</div>}
            {question.diagram && <GeometryDiagram kind={question.diagram} />}
            {question.type === "text" && (
              <label className="answer-field">
                <span>Твой ответ</span>
                <span className="answer-with-suffix">
                  <input
                    autoFocus
                    value={stored.dontKnow ? "" : stored.value}
                    onChange={(event) =>
                      setAnswers((previous) => ({
                        ...previous,
                        [question.id]: { value: event.target.value, dontKnow: false },
                      }))
                    }
                    placeholder="Введи ответ"
                  />
                  {question.suffix && <b>{question.suffix}</b>}
                </span>
              </label>
            )}
            {question.type === "system" && (
              <div className="system-fields">
                {(["x", "y"] as const).map((variable, index) => {
                  const values = stored.dontKnow ? ["", ""] : stored.value.split("|");
                  return (
                    <label className="answer-field" key={variable}>
                      <span>{variable} =</span>
                      <input
                        autoFocus={index === 0}
                        value={values[index] || ""}
                        onChange={(event) => {
                          const next = [...values];
                          next[index] = event.target.value;
                          setAnswers((previous) => ({
                            ...previous,
                            [question.id]: { value: `${next[0] || ""}|${next[1] || ""}`, dontKnow: false },
                          }));
                        }}
                        placeholder={`Значение ${variable}`}
                      />
                    </label>
                  );
                })}
              </div>
            )}
            {question.type === "choice" && (
              <div className="options">
                {question.options?.map((option) => (
                  <button
                    className={`option ${!stored.dontKnow && stored.value === option ? "selected" : ""}`}
                    key={option}
                    onClick={() =>
                      setAnswers((previous) => ({
                        ...previous,
                        [question.id]: { value: option, dontKnow: false },
                      }))
                    }
                  >
                    <span className="radio-dot" />{option}
                  </button>
                ))}
              </div>
            )}
            <p className="dont-know-hint">Не получается? Не угадывай — нажми «Не знаю, как решить». Это поможет точнее определить, что стоит повторить.</p>
            {notice && (
              <div className="kind-notice">
                <span>♡</span>
                <p>Ничего страшного — для этого ты и проходишь диагностику. Отметим эту тему в рекомендациях и пойдём дальше.</p>
              </div>
            )}
            <div className="test-actions grade-seven-actions">
              <button className="button secondary" disabled={current === 0 || notice} onClick={() => setCurrent((value) => value - 1)}>← Назад</button>
              <button
  className="button dont-know-button"
  onClick={() => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: { value: "", dontKnow: true },
    }));
    setNotice(true);
  }}
>
  Не знаю, как решить
</button>
              <button
  className="button primary"
  disabled={!hasResponse && !stored.dontKnow}
  onClick={goNext}
>
  {stored.dontKnow ? "Продолжить →" : "Ответить и продолжить →"}
</button>
            </div>
          </article>
          <p className="save-note">Ответы сохраняются на этом устройстве автоматически</p>
        </section>
      </main>
    );
  }

  if (screen === "geometry") {
    return (
      <main className="center-screen">
        <section className="review-card bridge-card">
          <div className="review-icon">△</div>
          <p className="kicker">Первая часть завершена</p>
          <h1>С алгеброй закончили!</h1>
          <p>Теперь проверим основные темы геометрии 7 класса.</p>
          <button className="button primary" onClick={() => { setCurrent(18); setScreen("test"); window.scrollTo({ top: 0 }); }}>
            Перейти к геометрии →
          </button>
        </section>
      </main>
    );
  }

  if (screen === "review") {
    return (
      <main className="center-screen">
        <section className="review-card">
          <div className="review-icon">✓</div>
          <p className="kicker">Финишная прямая</p>
          <h1>Все задания пройдены. Узнаем результат?</h1>
          <p>Ты ответил на все 26 заданий. Результат покажет сильные темы и то, что стоит повторить по алгебре и геометрии.</p>
          <div className="review-actions">
            <button className="button secondary" onClick={() => { setCurrent(25); setScreen("test"); }}>Вернуться к тесту</button>
            <button className="button primary" onClick={() => { setScreen("result"); localStorage.removeItem(STORAGE_KEY); window.scrollTo({ top: 0 }); }}>Узнать результат</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const copy = resultCopy(score);
    const telegramMessage = encodeURIComponent(
  `Здравствуйте! Меня зовут ${studentName.trim()}. ` +
    `Результат моей диагностики перед 8 классом — ${score} из ${questions.length}. ` +
    `Хочу узнать, какие темы лучше повторить.`,
);

const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${telegramMessage}`;
    const blocks = [...new Set(questions.map((question) => question.block))];
    const strong = questions.filter((q) => getStatus(q) === "correct").map((q) => q.topic);
    const repeat = questions.filter((q) => getStatus(q) === "incorrect").map((q) => q.topic);
    const restore = questions.filter((q) => getStatus(q) === "dont_know").map((q) => q.topic);
    const algebraScore = questions.filter((q) => !q.part && getStatus(q) === "correct").length;
    const geometryScore = questions.filter((q) => q.part === "geometry" && getStatus(q) === "correct").length;
    return (
      <main className="result-page">
        <header className="compact-header result-header">
          <a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a>
          <button className="text-button" onClick={restart}>Пройти ещё раз</button>
        </header>
        <section className="result-hero">
          <div className="score-orbit"><strong>{score}</strong><span>из 26</span></div>
          <div>
            <p className="kicker">Диагностика завершена</p>
           <h1>
  {studentName.trim()}, {copy.title.toLowerCase()}
</h1>
            <p>{copy.text}</p><small>{copy.extra}</small>
          </div>
        </section>
        <section className="result-section result-stats">
          <article><strong>{score}/26</strong><span>общий результат</span></article>
          <article><strong>{algebraScore}/18</strong><span>алгебра</span></article>
          <article><strong>{geometryScore}/8</strong><span>геометрия</span></article>
          <article><strong>{incorrectCount}</strong><span>с ошибкой</span></article>
          <article><strong>{dontKnowCount}</strong><span>«не знаю»</span></article>
        </section>
        <section className="result-section">
          <div className="section-heading">
            <div><p className="kicker">Персональный разбор</p><h2>Как обстоят дела по темам</h2></div>
            <span>Рекомендации составлены по твоим ответам</span>
          </div>
          <div className="block-results">
            {blocks.map((block) => {
              const blockQuestions = questions.filter((q) => q.block === block);
              const correct = blockQuestions.filter((q) => getStatus(q) === "correct").length;
              const unknown = blockQuestions.filter((q) => getStatus(q) === "dont_know").length;
              const wrong = blockQuestions.filter((q) => getStatus(q) === "incorrect").length;
              const ratio = correct / blockQuestions.length;
              const singleStatus = getStatus(blockQuestions[0]);
              const status = blockQuestions.length === 1
                ? singleStatus === "correct" ? "Получается" : singleStatus === "dont_know" ? "Важно разобрать" : "Стоит повторить"
                : ratio >= 0.8 ? "Получается отлично" : ratio >= 0.4 ? "Стоит немного повторить" : "Важно восстановить";
              let detail = "Здесь всё уверенно — можно двигаться дальше.";
              if (unknown && wrong) detail = "Часть заданий получилась, но некоторые правила стоит повторить, а отдельные моменты — разобрать подробнее.";
              else if (unknown) detail = "Эту тему стоит разобрать с самого начала: пока сложно определить способ решения.";
              else if (wrong) detail = "В этой теме есть ошибки. Возможно, стоит освежить правило и немного потренироваться.";
              let recommendation = recommendations[block];
              if (block === "Одночлены и многочлены" && unknown >= 2) {
                recommendation = "Стоит заново разобрать, чем одночлен отличается от многочлена и как выполнять действия с ними. Эти темы будут использоваться почти в каждой главе 8 класса.";
              }
              if (block === "Формулы сокращённого умножения и разложение на множители" && unknown > 0) {
                recommendation = "Начни с распознавания формул и вынесения общего множителя. Без этого будет сложно сокращать алгебраические дроби в начале 8 класса.";
              }
              if (block === "Углы") {
                detail = unknown
                  ? "Стоит заново разобрать расположение смежных и вертикальных углов и их основные свойства."
                  : wrong
                    ? recommendations[block]
                    : "Ты уверенно работаешь со смежными и вертикальными углами.";
              }
              if (block === "Треугольники") {
                detail = unknown
                  ? "Стоит заново разобрать основные свойства треугольников. Они понадобятся при изучении четырёхугольников, площадей и подобных треугольников в 8 классе."
                  : wrong
                    ? recommendations[block]
                    : "Ты хорошо помнишь основные свойства и элементы треугольников.";
              }
              if (block === "Параллельные прямые") {
                detail = unknown
                  ? "Стоит заново разобрать виды углов при параллельных прямых и секущей."
                  : wrong
                    ? recommendations[block]
                    : "Ты уверенно находишь углы при параллельных прямых и секущей.";
              }
              return (
                <article className={`block-card ${ratio >= 0.8 ? "great" : ratio >= 0.4 ? "medium" : "restore"}`} key={block}>
                  <div className="block-topline"><span>{correct}/{blockQuestions.length}</span><b>{status}</b></div>
                  <h3>{block}</h3>
                  <p>{detail}</p>
                  {ratio < 0.8 && !["Углы", "Треугольники", "Параллельные прямые"].includes(block) && <p className="block-recommendation">{recommendation}</p>}
                </article>
              );
            })}
          </div>
        </section>
        <section className="result-section three-topic-panels">
          <article className="topic-panel strong-panel"><p className="kicker">Сильные темы</p><h2>Получается</h2><div className="topic-tags">{strong.map((topic) => <span key={topic}>✓ {topic}</span>)}{!strong.length && <p>Начнём с восстановления главного — без спешки.</p>}</div></article>
          <article className="topic-panel repeat-panel"><p className="kicker">Освежить</p><h2>Повторить</h2><div className="topic-tags">{repeat.map((topic) => <span key={topic}>{topic}</span>)}{!repeat.length && <p>Обычных ошибок нет.</p>}</div></article>
          <article className="topic-panel restore-panel"><p className="kicker">Разобрать</p><h2>Подробнее</h2><div className="topic-tags">{restore.map((topic) => <span key={topic}>{topic}</span>)}{!restore.length && <p>Нет тем, где способ решения совсем незнаком.</p>}</div></article>
        </section>
        <details className="mistakes result-section task-review">
          <summary>Посмотреть разбор заданий <span>({questions.length})</span></summary>
          <div>
            {questions.map((question, index) => {
              const status = getStatus(question);
              const answer = answers[question.id];
              return (
                <article className={`review-task ${status}`} key={question.id}>
                  <span>Задание {index + 1} · {status === "correct" ? "Верно" : status === "incorrect" ? "Здесь есть ошибка" : "Эту тему стоит разобрать"}</span>
                  <h3>{question.eyebrow}</h3>
                  <p>{question.prompt} {question.expression}</p>
                  {question.diagram && <GeometryDiagram kind={question.diagram} />}
                  <p>Твой ответ: <b>{answer?.dontKnow ? "Не знаю, как решить" : question.type === "system" && answer?.value ? `x = ${answer.value.split("|")[0] || "—"}, y = ${answer.value.split("|")[1] || "—"}` : answer?.value || "—"}</b></p>
                  <p>Правильный ответ: <b>{question.correctLabel}</b></p>
                  <p className="solution">{question.solution}</p>
                </article>
              );
            })}
          </div>
        </details>
        <section className="final-cta">
          <div><p className="kicker">Следующий шаг</p><h2>Хочешь подготовиться к 8 классу без стресса?</h2><p>{copy.card}</p></div>
          <div className="cta-actions">
            <a className="button primary" href={telegramUrl} target="_blank" rel="noreferrer">Записаться на занятия</a>
            <button className="button secondary" onClick={restart}>Пройти тест ещё раз</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="home-page">
      <header className="site-header">
  <a className="brand" href="/">
    <span className="brand-mark">∿</span>
    <span>Математика без стресса</span>
  </a>
</header>
      <section className="hero">
        <div className="hero-copy">
          <div className="soft-pill">Диагностика после 7 класса</div>
          <h1>Что повторить<br />перед <em>8 классом?</em></h1>
          <p className="hero-lead">Пройди диагностику и узнай, какие темы 7 класса ты помнишь, а что стоит повторить перед началом нового учебного года.</p>
          <div className="calm-note"><span>♡</span><p>Это не контрольная и не экзамен. Здесь нет школьных оценок — только понятный результат и персональные рекомендации.</p></div>
          <div className="name-start-card">
  <label htmlFor="student-name">Как тебя зовут?</label>

  <div className="name-start-row">
    <input
      id="student-name"
      type="text"
      value={studentName}
      onChange={(event) => setStudentName(event.target.value)}
      placeholder="Введи имя"
      autoComplete="given-name"
      onKeyDown={(event) => {
        if (event.key === "Enter" && studentName.trim()) {
          start();
        }
      }}
    />

    <button
      className="button primary big"
      onClick={start}
      disabled={!studentName.trim()}
    >
      Начать диагностику <span>→</span>
    </button>
  </div>

  <p className="name-start-meta">
    <b>26 заданий</b>
    <span>·</span> около 30–35 минут <span>·</span> результат сразу
  </p>
</div>
          <p className="hero-dont-know">Решай самостоятельно, без калькулятора и подсказок. Если не знаешь, как выполнить задание, не угадывай — нажми «Не знаю, как решить».</p>
        </div>
        <MathDoodle />
      </section>
      <section className="how">
        <div className="section-heading home-heading">
          <div><p className="kicker">Всё просто</p><h2>Как это работает</h2></div>
          <p>Без регистрации, школьных оценок и лишнего волнения</p>
        </div>
        <div className="steps">
          <article className="step-card violet"><span>01</span><h3>Решаешь задания</h3><p>Проверяешь базовые навыки по алгебре и геометрии 7 класса.</p></article>
          <article className="step-card blue"><span>02</span><h3>Можно честно не знать</h3><p>Отмечаешь незнакомые способы решения — без случайных догадок.</p></article>
          <article className="step-card pink"><span>03</span><h3>Получаешь маршрут</h3><p>Видишь сильные темы и то, что стоит повторить подробнее.</p></article>
        </div>
        <div className="tip"><span>✦</span><p><b>Главное — честный результат.</b> Он нужен не для оценки, а чтобы не повторять весь учебник подряд.</p></div>
      </section>
      <section className="class-section">
        <div className="section-heading"><div><p className="kicker">Другие диагностики</p><h2>Выбери свой класс</h2></div></div>
        <div className="class-grid compact-class-grid">
          <a className="class-card active" href="/"><span>Доступно сейчас</span><b>Перехожу в 6 класс</b><i>Программа 5 класса →</i></a>
          <a className="class-card active" href="/7"><span>Доступно сейчас</span><b>Перехожу в 7 класс</b><i>Программа 6 класса →</i></a>
          <button className="class-card active" onClick={() => setScreen("test")}><span>Доступно сейчас</span><b>Перехожу в 8 класс</b><i>Программа 7 класса →</i></button>
          <a className="class-card active" href="/9"><span>Доступно сейчас</span><b>Перехожу в 9 класс</b><i>Программа 8 класса →</i></a>
        </div>
      </section>
      <footer><div className="brand"><span className="brand-mark">∿</span><span>Математика без стресса</span></div><p>Проверяем знания, а не ставим оценки ♡</p></footer>
    </main>
  );
}
