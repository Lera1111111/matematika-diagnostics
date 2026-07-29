"use client";

import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    katex?: {
      render: (
        expression: string,
        element: HTMLElement,
        options?: { displayMode?: boolean; throwOnError?: boolean },
      ) => void;
    };
  }
}

type Part = "Алгебра и начала анализа" | "Стереометрия";
type FieldType = "text" | "single" | "vector";
type DiagramKind = "tetrahedron" | "plane-perpendicular" | "triangular-prism";

type AnswerField = {
  id: string;
  prompt?: string;
  type: FieldType;
  options?: string[];
  correct?: string;
  acceptedNumbers?: number[];
  vector?: [number, number, number];
  note?: string;
};

type Question = {
  id: number;
  sectionId: string;
  part: Part;
  block: string;
  eyebrow: string;
  prompt: string;
  expression?: string;
  diagram?: DiagramKind;
  note?: string;
  fields: AnswerField[];
};

type Section = {
  id: string;
  title: string;
  part: Part;
  estimatedMinutes: number;
  questions: Question[];
};

type StoredFieldAnswer = {
  value: string;
  dontKnow: boolean;
};

type StoredAnswers = Record<number, Record<string, StoredFieldAnswer>>;

type SectionResult = {
  id: string;
  name: string;
  correct: number;
  total: number;
  unknown: number;
  percent: number;
  status: "good" | "repeat" | "priority";
};

const TELEGRAM_USERNAME = "vxoab";
const STORAGE_KEY = "math-diagnostic-before-11-v1";

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

function numberIsCorrect(value: string, acceptedNumbers: number[]) {
  const parsed = asNumber(value);
  return parsed !== null && acceptedNumbers.some((item) => Math.abs(item - parsed) < 1e-9);
}

function parseVector(value: string): number[] | null {
  const parts = value
    .replace(/[()\[\]]/g, "")
    .split(/[;,\s]+/)
    .filter(Boolean)
    .map((item) => asNumber(item));

  if (parts.length !== 3 || parts.some((item) => item === null)) return null;
  return parts as number[];
}

function fieldIsCorrect(field: AnswerField, answer?: StoredFieldAnswer) {
  if (!answer || answer.dontKnow || !answer.value.trim()) return false;

  if (field.type === "text") {
    if (!field.acceptedNumbers?.length) return false;
    return numberIsCorrect(answer.value, field.acceptedNumbers);
  }

  if (field.type === "vector") {
    const parsed = parseVector(answer.value);
    return Boolean(
      parsed && field.vector && parsed.every((item, index) => item === field.vector?.[index]),
    );
  }

  return normalize(answer.value) === normalize(field.correct || "");
}

function getCorrectAnswer(field: AnswerField) {
  if (field.type === "vector" && field.vector) return `(${field.vector.join("; ")})`;
  if (field.correct) return field.correct;
  if (field.acceptedNumbers?.length) return String(field.acceptedNumbers[0]).replace(".", ",");
  return "—";
}

const sections: Section[] = [
  {
    id: "real-powers",
    title: "Действительные числа и степени",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 2,
    questions: [
      {
        id: 1,
        sectionId: "real-powers",
        part: "Алгебра и начала анализа",
        block: "Действительные числа и степени",
        eyebrow: "Степени с рациональным показателем",
        prompt: "Найдите значение выражения.",
        expression: String.raw`\frac{27^{\frac23}\cdot16^{\frac34}}8`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [9] }],
      },
    ],
  },
  {
    id: "irrational-equations",
    title: "Иррациональные уравнения",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 2,
        sectionId: "irrational-equations",
        part: "Алгебра и начала анализа",
        block: "Иррациональные уравнения",
        eyebrow: "Уравнение с квадратным корнем",
        prompt: "Решите уравнение.",
        expression: String.raw`\sqrt{x+5}=x-1`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [4] }],
      },
      {
        id: 3,
        sectionId: "irrational-equations",
        part: "Алгебра и начала анализа",
        block: "Иррациональные уравнения",
        eyebrow: "Уравнение с квадратным корнем",
        prompt: "Решите уравнение.",
        expression: String.raw`\sqrt{2x+3}=x`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [3] }],
      },
    ],
  },
  {
    id: "exponential",
    title: "Показательная функция",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 4,
        sectionId: "exponential",
        part: "Алгебра и начала анализа",
        block: "Показательная функция",
        eyebrow: "Показательное уравнение",
        prompt: "Решите уравнение.",
        expression: String.raw`3^{2x-1}=27`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [2] }],
      },
      {
        id: 5,
        sectionId: "exponential",
        part: "Алгебра и начала анализа",
        block: "Показательная функция",
        eyebrow: "Показательное неравенство",
        prompt: "Выберите множество решений неравенства.",
        expression: String.raw`\left(\frac12\right)^{x-3}>4`,
        fields: [
          {
            id: "answer",
            type: "single",
            options: ["x < 1", "x > 1", "x < −1", "x > 5"],
            correct: "x < 1",
          },
        ],
      },
    ],
  },
  {
    id: "log-properties",
    title: "Логарифмы и их свойства",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 6,
        sectionId: "log-properties",
        part: "Алгебра и начала анализа",
        block: "Логарифмы и их свойства",
        eyebrow: "Вычисление логарифмов",
        prompt: "Найдите значение выражения.",
        expression: String.raw`\log_2 32+\log_3\frac19`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [3] }],
      },
      {
        id: 7,
        sectionId: "log-properties",
        part: "Алгебра и начала анализа",
        block: "Логарифмы и их свойства",
        eyebrow: "Свойства логарифмов",
        prompt: "Найдите значение выражения.",
        expression: String.raw`\log_2 12-\log_2 3`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [2] }],
      },
    ],
  },
  {
    id: "log-equations",
    title: "Логарифмические уравнения",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 8,
        sectionId: "log-equations",
        part: "Алгебра и начала анализа",
        block: "Логарифмические уравнения",
        eyebrow: "Простейшее логарифмическое уравнение",
        prompt: "Решите уравнение.",
        expression: String.raw`\log_2(x-1)=3`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [9] }],
      },
      {
        id: 9,
        sectionId: "log-equations",
        part: "Алгебра и начала анализа",
        block: "Логарифмические уравнения",
        eyebrow: "Сумма логарифмов",
        prompt: "Решите уравнение.",
        expression: String.raw`\log_2(x-1)+\log_2(x-3)=3`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [5] }],
      },
    ],
  },
  {
    id: "trig-formulas",
    title: "Тригонометрические формулы",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 10,
        sectionId: "trig-formulas",
        part: "Алгебра и начала анализа",
        block: "Тригонометрические формулы",
        eyebrow: "Значения тригонометрических функций",
        prompt: "Найдите значение выражения.",
        expression: String.raw`\sin\frac{5\pi}{6}+\cos\pi`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [-0.5] }],
      },
      {
        id: 11,
        sectionId: "trig-formulas",
        part: "Алгебра и начала анализа",
        block: "Тригонометрические формулы",
        eyebrow: "Формула половинного угла",
        prompt: "Выберите выражение, тождественно равное данному.",
        expression: String.raw`\frac{1-\cos2x}{2}`,
        fields: [
          {
            id: "answer",
            type: "single",
            options: ["sin²x", "cos²x", "2sin²x", "1 − sin²x"],
            correct: "sin²x",
          },
        ],
      },
    ],
  },
  {
    id: "trig-equations",
    title: "Тригонометрические уравнения",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 12,
        sectionId: "trig-equations",
        part: "Алгебра и начала анализа",
        block: "Тригонометрические уравнения",
        eyebrow: "Составное задание",
        prompt: "Решите уравнение и выполните оба пункта.",
        expression: String.raw`2\sin x=1`,
        fields: [
          {
            id: "a",
            prompt: "а) Выберите правильную запись общего решения.",
            type: "single",
            options: [
              "x = π/6 + 2πn или x = 5π/6 + 2πn, n ∈ Z",
              "x = π/6 + πn, n ∈ Z",
              "x = −π/6 + 2πn или x = 7π/6 + 2πn, n ∈ Z",
              "x = 5π/6 + πn, n ∈ Z",
            ],
            correct: "x = π/6 + 2πn или x = 5π/6 + 2πn, n ∈ Z",
          },
          {
            id: "b",
            prompt: "б) Выберите корни на отрезке [0; 2π].",
            type: "single",
            options: [
              "π/6 и 5π/6",
              "π/6 и 7π/6",
              "5π/6 и 11π/6",
              "π/6, 5π/6 и 2π",
            ],
            correct: "π/6 и 5π/6",
          },
        ],
      },
    ],
  },
  {
    id: "derivative",
    title: "Производная",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 13,
        sectionId: "derivative",
        part: "Алгебра и начала анализа",
        block: "Производная",
        eyebrow: "Нахождение производной",
        prompt: "Выберите производную функции.",
        expression: String.raw`f(x)=3x^4-5x^2+7`,
        fields: [
          {
            id: "answer",
            type: "single",
            options: ["12x³ − 10x", "12x³ − 5x", "3x³ − 10x", "12x⁴ − 10x²"],
            correct: "12x³ − 10x",
          },
        ],
      },
      {
        id: 14,
        sectionId: "derivative",
        part: "Алгебра и начала анализа",
        block: "Производная",
        eyebrow: "Угловой коэффициент касательной",
        prompt: "Найдите угловой коэффициент касательной в точке с абсциссой x₀ = 3.",
        expression: String.raw`f(x)=x^2-4x`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [2] }],
      },
    ],
  },
  {
    id: "function-analysis",
    title: "Исследование функции с помощью производной",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 15,
        sectionId: "function-analysis",
        part: "Алгебра и начала анализа",
        block: "Исследование функции с помощью производной",
        eyebrow: "Составное задание",
        prompt: "Исследуйте функцию и выполните оба пункта.",
        expression: String.raw`f(x)=x^2-6x+8`,
        fields: [
          {
            id: "a",
            prompt: "а) Найдите точку минимума функции.",
            type: "text",
            acceptedNumbers: [3],
            note: "В школьной формулировке укажите значение x.",
          },
          {
            id: "b",
            prompt: "б) Найдите наибольшее значение функции на отрезке [0; 5].",
            type: "text",
            acceptedNumbers: [8],
          },
        ],
      },
    ],
  },
  {
    id: "integral",
    title: "Интеграл",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 16,
        sectionId: "integral",
        part: "Алгебра и начала анализа",
        block: "Интеграл",
        eyebrow: "Первообразная",
        prompt: "Выберите общий вид первообразных функции.",
        expression: String.raw`f(x)=6x^2-4`,
        fields: [
          {
            id: "answer",
            type: "single",
            options: ["2x³ − 4x + C", "18x − 4 + C", "2x³ − 4 + C", "3x² − 4x + C"],
            correct: "2x³ − 4x + C",
          },
        ],
      },
      {
        id: 17,
        sectionId: "integral",
        part: "Алгебра и начала анализа",
        block: "Интеграл",
        eyebrow: "Определённый интеграл",
        prompt: "Вычислите интеграл.",
        expression: String.raw`\int_0^2(3x+1)\,dx`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [8] }],
      },
    ],
  },
  {
    id: "combinatorics",
    title: "Комбинаторика",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 18,
        sectionId: "combinatorics",
        part: "Алгебра и начала анализа",
        block: "Комбинаторика",
        eyebrow: "Размещения без повторений",
        prompt: "Сколько трёхзначных чисел можно составить из цифр 1, 2, 3, 4 без повторений?",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [24] }],
      },
      {
        id: 19,
        sectionId: "combinatorics",
        part: "Алгебра и начала анализа",
        block: "Комбинаторика",
        eyebrow: "Сочетания",
        prompt: "Сколькими способами можно выбрать двух дежурных из 8 учеников?",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [28] }],
      },
    ],
  },
  {
    id: "probability-statistics",
    title: "Вероятность и статистика",
    part: "Алгебра и начала анализа",
    estimatedMinutes: 4,
    questions: [
      {
        id: 20,
        sectionId: "probability-statistics",
        part: "Алгебра и начала анализа",
        block: "Вероятность и статистика",
        eyebrow: "Классическая вероятность",
        prompt: "В мешке 5 белых и 3 чёрных шара. Найдите вероятность выбрать белый шар.",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [0.625] }],
        note: "Можно записать дробью 5/8 или десятичной дробью.",
      },
      {
        id: 21,
        sectionId: "probability-statistics",
        part: "Алгебра и начала анализа",
        block: "Вероятность и статистика",
        eyebrow: "Среднее арифметическое",
        prompt: "Найдите среднее арифметическое чисел 4, 7, 7, 8, 9.",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [7] }],
      },
    ],
  },
  {
    id: "stereo-basics",
    title: "Основы стереометрии",
    part: "Стереометрия",
    estimatedMinutes: 2,
    questions: [
      {
        id: 22,
        sectionId: "stereo-basics",
        part: "Стереометрия",
        block: "Основы стереометрии",
        eyebrow: "Аксиомы стереометрии",
        prompt: "Через две пересекающиеся прямые можно провести...",
        fields: [
          {
            id: "answer",
            type: "single",
            options: [
              "ровно одну плоскость",
              "ровно две плоскости",
              "бесконечно много плоскостей",
              "ни одной плоскости",
            ],
            correct: "ровно одну плоскость",
          },
        ],
      },
    ],
  },
  {
    id: "parallelism",
    title: "Параллельность в пространстве",
    part: "Стереометрия",
    estimatedMinutes: 5,
    questions: [
      {
        id: 23,
        sectionId: "parallelism",
        part: "Стереометрия",
        block: "Параллельность в пространстве",
        eyebrow: "Средняя линия треугольника в пространственной фигуре",
        prompt: "В тетраэдре ABCD точки M и N — середины рёбер AB и AC.",
        diagram: "tetrahedron",
        fields: [
          {
            id: "a",
            prompt: "а) Как расположены MN и BC?",
            type: "single",
            options: ["MN ∥ BC", "MN ⟂ BC", "MN и BC скрещиваются", "MN и BC пересекаются"],
            correct: "MN ∥ BC",
          },
          {
            id: "b",
            prompt: "б) Если BC = 14, найдите MN.",
            type: "text",
            acceptedNumbers: [7],
          },
        ],
      },
    ],
  },
  {
    id: "perpendicularity",
    title: "Перпендикулярность в пространстве",
    part: "Стереометрия",
    estimatedMinutes: 5,
    questions: [
      {
        id: 24,
        sectionId: "perpendicularity",
        part: "Стереометрия",
        block: "Перпендикулярность в пространстве",
        eyebrow: "Перпендикуляр и наклонная",
        prompt: "Из точки A к плоскости α проведён перпендикуляр AH. Точка B лежит в плоскости α.",
        expression: String.raw`AH\perp\alpha,\qquad AH=6,\qquad AB=10`,
        diagram: "plane-perpendicular",
        fields: [
          { id: "a", prompt: "а) Найдите HB.", type: "text", acceptedNumbers: [8] },
          {
            id: "b",
            prompt: "б) Выберите угол между AB и плоскостью α.",
            type: "single",
            options: ["arcsin 3/5", "arcsin 4/5", "arccos 3/5", "arctan 3/5"],
            correct: "arcsin 3/5",
          },
        ],
      },
    ],
  },
  {
    id: "polyhedra",
    title: "Многогранники",
    part: "Стереометрия",
    estimatedMinutes: 5,
    questions: [
      {
        id: 25,
        sectionId: "polyhedra",
        part: "Стереометрия",
        block: "Многогранники",
        eyebrow: "Элементы призмы",
        prompt: "Сколько граней у треугольной призмы?",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [5] }],
      },
      {
        id: 26,
        sectionId: "polyhedra",
        part: "Стереометрия",
        block: "Многогранники",
        eyebrow: "Площадь боковой поверхности призмы",
        prompt: "Основание прямой призмы — прямоугольный треугольник с катетами 3 и 4. Высота призмы равна 6. Найдите площадь боковой поверхности.",
        diagram: "triangular-prism",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [72] }],
      },
    ],
  },
  {
    id: "round-bodies",
    title: "Цилиндр, конус и шар",
    part: "Стереометрия",
    estimatedMinutes: 4,
    questions: [
      {
        id: 27,
        sectionId: "round-bodies",
        part: "Стереометрия",
        block: "Цилиндр, конус и шар",
        eyebrow: "Площадь боковой поверхности цилиндра",
        prompt: "Радиус основания цилиндра равен 3, высота равна 5. Найдите площадь боковой поверхности.",
        expression: String.raw`r=3,\qquad h=5`,
        note: "В ответ запишите число без π.",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [30] }],
      },
      {
        id: 28,
        sectionId: "round-bodies",
        part: "Стереометрия",
        block: "Цилиндр, конус и шар",
        eyebrow: "Площадь поверхности шара",
        prompt: "Радиус шара равен 3. Найдите площадь его поверхности.",
        expression: String.raw`r=3`,
        note: "В ответ запишите число без π.",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [36] }],
      },
    ],
  },
  {
    id: "volumes",
    title: "Объёмы тел",
    part: "Стереометрия",
    estimatedMinutes: 4,
    questions: [
      {
        id: 29,
        sectionId: "volumes",
        part: "Стереометрия",
        block: "Объёмы тел",
        eyebrow: "Объём прямоугольного параллелепипеда",
        prompt: "Измерения прямоугольного параллелепипеда равны 3, 4 и 5. Найдите объём.",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [60] }],
      },
      {
        id: 30,
        sectionId: "volumes",
        part: "Стереометрия",
        block: "Объёмы тел",
        eyebrow: "Объём конуса",
        prompt: "Радиус основания конуса равен 3, высота равна 4. Найдите объём.",
        expression: String.raw`r=3,\qquad h=4`,
        note: "В ответ запишите число без π.",
        fields: [{ id: "answer", type: "text", acceptedNumbers: [12] }],
      },
    ],
  },
  {
    id: "vectors-coordinates",
    title: "Векторы и координаты в пространстве",
    part: "Стереометрия",
    estimatedMinutes: 4,
    questions: [
      {
        id: 31,
        sectionId: "vectors-coordinates",
        part: "Стереометрия",
        block: "Векторы и координаты в пространстве",
        eyebrow: "Сложение векторов",
        prompt: "Найдите координаты вектора a + b.",
        expression: String.raw`\vec a=(2;-1;3),\qquad \vec b=(-1;4;2)`,
        fields: [{ id: "answer", type: "vector", vector: [1, 3, 5], note: "Например: 1; 3; 5" }],
      },
      {
        id: 32,
        sectionId: "vectors-coordinates",
        part: "Стереометрия",
        block: "Векторы и координаты в пространстве",
        eyebrow: "Расстояние между точками",
        prompt: "Найдите расстояние между точками A и B.",
        expression: String.raw`A(1;2;3),\qquad B(4;6;3)`,
        fields: [{ id: "answer", type: "text", acceptedNumbers: [5] }],
      },
    ],
  },
];

function MathFormula({ expression, displayMode = true }: { expression: string; displayMode?: boolean }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;
    const renderFormula = () => {
      if (!window.katex) return false;
      window.katex.render(expression, element, { displayMode, throwOnError: false });
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

function Diagram({ kind }: { kind: DiagramKind }) {
  return (
    <div className="geometry-diagram grade-eleven-diagram">
      <svg viewBox="0 0 440 280" role="img" aria-label="Схема к заданию">
        {kind === "tetrahedron" && (
          <>
            <path d="M220 32 L72 224 L360 224 Z" />
            <path d="M220 32 L286 132 L72 224 M286 132 L360 224" className="diagram-dashed" />
            <line x1="146" y1="128" x2="290" y2="128" className="diagram-highlight" />
            <circle cx="146" cy="128" r="5" /><circle cx="290" cy="128" r="5" />
            <text x="214" y="24">A</text><text x="55" y="243">B</text><text x="365" y="243">C</text><text x="292" y="128">D</text>
            <text x="130" y="120">M</text><text x="298" y="120">N</text>
          </>
        )}
        {kind === "plane-perpendicular" && (
          <>
            <polygon points="65,190 305,235 390,120 150,78" className="plane-shape" />
            <line x1="220" y1="30" x2="220" y2="166" className="diagram-highlight" />
            <line x1="220" y1="30" x2="334" y2="169" />
            <line x1="220" y1="166" x2="334" y2="169" />
            <path d="M220 147 h18 v18" className="marker" />
            <text x="210" y="22">A</text><text x="208" y="185">H</text><text x="340" y="170">B</text><text x="88" y="203">α</text>
            <text x="184" y="101" className="value-label">6</text><text x="280" y="87" className="value-label">10</text>
          </>
        )}
        {kind === "triangular-prism" && (
          <>
            <polygon points="90,210 90,85 205,210" />
            <polygon points="230,165 230,40 345,165" />
            <line x1="90" y1="210" x2="230" y2="165" />
            <line x1="90" y1="85" x2="230" y2="40" />
            <line x1="205" y1="210" x2="345" y2="165" />
            <path d="M90 190 h20 v20" className="marker" />
            <text x="60" y="150" className="value-label">3</text><text x="140" y="233" className="value-label">4</text><text x="158" y="124" className="value-label">6</text>
          </>
        )}
      </svg>
    </div>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] || character);
}

function emptyFieldAnswer(): StoredFieldAnswer {
  return { value: "", dontKnow: false };
}

export default function GradeElevenDiagnostic() {
  const [screen, setScreen] = useState<"home" | "test" | "review" | "result">("home");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<StoredAnswers>({});
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [copyFallback, setCopyFallback] = useState("");

  const activeSections = useMemo(
    () => sections.filter((section) => selectedSections.includes(section.id)),
    [selectedSections],
  );

  const activeQuestions = useMemo(
    () => activeSections.flatMap((section) => section.questions),
    [activeSections],
  );

  const estimatedMinutes = activeSections.reduce((sum, section) => sum + section.estimatedMinutes, 0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (["home", "test", "review"].includes(parsed.screen)) setScreen(parsed.screen);
        setName(parsed.name || "");
        setAccepted(Boolean(parsed.accepted));
        setSelectedSections(Array.isArray(parsed.selectedSections) ? parsed.selectedSections : []);
        setAnswers(parsed.answers || {});
        setCurrent(Math.max(parsed.current || 0, 0));
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
      JSON.stringify({ screen, name, accepted, selectedSections, answers, current }),
    );
  }, [screen, name, accepted, selectedSections, answers, current, hydrated]);

  useEffect(() => {
    if (!activeQuestions.length) {
      setCurrent(0);
      return;
    }
    setCurrent((value) => Math.min(value, activeQuestions.length - 1));
  }, [activeQuestions.length]);

  const fieldAnswer = (questionId: number, fieldId: string) =>
    answers[questionId]?.[fieldId] || emptyFieldAnswer();

  const questionStatus = (question: Question) => {
    const states = question.fields.map((field) => fieldAnswer(question.id, field.id));
    const completed = states.filter((answer) => answer.dontKnow || answer.value.trim()).length;

    if (completed === 0) return "unanswered";
    if (completed < question.fields.length) return "partial";
    if (states.every((answer) => answer.dontKnow)) return "dont_know";
    return "answered";
  };

  const fieldStatus = (question: Question, field: AnswerField) => {
    const answer = fieldAnswer(question.id, field.id);
    if (!answer.dontKnow && !answer.value.trim()) return "unanswered";
    if (answer.dontKnow) return "dont_know";
    return fieldIsCorrect(field, answer) ? "correct" : "incorrect";
  };

  const allFields = useMemo(
    () => activeQuestions.flatMap((question) => question.fields.map((field) => ({ question, field }))),
    [activeQuestions],
  );

  const score = allFields.filter(({ question, field }) => fieldIsCorrect(field, fieldAnswer(question.id, field.id))).length;
  const incorrectCount = allFields.filter(({ question, field }) => fieldStatus(question, field) === "incorrect").length;
  const dontKnowCount = allFields.filter(({ question, field }) => fieldStatus(question, field) === "dont_know").length;
  const unansweredFields = allFields.filter(({ question, field }) => fieldStatus(question, field) === "unanswered");

  const sectionResults = useMemo<SectionResult[]>(
    () => activeSections.map((section) => {
      const fields = section.questions.flatMap((question) => question.fields.map((field) => ({ question, field })));
      const correct = fields.filter(({ question, field }) => fieldIsCorrect(field, fieldAnswer(question.id, field.id))).length;
      const unknown = fields.filter(({ question, field }) => fieldAnswer(question.id, field.id).dontKnow).length;
      const percent = Math.round((correct / fields.length) * 100);
      return {
        id: section.id,
        name: section.title,
        correct,
        total: fields.length,
        unknown,
        percent,
        status: percent >= 80 ? "good" : percent >= 50 ? "repeat" : "priority",
      };
    }),
    [activeSections, answers],
  );

  const start = () => {
    if (!name.trim() || !accepted || !selectedSections.length) return;
    setCurrent(0);
    setScreen("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    if (!window.confirm("Начать диагностику заново? Имя, выбранные темы и ответы будут удалены.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setName("");
    setAccepted(false);
    setSelectedSections([]);
    setAnswers({});
    setCurrent(0);
    setScreen("home");
    setCopyState("");
    setCopyFallback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateFieldAnswer = (questionId: number, fieldId: string, next: StoredFieldAnswer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: {
        ...(previous[questionId] || {}),
        [fieldId]: next,
      },
    }));
  };

  const resultText = () => {
    const grouped = (status: SectionResult["status"]) => sectionResults.filter((item) => item.status === status);
    const list = (title: string, items: SectionResult[]) =>
      items.length ? `${title}:\n${items.map((item) => `— ${item.name}`).join("\n")}` : "";

    return [
      "Диагностика «Что повторить перед 11 классом?»",
      `Имя: ${name.trim() || "не указано"}`,
      `Выбранные разделы: ${activeSections.map((section) => section.title).join(", ")}`,
      "Оценивались только разделы, выбранные перед началом диагностики.",
      `Результат: ${score} из ${allFields.length}`,
      `Ошибок: ${incorrectCount}`,
      `Отмечено «Не знаю»: ${dontKnowCount}`,
      list("С этим всё хорошо", grouped("good")),
      list("Стоит немного повторить", grouped("repeat")),
      list("Нужно повторить в первую очередь", grouped("priority")),
      `Работа выполнена: ${new Date().toLocaleString("ru-RU")}`,
    ].filter(Boolean).join("\n\n");
  };

  const copyResult = async (message = "Результат скопирован") => {
    try {
      await navigator.clipboard.writeText(resultText());
      setCopyState(message);
      setCopyFallback("");
    } catch {
      setCopyState("Не получилось скопировать автоматически");
      setCopyFallback(resultText());
    }
    window.setTimeout(() => setCopyState(""), 3000);
  };

  const downloadResult = () => {
    const rows = activeQuestions.flatMap((question, questionIndex) =>
      question.fields.map((field) => {
        const answer = fieldAnswer(question.id, field.id);
        const status = fieldStatus(question, field);
        return `<tr>
          <td>${questionIndex + 1}${question.fields.length > 1 ? field.id : ""}</td>
          <td>${escapeHtml(question.block)}</td>
          <td>${escapeHtml(answer.dontKnow ? "Не знаю, как решить" : answer.value || "Нет ответа")}</td>
          <td>${escapeHtml(getCorrectAnswer(field))}</td>
          <td>${escapeHtml(status === "correct" ? "Правильно" : status === "incorrect" ? "Неправильно" : status === "dont_know" ? "Не знаю" : "Нет ответа")}</td>
        </tr>`;
      }),
    ).join("");

    const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Результат диагностики</title>
<style>body{font-family:Arial,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;color:#28222c}h1{color:#674fa6}pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}@media print{button{display:none}}</style>
<body><h1>Что повторить перед 11 классом?</h1><pre>${escapeHtml(resultText())}</pre><h2>Все задания</h2><table><tr><th>№</th><th>Раздел</th><th>Ответ ученика</th><th>Правильный ответ</th><th>Статус</th></tr>${rows}</table><button onclick="window.print()">Печать / сохранить как PDF</button></body></html>`;

    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Перед_11_классом_${name.trim().replace(/\s+/g, "_") || "ученик"}.html`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSections((previous) =>
      previous.includes(sectionId)
        ? previous.filter((item) => item !== sectionId)
        : [...previous, sectionId],
    );
  };

  const togglePart = (part: Part, selectAll: boolean) => {
    const ids = sections.filter((section) => section.part === part).map((section) => section.id);
    setSelectedSections((previous) =>
      selectAll ? Array.from(new Set([...previous, ...ids])) : previous.filter((item) => !ids.includes(item)),
    );
  };

  if (screen === "test" && activeQuestions.length) {
    const question = activeQuestions[current];
    const complete = question.fields.every((field) => {
      const answer = fieldAnswer(question.id, field.id);
      return answer.dontKnow || Boolean(answer.value.trim());
    });

    const goNext = () => {
      if (!complete) return;
      if (current === activeQuestions.length - 1) setScreen("review");
      else setCurrent((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
      <main className="test-shell grade-eleven-page">
        <header className="compact-header">
          <a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a>
          <button className="text-button" onClick={restart}>Начать сначала</button>
        </header>

        <section className="test-wrap">
          <div className="progress-line">
            <div><span>Задание {current + 1} из {activeQuestions.length}</span><small>{activeQuestions.filter((item) => questionStatus(item) !== "unanswered").length} ответов сохранено</small></div>
            <strong>{Math.round(((current + 1) / activeQuestions.length) * 100)}%</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${((current + 1) / activeQuestions.length) * 100}%` }} /></div>

          <nav className="question-number-nav" aria-label="Переход по заданиям">
            {activeQuestions.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={`${questionStatus(item) === "dont_know" ? "unknown" : questionStatus(item) === "unanswered" ? "empty" : questionStatus(item) === "partial" ? "partial" : "answered"} ${index === current ? "current" : ""}`}
                onClick={() => { setCurrent(index); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >{index + 1}</button>
            ))}
          </nav>

          <article className="question-card grade-eleven-question">
            <div className="question-meta"><span>{question.part}</span><span>{question.block}</span></div>
            <p className="question-eyebrow">{question.eyebrow}</p>
            <h1>{question.prompt}</h1>
            {question.expression && <div className="expression"><MathFormula expression={question.expression} /></div>}
            {question.diagram && <Diagram kind={question.diagram} />}
            {question.note && <p className="diagram-note">{question.note}</p>}

            <div className="compound-fields">
              {question.fields.map((field) => {
                const stored = fieldAnswer(question.id, field.id);
                return (
                  <section className="compound-field" key={field.id}>
                    {field.prompt && <h2>{field.prompt}</h2>}

                    {(field.type === "text" || field.type === "vector") && (
                      <label className="answer-field">
                        <span>Твой ответ</span>
                        <input
                          inputMode={field.type === "text" ? "decimal" : "text"}
                          value={stored.dontKnow ? "" : stored.value}
                          placeholder={field.type === "vector" ? "Например: 1; 3; 5" : "Введи ответ"}
                          onChange={(event) => updateFieldAnswer(question.id, field.id, { value: event.target.value, dontKnow: false })}
                        />
                        {field.note && <small>{field.note}</small>}
                      </label>
                    )}

                    {field.type === "single" && (
                      <div className="options semantic-options" role="radiogroup">
                        {field.options?.map((option) => (
                          <label className={`option ${!stored.dontKnow && stored.value === option ? "selected" : ""}`} key={option}>
                            <input
                              type="radio"
                              name={`question-${question.id}-${field.id}`}
                              checked={!stored.dontKnow && stored.value === option}
                              onChange={() => updateFieldAnswer(question.id, field.id, { value: option, dontKnow: false })}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className={`button dont-know-button field-dont-know ${stored.dontKnow ? "active-dont-know" : ""}`}
                      onClick={() => updateFieldAnswer(question.id, field.id, { value: "", dontKnow: true })}
                    >{stored.dontKnow ? "Отмечено: не знаю" : "Не знаю, как решить"}</button>
                  </section>
                );
              })}
            </div>

            <div className="test-actions grade-seven-actions">
              <button className="button secondary" disabled={current === 0} onClick={() => { setCurrent((value) => value - 1); window.scrollTo({ top: 0 }); }}>← Назад</button>
              <button className="button primary" disabled={!complete} onClick={goNext}>{current === activeQuestions.length - 1 ? "К обзору" : "Далее"} →</button>
            </div>
          </article>
          <p className="save-note">Имя, выбранные темы, ответы и прогресс сохраняются только в этом браузере</p>
        </section>
      </main>
    );
  }

  if (screen === "review") {
    const finish = () => {
      if (!window.confirm("После завершения изменить ответы будет нельзя. Показать результат?")) return;
      setScreen("result");
      localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0 });
    };

    const markUnansweredUnknown = () => {
      setAnswers((previous) => {
        const next = { ...previous };
        unansweredFields.forEach(({ question, field }) => {
          next[question.id] = { ...(next[question.id] || {}), [field.id]: { value: "", dontKnow: true } };
        });
        return next;
      });
    };

    return (
      <main className="result-page grade-eleven-page review-overview">
        <header className="compact-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header>
        <section className="result-section overview-heading">
          <p className="kicker">Перед результатом</p>
          <h1>Обзор всех {activeQuestions.length} заданий</h1>
          <p>{unansweredFields.length ? `Незаполненных пунктов: ${unansweredFields.length}. Вернись к ним или засчитай как «Не знаю, как решить».` : "Все задания заполнены или отмечены как «Не знаю, как решить»."}</p>
        </section>
        <section className="result-section overview-grid">
          {activeQuestions.map((question, index) => (
            <button
              className={`overview-item ${questionStatus(question) === "dont_know" ? "unknown" : questionStatus(question) === "unanswered" ? "empty" : questionStatus(question) === "partial" ? "partial" : "answered"}`}
              key={question.id}
              onClick={() => { setCurrent(index); setScreen("test"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            ><b>№{index + 1}</b></button>
          ))}
        </section>
        <section className="result-section review-finish">
          {unansweredFields.length > 0 && <button className="button secondary" onClick={markUnansweredUnknown}>Засчитать пропуски как «Не знаю»</button>}
          <button className="button primary" disabled={unansweredFields.length > 0} onClick={finish}>Показать результат</button>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const percent = Math.round((score / allFields.length) * 100);
    const perfect = score === allFields.length;
    const conclusion = perfect
      ? "Во всех выбранных разделах задания выполнены верно. Обязательных тем для повторения не найдено."
      : percent >= 80
        ? "Выбранные темы в целом усвоены уверенно. Достаточно точечно повторить отдельные разделы."
        : percent >= 50
          ? "Многое уже получается. Повторение слабых разделов поможет начать 11 класс спокойнее."
          : "Есть разделы, которые стоит восстановить по порядку. Это не оценка, а маршрут повторения.";

    const telegramMessage = encodeURIComponent(`Здравствуйте! Меня зовут ${name.trim()}. Результат диагностики перед 11 классом — ${score} из ${allFields.length}. Проверялись только выбранные мной разделы. Хочу обсудить план повторения.`);

    return (
      <main className="result-page grade-eleven-page">
        <header className="compact-header result-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Пройти ещё раз</button></header>
        <section className="result-hero">
          <div className="score-orbit"><strong>{score}</strong><span>из {allFields.length}</span></div>
          <div><p className="kicker">Диагностика завершена</p><h1>{name.trim() ? `${name.trim()}, вот твой результат` : "Вот твой результат"}</h1><p>{conclusion}</p><p className="selection-disclaimer">Оценивались только разделы, которые были выбраны перед началом диагностики. Остальные темы в результате не учитывались.</p></div>
        </section>

        <section className="result-section selected-result-sections">
          <p className="kicker">Проверенные разделы</p>
          <div className="topic-tags">{activeSections.map((section) => <span key={section.id}>{section.title}</span>)}</div>
        </section>

        <section className="result-section result-stats grade-eleven-stats">
          <article><strong>{score}/{allFields.length}</strong><span>правильных ответов</span></article>
          <article><strong>{percent}%</strong><span>общий результат</span></article>
          <article><strong>{incorrectCount}</strong><span>с ошибкой</span></article>
          <article><strong>{dontKnowCount}</strong><span>«не знаю»</span></article>
        </section>

        <section className="result-section">
          <div className="section-heading"><div><p className="kicker">По выбранным разделам</p><h2>Что уже получается и что повторить</h2></div></div>
          <div className="block-results grade-eleven-blocks">
            {sectionResults.map((section) => (
              <article className={`block-card ${section.status === "good" ? "great" : section.status === "repeat" ? "medium" : "restore"}`} key={section.id}>
                <div className="block-topline"><span>{section.correct}/{section.total} · {section.percent}%</span><b>{section.status === "good" ? "Тема усвоена" : section.status === "repeat" ? "Стоит немного повторить" : "Нужно повторить"}</b></div>
                <h3>{section.name}</h3><div className="mini-progress"><span style={{ width: `${section.percent}%` }} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="result-section">
          <div className="section-heading"><div><p className="kicker">Все задания</p><h2>Посмотри ответы и статусы</h2></div></div>
          <div className="overview-grid result-overview-grid">
            {activeQuestions.map((question, index) => (
              <details className="overview-item result-answer-item" key={question.id}>
                <summary><b>№{index + 1}</b><span>{question.block}</span></summary>
                <div>
                  {question.fields.map((field) => {
                    const answer = fieldAnswer(question.id, field.id);
                    const status = fieldStatus(question, field);
                    return (
                      <div className={`result-field-line ${status}`} key={field.id}>
                        {field.prompt && <p><b>{field.prompt}</b></p>}
                        <p><b>Твой ответ:</b> {answer.dontKnow ? "Не знаю, как решить" : answer.value || "Нет ответа"}</p>
                        <p><b>Правильный ответ:</b> {getCorrectAnswer(field)}</p>
                        <p><b>Статус:</b> {status === "correct" ? "Правильно" : status === "incorrect" ? "Неправильно" : status === "dont_know" ? "Не знаю" : "Нет ответа"}</p>
                      </div>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <div><p className="kicker">Следующий шаг</p><h2>{perfect ? "Можно двигаться дальше" : "Хочешь составить план повторения?"}</h2><p>{perfect ? "Результат относится только к выбранным разделам. Новые темы можно изучать дальше, периодически возвращаясь к пройденному." : "Разберём только те разделы, в которых диагностика показала пробелы."}</p></div>
          <div className="cta-actions">
            <button className="button secondary" onClick={() => copyResult()}>Скопировать результат</button>
            <button className="button secondary" onClick={downloadResult}>Скачать результат</button>
            <a className="button primary" href={`https://t.me/${TELEGRAM_USERNAME}?text=${telegramMessage}`} target="_blank" rel="noreferrer" onClick={() => copyResult("Результат скопирован. Вставь его в сообщение")}>Обсудить результат</a>
            <button className="button secondary" onClick={restart}>Пройти ещё раз</button>
          </div>
          {copyState && <p className="copy-toast" role="status">{copyState}</p>}
          {copyFallback && <div className="copy-fallback"><textarea readOnly value={copyFallback} /></div>}
        </section>
      </main>
    );
  }

  return (
    <main className="home-page grade-eleven-page">
      <style>{`
        .section-picker{display:grid;gap:18px;margin:24px 0}.section-group{border:1px solid #e7def0;border-radius:22px;padding:20px;background:#fff}.section-group-head{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:14px}.section-group-actions{display:flex;gap:8px;flex-wrap:wrap}.mini-action{border:0;background:#f3edf8;color:#604a91;padding:8px 12px;border-radius:999px;cursor:pointer}.section-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.section-choice{display:flex;gap:10px;align-items:flex-start;border:1px solid #ece5f2;border-radius:14px;padding:12px;cursor:pointer}.section-choice.selected{border-color:#8d6bc2;background:#f7f1fc}.selection-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}.selection-summary span{background:#f5f1f8;border-radius:14px;padding:12px;text-align:center}.compound-fields{display:grid;gap:18px;margin-top:22px}.compound-field{border-top:1px solid #eee3f4;padding-top:18px}.compound-field:first-child{border-top:0;padding-top:0}.compound-field h2{font-size:1.05rem;margin-bottom:12px}.field-dont-know{margin-top:12px}.question-number-nav .partial,.overview-item.partial{background:#efe4fb;color:#6f4aa8;border-color:#b99ad9}.selection-disclaimer{margin-top:12px;font-weight:600}.result-field-line{padding:12px 0;border-top:1px solid #eee}.grade-eleven-diagram svg{width:100%;max-width:520px}.grade-eleven-diagram svg path,.grade-eleven-diagram svg line,.grade-eleven-diagram svg polygon{fill:none;stroke:currentColor;stroke-width:3;stroke-linejoin:round}.grade-eleven-diagram .plane-shape{fill:#f4eef9;stroke:#8064a8}.grade-eleven-diagram .diagram-dashed{stroke-dasharray:8 7}.grade-eleven-diagram .diagram-highlight{stroke:#6a4fa3;stroke-width:5}.grade-eleven-diagram .marker{stroke-width:2}.grade-eleven-diagram text{font-size:18px;fill:currentColor}.grade-eleven-diagram circle{fill:#6a4fa3}.selected-result-sections{margin-top:0}@media(max-width:760px){.section-list{grid-template-columns:1fr}.selection-summary{grid-template-columns:1fr}.section-group-head{align-items:flex-start;flex-direction:column}}
      `}</style>
      <header className="site-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header>
      <section className="hero">
        <div className="hero-copy">
          <div className="soft-pill">Диагностика по изученным темам старшей школы</div>
          <h1>Что повторить<br />перед <em>11 классом?</em></h1>
          <p className="hero-lead">Отметь только те разделы, которые уже проходил(а). Диагностика сформируется по выбранным темам и не будет оценивать материал, которого у тебя ещё не было.</p>

          <div className="name-start-card grade-eleven-start-card">
            <label htmlFor="student-name">Как тебя зовут?</label>
            <input id="student-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Введи имя" autoComplete="given-name" />

            <div className="start-guidance">
              <h2>Перед началом</h2>
              <ul>
                <li>Выбери только те разделы, которые уже изучал(а).</li>
                <li>Решай самостоятельно, без учебника и подсказок.</li>
                <li>Строгого ограничения времени нет.</li>
                <li>Если способ решения незнаком, нажми «Не знаю, как решить».</li>
              </ul>
            </div>

            <div className="section-picker">
              {(["Алгебра и начала анализа", "Стереометрия"] as Part[]).map((part) => {
                const partSections = sections.filter((section) => section.part === part);
                const allSelected = partSections.every((section) => selectedSections.includes(section.id));
                return (
                  <section className="section-group" key={part}>
                    <div className="section-group-head">
                      <h2>{part}</h2>
                      <div className="section-group-actions">
                        <button type="button" className="mini-action" onClick={() => togglePart(part, !allSelected)}>{allSelected ? "Снять выбор" : "Выбрать все"}</button>
                      </div>
                    </div>
                    <div className="section-list">
                      {partSections.map((section) => {
                        const selected = selectedSections.includes(section.id);
                        return (
                          <label className={`section-choice ${selected ? "selected" : ""}`} key={section.id}>
                            <input type="checkbox" checked={selected} onChange={() => toggleSection(section.id)} />
                            <span>{section.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="selection-summary">
              <span><b>{selectedSections.length}</b><br />разделов выбрано</span>
              <span><b>{activeQuestions.length}</b><br />заданий</span>
              <span><b>{estimatedMinutes || 0}</b><br />минут примерно</span>
            </div>

            <label className="consent-check">
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
              <span>Я выбрал(а) только изученные разделы и прочитал(а) рекомендации</span>
            </label>

            <button className="button primary big" onClick={start} disabled={!name.trim() || !accepted || !selectedSections.length}>Начать диагностику <span>→</span></button>
            {!selectedSections.length && <p className="name-start-meta">Выбери хотя бы один изученный раздел</p>}
          </div>

          <div className="calm-note"><span>♡</span><p>Это не оценка за всю программу 10 класса. В результате учитываются только выбранные разделы.</p></div>
          <p className="privacy-note">Без регистрации. Имя, выбор тем и ответы остаются только в браузере на этом устройстве.</p>
        </div>
      </section>
      <footer><div className="brand"><span className="brand-mark">∿</span><span>Математика без стресса</span></div><p>Проверяем знания, а не ставим оценки ♡</p></footer>
    </main>
  );
}
