
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
  const parts = text.split(
    /(\([^()]+\)\s*\/\s*\([^()]+\)|\([^()]+\)\s*\/\s*\d+|-?\d+\s+\d+\s*\/\s*\d+|-?\d+\s*\/\s*\d+|\d*√(?:\([^()]+\)|[a-zA-Zа-яА-Я0-9]+))/g
  );

  return (
    <>
      {parts.map((part, index) => {
        const value = part.trim();

        // Корни: √3, 3√3, √(x+1)
        const root = value.match(
          /^(\d*)√(?:\(([^()]+)\)|([a-zA-Zа-яА-Я0-9]+))$/
        );

        if (root) {
          const coefficient = root[1];
          const radicand = root[2] || root[3];

          return (
            <MathExpression
              key={index}
              expression={`${coefficient}\\sqrt{${radicand}}`}
            />
          );
        }

        // Смешанные числа: 2 3/5
        const mixed = value.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);

        if (mixed) {
          return (
            <MathExpression
              key={index}
              expression={`${mixed[1]}\\frac{${mixed[2]}}{${mixed[3]}}`}
            />
          );
        }

        // Дроби с переменными: (x+1)/2
        const algebraic = value.match(
          /^\(([^()]+)\)\s*\/\s*(?:\(([^()]+)\)|(\d+))$/
        );

        if (algebraic) {
          return (
            <MathExpression
              key={index}
              expression={`\\frac{${algebraic[1]}}{${algebraic[2] || algebraic[3]}}`}
            />
          );
        }

        // Обычные дроби: 3/8
        const fraction = value.match(/^(-?)(\d+)\/(\d+)$/);

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
  hideComparison?: boolean;
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
{!row.hideComparison && (
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
      )}
  );
}
