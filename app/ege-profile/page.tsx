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

type Photo = { id: string; name: string; type: string; data: string; bucket: string };
type StoredAnswer = {
  value: string;
  extra?: string;
  explanation?: string;
  dontKnow: boolean;
};

type QuestionType = "number" | "advanced13" | "advanced15" | "advanced17" | "advanced18";
type DiagramKind = "planimetry-angle" | "cylinder" | "derivative-graph" | "rectangle-triangle";

type Question = {
  id: number;
  block: "Первая часть" | "Вторая часть";
  topic: string;
  prompt: string;
  expression?: string;
  type: QuestionType;
  diagram?: DiagramKind;
  note?: string;
};

type AutoItem = {
  questionId: number;
  topic: string;
  group: "Геометрия" | "Вероятность" | "Алгебра и тригонометрия" | "Функции и производная" | "Текстовые задачи";
  correct: boolean;
  dontKnow: boolean;
};

const STORAGE_KEY = "ege-profile-diagnostic-v1";
const TELEGRAM_URL = "https://t.me/m/8wQr09o1NDEy";
const DB_NAME = "ege-profile-diagnostic-photos";
const PHOTO_STORE = "photos";

const questions: Question[] = [
  {
    id: 1,
    block: "Первая часть",
    topic: "Планиметрия",
    prompt: "В прямоугольном треугольнике ABC угол C = 90°, угол B = 65°. Из вершины C проведены биссектриса CD и медиана CM. Найдите угол между прямыми CD и CM. Ответ дайте в градусах.",
    type: "number",
    diagram: "planimetry-angle",
  },
  {
    id: 2,
    block: "Первая часть",
    topic: "Векторы",
    prompt: "Найдите скалярное произведение векторов 2a − b и a + b.",
    expression: String.raw`\vec a=(1;3),\qquad \vec b=(-2;4)`,
    type: "number",
  },
  {
    id: 3,
    block: "Первая часть",
    topic: "Стереометрия",
    prompt: "Радиус основания цилиндра увеличили в 4 раза, а высоту уменьшили в 2 раза. Во сколько раз увеличился объём цилиндра?",
    type: "number",
    diagram: "cylinder",
  },
  {
    id: 4,
    block: "Первая часть",
    topic: "Вероятность",
    prompt: "В соревнованиях участвуют 10 спортсменов: 4 из России, 3 из Германии и 3 из Италии. Порядок выступлений определяется случайно. Найдите вероятность того, что первым выступит спортсмен из Германии.",
    type: "number",
  },
  {
    id: 5,
    block: "Первая часть",
    topic: "Вероятность повышенного уровня",
    prompt: "Для каждой из двух кофемашин вероятность того, что к концу дня в ней закончится кофе, равна 0,2. Вероятность того, что кофе закончится в обеих кофемашинах, равна 0,05. Найдите вероятность того, что к концу дня кофе останется в обеих кофемашинах.",
    type: "number",
  },
  {
    id: 6,
    block: "Первая часть",
    topic: "Показательное уравнение",
    prompt: "Найдите корень уравнения.",
    expression: String.raw`5^{x-2}=\frac1{25}`,
    type: "number",
  },
  {
    id: 7,
    block: "Первая часть",
    topic: "Тригонометрия",
    prompt: "Найдите cos α.",
    expression: String.raw`\sin\alpha=-\frac35,\qquad \alpha\in\left(\frac{3\pi}{2};2\pi\right)`,
    type: "number",
    note: "Можно записать ответ обычной или десятичной дробью.",
  },
  {
    id: 8,
    block: "Первая часть",
    topic: "Производная по графику",
    prompt: "На рисунке изображены график функции y = f(x) и касательная к нему в точке с абсциссой x₀. Касательная проходит через точки (2; 1) и (5; 7). Найдите f′(x₀).",
    type: "number",
    diagram: "derivative-graph",
  },
  {
    id: 10,
    block: "Первая часть",
    topic: "Текстовая задача",
    prompt: "Моторная лодка прошла против течения реки 48 км и вернулась обратно. На путь по течению она затратила на 3 часа меньше, чем на путь против течения. Найдите скорость течения реки, если скорость лодки в неподвижной воде равна 12 км/ч.",
    type: "number",
  },
  {
    id: 12,
    block: "Первая часть",
    topic: "Экстремум функции",
    prompt: "Найдите точку максимума функции.",
    expression: String.raw`y=6\ln(x-1)-3x+5`,
    type: "number",
    note: "В ответ запишите значение x.",
  },
  {
    id: 13,
    block: "Вторая часть",
    topic: "Тригонометрическое уравнение",
    prompt: "Решите уравнение и выполните отбор корней.",
    expression: String.raw`2\sin^2x-\sin x\cos x-\cos^2x=0`,
    type: "advanced13",
    note: String.raw`б) Найдите все корни, принадлежащие отрезку \left[-\pi;\frac{3\pi}{2}\right].`,
  },
  {
    id: 15,
    block: "Вторая часть",
    topic: "Показательное неравенство",
    prompt: "Решите неравенство.",
    expression: String.raw`\frac{4^x-5\cdot2^x+4}{2^x-3}\ge0`,
    type: "advanced15",
  },
  {
    id: 17,
    block: "Вторая часть",
    topic: "Планиметрия второй части",
    prompt: "В равнобедренном треугольнике ABC с углом 120° при вершине A проведена биссектриса BD, где D лежит на стороне AC. В треугольник ABC вписан прямоугольник DEFH так, что сторона FH лежит на стороне BC, а вершина E — на стороне AB.",
    type: "advanced17",
    diagram: "rectangle-triangle",
    note: "а) Докажите, что FH = 2DH.  б) Найдите площадь прямоугольника DEFH, если AB = 4.",
  },
  {
    id: 18,
    block: "Вторая часть",
    topic: "Параметр",
    prompt: "Найдите все значения параметра a, при каждом из которых система имеет ровно три различных решения.",
    expression: String.raw`\begin{cases}y=|x^2-4x|,\\y=a(x-2)+4\end{cases}`,
    type: "advanced18",
  },
];

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/ё/g, "е")
    .replace(/\s+/g, "")
    .replace(/,/g, ".");

function numberValue(value: string) {
  const clean = normalize(value)
    .replace(/^[a-zа-я]+=/i, "")
    .replace(/[^0-9./+-]/g, "");
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

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] || character);
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
    const timer = window.setInterval(() => {
      if (renderFormula()) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [element, expression]);

  return <div ref={setElement} />;
}

function ProfileDiagram({ kind }: { kind: DiagramKind }) {
  return (
    <div className="geometry-diagram profile-diagram">
      <svg viewBox="0 0 460 290" role="img" aria-label="Схема к заданию">
        {kind === "planimetry-angle" && (
          <>
            <polygon points="85,235 85,65 385,235" className="edge" />
            <path d="M85 213 h22 v22" className="marker" />
            <line x1="85" y1="235" x2="235" y2="150" className="highlight" />
            <line x1="85" y1="235" x2="235" y2="150" className="highlight" />
            <circle cx="235" cy="150" r="4" className="point" />
            <line x1="85" y1="235" x2="255" y2="160" className="thin-highlight" />
            <text x="68" y="55">A</text>
            <text x="392" y="242">B</text>
            <text x="65" y="255">C</text>
            <text x="242" y="146">M</text>
            <text x="270" y="156">D</text>
            <text x="334" y="220" className="value-label">65°</text>
          </>
        )}
        {kind === "cylinder" && (
          <>
            <ellipse cx="230" cy="65" rx="105" ry="28" className="edge" />
            <ellipse cx="230" cy="225" rx="105" ry="28" className="edge" />
            <line x1="125" y1="65" x2="125" y2="225" className="edge" />
            <line x1="335" y1="65" x2="335" y2="225" className="edge" />
            <line x1="230" y1="65" x2="330" y2="65" className="highlight" />
            <line x1="350" y1="65" x2="350" y2="225" className="highlight" />
            <text x="270" y="54" className="value-label">r</text>
            <text x="360" y="150" className="value-label">h</text>
          </>
        )}
        {kind === "derivative-graph" && (
          <>
            <g className="graph-grid">
              {[60,110,160,210,260,310,360,410].map((x) => <line key={x} x1={x} y1="25" x2={x} y2="260" />)}
              {[35,75,115,155,195,235].map((y) => <line key={y} x1="45" y1={y} x2="425" y2={y} />)}
            </g>
            <g className="graph-axes">
              <line x1="45" y1="235" x2="430" y2="235" />
              <path d="M421 229 l9 6 -9 6" />
              <line x1="60" y1="260" x2="60" y2="15" />
              <path d="M54 23 l6 -8 6 8" />
              <text x="432" y="250">x</text>
              <text x="70" y="20">y</text>
            </g>
            <path d="M75 225 C140 205 180 160 220 145 C260 130 285 125 330 122 C370 120 397 130 420 145" className="function-curve" />
            <line x1="160" y1="195" x2="310" y2="75" className="tangent" />
            <circle cx="160" cy="195" r="5" className="point" />
            <circle cx="310" cy="75" r="5" className="point" />
            <text x="130" y="215" className="value-label">(2; 1)</text>
            <text x="315" y="68" className="value-label">(5; 7)</text>
          </>
        )}
        {kind === "rectangle-triangle" && (
          <>
            <polygon points="230,35 70,245 390,245" className="edge" />
            <line x1="70" y1="245" x2="310" y2="140" className="bisector" />
            <rect x="150" y="140" width="160" height="105" className="rectangle-shape" />
            <text x="222" y="28">A</text>
            <text x="52" y="264">B</text>
            <text x="396" y="264">C</text>
            <text x="316" y="139">D</text>
            <text x="133" y="139">E</text>
            <text x="135" y="264">F</text>
            <text x="316" y="264">H</text>
            <text x="206" y="79" className="value-label">120°</text>
            <text x="185" y="215" className="value-label">DEFH</text>
          </>
        )}
      </svg>
      {kind === "rectangle-triangle" && <p className="diagram-note">Рисунок не обязательно выполнен в масштабе</p>}
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
        <input
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
          multiple
          onChange={(event) => {
            if (event.target.files?.length) onAdd(event.target.files, bucket);
            event.currentTarget.value = "";
          }}
        />
        <span>＋ Добавить фотографии</span>
      </label>
      {bucketPhotos.length > 0 && (
        <div className="photo-grid">
          {bucketPhotos.map((photo) => (
            <figure key={photo.id}>
              <img src={photo.data} alt={`Загруженное решение: ${photo.name}`} />
              <figcaption>
                <span>{photo.name}</span>
                <button type="button" onClick={() => onRemove(photo)}>Удалить</button>
              </figcaption>
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

export default function EgeProfileDiagnostic() {
  const [screen, setScreen] = useState<"home" | "test" | "bridge" | "photos" | "review" | "result">("home");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StoredAnswer>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (["home", "test", "bridge", "photos", "review"].includes(parsed.screen)) setScreen(parsed.screen);
        setName(parsed.name || "");
        setAccepted(Boolean(parsed.accepted));
        setCurrent(Math.min(Math.max(parsed.current || 0, 0), questions.length - 1));
        setAnswers(parsed.answers || {});
      }
    } catch {}
    loadPhotos().then(setPhotos).catch(() => {});
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || screen === "result") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, name, accepted, current, answers }));
  }, [screen, name, accepted, current, answers, hydrated]);

  const update = (id: number, patch: Partial<StoredAnswer>) => {
    setAnswers((previous) => ({
      ...previous,
      [id]: { ...(previous[id] || defaultAnswer()), ...patch, dontKnow: false },
    }));
  };

  const answerHasContent = (question: Question) => {
    const answer = answers[question.id];
    if (answer?.dontKnow) return true;
    if (!answer) return false;
    if (question.type === "advanced13") {
      return Boolean(answer.value.trim() || answer.extra?.trim() || answer.explanation?.trim() || photos.some((photo) => photo.bucket === "q13"));
    }
    if (question.type === "advanced15") {
      return Boolean(answer.value.trim() || answer.explanation?.trim() || photos.some((photo) => photo.bucket === "q15"));
    }
    if (question.type === "advanced17") {
      return Boolean(answer.value.trim() || answer.explanation?.trim() || photos.some((photo) => photo.bucket === "q17"));
    }
    if (question.type === "advanced18") {
      return Boolean(answer.value.trim() || answer.explanation?.trim() || photos.some((photo) => photo.bucket === "q18"));
    }
    return Boolean(answer.value.trim());
  };

  const markDontKnow = (question: Question) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: {
        ...(previous[question.id] || defaultAnswer()),
        value: "",
        extra: "",
        explanation: "",
        dontKnow: true,
      },
    }));
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

  const autoItems = useMemo<AutoItem[]>(() => [
    { questionId: 1, topic: "Планиметрия", group: "Геометрия", correct: equalsNumber(answers[1]?.value || "", 20), dontKnow: Boolean(answers[1]?.dontKnow) },
    { questionId: 2, topic: "Векторы", group: "Геометрия", correct: equalsNumber(answers[2]?.value || "", 10), dontKnow: Boolean(answers[2]?.dontKnow) },
    { questionId: 3, topic: "Стереометрия", group: "Геометрия", correct: equalsNumber(answers[3]?.value || "", 8), dontKnow: Boolean(answers[3]?.dontKnow) },
    { questionId: 4, topic: "Базовая вероятность", group: "Вероятность", correct: equalsNumber(answers[4]?.value || "", 0.3), dontKnow: Boolean(answers[4]?.dontKnow) },
    { questionId: 5, topic: "Вероятность повышенного уровня", group: "Вероятность", correct: equalsNumber(answers[5]?.value || "", 0.65), dontKnow: Boolean(answers[5]?.dontKnow) },
    { questionId: 6, topic: "Показательное уравнение", group: "Алгебра и тригонометрия", correct: equalsNumber(answers[6]?.value || "", 0), dontKnow: Boolean(answers[6]?.dontKnow) },
    { questionId: 7, topic: "Тригонометрия", group: "Алгебра и тригонометрия", correct: equalsNumber(answers[7]?.value || "", 0.8), dontKnow: Boolean(answers[7]?.dontKnow) },
    { questionId: 8, topic: "Производная по графику", group: "Функции и производная", correct: equalsNumber(answers[8]?.value || "", 2), dontKnow: Boolean(answers[8]?.dontKnow) },
    { questionId: 10, topic: "Текстовая задача", group: "Текстовые задачи", correct: equalsNumber(answers[10]?.value || "", 4), dontKnow: Boolean(answers[10]?.dontKnow) },
    { questionId: 12, topic: "Экстремум функции", group: "Функции и производная", correct: equalsNumber(answers[12]?.value || "", 3), dontKnow: Boolean(answers[12]?.dontKnow) },
  ], [answers]);

  const status = (question: Question) =>
    answers[question.id]?.dontKnow
      ? "Не знаю, как решить"
      : answerHasContent(question)
        ? "Ответ дан"
        : "Ответ не заполнен";

  const unanswered = questions.filter((question) => status(question) === "Ответ не заполнен");

  const manualStatus = (id: number) => {
    const question = questions.find((item) => item.id === id)!;
    const hasPhoto = photos.some((photo) => photo.bucket === `q${id}`);
    if (answers[id]?.dontKnow) return "не выполнено";
    if (hasPhoto && answerHasContent(question)) return "ответ дан, есть фото";
    if (answerHasContent(question)) return "ответ дан";
    return "не выполнено";
  };

  const goNext = () => {
    if (current === 9) {
      setScreen("bridge");
    } else if (current === questions.length - 1) {
      setScreen("photos");
    } else {
      setCurrent((value) => value + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = async () => {
    if (!window.confirm("Все сохранённые ответы и фотографии будут удалены. Начать заново?")) return;
    localStorage.removeItem(STORAGE_KEY);
    await clearPhotos().catch(() => {});
    setName("");
    setAccepted(false);
    setCurrent(0);
    setAnswers({});
    setPhotos([]);
    setScreen("home");
    setToast("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reportText = () => {
    const score = autoItems.filter((item) => item.correct).length;
    const strong = autoItems.filter((item) => item.correct).map((item) => item.topic);
    const repeat = autoItems.filter((item) => !item.correct).map((item) => item.topic);
    return [
      "Входная диагностика ЕГЭ профиль",
      `Ученик: ${name}`,
      `Автоматическая часть: ${score} из 10`,
      `Не знаю: ${questions.filter((q) => answers[q.id]?.dontKnow).length}`,
      `Получилось:\n${strong.length ? strong.map((item) => `— ${item}`).join("\n") : "—"}`,
      `Стоит повторить:\n${repeat.length ? repeat.map((item) => `— ${item}`).join("\n") : "—"}`,
      `Вторая часть:\n№13 — ${manualStatus(13)}\n№15 — ${manualStatus(15)}\n№17 — ${manualStatus(17)}\n№18 — ${manualStatus(18)}`,
      "Задания второй части требуют ручной проверки преподавателем.",
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

    return `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Результат диагностики ЕГЭ профиль</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#28222c}h1{color:#674fa6}pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}@media print{button{display:none}}</style><body><h1>Входная диагностика ЕГЭ профиль</h1><pre>${escapeHtml(reportText())}</pre><h2>Все ответы</h2><table><tr><th>№</th><th>Тема</th><th>Ответ</th></tr>${rows}</table><p><b>Фотографии решений:</b> сохраняются только в браузере. Отправьте оригиналы Лере в Telegram отдельными файлами.</p><button onclick="window.print()">Печать / сохранить как PDF</button></body></html>`;
  };

  const downloadReport = () => {
    const blob = new Blob([detailedReport()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Диагностика_ЕГЭ_профиль_${name.replace(/\s+/g, "_") || "ученик"}.html`;
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
      <main className="test-shell oge-page ege-profile-page">
        <style>{profileStyles}</style>
        <header className="compact-header">
          <a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a>
          <button className="text-button" onClick={restart}>Начать сначала</button>
        </header>

        <section className="test-wrap">
          <div className="progress-line">
            <div>
              <span>Задание {current + 1} из {questions.length}</span>
              <small>№{question.id} ЕГЭ · {question.block} · {question.topic}</small>
            </div>
            <strong>{Math.round(((current + 1) / questions.length) * 100)}%</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>

          <nav className="question-number-nav" aria-label="Переход по заданиям">
            {questions.map((item, index) => {
              const stateClass = answers[item.id]?.dontKnow ? "unknown" : answerHasContent(item) ? "answered" : "empty";
              return (
                <button
                  type="button"
                  className={`${stateClass} ${index === current ? "current" : ""}`}
                  key={item.id}
                  title={`№${item.id} ЕГЭ`}
                  onClick={() => {
                    setCurrent(index);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {item.id}
                </button>
              );
            })}
          </nav>

          <article className="question-card oge-question profile-question-card">
            <div className="question-meta"><span>{question.block}</span><span>№{question.id} · {question.topic}</span></div>
            <h1>{question.prompt}</h1>
            {question.expression && <div className="expression oge-expression"><MathFormula expression={question.expression} /></div>}
            {question.diagram && <ProfileDiagram kind={question.diagram} />}
            {question.note && question.type === "number" && <p className="profile-note">{question.note}</p>}
            {question.note && question.type !== "number" && question.id !== 17 && (
              <div className="expression secondary-expression"><MathFormula expression={question.note} /></div>
            )}
            {question.id === 17 && question.note && <p className="profile-note strong-note">{question.note}</p>}

            {question.type === "number" && (
              <label className="answer-field">
                <span>Ответ</span>
                <input
                  inputMode="decimal"
                  value={answer.dontKnow ? "" : answer.value}
                  onChange={(event) => update(question.id, { value: event.target.value })}
                  placeholder="Введите ответ"
                />
              </label>
            )}

            {question.type === "advanced13" && (
              <div className="advanced-fields">
                <label className="answer-field">
                  <span>а) Общее решение</span>
                  <input value={answer.dontKnow ? "" : answer.value} onChange={(event) => update(13, { value: event.target.value })} placeholder="Запишите общее решение" />
                </label>
                <label className="answer-field">
                  <span>б) Корни на отрезке</span>
                  <input value={answer.dontKnow ? "" : answer.extra || ""} onChange={(event) => update(13, { extra: event.target.value })} placeholder="Запишите найденные корни" />
                </label>
                <label className="answer-field">
                  <span>Кратко опишите ход решения <small>необязательно</small></span>
                  <textarea value={answer.dontKnow ? "" : answer.explanation || ""} onChange={(event) => update(13, { explanation: event.target.value })} />
                </label>
                <PhotoUploader bucket="q13" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
                {ready && !answer.dontKnow && <p className="manual-note">Ответ сохранён. Полное решение проверит преподаватель.</p>}
              </div>
            )}

            {question.type === "advanced15" && (
              <div className="advanced-fields">
                <label className="answer-field">
                  <span>Ответ</span>
                  <input value={answer.dontKnow ? "" : answer.value} onChange={(event) => update(15, { value: event.target.value })} placeholder="Например: [0; 2) ∪ [3; +∞)" />
                </label>
                <label className="answer-field">
                  <span>Кратко опишите ход решения <small>необязательно</small></span>
                  <textarea value={answer.dontKnow ? "" : answer.explanation || ""} onChange={(event) => update(15, { explanation: event.target.value })} />
                </label>
                <PhotoUploader bucket="q15" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
                {ready && !answer.dontKnow && <p className="manual-note">Ответ сохранён. Полное решение проверит преподаватель.</p>}
              </div>
            )}

            {question.type === "advanced17" && (
              <div className="advanced-fields">
                <label className="answer-field">
                  <span>а) Доказательство</span>
                  <textarea value={answer.dontKnow ? "" : answer.explanation || ""} onChange={(event) => update(17, { explanation: event.target.value })} placeholder="Можно записать кратко или приложить фото полного решения" />
                </label>
                <label className="answer-field">
                  <span>б) Площадь прямоугольника</span>
                  <input value={answer.dontKnow ? "" : answer.value} onChange={(event) => update(17, { value: event.target.value })} placeholder="Введите ответ" />
                </label>
                <PhotoUploader bucket="q17" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
                {ready && !answer.dontKnow && <p className="manual-note">Ответ сохранён. Доказательство и вычисления проверит преподаватель.</p>}
              </div>
            )}

            {question.type === "advanced18" && (
              <div className="advanced-fields">
                <label className="answer-field">
                  <span>Значения параметра</span>
                  <input value={answer.dontKnow ? "" : answer.value} onChange={(event) => update(18, { value: event.target.value })} placeholder="Запишите все значения a" />
                </label>
                <label className="answer-field">
                  <span>Кратко опишите ход решения <small>необязательно</small></span>
                  <textarea value={answer.dontKnow ? "" : answer.explanation || ""} onChange={(event) => update(18, { explanation: event.target.value })} />
                </label>
                <PhotoUploader bucket="q18" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
                {ready && !answer.dontKnow && <p className="manual-note">Ответ сохранён. Полное решение проверит преподаватель.</p>}
              </div>
            )}

            <div className="test-actions grade-seven-actions">
              <button className="button secondary" disabled={current === 0} onClick={() => { setCurrent((value) => value - 1); window.scrollTo({ top: 0 }); }}>← Назад</button>
              <button className={`button dont-know-button ${answer.dontKnow ? "active-dont-know" : ""}`} onClick={() => markDontKnow(question)}>{answer.dontKnow ? "Отмечено: не знаю" : "Не знаю, как решить"}</button>
              <button className="button primary" disabled={!ready} onClick={goNext}>{current === questions.length - 1 ? "К загрузке решений" : "Далее"} →</button>
            </div>
          </article>

          <p className="save-note">Ответы, текст решений и прогресс сохраняются только на этом устройстве</p>
        </section>
      </main>
    );
  }

  if (screen === "bridge") {
    return (
      <main className="center-screen oge-page ege-profile-page">
        <style>{profileStyles}</style>
        <section className="review-card bridge-card">
          <div className="review-icon">II</div>
          <p className="kicker">Первая часть завершена</p>
          <h1>Дальше — задания второй части</h1>
          <p>Здесь важен не только финальный ответ, но и полный ход решения, обоснования и записи. Выполняй задания на бумаге и прикладывай фотографии. Если какое-то задание пока не получается — отметь «Не знаю, как решить» и переходи дальше.</p>
          <button className="button primary" onClick={() => { setCurrent(10); setScreen("test"); window.scrollTo({ top: 0 }); }}>Перейти ко второй части →</button>
        </section>
      </main>
    );
  }

  if (screen === "photos") {
    return (
      <main className="center-screen oge-page ege-profile-page upload-screen">
        <style>{profileStyles}</style>
        <section className="review-card photo-review-card">
          <div className="review-icon">▧</div>
          <p className="kicker">Решения второй части</p>
          <h1>Загрузи фотографии решений</h1>
          <p>Особенно важно приложить решения заданий №13, №15, №17 и №18. Фотографии помогут проверить не только итоговый ответ, но и ход рассуждений.</p>
          <PhotoUploader bucket="final" photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
          <p className="privacy-note">Фотографии сохраняются локально в этом браузере и не отправляются посторонним сервисам.</p>
          <div className="review-actions">
            <button className="button secondary" onClick={() => { setCurrent(13); setScreen("test"); }}>← Назад к №18</button>
            <button className="button primary" onClick={() => { setScreen("review"); window.scrollTo({ top: 0 }); }}>Перейти к обзору →</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "review") {
    return (
      <main className="result-page oge-page ege-profile-page review-overview">
        <style>{profileStyles}</style>
        <header className="compact-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header>
        <section className="result-section overview-heading">
          <p className="kicker">Проверь перед завершением</p>
          <h1>Обзор всех 14 заданий</h1>
          <p>{unanswered.length ? `Без ответа осталось заданий: ${unanswered.length}. Можно вернуться к ним или засчитать как «Не знаю, как решить».` : "Все задания заполнены или отмечены как «Не знаю, как решить»."}</p>
        </section>
        <section className="result-section overview-grid profile-overview-grid">
          {questions.map((question, index) => (
            <button className={`overview-item ${answers[question.id]?.dontKnow ? "unknown" : answerHasContent(question) ? "answered" : "empty"}`} key={question.id} onClick={() => { setCurrent(index); setScreen("test"); window.scrollTo({ top: 0 }); }}>
              <b>№{question.id}</b><span>{status(question)}</span>
            </button>
          ))}
        </section>
        <section className="result-section review-finish">
          {unanswered.length > 0 && (
            <button className="button secondary" onClick={() => {
              setAnswers((previous) => {
                const next = { ...previous };
                unanswered.forEach((question) => {
                  next[question.id] = { ...(next[question.id] || defaultAnswer()), value: "", extra: "", explanation: "", dontKnow: true };
                });
                return next;
              });
            }}>Засчитать пропуски как «Не знаю»</button>
          )}
          <button className="button primary" disabled={unanswered.length > 0} onClick={() => { setScreen("result"); localStorage.removeItem(STORAGE_KEY); window.scrollTo({ top: 0 }); }}>Показать предварительный результат</button>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const score = autoItems.filter((item) => item.correct).length;
    const percent = Math.round((score / autoItems.length) * 100);
    const strong = autoItems.filter((item) => item.correct);
    const repeat = autoItems.filter((item) => !item.correct);
    const dontKnowCount = questions.filter((question) => answers[question.id]?.dontKnow).length;
    const conclusion = percent < 50
      ? "Сейчас полезнее сначала укрепить базу первой части: это даст опору для дальнейшей подготовки к профилю."
      : percent < 80
        ? "Основная база уже есть, но несколько тем стоит восстановить до перехода к регулярной экзаменационной практике."
        : "Первая часть получается уверенно. После проверки решений второй части можно точнее определить уровень и дальнейший план подготовки.";

    const groups = ["Геометрия", "Вероятность", "Алгебра и тригонометрия", "Функции и производная", "Текстовые задачи"] as const;

    return (
      <main className="result-page oge-page ege-profile-page">
        <style>{profileStyles}</style>
        <header className="compact-header result-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Пройти ещё раз</button></header>

        <section className="result-hero">
          <div className="score-orbit"><strong>{score}</strong><span>из 10</span></div>
          <div><p className="kicker">Предварительный результат</p><h1>{name}, диагностика завершена</h1><p>{conclusion}</p><p className="selection-disclaimer">Задания второй части пока не входят в результат — их решение проверит преподаватель.</p></div>
        </section>

        <section className="result-section result-stats oge-stats profile-stats">
          <article><strong>{score}/10</strong><span>автоматическая часть</span></article>
          <article><strong>{percent}%</strong><span>первая часть</span></article>
          <article><strong>{10 - score}</strong><span>с ошибкой</span></article>
          <article><strong>{dontKnowCount}</strong><span>«не знаю»</span></article>
          <article><strong>4</strong><span>ждут проверки</span></article>
        </section>

        <section className="result-section">
          <div className="section-heading"><div><p className="kicker">По навыкам</p><h2>Как выглядит первая часть</h2></div></div>
          <div className="block-results grade-eleven-blocks">
            {groups.map((group) => {
              const items = autoItems.filter((item) => item.group === group);
              const correct = items.filter((item) => item.correct).length;
              const groupPercent = Math.round((correct / items.length) * 100);
              const statusClass = groupPercent >= 80 ? "great" : groupPercent >= 50 ? "medium" : "restore";
              return (
                <article className={`block-card ${statusClass}`} key={group}>
                  <div className="block-topline"><span>{correct}/{items.length} · {groupPercent}%</span><b>{groupPercent >= 80 ? "Получается уверенно" : groupPercent >= 50 ? "Стоит немного повторить" : "Нужно восстановить"}</b></div>
                  <h3>{group}</h3>
                  <div className="mini-progress"><span style={{ width: `${groupPercent}%` }} /></div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="result-section three-topic-panels oge-topic-panels">
          {strong.length > 0 && (
            <article className="topic-panel strong-panel">
              <p className="kicker">Сильные темы</p><h2>Получилось</h2>
              <div className="topic-tags">{strong.map((item) => <span key={item.questionId}>✓ {item.topic}</span>)}</div>
            </article>
          )}
          {repeat.length > 0 && (
            <article className="topic-panel restore-panel">
              <p className="kicker">Для программы</p><h2>Стоит повторить</h2>
              <div className="topic-tags">{repeat.map((item) => <span key={item.questionId}>{item.topic}</span>)}</div>
            </article>
          )}
        </section>

        <section className="result-section manual-block">
          <p className="kicker">Вторая часть</p><h2>Ожидает проверки преподавателя</h2>
          <div>{[13, 15, 17, 18].map((id) => <span key={id}>№{id} — {manualStatus(id)}</span>)}</div>
          <p>Эти задания не оцениваются автоматически: важны полнота решения, обоснования и оформление.</p>
        </section>

        <section className="final-cta oge-final">
          <div><p className="kicker">Получить разбор и рекомендации</p><h2>Отправь результат и фотографии решений Лере</h2><p>Я проверю вторую часть, отмечу сильные стороны и темы для повторения, а затем помогу определить дальнейший план подготовки к профильному ЕГЭ.</p></div>
          <div className="cta-actions oge-cta-actions">
            <button className="button secondary" onClick={() => copyReport()}>Скопировать результат</button>
            <button className="button secondary" onClick={downloadReport}>Скачать результат</button>
            <a className="button primary" href={TELEGRAM_URL} target="_blank" rel="noreferrer" onClick={() => copyReport("Результат скопирован. Вставь его в сообщение и прикрепи фотографии решений")}>Открыть Telegram Леры</a>
            <button className="button secondary" onClick={restart}>Пройти ещё раз</button>
          </div>
          {toast && <p className="copy-toast" role="status">{toast}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="home-page ege-profile-page">
      <style>{profileStyles}</style>

      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="soft-pill">Подготовка к профильному ЕГЭ</div>

          <h1>
            Входная диагностика
            <br />
            <em>ЕГЭ профиль</em>
          </h1>

          <p className="hero-lead">
            Проверь основные задания профильного ЕГЭ и узнай, какие темы уже
            получаются уверенно, а что стоит повторить перед подготовкой.
          </p>

          <div className="calm-note">
            <span>♡</span>
            <p>
              Это не пробник и не оценка. Первая часть проверится автоматически,
              а решения второй части посмотрит преподаватель.
            </p>
          </div>

          <div className="name-start-card">
            <label htmlFor="profile-student-name">Как тебя зовут?</label>

            <input
              id="profile-student-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Введи имя"
              autoComplete="given-name"
            />

            <div className="start-guidance">
              <h2>Перед началом</h2>

              <ul>
                <li>
                  Приготовь несколько листов бумаги для вычислений и полных решений.
                </li>
                <li>
                  Решай самостоятельно, без калькулятора, учебника и подсказок.
                </li>
                <li>Строгого ограничения времени нет.</li>
                <li>
                  Если не знаешь способ решения, не угадывай — нажми «Не знаю, как решить».
                </li>
                <li>
                  Во второй части важны обоснования: сохрани записи и приложи фотографии.
                </li>
              </ul>

              <label className="consent-check">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                />
                <span>Я прочитал(а) рекомендации и готов(а) начать</span>
              </label>
            </div>

            <button
              className="button primary big"
              disabled={!name.trim() || !accepted}
              onClick={() => {
                setCurrent(0);
                setScreen("test");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Начать диагностику <span>→</span>
            </button>

            <p className="name-start-meta">
              <b>14 заданий</b>
              <span>·</span> около 60–75 минут{" "}
              <span>·</span> предварительный результат сразу
            </p>
          </div>
        </div>

        <div className="doodle grade-seven-doodle profile-doodle" aria-hidden="true">
          <span className="doodle-plus">ЕГЭ</span>
          <span className="doodle-pi">π</span>
          <span className="doodle-frac"><b>13</b><i /><b>18</b></span>
          <div className="doodle-paper profile-doodle-paper">
            <strong>f′(x) = ?</strong>
            <div />
            <div />
            <div />
            <span>✓</span>
          </div>
          <span className="doodle-dot dot-one" />
          <span className="doodle-dot dot-two" />
        </div>
      </section>

      <footer>
        <div className="brand">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </div>
        <p>Диагностика помогает составить программу, а не ставит оценку ♡</p>
      </footer>
    </main>
  );
}

const profileStyles = `
.profile-question-card .secondary-expression{margin-top:10px}
.profile-note{margin:14px 0 0;padding:12px 14px;border:1px solid #e4d9f1;background:#f7f2fb;border-radius:14px;color:#654c91;font-weight:650;line-height:1.45}
.strong-note{font-size:1rem}
.profile-diagram{margin-top:20px}
.profile-diagram svg{width:100%;max-width:560px;color:#62517e}
.profile-diagram .edge,.profile-diagram .marker,.profile-diagram .highlight,.profile-diagram .thin-highlight,.profile-diagram .bisector,.profile-diagram .rectangle-shape,.profile-diagram .graph-axes line,.profile-diagram .graph-axes path,.profile-diagram .graph-grid line,.profile-diagram .function-curve,.profile-diagram .tangent{fill:none;stroke-linecap:round;stroke-linejoin:round}
.profile-diagram .edge{stroke:#67528d;stroke-width:3}
.profile-diagram .marker{stroke:#9275be;stroke-width:2.5}
.profile-diagram .highlight{stroke:#9672c8;stroke-width:4}
.profile-diagram .thin-highlight{stroke:#c2a8df;stroke-width:3}
.profile-diagram .bisector{stroke:#9a79c2;stroke-width:3.5}
.profile-diagram .rectangle-shape{stroke:#8a67bb;stroke-width:4;fill:rgba(146,117,190,.08)}
.profile-diagram .point{fill:#7755aa}
.profile-diagram text{fill:#514566;font-size:17px;font-weight:700}
.profile-diagram .value-label{fill:#7554aa}
.profile-diagram .graph-grid line{stroke:#ece6f2;stroke-width:1}
.profile-diagram .graph-axes line,.profile-diagram .graph-axes path{stroke:#76658e;stroke-width:2}
.profile-diagram .function-curve{stroke:#b5a0cc;stroke-width:4}
.profile-diagram .tangent{stroke:#7f5ab4;stroke-width:4}
.profile-facts span{min-height:54px}
.profile-overview-grid .overview-item{min-height:86px}
.profile-stats{grid-template-columns:repeat(5,minmax(0,1fr))}
@media(max-width:900px){.profile-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.profile-stats{grid-template-columns:1fr}.profile-diagram svg{max-width:100%}}

/* Стартовый экран использует тот же каркас, что диагностика 7 класса. */
.profile-doodle-paper strong{
  display:block;
  margin-bottom:12px;
  font-family:"Comic Sans MS",cursive;
  font-size:28px;
  font-weight:700;
  color:#7052ad;
  transform:rotate(-2deg)
}
.profile-doodle .doodle-plus{
  font-size:.88rem;
  font-weight:800
}
@media(max-width:980px){
  .profile-doodle{display:none}
}
`;
