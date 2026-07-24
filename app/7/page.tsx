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
  type: "text" | "choice";
  options?: string[];
  topic: string;
  block: string;
  correctLabel: string;
  solution: string;
  check: (answer: string) => boolean;
};

const TELEGRAM_URL = "https://t.me/m/8wQr09o1NDEy";
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
    expression: "−3,5; 2; −1; 0; −3,05",
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
    expression: "|−8| + |−3| − |5|",
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
    expression: "−17 + 9 − (−6)",
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
    expression: "(−24) : 6 · (−3)",
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
    expression: "−4 + 3 · (−5) − (−18) : 6",
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
    expression: "−3/4 + 5/6",
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
    expression: "7/9 : (−14/15)",
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
    expression: "3a − 2b",
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
    expression: "4(x − 3) + 2x",
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
    expression: "7a − (3a − 5)",
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
    expression: "8x − 3 + 5x − 7",
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
    expression: "3(2y − 4) − 2(y + 1)",
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
    expression: "5x − 17 = 28",
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
    expression: "7x − 9 = 4x + 12",
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
    expression: "3(2x − 5) = 4x + 7",
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
    expression: "x/15 = 8/10",
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
    expression: "A(−3; 2), B(4; −1), C(−2; −5), D(3; 4)",
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
    expression: "(−2)⁴ − 3²",
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
  if (score <= 9) return {
    title: "Давай восстановим базу вместе",
    text: "Перед 7 классом особенно важно повторить действия с числами, выражения, уравнения, а также базовые понятия геометрии: углы, прямые и треугольники.",
    extra: "Не нужно пытаться самостоятельно перечитывать весь учебник. Можно спокойно восстановить основные правила и начать новый учебный год увереннее.",
    cta: "Повторить вместе",
    card: "Вместе восстановим вычислительную и геометрическую базу перед 7 классом.",
  };
  if (score <= 16) return {
    title: "База есть, но остались пробелы",
    text: "Основную часть программы ты помнишь. Осталось повторить отдельные вычислительные темы и немного освежить геометрическую базу.",
    extra: "Посмотри персональные рекомендации ниже — повторять всё подряд не понадобится.",
    cta: "Подтянуть сложные темы",
    card: "Разберём только те темы, в которых остались пробелы, без повторения всего учебника.",
  };
  if (score <= 21) return {
    title: "Ты хорошо готов к 7 классу",
    text: "У тебя хорошая основа для алгебры и геометрии 7 класса. Можно разобрать отдельные ошибки и переходить к новым темам.",
    extra: "Можно быстро закрыть оставшиеся пробелы и заранее познакомиться с функциями, степенями и многочленами.",
    cta: "Подготовиться к 7 классу",
    card: "Быстро повторим сложные моменты и заранее познакомимся с программой 7 класса.",
  };
  return {
    title: "Отличный результат!",
    text: "У тебя крепкая база перед 7 классом. Можно начинать изучать линейные функции, многочлены и системный курс геометрии.",
    extra: "Ты готов двигаться дальше и знакомиться с алгеброй.",
    cta: "Начать темы 7 класса",
    card: "Можно переходить дальше и заранее изучать функции, степени и многочлены.",
  };
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

export default function GradeSeven() {
  const [screen, setScreen] = useState<"home" | "test" | "geometry" | "review" | "result">("home");
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
    if (current === 19) setScreen("geometry");
    else if (current === questions.length - 1) setScreen("review");
    else setCurrent((value) => value + 1);
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
          <article className="question-card grade-seven-question">
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
                disabled={notice}
                onClick={() => {
                  setAnswers((previous) => ({
                    ...previous,
                    [question.id]: { value: "", dontKnow: true },
                  }));
                  setNotice(true);
                  window.setTimeout(goNext, 1250);
                }}
              >
                Не знаю, как решить
              </button>
              <button className="button primary" disabled={!stored.value.trim() || stored.dontKnow || notice} onClick={goNext}>
                Ответить и продолжить →
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
          <h1>Алгебраическая часть готова!</h1>
          <p>Осталось проверить несколько базовых тем по геометрии.</p>
          <button className="button primary" onClick={() => { setCurrent(20); setScreen("test"); window.scrollTo({ top: 0 }); }}>
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
          <p>Ты ответил на все 25 заданий. Результат покажет сильные темы и то, что стоит повторить перед алгеброй и геометрией.</p>
          <div className="review-actions">
            <button className="button secondary" onClick={() => { setCurrent(24); setScreen("test"); }}>Вернуться к тесту</button>
            <button className="button primary" onClick={() => { setScreen("result"); localStorage.removeItem(STORAGE_KEY); window.scrollTo({ top: 0 }); }}>Узнать результат</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const copy = resultCopy(score);
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
          <div className="score-orbit"><strong>{score}</strong><span>из 25</span></div>
          <div>
            <p className="kicker">Диагностика завершена</p>
            <h1>{copy.title}</h1>
            <p>{copy.text}</p><small>{copy.extra}</small>
          </div>
        </section>
        <section className="result-section result-stats">
          <article><strong>{score}/25</strong><span>общий результат</span></article>
          <article><strong>{algebraScore}/20</strong><span>алгебра</span></article>
          <article><strong>{geometryScore}/5</strong><span>геометрия</span></article>
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
              const status = ratio >= 0.8 ? "Получается отлично" : ratio >= 0.4 ? "Стоит немного повторить" : "Важно восстановить";
              let detail = "Здесь всё уверенно — можно двигаться дальше.";
              if (unknown && wrong) detail = "Часть заданий получилась, но некоторые правила стоит повторить, а отдельные моменты — разобрать подробнее.";
              else if (unknown) detail = "Эту тему стоит разобрать с самого начала: пока сложно определить способ решения.";
              else if (wrong) detail = "В этой теме есть ошибки. Возможно, стоит освежить правило и немного потренироваться.";
              if (block === "Углы и прямые") {
                detail = unknown
                  ? "Стоит заново разобрать, как измеряются углы и как распознавать параллельные и перпендикулярные прямые."
                  : wrong
                    ? recommendations[block]
                    : "Ты уверенно различаешь виды углов и понимаешь расположение прямых. Эта база пригодится в начале курса геометрии 7 класса.";
              }
              if (block === "Геометрические фигуры") {
                detail = unknown
                  ? "Стоит разобрать основные виды треугольников и вспомнить, из каких сторон складывается их периметр."
                  : wrong
                    ? recommendations[block]
                    : "Ты хорошо ориентируешься в видах треугольников и умеешь работать с их периметром.";
              }
              return (
                <article className={`block-card ${ratio >= 0.8 ? "great" : ratio >= 0.4 ? "medium" : "restore"}`} key={block}>
                  <div className="block-topline"><span>{correct}/{blockQuestions.length}</span><b>{status}</b></div>
                  <h3>{block}</h3>
                  <p>{detail}</p>
                  {ratio < 0.8 && !["Углы и прямые", "Геометрические фигуры"].includes(block) && <p className="block-recommendation">{recommendations[block]}</p>}
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
                  <p>Твой ответ: <b>{answer?.dontKnow ? "Не знаю, как решить" : answer?.value || "—"}</b></p>
                  <p>Правильный ответ: <b>{question.correctLabel}</b></p>
                  <p className="solution">{question.solution}</p>
                </article>
              );
            })}
          </div>
        </details>
        <section className="final-cta">
          <div><p className="kicker">Следующий шаг</p><h2>Хочешь подготовиться к 7 классу без стресса?</h2><p>{copy.card}</p></div>
          <div className="cta-actions">
            <a className="button primary" href={TELEGRAM_URL} target="_blank" rel="noreferrer">{copy.cta}</a>
            <button className="button secondary" onClick={restart}>Пройти тест ещё раз</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="home-page">
      <header className="site-header">
        <a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a>
        <button className="header-cta" onClick={() => setScreen("test")}>Начать диагностику</button>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <div className="soft-pill">Диагностика перед алгеброй</div>
          <h1>Что повторить<br />перед <em>7 классом?</em></h1>
          <p className="hero-lead">Пройди диагностику и узнай, насколько ты готов к алгебре 7 класса и какие темы стоит освежить перед началом учебного года.</p>
          <div className="calm-note"><span>♡</span><p>Это не контрольная и не экзамен. Здесь нет школьных оценок — только понятный результат и рекомендации.</p></div>
          <div className="hero-actions">
            <button className="button primary big" onClick={() => setScreen("test")}>Начать диагностику <span>→</span></button>
            <p><b>25 заданий</b><span>·</span> около 25–30 минут <span>·</span> результат сразу</p>
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
          <article className="step-card violet"><span>01</span><h3>Решаешь задания</h3><p>Проверяешь навыки, на которых строятся алгебра и геометрия 7 класса.</p></article>
          <article className="step-card blue"><span>02</span><h3>Можно честно не знать</h3><p>Отмечаешь незнакомые способы решения — без случайных догадок.</p></article>
          <article className="step-card pink"><span>03</span><h3>Получаешь маршрут</h3><p>Видишь сильные темы и то, что стоит повторить подробнее.</p></article>
        </div>
        <div className="tip"><span>✦</span><p><b>Главное — честный результат.</b> Он нужен не для оценки, а чтобы не повторять весь учебник подряд.</p></div>
      </section>
      <section className="class-section">
        <div className="section-heading"><div><p className="kicker">Другие диагностики</p><h2>Выбери свой класс</h2></div></div>
        <div className="class-grid compact-class-grid">
          <a className="class-card active" href="/"><span>Доступно сейчас</span><b>Перехожу в 6 класс</b><i>Программа 5 класса →</i></a>
          <button className="class-card active" onClick={() => setScreen("test")}><span>Доступно сейчас</span><b>Перехожу в 7 класс</b><i>Программа 6 класса →</i></button>
          <a className="class-card active grade-eight-card" href="/8"><span>Доступно сейчас</span><b>Перехожу в 8 класс</b><i>Программа 7 класса →</i></a>
          <a className="class-card active" href="/9"><span>Доступно сейчас</span><b>Перехожу в 9 класс</b><i>Программа 8 класса →</i></a>
        </div>
      </section>
      <footer><div className="brand"><span className="brand-mark">∿</span><span>Математика без стресса</span></div><p>Проверяем знания, а не ставим оценки ♡</p></footer>
    </main>
  );
}
