"use client";

import { useEffect, useMemo, useState } from "react";
import OgeReferenceModal from "../components/OgeReferenceModal";
import OtherDiagnostics from "../components/OtherDiagnostics";

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

type Photo = { id: string; name: string; type: string; data: string; bucket: string };
type StoredAnswer = {
  value: string;
  extra?: string;
  explanation?: string;
  dontKnow: boolean;
};
type Question = {
  id: number;
  block: "Блок А" | "Блок Б" | "Блок В";
  topic: string;
  prompt: string;
  expression?: string;
  type: "number" | "double" | "order" | "tariff" | "choice" | "interval" | "advanced16" | "advanced17" | "advanced18";
  options?: string[];
  diagram?: "right-triangle" | "line-graph" | "similarity" | "parallelogram-proof";
};
type AutoItem = {
  key: string;
  questionId: number;
  topic: string;
  block: "A" | "B";
  correct: boolean;
  dontKnow: boolean;
};

const STORAGE_KEY = "oge-entry-diagnostic-v2";
const TELEGRAM_URL = "https://t.me/vxoab";
const DB_NAME = "oge-diagnostic-photos";
const PHOTO_STORE = "photos";
const initialOrder = ["−√5", "−2,4", "−7/3"];
const correctOrder = ["−2,4", "−7/3", "−√5"];

const questions: Question[] = [
  { id: 1, block: "Блок А", topic: "Вычисления", prompt: "Вычислите:", expression: String.raw`(-1{,}2+0{,}45):\frac34`, type: "number" },
  { id: 2, block: "Блок А", topic: "Проценты", prompt: "После увеличения на 20% число стало равно 96. Найдите первоначальное число.", type: "number" },
  { id: 3, block: "Блок А", topic: "Степени и корни", prompt: "Вычислите:", expression: String.raw`\frac{25\cdot2^{-2}}{\sqrt{16}}`, type: "number" },
  { id: 4, block: "Блок А", topic: "Преобразование выражений", prompt: "Упростите выражение:", expression: String.raw`(x-3)^2-x(x-6)`, type: "number" },
  { id: 5, block: "Блок А", topic: "Уравнения", prompt: "Решите уравнения. Оба ответа проверяются отдельно.", expression: String.raw`\begin{aligned}\text{а)}\;&5-2(x+1)=9\\\text{б)}\;&x^2-5x+6=0\end{aligned}`, type: "double" },
  { id: 6, block: "Блок А", topic: "Числа и координатная прямая", prompt: "Расположите числа в порядке возрастания:", expression: String.raw`-2{,}4;\quad-\frac73;\quad-\sqrt5`, type: "order" },
  { id: 7, block: "Блок А", topic: "Подстановка в формулу", prompt: "Путь тела вычисляется по формуле s = v₀t + at²/2. Найдите s, если v₀ = 3, t = 4, a = 2.", type: "number" },
  { id: 8, block: "Блок А", topic: "Прямоугольный треугольник", prompt: "В прямоугольном треугольнике гипотенуза равна 10, а один из катетов равен 8. Найдите площадь треугольника.", type: "number", diagram: "right-triangle" },
  { id: 9, block: "Блок Б", topic: "Практические задачи", prompt: "В месяц ученику требуется 18 ГБ интернета. Какой тариф окажется самым дешёвым и сколько рублей придётся заплатить?", type: "tariff" },
  { id: 10, block: "Блок Б", topic: "Функции и графики", prompt: "На рисунке изображён график линейной функции. Выберите формулу, которая задаёт эту функцию.", type: "choice", diagram: "line-graph", options: ["y = x + 1", "y = −x + 1", "y = x − 1", "y = −x − 1"] },
  { id: 11, block: "Блок Б", topic: "Системы неравенств", prompt: "Решите систему неравенств. Ответ запишите в виде числового промежутка.", expression: String.raw`\begin{cases}2x-6>0\\5-x\ge1\end{cases}`, type: "interval" },
  { id: 12, block: "Блок Б", topic: "Вероятность", prompt: "Ученик подготовил 19 из 25 экзаменационных билетов. Билет выбирается случайным образом. Найдите вероятность того, что ученику достанется подготовленный билет.", type: "number" },
  { id: 13, block: "Блок Б", topic: "Арифметическая прогрессия", prompt: "Дана арифметическая прогрессия. Найдите её двенадцатый член.", expression: String.raw`-5;\ -2;\ 1;\ 4;\ \ldots`, type: "number" },
  { id: 14, block: "Блок Б", topic: "Текстовые задачи на движение", prompt: "Автобус выехал из города со скоростью 60 км/ч. Через 30 минут вслед за ним по той же дороге выехал автомобиль со скоростью 90 км/ч. Через сколько часов после своего выезда автомобиль догонит автобус?", type: "number" },
  { id: 15, block: "Блок Б", topic: "Подобие треугольников", prompt: "В треугольнике ABC точки D и E лежат на сторонах AB и AC соответственно, причём DE ∥ BC. Известно: AD = 4, DB = 6, DE = 8. Найдите BC.", type: "number", diagram: "similarity" },
  { id: 16, block: "Блок В", topic: "Уравнения высокого уровня", prompt: "Решите уравнение:", expression: String.raw`(x^2-5x)^2+10(x^2-5x)+24=0`, type: "advanced16" },
  { id: 17, block: "Блок В", topic: "Текстовые задачи второй части", prompt: "Первый рабочий изготавливает 120 деталей на 2 часа быстрее второго. За один час первый рабочий изготавливает на 10 деталей больше второго. Сколько деталей в час изготавливает каждый рабочий?", type: "advanced17" },
  { id: 18, block: "Блок В", topic: "Геометрическое доказательство", prompt: "В параллелограмме ABCD биссектриса угла A пересекает сторону DC в точке E. 1. Докажите, что AD = DE. 2. Найдите периметр параллелограмма, если AB = 6, EC = 4.", type: "advanced18", diagram: "parallelogram-proof" },
];

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(/ё/g, "е").replace(/\s+/g, "").replace(/,/g, ".");

function numberValue(value: string) {
  const clean = normalize(value).replace(/^[a-zа-я]+=/i, "").replace(/[^0-9./+-]/g, "");
  if (/^[+-]?\d+\/\d+$/.test(clean)) {
    const [a, b] = clean.split("/").map(Number);
    return b ? a / b : null;
  }
  const result = Number(clean);
  return Number.isFinite(result) ? result : null;
}

function equalsNumber(value: string, target: number) {
  const parsed = numberValue(value);
  return parsed !== null && Math.abs(parsed - target) < 1e-9;
}

function roots(value: string) {
  return value
    .trim()
    .split(/[;,\s]+/)
    .map(numberValue)
    .filter((item): item is number => item !== null)
    .sort((a, b) => a - b);
}

function intervalCorrect(value: string) {
  const clean = normalize(value)
    .replace(/∞/g, "infinity")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=");
  return ["(3;4]", "(3,4]", "3<x<=4", "3<x≤4", "x>3,x<=4", "x>3;x<=4"].some((item) => clean === normalize(item));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character] || character));
}

function openPhotoDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(PHOTO_STORE)) {
        request.result.createObjectStore(PHOTO_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadPhotos() {
  const db = await openPhotoDb();
  return new Promise<Photo[]>((resolve, reject) => {
    const request = db.transaction(PHOTO_STORE, "readonly").objectStore(PHOTO_STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function savePhoto(photo: Photo) {
  const db = await openPhotoDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    transaction.objectStore(PHOTO_STORE).put(photo);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function deletePhoto(id: string) {
  const db = await openPhotoDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    transaction.objectStore(PHOTO_STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function clearPhotos() {
  const db = await openPhotoDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE, "readwrite");
    transaction.objectStore(PHOTO_STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

function fileToPhoto(file: File, bucket: string) {
  return new Promise<Photo>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      id: `${Date.now()}-${crypto.randomUUID()}`,
      name: file.name,
      type: file.type || "image/heic",
      data: String(reader.result),
      bucket,
    });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}


function MathFormula({
  expression,
}: {
  expression: string;
}) {
  const [element, setElement] =
    useState<HTMLDivElement | null>(null);

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
      if (renderFormula()) {
        window.clearInterval(timer);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [element, expression]);

  return <div ref={setElement} />;
}

function OgeDiagram({ kind }: { kind: NonNullable<Question["diagram"]> }) {
  return (
    <div className="geometry-diagram oge-diagram">
      <svg viewBox="0 0 430 270" role="img" aria-label="Схема к заданию">
        {kind === "right-triangle" && (
          <>
            <polygon points="90,225 90,55 350,225" />
            <path d="M90 203 h22 v22" className="marker" />
            <text x="55" y="145" className="value-label">8</text>
            <text x="218" y="129" className="value-label">10</text>
          </>
        )}
        {kind === "line-graph" && (
          <>
            <g className="graph-grid">
              {[45,90,135,180,225,270,315,360,405].map((x) => <line key={x} x1={x} y1="20" x2={x} y2="250" />)}
              {[25,70,115,160,205,250].map((y) => <line key={y} x1="45" y1={y} x2="405" y2={y} />)}
            </g>
            <g className="graph-axes">
              <line x1="45" y1="160" x2="413" y2="160" /><path d="M405 154 l8 6 -8 6" />
              <line x1="180" y1="250" x2="180" y2="12" /><path d="M174 20 l6 -8 6 8" />
              <text x="414" y="175">x</text><text x="190" y="17">y</text>
              {[-3,-2,-1,1,2,3,4,5].map((n) => <text key={`x${n}`} x={180 + n * 45 - 5} y="178">{n}</text>)}
              {[-2,-1,1,2,3].map((n) => <text key={`y${n}`} x="158" y={164 - n * 45}>{n}</text>)}
            </g>
            <line x1="90" y1="25" x2="315" y2="250" className="graph-line" />
          </>
        )}
        {kind === "similarity" && (
          <>
            <polygon points="215,30 70,225 365,225" />
            <line x1="141" y1="128" x2="293" y2="128" className="midline" />
    
            <text x="206" y="23">A</text><text x="52" y="245">B</text><text x="370" y="245">C</text>
            <text x="125" y="125">D</text><text x="299" y="125">E</text>
            <text x="158" y="79" className="value-label">4</text>
            <text x="92" y="181" className="value-label">6</text>
            <text x="207" y="116" className="value-label">8</text>
          </>
        )}
        {kind === "parallelogram-proof" && (
          <>
            <polygon points="70,220 300,220 365,65 135,65" />
            <line x1="70" y1="220" x2="288" y2="65" />
            <circle cx="288" cy="65" r="4.5" className="diagram-point" />
            <path d="M112 220 A42 42 0 0 0 104 196" className="angle-arc" />
            <path d="M101 198 A38 38 0 0 0 87 184" className="angle-arc" />
            <text x="51" y="242">A</text><text x="302" y="242">B</text><text x="370" y="60">C</text>
            <text x="120" y="58">D</text><text x="279" y="55">E</text>
            <text x="177" y="246" className="value-label">6</text>
            <text x="322" y="55" className="value-label">4</text>
          </>
        )}
      </svg>
      {(kind === "similarity" || kind === "parallelogram-proof") && <p className="diagram-note">Рисунок не обязательно выполнен в масштабе</p>}
    </div>
  );
}

function PhotoUploader({
  bucket,
  photos,
  onAdd,
  onRemove,
}: {
  bucket: string;
  photos: Photo[];
  onAdd: (files: FileList, bucket: string) => void;
  onRemove: (photo: Photo) => void;
}) {
  const bucketPhotos = photos.filter((photo) => photo.bucket === bucket);
  return (
    <div className="photo-uploader">
      <label className="photo-button">
        <input type="file" accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif" multiple onChange={(event) => {
          if (event.target.files?.length) onAdd(event.target.files, bucket);
          event.currentTarget.value = "";
        }} />
        <span>＋ Добавить фотографии</span>
      </label>
      {bucketPhotos.length > 0 && (
        <div className="photo-grid">
          {bucketPhotos.map((photo) => (
            <figure key={photo.id}>
              <img src={photo.data} alt={`Загруженное решение: ${photo.name}`} />
              <figcaption><span>{photo.name}</span><button type="button" onClick={() => onRemove(photo)}>Удалить</button></figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function defaultAnswer(): StoredAnswer {
  return { value: "", extra: "", explanation: "", dontKnow: false };
}

export default function OgeEntryDiagnostic() {
  const [screen, setScreen] = useState<"home" | "test" | "bridgeB" | "bridgeC" | "photos" | "review" | "result">("home");
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StoredAnswer>>({});
  const [order, setOrder] = useState(initialOrder);
  const [orderTouched, setOrderTouched] = useState(false);
  const [marks, setMarks] = useState<Record<string, number>>({ "−2,4": -2.5, "−7/3": -2.5, "−√5": -2.5 });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setName(parsed.name || "");
        setAccepted(Boolean(parsed.accepted));
        setCurrent(Math.min(Math.max(parsed.current || 0, 0), 17));
        setAnswers(parsed.answers || {});
        setOrder(parsed.order?.length === 3 ? parsed.order : initialOrder);
        setOrderTouched(Boolean(parsed.orderTouched));
        setMarks(parsed.marks || marks);
      }
    } catch {}
    loadPhotos().then(setPhotos).catch(() => {});
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && screen !== "result") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, accepted, current, answers, order, orderTouched, marks }));
    }
  }, [name, accepted, current, answers, order, orderTouched, marks, screen, hydrated]);

  const update = (id: number, patch: Partial<StoredAnswer>) => {
    setAnswers((previous) => ({ ...previous, [id]: { ...(previous[id] || defaultAnswer()), ...patch, dontKnow: false } }));
  };

  const answerHasContent = (question: Question) => {
    const answer = answers[question.id];
    if (answer?.dontKnow) return true;
    if (!answer) return false;
    if (question.type === "double" || question.type === "tariff") return Boolean(answer.value.trim() && answer.extra?.trim());
    if (question.type === "order") return orderTouched;
    if (question.type === "advanced16") return Boolean(answer.value.trim() || answer.explanation?.trim() || photos.some((photo) => photo.bucket === "q16"));
    if (question.type === "advanced17") return Boolean(answer.value.trim() || answer.extra?.trim() || answer.explanation?.trim() || photos.some((photo) => photo.bucket === "q17"));
    if (question.type === "advanced18") return Boolean(answer.value.trim() || answer.explanation?.trim() || photos.some((photo) => photo.bucket === "q18"));
    return Boolean(answer.value.trim());
  };

  const markDontKnow = (question: Question) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: { ...(previous[question.id] || defaultAnswer()), value: "", extra: "", explanation: "", dontKnow: true },
    }));
    if (question.type === "order") {
      setOrder(initialOrder);
      setOrderTouched(false);
    }
  };

  const addPhotos = async (files: FileList, bucket: string) => {
    const added: Photo[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) continue;
      const photo = await fileToPhoto(file, bucket);
      await savePhoto(photo);
      added.push(photo);
    }
    setPhotos((previous) => [...previous, ...added]);
  };

  const removePhoto = async (photo: Photo) => {
    await deletePhoto(photo.id);
    setPhotos((previous) => previous.filter((item) => item.id !== photo.id));
  };

  const autoItems = useMemo<AutoItem[]>(() => {
    const item = (key: string, questionId: number, topic: string, block: "A" | "B", correct: boolean): AutoItem => ({
      key, questionId, topic, block, correct,
      dontKnow: Boolean(answers[questionId]?.dontKnow),
    });
    return [
      item("1", 1, "Вычисления", "A", equalsNumber(answers[1]?.value || "", -1)),
      item("2", 2, "Проценты", "A", equalsNumber(answers[2]?.value || "", 80)),
      item("3", 3, "Степени и корни", "A", equalsNumber(answers[3]?.value || "", 25 / 16)),
      item("4", 4, "Преобразование выражений", "A", equalsNumber(answers[4]?.value || "", 9)),
      item("5а", 5, "Линейные уравнения", "A", equalsNumber(answers[5]?.value || "", -3)),
      item("5б", 5, "Квадратные уравнения", "A", (() => {
        const result = roots(answers[5]?.extra || "");
        return result.length === 2 && result[0] === 2 && result[1] === 3;
      })()),
      item("6", 6, "Числа и координатная прямая", "A", order.every((value, index) => value === correctOrder[index])),
      item("7", 7, "Подстановка в формулу", "A", equalsNumber(answers[7]?.value || "", 28)),
      item("8", 8, "Прямоугольный треугольник", "A", equalsNumber(answers[8]?.value || "", 24)),
      item("9", 9, "Практические задачи", "B", normalize(answers[9]?.value || "") === "б" && equalsNumber(answers[9]?.extra || "", 500)),
      item("10", 10, "Функции и графики", "B", normalize(answers[10]?.value || "") === normalize("y = −x + 1")),
      item("11", 11, "Системы неравенств", "B", intervalCorrect(answers[11]?.value || "")),
      item("12", 12, "Вероятность", "B", equalsNumber(answers[12]?.value || "", 19 / 25)),
      item("13", 13, "Арифметическая прогрессия", "B", equalsNumber(answers[13]?.value || "", 28)),
      item("14", 14, "Текстовые задачи на движение", "B", equalsNumber(answers[14]?.value || "", 1)),
      item("15", 15, "Подобие треугольников", "B", equalsNumber(answers[15]?.value || "", 20)),
    ];
  }, [answers, order]);

  const goNext = () => {
    if (current === 7) setScreen("bridgeB");
    else if (current === 14) setScreen("bridgeC");
    else if (current === 17) setScreen("photos");
    else setCurrent((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = async () => {
    if (!window.confirm("Все сохранённые ответы будут удалены. Начать заново?")) return;
    localStorage.removeItem(STORAGE_KEY);
    await clearPhotos().catch(() => {});
    setName(""); setAccepted(false); setCurrent(0); setAnswers({}); setOrder(initialOrder); setOrderTouched(false);
    setMarks({ "−2,4": -2.5, "−7/3": -2.5, "−√5": -2.5 });
    setPhotos([]); setScreen("home"); setToast("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moveOrder = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= order.length) return;
    const next = [...order];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setOrder(next);
    setOrderTouched(true);
    update(6, { value: next.join("|") });
  };

  const status = (question: Question) => answers[question.id]?.dontKnow
    ? "Не знаю, как решить"
    : answerHasContent(question) ? "Ответ дан" : "Ответ не заполнен";
  const unanswered = questions.filter((question) => status(question) === "Ответ не заполнен");

  const highLevelStatus = (id: number) => {
    const question = questions.find((item) => item.id === id)!;
    return answers[id]?.dontKnow ? "не выполнено" : answerHasContent(question) ? "ответ дан" : "не выполнено";
  };

  const reportText = () => {
    const scoreA = autoItems.filter((item) => item.block === "A" && item.correct).length;
    const scoreB = autoItems.filter((item) => item.block === "B" && item.correct).length;
    const strong = autoItems.filter((item) => item.correct).map((item) => item.topic);
    const repeat = autoItems.filter((item) => !item.correct).map((item) => item.topic);
    return [
      "Входная диагностика по математике",
      `Ученик: ${name}`,
      `Автоматическая часть: ${scoreA + scoreB} из 16`,
      `Блок А: ${scoreA} из 9`,
      `Блок Б: ${scoreB} из 7`,
      `Не получилось выполнить: ${questions.filter((q) => answers[q.id]?.dontKnow).length}`,
      `Получилось:\n${strong.length ? strong.map((item) => `— ${item}`).join("\n") : "—"}`,
      `Стоит повторить:\n${repeat.length ? repeat.map((item) => `— ${item}`).join("\n") : "—"}`,
      `Блок В:\n№16 — ${highLevelStatus(16)}\n№17 — ${highLevelStatus(17)}\n№18 — ${highLevelStatus(18)}`,
      `Работа выполнена: ${new Date().toLocaleString("ru-RU")}`,
    ].join("\n\n");
  };

  const detailedReport = () => {
    const rows = questions.map((question) => {
      const answer = answers[question.id] || defaultAnswer();
      const values = [
        answer.value && `Ответ: ${escapeHtml(answer.value)}`,
        answer.extra && `Дополнительный ответ: ${escapeHtml(answer.extra)}`,
        answer.explanation && `Ход решения: ${escapeHtml(answer.explanation)}`,
        answer.dontKnow && "Не знаю, как решить",
        photos.some((photo) => photo.bucket === `q${question.id}`) && `Фотографий: ${photos.filter((photo) => photo.bucket === `q${question.id}`).length}`,
      ].filter(Boolean).join("<br>");
      return `<tr><td>${question.id}</td><td>${question.topic}</td><td>${values || "Ответ не заполнен"}</td></tr>`;
    }).join("");
    return `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Результат диагностики</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#28222c}h1{color:#674fa6}pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}@media print{button{display:none}}</style><body><h1>Входная диагностика по математике</h1><pre>${escapeHtml(reportText())}</pre><h2>Все ответы</h2><table><tr><th>№</th><th>Тема</th><th>Ответ</th></tr>${rows}</table><p><b>Фотографии решений:</b> сохранены только в браузере. Отправьте оригиналы Лере в Telegram отдельными файлами.</p><button onclick="window.print()">Печать / сохранить как PDF</button></body></html>`;
  };

  const downloadReport = () => {
    const blob = new Blob([detailedReport()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Диагностика_ОГЭ_${name.replace(/\s+/g, "_") || "ученик"}.html`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyReport = async (message = "Результат скопирован") => {
    try {
      await navigator.clipboard.writeText(reportText());
      setToast(message);
    } catch {
      setToast("Не получилось скопировать автоматически");
    }
    window.setTimeout(() => setToast(""), 3500);
  };

  if (screen === "test") {
    const question = questions[current];
    const answer = answers[question.id] || defaultAnswer();
    const ready = answerHasContent(question);
    return (
      <main className="test-shell oge-page">
        <header className="compact-header">
          <a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a>
          <button className="text-button" onClick={restart}>Начать сначала</button>
        </header>
        <section className="test-wrap">
          <div className="progress-line">
            <div><span>Задание {current + 1} из {questions.length}</span><small>{question.block} · {question.topic}</small></div>
            <strong>{Math.round(((current + 1) / questions.length) * 100)}%</strong>
          </div>
          <div className="progress-track">
            <span
              style={{
                width: `${((current + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <nav
            className="question-number-nav"
            aria-label="Переход по заданиям"
          >
            {questions.map((item, index) => {
              const itemAnswer = answers[item.id];
              const stateClass = itemAnswer?.dontKnow
                ? "unknown"
                : answerHasContent(item)
                  ? "answered"
                  : "empty";

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
          <article className="question-card oge-question">
            <div className="question-meta"><span>{question.block}</span><span>{question.topic}</span></div>
            <h1>{question.prompt}</h1>
            {question.expression && (
              <div className="expression oge-expression">
                <MathFormula expression={question.expression} />
              </div>
            )}
            {question.id === 9 && (
              <div className="tariff-table">
                <div className="tariff-head"><b>Тариф</b><b>Плата</b><b>Включено</b><b>Сверх пакета</b></div>
                {[["А","350 руб.","10 ГБ","40 руб. за 1 ГБ"],["Б","500 руб.","20 ГБ","35 руб. за 1 ГБ"],["В","0 руб.","0 ГБ","30 руб. за 1 ГБ"]].map((row) => (
                  <div className="tariff-row" key={row[0]}>{row.map((cell, index) => <span key={cell} data-label={["Тариф","Плата","Включено","Сверх"][index]}>{cell}</span>)}</div>
                ))}
              </div>
            )}
            {question.diagram && <OgeDiagram kind={question.diagram} />}

            {question.type === "number" && (
              <label className="answer-field"><span>Ответ</span><input inputMode="decimal" value={answer.dontKnow ? "" : answer.value} onChange={(e) => update(question.id, { value: e.target.value })} placeholder="Введите ответ" /></label>
            )}
            {question.type === "interval" && (
              <label className="answer-field"><span>Числовой промежуток</span><input value={answer.dontKnow ? "" : answer.value} onChange={(e) => update(question.id, { value: e.target.value })} placeholder="Например: (3; 4]" /></label>
            )}
            {question.type === "double" && (
              <div className="double-fields">
                <label className="answer-field"><span>а) Ответ</span><input inputMode="decimal" value={answer.dontKnow ? "" : answer.value} onChange={(e) => update(5, { value: e.target.value })} placeholder="Ответ пункта а" /></label>
                <label className="answer-field"><span>б) Оба корня</span><input value={answer.dontKnow ? "" : answer.extra || ""} onChange={(e) => update(5, { extra: e.target.value })} placeholder="Например: 2; 3" /></label>
              </div>
            )}
            {question.type === "choice" && (
              <div className="options semantic-options" role="radiogroup">
                {question.options?.map((option) => (
                  <label className={`option ${answer.value === option && !answer.dontKnow ? "selected" : ""}`} key={option}>
                    <input type="radio" name={`q${question.id}`} checked={answer.value === option && !answer.dontKnow} onChange={() => update(question.id, { value: option })} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
            {question.type === "tariff" && (
              <div className="tariff-answer">
                <fieldset><legend>Тариф</legend>{["А","Б","В"].map((tariff) => <label key={tariff}><input type="radio" name="tariff" checked={answer.value === tariff && !answer.dontKnow} onChange={() => update(9, { value: tariff })} />{tariff}</label>)}</fieldset>
                <label className="answer-field"><span>Стоимость, руб.</span><input inputMode="decimal" value={answer.dontKnow ? "" : answer.extra || ""} onChange={(e) => update(9, { extra: e.target.value })} placeholder="Введите стоимость" /></label>
              </div>
            )}
            {question.type === "order" && (
              <div className="order-task">
                <p>Сначала отметьте примерное положение каждого числа на прямой от −3 до −2:</p>
                <div className="number-line"><span>−3</span><i /><span>−2</span></div>
                {Object.keys(marks).map((label) => (
                  <label className="mark-slider" key={label}><b>{label}</b><input type="range" min="-3" max="-2" step="0.01" value={marks[label]} onChange={(e) => setMarks((prev) => ({ ...prev, [label]: Number(e.target.value) }))} /></label>
                ))}
                <p>Теперь расположите карточки в порядке возрастания:</p>
                <div className="order-list">
                  {order.map((value, index) => (
                    <div
                      className="order-card"
                      key={value}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const from = Number(event.dataTransfer.getData("text/plain"));
                        if (!Number.isInteger(from) || from === index) return;
                        const next = [...order]; const [moved] = next.splice(from, 1); next.splice(index, 0, moved);
                        setOrder(next); setOrderTouched(true); update(6, { value: next.join("|") });
                      }}
                    >
                      <span>{value}</span>
                      <div><button type="button" aria-label={`Поднять ${value}`} disabled={index === 0} onClick={() => moveOrder(index, -1)}>↑</button><button type="button" aria-label={`Опустить ${value}`} disabled={index === order.length - 1} onClick={() => moveOrder(index, 1)}>↓</button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {question.type === "advanced16" && (
              <div className="advanced-fields">
                <label className="answer-field"><span>Финальный ответ</span><input value={answer.dontKnow ? "" : answer.value} onChange={(e) => update(16, { value: e.target.value })} placeholder="Запишите найденные корни" /></label>
                <label className="answer-field"><span>Кратко опишите ход решения <small>необязательно</small></span><textarea value={answer.dontKnow ? "" : answer.explanation || ""} onChange={(e) => update(16, { explanation: e.target.value })} /></label>
                <PhotoUploader bucket="q16" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
                {ready && !answer.dontKnow && <p className="manual-note">Ответ сохранён. Полное решение проверит преподаватель.</p>}
              </div>
            )}
            {question.type === "advanced17" && (
              <div className="advanced-fields">
                <div className="double-fields">
                  <label className="answer-field"><span>Первый рабочий</span><input inputMode="numeric" value={answer.dontKnow ? "" : answer.value} onChange={(e) => update(17, { value: e.target.value })} /></label>
                  <label className="answer-field"><span>Второй рабочий</span><input inputMode="numeric" value={answer.dontKnow ? "" : answer.extra || ""} onChange={(e) => update(17, { extra: e.target.value })} /></label>
                </div>
                <label className="answer-field"><span>Кратко опишите ход решения <small>необязательно</small></span><textarea value={answer.dontKnow ? "" : answer.explanation || ""} onChange={(e) => update(17, { explanation: e.target.value })} /></label>
                <PhotoUploader bucket="q17" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
                {ready && !answer.dontKnow && <p className="manual-note">Ответ сохранён. Полное решение проверит преподаватель.</p>}
              </div>
            )}
            {question.type === "advanced18" && (
              <div className="advanced-fields">
                <label className="answer-field"><span>Доказательство</span><textarea value={answer.dontKnow ? "" : answer.explanation || ""} onChange={(e) => update(18, { explanation: e.target.value })} /></label>
                <label className="answer-field"><span>Периметр</span><input inputMode="decimal" value={answer.dontKnow ? "" : answer.value} onChange={(e) => update(18, { value: e.target.value })} /></label>
                <PhotoUploader bucket="q18" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
                {ready && !answer.dontKnow && <p className="manual-note">Ответ сохранён. Доказательство и решение проверит преподаватель.</p>}
              </div>
            )}
<div className="oge-reference-action">
  <button
    type="button"
    className="button secondary oge-reference-open-button"
    onClick={() => setReferenceOpen(true)}
  >
    Справочные материалы ОГЭ
  </button>
</div>
            <div className="test-actions grade-seven-actions">
              <button className="button secondary" disabled={current === 0} onClick={() => { setCurrent((value) => value - 1); window.scrollTo({ top: 0 }); }}>← Назад</button>
              <button className={`button dont-know-button ${answer.dontKnow ? "active-dont-know" : ""}`} onClick={() => markDontKnow(question)}>{answer.dontKnow ? "Отмечено: не знаю" : "Не знаю, как решить"}</button>
              <button
                className="button primary"
                disabled={!ready}
                onClick={goNext}
              >
                {current === questions.length - 1
                  ? "К загрузке решений"
                  : "Далее"}{" "}
                →
              </button>
            </div>
          </article>
          <p className="save-note">Ответы и прогресс сохраняются только на этом устройстве</p>
        </section>
        <OgeReferenceModal
  open={referenceOpen}
  onClose={() => setReferenceOpen(false)}
/>
      </main>
    );
  }

  if (screen === "bridgeB" || screen === "bridgeC") {
    const isB = screen === "bridgeB";
    return (
      <main className="center-screen oge-page">
        <section className="review-card bridge-card">
          <div className="review-icon">{isB ? "Б" : "В"}</div>
          <p className="kicker">{isB ? "Блок А завершён" : "Последняя часть"}</p>
          <h1>{isB ? "Теперь проверим основные навыки, которые встречаются в заданиях ОГЭ" : "Задания высокого уровня"}</h1>
          <p>{isB
            ? "Здесь будут практическая задача, график, неравенства, вероятность, прогрессия и геометрия."
            : "В этих заданиях важен не только ответ, но и полное решение. Выполняй их на бумаге и обязательно приложи фотографии. Если пока не получается — это нормально."}</p>
          <button className="button primary" onClick={() => { setCurrent(isB ? 8 : 15); setScreen("test"); window.scrollTo({ top: 0 }); }}>Продолжить →</button>
        </section>
      </main>
    );
  }

  if (screen === "photos") {
    return (
      <main className="center-screen oge-page upload-screen">
        <section className="review-card photo-review-card">
          <div className="review-icon">▧</div>
          <p className="kicker">Решения на бумаге</p>
          <h1>Загрузи фотографии решений</h1>
          <p>Фотографии помогут увидеть не только ответы, но и ход рассуждений. Особенно важно приложить решения заданий №16–18.</p>
          <PhotoUploader bucket="final" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
          <p className="privacy-note">Фотографии сохраняются локально в этом браузере, не обрезаются и не отправляются посторонним сервисам.</p>
          <div className="review-actions">
            <button className="button secondary" onClick={() => { setCurrent(17); setScreen("test"); }}>Назад к заданию 18</button>
            <button className="button primary" onClick={() => { setScreen("review"); window.scrollTo({ top: 0 }); }}>Перейти к обзору →</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "review") {
    return (
      <main className="result-page oge-page review-overview">
        <header className="compact-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header>
        <section className="result-section overview-heading">
          <p className="kicker">Проверь перед завершением</p><h1>Обзор всех заданий</h1>
          <p>{unanswered.length ? `Без ответа осталось заданий: ${unanswered.length}. Можно вернуться к ним или засчитать как «Не знаю, как решить».` : "Все задания заполнены или отмечены как «Не знаю, как решить»."}</p>
        </section>
        <section className="result-section overview-grid">
          {questions.map((question, index) => (
            <button className={`overview-item ${answers[question.id]?.dontKnow ? "unknown" : answerHasContent(question) ? "answered" : "empty"}`} key={question.id} onClick={() => { setCurrent(index); setScreen("test"); window.scrollTo({ top: 0 }); }}>
              <b>№{question.id}</b><span>{status(question)}</span>
            </button>
          ))}
        </section>
        <section className="result-section review-finish">
          {unanswered.length > 0 && <button className="button secondary" onClick={() => {
            setAnswers((previous) => {
              const next = { ...previous };
              unanswered.forEach((question) => { next[question.id] = { ...(next[question.id] || defaultAnswer()), value: "", extra: "", explanation: "", dontKnow: true }; });
              return next;
            });
          }}>Засчитать пропуски как «Не знаю»</button>}
          <button className="button primary" disabled={unanswered.length > 0} onClick={() => { setScreen("result"); localStorage.removeItem(STORAGE_KEY); window.scrollTo({ top: 0 }); }}>Показать предварительный результат</button>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const scoreA = autoItems.filter((item) => item.block === "A" && item.correct).length;
    const scoreB = autoItems.filter((item) => item.block === "B" && item.correct).length;
    const total = scoreA + scoreB;
    const strong = autoItems.filter((item) => item.correct);
    const repeat = autoItems.filter((item) => !item.correct);
    const percentA = scoreA / 9;
    const percentB = scoreB / 7;
    const conclusion = percentA < 0.5
      ? "Сначала стоит укрепить базовые вычислительные и алгебраические навыки. Это даст основу для дальнейшей подготовки к ОГЭ."
      : percentA < 0.8
        ? "Основная база уже есть, но некоторые темы стоит повторить перед переходом к полноценной экзаменационной практике."
        : percentB < 0.7
          ? "Базовые навыки сформированы. Основное внимание стоит уделить применению знаний в заданиях формата ОГЭ."
          : percentB >= 0.8
            ? "Базовые и основные экзаменационные задания получаются уверенно. После проверки блока В можно будет определить дальнейший уровень программы."
            : "Базовые навыки сформированы. После просмотра решений можно будет точнее составить программу подготовки.";
    return (
      <main className="result-page oge-page">
        <header className="compact-header result-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Пройти ещё раз</button></header>
        <section className="result-hero">
          <div className="score-orbit"><strong>{total}</strong><span>из 16</span></div>
          <div><p className="kicker">Предварительный результат</p><h1>{name}, диагностика завершена</h1><p>{conclusion}</p></div>
        </section>
        <section className="result-section result-stats oge-stats">
          <article><strong>{total}/16</strong><span>автоматическая часть</span></article>
          <article><strong>{scoreA}/9</strong><span>блок А</span></article>
          <article><strong>{scoreB}/7</strong><span>блок Б</span></article>
          <article><strong>{questions.filter((q) => answers[q.id]?.dontKnow).length}</strong><span>«не знаю»</span></article>
          <article><strong>Ожидает</strong><span>проверка блока В</span></article>
        </section>
        <section className="result-section three-topic-panels oge-topic-panels">
          {strong.length > 0 && (
            <article className="topic-panel strong-panel">
              <p className="kicker">Сильные темы</p>
              <h2>Получилось</h2>
              <div className="topic-tags">
                {strong.map((item) => (
                  <span key={item.key}>✓ {item.topic}</span>
                ))}
              </div>
            </article>
          )}
          {repeat.length > 0 && <article className="topic-panel restore-panel"><p className="kicker">Для программы</p><h2>Стоит повторить</h2><div className="topic-tags">{repeat.map((item) => <span key={item.key}>{item.topic}</span>)}</div></article>}
        </section>
        <section className="result-section manual-block">
          <p className="kicker">Блок В</p><h2>Ожидает проверки преподавателя</h2>
          <div>{[16,17,18].map((id) => <span key={id}>№{id} — {highLevelStatus(id)}</span>)}</div>
          <p>Финальные ответы не оцениваются автоматически: важны обоснование, ход решения и записи на бумаге.</p>
        </section>
        <section className="final-cta oge-final">
          <div><p className="kicker">Получить разбор и рекомендации</p><h2>Отправь результат и фотографии решений Лере</h2><p>Я посмотрю ход работы, отмечу сильные стороны и темы для повторения, а затем предложу подходящий план подготовки.</p></div>
          <div className="cta-actions oge-cta-actions">
            <button className="button secondary" onClick={() => copyReport()}>Скопировать результат</button>
            <a className="button primary" href={TELEGRAM_URL} target="_blank" rel="noreferrer" onClick={() => copyReport("Результат скопирован. Вставь его в сообщение и прикрепи фотографии решений")}>Открыть Telegram Леры</a>
            <button className="button secondary" onClick={restart}>Пройти ещё раз</button>
          </div>
          {toast && <p className="copy-toast" role="status">{toast}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="home-page oge-page">
      <header className="site-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header>
      <section className="hero oge-hero">
        <div className="hero-copy">
          <div className="soft-pill">Старт подготовки к ОГЭ</div>
          <h1>Входная диагностика<br /><em>по математике</em></h1>
          <p className="hero-lead">Определим стартовый уровень и составим план подготовки к ОГЭ.</p>
          <div className="diagnostic-facts oge-facts">
            <span><b>18</b> заданий</span><span>Три уровня сложности</span><span>Около 45 минут</span>
            <span>Без школьной оценки</span><span>Предварительный результат</span><span>Блок В проверит преподаватель</span>
          </div>
          <label className="name-field"><span>Имя и фамилия ученика</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Введите имя и фамилию" autoComplete="name" /></label>
          <div className="start-guidance">
            <h2>Перед началом</h2>
            <p className="paper-reminder">Приготовь несколько листов бумаги для вычислений и полных решений.</p>
            <ul>
              <li>Выполняй работу самостоятельно и за один подход.</li>
              <li>Строгого ограничения по времени нет, обычно нужно около 45 минут.</li>
              <li>Можно пользоваться только официальными справочными материалами ОГЭ.</li>
              <li>Калькулятор, интернет, учебник, конспекты и подсказки использовать нельзя.</li>
              <li>Не стирай неудачные попытки на бумаге: они тоже помогают увидеть пробелы.</li>
              <li>Если задание не получается, переходи дальше — позже можно вернуться.</li>
              <li>Блок В сложнее основной части. Если он пока не получается, это нормально.</li>
            </ul>
            <p>Эта работа нужна не для оценки, а для определения стартового уровня и составления программы подготовки.</p>
            <label className="consent-check"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /><span>Я прочитал(а) рекомендации и готов(а) начать</span></label>
          </div>
          <button className="button primary big" disabled={!name.trim() || !accepted} onClick={() => setScreen("test")}>Начать диагностику <span>→</span></button>
          <p className="privacy-note">Другие персональные данные не собираются. Имя, ответы и фотографии сохраняются только в этом браузере.</p>
        </div>
        <div className="doodle oge-doodle" aria-hidden="true"><span className="doodle-plus">ОГЭ</span><span className="doodle-pi">x²</span><span className="doodle-frac"><b>19</b><i /><b>25</b></span><div className="doodle-paper"><div /><div /><div /><span>✓</span></div><span className="doodle-dot dot-one" /><span className="doodle-dot dot-two" /></div>
      </section>
      <OtherDiagnostics current="/oge" />
      <footer><div className="brand"><span className="brand-mark">∿</span><span>Математика без стресса</span></div><p>Диагностика помогает составить программу, а не ставит оценку ♡</p></footer>
    </main>
  );
}
