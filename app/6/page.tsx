"use client";

import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    katex?: {
      render: (
        expression: string,
        element: HTMLElement,
        options?: {
          displayMode?: boolean;
          throwOnError?: boolean;
        }
      ) => void;
    };
  }
}

type Answer = string | string[];
type Screen = "home" | "test" | "review" | "result";

type Question = {
  id: number;
  eyebrow: string;
  prompt: string;
  expression?: string;
  hint?: string;
  type: "text" | "choice" | "multi" | "double" | "table";
  options?: string[];
  fields?: { key: string; label: string; suffix?: string }[];
  topic: string;
  block: string;
  correctLabel: string;
  check: (answer: Answer) => boolean;
};

const TELEGRAM_USERNAME = "vxoab";
const STORAGE_KEY = "math-diagnostic-6-v2";

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(",", ".");

function asNumber(value: string) {
  const cleaned = normalize(value).replace(/[a-zа-яё]/gi, "").replace("=", "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function asFraction(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(",", ".").replace(/[()]/g, "");
  const mixed = cleaned.match(/^(-?\d+)[\s_]+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (!denominator) return null;
    return whole + Math.sign(whole || 1) * numerator / denominator;
  }
  const fraction = cleaned.match(/^(-?\d+)\/(-?\d+)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    return denominator ? Number(fraction[1]) / denominator : null;
  }
  return asNumber(cleaned);
}

const equalsNumber = (target: number) => (answer: Answer) =>
  typeof answer === "string" && asNumber(answer) === target;

const equalsFraction = (target: number) => (answer: Answer) => {
  if (typeof answer !== "string") return false;
  const parsed = asFraction(answer);
  return parsed !== null && Math.abs(parsed - target) < 1e-9;
};

const questions: Question[] = [
  { id: 1, eyebrow: "Порядок действий", prompt: "Вычисли:", expression: String.raw`840:7+36\cdot5-48`, type: "text", topic: "Натуральные числа и порядок действий", block: "Натуральные числа и вычисления", correctLabel: "252", check: equalsNumber(252) },
  { id: 2, eyebrow: "Распределительное свойство", prompt: "Вычисли наиболее удобным способом:", expression: String.raw`27\cdot46+73\cdot46`, type: "text", topic: "Свойства действий и упрощение выражений", block: "Натуральные числа и вычисления", correctLabel: "4600", check: equalsNumber(4600) },
  { id: 3, eyebrow: "Степень числа", prompt: "Вычисли:", expression: String.raw`3^3+72:8`, type: "text", topic: "Степень и порядок действий", block: "Натуральные числа и вычисления", correctLabel: "36", check: equalsNumber(36) },
  { id: 4, eyebrow: "Признаки делимости", prompt: "Выбери все числа, которые делятся одновременно на 2 и на 3:", type: "multi", options: ["126", "235", "318", "440", "513"], topic: "Признаки делимости", block: "Делимость", correctLabel: "126 и 318", check: (answer) => Array.isArray(answer) && [...answer].sort().join(",") === ["126", "318"].sort().join(",") },
  { id: 5, eyebrow: "Делители числа", prompt: "Запиши все делители числа 18 через запятую:", type: "text", hint: "Порядок чисел не важен", topic: "Делители и кратные", block: "Делимость", correctLabel: "1, 2, 3, 6, 9, 18", check: (answer) => { if (typeof answer !== "string") return false; const values = answer.split(/[,; ]+/).filter(Boolean).map(Number).sort((a, b) => a - b); return values.join(",") === "1,2,3,6,9,18"; } },
  { id: 6, eyebrow: "Сокращение дробей", prompt: "Сократи дробь:", expression: String.raw`\frac{24}{36}`, type: "text", hint: "Ответ можно записать через /", topic: "Сокращение дробей", block: "Обыкновенные дроби", correctLabel: "2/3", check: equalsFraction(2 / 3) },
  { id: 7, eyebrow: "Сравнение дробей", prompt: "Сравни дроби:", expression: String.raw`\frac{5}{8}\quad\text{и}\quad\frac{7}{12}`, type: "choice", options: ["5/8 > 7/12", "5/8 < 7/12", "5/8 = 7/12"], topic: "Сравнение дробей", block: "Обыкновенные дроби", correctLabel: "5/8 > 7/12", check: (answer) => answer === "5/8 > 7/12" },
  { id: 8, eyebrow: "Вычитание дробей", prompt: "Вычисли:", expression: String.raw`\frac{5}{6}-\frac{1}{4}`, type: "text", topic: "Общий знаменатель и действия с дробями", block: "Обыкновенные дроби", correctLabel: "7/12", check: equalsFraction(7 / 12) },
  { id: 9, eyebrow: "Смешанные числа", prompt: "Вычисли:", expression: String.raw`2\frac{3}{5}+1\frac{7}{10}`, type: "text", hint: "Например: 2 1/3 или 7/3", topic: "Смешанные числа", block: "Обыкновенные дроби", correctLabel: "4 3/10", check: equalsFraction(4.3) },
  { id: 10, eyebrow: "Умножение дробей", prompt: "Вычисли:", expression: String.raw`\frac{4}{9}\cdot\frac{3}{8}`, type: "text", topic: "Умножение дробей", block: "Обыкновенные дроби", correctLabel: "1/6", check: equalsFraction(1 / 6) },
  { id: 11, eyebrow: "Деление дробей", prompt: "Вычисли:", expression: String.raw`\frac{5}{6}:\frac{10}{9}`, type: "text", topic: "Деление дробей", block: "Обыкновенные дроби", correctLabel: "3/4", check: equalsFraction(3 / 4) },
  { id: 12, eyebrow: "Нахождение части числа", prompt: "В коробке было 36 конфет. Маша съела 5/12 всех конфет. Сколько конфет она съела?", type: "text", topic: "Нахождение части от числа", block: "Обыкновенные дроби", correctLabel: "15", check: equalsNumber(15) },
  { id: 13, eyebrow: "Нахождение целого по части", prompt: "После того как из книги прочитали 48 страниц, оказалось, что прочитано 3/8 всей книги. Сколько страниц в книге?", type: "text", topic: "Нахождение целого по его части", block: "Обыкновенные дроби", correctLabel: "128", check: equalsNumber(128) },
  { id: 14, eyebrow: "Десятичные дроби", prompt: "Вычисли:", expression: String.raw`7{,}35-2{,}8+0{,}45`, type: "text", hint: "Можно использовать запятую или точку", topic: "Сложение и вычитание десятичных дробей", block: "Десятичные дроби", correctLabel: "5", check: equalsNumber(5) },
  { id: 15, eyebrow: "Умножение десятичных дробей", prompt: "Вычисли:", expression: String.raw`4{,}8\cdot0{,}25`, type: "text", topic: "Умножение десятичных дробей", block: "Десятичные дроби", correctLabel: "1,2", check: equalsNumber(1.2) },
  { id: 16, eyebrow: "Округление", prompt: "Округли число 37,846 до десятых.", type: "text", topic: "Округление чисел", block: "Десятичные дроби", correctLabel: "37,8", check: equalsNumber(37.8) },
  { id: 17, eyebrow: "Буквенное выражение", prompt: "Найди значение выражения, если a = 7:", expression: String.raw`5a-12`, type: "text", topic: "Буквенные выражения", block: "Выражения и уравнения", correctLabel: "23", check: equalsNumber(23) },
  { id: 18, eyebrow: "Уравнение", prompt: "Реши уравнение:", expression: String.raw`7x-18=45`, type: "text", topic: "Уравнения", block: "Выражения и уравнения", correctLabel: "x = 9", check: (answer) => typeof answer === "string" && asNumber(answer.toLowerCase().replace("x", "").replace("=", "")) === 9 },
  { id: 19, eyebrow: "Геометрия", prompt: "Длина прямоугольника равна 12 см, а ширина — 7 см. Найди его периметр и площадь.", type: "double", fields: [{ key: "p", label: "Периметр", suffix: "см" }, { key: "s", label: "Площадь", suffix: "см²" }], topic: "Периметр и площадь прямоугольника", block: "Геометрия", correctLabel: "периметр — 38 см, площадь — 84 см²", check: (answer) => typeof answer === "string" && asNumber(answer.split("|")[0] || "") === 38 && asNumber(answer.split("|")[1] || "") === 84 },
  { id: 20, eyebrow: "Работа с таблицей", prompt: "Сколько всего страниц Дима прочитал за четыре дня?", type: "table", topic: "Таблицы и работа с информацией", block: "Работа с информацией", correctLabel: "90", check: equalsNumber(90) },
];

const blockCopy: Record<string, string> = {
  "Натуральные числа и вычисления": "Освежи порядок действий, степени и удобные способы вычислений — это поможет увереннее работать с более сложными выражениями.",
  Делимость: "Повтори признаки делимости, делители и кратные. На этой базе в 6 классе будут изучаться разложение на простые множители, НОД и НОК.",
  "Обыкновенные дроби": "Повтори сокращение дробей и приведение к общему знаменателю. Эти навыки понадобятся уже в начале 6 класса при действиях со смешанными числами.",
  "Десятичные дроби": "Повтори действия с десятичными дробями и округление. Они понадобятся в задачах на проценты, среднее арифметическое и пропорции.",
  "Выражения и уравнения": "Освежи работу с буквенными выражениями и простыми уравнениями. В 6 классе появятся раскрытие скобок, подобные слагаемые и более сложные уравнения.",
  Геометрия: "Ещё раз проверь формулы периметра и площади прямоугольника. Обращай внимание на единицы измерения: сантиметры и квадратные сантиметры — не одно и то же.",
  "Работа с информацией": "Потренируйся читать таблицы и собирать данные из нескольких строк — этот навык пригодится в задачах и диаграммах.",
};

function resultCopy(score: number) {
  if (score <= 7) return { title: "Давай восстановим базу вместе", text: "Некоторые темы 5 класса пока вызывают трудности. Это нормально: знания можно спокойно восстановить. Перед 6 классом особенно важно укрепить вычисления, дроби и простые уравнения.", extra: "Не нужно повторять весь учебник подряд. Лучше начать с основных пробелов и двигаться небольшими шагами.", cta: "Повторить вместе", card: "Вместе восстановим основные темы 5 класса и подготовимся к началу программы 6 класса." };
  if (score <= 12) return { title: "Часть базы уже есть", text: "Некоторые темы 5 класса уже получаются, но несколько важных навыков стоит укрепить перед началом программы 6 класса.", extra: "Посмотри персональные рекомендации ниже — они покажут, с чего лучше начать.", cta: "Подтянуть сложные темы", card: "Разберём только те темы, в которых остались пробелы, без повторения всего учебника." };
  if (score <= 16) return { title: "Хорошая база, но кое-что стоит повторить", text: "Большую часть программы 5 класса ты помнишь. Осталось освежить несколько тем, чтобы увереннее начать 6 класс.", extra: "Повторять всё подряд не понадобится — достаточно разобрать отдельные сложные места.", cta: "Подтянуть сложные темы", card: "Быстро разберём отдельные пробелы и подготовимся к программе 6 класса." };
  if (score <= 19) return { title: "Ты хорошо готов к 6 классу", text: "У тебя крепкая база за 5 класс. Достаточно разобрать отдельные ошибки и можно переходить к новым темам: отношениям и пропорциям, отрицательным числам, раскрытию скобок и более сложным уравнениям.", extra: "Обязательного повторения всей программы не требуется.", cta: "Подготовиться к 6 классу", card: "Разберём отдельные ошибки и начнём знакомиться с темами 6 класса." };
  return { title: "Отличный результат!", text: "У тебя крепкая база за 5 класс. Все задания выполнены правильно — можно переходить к новым темам: отношениям и пропорциям, отрицательным числам, раскрытию скобок и более сложным уравнениям.", extra: "Тем для обязательного повторения нет — можно спокойно двигаться дальше.", cta: "Начать темы 6 класса", card: "Обязательного повторения не требуется — можно переходить к программе 6 класса." };
}

function MathFormula({ expression }: { expression: string }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!element) return;
    const renderFormula = () => {
      if (!window.katex) return false;
      window.katex.render(expression, element, { displayMode: true, throwOnError: false });
      return true;
    };
    if (renderFormula()) return;
    const timer = window.setInterval(() => { if (renderFormula()) window.clearInterval(timer); }, 100);
    return () => window.clearInterval(timer);
  }, [element, expression]);
  return <div ref={setElement} />;
}

function MathDoodle() {
  return <div className="doodle" aria-hidden="true"><span className="doodle-plus">+</span><span className="doodle-pi">π</span><span className="doodle-frac"><b>5</b><i/><b>8</b></span><div className="doodle-paper"><div/><div/><div/><span>×</span></div><span className="doodle-dot dot-one"/><span className="doodle-dot dot-two"/></div>;
}

function answerHasContent(question: Question, answer: Answer | undefined) {
  if (Array.isArray(answer)) return answer.length > 0;
  if (!answer) return false;
  if (question.type === "double") {
    const parts = answer.split("|");
    return Boolean(parts[0]?.trim() && parts[1]?.trim());
  }
  return answer.trim().length > 0;
}

function formatStudentAnswer(question: Question, answer: Answer | undefined) {
  if (Array.isArray(answer)) return answer.length ? answer.join(", ") : "Ответ не введён";
  if (!answer?.trim()) return "Ответ не введён";
  if (question.type === "double") {
    const [perimeter, area] = answer.split("|");
    return `периметр — ${perimeter || "—"}, площадь — ${area || "—"}`;
  }
  return answer;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character] || character));
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [studentName, setStudentName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [dontKnow, setDontKnow] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (["home", "test", "review"].includes(parsed.screen)) setScreen(parsed.screen);
        setStudentName(parsed.studentName || "");
        setAccepted(Boolean(parsed.accepted));
        setAnswers(parsed.answers || {});
        setDontKnow(parsed.dontKnow || {});
        setCurrent(Math.min(Math.max(parsed.current || 0, 0), questions.length - 1));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || screen === "result") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, studentName, accepted, answers, dontKnow, current }));
  }, [screen, studentName, accepted, answers, dontKnow, current, hydrated]);

  const hasAnswerFor = (question: Question) => Boolean(dontKnow[question.id] || answerHasContent(question, answers[question.id]));

  const updateAnswer = (id: number, value: Answer) => {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    setDontKnow((previous) => ({ ...previous, [id]: false }));
  };

  const markUnknown = (question: Question) => {
    setAnswers((previous) => ({ ...previous, [question.id]: question.type === "multi" ? [] : "" }));
    setDontKnow((previous) => ({ ...previous, [question.id]: true }));
  };

  const score = useMemo(() => questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length, [answers, dontKnow]);
  const answeredCount = useMemo(() => questions.filter((question) => hasAnswerFor(question)).length, [answers, dontKnow]);
  const unknownCount = useMemo(() => questions.filter((question) => dontKnow[question.id]).length, [dontKnow]);

  const start = () => {
    if (!studentName.trim() || !accepted) return;
    setScreen("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    if (!window.confirm("Все сохранённые ответы будут удалены. Начать диагностику заново?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setStudentName(""); setAccepted(false); setAnswers({}); setDontKnow({}); setCurrent(0); setScreen("home"); setToast(""); setCopyFallback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reportText = () => {
    const copy = resultCopy(score);
    const blocks = [...new Set(questions.map((question) => question.block))];
    const blockLines = blocks.map((block) => {
      const blockQuestions = questions.filter((question) => question.block === block);
      const correct = blockQuestions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length;
      return `— ${block}: ${correct} из ${blockQuestions.length}`;
    });
    const strongTopics = questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).map((question) => question.topic);
    const repeatTopics = questions.filter((question) => !question.check(answers[question.id] ?? "")).map((question) => question.topic);
    return [
      "Диагностика «Что повторить перед 6 классом?»",
      `Ученик: ${studentName.trim()}`,
      `Результат: ${score} из ${questions.length}`,
      `Отмечено «Не знаю»: ${unknownCount}`,
      `Вывод: ${copy.title}`,
      `Результаты по разделам:\n${blockLines.join("\n")}`,
      `Получается уверенно:\n${strongTopics.length ? strongTopics.map((topic) => `— ${topic}`).join("\n") : "—"}`,
      `Стоит повторить:\n${repeatTopics.length ? repeatTopics.map((topic) => `— ${topic}`).join("\n") : "— обязательных тем для повторения нет"}`,
      `Работа выполнена: ${new Date().toLocaleString("ru-RU")}`,
    ].join("\n\n");
  };

  const copyResult = async (message = "Результат скопирован") => {
    try { await navigator.clipboard.writeText(reportText()); setToast(message); setCopyFallback(""); }
    catch { setToast("Браузер запретил автоматическое копирование"); setCopyFallback(reportText()); }
    window.setTimeout(() => setToast(""), 4000);
  };

  const downloadResult = () => {
    const rows = questions.map((question) => {
      const studentAnswer = dontKnow[question.id] ? "Не знаю, как решить" : formatStudentAnswer(question, answers[question.id]);
      const status = dontKnow[question.id] ? "Не знаю" : question.check(answers[question.id] ?? "") ? "Правильно" : "Неправильно";
      return `<tr><td>${question.id}</td><td>${escapeHtml(question.topic)}</td><td>${escapeHtml(studentAnswer)}</td><td>${escapeHtml(question.correctLabel)}</td><td>${status}</td></tr>`;
    }).join("");
    const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Результат диагностики</title><style>body{font-family:Arial,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;color:#28222c}h1{color:#674fa6}pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}@media print{button{display:none}}</style><body><h1>Что повторить перед 6 классом?</h1><pre>${escapeHtml(reportText())}</pre><h2>Все задания</h2><table><tr><th>№</th><th>Тема</th><th>Ответ ученика</th><th>Правильный ответ</th><th>Статус</th></tr>${rows}</table><button onclick="window.print()">Печать / сохранить как PDF</button></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `Перед_6_классом_${studentName.trim().replace(/\s+/g, "_") || "ученик"}.html`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (screen === "test") {
    const question = questions[current];
    const answer = answers[question.id] ?? (question.type === "multi" ? [] : "");
    const hasAnswer = hasAnswerFor(question);
    const goNext = () => {
      if (!hasAnswer) return;
      if (current === questions.length - 1) setScreen("review"); else setCurrent((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return <main className="test-shell">
      <header className="site-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Начать сначала</button></header>
      <section className="test-wrap">
        <div className="progress-line"><div><span>Задание {current + 1} из {questions.length}</span><small>{answeredCount} ответов сохранено</small></div><strong>{Math.round(((current + 1) / questions.length) * 100)}%</strong></div>
        <div className="progress-track"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }}/></div>
        <nav className="question-number-nav" aria-label="Переход по заданиям">
          {questions.map((item, index) => {
            const stateClass = dontKnow[item.id] ? "unknown" : answerHasContent(item, answers[item.id]) ? "answered" : "empty";
            return <button type="button" className={`${stateClass} ${index === current ? "current" : ""}`} key={item.id} onClick={() => { setCurrent(index); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{item.id}</button>;
          })}
        </nav>
        <article className="question-card">
          <p className="question-eyebrow">{question.eyebrow}</p><h1>{question.prompt}</h1>
          {question.expression && <div className="expression"><MathFormula expression={question.expression}/></div>}
          {question.type === "table" && <div className="data-table" role="table">{[["Понедельник","18 страниц"],["Вторник","25 страниц"],["Среда","17 страниц"],["Четверг","30 страниц"]].map(([day,pages]) => <div role="row" key={day}><span role="cell">{day}</span><b role="cell">{pages}</b></div>)}</div>}
          {(question.type === "text" || question.type === "table") && <label className="answer-field"><span>Твой ответ</span><input inputMode={question.block === "Обыкновенные дроби" ? "text" : "decimal"} autoFocus value={dontKnow[question.id] ? "" : typeof answer === "string" ? answer : ""} onChange={(event) => updateAnswer(question.id, event.target.value)} placeholder="Введи ответ" onKeyDown={(event) => { if (event.key === "Enter" && hasAnswer) goNext(); }}/></label>}
          {question.type === "choice" && <div className="options">{question.options?.map((option) => <button type="button" className={`option ${answer === option ? "selected" : ""}`} key={option} onClick={() => updateAnswer(question.id, option)}><span className="radio-dot"/>{option}</button>)}</div>}
          {question.type === "multi" && <div className="number-options">{question.options?.map((option) => { const selected = Array.isArray(answer) && answer.includes(option); return <button type="button" className={selected ? "selected" : ""} key={option} onClick={() => updateAnswer(question.id, selected ? (answer as string[]).filter((item) => item !== option) : [...(answer as string[]), option])}>{option}</button>; })}</div>}
          {question.type === "double" && <div className="double-fields">{question.fields?.map((field, index) => { const parts = typeof answer === "string" ? answer.split("|") : ["",""]; return <label className="answer-field" key={field.key}><span>{field.label}</span><div className="input-with-suffix"><input inputMode="numeric" value={dontKnow[question.id] ? "" : parts[index] || ""} onChange={(event) => { const next = [...parts]; next[index] = event.target.value; updateAnswer(question.id, next.join("|")); }} placeholder="Ответ"/><b>{field.suffix}</b></div></label>; })}</div>}
          {question.hint && <p className="field-hint">{question.hint}</p>}
          <div className="test-actions"><button className="button secondary" disabled={current === 0} onClick={() => { setCurrent((value) => value - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>← Назад</button><button className={`button dont-know-button ${dontKnow[question.id] ? "active-dont-know" : ""}`} onClick={() => markUnknown(question)}>{dontKnow[question.id] ? "Отмечено: не знаю" : "Не знаю, как решить"}</button><button className="button primary" disabled={!hasAnswer} onClick={goNext}>{current === questions.length - 1 ? "К обзору" : "Далее"} →</button></div>
        </article>
        <p className="save-note">Ответы и прогресс сохраняются на этом устройстве автоматически</p>
      </section>
    </main>;
  }

  if (screen === "review") {
    const missing = questions.filter((question) => !hasAnswerFor(question));
    const markMissingUnknown = () => {
      setDontKnow((previous) => { const next = { ...previous }; missing.forEach((question) => { next[question.id] = true; }); return next; });
      setAnswers((previous) => { const next = { ...previous }; missing.forEach((question) => { next[question.id] = question.type === "multi" ? [] : ""; }); return next; });
    };
    const finish = () => { if (!window.confirm("После завершения изменить ответы будет нельзя. Узнать результат?")) return; setScreen("result"); localStorage.removeItem(STORAGE_KEY); window.scrollTo({ top: 0, behavior: "smooth" }); };
    return <main className="result-page review-overview"><header className="compact-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header><section className="result-section overview-heading"><p className="kicker">Перед завершением</p><h1>Обзор всех 20 заданий</h1><p>{missing.length ? `Без ответа осталось: ${missing.length}. Вернись к ним или засчитай как «Не знаю, как решить».` : "Все задания заполнены или отмечены как «Не знаю, как решить»."}</p></section><section className="result-section overview-grid">{questions.map((question, index) => { const stateClass = dontKnow[question.id] ? "unknown" : answerHasContent(question, answers[question.id]) ? "answered" : "empty"; return <button className={`overview-item ${stateClass}`} key={question.id} onClick={() => { setCurrent(index); setScreen("test"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><b>№{question.id}</b></button>; })}</section><section className="result-section review-finish">{missing.length > 0 && <button className="button secondary" onClick={markMissingUnknown}>Засчитать пропуски как «Не знаю»</button>}<button className="button primary" disabled={missing.length > 0} onClick={finish}>Узнать результат</button></section></main>;
  }

  if (screen === "result") {
    const copy = resultCopy(score);
    const blocks = [...new Set(questions.map((question) => question.block))];
    const strongTopics = questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).map((question) => question.topic);
    const missed = questions.filter((question) => !question.check(answers[question.id] ?? ""));
    const telegramMessage = encodeURIComponent(`Здравствуйте! Меня зовут ${studentName.trim()}. Результат моей диагностики перед 6 классом — ${score} из ${questions.length}. Хочу обсудить план повторения.`);
    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${telegramMessage}`;
    return <main className="result-page">
      <header className="compact-header result-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Пройти ещё раз</button></header>
      <section className="result-hero"><div className="score-orbit"><strong>{score}</strong><span>из 20</span></div><div><p className="kicker">Диагностика завершена</p><h1>{studentName.trim()}, {copy.title.toLowerCase()}</h1><p>{copy.text}</p><small>{copy.extra}</small></div></section>
      <section className="result-section result-stats oge-stats"><article><strong>{score}/{questions.length}</strong><span>правильных ответов</span></article><article><strong>{unknownCount}</strong><span>«не знаю»</span></article><article><strong>{questions.length - score - unknownCount}</strong><span>ошибок</span></article></section>
      <section className="result-section"><div className="section-heading"><div><p className="kicker">Персональный разбор</p><h2>{studentName.trim()}, вот твой результат по темам</h2></div><span>Рекомендации только по твоим ответам</span></div><div className="block-results">{blocks.map((block) => { const blockQuestions = questions.filter((question) => question.block === block); const correct = blockQuestions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length; const ratio = correct / blockQuestions.length; const isSingle = blockQuestions.length === 1; const status = ratio === 1 ? "Получается отлично" : isSingle ? "Стоит проверить тему" : ratio >= 0.5 ? "Стоит немного повторить" : "Важно восстановить"; return <article className={`block-card ${ratio === 1 ? "great" : ratio >= 0.5 ? "medium" : "restore"}`} key={block}><div className="block-topline"><span>{correct}/{blockQuestions.length}</span><b>{status}</b></div><h3>{block}</h3><p>{ratio === 1 ? "Здесь всё уверенно — можно двигаться дальше." : isSingle ? "В этом задании возникла трудность — стоит ещё раз проверить тему." : blockCopy[block]}</p></article>; })}</div></section>
      <section className="result-section split-result"><article className="topic-panel strong-panel"><p className="kicker">Сильные темы</p><h2>Уже получается</h2><div className="topic-tags">{strongTopics.map((topic) => <span key={topic}>✓ {topic}</span>)}{!strongTopics.length && <p>Сейчас важнее спокойно восстановить базу — начнём с главного.</p>}</div></article><article className="topic-panel repeat-panel"><p className="kicker">{missed.length ? "Точки роста" : "Можно двигаться дальше"}</p><h2>{missed.length ? "Что повторить" : "Тем для обязательного повторения нет"}</h2><div className="topic-tags">{missed.length ? missed.map((question) => <span key={question.id}>{question.topic}</span>) : <p>Все задания выполнены правильно. Можно переходить к новым темам 6 класса без повторения всей программы.</p>}</div></article></section>
      <section className="result-section"><div className="section-heading"><div><p className="kicker">Все задания</p><h2>Посмотри ответы и статусы</h2></div></div><div className="overview-grid result-overview-grid">{questions.map((question) => { const isCorrect = !dontKnow[question.id] && question.check(answers[question.id] ?? ""); const stateClass = dontKnow[question.id] ? "unknown" : isCorrect ? "correct" : "wrong"; return <details className={`overview-item result-answer-item ${stateClass}`} key={question.id}><summary><b>№{question.id}</b><span>{dontKnow[question.id] ? "Не знаю" : isCorrect ? "Правильно" : "Неправильно"}</span></summary><div><p><b>Тема:</b> {question.topic}</p><p><b>Твой ответ:</b> {dontKnow[question.id] ? "Не знаю, как решить" : formatStudentAnswer(question, answers[question.id])}</p><p><b>Правильный ответ:</b> {question.correctLabel}</p></div></details>; })}</div></section>
      <section className="final-cta"><div><p className="kicker">Следующий шаг</p><h2>Хочешь повторить математику без стресса?</h2><p>{copy.card}</p></div><div className="cta-actions"><button className="button secondary" onClick={() => copyResult()}>Скопировать результат</button><button className="button secondary" onClick={downloadResult}>Скачать результат</button><a className="button primary" href={telegramUrl} target="_blank" rel="noreferrer" onClick={() => copyResult("Результат скопирован. Вставь его в сообщение")}>{copy.cta}</a><button className="button secondary" onClick={restart}>Пройти тест ещё раз</button></div>{toast && <p className="copy-toast" role="status">{toast}</p>}{copyFallback && <div className="copy-fallback"><textarea readOnly value={copyFallback}/><button className="button secondary" onClick={() => copyResult()}>Скопировать вручную</button></div>}</section>
    </main>;
  }

  return <main className="home-page"><header className="site-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="header-cta" onClick={start} disabled={!studentName.trim() || !accepted}>Начать диагностику</button></header><section className="hero"><div className="hero-copy"><div className="soft-pill">Бесплатная диагностика перед учебным годом</div><h1>Что повторить<br/>перед <em>6 классом?</em></h1><p className="hero-lead">Пройди небольшую диагностику и узнай, какие темы 5 класса ты помнишь, а что стоит освежить перед новым учебным годом.</p><div className="calm-note"><span>♡</span><p>Это не контрольная и не экзамен. Здесь нет оценок — только понятный результат и рекомендации.</p></div><div className="name-start-card"><label htmlFor="student-name">Как тебя зовут?</label><input id="student-name" type="text" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Введи имя" autoComplete="given-name"/><div className="start-guidance"><h2>Перед началом</h2><ul><li>Приготовь лист бумаги для вычислений.</li><li>Выполняй задания самостоятельно, без калькулятора, учебника и подсказок.</li><li>Строгого ограничения времени нет.</li><li>Не стирай неудачные попытки — они помогают увидеть, что стоит повторить.</li><li>Если не знаешь ответ, нажми «Не знаю, как решить».</li></ul><label className="consent-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)}/><span>Я прочитал(а) рекомендации и готов(а) начать</span></label></div><button className="button primary big" onClick={start} disabled={!studentName.trim() || !accepted}>Начать диагностику <span>→</span></button><p className="name-start-meta"><b>20 заданий</b><span>·</span> около 20 минут <span>·</span> результат сразу</p></div></div><MathDoodle/></section><section className="how"><div className="section-heading home-heading"><div><p className="kicker">Всё просто</p><h2>Как это работает</h2></div><p>Без регистрации, калькулятора и лишнего волнения</p></div><div className="steps">{[["01","Решаешь задания","20 коротких заданий по основным темам 5 класса.","violet"],["02","Получаешь результат","Сразу видишь, что уже получается уверенно.","blue"],["03","Знаешь, что повторить","Получаешь рекомендации именно по своим ошибкам.","pink"]].map(([number,title,text,color]) => <article className={`step-card ${color}`} key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="tip"><span>✦</span><p><b>Небольшой совет:</b> постарайся решить задания самостоятельно. Так рекомендации получатся точнее.</p></div></section><section className="class-section"><div className="section-heading"><div><p className="kicker">Диагностики</p><h2>Выбери свой класс</h2></div><p>Выбирай диагностику по следующему учебному этапу</p></div><div className="class-grid"><button className="class-card active" onClick={start}><span>Доступно сейчас</span><b>Перехожу в 6 класс</b><i>Программа 5 класса →</i></button><a className="class-card active grade-seven-card" href="/7"><span>Доступно сейчас</span><b>Перехожу в 7 класс</b><i>Программа 6 класса →</i></a><a className="class-card active grade-eight-card" href="/8"><span>Доступно сейчас</span><b>Перехожу в 8 класс</b><i>Программа 7 класса →</i></a><a className="class-card active" href="/9"><span>Доступно сейчас</span><b>Перехожу в 9 класс</b><i>Программа 8 класса →</i></a><a className="class-card active" href="/oge"><span>Доступно сейчас</span><b>Начинаю подготовку к ОГЭ</b><i>Входная диагностика →</i></a><a className="class-card active after-nine-card" href="/after9"><span>Доступно сейчас</span><b>Перед 10 классом или колледжем</b><i>Программа 5–9 классов →</i></a>{[5,10,11].map((grade) => <div className="class-card soon" key={grade}><span>Скоро</span><b>Перехожу в {grade} класс</b><i>Диагностика готовится</i></div>)}<div className="class-card soon college"><span>Скоро</span><b>Учусь в колледже</b><i>Диагностика готовится</i></div></div></section><footer><div className="brand"><span className="brand-mark">∿</span><span>Математика без стресса</span></div><p>Проверяем знания, а не ставим оценки ♡</p></footer></main>;
}
