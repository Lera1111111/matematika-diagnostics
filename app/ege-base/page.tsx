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

type GroupId = "practice" | "data" | "geometry" | "algebra";
type QuestionKind = "plain" | "table-results" | "table-suppliers" | "pulse" | "logic" | "open-cube" | "triangle" | "prism" | "inequalities";

type Question = {
  id: number;
  examNumber: number;
  group: GroupId;
  groupLabel: string;
  topic: string;
  prompt: string;
  kind?: QuestionKind;
  expression?: string;
  answer: number | string;
  numeric?: boolean;
};

type StoredAnswer = {
  value: string;
  dontKnow: boolean;
};

type Answers = Record<number, StoredAnswer>;

type GroupResult = {
  id: GroupId;
  label: string;
  correct: number;
  total: number;
  percent: number;
  status: "good" | "repeat" | "priority";
};

const TELEGRAM_USERNAME = "vxoab";
const STORAGE_KEY = "math-diagnostic-ege-base-v1";

const groups: { id: GroupId; label: string }[] = [
  { id: "practice", label: "Практические задачи" },
  { id: "data", label: "Данные, вероятность и логика" },
  { id: "geometry", label: "Геометрия" },
  { id: "algebra", label: "Алгебра" },
];

const questions: Question[] = [
  {
    id: 1,
    examNumber: 1,
    group: "practice",
    groupLabel: "Практические задачи",
    topic: "Практические вычисления",
    prompt:
      "На счёте Машиного мобильного телефона было 74 рубля, а после разговора с Леной осталось 18 рублей. Известно, что разговор длился целое число минут, а одна минута разговора стоит 3 рубля 50 копеек. Сколько минут длился разговор с Леной?",
    answer: 16,
    numeric: true,
  },
  {
    id: 2,
    examNumber: 3,
    group: "data",
    groupLabel: "Данные, вероятность и логика",
    topic: "Работа с таблицей",
    prompt:
      "Итоговый результат команды равен сумме баллов за три тура. Какое место заняла команда «Альфа», если большее количество баллов соответствует более высокому месту?",
    kind: "table-results",
    answer: 3,
    numeric: true,
  },
  {
    id: 3,
    examNumber: 5,
    group: "data",
    groupLabel: "Данные, вероятность и логика",
    topic: "Вероятность",
    prompt:
      "На конференции выступают 20 участников: 6 из России, 5 из Беларуси и 9 из других стран. Порядок выступлений определяется случайно. Найдите вероятность того, что первым выступит участник из Беларуси.",
    answer: 0.25,
    numeric: true,
  },
  {
    id: 4,
    examNumber: 6,
    group: "practice",
    groupLabel: "Практические задачи",
    topic: "Работа с таблицей и условиями",
    prompt:
      "Строительная фирма планирует купить 70 м³ пеноблоков у одного из трёх поставщиков. Цены и условия доставки приведены в таблице. Сколько рублей нужно заплатить за самую дешёвую покупку с доставкой?",
    kind: "table-suppliers",
    answer: 192000,
    numeric: true,
  },
  {
    id: 5,
    examNumber: 7,
    group: "data",
    groupLabel: "Данные, вероятность и логика",
    topic: "Работа с графиком",
    prompt:
      "Пользуясь графиком изменения частоты пульса гимнаста, поставьте в соответствие каждому промежутку времени характеристику изменения пульса.",
    kind: "pulse",
    answer: "1432",
  },
  {
    id: 6,
    examNumber: 8,
    group: "data",
    groupLabel: "Данные, вероятность и логика",
    topic: "Логика",
    prompt:
      "В кружке робототехники занимаются 30 учеников. 18 учеников изучают программирование, 12 — электронику. Один ученик может заниматься и программированием, и электроникой. Выберите все утверждения, которые обязательно верны.",
    kind: "logic",
    answer: "13",
  },
  {
    id: 7,
    examNumber: 10,
    group: "practice",
    groupLabel: "Практические задачи",
    topic: "Практическая планиметрия",
    prompt:
      "Сколько потребуется кафельных плиток квадратной формы со стороной 20 см, чтобы облицевать ими стену, имеющую форму прямоугольника со сторонами 4 м и 3,8 м?",
    answer: 380,
    numeric: true,
  },
  {
    id: 8,
    examNumber: 11,
    group: "geometry",
    groupLabel: "Геометрия",
    topic: "Практическая стереометрия",
    prompt:
      "Ящик, имеющий форму куба с ребром 28 см без одной грани, нужно покрасить со всех сторон снаружи. Найдите площадь поверхности, которую необходимо покрасить. Ответ дайте в квадратных сантиметрах.",
    kind: "open-cube",
    answer: 3920,
    numeric: true,
  },
  {
    id: 9,
    examNumber: 12,
    group: "geometry",
    groupLabel: "Геометрия",
    topic: "Планиметрия",
    prompt:
      "В треугольнике ABC известно, что AB = BC = 25, AC = 20√6. Найдите синус угла BAC.",
    kind: "triangle",
    answer: 0.2,
    numeric: true,
  },
  {
    id: 10,
    examNumber: 13,
    group: "geometry",
    groupLabel: "Геометрия",
    topic: "Стереометрия",
    prompt:
      "В основании прямой призмы лежит прямоугольный треугольник, катеты которого равны 7 и 11. Найдите объём призмы, если её высота равна 6.",
    kind: "prism",
    answer: 231,
    numeric: true,
  },
  {
    id: 11,
    examNumber: 15,
    group: "practice",
    groupLabel: "Практические задачи",
    topic: "Проценты и скидки",
    prompt:
      "В магазине дизайнерских сумок проходит акция. При покупке одновременно трёх сумок: большой, средней и маленькой, можно получить скидку 20 % на каждую. Маленькая сумка стоит 1800 рублей, цена средней сумки в 1,5 раза больше цены маленькой, а цена большой сумки в 1,5 раза больше цены средней. Сколько будут стоить три сумки со скидкой? Ответ дайте в рублях.",
    answer: 6840,
    numeric: true,
  },
  {
    id: 12,
    examNumber: 16,
    group: "algebra",
    groupLabel: "Алгебра",
    topic: "Свойства логарифмов",
    prompt: "Найдите значение выражения.",
    expression: String.raw`\log_2 3+\log_2 12-\log_2 9`,
    answer: 2,
    numeric: true,
  },
  {
    id: 13,
    examNumber: 17,
    group: "algebra",
    groupLabel: "Алгебра",
    topic: "Иррациональное уравнение",
    prompt: "Решите уравнение.",
    expression: String.raw`\sqrt{2x+3}=x`,
    answer: 3,
    numeric: true,
  },
  {
    id: 14,
    examNumber: 18,
    group: "algebra",
    groupLabel: "Алгебра",
    topic: "Неравенства",
    prompt:
      "Каждому из четырёх неравенств соответствует одно из решений. Установите соответствие и запишите четыре цифры подряд.",
    kind: "inequalities",
    answer: "1243",
  },
  {
    id: 15,
    examNumber: 20,
    group: "practice",
    groupLabel: "Практические задачи",
    topic: "Задача на движение",
    prompt:
      "Расстояние между городами A и B равно 610 км. Из города A в город B со скоростью 50 км/ч выехал первый автомобиль, а через час после этого навстречу ему из города B выехал со скоростью 90 км/ч второй автомобиль. На каком расстоянии от города A автомобили встретятся? Ответ дайте в километрах.",
    answer: 250,
    numeric: true,
  },
];

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

function isCorrect(question: Question, answer?: StoredAnswer) {
  if (!answer || answer.dontKnow || !answer.value.trim()) return false;

  if (question.numeric) {
    const parsed = asNumber(answer.value);
    return parsed !== null && Math.abs(parsed - Number(question.answer)) < 1e-9;
  }

  return normalize(answer.value) === normalize(String(question.answer));
}

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

function EgeBaseDoodle() {
  return (
    <div className="doodle grade-seven-doodle ege-base-doodle" aria-hidden="true">
      <span className="doodle-plus">√</span>
      <span className="doodle-pi">log</span>
      <span className="doodle-frac"><b>1</b><i /><b>2</b></span>
      <div className="doodle-paper">
        <div /><div /><div /><span>✓</span>
      </div>
      <span className="doodle-dot dot-one" />
      <span className="doodle-dot dot-two" />
    </div>
  );
}

function ResultsTable() {
  return (
    <div className="ege-table-wrap">
      <table className="ege-table">
        <thead>
          <tr><th>Команда</th><th>I тур</th><th>II тур</th><th>III тур</th></tr>
        </thead>
        <tbody>
          <tr><td>Альфа</td><td>4</td><td>2</td><td>3</td></tr>
          <tr><td>Бета</td><td>2</td><td>5</td><td>4</td></tr>
          <tr><td>Гамма</td><td>3</td><td>3</td><td>2</td></tr>
          <tr><td>Дельта</td><td>5</td><td>1</td><td>5</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function SuppliersTable() {
  return (
    <div className="ege-table-wrap">
      <table className="ege-table suppliers-table">
        <thead>
          <tr>
            <th>Поставщик</th>
            <th>Стоимость пеноблоков, руб. за 1 м³</th>
            <th>Стоимость доставки, руб.</th>
            <th>Дополнительные условия</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>А</td><td>2600</td><td>10 000</td><td>Нет</td></tr>
          <tr><td>Б</td><td>2800</td><td>8000</td><td>При заказе товара на сумму свыше 150 000 рублей доставка бесплатная</td></tr>
          <tr><td>В</td><td>2700</td><td>8000</td><td>При заказе товара на сумму свыше 200 000 рублей доставка бесплатная</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function PulseGraph() {
  const points = [
    [0, 120], [0.6, 85], [1.2, 95], [2, 112], [2.6, 150], [3, 125],
    [3.35, 102], [3.65, 96], [4, 110], [4.6, 140], [5, 132], [5.5, 168],
    [6, 142], [6.5, 125], [7, 110], [7.45, 92], [8, 74], [8.5, 84], [9, 86],
  ];
  const x = (t: number) => 50 + t * 48;
  const y = (p: number) => 245 - (p - 60) * 1.55;
  const path = points.map(([t, p], index) => `${index ? "L" : "M"}${x(t)} ${y(p)}`).join(" ");

  return (
    <div className="pulse-card">
      <svg viewBox="0 0 520 295" role="img" aria-label="График изменения частоты пульса гимнаста">
        {Array.from({ length: 10 }).map((_, index) => (
          <line key={`v-${index}`} x1={x(index)} x2={x(index)} y1="35" y2="245" className="grid-line" />
        ))}
        {[60, 80, 100, 120, 140, 160, 180].map((value) => (
          <g key={value}>
            <line x1="50" x2="482" y1={y(value)} y2={y(value)} className="grid-line" />
            <text x="38" y={y(value) + 5} textAnchor="end" className="axis-label">{value}</text>
          </g>
        ))}
        <line x1="50" x2="482" y1="245" y2="245" className="axis" />
        <line x1="50" x2="50" y1="35" y2="245" className="axis" />
        <path d={path} className="pulse-line" />
        {points.map(([t, p], index) => <circle key={index} cx={x(t)} cy={y(p)} r="3.5" className="pulse-point" />)}
        {Array.from({ length: 10 }).map((_, index) => (
          <text key={index} x={x(index)} y="267" textAnchor="middle" className="axis-label">{index}</text>
        ))}
        <text x="265" y="289" textAnchor="middle" className="axis-title">Время, мин.</text>
        <text x="16" y="24" className="axis-title">Частота пульса, уд./мин.</text>
      </svg>
      <div className="matching-grid">
        <div>
          <h3>Промежутки времени</h3>
          <p><b>А)</b> 3–4 мин.</p>
          <p><b>Б)</b> 5–6 мин.</p>
          <p><b>В)</b> 6–7 мин.</p>
          <p><b>Г)</b> 7–8 мин.</p>
        </div>
        <div>
          <h3>Характеристики</h3>
          <p><b>1)</b> частота пульса сначала падала, а затем росла;</p>
          <p><b>2)</b> частота пульса упала ниже 80 уд./мин.;</p>
          <p><b>3)</b> частота пульса упала до 110 уд./мин.;</p>
          <p><b>4)</b> частота пульса достигла максимума за всё время выступления и после него.</p>
        </div>
      </div>
    </div>
  );
}

function LogicList() {
  return (
    <ol className="statement-list">
      <li>Не может быть 13 учеников, изучающих и программирование, и электронику.</li>
      <li>Все изучающие электронику обязательно изучают программирование.</li>
      <li>Число учеников, изучающих оба направления, не превышает 12.</li>
      <li>Хотя бы один ученик обязательно изучает оба направления.</li>
    </ol>
  );
}

function GeometryDiagram({ kind }: { kind: "open-cube" | "triangle" | "prism" }) {
  if (kind === "triangle") {
    return (
      <div className="geometry-card">
        <svg viewBox="0 0 440 300" role="img" aria-label="Равнобедренный треугольник ABC">
          <polygon points="85,230 220,60 355,230" className="geom-shape" />

          <text x="65" y="250" className="geom-label">A</text>
          <text x="214" y="45" className="geom-label">B</text>
          <text x="365" y="250" className="geom-label">C</text>

          <text x="125" y="142" className="geom-value">25</text>
          <text x="302" y="142" className="geom-value">25</text>

          <line x1="145" y1="146" x2="157" y2="155" className="equal-mark" />
          <line x1="295" y1="155" x2="307" y2="146" className="equal-mark" />

          <text x="190" y="265" className="geom-value">20√6</text>
        </svg>
      </div>
    );
  }

if (kind === "prism") {
  return (
    <div className="geometry-card">
      <svg viewBox="0 0 220 220" role="img" aria-label="Прямая призма">
        {/* Внешний контур */}
        <line x1="18" y1="62" x2="100" y2="12" className="geom-edge" />
        <line x1="100" y1="12" x2="182" y2="62" className="geom-edge" />
        <line x1="18" y1="62" x2="182" y2="62" className="geom-edge" />

        <line x1="18" y1="62" x2="18" y2="192" className="geom-edge" />
        <line x1="182" y1="62" x2="182" y2="192" className="geom-edge" />
        <line x1="18" y1="192" x2="182" y2="192" className="geom-edge" />

        {/* Внутренние пунктирные линии */}
        <line x1="100" y1="12" x2="100" y2="132" className="geom-edge dashed" />
        <line x1="18" y1="192" x2="100" y2="145" className="geom-edge dashed" />
        <line x1="182" y1="192" x2="100" y2="145" className="geom-edge dashed" />

        {/* Подписи */}
<text x="48" y="166" className="geom-value">
  7
</text>

<text x="140" y="168" className="geom-value">
  11
</text>

        <text x="108" y="84" className="geom-value">
          6
        </text>
      </svg>
    </div>
  );
}

  return (
    <div className="geometry-card">
      <svg viewBox="0 0 440 320" role="img" aria-label="Куб с ребром 28 см">
        {/* Обычный схематичный куб */}
        <rect x="105" y="110" width="150" height="150" className="geom-shape" />

        <line x1="105" y1="110" x2="175" y2="60" className="geom-edge" />
        <line x1="255" y1="110" x2="325" y2="60" className="geom-edge" />
        <line x1="255" y1="260" x2="325" y2="210" className="geom-edge" />

        <line x1="175" y1="60" x2="325" y2="60" className="geom-edge" />
        <line x1="325" y1="60" x2="325" y2="210" className="geom-edge" />

        <line x1="105" y1="260" x2="175" y2="210" className="geom-edge dashed" />
        <line x1="175" y1="60" x2="175" y2="210" className="geom-edge dashed" />
        <line x1="175" y1="210" x2="325" y2="210" className="geom-edge dashed" />

        <text x="72" y="190" className="geom-value">28</text>
      </svg>
    </div>
  );
}

function InequalitiesBlock() {
  return (
    <div className="ineq-card">
      <div className="ineq-columns">
        <div>
          <h3>Неравенства</h3>
          <div className="formula-row"><b>А)</b><MathFormula expression={String.raw`6^x>\log_6 6`} displayMode={false} /></div>
          <div className="formula-row"><b>Б)</b><MathFormula expression={String.raw`6^x<6`} displayMode={false} /></div>
          <div className="formula-row"><b>В)</b><MathFormula expression={String.raw`6^x>36`} displayMode={false} /></div>
          <div className="formula-row"><b>Г)</b><MathFormula expression={String.raw`6^x>\log_6\frac16`} displayMode={false} /></div>
        </div>
        <div>
          <h3>Решения</h3>
          <div className="formula-row"><b>1)</b><MathFormula expression={String.raw`(0;+\infty)`} displayMode={false} /></div>
          <div className="formula-row"><b>2)</b><MathFormula expression={String.raw`(-\infty;1)`} displayMode={false} /></div>
          <div className="formula-row"><b>3)</b><MathFormula expression={String.raw`(-\infty;+\infty)`} displayMode={false} /></div>
          <div className="formula-row"><b>4)</b><MathFormula expression={String.raw`(2;+\infty)`} displayMode={false} /></div>
        </div>
      </div>
    </div>
  );
}

function QuestionVisual({ question }: { question: Question }) {
  if (question.kind === "table-results") return <ResultsTable />;
  if (question.kind === "table-suppliers") return <SuppliersTable />;
  if (question.kind === "pulse") return <PulseGraph />;
  if (question.kind === "logic") return <LogicList />;
  if (question.kind === "open-cube" || question.kind === "triangle" || question.kind === "prism") {
    return <GeometryDiagram kind={question.kind} />;
  }
  if (question.kind === "inequalities") return <InequalitiesBlock />;
  return null;
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

export default function EgeBaseDiagnosticPage() {
  const [screen, setScreen] = useState<"home" | "test" | "review" | "result">("home");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [copyFallback, setCopyFallback] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (["home", "test", "review"].includes(parsed.screen)) setScreen(parsed.screen);
        setName(parsed.name || "");
        setAccepted(Boolean(parsed.accepted));
        setCurrent(Math.max(parsed.current || 0, 0));
        setAnswers(parsed.answers || {});
      }
    } catch {
      // Повреждённое сохранение не мешает начать заново.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || screen === "result") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, name, accepted, current, answers }));
  }, [screen, name, accepted, current, answers, hydrated]);

  const answerFor = (questionId: number): StoredAnswer => answers[questionId] || { value: "", dontKnow: false };

  const statusFor = (question: Question) => {
    const answer = answerFor(question.id);
    if (answer.dontKnow) return "dont_know";
    if (!answer.value.trim()) return "unanswered";
    return isCorrect(question, answer) ? "correct" : "incorrect";
  };

  const completedCount = questions.filter((question) => {
    const answer = answerFor(question.id);
    return answer.dontKnow || Boolean(answer.value.trim());
  }).length;

  const score = questions.filter((question) => isCorrect(question, answerFor(question.id))).length;
  const incorrectCount = questions.filter((question) => statusFor(question) === "incorrect").length;
  const dontKnowCount = questions.filter((question) => statusFor(question) === "dont_know").length;
  const unanswered = questions.filter((question) => statusFor(question) === "unanswered");

  const groupResults = useMemo<GroupResult[]>(() =>
    groups.map((group) => {
      const ownQuestions = questions.filter((question) => question.group === group.id);
      const correct = ownQuestions.filter((question) => isCorrect(question, answers[question.id])).length;
      const percent = Math.round((correct / ownQuestions.length) * 100);
      return {
        id: group.id,
        label: group.label,
        correct,
        total: ownQuestions.length,
        percent,
        status: percent >= 80 ? "good" : percent >= 50 ? "repeat" : "priority",
      };
    }), [answers]);

  const start = () => {
    if (!name.trim() || !accepted) return;
    setCurrent(0);
    setScreen("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    if (!window.confirm("Начать диагностику заново? Имя и все ответы будут удалены.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setName("");
    setAccepted(false);
    setCurrent(0);
    setAnswers({});
    setScreen("home");
    setCopyState("");
    setCopyFallback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resultText = () => [
    "Диагностика «ЕГЭ по математике — базовый уровень»",
    `Имя: ${name.trim() || "не указано"}`,
    `Результат: ${score} из ${questions.length}`,
    `Ошибок: ${incorrectCount}`,
    `Отмечено «Не знаю»: ${dontKnowCount}`,
    ...groupResults.map((group) => `${group.label}: ${group.correct}/${group.total} (${group.percent}%)`),
    `Работа выполнена: ${new Date().toLocaleString("ru-RU")}`,
  ].join("\n\n");

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
    const rows = questions.map((question, index) => {
      const answer = answerFor(question.id);
      const status = statusFor(question);
      return `<tr><td>${index + 1}</td><td>№${question.examNumber} ЕГЭ</td><td>${escapeHtml(question.topic)}</td><td>${escapeHtml(answer.dontKnow ? "Не знаю" : answer.value || "Нет ответа")}</td><td>${escapeHtml(String(question.answer).replace(".", ","))}</td><td>${status === "correct" ? "Правильно" : status === "incorrect" ? "Неправильно" : status === "dont_know" ? "Не знаю" : "Нет ответа"}</td></tr>`;
    }).join("");

    const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>ЕГЭ база — результат</title><style>body{font-family:Arial,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;color:#28222c}h1{color:#674fa6}pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}</style><body><h1>ЕГЭ по математике — базовый уровень</h1><pre>${escapeHtml(resultText())}</pre><table><tr><th>№</th><th>Позиция</th><th>Тема</th><th>Ответ ученика</th><th>Правильный ответ</th><th>Статус</th></tr>${rows}</table></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ЕГЭ_база_${name.trim().replace(/\s+/g, "_") || "ученик"}.html`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (screen === "test") {
    const question = questions[current];
    const stored = answerFor(question.id);
    const complete = stored.dontKnow || Boolean(stored.value.trim());

    const goNext = () => {
      if (!complete) return;
      if (current === questions.length - 1) setScreen("review");
      else setCurrent((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
      <main className="test-shell ege-base-page">
        <PageStyles />
        <header className="compact-header">
          <a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a>
          <button className="text-button" onClick={restart}>Начать сначала</button>
        </header>

        <section className="test-wrap">
          <div className="progress-line">
            <div>
              <span>Задание {current + 1} из {questions.length}</span>
              <small>№{question.examNumber} ЕГЭ · {question.topic}</small>
            </div>
            <strong>{Math.round(((current + 1) / questions.length) * 100)}%</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>

          <nav className="question-number-nav" aria-label="Переход по заданиям">
            {questions.map((item, index) => {
              const answer = answerFor(item.id);
              const stateClass = answer.dontKnow ? "unknown" : answer.value.trim() ? "answered" : "empty";
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`${stateClass} ${index === current ? "current" : ""}`}
                  title={`№${item.examNumber} ЕГЭ`}
                  onClick={() => { setCurrent(index); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >{index + 1}</button>
              );
            })}
          </nav>

          <article className="question-card ege-base-question">
            <div className="question-meta"><span>№{question.examNumber} ЕГЭ</span><span>{question.groupLabel}</span></div>
            <p className="question-eyebrow">{question.topic}</p>
            <h1>{question.prompt}</h1>
            {question.expression && <div className="expression"><MathFormula expression={question.expression} /></div>}
            <QuestionVisual question={question} />

            <label className="answer-field base-answer-field">
              <span>Твой ответ</span>
              <input
                inputMode={question.numeric ? "decimal" : "numeric"}
                value={stored.dontKnow ? "" : stored.value}
                placeholder={question.examNumber === 7 || question.examNumber === 18 ? "Например: 1234" : "Введи ответ"}
                onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: { value: event.target.value, dontKnow: false } }))}
              />
            </label>

            <button
              type="button"
              className={`button dont-know-button field-dont-know ${stored.dontKnow ? "active-dont-know" : ""}`}
              onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: { value: "", dontKnow: true } }))}
            >{stored.dontKnow ? "Отмечено: не знаю" : "Не знаю, как решить"}</button>

            <div className="test-actions grade-seven-actions">
              <button className="button secondary" disabled={current === 0} onClick={() => { setCurrent((value) => value - 1); window.scrollTo({ top: 0 }); }}>← Назад</button>
              <button className="button primary" disabled={!complete} onClick={goNext}>{current === questions.length - 1 ? "К обзору" : "Далее"} →</button>
            </div>
          </article>

          <p className="save-note">Имя, ответы и прогресс сохраняются только в этом браузере</p>
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
        unanswered.forEach((question) => { next[question.id] = { value: "", dontKnow: true }; });
        return next;
      });
    };

    return (
      <main className="result-page ege-base-page review-overview">
        <PageStyles />
        <header className="compact-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header>
        <section className="result-section overview-heading">
          <p className="kicker">Перед результатом</p>
          <h1>Обзор всех {questions.length} заданий</h1>
          <p>{unanswered.length ? `Незаполненных заданий: ${unanswered.length}. Вернись к ним или засчитай как «Не знаю, как решить».` : "Все задания заполнены или отмечены как «Не знаю, как решить»."}</p>
        </section>
        <section className="result-section overview-grid">
          {questions.map((question, index) => {
            const answer = answerFor(question.id);
            const stateClass = answer.dontKnow ? "unknown" : answer.value.trim() ? "answered" : "empty";
            return <button className={`overview-item ${stateClass}`} key={question.id} title={`№${question.examNumber} ЕГЭ`} onClick={() => { setCurrent(index); setScreen("test"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><b>№{index + 1}</b></button>;
          })}
        </section>
        <section className="result-section review-finish">
          {unanswered.length > 0 && <button className="button secondary" onClick={markUnansweredUnknown}>Засчитать пропуски как «Не знаю»</button>}
          <button className="button primary" disabled={unanswered.length > 0} onClick={finish}>Показать результат</button>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const percent = Math.round((score / questions.length) * 100);
    const perfect = score === questions.length;
    const conclusion = perfect
      ? "Все задания выполнены верно. По этой диагностике обязательных тем для повторения не найдено."
      : percent >= 80
        ? "База в целом уверенная. Стоит точечно повторить темы, где появились ошибки."
        : percent >= 50
          ? "Многое уже получается. Повторение слабых блоков поможет заметно укрепить результат."
          : "Есть темы, которые стоит восстановить по порядку. Это не оценка, а маршрут подготовки.";
    const telegramMessage = encodeURIComponent(resultText());

    return (
      <main className="result-page ege-base-page">
        <PageStyles />
        <header className="compact-header result-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Пройти ещё раз</button></header>

        <section className="result-hero">
          <div className="score-orbit"><strong>{score}</strong><span>из {questions.length}</span></div>
          <div><p className="kicker">Диагностика завершена</p><h1>{name.trim() ? `${name.trim()}, вот твой результат` : "Вот твой результат"}</h1><p>{conclusion}</p></div>
        </section>

        <section className="result-section result-stats grade-eleven-stats">
          <article><strong>{score}/{questions.length}</strong><span>правильных ответов</span></article>
          <article><strong>{percent}%</strong><span>общий результат</span></article>
          <article><strong>{incorrectCount}</strong><span>с ошибкой</span></article>
          <article><strong>{dontKnowCount}</strong><span>«не знаю»</span></article>
        </section>

        <section className="result-section">
          <div className="section-heading"><div><p className="kicker">По блокам</p><h2>Что уже получается и что повторить</h2></div></div>
          <div className="block-results grade-eleven-blocks">
            {groupResults.map((group) => (
              <article className={`block-card ${group.status === "good" ? "great" : group.status === "repeat" ? "medium" : "restore"}`} key={group.id}>
                <div className="block-topline"><span>{group.correct}/{group.total} · {group.percent}%</span><b>{group.status === "good" ? "Получается уверенно" : group.status === "repeat" ? "Стоит немного повторить" : "Повторить в первую очередь"}</b></div>
                <h3>{group.label}</h3><div className="mini-progress"><span style={{ width: `${group.percent}%` }} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="result-section">
          <div className="section-heading"><div><p className="kicker">Все задания</p><h2>Посмотри ответы и статусы</h2></div></div>
          <div className="overview-grid result-overview-grid">
            {questions.map((question, index) => {
              const answer = answerFor(question.id);
              const status = statusFor(question);
              return (
                <details className="overview-item result-answer-item" key={question.id}>
                  <summary><b>№{index + 1}</b><span>№{question.examNumber} ЕГЭ · {question.topic}</span></summary>
                  <div className={`result-field-line ${status}`}>
                    <p><b>Твой ответ:</b> {answer.dontKnow ? "Не знаю, как решить" : answer.value || "Нет ответа"}</p>
                    <p><b>Правильный ответ:</b> {String(question.answer).replace(".", ",")}</p>
                    <p><b>Статус:</b> {status === "correct" ? "Правильно" : status === "incorrect" ? "Неправильно" : status === "dont_know" ? "Не знаю" : "Нет ответа"}</p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <section className="final-cta">
          <div><p className="kicker">Следующий шаг</p><h2>{perfect ? "Можно двигаться дальше" : "Хочешь составить план повторения?"}</h2><p>{perfect ? "Сохраняй форму и периодически возвращайся к пробникам." : "Разберём только те темы, в которых диагностика показала пробелы."}</p></div>
          <div className="cta-actions">
            <button className="button secondary" onClick={() => copyResult()}>Скопировать результат</button>
            <button className="button secondary" onClick={downloadResult}>Скачать результат</button>
            <a className="button primary" href={`https://t.me/${TELEGRAM_USERNAME}?text=${telegramMessage}`} target="_blank" rel="noreferrer" onClick={() => copyResult("Результат скопирован. Вставь его в сообщение")}>Отправить результат Лере</a>
            <button className="button secondary" onClick={restart}>Пройти ещё раз</button>
          </div>
          {copyState && <p className="copy-toast" role="status">{copyState}</p>}
          {copyFallback && <div className="copy-fallback"><textarea readOnly value={copyFallback} /></div>}
        </section>
      </main>
    );
  }

return (
    <main className="home-page ege-base-page">
      <PageStyles />

      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="soft-pill">
            Входная диагностика ЕГЭ
          </div>

          <h1>
            ЕГЭ по математике
            <br />
            <em>базовый уровень</em>
          </h1>

          <p className="hero-lead">
            Пройди диагностику и узнай, какие типы заданий базового ЕГЭ уже
            получаются уверенно, а что стоит повторить перед подготовкой.
          </p>

          <div className="calm-note">
            <span>♡</span>
            <p>
              Это не пробный ЕГЭ и не школьная оценка. Здесь нет таймера —
              только понятный результат и персональные рекомендации.
            </p>
          </div>

          <div className="name-start-card">
            <label htmlFor="student-name">
              Как тебя зовут?
            </label>

            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Введи имя"
              autoComplete="given-name"
            />

            <div className="start-guidance">
              <h2>Перед началом</h2>

              <ul>
                <li>Приготовь лист бумаги для вычислений.</li>
                <li>Решай самостоятельно, без учебника и подсказок.</li>
                <li>Строгого ограничения времени нет.</li>
                <li>
                  Если не знаешь способ решения, не угадывай — нажми
                  «Не знаю, как решить».
                </li>
                <li>
                  Диагностика состоит из 15 заданий по основным типам
                  базового ЕГЭ.
                </li>
              </ul>

              <label className="consent-check">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                />

                <span>
                  Я прочитал(а) рекомендации и готов(а) начать
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
              <b>15 заданий</b>
              <span>·</span> около 45–60 минут{" "}
              <span>·</span> результат сразу
            </p>
          </div>
        </div>

        <EgeBaseDoodle />
      </section>

      <section className="how">
        <div className="section-heading home-heading">
          <div>
            <p className="kicker">Всё просто</p>
            <h2>Как это работает</h2>
          </div>

          <p>
            Без регистрации, школьных оценок и лишнего волнения
          </p>
        </div>

        <div className="steps">
          <article className="step-card violet">
            <span>01</span>
            <h3>Решаешь задания</h3>
            <p>
              Проверяешь основные типы задач, которые встречаются в базовом ЕГЭ.
            </p>
          </article>

          <article className="step-card blue">
            <span>02</span>
            <h3>Можно честно не знать</h3>
            <p>
              Отмечаешь незнакомые способы решения — без случайных догадок.
            </p>
          </article>

          <article className="step-card pink">
            <span>03</span>
            <h3>Получаешь маршрут</h3>
            <p>
              Видишь сильные блоки и темы, которые стоит повторить в первую очередь.
            </p>
          </article>
        </div>
      </section>

      <section className="class-section">
        <div className="section-heading">
          <div>
            <p className="kicker">Другие диагностики</p>
            <h2>Выбери нужный формат</h2>
          </div>
        </div>

        <div className="class-grid compact-class-grid">
          <a className="class-card active" href="/oge">
            <span>Доступно сейчас</span>
            <b>ОГЭ</b>
            <i>Входная диагностика →</i>
          </a>

          <a className="class-card active" href="/ege-profile">
            <span>Доступно сейчас</span>
            <b>ЕГЭ профиль</b>
            <i>Входная диагностика →</i>
          </a>

          <a className="class-card active" href="/11">
            <span>Доступно сейчас</span>
            <b>Перед 11 классом</b>
            <i>По изученным темам →</i>
          </a>

          <a className="class-card active" href="/">
            <span>Все варианты</span>
            <b>Другие классы</b>
            <i>К списку диагностик →</i>
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

function PageStyles() {
  return (
    <style>{`
      .ege-base-page{--base-violet:#7352bd;--base-violet-dark:#5e3ca7;--base-border:#e7dcef;--base-lilac:#f3ebfb;--base-ink:#2e2636}
      .ege-base-home{overflow:hidden}
      .ege-base-home .site-header,.ege-base-home footer{max-width:1180px;margin:0 auto;padding-left:24px;padding-right:24px}
      .base-hero{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(360px,.92fr);gap:64px;align-items:center;max-width:1180px;margin:0 auto;padding:74px 24px 58px}
      .base-hero h1{max-width:760px;margin:26px 0 24px;font-size:clamp(3.4rem,6.2vw,6.4rem);line-height:.94;letter-spacing:-.055em}
      .base-hero h1 em{display:block;color:var(--base-violet);font-family:var(--font-hand,inherit);font-style:normal;font-weight:600;margin-top:8px}
      .base-hero .hero-lead{max-width:700px;margin:0;font-size:clamp(1.08rem,1.45vw,1.28rem);line-height:1.62}
      .base-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:30px}
      .base-facts>div{min-height:82px;display:flex;flex-direction:column;justify-content:center;gap:4px;padding:14px 16px;border:1px solid var(--base-border);border-radius:17px;background:rgba(255,255,255,.74);text-align:center}
      .base-facts b{color:var(--base-violet);font-size:1.15rem}.base-facts span{font-size:.86rem;line-height:1.25}
      .base-doodle{position:relative;min-height:490px}.base-doodle:before{content:"";position:absolute;inset:28px 8px 20px;border-radius:50%;background:linear-gradient(145deg,#eee3fb,#e4f1f7 56%,#f6e8f0)}
      .base-sheet{position:absolute;width:58%;height:56%;left:50%;top:50%;transform:translate(-50%,-48%) rotate(-3deg);border-radius:20px;background:#fff;box-shadow:0 28px 60px rgba(79,54,105,.18);padding:58px 34px 28px}
      .base-sheet-badge{position:absolute;left:-38px;top:-22px;display:grid;place-items:center;width:82px;height:70px;border-radius:22px;background:#fff;color:var(--base-violet);font-weight:900;box-shadow:0 16px 35px rgba(79,54,105,.13)}
      .base-formula{color:#7258ad;font-size:clamp(1.35rem,2.4vw,2rem);font-weight:700;margin-bottom:28px}.sheet-line{height:11px;border-radius:999px;background:#eeeaf2;margin:13px 0}.sheet-line.wide{width:92%}.sheet-line.medium{width:70%}.sheet-line.short{width:43%}
      .base-check{position:absolute;right:28px;bottom:28px;color:#d487a5;font-size:4rem;font-weight:800;transform:rotate(-8deg)}
      .base-bubble{position:absolute;display:grid;place-items:center;border-radius:50%;font-family:Georgia,serif;font-weight:700;color:var(--base-violet);box-shadow:0 16px 36px rgba(79,54,105,.1)}.base-bubble.one{width:78px;height:78px;right:20px;top:78px;background:#dff1f8;font-size:1.6rem}.base-bubble.two{width:94px;height:94px;left:10px;bottom:42px;background:#fff;font-size:1.15rem}.base-bubble.three{width:68px;height:68px;right:26px;bottom:44px;background:#fff;font-size:1.65rem}
      .base-start-section{max-width:1180px;margin:0 auto;padding:12px 24px 76px}.base-start-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:22px}.base-name-card,.base-guidance-card{border:1px solid var(--base-border);border-radius:24px;background:#fff;padding:25px}.base-name-card{display:flex;flex-direction:column;justify-content:center}.base-name-card label{font-weight:800;margin-bottom:10px}.base-name-card input{width:100%;min-height:58px;border:1px solid #dacdea;border-radius:15px;padding:0 17px;font:inherit;background:#fff}.base-name-card p{margin:12px 0 0;font-size:.88rem;opacity:.72}.base-guidance-card h2{margin:0 0 15px;font-size:1.45rem}.base-guidance-card ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px;margin:0;padding-left:20px}.base-guidance-card li{line-height:1.45}
      .base-start-panel{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;margin-top:22px;padding:23px 24px;border:1px solid var(--base-border);border-radius:24px;background:linear-gradient(135deg,#f7f1fd,#f7fbfd)}.base-start-actions{min-width:250px;text-align:center}.base-start-actions .button{width:100%;justify-content:center}.base-start-actions p{margin:10px 0 0;font-size:.82rem;color:#776b7e}.base-calm-note{display:flex;gap:13px;align-items:flex-start;max-width:760px;margin:20px 0 0;padding:16px 18px;border:1px solid var(--base-border);border-radius:18px;background:#fff}.base-calm-note span{color:#d986a7;font-size:1.25rem}.base-calm-note p{margin:0;line-height:1.5}
      .ege-base-question h1{white-space:pre-line}.base-answer-field{margin-top:24px}.ege-table-wrap{overflow-x:auto;margin:22px 0}.ege-table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dfd2e9;border-radius:16px;overflow:hidden;background:#fff}.ege-table th,.ege-table td{padding:12px 14px;border-right:1px solid #e8deee;border-bottom:1px solid #e8deee;text-align:center;vertical-align:middle}.ege-table th{background:#f5effa;color:#59416f;font-size:.92rem}.ege-table tr:last-child td{border-bottom:0}.ege-table th:last-child,.ege-table td:last-child{border-right:0}.suppliers-table td:last-child{text-align:left;min-width:250px}
      .pulse-card,.geometry-card,.ineq-card{margin:22px 0;padding:18px;border:1px solid var(--base-border);border-radius:18px;background:#fff}.pulse-card svg,.geometry-card svg{width:100%;height:auto;display:block}.grid-line{stroke:#d9dde2;stroke-width:1}.axis{stroke:#313038;stroke-width:2}.axis-label{fill:#595461;font-size:12px}.axis-title{fill:#4a4351;font-size:13px;font-weight:700}.pulse-line{fill:none;stroke:#7252bd;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}.pulse-point{fill:#7252bd}.matching-grid{display:grid;grid-template-columns:.75fr 1.25fr;gap:18px;margin-top:14px}.matching-grid h3,.ineq-card h3{margin:0 0 10px;font-size:1rem;color:#5d4479}.matching-grid p{margin:8px 0;line-height:1.4}.statement-list{margin:22px 0 0;padding-left:28px}.statement-list li{margin:10px 0;line-height:1.48}.geom-shape,.geom-edge{fill:none;stroke:#3e3745;stroke-width:2.2}.geom-face{fill:#f2ecf8;stroke:#3e3745;stroke-width:2}.back-face{fill:#e7f2f8}.missing-face{fill:#fff;stroke:#aa8dcf;stroke-width:2;stroke-dasharray:7 6}.dashed{stroke-dasharray:7 6}.right-mark{fill:none;stroke:#7352bd;stroke-width:2}.geom-value{fill:#5f497a;font-size:16px;font-weight:700}.geom-label{fill:#3e3745;font-size:16px;font-weight:700}.equal-mark{stroke:#7352bd;stroke-width:2.2;stroke-linecap:round}.missing-label{fill:#8d70ae;font-size:13px;font-weight:700}.ineq-columns{display:grid;grid-template-columns:1fr 1fr;gap:30px}.formula-row{display:flex;align-items:center;gap:10px;min-height:38px}.formula-row>div{display:inline-block}.formula-row .katex{font-size:1.02em}
      .result-field-line{padding:12px 0;border-top:1px solid #eee}.result-field-line.correct{color:#3e7352}.result-field-line.incorrect{color:#8a4257}.result-field-line.dont_know{color:#6f5a83}
     .base-simple-home{
  max-width:920px;
  margin:0 auto;
  padding:58px 24px 80px;
}

.base-simple-home h1{
  margin:18px 0 22px;
  font-size:clamp(3.7rem,8vw,6.8rem);
  line-height:.92;
  letter-spacing:-.055em;
  color:var(--base-ink);
}

.base-simple-home h1 em{
  display:inline-block;
  margin-left:14px;
  color:var(--base-violet);
  font-family:var(--font-hand,inherit);
  font-style:normal;
  font-weight:600;
  letter-spacing:-.035em;
}

.base-simple-lead{
  max-width:760px;
  margin:0;
  font-size:1.12rem;
  line-height:1.65;
  color:#5f5564;
}

.base-info-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
  margin-top:28px;
}

.base-info-card{
  min-height:60px;
  display:flex;
  align-items:center;
  gap:6px;
  padding:14px 16px;
  border:1px solid var(--base-border);
  border-radius:16px;
  background:#fff;
  color:#62566a;
}

.base-info-card b{
  color:var(--base-violet);
  font-size:1.05rem;
}

.base-simple-name{
  margin-top:28px;
}

.base-simple-name label{
  display:block;
  margin-bottom:10px;
  font-weight:800;
  color:var(--base-ink);
}

.base-simple-name input{
  width:100%;
  min-height:58px;
  border:1px solid #d9cbea;
  border-radius:16px;
  padding:0 17px;
  background:#fff;
  font:inherit;
  box-shadow:0 12px 28px rgba(91,63,117,.06);
}

.base-simple-guidance{
  margin-top:24px;
  padding:26px 26px 24px;
  border:1px solid var(--base-border);
  border-radius:24px;
  background:#fff;
}

.base-simple-guidance h2{
  margin:0 0 16px;
  font-size:1.55rem;
}

.base-simple-guidance ul{
  margin:0;
  padding-left:22px;
}

.base-simple-guidance li{
  margin:10px 0;
  line-height:1.5;
  color:#63586a;
}

.base-guidance-divider{
  height:1px;
  margin:20px 0 16px;
  background:#eadff0;
}

.base-simple-guidance .consent-check{
  margin:0;
}

.base-simple-start{
  margin-top:24px;
}

.base-simple-start .button{
  min-width:242px;
}

.base-simple-start p{
  margin:12px 0 0;
  color:#6e6176;
  font-size:.9rem;
}

.base-simple-start p b{
  color:#66517d;
}

.base-simple-note{
  display:flex;
  align-items:flex-start;
  gap:12px;
  margin-top:24px;
  padding:16px 18px;
  border:1px solid var(--base-border);
  border-radius:18px;
  background:#fff;
}

.base-simple-note>span{
  color:#d986a7;
  font-size:1.25rem;
}

.base-simple-note p{
  margin:0;
  line-height:1.5;
  color:#6a5e71;
}

@media(max-width:700px){
  .base-simple-home{
    padding:38px 18px 60px;
  }

  .base-simple-home h1{
    font-size:clamp(3.2rem,16vw,5rem);
  }

  .base-simple-home h1 em{
    display:block;
    margin:6px 0 0;
  }

  .base-info-grid{
    grid-template-columns:1fr;
  }

  .base-simple-guidance{
    padding:22px 20px;
  }

  .base-simple-start .button{
    width:100%;
    min-width:0;
  }
}
      @media(max-width:980px){.base-hero{grid-template-columns:1fr;gap:24px;padding-top:52px}.base-doodle{min-height:410px;max-width:650px;width:100%;margin:0 auto}.base-start-grid{grid-template-columns:1fr}}
      @media(max-width:700px){.base-hero{padding:38px 18px 36px}.base-hero h1{font-size:clamp(3rem,16vw,4.7rem)}.base-facts{grid-template-columns:1fr}.base-doodle{min-height:340px}.base-sheet{width:64%;height:60%;padding:44px 24px 20px}.base-start-section{padding-left:18px;padding-right:18px}.base-guidance-card ul{grid-template-columns:1fr}.base-start-panel{grid-template-columns:1fr}.base-start-actions{min-width:0}.matching-grid,.ineq-columns{grid-template-columns:1fr}.suppliers-table{min-width:780px}}
    `}</style>
  );
}
