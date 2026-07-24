type DiagramKind =
  | "angle-parts"
  | "isosceles-perimeter"
  | "parallel-perpendicular"
  | "adjacent-angles"
  | "vertical-angles"
  | "isosceles-angle"
  | "median"
  | "congruence"
  | "parallel-transversal"
  | "right-triangle";

const labels: Record<DiagramKind, string> = {
  "angle-parts": "Угол AOB с внутренним лучом OC",
  "isosceles-perimeter": "Равнобедренный треугольник с основанием 10 сантиметров",
  "parallel-perpendicular": "Параллельные и перпендикулярные прямые",
  "adjacent-angles": "Два смежных угла",
  "vertical-angles": "Две пересекающиеся прямые и вертикальные углы",
  "isosceles-angle": "Равнобедренный треугольник с углом при вершине 46 градусов",
  median: "Треугольник ABC с медианой AM",
  congruence: "Два треугольника с равными сторонами и углами между ними",
  "parallel-transversal": "Две параллельные прямые и секущая",
  "right-triangle": "Прямоугольный треугольник с острым углом 34 градуса",
};

export default function GeometryDiagram({ kind }: { kind: DiagramKind }) {
  return (
    <div className="geometry-diagram">
      <svg viewBox="0 0 420 240" role="img" aria-label={labels[kind]}>
        {kind === "angle-parts" && (
          <>
            <line x1="210" y1="200" x2="370" y2="200" />
            <line x1="210" y1="200" x2="197" y2="55" />
            <line x1="210" y1="200" x2="300" y2="61" />
            <path d="M205 145 A55 55 0 0 1 240 154" className="angle-arc" />
            <path d="M232 166 A40 40 0 0 1 250 200" className="angle-arc secondary" />
            <text x="192" y="222">O</text><text x="378" y="207">B</text>
            <text x="184" y="46">A</text><text x="305" y="60">C</text>
            <text x="215" y="132" className="value-label">38°</text>
            <text x="251" y="180" className="question-label">?</text>
          </>
        )}
        {kind === "isosceles-perimeter" && (
          <>
            <polygon points="210,35 75,200 345,200" />
            <line x1="137" y1="111" x2="151" y2="122" className="tick" />
            <line x1="269" y1="122" x2="283" y2="111" className="tick" />
            <text x="184" y="226" className="value-label">10 см</text>
            <text x="112" y="130" className="question-label">?</text>
            <text x="296" y="130" className="question-label">?</text>
          </>
        )}
        {kind === "parallel-perpendicular" && (
          <>
            <line x1="45" y1="70" x2="375" y2="70" />
            <line x1="45" y1="165" x2="375" y2="165" />
            <line x1="145" y1="25" x2="145" y2="215" />
            <line x1="250" y1="25" x2="330" y2="215" />
            <path d="M145 70 h18 v18 h-18" className="marker" />
            <path d="M205 63 l9 7 -9 7 M225 63 l9 7 -9 7" className="parallel-mark" />
            <path d="M205 158 l9 7 -9 7 M225 158 l9 7 -9 7" className="parallel-mark" />
            <text x="25" y="76">a</text><text x="25" y="171">b</text>
            <text x="136" y="20">c</text><text x="245" y="20">d</text>
          </>
        )}
        {kind === "adjacent-angles" && (
          <>
            <line x1="45" y1="190" x2="375" y2="190" />
            <line x1="210" y1="190" x2="297" y2="62" />
            <path d="M150 190 A60 60 0 0 1 244 140" className="angle-arc" />
            <path d="M235 153 A45 45 0 0 1 255 190" className="angle-arc secondary" />
            <text x="137" y="139" className="value-label">124°</text>
            <text x="258" y="161" className="question-label">?</text>
          </>
        )}
        {kind === "vertical-angles" && (
          <>
            <line x1="130" y1="3" x2="290" y2="247" />
            <line x1="290" y1="3" x2="130" y2="247" />
            <path d="M185 88 A45 45 0 0 1 235 88" className="angle-arc" />
            <path d="M235 162 A45 45 0 0 1 185 162" className="angle-arc secondary" />
            <text x="195" y="76" className="value-label">67°</text>
            <text x="203" y="190" className="question-label">?</text>
          </>
        )}
        {kind === "isosceles-angle" && (
          <>
            <polygon points="210,30 75,205 345,205" />
            <line x1="137" y1="113" x2="151" y2="124" className="tick" />
            <line x1="269" y1="124" x2="283" y2="113" className="tick" />
            <path d="M188 57 A34 34 0 0 0 232 57" className="angle-arc" />
            <path d="M300 205 A45 45 0 0 1 316 170" className="angle-arc secondary" />
            <text x="198" y="84" className="value-label">46°</text>
            <text x="312" y="181" className="question-label">?</text>
          </>
        )}
        {kind === "median" && (
          <>
            <polygon points="210,30 65,205 355,205" />
            <line x1="210" y1="30" x2="210" y2="205" />
            <line x1="184" y1="196" x2="184" y2="214" className="tick" />
            <line x1="236" y1="196" x2="236" y2="214" className="tick" />
            <text x="202" y="23">A</text><text x="48" y="218">B</text>
            <text x="361" y="218">C</text><text x="202" y="229">M</text>
          </>
        )}
        {kind === "congruence" && (
          <>
            <polygon points="35,195 115,45 205,195" />
            <polygon points="225,195 305,45 395,195" />
            <line x1="68" y1="116" x2="84" y2="125" className="tick" />
            <line x1="258" y1="116" x2="274" y2="125" className="tick" />
            <line x1="154" y1="108" x2="170" y2="98" className="double-tick" />
            <line x1="162" y1="121" x2="178" y2="111" className="double-tick" />
            <line x1="344" y1="108" x2="360" y2="98" className="double-tick" />
            <line x1="352" y1="121" x2="368" y2="111" className="double-tick" />
            <path d="M96 80 A31 31 0 0 0 134 80" className="angle-arc" />
            <path d="M286 80 A31 31 0 0 0 324 80" className="angle-arc" />
            <text x="30" y="218">A</text><text x="108" y="37">B</text><text x="207" y="218">C</text>
            <text x="218" y="218">A₁</text><text x="296" y="37">B₁</text><text x="395" y="218">C₁</text>
          </>
        )}
        {kind === "parallel-transversal" && (
          <>
            <line x1="40" y1="65" x2="380" y2="65" />
            <line x1="40" y1="180" x2="380" y2="180" />
            <line x1="160" y1="20" x2="225" y2="220" />
            <path d="M205 58 l9 7 -9 7 M225 58 l9 7 -9 7" className="parallel-mark" />
            <path d="M205 173 l9 7 -9 7 M225 173 l9 7 -9 7" className="parallel-mark" />
            <path d="M210 65 A35 35 0 0 1 187 98" className="angle-arc" />
            <path d="M201 147 A35 35 0 0 1 247 180" className="angle-arc secondary" />
            <text x="207" y="103" className="value-label">72°</text>
            <text x="251" y="158" className="question-label">?</text>
            <text x="21" y="71">a</text><text x="21" y="186">b</text><text x="151" y="20">c</text>
          </>
        )}
        {kind === "right-triangle" && (
          <>
            <polygon points="100,205 100,35 350,205" />
            <path d="M100 181 h24 v24" className="marker" />
            <path d="M310 205 A40 40 0 0 1 317 183" className="angle-arc" />
            <path d="M135 59 A42 42 0 0 1 100 77" className="angle-arc secondary" />
            <text x="286" y="180" className="value-label">34°</text>
            <text x="112" y="89" className="question-label">?</text>
          </>
        )}
      </svg>
    </div>
  );
}

export type { DiagramKind };
