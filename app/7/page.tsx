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
  type: "text" | "choice";
  options?: string[];
  topic: string;
  block: string;
  correctLabel: string;
  solution: string;
  check: (answer: string) => boolean;
};

const TELEGRAM_USERNAME = "vxoab";
const STORAGE_KEY = "math-diagnostic-7-v2";

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");

function asNumber(value: string) {
  const cleaned = normalize(value)
    .replace(/[а-яa-wyz]/gi, "")
    .replace("=", "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function asFraction(value: string) {
  const cleaned = normalize(value).replace(/[()]/g, "");
  const fraction = cleaned.match(/^(-?\d+)\/(-?\d+)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    return denominator ? Number(fraction[1]) / denominator : null;
  }
  const mixed = value.trim().replace(",", ".").match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const denominator = Number(mixed[3]);
    if (!denominator) return null;
    return whole + Math.sign(whole || 1) * Number(mixed[2]) / denominator;
  }
  return asNumber(cleaned);
}

function parseLinear(value: string, variable: string) {
  let source = normalize(value).replace(/\*/g, "");
  if (!source) return null;
  if (!source.startsWith("-")) source = `+${source}`;
  source = source.replace(/-/g, "+-");
  const terms = source.split("+").filter(Boolean);
  let coefficient = 0;
  let constant = 0;
  for (const term of terms) {
    if (term.includes(variable)) {
      const coefficientText = term.replace(variable, "");
      if (coefficientText === "" || coefficientText === "+") coefficient += 1;
      else if (coefficientText === "-") coefficient -= 1;
      else {
        const parsed = Number(coefficientText);
        if (!Number.isFinite(parsed)) return null;
        coefficient += parsed;
      }
    } else {
      const parsed = Number(term);
      if (!Number.isFinite(parsed)) return null;
      constant += parsed;
    }
  }
  return { coefficient, constant };
}

const equalsNumber = (target: number) => (answer: string) => asNumber(answer) === target;
const equalsFraction = (target: number) => (answer: string) => {
  const parsed = asFraction(answer);
  return parsed !== null && Math.abs(parsed - target) < 1e-9;
};
const equalsLinear = (variable: string, coefficient: number, constant: number) =>
  (answer: string) => {
    const parsed = parseLinear(answer, variable);
    return parsed?.coefficient === coefficient && parsed.constant === constant;
  };

const questions: Question[] = [
  {
    id: 1,
    eyebrow: "Сравнение рациональных чисел",
    prompt: "Расположи числа в порядке возрастания:",
    expression: String.raw`-3{,}5;\quad 2;\quad -1;\quad 0;\quad -3{,}05`,
    type: "choice",
    options: [
      "−3,5; −3,05; −1; 0; 2",
      "−3,05; −3,5; −1; 0; 2",
      "−3,5; −1; −3,05; 0; 2",
      "2; 0; −1; −3,05; −3,5",
    ],
    topic: "Сравнение рациональных чисел",
    block: "Рациональные числа",
    correctLabel: "−3,5; −3,05; −1; 0; 2",
    solution:
      "Среди отрицательных чисел меньше то, которое дальше от нуля: −3,5 < −3,05 < −1. Затем идут 0 и 2.",
    check: (answer) => normalize(answer) === normalize("−3,5; −3,05; −1; 0; 2"),
  },
  {
    id: 2,
    eyebrow: "Модуль числа",
    prompt: "Вычисли:",
    expression: String.raw`|-8|+|-3|-|5|`,
    type: "text",
    topic: "Модуль числа",
    block: "Рациональные числа",
    correctLabel: "6",
    solution: "|−8| = 8, |−3| = 3, |5| = 5. Получаем 8 + 3 − 5 = 6.",
    check: equalsNumber(6),
  },
  {
    id: 3,
    eyebrow: "Сложение и вычитание",
    prompt: "Вычисли:",
    expression: String.raw`-17+9-(-6)`,
    type: "text",
    topic: "Сложение и вычитание чисел с разными знаками",
    block: "Рациональные числа",
    correctLabel: "−2",
    solution: "Вычитание отрицательного числа заменяем сложением: −17 + 9 + 6 = −2.",
    check: equalsNumber(-2),
  },
  {
    id: 4,
    eyebrow: "Умножение и деление",
    prompt: "Вычисли:",
    expression: String.raw`(-24):6\cdot(-3)`,
    type: "text",
    topic: "Умножение и деление отрицательных чисел",
    block: "Рациональные числа",
    correctLabel: "12",
    solution: "(−24) : 6 = −4, затем −4 · (−3) = 12.",
    check: equalsNumber(12),
  },
  {
    id: 5,
    eyebrow: "Порядок действий",
    prompt: "Вычисли:",
    expression: String.raw`-4+3\cdot(-5)-(-18):6`,
    type: "text",
    topic: "Порядок действий с рациональными числами",
    block: "Рациональные числа",
    correctLabel: "−16",
    solution: "Сначала умножение и деление: 3 · (−5) = −15, (−18) : 6 = −3. Тогда −4 − 15 − (−3) = −16.",
    check: equalsNumber(-16),
  },
  {
    id: 6,
    eyebrow: "Сложение дробей",
    prompt: "Вычисли:",
    expression: String.raw`-\frac{3}{4}+\frac{5}{6}`,
    type: "text",
    topic: "Сложение дробей с разными знаменателями",
    block: "Обыкновенные дроби",
    correctLabel: "1/12",
    solution: "Общий знаменатель 12: −3/4 = −9/12, 5/6 = 10/12. Получаем 1/12.",
    check: equalsFraction(1 / 12),
  },
  {
    id: 7,
    eyebrow: "Деление дробей",
    prompt: "Вычисли:",
    expression: String.raw`\frac{7}{9}:\left(-\frac{14}{15}\right)`,
    type: "text",
    topic: "Деление обыкновенных дробей и работа со знаками",
    block: "Обыкновенные дроби",
    correctLabel: "−5/6",
    solution: "Заменяем деление умножением на обратную дробь: 7/9 · (−15/14) = −5/6.",
    check: equalsFraction(-5 / 6),
  },
  {
    id: 8,
    eyebrow: "Буквенное выражение",
    prompt: "Найди значение выражения, если a = −4, b = 5:",
    expression: String.raw`3a-2b`,
    type: "text",
    topic: "Подстановка значений в буквенное выражение",
    block: "Буквенные выражения и преобразования",
    correctLabel: "−22",
    solution: "Подставляем значения: 3 · (−4) − 2 · 5 = −12 − 10 = −22.",
    check: equalsNumber(-22),
  },
  {
    id: 9,
    eyebrow: "Распределительное свойство",
    prompt: "Раскрой скобки и упрости выражение:",
    expression: String.raw`4(x-3)+2x`,
    type: "text",
    topic: "Распределительное свойство и раскрытие скобок",
    block: "Буквенные выражения и преобразования",
    correctLabel: "6x − 12",
    solution: "4(x − 3) = 4x − 12. Складываем подобные: 4x + 2x − 12 = 6x − 12.",
    check: equalsLinear("x", 6, -12),
  },
  {
    id: 10,
    eyebrow: "Минус перед скобками",
    prompt: "Упрости выражение:",
    expression: String.raw`7a-(3a-5)`,
    type: "text",
    topic: "Раскрытие скобок со знаком минус",
    block: "Буквенные выражения и преобразования",
    correctLabel: "4a + 5",
    solution: "Меняем знаки внутри скобок: 7a − 3a + 5 = 4a + 5.",
    check: equalsLinear("a", 4, 5),
  },
  {
    id: 11,
    eyebrow: "Подобные слагаемые",
    prompt: "Приведи подобные слагаемые:",
    expression: String.raw`8x-3+5x-7`,
    type: "text",
    topic: "Приведение подобных слагаемых",
    block: "Буквенные выражения и преобразования",
    correctLabel: "13x − 10",
    solution: "8x + 5x = 13x, а −3 − 7 = −10. Ответ: 13x − 10.",
    check: equalsLinear("x", 13, -10),
  },
  {
    id: 12,
    eyebrow: "Скобки и подобные",
    prompt: "Упрости выражение:",
    expression: String.raw`3(2y-4)-2(y+1)`,
    type: "text",
    topic: "Раскрытие скобок и приведение подобных слагаемых",
    block: "Буквенные выражения и преобразования",
    correctLabel: "4y − 14",
    solution: "Раскрываем скобки: 6y − 12 − 2y − 2. Приводим подобные: 4y − 14.",
    check: equalsLinear("y", 4, -14),
  },
  {
    id: 13,
    eyebrow: "Линейное уравнение",
    prompt: "Реши уравнение:",
    expression: String.raw`5x-17=28`,
    type: "text",
    topic: "Линейное уравнение",
    block: "Уравнения и текстовые задачи",
    correctLabel: "x = 9",
    solution: "5x = 28 + 17 = 45, поэтому x = 45 : 5 = 9.",
    check: equalsNumber(9),
  },
  {
    id: 14,
    eyebrow: "Переменная в обеих частях",
    prompt: "Реши уравнение:",
    expression: String.raw`7x-9=4x+12`,
    type: "text",
    topic: "Уравнение с переменной в обеих частях",
    block: "Уравнения и текстовые задачи",
    correctLabel: "x = 7",
    solution: "Переносим: 7x − 4x = 12 + 9. Получаем 3x = 21, значит x = 7.",
    check: equalsNumber(7),
  },
  {
    id: 15,
    eyebrow: "Уравнение со скобками",
    prompt: "Реши уравнение:",
    expression: String.raw`3(2x-5)=4x+7`,
    type: "text",
    topic: "Линейное уравнение со скобками",
    block: "Уравнения и текстовые задачи",
    correctLabel: "x = 11",
    solution: "6x − 15 = 4x + 7. Тогда 2x = 22, откуда x = 11.",
    check: equalsNumber(11),
  },
  {
    id: 16,
    eyebrow: "Задача на уравнение",
    prompt: "В первой коробке в 3 раза больше карандашей, чем во второй. Всего в двух коробках 48 карандашей. Сколько карандашей во второй коробке?",
    type: "text",
    topic: "Решение текстовых задач с помощью уравнений",
    block: "Уравнения и текстовые задачи",
    correctLabel: "12",
    solution: "Пусть во второй коробке x карандашей, тогда в первой 3x. x + 3x = 48, 4x = 48, x = 12.",
    check: equalsNumber(12),
  },
  {
    id: 17,
    eyebrow: "Пропорция",
    prompt: "Найди неизвестное число:",
    expression: String.raw`\frac{x}{15}=\frac{8}{10}`,
    type: "text",
    topic: "Пропорции",
    block: "Отношения и пропорции",
    correctLabel: "12",
    solution: "По основному свойству пропорции: 10x = 15 · 8 = 120, поэтому x = 12.",
    check: equalsNumber(12),
  },
  {
    id: 18,
    eyebrow: "Прямая пропорциональность",
    prompt: "За 4 одинаковые тетради заплатили 180 рублей. Сколько стоят 7 таких тетрадей?",
    type: "text",
    topic: "Прямо пропорциональная зависимость",
    block: "Отношения и пропорции",
    correctLabel: "315 рублей",
    solution: "Одна тетрадь стоит 180 : 4 = 45 рублей. Семь тетрадей: 45 · 7 = 315 рублей.",
    check: equalsNumber(315),
  },
  {
    id: 19,
    eyebrow: "Координатная плоскость",
    prompt: "Какая точка находится в III координатной четверти?",
    expression: String.raw`A(-3;2),\quad B(4;-1),\quad C(-2;-5),\quad D(3;4)`,
    type: "choice",
    options: ["A", "B", "C", "D"],
    topic: "Координаты точки и четверти координатной плоскости",
    block: "Координатная плоскость",
    correctLabel: "C",
    solution: "В III четверти обе координаты отрицательные. Это точка C(−2; −5).",
    check: (answer) => normalize(answer) === "c",
  },
  {
    id: 20,
    eyebrow: "Степень",
    prompt: "Вычисли:",
    expression: String.raw`(-2)^4-3^2`,
    type: "text",
    topic: "Степень с натуральным показателем",
    block: "Степень",
    correctLabel: "7",
    solution: "(−2)⁴ = 16, а 3² = 9. Получаем 16 − 9 = 7.",
    check: equalsNumber(7),
  },
  {
    id: 21,
    eyebrow: "Вид угла",
    prompt: "Как называется угол, градусная мера которого равна 128°?",
    type: "choice",
    options: ["Острый", "Прямой", "Тупой", "Развёрнутый"],
    topic: "Виды углов",
    block: "Углы и прямые",
    part: "geometry",
    correctLabel: "Тупой",
    solution: "Угол больше 90°, но меньше 180°, поэтому он тупой.",
    check: (answer) => normalize(answer) === normalize("Тупой"),
  },
  {
    id: 22,
    eyebrow: "Части угла",
    prompt: "Луч OC проходит внутри угла AOB. Угол AOB равен 95°, а угол AOC равен 38°. Найди угол COB.",
    diagram: "angle-parts",
    suffix: "°",
    type: "text",
    topic: "Измерение углов",
    block: "Углы и прямые",
    part: "geometry",
    correctLabel: "57°",
    solution: "Угол COB равен разности углов AOB и AOC: 95° − 38° = 57°.",
    check: equalsNumber(57),
  },
  {
    id: 23,
    eyebrow: "Вид треугольника",
    prompt: "Стороны треугольника равны 6 см, 6 см и 9 см. Как называется такой треугольник?",
    type: "choice",
    options: ["Равносторонний", "Равнобедренный", "Разносторонний", "Прямоугольный"],
    topic: "Виды треугольников",
    block: "Геометрические фигуры",
    part: "geometry",
    correctLabel: "Равнобедренный",
    solution: "У треугольника две равные стороны по 6 см, значит он равнобедренный.",
    check: (answer) => normalize(answer) === normalize("Равнобедренный"),
  },
  {
    id: 24,
    eyebrow: "Периметр треугольника",
    prompt: "Периметр равнобедренного треугольника равен 32 см, а его основание — 10 см. Найди длину боковой стороны.",
    diagram: "isosceles-perimeter",
    suffix: "см",
    type: "text",
    topic: "Периметр и равнобедренный треугольник",
    block: "Геометрические фигуры",
    part: "geometry",
    correctLabel: "11 см",
    solution: "На две равные боковые стороны приходится 32 − 10 = 22 см. Одна боковая сторона равна 22 : 2 = 11 см.",
    check: equalsNumber(11),
  },
  {
    id: 25,
    eyebrow: "Расположение прямых",
    prompt: "Какие прямые перпендикулярны?",
    diagram: "parallel-perpendicular",
    type: "choice",
    options: ["a и b", "a и c", "b и d", "c и d"],
    topic: "Параллельные и перпендикулярные прямые",
    block: "Углы и прямые",
    part: "geometry",
    correctLabel: "a и c",
    solution: "Прямые a и c пересекаются под прямым углом, который на рисунке отмечен квадратным маркером.",
    check: (answer) => normalize(answer) === normalize("a и c"),
  },
];

const recommendations: Record<string, string> = {
  "Рациональные числа":
    "Повтори правила действий с положительными и отрицательными числами. Знаки будут встречаться в выражениях, уравнениях, функциях и многочленах на протяжении всего 7 класса.",
  "Обыкновенные дроби":
    "Повтори общий знаменатель, умножение и деление дробей. В 7 классе дроби будут встречаться в коэффициентах, уравнениях, формулах и значениях функций.",
  "Буквенные выражения и преобразования":
    "Повтори подстановку значений, раскрытие скобок и приведение подобных слагаемых. На этих навыках строится работа с одночленами, многочленами и формулами сокращённого умножения.",
  "Уравнения и текстовые задачи":
    "Повтори линейные уравнения, особенно уравнения со скобками и переменной в обеих частях. В 7 классе появятся более сложные уравнения и системы.",
  "Отношения и пропорции":
    "Повтори отношения и пропорции. Они помогут понимать зависимости между величинами, прямую пропорциональность и функции.",
  "Координатная плоскость":
    "Повтори координаты точек и четверти координатной плоскости. Это понадобится при построении и чтении графиков функций.",
  Степень:
    "Повтори квадрат и куб числа, а также влияние скобок и знака на результат. В 7 классе начнётся подробное изучение свойств степеней.",
  "Углы и прямые":
    "Повтори виды углов, градусную меру и различие между параллельными и перпендикулярными прямыми. С этих понятий начинается геометрия 7 класса.",
  "Геометрические фигуры":
    "Повтори виды треугольников и нахождение неизвестной стороны по периметру.",
};

function resultCopy(score: number) {
  if (score <= 9) {
    return {
      title: "Давай восстановим базу вместе",
      text:
        "Некоторые важные темы 6 класса пока вызывают трудности. Это нормально: их можно спокойно восстановить перед началом алгебры и геометрии.",
      extra:
        "Не нужно повторять весь учебник подряд. Лучше начать с основных пробелов и двигаться небольшими шагами.",
      cta: "Повторить вместе",
      card:
        "Вместе восстановим вычислительную и геометрическую базу перед 7 классом.",
    };
  }

  if (score <= 16) {
    return {
      title: "База есть, но остались пробелы",
      text:
        "Часть программы 6 класса уже получается, но несколько важных навыков стоит укрепить перед началом алгебры и геометрии.",
      extra:
        "Посмотри персональные рекомендации ниже — повторять всё подряд не понадобится.",
      cta: "Подтянуть сложные темы",
      card:
        "Разберём только те темы, в которых остались пробелы, без повторения всего учебника.",
    };
  }

  if (score <= 21) {
    return {
      title: "Ты хорошо готов к 7 классу",
      text:
        "У тебя хорошая основа для алгебры и геометрии 7 класса. Достаточно разобрать отдельные ошибки и можно переходить к новым темам.",
      extra:
        "Можно быстро закрыть оставшиеся пробелы и заранее познакомиться с функциями, степенями и многочленами.",
      cta: "Подготовиться к 7 классу",
      card:
        "Быстро повторим сложные моменты и заранее познакомимся с программой 7 класса.",
    };
  }

  if (score <= 24) {
    return {
      title: "Отличная готовность к 7 классу",
      text:
        "У тебя крепкая база перед 7 классом. Осталось разобрать отдельные ошибки — и можно переходить к линейным функциям, многочленам и системному курсу геометрии.",
      extra:
        "Обязательного повторения всей программы не требуется.",
      cta: "Начать темы 7 класса",
      card:
        "Разберём отдельные ошибки и начнём знакомиться с новыми темами.",
    };
  }

  return {
    title: "Отличный результат!",
    text:
      "Все задания выполнены правильно. У тебя крепкая база перед 7 классом — можно переходить к линейным функциям, многочленам и системному курсу геометрии.",
    extra:
      "Тем для обязательного повторения нет — можно спокойно двигаться дальше.",
    cta: "Начать темы 7 класса",
    card:
      "Обязательного повторения не требуется — можно переходить к программе 7 класса.",
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
    <div className="doodle grade-seven-doodle" aria-hidden="true">
      <span className="doodle-plus">−</span>
      <span className="doodle-pi">x</span>
      <span className="doodle-frac"><b>−5</b><i /><b>6</b></span>
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

function formatAnswer(answer?: StoredAnswer) {
  if (!answer) return "Ответ не введён";
  if (answer.dontKnow) return "Не знаю, как решить";
  return answer.value.trim() || "Ответ не введён";
}

export default function GradeSeven() {
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
      "Диагностика «Что повторить перед 7 классом?»",
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

 const telegramMessage = encodeURIComponent(reportText());

  const downloadResult = () => {
    const rows = questions
      .map((question) => {
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
          <td>${question.id}</td>
          <td>${escapeHtml(question.topic)}</td>
          <td>${escapeHtml(formatAnswer(answers[question.id]))}</td>
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
<h1>Что повторить перед 7 классом?</h1>
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
    link.download = `Перед_7_классом_${
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
      stored.value.trim().length > 0;

    const goNext = () => {
      if (!hasAnswer) return;

      setNotice(false);

      if (current === 19) {
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
                  {item.id}
                </button>
              );
            })}
          </nav>

          <article className="question-card grade-seven-question">
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
          <h1>Алгебраическая часть готова!</h1>
          <p>
            Осталось проверить несколько базовых тем
            по геометрии.
          </p>

          <button
            className="button primary"
            onClick={() => {
              setCurrent(20);
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
          <h1>Обзор всех 25 заданий</h1>
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
                <b>№{question.id}</b>
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

const telegramMessage = encodeURIComponent(reportText());

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
            <span>из 25</span>
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
            <strong>{score}/25</strong>
            <span>общий результат</span>
          </article>

          <article>
            <strong>{algebraScore}/20</strong>
            <span>алгебра</span>
          </article>

          <article>
            <strong>{geometryScore}/5</strong>
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
            {questions.map((question) => {
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
                    <b>№{question.id}</b>
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
                      {formatAnswer(answers[question.id])}
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
              Хочешь подготовиться к 7 классу без стресса?
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
            Диагностика перед алгеброй
          </div>

          <h1>
            Что повторить
            <br />
            перед <em>7 классом?</em>
          </h1>

          <p className="hero-lead">
            Пройди диагностику и узнай, насколько ты
            готов к алгебре и геометрии 7 класса и
            какие темы стоит освежить.
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
              <b>25 заданий</b>
              <span>·</span> около 25–30 минут{" "}
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
              Проверяешь навыки, на которых строятся
              алгебра и геометрия 7 класса.
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

          <button
            className="class-card active"
            onClick={start}
          >
            <span>Доступно сейчас</span>
            <b>Перехожу в 7 класс</b>
            <i>Программа 6 класса →</i>
          </button>

          <a
            className="class-card active grade-eight-card"
            href="/8"
          >
            <span>Доступно сейчас</span>
            <b>Перехожу в 8 класс</b>
            <i>Программа 7 класса →</i>
          </a>

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
