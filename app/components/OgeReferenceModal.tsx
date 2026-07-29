"use client";

import { useEffect, useState } from "react";
import "./OgeReferenceModal.css";

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

type OgeReferenceModalProps = {
  open: boolean;
  onClose: () => void;
};

function MathFormula({
  expression,
  displayMode = true,
}: {
  expression: string;
  displayMode?: boolean;
}) {
  const [element, setElement] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const renderFormula = () => {
      if (!window.katex) return false;

      window.katex.render(expression, element, {
        displayMode,
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
  }, [element, expression, displayMode]);

  return <div ref={setElement} />;
}

function TriangleMidlineDiagram() {
  return (
    <svg viewBox="0 0 280 190" role="img" aria-label="Средняя линия треугольника">
      <polygon points="140,20 35,165 245,165" />
      <line x1="87" y1="92" x2="193" y2="92" />
      <text x="133" y="15">B</text>
      <text x="22" y="180">A</text>
      <text x="247" y="180">C</text>
      <text x="70" y="87">M</text>
      <text x="198" y="87">N</text>
      <line x1="78" y1="103" x2="86" y2="109" className="tick" />
      <line x1="64" y1="123" x2="72" y2="129" className="tick" />
      <line x1="194" y1="109" x2="202" y2="103" className="tick double" />
      <line x1="208" y1="129" x2="216" y2="123" className="tick double" />
    </svg>
  );
}

function TrapezoidMidlineDiagram() {
  return (
    <svg viewBox="0 0 300 190" role="img" aria-label="Средняя линия трапеции">
      <polygon points="45,165 255,165 215,35 85,35" />
      <line x1="65" y1="100" x2="235" y2="100" />
      <text x="31" y="181">A</text>
      <text x="258" y="181">D</text>
      <text x="74" y="29">B</text>
      <text x="218" y="29">C</text>
      <text x="51" y="96">M</text>
      <text x="239" y="96">N</text>
    {/* BM и MA — по одной отметке */}
<line
  x1="69"
  y1="66"
  x2="81"
  y2="69"
  className="tick"
/>

<line
  x1="49"
  y1="131"
  x2="61"
  y2="134"
  className="tick"
/>

{/* CN — две отметки */}
<line
  x1="218"
  y1="66"
  x2="230"
  y2="63"
  className="tick"
/>

<line
  x1="220"
  y1="72"
  x2="232"
  y2="69"
  className="tick"
/>

{/* ND — две отметки */}
<line
  x1="238"
  y1="131"
  x2="250"
  y2="128"
  className="tick"
/>

<line
  x1="240"
  y1="137"
  x2="252"
  y2="134"
  className="tick"
/>
    </svg>
  );
}

function EquilateralCircleDiagram({ kind }: { kind: "circum" | "incircle" }) {
  return (
    <svg viewBox="0 0 260 210" role="img" aria-label={kind === "circum" ? "Описанная окружность правильного треугольника" : "Вписанная окружность правильного треугольника"}>
      {kind === "circum" ? (
        <>
          <circle cx="130" cy="105" r="86" />
          <polygon points="130,19 55,148 205,148" />
          <line x1="130" y1="105" x2="55" y2="148" />
          <text x="88" y="121">R</text>
          <text x="181" y="83">a</text>
        </>
      ) : (
        <>
          <polygon points="130,15 35,180 225,180" />
          <circle cx="130" cy="125" r="55" />
          <line x1="130" y1="125" x2="130" y2="180" />
          <line x1="130" y1="15" x2="130" y2="180" className="dash" />
          <path d="M130 164 h16 v16" className="marker" />
          <text x="138" y="151">r</text>
          <text x="138" y="89">h</text>
          <text x="195" y="112">a</text>
        </>
      )}
    </svg>
  );
}

function GeneralTriangleDiagram() {
  return (
    <svg viewBox="0 0 280 205" role="img" aria-label="Треугольник ABC со сторонами a, b, c">
      <polygon points="35,170 245,170 165,25" />
      <text x="20" y="187">A</text>
      <text x="252" y="187">C</text>
      <text x="164" y="20">B</text>
      <text x="102" y="193">b</text>
      <text x="205" y="95">a</text>
      <text x="86" y="95">c</text>
      <text x="50" y="157">α</text>
      <text x="222" y="157">γ</text>
      <text x="161" y="49">β</text>
    </svg>
  );
}

function CircleRadiusDiagram() {
  return (
    <svg viewBox="0 0 240 190" role="img" aria-label="Окружность с радиусом r">
      <circle cx="110" cy="95" r="70" />
      <circle cx="110" cy="95" r="3" className="filled" />
      <line x1="110" y1="95" x2="180" y2="95" />
      <text x="143" y="87">r</text>
    </svg>
  );
}

function AreaDiagram({
  kind,
}: {
  kind: "parallelogram" | "triangle" | "trapezoid" | "rhombus";
}) {
  if (kind === "parallelogram") {
    return (
      <svg viewBox="0 0 260 175" role="img" aria-label="Площадь параллелограмма">
        <polygon points="35,145 195,145 230,35 70,35" />
        <line x1="70" y1="35" x2="70" y2="145" className="dash" />
        <path d="M70 129 h16 v16" className="marker" />
        <text x="122" y="164">a</text>
        <text x="45" y="86">b</text>
        <text x="78" y="91">hₐ</text>
        <text x="47" y="133">γ</text>
      </svg>
    );
  }

  if (kind === "triangle") {
    return (
      <svg viewBox="0 0 260 175" role="img" aria-label="Площадь треугольника">
        <polygon points="35,145 225,145 85,25" />
        <line x1="85" y1="25" x2="85" y2="145" className="dash" />
        <path d="M85 129 h16 v16" className="marker" />
        <text x="122" y="164">a</text>
        <text x="44" y="78">b</text>
        <text x="93" y="88">hₐ</text>
        <text x="49" y="133">γ</text>
      </svg>
    );
  }

  if (kind === "trapezoid") {
    return (
      <svg viewBox="0 0 260 175" role="img" aria-label="Площадь трапеции">
        <polygon points="30,145 230,145 190,45 75,45" />
        <line x1="75" y1="45" x2="75" y2="145" className="dash" />
        <path d="M75 129 h16 v16" className="marker" />
        <text x="126" y="164">a</text>
        <text x="126" y="37">b</text>
        <text x="83" y="98">h</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 260 175" role="img" aria-label="Площадь ромба">
      <polygon points="130,20 225,88 130,155 35,88" />
      <line x1="130" y1="20" x2="130" y2="155" />
      <line x1="35" y1="88" x2="225" y2="88" />
      <text x="136" y="61">d₁</text>
      <text x="177" y="80">d₂</text>
    </svg>
  );
}

function RightTriangleTrigDiagram() {
  return (
    <svg viewBox="0 0 270 190" role="img" aria-label="Прямоугольный треугольник для синуса, косинуса и тангенса">
      <polygon points="35,155 225,155 225,30" />
      <path d="M209 139 h16 v16" className="marker" />
      <path d="M68 155 A33 33 0 0 0 63 137" className="angle-arc" />
<text x="56" y="148">α</text>
      <text x="127" y="176">b</text>
      <text x="232" y="98">a</text>
      <text x="129" y="85">c</text>
    </svg>
  );
}

function FormulaCard({
  title,
  formulas,
  children,
}: {
  title: string;
  formulas?: string[];
  children?: React.ReactNode;
}) {
  return (
    <article className="oge-reference-card">
      <h3>{title}</h3>

      {children}

      {formulas?.map((formula) => (
        <MathFormula key={formula} expression={formula} />
      ))}
    </article>
  );
}

function SquaresTable() {
  const tens = Array.from({ length: 9 }, (_, index) => index + 1);
  const units = Array.from({ length: 10 }, (_, index) => index);

  return (
    <div className="oge-reference-table-scroll">
      <table className="oge-reference-table squares-table">
        <thead>
          <tr>
            <th>Десятки</th>
            {units.map((unit) => (
              <th key={unit}>{unit}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {tens.map((ten) => (
            <tr key={ten}>
              <th>{ten}</th>
              {units.map((unit) => {
                const number = ten * 10 + unit;
                return <td key={unit}>{number * number}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrigTable() {
  const rows = [
    ["sin α", "0", "1/2", "√2/2", "√3/2", "1", "0", "−1", "0"],
    ["cos α", "1", "√3/2", "√2/2", "1/2", "0", "−1", "0", "1"],
    ["tg α", "0", "√3/3", "1", "√3", "—", "0", "—", "0"],
  ];

  return (
    <div className="oge-reference-table-scroll">
      <table className="oge-reference-table trig-table">
        <thead>
          <tr>
            <th>α</th>
            {["0°", "30°", "45°", "60°", "90°", "180°", "270°", "360°"].map((angle) => (
              <th key={angle}>{angle}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map(([name, ...values]) => (
            <tr key={name}>
              <th>{name}</th>
              {values.map((value, index) => (
                <td key={`${name}-${index}`}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OgeReferenceModal({
  open,
  onClose,
}: OgeReferenceModalProps) {
  const [tab, setTab] = useState<"algebra" | "geometry">("algebra");

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="oge-reference-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="oge-reference-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oge-reference-title"
      >
        <header className="oge-reference-header">
          <div>
            <p className="kicker">ОГЭ по математике</p>
            <h2 id="oge-reference-title">Справочные материалы</h2>
          </div>

          <button
            type="button"
            className="oge-reference-close"
            onClick={onClose}
            aria-label="Закрыть справочные материалы"
          >
            ×
          </button>
        </header>

        <div className="oge-reference-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "algebra"}
            className={tab === "algebra" ? "active" : ""}
            onClick={() => setTab("algebra")}
          >
            Алгебра
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === "geometry"}
            className={tab === "geometry" ? "active" : ""}
            onClick={() => setTab("geometry")}
          >
            Геометрия
          </button>
        </div>

        <div className="oge-reference-body">
          {tab === "algebra" ? (
            <div className="oge-reference-grid">
              <FormulaCard
                title="Формула корней квадратного уравнения"
                formulas={[
                  String.raw`D=b^2-4ac`,
                  String.raw`x=\frac{-b\pm\sqrt D}{2a}`,
                ]}
              />

              <FormulaCard
                title="Разложение квадратного трёхчлена"
                formulas={[
                  String.raw`ax^2+bx+c=a(x-x_1)(x-x_2)`,
                  String.raw`ax^2+bx+c=a(x-x_0)^2`,
                ]}
              />

              <FormulaCard
                title="Абсцисса вершины параболы"
                formulas={[String.raw`x_0=-\frac{b}{2a}`]}
              />

              <FormulaCard
                title="Арифметическая прогрессия"
                formulas={[
                  String.raw`a_n=a_1+d(n-1)`,
                  String.raw`S_n=\frac{(a_1+a_n)n}{2}`,
                ]}
              />

              <FormulaCard
                title="Геометрическая прогрессия"
                formulas={[
                  String.raw`b_n=b_1q^{n-1}`,
                  String.raw`S_n=\frac{b_1(q^n-1)}{q-1}`,
                ]}
              />

              <FormulaCard
                title="Формулы сокращённого умножения"
                formulas={[
                  String.raw`(a+b)^2=a^2+2ab+b^2`,
                  String.raw`(a-b)^2=a^2-2ab+b^2`,
                  String.raw`a^2-b^2=(a-b)(a+b)`,
                ]}
              />

              <FormulaCard
                title="Свойства арифметического квадратного корня"
                formulas={[
                  String.raw`\sqrt{ab}=\sqrt a\cdot\sqrt b`,
                  String.raw`\sqrt{\frac ab}=\frac{\sqrt a}{\sqrt b}`,
                ]}
              />

              <FormulaCard
                title="Свойства степени"
                formulas={[
                  String.raw`a^{-n}=\frac1{a^n}`,
                  String.raw`a^n\cdot a^m=a^{n+m}`,
                  String.raw`\frac{a^n}{a^m}=a^{n-m}`,
                  String.raw`(a^m)^n=a^{mn}`,
                  String.raw`(ab)^n=a^nb^n`,
                  String.raw`\left(\frac ab\right)^n=\frac{a^n}{b^n}`,
                ]}
              />

              <article className="oge-reference-card oge-reference-wide">
                <h3>Таблица квадратов двузначных чисел</h3>
                <SquaresTable />
              </article>
            </div>
          ) : (
            <div className="oge-reference-grid">
              <FormulaCard
                title="Сумма углов выпуклого многоугольника"
                formulas={[String.raw`180^\circ(n-2)`]}
              />

              <FormulaCard
                title="Средняя линия треугольника"
                formulas={[
                  String.raw`MN\parallel AC`,
                  String.raw`MN=\frac{AC}{2}`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <TriangleMidlineDiagram />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Средняя линия трапеции"
                formulas={[
                  String.raw`MN\parallel AD`,
                  String.raw`MN=\frac{BC+AD}{2}`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <TrapezoidMidlineDiagram />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Описанная окружность правильного треугольника"
                formulas={[
                  String.raw`R=\frac{a\sqrt3}{3}`,
                  String.raw`S=\frac{a^2\sqrt3}{4}`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <EquilateralCircleDiagram kind="circum" />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Вписанная окружность правильного треугольника"
                formulas={[
                  String.raw`r=\frac{a\sqrt3}{6}`,
                  String.raw`h=\frac{a\sqrt3}{2}`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <EquilateralCircleDiagram kind="incircle" />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Теорема синусов"
                formulas={[
                  String.raw`\frac a{\sin A}=\frac b{\sin B}=\frac c{\sin C}=2R`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <GeneralTriangleDiagram />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Теорема косинусов"
                formulas={[
                  String.raw`c^2=a^2+b^2-2ab\cos C`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <GeneralTriangleDiagram />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Окружность и круг"
                formulas={[
                  String.raw`C=2\pi r`,
                  String.raw`S=\pi r^2`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <CircleRadiusDiagram />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Площадь параллелограмма"
                formulas={[
                  String.raw`S=ah_a`,
                  String.raw`S=ab\sin\gamma`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <AreaDiagram kind="parallelogram" />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Площадь треугольника"
                formulas={[
                  String.raw`S=\frac12ah_a`,
                  String.raw`S=\frac12ab\sin\gamma`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <AreaDiagram kind="triangle" />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Площадь трапеции"
                formulas={[
                  String.raw`S=\frac{a+b}{2}\cdot h`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <AreaDiagram kind="trapezoid" />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Площадь ромба"
                formulas={[
                  String.raw`S=\frac12d_1d_2`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <AreaDiagram kind="rhombus" />
                </div>
              </FormulaCard>

              <FormulaCard
                title="Прямоугольный треугольник"
                formulas={[
                  String.raw`\sin\alpha=\frac ac`,
                  String.raw`\cos\alpha=\frac bc`,
                  String.raw`\tan\alpha=\frac ab`,
                  String.raw`a^2+b^2=c^2`,
                  String.raw`\sin^2\alpha+\cos^2\alpha=1`,
                ]}
              >
                <div className="oge-reference-diagram">
                  <RightTriangleTrigDiagram />
                </div>
              </FormulaCard>

              <article className="oge-reference-card oge-reference-wide">
                <h3>Некоторые значения тригонометрических функций</h3>
                <TrigTable />
              </article>
            </div>
          )}
        </div>

        <footer className="oge-reference-footer">
          <button
            type="button"
            className="button primary"
            onClick={onClose}
          >
            Закрыть
          </button>
        </footer>
      </section>
    </div>
  );
}
