"use client";

import { useEffect, useState } from "react";

const TELEGRAM_URL = "https://t.me/vxoab";

const diagnostics = [
  {
  href: "/6",
  label: "Перед 6 классом",
  description: "Проверка знаний по программе 5 класса",
  meta: "20 заданий · около 20 минут",
},
{
  href: "/7",
  label: "Перед 7 классом",
  description: "Проверка знаний по программе 6 класса",
  meta: "25 заданий · около 25–30 минут",
},
{
  href: "/8",
  label: "Перед 8 классом",
  description: "Проверка знаний по программе 7 класса",
  meta: "26 заданий · около 30 минут",
},
{
  href: "/9",
  label: "Перед 9 классом",
  description: "Проверка знаний по программе 8 класса",
  meta: "28 заданий · около 35–40 минут",
},
{
  href: "/oge",
  label: "Диагностика ОГЭ",
  description: "Входная проверка перед подготовкой к ОГЭ",
  meta: "18 заданий · около 45–60 минут",
},
{
  href: "/after9",
  label: "Перед 10 классом или колледжем",
  description: "Проверка знаний по программе 5–9 классов",
  meta: "24 задания · около 60 минут",
},
{
  href: "/11",
  label: "Перед 11 классом",
  description: "Проверка уже изученных тем 10–11 классов",
  meta: "До 32 заданий · время зависит от выбора",
},
{
  href: "/ege-base",
  label: "ЕГЭ база",
  description: "Входная проверка перед подготовкой к базовому ЕГЭ",
  meta: "15 заданий · около 35–45 минут",
},
{
  href: "/ege-profile",
  label: "ЕГЭ профиль",
  description: "Входная проверка перед подготовкой к профильному ЕГЭ",
  meta: "14 заданий · около 60–90 минут",
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
    const [isTeacherMode, setIsTeacherMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsTeacherMode(params.get("teacher") === "1");
  }, []);
  return (
    <main className="home-page">
      <header className="site-header">
        <a className="brand" href="/">
  <span className="brand-mark">∿</span>

  <span className="brand-text">
    <span className="brand-title">Математика без стресса</span>
    <span className="brand-author">
      Валерия Евгеньевна · репетитор по математике
    </span>
  </span>
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
              Выбери диагностику под свой учебный этап или экзамен.
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
  className="class-card active"
href={diagnostic.href}
>
              <span>Доступно сейчас</span>
              <b>{diagnostic.label}</b>
              <p>{diagnostic.description}</p>
              <i>{diagnostic.meta} →</i>
            </a>
          ))}
            </div>
      </section>

{!isTeacherMode && (
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
)}

<footer>
  <div className="brand">
    <span className="brand-mark">∿</span>

    <div className="brand-text">
      <span className="brand-title">Математика без стресса</span>
      <span className="brand-author">
        Валерия Евгеньевна · автор диагностик
      </span>
    </div>
  </div>

  <p>Проверяем знания, а не ставим оценки ♡</p>
</footer>
