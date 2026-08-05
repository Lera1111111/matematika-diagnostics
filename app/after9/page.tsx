"use client";

import { useEffect, useMemo, useState } from "react";
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
        }
      ) => void;
    };
  }
}
type Answer = {
  value: string;
  extra: string;
  parts: string[];
  explanation: string;
  dontKnow: boolean;
  reference: boolean;
};
type Photo = { id: string; name: string; type: string; data: string; bucket: string; label: string };
type Question = {
  id: number;
  block: "Блок А" | "Блок Б" | "Блок В";
  topic: string;
  prompt: string;
  expression?: string;
  type: string;
  diagram?: "rectangle" | "circle-chords" | "isosceles-trapezoid";
};
type SkillResult = { key: string; questionId: number; name: string; correct: boolean; reference: boolean };

const STORAGE_KEY = "after-grade-nine-diagnostic-v1";
const DB_NAME = "after-grade-nine-photos";
const STORE = "photos";
const TELEGRAM_URL = "https://t.me/vxoab";
const initialOrder = ["−3,1", "−19/6", "−√10"];
const correctOrder = ["−19/6", "−√10", "−3,1"];
const graphIds = ["g1", "g2", "g3", "g4"];

const questions: Question[] = [
  {
    id: 1,
    block: "Блок А",
    topic: "Действия с числами",
    prompt: "Вычислите:",
    expression: String.raw`\left(2\frac{1}{4}-1{,}6\right)\cdot\frac{5}{13}`,
    type: "number",
  },
  {
    id: 2,
    block: "Блок А",
    topic: "Проценты",
    prompt:
      "После скидки 15% куртка стоит 1020 рублей. Сколько рублей куртка стоила до скидки?",
    type: "number",
  },
  {
    id: 3,
    block: "Блок А",
    topic: "Пропорции",
    prompt:
      "2,4 кг яблок стоят 432 рубля. Сколько рублей стоят 3,5 кг таких яблок?",
    type: "number",
  },
  {
    id: 4,
    block: "Блок А",
    topic: "Степени и корни",
    prompt: "Вычислите:",
    expression: String.raw`\frac{\sqrt{50}-\sqrt{8}}{\sqrt{2}}`,
    type: "number",
  },
  {
    id: 5,
    block: "Блок А",
    topic: "Преобразование выражений",
    prompt: "Упростите выражение:",
    expression: String.raw`(2x-3)^2-4x(x-3)`,
    type: "number",
  },
  {
    id: 6,
    block: "Блок А",
    topic: "Линейное уравнение",
    prompt: "Решите уравнение:",
    expression: String.raw`3(2x-1)-4(x+2)=7`,
    type: "number",
  },
  {
    id: 7,
    block: "Блок А",
    topic: "Подстановка в формулу",
    prompt:
      "Площадь трапеции вычисляется по формуле. Найдите площадь, если a = 7, b = 13, h = 4.",
    expression: String.raw`S=\frac{(a+b)h}{2}`,
    type: "number",
  },
  {
    id: 8,
    block: "Блок А",
    topic: "Сравнение чисел",
    prompt: "Расположите числа в порядке возрастания:",
    expression: String.raw`-\sqrt{10};\quad -3{,}1;\quad -\frac{19}{6}`,
    type: "order",
  },
  {
    id: 9,
    block: "Блок А",
    topic: "Чтение таблицы",
    prompt:
      "Ответьте на вопросы по таблице: 1. В какое время температура была наименьшей? 2. На сколько градусов температура повысилась с этого момента до 16:00?",
    type: "table",
  },
  {
    id: 10,
    block: "Блок А",
    topic: "Теорема Пифагора и площадь прямоугольника",
    prompt:
      "В прямоугольнике диагональ равна 13, а одна из сторон равна 5. Найдите площадь прямоугольника.",
    type: "number",
    diagram: "rectangle",
  },

 
     {
    id: 11,
    block: "Блок Б",
    topic: "Формулы сокращённого умножения",
    prompt: "Разложите на множители:",
    expression: String.raw`9x^2-24x+16`,
    type: "factor",
  },
  {
    id: 12,
    block: "Блок Б",
    topic: "Алгебраические дроби",
   prompt:
  "Сократите дробь и укажите значения переменной, при которых исходное выражение не имеет смысла:",
    expression: String.raw`\frac{x^2-9}{x^2-3x}`,
    type: "fraction",
  },
  {
    id: 13,
    block: "Блок Б",
    topic: "Квадратное уравнение",
    prompt: "Решите уравнение:",
    expression: String.raw`2x^2-7x+3=0`,
    type: "roots",
  },
  {
    id: 14,
    block: "Блок Б",
    topic: "Система уравнений",
    prompt: "Решите систему и найдите все пары (x; y):",
    expression: String.raw`\begin{cases}
      x+y=7,\\
      xy=10.
    \end{cases}`,
    type: "pairs",
  },
  {
    id: 15,
    block: "Блок Б",
    topic: "Квадратное неравенство",
    prompt: "Решите неравенство:",
    expression: String.raw`(x-4)(x+1)\leq 0`,
    type: "interval",
  },
  {
    id: 16,
    block: "Блок Б",
    topic: "Квадратичная функция",
    prompt:
      "Укажите направление ветвей, нули функции, абсциссу вершины и выберите подходящий график.",
    expression: String.raw`y=x^2-4x+3`,
    type: "quadratic",
  },
  {
    id: 17,
    block: "Блок Б",
    topic: "Арифметическая прогрессия",
    prompt:
      "Первый член арифметической прогрессии равен −7, а разность равна 4. Найдите десятый член и сумму первых десяти членов.",
    expression: String.raw`a_1=-7,\qquad d=4`,
    type: "double",
  },
  {
    id: 18,
    block: "Блок Б",
    topic: "Задачи на движение",
    prompt:
      "Расстояние между городами равно 240 км. Автомобиль проехал первую половину пути со скоростью 60 км/ч, а вторую — со скоростью 80 км/ч. Сколько часов заняла вся поездка?",
    type: "number",
  },
  {
    id: 19,
    block: "Блок Б",
    topic: "Вероятность и статистика",
    prompt:
      "На карточках записаны числа: 2, 3, 3, 5, 7, 7, 7, 8. Найдите среднее арифметическое, медиану и вероятность случайно выбрать карточку с числом 7.",
    type: "triple",
  },
  {
    id: 20,
    block: "Блок Б",
    topic: "Хорды окружности",
    prompt:
      "Хорды AB и CD пересекаются в точке E внутри окружности. Известно: AE = 3, EB = 8, CE = 4. Найдите ED.",
    type: "number",
    diagram: "circle-chords",
  },
  {
    id: 21,
    block: "Блок В",
    topic: "Дробно-рациональные уравнения",
    prompt: "Решите уравнение:",
    expression: String.raw`\frac{3}{x-2}-\frac{2}{x+2}
      =\frac{14}{x^2-4}`,
    type: "manual1",
  },
  {
    id: 22,
    block: "Блок В",
    topic: "Исследование квадратичной функции",
    prompt:
      "Найдите координаты вершины, наибольшее значение функции, решите неравенство и постройте схематичный график.",
    expression: String.raw`\begin{aligned}
      y&=-x^2+6x-5,\\
      -x^2+6x-5&\geq 0.
    \end{aligned}`,
    type: "manual3",
  },
  {
    id: 23,
    block: "Блок В",
    topic: "Задачи на совместную работу",
    prompt:
      "Две трубы вместе наполняют резервуар за 4 часа. Первая труба может наполнить резервуар самостоятельно на 6 часов быстрее второй. За сколько часов каждая труба наполнит резервуар отдельно?",
    type: "manual2",
  },
  {
    id: 24,
    block: "Блок В",
    topic: "Геометрическое доказательство",
    prompt:
      "В равнобедренной трапеции диагональ является биссектрисой острого угла. 1. Докажите, что боковая сторона равна меньшему основанию. 2. Найдите периметр, если основания равны 6 и 14.",
    type: "manualProof",
    diagram: "isosceles-trapezoid",
  },
];

const blank = (): Answer => ({ value: "", extra: "", parts: [], explanation: "", dontKnow: false, reference: false });
const normalize = (value: string) => value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(/ё/g, "е").replace(/\s+/g, "").replace(/,/g, ".");

function numeric(value: string) {
  const prepared = value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(/,/g, ".");
  const mixed = prepared.match(/^[a-zа-я]*\s*=\s*([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/i)
    || prepared.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return Number(mixed[1]) + Math.sign(Number(mixed[1])) * Number(mixed[2]) / Number(mixed[3]);
  const clean = normalize(value).replace(/^.*=/, "").replace(/[^0-9./+-]/g, "");
  if (/^[+-]?\d+\/\d+$/.test(clean)) {
    const [a, b] = clean.split("/").map(Number);
    return b ? a / b : null;
  }
  const result = Number(clean);
  return Number.isFinite(result) ? result : null;
}

const eq = (value: string, target: number) => {
  const parsed = numeric(value);
  return parsed !== null && Math.abs(parsed - target) < 1e-9;
};

function numberList(value: string) {
  const raw = value.trim();
  let tokens: string[];
  if (/[;\s]/.test(raw)) {
    tokens = raw.split(/[;\s]+/).map((token) => token.replace(/^,+|,+$/g, "")).filter(Boolean);
  } else {
    const pieces = raw.split(",");
    if (pieces.length === 3 && /^\d+$/.test(pieces[0]) && /^\d+$/.test(pieces[1])) {
      tokens = [`${pieces[0]},${pieces[1]}`, pieces[2]];
    } else {
      tokens = pieces;
    }
  }
  return tokens.map(numeric).filter((item): item is number => item !== null).sort((a, b) => a - b);
}

function restrictionsCorrect(value: string) {
  const values = (value.match(/[+-]?\d+(?:[.,]\d+)?/g) || []).map((item) => Number(item.replace(",", "."))).sort((a, b) => a - b);
  return values.length === 2 && values[0] === 0 && values[1] === 3;
}

function pairsCorrect(value: string) {
  const found: string[] = [];
  const regex = /\(\s*([+-]?\d+(?:[.,]\d+)?)\s*[;,]\s*([+-]?\d+(?:[.,]\d+)?)\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value))) found.push(`${Number(match[1].replace(",", "."))};${Number(match[2].replace(",", "."))}`);
  return found.length === 2 && found.sort().join("|") === ["2;5", "5;2"].sort().join("|");
}

function intervalCorrect(value: string) {
  const clean = normalize(value).replace(/≤/g, "<=").replace(/≥/g, ">=");
  return ["[-1;4]", "[-1,4]", "-1<=x<=4", "x>=-1;x<=4", "x>=-1,x<=4"].some((item) => clean === normalize(item));
}

function timeCorrect(value: string) {
  const clean = value.trim().replace(/\s+/g, "");
  return ["8", "8:00", "08:00"].includes(clean);
}

function fractionFormCorrect(value: string) {
  const clean = normalize(value).replace(/[{}]/g, "");
  return ["(x+3)/x", "(3+x)/x"].includes(clean);
}

function factorCorrect(value: string) {
  const clean = normalize(value).replace(/\*\*/g, "^").replace(/·/g, "");
  return ["(3x-4)^2", "(4-3x)^2", "(3x-4)(3x-4)", "(4-3x)(4-3x)"].includes(clean);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character] || character));
}

function shuffleGraphs() {
  const array = [...graphIds];
  for (let index = array.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [array[index], array[swap]] = [array[swap], array[index]];
  }
  return array;
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGetAll() {
  const db = await openDb();
  return new Promise<Photo[]>((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function dbPut(photo: Photo) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).put(photo);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}

async function dbDelete(id: string) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}

async function dbClear() {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}

function readPhoto(file: File, bucket: string) {
  return new Promise<Photo>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ id: `${Date.now()}-${crypto.randomUUID()}`, name: file.name, type: file.type || "image/heic", data: String(reader.result), bucket, label: "" });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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
function DiagnosticDiagram({ kind }: { kind: NonNullable<Question["diagram"]> }) {
  return (
    <div className="geometry-diagram after9-diagram">
<svg className="after9-svg" viewBox="0 0 430 270" role="img" aria-label="Геометрическая схема">
        {kind === "rectangle" && (
          <>
            <polygon points="65,70 365,70 365,220 65,220" />
            <line x1="65" y1="220" x2="365" y2="70" />
            <path d="M65 198 h22 v22" className="marker" />
            <text x="37" y="154" className="value-label">5</text>
            <text x="207" y="132" className="value-label">13</text>
          </>
        )}
        {kind === "circle-chords" && (
          <>
            <circle cx="210" cy="135" r="100" />
            <line x1="111" y1="110" x2="309" y2="110" />
            <line x1="128" y1="73" x2="267" y2="212" />
            <circle cx="165" cy="110" r="4.5" className="diagram-point" />
            <text x="98" y="103">A</text><text x="314" y="103">B</text><text x="116" y="64">C</text><text x="272" y="226">D</text><text x="169" y="132">E</text>
            <text x="132" y="101" className="value-label">3</text><text x="229" y="101" className="value-label">8</text><text x="137" y="92" className="value-label">4</text>
          </>
        )}
        {kind === "isosceles-trapezoid" && (
          <>
            <polygon points="45,220 385,220 300,60 130,60" />
            <line x1="45" y1="220" x2="300" y2="60" />
           <line x1="82" y1="138" x2="96" y2="146" className="tick" />
<line x1="334" y1="146" x2="348" y2="138" className="tick" />
            <text x="27" y="242">A</text><text x="388" y="242">B</text><text x="304" y="53">C</text><text x="113" y="53">D</text>
            <text x="207" y="247" className="value-label">14</text><text x="205" y="51" className="value-label">6</text>
          </>
        )}
      </svg>
      <p className="diagram-note">Рисунок не обязательно выполнен в масштабе</p>
    </div>
  );
}

function GraphOption({ id }: { id: string }) {
  const formula = (x: number) => id === "g1" ? x*x - 4*x + 3 : id === "g2" ? x*x + 4*x + 3 : id === "g3" ? -x*x + 4*x - 3 : x*x - 4*x - 3;
  const points = Array.from({ length: 37 }, (_, index) => {
    const x = -4 + index * 0.25; const y = formula(x);
    return `${170 + x * 24},${130 - y * 24}`;
  }).join(" ");
  return (
<svg className="after9-svg" viewBox="0 0 300 230" role="img" aria-label="Вариант графика квадратичной функции">
      <g className="mini-grid">
        {[26,50,74,98,122,146,170,194,218,242,266,290].map((x) => <line key={`x${x}`} x1={x} y1="10" x2={x} y2="220" />)}
        {[10,34,58,82,106,130,154,178,202].map((y) => <line key={`y${y}`} x1="10" y1={y} x2="290" y2={y} />)}
      </g>
      <g className="mini-axes"><line x1="10" y1="130" x2="294" y2="130" /><line x1="170" y1="220" x2="170" y2="6" /><text x="288" y="145">x</text><text x="178" y="14">y</text></g>
      <polyline points={points} className="parabola-line" />
    </svg>
  );
}

function PhotoUploader({ bucket, photos, onAdd, onRemove, onLabel, onZoom }: {
  bucket: string; photos: Photo[]; onAdd: (files: FileList, bucket: string) => void;
  onRemove: (photo: Photo) => void; onLabel: (photo: Photo, label: string) => void; onZoom: (photo: Photo) => void;
}) {
  const items = photos.filter((photo) => photo.bucket === bucket);
  return (
    <div className="photo-uploader">
      <label className="photo-button"><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple onChange={(event) => {
        if (event.target.files?.length) onAdd(event.target.files, bucket);
        event.currentTarget.value = "";
      }} /><span>＋ Добавить фотографии</span></label>
      {items.length > 0 && <div className="photo-grid after9-photo-grid">{items.map((photo) => (
        <figure key={photo.id}>
          <button className="photo-preview" type="button" onClick={() => onZoom(photo)}><img src={photo.data} alt={`Решение: ${photo.name}`} /></button>
          <input value={photo.label} onChange={(event) => onLabel(photo, event.target.value)} placeholder="№ задания" aria-label={`Номер задания для ${photo.name}`} />
          <figcaption><span>{photo.name}</span><button type="button" onClick={() => onRemove(photo)}>Удалить</button></figcaption>
        </figure>
      ))}</div>}
    </div>
  );
}

export default function AfterGradeNineDiagnostic() {
  const [screen, setScreen] = useState<"home" | "test" | "bridgeB" | "bridgeC" | "photos" | "review" | "result">("home");
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [order, setOrder] = useState(initialOrder);
  const [orderTouched, setOrderTouched] = useState(false);
  const [graphOrder, setGraphOrder] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [zoomPhoto, setZoomPhoto] = useState<Photo | null>(null);
  const [toast, setToast] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [advancedSkipped, setAdvancedSkipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (["home","test","bridgeB","bridgeC","photos","review"].includes(parsed.screen)) setScreen(parsed.screen);
        setName(parsed.name || ""); setDestination(parsed.destination || ""); setAccepted(Boolean(parsed.accepted));
        setCurrent(Math.min(Math.max(parsed.current || 0, 0), 23)); setAnswers(parsed.answers || {});
        setOrder(parsed.order?.length === 3 ? parsed.order : initialOrder); setOrderTouched(Boolean(parsed.orderTouched));
        setGraphOrder(parsed.graphOrder?.length === 4 ? parsed.graphOrder : shuffleGraphs());
      } else setGraphOrder(shuffleGraphs());
    } catch { setGraphOrder(shuffleGraphs()); }
    dbGetAll().then(setPhotos).catch(() => {});
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && screen !== "result") localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, name, destination, accepted, current, answers, order, orderTouched, graphOrder }));
  }, [name, destination, accepted, current, answers, order, orderTouched, graphOrder, screen, hydrated]);

  const update = (id: number, patch: Partial<Answer>) => setAnswers((previous) => ({ ...previous, [id]: { ...(previous[id] || blank()), ...patch, dontKnow: false } }));
  const answer = (id: number) => answers[id] || blank();

  const addPhotos = async (files: FileList, bucket: string) => {
    const added: Photo[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) continue;
      const photo = await readPhoto(file, bucket); await dbPut(photo); added.push(photo);
    }
    setPhotos((previous) => [...previous, ...added]);
  };
  const removePhoto = async (photo: Photo) => { await dbDelete(photo.id); setPhotos((previous) => previous.filter((item) => item.id !== photo.id)); };
  const labelPhoto = async (photo: Photo, label: string) => {
    const next = { ...photo, label }; await dbPut(next);
    setPhotos((previous) => previous.map((item) => item.id === photo.id ? next : item));
  };

  const hasContent = (question: Question) => {
    const stored = answer(question.id);
    if (stored.dontKnow) return true;
    if (question.type === "order") return orderTouched;
    if (["table","fraction","double","manual2"].includes(question.type)) return Boolean(stored.value.trim() && stored.extra.trim());
    if (question.type === "manualProof") return Boolean(
      stored.explanation.trim() ||
      stored.extra.trim() ||
      photos.some((photo) => photo.bucket === "q24" || (photo.bucket === "final" && photo.label.includes("24")))
    );
    if (question.type === "triple") return Boolean(stored.value.trim() && stored.extra.trim() && stored.parts[0]?.trim());
    if (question.type === "quadratic") return Boolean(stored.value && stored.parts.slice(0,3).every((part) => part?.trim()));
    if (question.type === "manual3") return Boolean(stored.value.trim() || stored.extra.trim() || stored.parts[0]?.trim() || stored.explanation.trim() || photos.some((photo) => photo.bucket === "q22"));
    if (question.id >= 21) return Boolean(stored.value.trim() || stored.extra.trim() || stored.explanation.trim() || photos.some((photo) => photo.bucket === `q${question.id}`));
    return Boolean(stored.value.trim());
  };

  const markUnknown = (question: Question) => {
    setAnswers((previous) => ({ ...previous, [question.id]: { ...(previous[question.id] || blank()), value: "", extra: "", parts: [], explanation: "", dontKnow: true } }));
    if (question.type === "order") { setOrder(initialOrder); setOrderTouched(false); }
  };

  const moveCard = (index: number, delta: -1 | 1) => {
    const target = index + delta; if (target < 0 || target >= order.length) return;
    const next = [...order]; [next[index], next[target]] = [next[target], next[index]];
    setOrder(next); setOrderTouched(true); update(8, { value: next.join("|") });
  };

  const subchecks = useMemo(() => {
    const q16 = answer(16); const q17 = answer(17); const q19 = answer(19);
    const roots13 = numberList(answer(13).value); const roots16 = numberList(q16.parts[0] || "");
    return {
      q9time: timeCorrect(answer(9).value), q9rise: eq(answer(9).extra, 7),
      q12fraction: fractionFormCorrect(answer(12).value), q12restrictions: restrictionsCorrect(answer(12).extra),
      q16direction: normalize(q16.value) === "вверх",
      q16roots: roots16.length === 2 && roots16[0] === 1 && roots16[1] === 3,
      q16vertex: eq(q16.parts[1] || "", 2), q16graph: q16.parts[2] === "g1",
      q17term: eq(q17.value, 29), q17sum: eq(q17.extra, 110),
      q19mean: eq(q19.value, 5.25), q19median: eq(q19.extra, 6), q19probability: eq(q19.parts[0] || "", 3/8),
      q13: roots13.length === 2 && roots13[0] === 0.5 && roots13[1] === 3,
    };
  }, [answers]);

  const questionCorrect = (id: number) => {
    const a = answer(id);
    if (a.dontKnow) return false;
    const targets: Record<number, number> = { 1: .25, 2: 1200, 3: 630, 4: 3, 5: 9, 6: 9, 7: 40, 10: 60, 18: 3.5, 20: 6 };
    if (targets[id] !== undefined) return eq(a.value, targets[id]);
    if (id === 8) return orderTouched && order.every((value, index) => value === correctOrder[index]);
    if (id === 9) return subchecks.q9time && subchecks.q9rise;
    if (id === 11) return factorCorrect(a.value);
    if (id === 12) return subchecks.q12fraction && subchecks.q12restrictions;
    if (id === 13) return subchecks.q13;
    if (id === 14) return pairsCorrect(a.value);
    if (id === 15) return intervalCorrect(a.value);
    if (id === 16) return subchecks.q16direction && subchecks.q16roots && subchecks.q16vertex && subchecks.q16graph;
    if (id === 17) return subchecks.q17term && subchecks.q17sum;
    if (id === 19) return subchecks.q19mean && subchecks.q19median && subchecks.q19probability;
    return false;
  };

  const skills = useMemo<SkillResult[]>(() => {
    const skill = (key: string, questionId: number, name: string, correct: boolean): SkillResult => ({ key, questionId, name, correct, reference: Boolean(answer(questionId).reference) });
    return [
      skill("1",1,"Действия с числами",questionCorrect(1)), skill("2",2,"Проценты",questionCorrect(2)),
      skill("3",3,"Пропорции",questionCorrect(3)), skill("4",4,"Степени и корни",questionCorrect(4)),
      skill("5",5,"Преобразование выражений",questionCorrect(5)), skill("6",6,"Линейные уравнения",questionCorrect(6)),
      skill("7",7,"Подстановка в формулу",questionCorrect(7)), skill("8",8,"Сравнение чисел",questionCorrect(8)),
      skill("9a",9,"Чтение таблиц: минимум",subchecks.q9time), skill("9b",9,"Чтение таблиц: изменение величины",subchecks.q9rise),
      skill("10",10,"Теорема Пифагора и площадь прямоугольника",questionCorrect(10)),
      skill("11",11,"Формулы сокращённого умножения",questionCorrect(11)),
      skill("12a",12,"Сокращение алгебраических дробей",subchecks.q12fraction),
      skill("12b",12,"Допустимые значения переменной",subchecks.q12restrictions),
      skill("13",13,"Квадратные уравнения",questionCorrect(13)), skill("14",14,"Системы уравнений",questionCorrect(14)),
      skill("15",15,"Квадратные неравенства",questionCorrect(15)),
      skill("16a",16,"Направление ветвей параболы",subchecks.q16direction),
      skill("16b",16,"Нули квадратичной функции",subchecks.q16roots),
      skill("16c",16,"Вершина параболы",subchecks.q16vertex),
      skill("16d",16,"Связь формулы и графика",subchecks.q16graph),
      skill("17a",17,"Члены арифметической прогрессии",subchecks.q17term),
      skill("17b",17,"Сумма арифметической прогрессии",subchecks.q17sum),
      skill("18",18,"Задачи на движение",questionCorrect(18)),
      skill("19a",19,"Среднее арифметическое",subchecks.q19mean),
      skill("19b",19,"Медиана",subchecks.q19median),
      skill("19c",19,"Вероятность",subchecks.q19probability),
      skill("20",20,"Хорды окружности",questionCorrect(20)),
    ];
  }, [answers, order, orderTouched, subchecks]);

  const goNext = () => {
    if (current === 9) setScreen("bridgeB");
    else if (current === 19) setScreen("bridgeC");
    else if (current === 23) setScreen("photos");
    else setCurrent((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = async () => {
    if (!window.confirm("Все сохранённые ответы, результаты и загруженные фотографии будут удалены. Начать заново?")) return;
    localStorage.removeItem(STORAGE_KEY); await dbClear().catch(() => {});
    setName(""); setDestination(""); setAccepted(false); setCurrent(0); setAnswers({}); setOrder(initialOrder); setOrderTouched(false);
    setGraphOrder(shuffleGraphs()); setPhotos([]); setScreen("home"); setToast(""); setCopyFallback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const manualStatus = (id: number) => {
    const question = questions[id - 1]; const stored = answer(id);
    if (stored.dontKnow) return "Не знаю, как решить";
    if (!hasContent(question)) return "Ответ не заполнен";
    const hasPhoto = photos.some((photo) => photo.bucket === `q${id}` || (photo.bucket === "final" && photo.label.includes(String(id))));
    const hasSolution = Boolean(stored.explanation.trim() || hasPhoto);
    return hasSolution ? "Ответ и решение приложены" : "Указан только ответ";
  };

  const status = (question: Question) => answer(question.id).dontKnow ? "Не знаю, как решить" : hasContent(question) ? "Ответ дан" : "Ответ не заполнен";
  const unanswered = questions.filter((question) => status(question) === "Ответ не заполнен");

  const reportText = () => {
    const scoreA = questions.slice(0,10).filter((q) => questionCorrect(q.id)).length;
    const scoreB = questions.slice(10,20).filter((q) => questionCorrect(q.id)).length;
    const self = skills.filter((item) => item.correct && !item.reference).map((item) => item.name);
    const repeat = skills.filter((item) => !item.correct).map((item) => item.name);
    return [
      "Диагностика “Что повторить перед 10 классом или колледжем?”", `Ученик: ${name}`, `Дальнейшее обучение: ${destination}`,
      `Автоматическая часть: ${scoreA + scoreB} из 20`, `Блок А. Базовые знания и навыки: ${scoreA} из 10`,
      `Блок Б. Программа 7–9 классов: ${scoreB} из 10`,
      `Не получилось выполнить: ${questions.filter((q) => answer(q.id).dontKnow).length}`,
      `Получилось самостоятельно:\n${self.length ? self.map((item) => `— ${item}`).join("\n") : "—"}`,
      `Стоит повторить:\n${repeat.length ? repeat.map((item) => `— ${item}`).join("\n") : "—"}`,
     ...(!advancedSkipped
  ? [
      `Блок В. Готовность к дальнейшему обучению:\n${[21, 22, 23, 24]
        .map((id) => `№${id} — ${manualStatus(id)}`)
        .join("\n")}`,
      `Фотографии решений: ${
        photos.length ? "приложены" : "не приложены"
      }`,
    ]
  : []),
    ].join("\n\n");
  };

  const download = () => {
   const questionsForDownload = advancedSkipped
  ? questions.slice(0, 20)
  : questions;

const rows = questionsForDownload.map((q) => {
      const a = answer(q.id);
      const content = [a.value && `Ответ: ${escapeHtml(a.value)}`, a.extra && `Дополнительный ответ: ${escapeHtml(a.extra)}`,
        a.parts.filter(Boolean).length && `Другие пункты: ${a.parts.map(escapeHtml).join("; ")}`,
        a.explanation && `Ход решения: ${escapeHtml(a.explanation)}`,
        a.dontKnow && "Не знаю, как решить", photos.some((p) => p.bucket === `q${q.id}`) && `Фотографий: ${photos.filter((p) => p.bucket === `q${q.id}`).length}`].filter(Boolean).join("<br>");
      return `<tr><td>${q.id}</td><td>${escapeHtml(q.topic)}</td><td>${content || "Ответ не заполнен"}</td></tr>`;
    }).join("");
const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Результат диагностики</title><style>body{font-family:Arial,sans-serif;max-width:920px;margin:40px auto;padding:0 20px;color:#28222c}h1{color:#674fa6}pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}@media print{button{display:none}}</style><body><h1>Что повторить перед 10 классом или колледжем?</h1><pre>${escapeHtml(reportText())}</pre><h2>Все ответы</h2><table><tr><th>№</th><th>Тема</th><th>Ответ</th></tr>${rows}</table>${advancedSkipped ? "" : "<p><b>Фотографии:</b> хранятся только в браузере. Отправьте оригиналы Лере в Telegram вместе с результатом.</p>"}<button onclick="window.print()">Печать / сохранить как PDF</button></body></html>`;    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `Перед_10_классом_или_колледжем_${name.replace(/\s+/g, "_") || "ученик"}.html`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyResult = async (message = "Результат скопирован") => {
    try { await navigator.clipboard.writeText(reportText()); setToast(message); setCopyFallback(""); }
    catch { setToast("Браузер запретил автоматическое копирование"); setCopyFallback(reportText()); }
    window.setTimeout(() => setToast(""), 4000);
  };

  if (screen === "test") {
  const question = questions[current];
  const stored = answer(question.id);

  const setPart = (index: number, value: string) => {
    const parts = [...stored.parts];
    parts[index] = value;
    update(question.id, { parts });
  };

  return (
    <main className="test-shell oge-page after9-page">
      <header className="compact-header">
        <a className="brand" href="/">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </a>

        <button className="text-button" onClick={restart}>
          Начать сначала
        </button>
      </header>

      <section className="test-wrap">
        <div className="progress-line">
          <div>
            <span>Задание {question.id} из 24</span>
            <small>
              {question.block} · {question.topic}
            </small>
          </div>

          <strong>{Math.round((question.id / 24) * 100)}%</strong>
        </div>

        <div className="progress-track">
          <span style={{ width: `${(question.id / 24) * 100}%` }} />
        </div>

        <article className="question-card after9-question">
          <div className="question-meta">
            <span>{question.block}</span>
            <span>{question.topic}</span>
          </div>

          <h1>{question.prompt}</h1>

          {question.expression && (
            <div className="expression oge-expression">
              <MathFormula expression={question.expression} />
            </div>
          )}
            {question.type === "table" && <div className="temperature-table"><div><b>Время</b>{["0:00","4:00","8:00","12:00","16:00","20:00"].map((v) => <span key={v}>{v}</span>)}</div><div><b>Температура, °C</b>{[6,3,1,5,8,7].map((v,i) => <span key={`${v}-${i}`}>{v}</span>)}</div></div>}
            {question.diagram && <DiagnosticDiagram kind={question.diagram} />}

            {["number","factor","roots","pairs","interval"].includes(question.type) && <label className="answer-field"><span>Ответ</span><input value={stored.dontKnow ? "" : stored.value} onChange={(e) => update(question.id, { value: e.target.value })} placeholder="Введите ответ" /></label>}
            {question.type === "order" && <div className="order-task"><p>Расположите карточки в порядке возрастания:</p><div className="order-list">{order.map((value,index) => <div className="order-card" key={value} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain",String(index))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
              e.preventDefault(); const from = Number(e.dataTransfer.getData("text/plain")); if (!Number.isInteger(from) || from === index) return;
              const next=[...order]; const [moved]=next.splice(from,1); next.splice(index,0,moved); setOrder(next); setOrderTouched(true); update(8,{value:next.join("|")});
            }}><span>{value}</span><div><button type="button" disabled={index===0} onClick={() => moveCard(index,-1)}>↑</button><button type="button" disabled={index===order.length-1} onClick={() => moveCard(index,1)}>↓</button></div></div>)}</div></div>}
            {["table","fraction","double"].includes(question.type) && <div className="double-fields">
              <label className="answer-field"><span>{question.id===9?"Время":question.id===12?"Сокращённая дробь":"Десятый член"}</span><input value={stored.dontKnow?"":stored.value} onChange={(e)=>update(question.id,{value:e.target.value})}/></label>
              <label className="answer-field"><span>{question.id===9?"Температура повысилась на":question.id===12?"Недопустимые значения x":"Сумма первых десяти членов"}</span><input value={stored.dontKnow?"":stored.extra} onChange={(e)=>update(question.id,{extra:e.target.value})}/></label>
            </div>}
            {question.type === "triple" && <div className="triple-fields"><label className="answer-field"><span>Среднее арифметическое</span><input value={stored.value} onChange={(e)=>update(19,{value:e.target.value})}/></label><label className="answer-field"><span>Медиана</span><input value={stored.extra} onChange={(e)=>update(19,{extra:e.target.value})}/></label><label className="answer-field"><span>Вероятность</span><input value={stored.parts[0]||""} onChange={(e)=>setPart(0,e.target.value)}/></label></div>}
            {question.type === "quadratic" && <div className="quadratic-task">
              <fieldset><legend>Куда направлены ветви?</legend>{["Вверх","Вниз"].map((v)=><label key={v}><input type="radio" name="direction" checked={stored.value===v} onChange={()=>update(16,{value:v})}/>{v}</label>)}</fieldset>
              <div className="double-fields"><label className="answer-field"><span>Нули функции</span><input value={stored.parts[0]||""} onChange={(e)=>setPart(0,e.target.value)} placeholder="Оба значения"/></label><label className="answer-field"><span>Абсцисса вершины</span><input value={stored.parts[1]||""} onChange={(e)=>setPart(1,e.target.value)}/></label></div>
              <p>Выберите подходящий график:</p><div className="graph-options">{graphOrder.map((id,index)=><label className={stored.parts[2]===id?"selected":""} key={id}><input type="radio" name="graph" checked={stored.parts[2]===id} onChange={()=>setPart(2,id)}/><span>Вариант {index+1}</span><GraphOption id={id}/></label>)}</div>
            </div>}
            {question.id >= 21 && <div className="advanced-fields">
              {question.type === "manual1" && <label className="answer-field"><span>Ответ</span><input value={stored.value} onChange={(e)=>update(21,{value:e.target.value})}/></label>}
              {question.type === "manual3" && <><div className="triple-fields"><label className="answer-field"><span>Координаты вершины</span><input value={stored.value} onChange={(e)=>update(22,{value:e.target.value})}/></label><label className="answer-field"><span>Наибольшее значение</span><input value={stored.extra} onChange={(e)=>update(22,{extra:e.target.value})}/></label><label className="answer-field"><span>Решение неравенства</span><input value={stored.parts[0]||""} onChange={(e)=>setPart(0,e.target.value)}/></label></div></>}
              {question.type === "manual2" && <div className="double-fields"><label className="answer-field"><span>Первая труба</span><input value={stored.value} onChange={(e)=>update(23,{value:e.target.value})}/></label><label className="answer-field"><span>Вторая труба</span><input value={stored.extra} onChange={(e)=>update(23,{extra:e.target.value})}/></label></div>}
              {question.type === "manualProof" && <><label className="answer-field"><span>Доказательство</span><textarea value={stored.explanation} onChange={(e)=>update(24,{explanation:e.target.value})}/></label><label className="answer-field"><span>Периметр</span><input value={stored.extra} onChange={(e)=>update(24,{extra:e.target.value})}/></label></>}
              {question.type !== "manualProof" && <label className="answer-field"><span>Кратко опишите ход решения <small>необязательно</small></span><textarea value={stored.explanation} onChange={(e)=>update(question.id,{explanation:e.target.value})}/></label>}
              <PhotoUploader bucket={`q${question.id}`} photos={photos} onAdd={addPhotos} onRemove={removePhoto} onLabel={labelPhoto} onZoom={setZoomPhoto}/>
              {hasContent(question) && !stored.dontKnow && <p className="manual-note">Ответ сохранён. Полное решение проверит преподаватель.</p>}
            </div>}
           
            <div className="test-actions grade-seven-actions"><button className="button secondary" disabled={current===0} onClick={()=>{setCurrent(v=>v-1);window.scrollTo({top:0})}}>← Назад</button><button className={`button dont-know-button ${stored.dontKnow?"active-dont-know":""}`} onClick={()=>markUnknown(question)}>{stored.dontKnow?"Отмечено: не знаю":"Не знаю, как решить"}</button><button
  className="button primary"
  disabled={!hasContent(question)}
  onClick={goNext}
>
  Далее →
</button></div>
          </article>
          <p className="save-note">Ответы, тексты решений и прогресс сохраняются только на этом устройстве</p>
        </section>
        {zoomPhoto && <div className="photo-modal" role="dialog" aria-modal="true" onClick={()=>setZoomPhoto(null)}><button onClick={()=>setZoomPhoto(null)}>Закрыть ×</button><img src={zoomPhoto.data} alt={zoomPhoto.name}/></div>}
      </main>
    );
  }

 if (screen === "bridgeB") {
  return (
    <main className="center-screen after9-page">
      <section className="review-card bridge-card">
        <div className="review-icon">Б</div>
        <p className="kicker">Блок А завершён</p>

        <h1>Основная программа 7–9 классов</h1>

        <p>
          Теперь проверим алгебру, функции, текстовые задачи,
          вероятность и геометрию.
        </p>

        <button
          className="button primary"
          onClick={() => {
            setCurrent(10);
            setScreen("test");
            window.scrollTo({ top: 0 });
          }}
        >
          Продолжить →
        </button>
      </section>
    </main>
  );
}

if (screen === "bridgeC") {
  return (
    <main className="center-screen after9-page">
      <section className="review-card bridge-card">
        <div className="review-icon">✓</div>
        <p className="kicker">Основная диагностика завершена</p>

        <h1>Можно посмотреть результат</h1>

        <p>
          Ты выполнил(а) основную часть диагностики. Результат по базовым
          знаниям и программе 7–9 классов уже готов.
        </p>

        <p>
          Дополнительно можно выполнить четыре более сложных задания.
          В них важен не только ответ, но и ход решения.
        </p>

        <div className="review-actions">
          <button
            className="button secondary"
            onClick={() => {
              setAdvancedSkipped(true);
              setScreen("result");
              localStorage.removeItem(STORAGE_KEY);
              window.scrollTo({ top: 0 });
            }}
          >
            Посмотреть результат
          </button>

          <button
            className="button primary"
            onClick={() => {
              setAdvancedSkipped(false);
              setCurrent(20);
              setScreen("test");
              window.scrollTo({ top: 0 });
            }}
          >
            Выполнить сложные задания →
          </button>
        </div>
      </section>
    </main>
  );
}

  if (screen === "photos") {
    return <main className="center-screen after9-page"><section className="review-card photo-review-card"><div className="review-icon">▧</div><p className="kicker">Решения на бумаге</p><h1>Загрузи фотографии решений</h1><p>Фотографии помогут увидеть не только финальные ответы, но и ход рассуждений. Особенно важно приложить решения заданий №21–24.</p><PhotoUploader bucket="final" photos={photos} onAdd={addPhotos} onRemove={removePhoto} onLabel={labelPhoto} onZoom={setZoomPhoto}/><p className="privacy-note">Можно подписать номер задания под каждой фотографией. Файлы хранятся только в этом браузере.</p><div className="review-actions"><button className="button secondary" onClick={()=>{setCurrent(23);setScreen("test")}}>Назад к №24</button><button className="button primary" onClick={()=>setScreen("review")}>Перейти к обзору →</button></div></section>{zoomPhoto&&<div className="photo-modal" onClick={()=>setZoomPhoto(null)}><button onClick={()=>setZoomPhoto(null)}>Закрыть ×</button><img src={zoomPhoto.data} alt={zoomPhoto.name}/></div>}</main>;
  }

 if (screen === "review") {
  const markUnansweredAsUnknown = () => {
    setAnswers((previous) => {
      const next = { ...previous };

      unanswered.forEach((question) => {
        next[question.id] = {
          ...(next[question.id] || blank()),
          value: "",
          extra: "",
          parts: [],
          explanation: "",
          dontKnow: true,
        };
      });

      return next;
    });
  };

  const finishDiagnostic = () => {
    const confirmed = window.confirm(
      "После завершения ответы будут проверены, и изменить их уже не получится. Завершить диагностику?"
    );

    if (!confirmed) return;

    setScreen("result");
    localStorage.removeItem(STORAGE_KEY);
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="result-page after9-page review-overview">
      <header className="compact-header">
        <a className="brand" href="/">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </a>
      </header>

      <section className="result-section overview-heading">
        <p className="kicker">Перед завершением</p>
        <h1>Обзор всех 24 заданий</h1>

        <p>
          {unanswered.length > 0
            ? `Без ответа осталось: ${unanswered.length}. Вернись к ним или засчитай как «Не знаю, как решить».`
            : "Все задания заполнены или отмечены как «Не знаю, как решить»."}
        </p>
      </section>

      <section className="result-section overview-grid">
        {questions.map((question, index) => (
          <button
            className={`overview-item ${
              answer(question.id).dontKnow
                ? "unknown"
                : hasContent(question)
                  ? "answered"
                  : "empty"
            }`}
            key={question.id}
            onClick={() => {
              setCurrent(index);
              setScreen("test");
              window.scrollTo({ top: 0 });
            }}
          >
            <b>№{question.id}</b>
          </button>
        ))}
      </section>

      <section className="result-section review-finish">
        {unanswered.length > 0 && (
          <button
            className="button secondary"
            onClick={markUnansweredAsUnknown}
          >
            Засчитать пропуски как «Не знаю»
          </button>
        )}

        <button
          className="button primary"
          disabled={unanswered.length > 0}
          onClick={finishDiagnostic}
        >
          Завершить диагностику
        </button>
      </section>
    </main>
  );
}
if (screen === "result") {
  const scoreA = questions
    .slice(0, 10)
    .filter((q) => questionCorrect(q.id)).length;

  const scoreB = questions
    .slice(10, 20)
    .filter((q) => questionCorrect(q.id)).length;

  const self = skills.filter((s) => s.correct);
  const repeat = skills.filter((s) => !s.correct);

  const pa = scoreA / 10;
  const pb = scoreB / 10;

  let conclusion =
    pa < 0.5
      ? "Сначала стоит укрепить базовые вычислительные и алгебраические навыки. Они понадобятся практически в каждой теме старшей школы или колледжа"
      : pa < 0.8
        ? "Основная база уже есть, но некоторые вычислительные и алгебраические навыки стоит повторить перед началом новой программы"
        : pb < 0.7
          ? "Базовые навыки сформированы. Основное внимание стоит уделить отдельным темам программы 7–9 классов"
          : pb >= 0.8
            ? "Большая часть опорных знаний из программы 5–9 классов сохранилась. После проверки сложных заданий можно будет составить точный план повторения"
            : "Базовые навыки сформированы. Отдельные темы программы 7–9 классов стоит повторить перед началом новой программы";

  if (Math.abs(pa - pb) >= 0.4) {
    conclusion +=
      pa > pb
        ? " Базовые навыки оказались увереннее, чем темы программы 7–9 классов."
        : " Темы 7–9 классов оказались увереннее базовых вычислительных навыков.";
  }

  return (
    <main className="result-page after9-page">
      <header className="compact-header result-header">
        <a className="brand" href="/">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </a>

        <button className="text-button" onClick={restart}>
          Пройти ещё раз
        </button>
      </header>

      <section className="result-hero">
        <div className="score-orbit">
          <strong>{scoreA + scoreB}</strong>
          <span>из 20</span>
        </div>

        <div>
         <p className="kicker">
  {advancedSkipped ? "Результат" : "Предварительный результат"}
</p>
          <h1>{name}, вот твой результат</h1>
          <p>{conclusion}</p>
          <small>Дальнейшее обучение: {destination}</small>
        </div>
      </section>

      <section className="result-section result-stats oge-stats">
        <article>
          <strong>{scoreA + scoreB}/20</strong>
          <span>автоматическая часть</span>
        </article>

        <article>
          <strong>{scoreA}/10</strong>
          <span>блок А</span>
        </article>

        <article>
          <strong>{scoreB}/10</strong>
          <span>блок Б</span>
        </article>

        <article>
          <strong>
            {questions.filter((q) => answer(q.id).dontKnow).length}
          </strong>
          <span>«не знаю»</span>
        </article>

       {!advancedSkipped && (
  <article>
    <strong>Ожидает</strong>
    <span>проверка блока В</span>
  </article>
)}
      </section>

      <section className="result-section three-topic-panels oge-topic-panels">
        {self.length > 0 && (
          <article className="topic-panel strong-panel">
            <p className="kicker">Без подсказок</p>
            <h2>Получилось самостоятельно</h2>

            <div className="topic-tags">
              {self.map((s) => (
                <span key={s.key}>✓ {s.name}</span>
              ))}
            </div>
          </article>
        )}

        {repeat.length > 0 && (
          <article className="topic-panel restore-panel">
            <p className="kicker">Для повторения</p>
            <h2>Стоит повторить</h2>

            <div className="topic-tags">
              {repeat.map((s) => (
                <span key={s.key}>{s.name}</span>
              ))}
            </div>
          </article>
        )}
      </section>

     {!advancedSkipped && (
  <section className="result-section manual-block">
    <p className="kicker">Блок В</p>
    <h2>Задания №21–24 ожидают проверки преподавателя</h2>

    <div>
      {[21, 22, 23, 24].map((id) => (
        <span key={id}>
          №{id} — {manualStatus(id)}
        </span>
      ))}
    </div>
  </section>
)}

     <section className="final-cta oge-final">
  <div>
    <p className="kicker">
      {advancedSkipped
        ? "Следующий шаг"
        : "Получить разбор и план повторения"}
    </p>

    <h2>
      {advancedSkipped
        ? "Хочешь повторить математику без стресса?"
        : "Отправь результат и фотографии решений Лере"}
    </h2>

    <p>
      {advancedSkipped
        ? "Разберём только те темы, в которых остались пробелы, без повторения всей программы 5–9 классов."
        : "Я посмотрю не только ответы, но и ход работы, отмечу сильные стороны и темы для повторения, а затем предложу подходящий план."}
    </p>
  </div>

  <div className="cta-actions oge-cta-actions">
    <button
      className="button secondary"
      onClick={() => copyResult()}
    >
      Скопировать результат
    </button>

    <a
      className="button primary"
      href={TELEGRAM_URL}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        copyResult(
          advancedSkipped
            ? "Результат скопирован. Вставь его в сообщение"
            : "Результат скопирован. Вставь его в сообщение и прикрепи фотографии решений"
        )
      }
    >
      {advancedSkipped
        ? "Обсудить план повторения"
        : "Открыть Telegram Леры"}
    </a>

    <button
      className="button secondary"
      onClick={restart}
    >
      Пройти ещё раз
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

      <button
        className="button secondary"
        onClick={() => copyResult()}
      >
        Скопировать вручную
      </button>
    </div>
  )}
</section>
    </main>
  );
}

  return (
  <main className="home-page after9-page">
    <header className="site-header">
      <a className="brand" href="/">
        <span className="brand-mark">∿</span>
        <span>Математика без стресса</span>
      </a>
    </header>

    <section className="hero oge-hero">
      <div className="hero-copy">
        <div className="soft-pill">После основной школы</div>

        <h1>
          Что повторить
          <br />
          <em>перед 10 классом или колледжем?</em>
        </h1>

        <p className="hero-lead">
          Проверим знания из программы 5–9 классов и определим, что стоит
          повторить перед 10 классом или колледжем.
        </p>

        <div className="diagnostic-facts oge-facts">
          <span>
            <b>24</b> задания
          </span>
          <span>Три уровня сложности</span>
          <span>Около 60 минут</span>
          <span>Без школьной оценки</span>
          <span>Разбор по темам</span>
          <span>Блок В проверит преподаватель</span>
        </div>

        <label className="name-field">
          <span>Имя и фамилия ученика</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите имя и фамилию"
          />
        </label>

        <fieldset className="destination-choice">
          <legend>Где ты продолжишь обучение?</legend>

          {[
            "10 класс",
            "колледж",
            "пока не определился",
            "другое",
          ].map((v) => (
            <label key={v}>
              <input
                type="radio"
                name="destination"
                checked={destination === v}
                onChange={() => setDestination(v)}
              />
              {v}
            </label>
          ))}
        </fieldset>

        <div className="start-guidance">
          <h2>Перед началом</h2>

          <p className="paper-reminder">
            Приготовь несколько листов бумаги для вычислений и решений.
          </p>

          <ul>
            <li>
              Выполняй работу самостоятельно и по возможности за один подход.
            </li>
            <li>
              Обычно нужно около 60 минут, но строгого ограничения нет.
            </li>
            <li>
              Не используй калькулятор, интернет, учебник, конспекты и
              подсказки.
            </li>
            <li>
              Не стирай неудачные попытки — они тоже помогают увидеть пробелы.
            </li>
            <li>
              Если задание не получается, переходи дальше и вернись позже.
            </li>
            <li>
              Блок В сложнее остальных. Если он пока не получается, это нормально.
            </li>
          </ul>

          <p>
            Эта работа нужна не для оценки, а для определения тем, которые стоит
            повторить перед дальнейшим изучением математики.
          </p>

          <label className="consent-check">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              Я прочитал(а) рекомендации и готов(а) начать
            </span>
          </label>
        </div>

        <button
          className="button primary big"
          disabled={!name.trim() || !destination || !accepted}
          onClick={() => setScreen("test")}
        >
          Начать диагностику →
        </button>

        <p className="privacy-note">
          Имя, ответы и фотографии сохраняются только в этом браузере.
        </p>
      </div>

      <div className="doodle oge-doodle" aria-hidden="true">
        <span className="doodle-plus">10</span>
        <span className="doodle-pi">x²</span>

        <span className="doodle-frac">
          <b>5</b>
          <i />
          <b>9</b>
        </span>

        <div className="doodle-paper">
          <div />
          <div />
          <div />
          <span>✓</span>
        </div>

        <span className="doodle-dot dot-one" />
        <span className="doodle-dot dot-two" />
      </div>
    </section>

    <OtherDiagnostics current="/after9" />

    <footer>
      <div className="brand">
        <span className="brand-mark">∿</span>
        <span>Математика без стресса</span>
      </div>

      <p>Проверяем опорные знания, а не ставим оценку ♡</p>
    </footer>
  </main>
);
}
