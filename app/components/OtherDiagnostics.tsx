type OtherDiagnosticsProps = {
  current: string;
};

const diagnostics = [
  {
    href: "/6",
    label: "Перед 6 классом",
    meta: "Программа 5 класса",
  },
  {
    href: "/7",
    label: "Перед 7 классом",
    meta: "Программа 6 класса",
  },
  {
    href: "/8",
    label: "Перед 8 классом",
    meta: "Программа 7 класса",
  },
  {
    href: "/9",
    label: "Перед 9 классом",
    meta: "Программа 8 класса",
  },
  {
    href: "/after9",
    label: "Перед 10 классом",
    meta: "Программа 5–9 классов",
  },
  {
    href: "/11",
    label: "Перед 11 классом",
    meta: "Темы старшей школы",
  },
  {
    href: "/oge",
    label: "ОГЭ",
    meta: "Входная диагностика",
  },
  {
    href: "/ege-base",
    label: "ЕГЭ база",
    meta: "15 основных типов",
  },
  {
    href: "/ege-profile",
    label: "ЕГЭ профиль",
    meta: "Первая и вторая части",
  },
];

export default function OtherDiagnostics({
  current,
}: OtherDiagnosticsProps) {
  const available = diagnostics.filter(
    (diagnostic) => diagnostic.href !== current,
  );

  return (
    <section className="class-section">
      <div className="section-heading">
        <div>
          <p className="kicker">Другие диагностики</p>
<h2>Выбери подходящий раздел</h2>
        </div>
      </div>

      <div className="class-grid compact-class-grid">
        {available.map((diagnostic) => (
          <a
            key={diagnostic.href}
            className="class-card active"
            href={diagnostic.href}
          >
            <span>Доступно сейчас</span>
            <b>{diagnostic.label}</b>
            <i>{diagnostic.meta} →</i>
          </a>
        ))}
      </div>
    </section>
  );
}
