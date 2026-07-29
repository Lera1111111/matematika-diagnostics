"use client";

import { useEffect, useMemo, useState } from "react";
import GeometryDiagram, { type DiagramKind } from "../components/GeometryDiagram";

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
    expression: String.raw`-3{,}6+2{,}4\cdot(-5)-(-7{,}2):3`, type: "text",
    topic: "Действия с рациональными числами", block: "Вычисления и буквенные выражения",
    correctLabel: "−13,2",
    solution: "Сначала умножение и деление: 2,4 · (−5) = −12, (−7,2) : 3 = −2,4. Получаем −3,6 − 12 − (−2,4) = −13,2.",
    check: equalsNumber(-13.2),
  },
  {
    id: 2, eyebrow: "Значение буквенного выражения", prompt: "Найди значение выражения, если a = −2, b = 5:",
    expression: String.raw`2a^2-3b`, type: "text",
    topic: "Подстановка значений в буквенное выражение", block: "Вычисления и буквенные выражения",
    correctLabel: "−7", solution: "2 · (−2)² − 3 · 5 = 2 · 4 − 15 = −7.",
    check: equalsNumber(-7),
  },
  {
    id: 3, eyebrow: "Стандартный вид одночлена", prompt: "Приведи одночлен к стандартному виду:",
    expression: String.raw`-3a^2b\cdot4ab^3`, type: "choice",
    options: ["−12a²b³", "−12a³b⁴", "12a³b⁴", "−7a³b⁴"],
    topic: "Умножение одночленов", block: "Одночлены и многочлены",
    correctLabel: "−12a³b⁴", solution: "−3 · 4 = −12, a² · a = a³, b · b³ = b⁴.",
    check: (answer) => normalize(answer) === normalize("−12a³b⁴"),
  },
  {
    id: 5, eyebrow: "Вычитание многочленов", prompt: "Упрости выражение:",
    expression: String.raw`(4x^2-3x+7)-(x^2+5x-2)`, type: "choice",
    options: ["3x² + 2x + 5", "3x² − 8x + 9", "5x² + 2x + 5", "3x² − 8x + 5"],
    topic: "Сложение и вычитание многочленов", block: "Одночлены и многочлены",
    correctLabel: "3x² − 8x + 9", solution: "Меняем знаки во вторых скобках и приводим подобные: 4x² − 3x + 7 − x² − 5x + 2 = 3x² − 8x + 9.",
    check: (answer) => normalize(answer) === normalize("3x² − 8x + 9"),
  },
  {
    id: 6, eyebrow: "Одночлен и многочлен", prompt: "Раскрой скобки:",
    expression: String.raw`-3x(2x^2-5x+4)`, type: "choice",
    options: ["−6x³ + 15x² − 12x", "−6x³ − 15x² − 12x", "−6x² + 15x − 12", "6x³ − 15x² + 12x"],
    topic: "Умножение одночлена на многочлен", block: "Одночлены и многочлены",
    correctLabel: "−6x³ + 15x² − 12x", solution: "Умножаем −3x на каждый член: −6x³ + 15x² − 12x.",
    check: (answer) => normalize(answer) === normalize("−6x³ + 15x² − 12x"),
  },
  {
    id: 7, eyebrow: "Умножение многочленов", prompt: "Выполни умножение:",
    expression: String.raw`(x+4)(2x-3)`, type: "choice",
    options: ["2x² + 5x − 12", "2x² + 11x − 12", "2x² − 5x − 12", "2x² + 5x + 12"],
    topic: "Умножение многочленов", block: "Одночлены и многочлены",
    correctLabel: "2x² + 5x − 12", solution: "2x² − 3x + 8x − 12 = 2x² + 5x − 12.",
    check: (answer) => normalize(answer) === normalize("2x² + 5x − 12"),
  },
  {
    id: 8, eyebrow: "Квадрат суммы", prompt: "Раскрой скобки:",
    expression: String.raw`(2x+3)^2`, type: "choice",
    options: ["4x² + 9", "4x² + 6x + 9", "4x² + 12x + 9", "2x² + 12x + 9"],
    topic: "Квадрат суммы", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "4x² + 12x + 9", solution: "По формуле (a + b)² = a² + 2ab + b²: 4x² + 12x + 9.",
    check: (answer) => normalize(answer) === normalize("4x² + 12x + 9"),
  },
  {
    id: 9, eyebrow: "Квадрат разности", prompt: "Раскрой скобки:",
    expression: String.raw`(3a-2b)^2`, type: "choice",
    options: ["9a² − 4b²", "9a² − 12ab + 4b²", "9a² + 12ab + 4b²", "6a² − 12ab + 4b²"],
    topic: "Квадрат разности", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "9a² − 12ab + 4b²", solution: "По формуле (a − b)² = a² − 2ab + b²: 9a² − 12ab + 4b².",
    check: (answer) => normalize(answer) === normalize("9a² − 12ab + 4b²"),
  },
  {
    id: 10, eyebrow: "Разность квадратов", prompt: "Разложи на множители:",
    expression: String.raw`25x^2-16`, type: "choice",
    options: ["(5x − 4)²", "(25x − 16)(25x + 16)", "(5x − 4)(5x + 4)", "(5x − 8)(5x + 2)"],
    topic: "Разность квадратов", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "(5x − 4)(5x + 4)", solution: "25x² − 16 = (5x)² − 4² = (5x − 4)(5x + 4).",
    check: (answer) => normalize(answer) === normalize("(5x − 4)(5x + 4)"),
  },
  {
    id: 11, eyebrow: "Общий множитель", prompt: "Вынеси за скобки наибольший общий множитель:",
    expression: String.raw`12x^3-18x^2`, type: "choice",
    options: ["6x(2x² − 3x)", "6x²(2x − 3)", "3x²(4x − 6)", "6x²(2x + 3)"],
    topic: "Вынесение общего множителя за скобки", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "6x²(2x − 3)", solution: "Общий множитель — 6x². После вынесения остаётся 2x − 3.",
    check: (answer) => normalize(answer) === normalize("6x²(2x − 3)"),
  },
  {
    id: 12, eyebrow: "Способ группировки", prompt: "Разложи на множители:",
    expression: String.raw`ax+ay+bx+by`, type: "choice",
    options: ["(a + b)(x + y)", "(a − b)(x − y)", "(a + x)(b + y)", "ab(x + y)"],
    topic: "Разложение на множители способом группировки", block: "Формулы сокращённого умножения и разложение на множители",
    correctLabel: "(a + b)(x + y)", solution: "Группируем: a(x + y) + b(x + y) = (a + b)(x + y).",
    check: (answer) => normalize(answer) === normalize("(a + b)(x + y)"),
  },
  {
    id: 13, eyebrow: "Свойства степеней", prompt: "Упрости выражение:",
    expression: String.raw`a^7:a^3\cdot a^2`, type: "choice",
    options: ["a²", "a⁶", "a⁸", "a¹²"],
    topic: "Умножение и деление степеней", block: "Свойства степеней",
    correctLabel: "a⁶", solution: "a⁷ : a³ · a² = a⁷⁻³⁺² = a⁶.",
    check: (answer) => normalize(answer) === normalize("a⁶"),
  },
  {
    id: 14, eyebrow: "Линейное уравнение", prompt: "Реши уравнение:",
    expression: String.raw`5(2x-3)-4=3x+16`, type: "text",
    topic: "Линейное уравнение со скобками", block: "Линейные уравнения и текстовые задачи",
    correctLabel: "x = 5", solution: "10x − 15 − 4 = 3x + 16. Тогда 7x = 35, поэтому x = 5.",
    check: equalsNumber(5),
  },
  {
    id: 15, eyebrow: "Уравнение с дробями", prompt: "Реши уравнение:",
    expression: String.raw`\frac{x}{3}-\frac{x}{4}=2`, type: "text",
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
  id: 17,
  eyebrow: "Система линейных уравнений",
  prompt: "Реши систему:",
 expression: String.raw`\begin{cases}
x+y=11\\
x-y=3
\end{cases}`,
  type: "system",
  topic: "Системы линейных уравнений",
  block: "Системы линейных уравнений",
  correctLabel: "x = 7, y = 4",
  solution:
    "Складываем уравнения: 2x = 14, x = 7. Тогда y = 11 − 7 = 4.",
  check: (answer) => {
    const [x, y] = answer.split("|");

    return (
      asNumber(x || "") === 7 &&
      asNumber(y || "") === 4
    );
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
  if (score <= 9) {
    return {
      title: "Давай восстановим базу вместе",
      text:
        "Некоторые важные темы 7 класса пока вызывают трудности. Это нормально: их можно спокойно восстановить перед началом программы 8 класса.",
      extra:
        "Не нужно повторять весь учебник подряд. Лучше начать с основных пробелов и двигаться небольшими шагами.",
      cta: "Повторить вместе",
      card:
        "Вместе восстановим основные темы алгебры и геометрии 7 класса и подготовимся к новой программе.",
    };
  }

  if (score <= 17) {
    return {
      title: "База есть, но остались пробелы",
      text:
        "Часть программы 7 класса уже получается, но несколько важных алгебраических и геометрических тем стоит укрепить перед 8 классом.",
      extra:
        "Посмотри персональные рекомендации ниже — повторять всё подряд не понадобится.",
      cta: "Подтянуть сложные темы",
      card:
        "Разберём только те темы, в которых остались пробелы, без повторения всего учебника.",
    };
  }

  if (score <= 22) {
    return {
      title: "Ты хорошо готов к 8 классу",
      text:
        "У тебя хорошая база по алгебре и геометрии 7 класса. Достаточно разобрать отдельные ошибки и можно двигаться дальше.",
      extra:
        "Можно быстро закрыть оставшиеся пробелы и заранее познакомиться с темами 8 класса.",
      cta: "Подготовиться к 8 классу",
      card:
        "Быстро повторим сложные моменты и заранее познакомимся с программой 8 класса.",
    };
  }

  if (score <= 25) {
    return {
      title: "Отличная готовность к 8 классу",
      text:
        "У тебя крепкая база по алгебре и геометрии 7 класса. Осталось разобрать отдельные ошибки — и можно переходить к рациональным дробям, квадратным корням, четырёхугольникам и площадям.",
      extra:
        "Обязательного повторения всей программы не требуется.",
      cta: "Начать темы 8 класса",
      card:
        "Разберём отдельные ошибки и начнём знакомиться с новыми темами.",
    };
  }

  return {
    title: "Отличный результат!",
    text:
      "Все задания выполнены правильно. У тебя крепкая база по алгебре и геометрии 7 класса — можно переходить к рациональным дробям, квадратным корням, четырёхугольникам и площадям.",
    extra:
      "Тем для обязательного повторения нет — можно спокойно двигаться дальше.",
    cta: "Начать темы 8 класса",
    card:
      "Обязательного повторения не требуется — можно переходить к программе 8 класса.",
  };
}

function MathFormula({ expression }: { expression: string }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const renderFormula = () => {
      if (!window.katex) return false;

      window.katex.render(expression, element, {
        displayMode: true,
        throwOnError: false,
      });

      return true;
    };

    if (renderFormula()) return;

    const timer = window.setInterval(() => {
      if (renderFormula()) window.clearInterval(timer);
    }, 100);

    return () => window.clearInterval(timer);
  }, [element, expression]);

  return <div ref={setElement} />;
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

function formatAnswer(
  answer?: StoredAnswer,
  question?: Question,
) {
  if (!answer) return "Ответ не введён";
  if (answer.dontKnow) return "Не знаю, как решить";

  if (question?.type === "system") {
    const [x, y] = answer.value.split("|");
    return `x = ${x || "—"}, y = ${y || "—"}`;
  }

  return answer.value.trim() || "Ответ не введён";
}

export default function GradeEight() {
  const [screen, setScreen] =
    useState<"home" | "test" | "geometry" | "review" | "result">("home");
  const [studentName, setStudentName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StoredAnswer>>({});
  const [notice, setNotice] = useState(false);
  const [toast, setToast] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (["home", "test", "geometry", "review"].includes(parsed.screen)) {
          setScreen(parsed.screen);
        }

        setStudentName(parsed.studentName || "");
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
        studentName,
        accepted,
        answers,
        current,
      }),
    );
  }, [
    screen,
    studentName,
    accepted,
    answers,
    current,
    hydrated,
  ]);

  const getStatus = (question: Question) => {
    const answer = answers[question.id];

    if (answer?.dontKnow) return "dont_know";
    if (!answer?.value.trim()) return "unanswered";

    return question.check(answer.value)
      ? "correct"
      : "incorrect";
  };

  const score = useMemo(
    () =>
      questions.filter(
        (question) =>
          getStatus(question) === "correct",
      ).length,
    [answers],
  );

  const incorrectCount = questions.filter(
    (question) =>
      getStatus(question) === "incorrect",
  ).length;

  const dontKnowCount = questions.filter(
    (question) =>
      getStatus(question) === "dont_know",
  ).length;

  const answeredCount = questions.filter(
    (question) =>
      getStatus(question) !== "unanswered",
  ).length;

  const start = () => {
    if (!studentName.trim() || !accepted) return;

    setScreen("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    const confirmed = window.confirm(
      "Все сохранённые ответы будут удалены. Начать диагностику заново?",
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    setStudentName("");
    setAccepted(false);
    setAnswers({});
    setCurrent(0);
    setScreen("home");
    setNotice(false);
    setToast("");
    setCopyFallback("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reportText = () => {
    const copy = resultCopy(score);
    const blocks = [
      ...new Set(
        questions.map((question) => question.block),
      ),
    ];

    const blockLines = blocks.map((block) => {
      const blockQuestions = questions.filter(
        (question) => question.block === block,
      );

      const correct = blockQuestions.filter(
        (question) =>
          getStatus(question) === "correct",
      ).length;

      return `— ${block}: ${correct} из ${blockQuestions.length}`;
    });

    const strong = questions
      .filter(
        (question) =>
          getStatus(question) === "correct",
      )
      .map((question) => question.topic);

    const repeat = questions
      .filter(
        (question) =>
          getStatus(question) === "incorrect",
      )
      .map((question) => question.topic);

    const restore = questions
      .filter(
        (question) =>
          getStatus(question) === "dont_know",
      )
      .map((question) => question.topic);

    return [
      "Диагностика «Что повторить перед 8 классом?»",
      `Ученик: ${studentName.trim()}`,
      `Результат: ${score} из ${questions.length}`,
      `Ошибок: ${incorrectCount}`,
      `Отмечено «Не знаю»: ${dontKnowCount}`,
      `Вывод: ${copy.title}`,
      `Результаты по разделам:\n${blockLines.join("\n")}`,
      `Получается уверенно:\n${
        strong.length
          ? strong.map((topic) => `— ${topic}`).join("\n")
          : "—"
      }`,
      `Стоит повторить:\n${
        repeat.length
          ? repeat.map((topic) => `— ${topic}`).join("\n")
          : "— обычных ошибок нет"
      }`,
      `Стоит разобрать подробнее:\n${
        restore.length
          ? restore.map((topic) => `— ${topic}`).join("\n")
          : "— нет тем, отмеченных как «Не знаю»"
      }`,
      `Работа выполнена: ${new Date().toLocaleString("ru-RU")}`,
    ].join("\n\n");
  };

  const copyResult = async (
    message = "Результат скопирован",
  ) => {
    try {
      await navigator.clipboard.writeText(reportText());
      setToast(message);
      setCopyFallback("");
    } catch {
      setToast("Браузер запретил автоматическое копирование");
      setCopyFallback(reportText());
    }

    window.setTimeout(() => setToast(""), 4000);
  };

  const downloadResult = () => {
    const rows = questions
      .map((question, index) => {
        const status = getStatus(question);
        const statusLabel =
          status === "correct"
            ? "Правильно"
            : status === "incorrect"
              ? "Неправильно"
              : status === "dont_know"
                ? "Не знаю"
                : "Нет ответа";

        return `<tr>
         <td>${index + 1}</td>
          <td>${escapeHtml(question.topic)}</td>
          <td>${escapeHtml(formatAnswer(answers[question.id], question))}</td>
          <td>${escapeHtml(question.correctLabel)}</td>
          <td>${statusLabel}</td>
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
<h1>Что повторить перед 8 классом?</h1>
<pre>${escapeHtml(reportText())}</pre>
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
    link.download = `Перед_8_классом_${
      studentName.trim().replace(/\s+/g, "_") ||
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

    const hasAnswer =
      stored.dontKnow ||
      (question.type === "system"
        ? stored.value
            .split("|")
            .length >= 2 &&
          stored.value
            .split("|")
            .every((value) => value.trim())
        : stored.value.trim().length > 0);

    const goNext = () => {
      if (!hasAnswer) return;

      setNotice(false);

      if (current === 17) {
        setScreen("geometry");
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

    return (
      <main className="test-shell">
        <header className="compact-header">
          <a className="brand brand-button" href="/">
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
              const status = getStatus(item);

              const stateClass =
                status === "dont_know"
                  ? "unknown"
                  : status === "unanswered"
                    ? "empty"
                    : "answered";

              return (
                <button
                  type="button"
                  className={`${stateClass} ${
                    index === current ? "current" : ""
                  }`}
                  key={index + 1}
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

          <article className="question-card grade-seven-question grade-eight-question">
            <p className="question-eyebrow">
              {question.eyebrow}
            </p>

            <h1>{question.prompt}</h1>

            {question.expression && (
              <div className="expression">
                <MathFormula
                  expression={question.expression}
                />
              </div>
            )}

            {question.diagram && (
              <GeometryDiagram kind={question.diagram} />
            )}

            {question.type === "text" && (
              <label className="answer-field">
                <span>Твой ответ</span>

                <span className="answer-with-suffix">
                  <input
                    autoFocus
                    value={
                      stored.dontKnow
                        ? ""
                        : stored.value
                    }
                    onChange={(event) => {
                      setAnswers((previous) => ({
                        ...previous,
                        [question.id]: {
                          value: event.target.value,
                          dontKnow: false,
                        },
                      }));
                      setNotice(false);
                    }}
                    placeholder="Введи ответ"
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        hasAnswer
                      ) {
                        goNext();
                      }
                    }}
                  />

                  {question.suffix && (
                    <b>{question.suffix}</b>
                  )}
                </span>
              </label>
            )}

            {question.type === "system" && (
              <div className="system-fields">
                {(["x", "y"] as const).map((variable, index) => {
                  const values = stored.dontKnow
                    ? ["", ""]
                    : stored.value.split("|");

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
                            [question.id]: {
                              value: `${next[0] || ""}|${next[1] || ""}`,
                              dontKnow: false,
                            },
                          }));
                          setNotice(false);
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
                    type="button"
                    className={`option ${
                      !stored.dontKnow &&
                      stored.value === option
                        ? "selected"
                        : ""
                    }`}
                    key={option}
                    onClick={() => {
                      setAnswers((previous) => ({
                        ...previous,
                        [question.id]: {
                          value: option,
                          dontKnow: false,
                        },
                      }));
                      setNotice(false);
                    }}
                  >
                    <span className="radio-dot" />
                    {option}
                  </button>
                ))}
              </div>
            )}

            <p className="dont-know-hint">
              Не получается? Не угадывай — нажми
              «Не знаю, как решить». Так рекомендации
              получатся точнее.
            </p>

            {notice && (
              <div className="kind-notice">
                <span>♡</span>
                <p>
                  Ничего страшного — эту тему отметим
                  в рекомендациях и пойдём дальше.
                </p>
              </div>
            )}

            <div className="test-actions grade-seven-actions">
              <button
                className="button secondary"
                disabled={current === 0}
                onClick={() => {
                  setCurrent((value) => value - 1);
                  setNotice(false);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
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
                onClick={() => {
                  setAnswers((previous) => ({
                    ...previous,
                    [question.id]: {
                      value: "",
                      dontKnow: true,
                    },
                  }));
                  setNotice(true);
                }}
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
            Ответы и прогресс сохраняются на этом
            устройстве автоматически
          </p>
        </section>
      </main>
    );
  }

  if (screen === "geometry") {
    return (
      <main className="center-screen">
        <section className="review-card bridge-card">
          <div className="review-icon">△</div>
          <p className="kicker">
            Первая часть завершена
          </p>
          <h1>С алгеброй закончили!</h1>
          <p>
            Теперь проверим основные темы геометрии 7 класса.
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
    const missing = questions.filter(
      (question) =>
        getStatus(question) === "unanswered",
    );

    const markMissingUnknown = () => {
      setAnswers((previous) => {
        const next = { ...previous };

        missing.forEach((question) => {
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
        "После завершения изменить ответы будет нельзя. Узнать результат?",
      );

      if (!confirmed) return;

      setScreen("result");
      localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0 });
    };

    return (
      <main className="result-page review-overview">
        <header className="compact-header">
          <a className="brand" href="/">
            <span className="brand-mark">∿</span>
            <span>Математика без стресса</span>
          </a>
        </header>

        <section className="result-section overview-heading">
          <p className="kicker">
            Перед завершением
          </p>
          <h1>Обзор всех 26 заданий</h1>
          <p>
            {missing.length
              ? `Без ответа осталось: ${missing.length}. Вернись к ним или засчитай как «Не знаю, как решить».`
              : "Все задания заполнены или отмечены как «Не знаю, как решить»."}
          </p>
        </section>

        <section className="result-section overview-grid">
          {questions.map((question, index) => {
            const status = getStatus(question);

            const stateClass =
              status === "dont_know"
                ? "unknown"
                : status === "unanswered"
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
          {missing.length > 0 && (
            <button
              className="button secondary"
              onClick={markMissingUnknown}
            >
              Засчитать пропуски как «Не знаю»
            </button>
          )}

          <button
            className="button primary"
            disabled={missing.length > 0}
            onClick={finish}
          >
            Узнать результат
          </button>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const copy = resultCopy(score);

    const telegramMessage = encodeURIComponent(
      `Здравствуйте! Меня зовут ${studentName.trim()}. ` +
        `Результат моей диагностики перед 8 классом — ${score} из ${questions.length}. ` +
        `Хочу обсудить план повторения.`,
    );

    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${telegramMessage}`;

    const blocks = [
      ...new Set(
        questions.map((question) => question.block),
      ),
    ];

    const strong = questions
      .filter(
        (question) =>
          getStatus(question) === "correct",
      )
      .map((question) => question.topic);

    const repeat = questions
      .filter(
        (question) =>
          getStatus(question) === "incorrect",
      )
      .map((question) => question.topic);

    const restore = questions
      .filter(
        (question) =>
          getStatus(question) === "dont_know",
      )
      .map((question) => question.topic);

    const algebraScore = questions.filter(
      (question) =>
        !question.part &&
        getStatus(question) === "correct",
    ).length;

    const geometryScore = questions.filter(
      (question) =>
        question.part === "geometry" &&
        getStatus(question) === "correct",
    ).length;

    return (
      <main className="result-page">
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
              {studentName.trim()},{" "}
              {copy.title.toLowerCase()}
            </h1>

            <p>{copy.text}</p>
            <small>{copy.extra}</small>
          </div>
        </section>

        <section className="result-section result-stats">
          <article>
            <strong>{score}/{questions.length}</strong>
            <span>общий результат</span>
          </article>

          <article>
            <strong>{algebraScore}/18</strong>
            <span>алгебра</span>
          </article>

          <article>
            <strong>{geometryScore}/8</strong>
            <span>геометрия</span>
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
                Персональный разбор
              </p>
              <h2>Как обстоят дела по темам</h2>
            </div>

            <span>
              Рекомендации составлены по твоим ответам
            </span>
          </div>

          <div className="block-results">
            {blocks.map((block) => {
              const blockQuestions = questions.filter(
                (question) => question.block === block,
              );

              const correct = blockQuestions.filter(
                (question) =>
                  getStatus(question) === "correct",
              ).length;

              const unknown = blockQuestions.filter(
                (question) =>
                  getStatus(question) === "dont_know",
              ).length;

              const wrong = blockQuestions.filter(
                (question) =>
                  getStatus(question) === "incorrect",
              ).length;

              const ratio =
                correct / blockQuestions.length;

              const isSingle =
                blockQuestions.length === 1;

              const status =
                ratio === 1
                  ? "Получается отлично"
                  : isSingle
                    ? "Стоит проверить тему"
                    : ratio >= 0.5
                      ? "Стоит немного повторить"
                      : "Важно восстановить";

              let detail =
                "Здесь всё уверенно — можно двигаться дальше.";

              if (unknown && wrong) {
                detail =
                  "Часть заданий получилась, но некоторые правила стоит повторить, а отдельные моменты — разобрать подробнее.";
              } else if (unknown) {
                detail =
                  "Эту тему стоит разобрать с самого начала: пока сложно определить способ решения.";
              } else if (wrong) {
                detail = isSingle
                  ? "В этом задании возникла трудность — стоит ещё раз проверить тему."
                  : recommendations[block];
              }

              return (
                <article
                  className={`block-card ${
                    ratio === 1
                      ? "great"
                      : ratio >= 0.5
                        ? "medium"
                        : "restore"
                  }`}
                  key={block}
                >
                  <div className="block-topline">
                    <span>
                      {correct}/{blockQuestions.length}
                    </span>
                    <b>{status}</b>
                  </div>

                  <h3>{block}</h3>
                  <p>{detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="result-section three-topic-panels">
          <article className="topic-panel strong-panel">
            <p className="kicker">Сильные темы</p>
            <h2>Получается</h2>

            <div className="topic-tags">
              {strong.map((topic) => (
                <span key={topic}>✓ {topic}</span>
              ))}

              {!strong.length && (
                <p>
                  Начнём с восстановления главного —
                  без спешки.
                </p>
              )}
            </div>
          </article>

          <article className="topic-panel repeat-panel">
            <p className="kicker">
              {repeat.length
                ? "Освежить"
                : "Обычных ошибок нет"}
            </p>

            <h2>
              {repeat.length
                ? "Повторить"
                : "По выполненным заданиям всё верно"}
            </h2>

            <div className="topic-tags">
              {repeat.length ? (
                repeat.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))
              ) : (
                <p>
                  Здесь не нужно придумывать темы для
                  повторения: ошибок в выполненных
                  заданиях нет.
                </p>
              )}
            </div>
          </article>

          <article className="topic-panel restore-panel">
            <p className="kicker">
              {restore.length
                ? "Разобрать"
                : "Можно двигаться дальше"}
            </p>

            <h2>
              {restore.length
                ? "Подробнее"
                : "Незнакомых способов решения нет"}
            </h2>

            <div className="topic-tags">
              {restore.length ? (
                restore.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))
              ) : (
                <p>
                  Нет тем, отмеченных как «Не знаю, как
                  решить».
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
              const status = getStatus(question);

              const stateClass =
                status === "correct"
                  ? "correct"
                  : status === "incorrect"
                    ? "wrong"
                    : "unknown";

              return (
                <details
                  className={`overview-item result-answer-item ${stateClass}`}
                  key={question.id}
                >
                  <summary>
                   <b>№{index + 1}</b>
                    <span>
                      {status === "correct"
                        ? "Правильно"
                        : status === "incorrect"
                          ? "Неправильно"
                          : "Не знаю"}
                    </span>
                  </summary>

                  <div>
                    <p>
                      <b>Тема:</b> {question.topic}
                    </p>

                    <p>
                      <b>Твой ответ:</b>{" "}
                      {formatAnswer(answers[question.id], question)}
                    </p>

                    <p>
                      <b>Правильный ответ:</b>{" "}
                      {question.correctLabel}
                    </p>

                    <p className="solution">
                      {question.solution}
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
              Хочешь подготовиться к 8 классу без стресса?
            </h2>
            <p>{copy.card}</p>
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
              {copy.cta}
            </a>

            <button
              className="button secondary"
              onClick={restart}
            >
              Пройти тест ещё раз
            </button>
          </div>

          {toast && (
            <p className="copy-toast" role="status">
              {toast}
            </p>
          )}

          {copyFallback && (
            <div className="copy-fallback">
              <textarea readOnly value={copyFallback} />
            </div>
          )}
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
          <div className="soft-pill">
            Диагностика после 7 класса
          </div>

          <h1>
            Что повторить
            <br />
            перед <em>8 классом?</em>
          </h1>

          <p className="hero-lead">
            Пройди диагностику и узнай, какие темы
            алгебры и геометрии 7 класса ты помнишь,
            а что стоит повторить перед 8 классом.
          </p>

          <div className="calm-note">
            <span>♡</span>
            <p>
              Это не контрольная и не экзамен. Здесь
              нет школьных оценок — только понятный
              результат и рекомендации.
            </p>
          </div>

          <div className="name-start-card">
            <label htmlFor="student-name">
              Как тебя зовут?
            </label>

            <input
              id="student-name"
              type="text"
              value={studentName}
              onChange={(event) =>
                setStudentName(event.target.value)
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
                  Решай самостоятельно, без калькулятора,
                  учебника и подсказок.
                </li>
                <li>
                  Строгого ограничения времени нет.
                </li>
                <li>
                  Если не знаешь способ решения, не
                  угадывай — нажми «Не знаю, как решить».
                </li>
                <li>
                  Это не оценка, а способ понять, что
                  стоит повторить перед новым учебным
                  этапом.
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
              disabled={
                !studentName.trim() || !accepted
              }
            >
              Начать диагностику <span>→</span>
            </button>

            <p className="name-start-meta">
              <b>26 заданий</b>
              <span>·</span> около 30–35 минут{" "}
              <span>·</span> результат сразу
            </p>
          </div>
        </div>

        <MathDoodle />
      </section>

      <section className="how">
        <div className="section-heading home-heading">
          <div>
            <p className="kicker">Всё просто</p>
            <h2>Как это работает</h2>
          </div>

          <p>
            Без регистрации, школьных оценок и лишнего
            волнения
          </p>
        </div>

        <div className="steps">
          <article className="step-card violet">
            <span>01</span>
            <h3>Решаешь задания</h3>
            <p>
              Проверяешь базовые навыки по алгебре и геометрии 7 класса.
            </p>
          </article>

          <article className="step-card blue">
            <span>02</span>
            <h3>Можно честно не знать</h3>
            <p>
              Отмечаешь незнакомые способы решения —
              без случайных догадок.
            </p>
          </article>

          <article className="step-card pink">
            <span>03</span>
            <h3>Получаешь маршрут</h3>
            <p>
              Видишь сильные темы и то, что стоит
              повторить подробнее.
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
            <span>Доступно сейчас</span>
            <b>Перехожу в 6 класс</b>
            <i>Программа 5 класса →</i>
          </a>

          <a className="class-card active" href="/7">
            <span>Доступно сейчас</span>
            <b>Перехожу в 7 класс</b>
            <i>Программа 6 класса →</i>
          </a>

          <button
            className="class-card active grade-eight-card"
            onClick={start}
          >
            <span>Доступно сейчас</span>
            <b>Перехожу в 8 класс</b>
            <i>Программа 7 класса →</i>
          </button>

          <a className="class-card active" href="/9">
            <span>Доступно сейчас</span>
            <b>Перехожу в 9 класс</b>
            <i>Программа 8 класса →</i>
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
