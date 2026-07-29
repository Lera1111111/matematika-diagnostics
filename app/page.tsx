"use client";

const TELEGRAM_URL = "https://t.me/m/8wQr09o1NDEy";

const diagnostics = [
  {
    href: "/6",
    label: "Перед 6 классом",
    description: "Проверка основных тем программы 5 класса",
    meta: "20 заданий · около 20 минут",
    className: "",
  },
  {
    href: "/7",
    label: "Перед 7 классом",
    description: "Подготовка к началу алгебры и геометрии",
    meta: "25 заданий · около 25–30 минут",
    className: "grade-seven-card",
  },
  {
    href: "/8",
    label: "Перед 8 классом",
    description: "Проверка базы по алгебре и геометрии 7 класса",
    meta: "Результат и рекомендации сразу",
    className: "grade-eight-card",
  },
  {
    href: "/9",
    label: "Перед 9 классом",
    description: "Проверка знаний перед выпускным классом",
    meta: "Алгебра и геометрия",
    className: "",
  },
  {
    href: "/oge",
    label: "Диагностика ОГЭ",
    description: "Входная проверка перед подготовкой к экзамену",
    meta: "Первая и вторая части",
    className: "",
  },
  {
  href: "/after9",
  label: "Перед 10 классом или колледжем",
  description: "Что повторить после основной школы",
  meta: "Программа 5–9 классов",
  className: "after-nine-card",
},
  {
  href: "/11",
  label: "Перед 11 классом",
  description: "Диагностика по уже изученным темам 10–11 классов",
  meta: "Алгебра и стереометрия",
  className: "",
},
];

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

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark">∿</span>
          <span>Математика без стресса</span>
        </a>

        <a className="header-cta" href="#diagnostics">
          Выбрать диагностику
        </a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="soft-pill">
            Бесплатные математические диагностики
          </div>

          <h1>
            Узнай, что уже
            <br />
            получается, а что <em>стоит повторить</em>
          </h1>

          <p className="hero-lead">
            Выбери подходящую диагностику, выполни задания и получи
            персональные рекомендации по темам.
          </p>

          <div className="calm-note">
            <span>♡</span>
            <p>
              Это не контрольная и не экзамен. Здесь нет школьных оценок —
              только честный результат, сильные стороны и понятный план
              повторения.
            </p>
          </div>

          <div className="hero-actions">
            <a className="button primary big" href="#diagnostics">
              Выбрать диагностику <span>→</span>
            </a>

            <p>
              <b>Бесплатно</b>
              <span>·</span>
              без регистрации
              <span>·</span>
              результат сразу
            </p>
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

          <p>Спокойно, самостоятельно и без лишнего волнения</p>
        </div>

        <div className="steps">
          <article className="step-card violet">
            <span>01</span>
            <h3>Выбираешь диагностику</h3>
            <p>
              Выбери свой класс, подготовку к ОГЭ или диагностику после
              окончания 9 класса.
            </p>
          </article>

          <article className="step-card blue">
            <span>02</span>
            <h3>Выполняешь задания</h3>
            <p>
              Решай самостоятельно. Если способ решения незнаком, можно честно
              отметить «Не знаю».
            </p>
          </article>

          <article className="step-card pink">
            <span>03</span>
            <h3>Получаешь рекомендации</h3>
            <p>
              Ты увидишь сильные темы, ошибки и конкретные разделы, которые
              стоит повторить.
            </p>
          </article>
        </div>

        <div className="tip">
          <span>✦</span>
          <p>
            <b>Небольшой совет:</b> подготовь черновик и постарайся не
            пользоваться калькулятором или подсказками. Чем честнее результат,
            тем точнее будут рекомендации.
          </p>
        </div>
      </section>

      <section className="class-section" id="diagnostics">
        <div className="section-heading">
          <div>
            <p className="kicker">Диагностики</p>
            <h2>Выбери подходящий раздел</h2>
          </div>

          <p>
            Каждая диагностика проверяет темы, которые уже должны быть изучены
          </p>
        </div>

        <div className="class-grid">
          {diagnostics.map((diagnostic) => (
            <a
              className={`class-card active ${diagnostic.className}`}
              href={diagnostic.href}
              key={diagnostic.href}
            >
              <span>Доступно сейчас</span>
              <b>{diagnostic.label}</b>
              <p>{diagnostic.description}</p>
              <i>{diagnostic.meta} →</i>
            </a>
          ))}

          <div className="class-card soon">
            <span>Скоро</span>
            <b>Старшая школа</b>
            <p>
              Диагностики по отдельным изученным разделам программы 10–11
              классов
            </p>
            <i>Раздел готовится</i>
          </div>

          <div className="class-card soon college">
            <span>Скоро</span>
            <b>Колледж</b>
            <p>
              Тематические тесты и диагностики с выбором уже изученных тем
            </p>
            <i>Раздел готовится</i>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="kicker">Нужна помощь?</p>
          <h2>Можно разобрать результаты вместе</h2>
          <p>
            Если после диагностики останутся вопросы, напиши мне в Telegram.
            Помогу понять результат и определить, с чего лучше начать
            повторение.
          </p>
        </div>

        <div className="cta-actions">
          <a
            className="button primary"
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
          >
            Написать в Telegram
          </a>
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
