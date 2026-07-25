"use client";

import { useEffect, useMemo, useState } from "react";

type Answer = string | string[];
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

const TELEGRAM_URL = "https://t.me/m/8wQr09o1NDEy";
const STORAGE_KEY = "math-diagnostic-6-v1";

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "").replace(",", ".");

function asNumber(value: string) {
  const parsed = Number(normalize(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function asFraction(value: string) {
  const cleaned = normalize(value).replace(/[()]/g, "");
  const mixed = cleaned.match(/^(-?\d+)[\s_]+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (!denominator) return null;
    return whole + Math.sign(whole || 1) * numerator / denominator;
  }
  const simpleMixed = value.trim().replace(",", ".").match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (simpleMixed) {
    const whole = Number(simpleMixed[1]);
    const numerator = Number(simpleMixed[2]);
    const denominator = Number(simpleMixed[3]);
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
  {
    id: 1,
    eyebrow: "Порядок действий",
    prompt: "Вычисли:",
    expression: "840 : 7 + 36 · 5 − 48",
    type: "text",
    topic: "Натуральные числа и порядок действий",
    block: "Натуральные числа и вычисления",
    correctLabel: "252",
    check: equalsNumber(252),
  },
  {
    id: 2,
    eyebrow: "Распределительное свойство",
    prompt: "Вычисли наиболее удобным способом:",
    expression: "27 · 46 + 73 · 46",
    type: "text",
    topic: "Свойства действий и упрощение выражений",
    block: "Натуральные числа и вычисления",
    correctLabel: "4600",
    check: equalsNumber(4600),
  },
  {
    id: 3,
    eyebrow: "Степень числа",
    prompt: "Вычисли:",
    expression: "3³ + 72 : 8",
    type: "text",
    topic: "Степень и порядок действий",
    block: "Натуральные числа и вычисления",
    correctLabel: "36",
    check: equalsNumber(36),
  },
  {
    id: 4,
    eyebrow: "Признаки делимости",
    prompt: "Выбери все числа, которые делятся одновременно на 2 и на 3:",
    type: "multi",
    options: ["126", "235", "318", "440", "513"],
    topic: "Признаки делимости",
    block: "Делимость",
    correctLabel: "126 и 318",
    check: (answer) =>
      Array.isArray(answer) &&
      [...answer].sort().join(",") === ["126", "318"].sort().join(","),
  },
  {
    id: 5,
    eyebrow: "Делители числа",
    prompt: "Запиши все делители числа 18 через запятую:",
    type: "text",
    hint: "Порядок чисел не важен",
    topic: "Делители и кратные",
    block: "Делимость",
    correctLabel: "1, 2, 3, 6, 9, 18",
    check: (answer) => {
      if (typeof answer !== "string") return false;
      const values = answer
        .split(/[,; ]+/)
        .filter(Boolean)
        .map(Number)
        .sort((a, b) => a - b);
      return values.join(",") === "1,2,3,6,9,18";
    },
  },
  {
    id: 6,
    eyebrow: "Сокращение дробей",
    prompt: "Сократи дробь:",
    expression: "24/36",
    type: "text",
    hint: "Ответ можно записать через /",
    topic: "Сокращение дробей",
    block: "Обыкновенные дроби",
    correctLabel: "2/3",
    check: equalsFraction(2 / 3),
  },
  {
    id: 7,
    eyebrow: "Сравнение дробей",
    prompt: "Сравни дроби:",
    expression: "5/8 и 7/12",
    type: "choice",
    options: ["5/8 > 7/12", "5/8 < 7/12", "5/8 = 7/12"],
    topic: "Сравнение дробей",
    block: "Обыкновенные дроби",
    correctLabel: "5/8 > 7/12",
    check: (answer) => answer === "5/8 > 7/12",
  },
  {
    id: 8,
    eyebrow: "Вычитание дробей",
    prompt: "Вычисли:",
    expression: "5/6 − 1/4",
    type: "text",
    topic: "Общий знаменатель и действия с дробями",
    block: "Обыкновенные дроби",
    correctLabel: "7/12",
    check: equalsFraction(7 / 12),
  },
  {
    id: 9,
    eyebrow: "Смешанные числа",
    prompt: "Вычисли:",
    expression: "2 3/5 + 1 7/10",
    type: "text",
    hint: "Например: 4 3/10 или 43/10",
    topic: "Смешанные числа",
    block: "Обыкновенные дроби",
    correctLabel: "4 3/10",
    check: equalsFraction(4.3),
  },
  {
    id: 10,
    eyebrow: "Умножение дробей",
    prompt: "Вычисли:",
    expression: "4/9 · 3/8",
    type: "text",
    topic: "Умножение дробей",
    block: "Обыкновенные дроби",
    correctLabel: "1/6",
    check: equalsFraction(1 / 6),
  },
  {
    id: 11,
    eyebrow: "Деление дробей",
    prompt: "Вычисли:",
    expression: "5/6 : 10/9",
    type: "text",
    topic: "Деление дробей",
    block: "Обыкновенные дроби",
    correctLabel: "3/4",
    check: equalsFraction(3 / 4),
  },
  {
    id: 12,
    eyebrow: "Нахождение части числа",
    prompt:
      "В коробке было 36 конфет. Маша съела 5/12 всех конфет. Сколько конфет она съела?",
    type: "text",
    topic: "Нахождение части от числа",
    block: "Обыкновенные дроби",
    correctLabel: "15",
    check: equalsNumber(15),
  },
  {
    id: 13,
    eyebrow: "Нахождение целого по части",
    prompt:
      "После того как из книги прочитали 48 страниц, оказалось, что прочитано 3/8 всей книги. Сколько страниц в книге?",
    type: "text",
    topic: "Нахождение целого по его части",
    block: "Обыкновенные дроби",
    correctLabel: "128",
    check: equalsNumber(128),
  },
  {
    id: 14,
    eyebrow: "Десятичные дроби",
    prompt: "Вычисли:",
    expression: "7,35 − 2,8 + 0,45",
    type: "text",
    hint: "Можно использовать запятую или точку",
    topic: "Сложение и вычитание десятичных дробей",
    block: "Десятичные дроби",
    correctLabel: "5",
    check: equalsNumber(5),
  },
  {
    id: 15,
    eyebrow: "Умножение десятичных дробей",
    prompt: "Вычисли:",
    expression: "4,8 · 0,25",
    type: "text",
    topic: "Умножение десятичных дробей",
    block: "Десятичные дроби",
    correctLabel: "1,2",
    check: equalsNumber(1.2),
  },
  {
    id: 16,
    eyebrow: "Округление",
    prompt: "Округли число 37,846 до десятых.",
    type: "text",
    topic: "Округление чисел",
    block: "Десятичные дроби",
    correctLabel: "37,8",
    check: equalsNumber(37.8),
  },
  {
    id: 17,
    eyebrow: "Буквенное выражение",
    prompt: "Найди значение выражения, если a = 7:",
    expression: "5a − 12",
    type: "text",
    topic: "Буквенные выражения",
    block: "Выражения и уравнения",
    correctLabel: "23",
    check: equalsNumber(23),
  },
  {
    id: 18,
    eyebrow: "Уравнение",
    prompt: "Реши уравнение:",
    expression: "7x − 18 = 45",
    type: "text",
    topic: "Уравнения",
    block: "Выражения и уравнения",
    correctLabel: "x = 9",
    check: (answer) =>
      typeof answer === "string" &&
      asNumber(answer.toLowerCase().replace("x", "").replace("=", "")) === 9,
  },
  {
    id: 19,
    eyebrow: "Геометрия",
    prompt:
      "Длина прямоугольника равна 12 см, а ширина — 7 см. Найди его периметр и площадь.",
    type: "double",
    fields: [
      { key: "p", label: "Периметр", suffix: "см" },
      { key: "s", label: "Площадь", suffix: "см²" },
    ],
    topic: "Периметр и площадь прямоугольника",
    block: "Геометрия",
    correctLabel: "периметр — 38 см, площадь — 84 см²",
    check: (answer) =>
      typeof answer === "string" &&
      asNumber(answer.split("|")[0] || "") === 38 &&
      asNumber(answer.split("|")[1] || "") === 84,
  },
  {
    id: 20,
    eyebrow: "Работа с таблицей",
    prompt: "Сколько всего страниц Дима прочитал за четыре дня?",
    type: "table",
    topic: "Таблицы и работа с информацией",
    block: "Работа с информацией",
    correctLabel: "90",
    check: equalsNumber(90),
  },
];

const blockCopy: Record<string, string> = {
  "Натуральные числа и вычисления":
    "Освежи порядок действий, степени и удобные способы вычислений — это поможет увереннее работать с более сложными выражениями.",
  Делимость:
    "Повтори признаки делимости, делители и кратные. На этой базе в 6 классе будут изучаться разложение на простые множители, НОД и НОК.",
  "Обыкновенные дроби":
    "Повтори сокращение дробей и приведение к общему знаменателю. Эти навыки понадобятся уже в начале 6 класса при действиях со смешанными числами.",
  "Десятичные дроби":
    "Повтори действия с десятичными дробями и округление. Они понадобятся в задачах на проценты, среднее арифметическое и пропорции.",
  "Выражения и уравнения":
    "Освежи работу с буквенными выражениями и простыми уравнениями. В 6 классе появятся раскрытие скобок, подобные слагаемые и более сложные уравнения.",
  Геометрия:
    "Повтори формулы периметра и площади прямоугольника. Обращай внимание на единицы измерения: сантиметры и квадратные сантиметры — не одно и то же.",
  "Работа с информацией":
    "Потренируйся читать таблицы и собирать данные из нескольких строк — этот навык пригодится в задачах и диаграммах.",
};

function resultCopy(score: number) {
  if (score <= 7)
    return {
      title: "Давай восстановим базу вместе",
      text: "Похоже, некоторые темы 5 класса успели забыться. Это нормально: после каникул многое приходится освежать. Перед 6 классом особенно важно повторить вычисления, дроби и простые уравнения.",
      extra:
        "Не нужно пытаться повторить весь учебник самостоятельно. Можно спокойно разобрать основные пробелы и начать новый учебный год увереннее.",
      cta: "Повторить вместе",
      card: "Вместе восстановим основные темы 5 класса и подготовимся к началу учебного года.",
    };
  if (score <= 13)
    return {
      title: "Хорошая база, но кое-что стоит повторить",
      text: "Большую часть программы 5 класса ты помнишь. Осталось освежить несколько тем, чтобы в 6 классе они не мешали разбираться в новом материале.",
      extra: "Посмотри персональные рекомендации ниже — повторять всё подряд не понадобится.",
      cta: "Подтянуть сложные темы",
      card: "Разберём только те темы, в которых остались пробелы, без повторения всего учебника.",
    };
  if (score <= 17)
    return {
      title: "Ты хорошо готов к 6 классу",
      text: "Основные темы 5 класса ты помнишь уверенно. Осталось повторить отдельные моменты — и можно двигаться дальше.",
      extra:
        "На занятиях можно быстро закрыть оставшиеся пробелы и заранее познакомиться с темами 6 класса.",
      cta: "Подготовиться к 6 классу",
      card: "Быстро повторим сложные моменты и начнём готовиться к программе 6 класса.",
    };
  return {
    title: "Отличный результат!",
    text: "У тебя крепкая база за 5 класс. Можно разобрать допущенные ошибки и начинать изучать новые темы: смешанные числа, пропорции, отрицательные числа и более сложные уравнения.",
    extra: "Ты уже готов двигаться дальше — без спешки и лишнего повторения.",
    cta: "Начать темы 6 класса",
    card: "Можно двигаться дальше и заранее изучать темы 6 класса.",
  };
}

function MathDoodle() {
  return (
    <div className="doodle" aria-hidden="true">
      <span className="doodle-plus">+</span>
      <span className="doodle-pi">π</span>
      <span className="doodle-frac">
        <b>5</b>
        <i />
        <b>8</b>
      </span>
      <div className="doodle-paper">
        <div />
        <div />
        <div />
        <span>×</span>
      </div>
      <span className="doodle-dot dot-one" />
      <span className="doodle-dot dot-two" />
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"home" | "test" | "review" | "result">("home");
    const [studentName, setStudentName] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setCurrent(Math.min(parsed.current || 0, questions.length - 1));
      }
    } catch {
      // A fresh start is always available if stored data is malformed.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || screen === "result") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, current }));
  }, [answers, current, hydrated, screen]);

  const score = useMemo(
    () => questions.filter((question) => question.check(answers[question.id] ?? "")).length,
    [answers],
  );

  const answeredCount = useMemo(
    () =>
      questions.filter((question) => {
        const answer = answers[question.id];
        return Array.isArray(answer) ? answer.length > 0 : Boolean(answer?.trim());
      }).length,
    [answers],
  );

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (screen === "test") {
    const question = questions[current];
    const answer = answers[question.id] ?? (question.type === "multi" ? [] : "");
    const hasAnswer = Array.isArray(answer) ? answer.length > 0 : answer.trim().length > 0;

    const update = (value: Answer) =>
      setAnswers((previous) => ({ ...previous, [question.id]: value }));

    return (
      <main className="test-shell">
        <header className="compact-header">
          <button className="brand brand-button" onClick={() => setScreen("home")}>
            <span className="brand-mark">∿</span>
            <span>Математика без стресса</span>
          </button>
          <button className="text-button" onClick={restart}>
            Начать сначала
          </button>
        </header>

        <section className="test-wrap">
          <div className="progress-line">
            <div>
              <span>Задание {current + 1} из {questions.length}</span>
              <small>{answeredCount} ответов сохранено</small>
            </div>
            <strong>{Math.round(((current + 1) / questions.length) * 100)}%</strong>
          </div>
          <div className="progress-track" aria-label={`Прогресс: задание ${current + 1} из 20`}>
            <span style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>

          <article className="question-card">
            <p className="question-eyebrow">{question.eyebrow}</p>
            <h1>{question.prompt}</h1>
            {question.expression && <div className="expression">{question.expression}</div>}

            {question.type === "table" && (
              <div className="data-table" role="table" aria-label="Страницы по дням">
                {[
                  ["Понедельник", "18 страниц"],
                  ["Вторник", "25 страниц"],
                  ["Среда", "17 страниц"],
                  ["Четверг", "30 страниц"],
                ].map(([day, pages]) => (
                  <div role="row" key={day}>
                    <span role="cell">{day}</span>
                    <b role="cell">{pages}</b>
                  </div>
                ))}
              </div>
            )}

            {(question.type === "text" || question.type === "table") && (
              <label className="answer-field">
                <span>Твой ответ</span>
                <input
                  inputMode="decimal"
                  autoFocus
                  value={typeof answer === "string" ? answer : ""}
                  onChange={(event) => update(event.target.value)}
                  placeholder="Введи ответ"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && hasAnswer) {
                      if (current === questions.length - 1) setScreen("review");
                      else setCurrent((value) => value + 1);
                    }
                  }}
                />
              </label>
            )}

            {question.type === "choice" && (
              <div className="options">
                {question.options?.map((option) => (
                  <button
                    className={`option ${answer === option ? "selected" : ""}`}
                    key={option}
                    onClick={() => update(option)}
                  >
                    <span className="radio-dot" />
                    {option}
                  </button>
                ))}
              </div>
            )}

            {question.type === "multi" && (
              <div className="number-options">
                {question.options?.map((option) => {
                  const selected = Array.isArray(answer) && answer.includes(option);
                  return (
                    <button
                      className={selected ? "selected" : ""}
                      key={option}
                      onClick={() =>
                        update(
                          selected
                            ? (answer as string[]).filter((item) => item !== option)
                            : [...(answer as string[]), option],
                        )
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {question.type === "double" && (
              <div className="double-fields">
                {question.fields?.map((field, index) => {
                  const parts = typeof answer === "string" ? answer.split("|") : ["", ""];
                  return (
                    <label className="answer-field" key={field.key}>
                      <span>{field.label}</span>
                      <div className="input-with-suffix">
                        <input
                          inputMode="numeric"
                          value={parts[index] || ""}
                          onChange={(event) => {
                            const next = [...parts];
                            next[index] = event.target.value;
                            update(next.join("|"));
                          }}
                          placeholder="Ответ"
                        />
                        <b>{field.suffix}</b>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {question.hint && <p className="field-hint">{question.hint}</p>}

            <div className="test-actions">
              <button
                className="button secondary"
                disabled={current === 0}
                onClick={() => setCurrent((value) => value - 1)}
              >
                ← Назад
              </button>
              <button
                className="button primary"
                disabled={!hasAnswer}
                onClick={() => {
                  if (current === questions.length - 1) setScreen("review");
                  else setCurrent((value) => value + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {current === questions.length - 1 ? "Завершить" : "Далее"} →
              </button>
            </div>
          </article>
          <p className="save-note">Ответы сохраняются на этом устройстве автоматически</p>
        </section>
      </main>
    );
  }

  if (screen === "review") {
    const missing = questions.filter((question) => {
      const answer = answers[question.id];
      return Array.isArray(answer) ? answer.length === 0 : !answer?.trim();
    });
    return (
      <main className="center-screen">
        <section className="review-card">
          <div className="review-icon">✓</div>
          <p className="kicker">Финишная прямая</p>
          <h1>Всё готово! Проверим ответы?</h1>
          <p>
            Ты ответил на {answeredCount} из 20 заданий.
            {missing.length
              ? ` Можно вернуться к ${missing.length === 1 ? "пропущенному заданию" : "пропущенным заданиям"}.`
              : " Все ответы на месте."}
          </p>
          {missing.length > 0 && (
            <div className="missing-list">
              {missing.map((question) => (
                <button
                  key={question.id}
                  onClick={() => {
                    setCurrent(question.id - 1);
                    setScreen("test");
                  }}
                >
                  № {question.id}
                </button>
              ))}
            </div>
          )}
          <div className="review-actions">
            <button
              className="button secondary"
              onClick={() => {
                setCurrent(19);
                setScreen("test");
              }}
            >
              Вернуться к тесту
            </button>
            <button
              className="button primary"
              disabled={missing.length > 0}
              onClick={() => {
                setScreen("result");
                localStorage.removeItem(STORAGE_KEY);
                window.scrollTo({ top: 0 });
              }}
            >
              Узнать результат
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const copy = resultCopy(score);
    const blocks = [...new Set(questions.map((question) => question.block))];
    const strongTopics = questions
      .filter((question) => question.check(answers[question.id] ?? ""))
      .map((question) => question.topic);
    const missed = questions.filter((question) => !question.check(answers[question.id] ?? ""));

    return (
      <main className="result-page">
        <header className="compact-header result-header">
          <div className="brand">
            <span className="brand-mark">∿</span>
            <span>Математика без стресса</span>
          </div>
          <button className="text-button" onClick={restart}>
            Пройти ещё раз
          </button>
        </header>

        <section className="result-hero">
          <div className="score-orbit">
            <strong>{score}</strong>
            <span>из 20</span>
          </div>
          <div>
                        <p className="kicker">Диагностика завершена</p>
            <h1>{studentName.trim()}, {copy.title.toLowerCase()}</h1>
            <p>{copy.text}</p>
            <small>{copy.extra}</small>
          </div>
        </section>

        <section className="result-section">
          <div className="section-heading">
            <div>
              <p className="kicker">Персональный разбор</p>
              <h2>{studentName.trim()}, вот твой результат по темам</h2>
            </div>
            <span>Рекомендации только по твоим ответам</span>
          </div>
          <div className="block-results">
            {blocks.map((block) => {
              const blockQuestions = questions.filter((question) => question.block === block);
              const correct = blockQuestions.filter((question) =>
                question.check(answers[question.id] ?? ""),
              ).length;
              const ratio = correct / blockQuestions.length;
              const status =
                ratio === 1
                  ? "Получается отлично"
                  : ratio >= 0.5
                    ? "Стоит немного повторить"
                    : "Важно восстановить";
              return (
                <article
                  className={`block-card ${ratio === 1 ? "great" : ratio >= 0.5 ? "medium" : "restore"}`}
                  key={block}
                >
                  <div className="block-topline">
                    <span>{correct}/{blockQuestions.length}</span>
                    <b>{status}</b>
                  </div>
                  <h3>{block}</h3>
                  <p>{ratio === 1 ? "Здесь всё уверенно — можно двигаться дальше." : blockCopy[block]}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="result-section split-result">
          <article className="topic-panel strong-panel">
            <p className="kicker">Сильные темы</p>
            <h2>Уже получается</h2>
            <div className="topic-tags">
              {strongTopics.map((topic) => (
                <span key={topic}>✓ {topic}</span>
              ))}
              {!strongTopics.length && <p>Сейчас важнее спокойно восстановить базу — начнём с главного.</p>}
            </div>
          </article>
          <article className="topic-panel repeat-panel">
            <p className="kicker">Точки роста</p>
            <h2>Что повторить</h2>
            <div className="topic-tags">
              {missed.map((question) => (
                <span key={question.id}>{question.topic}</span>
              ))}
              {!missed.length && <p>Ошибок нет — отличный повод перейти к новым темам!</p>}
            </div>
          </article>
        </section>

        {missed.length > 0 && (
          <details className="mistakes result-section">
            <summary>Посмотреть ошибки и правильные ответы <span>({missed.length})</span></summary>
            <div>
              {missed.map((question) => (
                <article key={question.id}>
                  <span>Задание {question.id}</span>
                  <h3>{question.eyebrow}</h3>
                  <p>Правильный ответ: <b>{question.correctLabel}</b></p>
                </article>
              ))}
            </div>
          </details>
        )}

        <section className="final-cta">
          <div>
            <p className="kicker">Следующий шаг</p>
            <h2>Хочешь повторить математику без стресса?</h2>
            <p>{copy.card}</p>
          </div>
          <div className="cta-actions">
            <a className="button primary" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
              {copy.cta}
            </a>
            <button className="button secondary" onClick={restart}>
              Пройти тест ещё раз
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="home-page">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </div>
        <button className="header-cta" onClick={start}>
          Начать диагностику
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="soft-pill">Бесплатная диагностика перед учебным годом</div>
          <h1>
            Что повторить
            <br />
            перед <em>6 классом?</em>
          </h1>
          <p className="hero-lead">
            Пройди небольшую диагностику и узнай, какие темы 5 класса ты помнишь,
            а что стоит освежить перед новым учебным годом.
          </p>
          <div className="calm-note">
            <span>♡</span>
            <p>
              Это не контрольная и не экзамен. Здесь нет оценок — только понятный
              результат и рекомендации.
           </p>
</div>

<div className="name-start-card">
  <label htmlFor="student-name">Как тебя зовут?</label>

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
</div>

<div className="hero-actions">
          </div>
          <div className="hero-actions">
         <button
  className="button primary big"
  onClick={start}
  disabled={!studentName.trim()}
>
              Начать диагностику <span>→</span>
            </button>
            <p><b>20 заданий</b><span>·</span> около 20 минут <span>·</span> результат сразу</p>
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
          <p>Без регистрации, калькулятора и лишнего волнения</p>
        </div>
        <div className="steps">
          {[
            ["01", "Решаешь задания", "20 коротких заданий по основным темам 5 класса.", "violet"],
            ["02", "Получаешь результат", "Сразу видишь, что уже получается уверенно.", "blue"],
            ["03", "Знаешь, что повторить", "Получаешь рекомендации именно по своим ошибкам.", "pink"],
          ].map(([number, title, text, color]) => (
            <article className={`step-card ${color}`} key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="tip">
          <span>✦</span>
          <p>
            <b>Небольшой совет:</b> постарайся решить задания самостоятельно, без
            калькулятора и подсказок. Так рекомендации получатся точнее.
          </p>
        </div>
      </section>

      <section className="class-section">
        <div className="section-heading">
          <div>
            <p className="kicker">Диагностики</p>
            <h2>Выбери свой класс</h2>
          </div>
          <p>Скоро здесь появятся тесты и для других классов</p>
        </div>
        <div className="class-grid">
          <button className="class-card active" onClick={start}>
            <span>Доступно сейчас</span>
            <b>Перехожу в 6 класс</b>
            <i>Программа 5 класса →</i>
          </button>
          <a className="class-card active grade-seven-card" href="/7">
            <span>Доступно сейчас</span>
            <b>Перехожу в 7 класс</b>
            <i>Программа 6 класса →</i>
          </a>
          <a className="class-card active grade-eight-card" href="/8">
            <span>Доступно сейчас</span>
            <b>Перехожу в 8 класс</b>
            <i>Программа 7 класса →</i>
          </a>
          <a className="class-card active" href="/9">
            <span>Доступно сейчас</span>
            <b>Перехожу в 9 класс</b>
            <i>Программа 8 класса →</i>
          </a>
          <a className="class-card active" href="/oge">
            <span>Доступно сейчас</span>
            <b>Начинаю подготовку к ОГЭ</b>
            <i>Входная диагностика →</i>
          </a>
          <a className="class-card active after-nine-card" href="/after9">
            <span>Доступно сейчас</span>
            <b>Что повторить после 9 класса?</b>
            <i>Перед 10 классом или колледжем →</i>
          </a>
          {[5, 10, 11].map((grade) => (
            <div className="class-card soon" key={grade}>
              <span>Скоро</span>
              <b>Перехожу в {grade} класс</b>
              <i>Диагностика готовится</i>
            </div>
          ))}
          <div className="class-card soon college">
            <span>Скоро</span>
            <b>Учусь в колледже</b>
            <i>Диагностика готовится</i>
          </div>
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
