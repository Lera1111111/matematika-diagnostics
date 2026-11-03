
type DiagnosticAnswerRow = {
  id: string | number;
  topic: string;
  studentAnswer: string;
  correctAnswer: string;
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
    <div className="diagnostic-report">
      <div className="diagnostic-report-scroll">
        <table className="diagnostic-report-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Тема</th>
              <th>Ответ ученика</th>
              <th>Правильный ответ</th>
              <th>Результат</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="report-number">{row.id}</td>
                <td>{row.topic}</td>
                <td>{row.studentAnswer || "Нет ответа"}</td>
                <td>{row.correctAnswer || "—"}</td>
                <td>
                  <span className={`report-status ${row.status}`}>
                    {statusLabels[row.status]}
                  </span>
                  {row.points && (
                    <span className="report-points">{row.points}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="diagnostic-report-note">
        Отчёт содержит все задания диагностики, включая
        неправильные ответы и пропущенные задания.
      </p>
    </div>
  );
}
