
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import katex from "katex";

export function MathExpression({
  expression,
  displayMode = false,
}: {
  expression: string;
  displayMode?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    katex.render(expression, ref.current, {
      displayMode,
      throwOnError: false,
    });
  }, [expression, displayMode]);

  return <span ref={ref} className="report-math" />;
}

// Преобразуем обычные дроби в математические.
export function MathText({ text }: { text: string }) {
  const parts = text.split(/(-?\d+\s+\d+\/\d+|-?\d+\/\d+)/g);

  return (
    <>
      {parts.map((part, index) => {
        const mixed = part.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
        const fraction = part.match(/^(-?)(\d+)\/(\d+)$/);

        if (mixed) {
          return (
            <MathExpression
              key={index}
              expression={`${mixed[1]}\\frac{${mixed[2]}}{${mixed[3]}}`}
            />
          );
        }

        if (fraction) {
          return (
            <MathExpression
              key={index}
              expression={`${fraction[1]}\\frac{${fraction[2]}}{${fraction[3]}}`}
            />
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}


export type DiagnosticAnswerRow = {
  id: string | number;
  question?: ReactNode;
  topic?: string;
  studentAnswer: ReactNode;
  correctAnswer: ReactNode;
  status: "correct" | "wrong" | "unknown" | "manual";
  points?: string;
};

type Props = {
  rows: DiagnosticAnswerRow[];
};

export default function DiagnosticAnswerTable({ rows }: Props) {
  const statusLabels = {
    correct: "Верно",
    wrong: "Ошибка",
    unknown: "Не знаю",
    manual: "На проверке",
  };

  return (
    <div className="diagnostic-report-list">
      {rows.map((row) => (
        <article className="diagnostic-answer-card" key={row.id}>
          <div className="diagnostic-answer-header">
            <strong>Задание №{row.id}</strong>

            <span className={`report-status ${row.status}`}>
              {statusLabels[row.status]}
              {row.points ? ` · ${row.points}` : ""}
            </span>
          </div>

          <div className="diagnostic-answer-question">
  {row.question ?? row.topic ?? "Задание"}
</div>

          <div className="diagnostic-answer-comparison">
            <div>
              <p>Ответ ученика</p>
              <div className="diagnostic-answer-value">
                {row.studentAnswer}
              </div>
            </div>

            <div>
              <p>Правильный ответ</p>
              <div className="diagnostic-answer-value">
                {row.correctAnswer}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
