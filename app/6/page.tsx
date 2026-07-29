

Вставленный текст(5).txt
Документ




Вставленный текст(6).txt
Документ
да емае

опять ругается

на 845 скобки не хватает?

опять стрелочки

вот тут надо вопрос на середину подвинуть?

вот тут 30 тоже перенести внутри треугоьника рядом с углом

вот тут о съехала тоже


опять не то

тут не исправилось. 30 должно быть  внутри треугольника и слева от обозначения угла. и буква о как будто не переместилась

30 еще чуть ниже, а о левее

куда конкретно?

на огэ только стрелки убрать

тут не ушли


тут удалить?

так что  ли?

я не могу изменить его, только имя самого файла. или я не до делаю

ниче не поняла. вот так сейчас 

Worked for 1m 5s
Сформированное изображение: Бесплатные математические диагностики для школьников


Редактировать


а не разделяет походу


Вставленный текст(7).txt
Документ

работает. давай по заданиям 

вот эти рисунки надо корректировать

тут вот что мне не нравится. и вообще в идеале бы латех добавить, коллеги тоже писали об этом

у меня тут нет катех





Вставленный текст(8).txt
Документ
Вот что есть сейчас

красивааа, только это мне теперь в каждый класс надо будет так подключать и писать на языке катех?

там все ок стало, единственное опять стрелки на геометрии

я имела ввиду по бокам, чтобы они были. вот так


Вставленный текст(9).txt
Документ
все ок?


опять

давай я тебе полностью код скину 


Вставленный текст(10).txt
Документ

Я сейчаспрошла без сложных номеров и там показывает, мол блок В проверяется преподавателем



Перед_10_классом_или_колледжем_м.html
Файл
Диагностика “Что повторить перед 10 классом или колледжем?”

Ученик: м

Дальнейшее обучение: колледж

Автоматическая часть: 0 из 20

Блок А. Базовые знания и навыки: 0 из 10

Блок Б. Программа 7–9 классов: 0 из 10

Не получилось выполнить: 20

Получилось самостоятельно:
—

Стоит повторить:
— Действия с числами
— Проценты
— Пропорции
— Степени и корни
— Преобразование выражений
— Линейные уравнения
— Подстановка в формулу
— Сравнение чисел
— Чтение таблиц: минимум
— Чтение таблиц: изменение величины
— Теорема Пифагора и площадь прямоугольника
— Формулы сокращённого умножения
— Сокращение алгебраических дробей
— Допустимые значения переменной
— Квадратные уравнения
— Системы уравнений
— Квадратные неравенства
— Направление ветвей параболы
— Нули квадратичной функции
— Вершина параболы
— Связь формулы и графика
— Члены арифметической прогрессии
— Сумма арифметической прогрессии
— Задачи на движение
— Среднее арифметическое
— Медиана
— Вероятность
— Хорды окружности

Блок В. Готовность к дальнейшему обучению:
№21 — Ответ не заполнен
№22 — Ответ не заполнен
№23 — Ответ не заполнен
№24 — Ответ не заполнен

Фотографии решений: не приложены

Работа выполнена: 29.07.2026, 12:37:21

вот что выдает, если не делать в часть

тут все ок

все окей остальное


Вставленный текст(11).txt
Документ
И проверь еще логику текста, все ли окей. Коллега писал, что если выполнить все верно, то есть надпись про "надо повторить"

Да, коллега прав: при результате 20/20 всё равно остаётся заголовок «Что повторить», а под ним уже написано:

Ошибок нет — отличный повод перейти к новым темам!

То есть логика данных правильная, но заголовок ей противоречит. Это находится в блоке repeat-panel. 


Как исправить
Найди:

<article className="topic-panel repeat-panel">
  <p className="kicker">Точки роста</p>
  <h2>Что повторить</h2>
  <div className="topic-tags">
    {missed.map((question) => (
      <span key={question.id}>{question.topic}</span>
    ))}
    {!missed.length && <p>Ошибок нет — отличный повод перейти к новым темам!</p>}
  </div>
</article>
Замени целиком на:

<article className="topic-panel repeat-panel">
  <p className="kicker">
    {missed.length > 0 ? "Точки роста" : "Можно двигаться дальше"}
  </p>

  <h2>
    {missed.length > 0 ? "Что повторить" : "Тем для обязательного повторения нет"}
  </h2>

  <div className="topic-tags">
    {missed.length > 0 ? (
      missed.map((question) => (
        <span key={question.id}>{question.topic}</span>
      ))
    ) : (
      <p>
        Все задания выполнены правильно. Можно переходить к новым темам
        6 класса без повторения всей программы.
      </p>
    )}
  </div>
</article>
Остальная логика результата
В целом она хорошая:

0–7 баллов — восстановление базы;

8–13 — база есть, но нужно повторение;

14–17 — хорошая готовность;

18–20 — сильная база и переход к новым темам. 


Для 20/20 тексты теперь будут согласованы:

«Отличный результат!»;

«У тебя крепкая база»;

во всех карточках разделов — «Получается отлично»;

список сильных тем;

«Тем для обязательного повторения нет»;

«Можно двигаться дальше».

Ещё один небольшой логический момент: при 18 или 19 баллах сейчас написано:

Можно разобрать допущенные ошибки и начинать изучать новые темы

Это нормально. При 20 баллах фраза «разобрать допущенные ошибки» звучит странно, потому что ошибок нет. Лучше сделать текст последнего диапазона зависимым от полного результата:

return {
  title: "Отличный результат!",
  text:
    score === 20
      ? "У тебя крепкая база за 5 класс. Все задания выполнены правильно — можно начинать изучать новые темы: смешанные числа, пропорции, отрицательные числа и более сложные уравнения."
      : "У тебя крепкая база за 5 класс. Можно разобрать отдельные допущенные ошибки и начинать изучать новые темы: смешанные числа, пропорции, отрицательные числа и более сложные уравнения.",
  extra:
    "Ты уже готов двигаться дальше — без спешки и лишнего повторения.",
  cta: "Начать темы 6 класса",
  card:
    score === 20
      ? "Обязательного повторения не требуется — можно переходить к программе 6 класса."
      : "Можно быстро разобрать отдельные ошибки и двигаться дальше.",
};
Так результат 20/20 нигде не будет намекать, что ученику обязательно надо что-то повторять.


остальное проверь по нашему шаблону, что мы обсуждали. ВЕСЬ КОД ПОСМОТРИ

Да, весь файл посмотрела целиком, не только итоговый текст. Сейчас страница рабочая, но до нашего общего стандарта ей ещё довольно много не хватает. 


Что уже сделано хорошо
Уже есть:

поле имени;

20 заданий;

автоматическая проверка;

сохранение ответов и текущего номера;

запрет «Далее» при полностью пустом ответе;

возврат назад;

экран перед завершением;

список пропущенных номеров;

результат по тематическим блокам;

перечень сильных и слабых тем;

правильные ответы по ошибкам;

кнопка Telegram;

повторное прохождение.

То есть основа хорошая. Мы не переделываем всё с нуля.

Что нужно исправить обязательно
1. Логическая ошибка при 20/20
Ты уже заметила: заголовок «Что повторить» остаётся даже без ошибок.

Также в resultCopy для диапазона 18–20 написано:

Можно разобрать допущенные ошибки...

При 20/20 ошибок нет.

Это нужно исправить тем вариантом, который я дала выше: отдельный текст для score === 20.

2. «Смешанные числа» названы новой темой, хотя они есть в диагностике
В финальном тексте сейчас:

начинать изучать новые темы: смешанные числа, пропорции, отрицательные числа...

Но №9 уже проверяет сложение смешанных чисел. Получается, сайт одновременно считает их пройденной темой 5 класса и новой темой 6 класса.

Лучше написать:

text:
  score === 20
    ? "У тебя крепкая база за 5 класс. Все задания выполнены правильно — можно переходить к новым темам: отношениям и пропорциям, отрицательным числам, раскрытию скобок и более сложным уравнениям."
    : "У тебя крепкая база за 5 класс. Можно разобрать отдельные допущенные ошибки и переходить к новым темам: отношениям и пропорциям, отрицательным числам, раскрытию скобок и более сложным уравнениям.",
3. Двойное задание №19 можно отправить с одним полем
Сейчас hasAnswer проверяет всю строку:

const hasAnswer = Array.isArray(answer)
  ? answer.length > 0
  : answer.trim().length > 0;
Для №19 ответ хранится так:

38|
Такая строка считается непустой, поэтому ученик может заполнить только периметр и перейти дальше без площади.

Для двойного задания нужно требовать оба поля.

Заменить вычисление hasAnswer на:

const hasAnswer = (() => {
  if (Array.isArray(answer)) return answer.length > 0;

  if (question.type === "double") {
    const parts = answer.split("|");
    return Boolean(parts[0]?.trim() && parts[1]?.trim());
  }

  return answer.trim().length > 0;
})();
4. Нет кнопки «Не знаю»
По нашему стандарту нельзя заставлять ребёнка угадывать ответ ради перехода.

Сейчас есть только:

назад;

далее.

Нужно добавить состояние dontKnow для каждого задания и кнопку:

Не знаю, как решить

После неё:

ответ очищается;

номер становится синим;

«Далее» становится доступной;

в результате это не просто «ошибка», а отдельный статус.

Это уже не маленькая строчка, а изменение структуры answers. Сейчас Answer — только строка или массив. Лучше перейти на объект, как в диагностике перед 10 классом:

type StoredAnswer = {
  value: Answer;
  dontKnow: boolean;
};
Иначе потом навигацию, цвета и обзор будет неудобно наращивать.

5. Нет навигации по всем номерам во время теста
Сейчас можно двигаться только кнопками «Назад» и «Далее».

Нужен перечень:

1 2 3 4 5 ... 20
При нажатии — переход сразу к выбранному заданию.

Во время прохождения:

серый — пусто;

фиолетовый — ответ введён;

синий — «не знаю».

Правильность во время решения не показываем.

6. Экран обзора показывает только пропуски
Сейчас перед завершением выводятся только номера без ответа:

{missing.map(...)}
По нашему шаблону нужен обзор всех 20 заданий, а не только пропущенных:

фиолетовый — ответ есть;

синий — «не знаю»;

серый — пусто.

Любой номер должен быть кликабельным.

Также нужна кнопка:

Засчитать пропуски как «Не знаю»

Сейчас завершить диагностику нельзя, пока не введён каждый ответ, но возможности честно отметить незнание тоже нет.

7. Нет обзора заданий после завершения
Сейчас после результата можно открыть только список ошибок в <details>, но там показаны:

номер;

тема;

правильный ответ.

Не показан ответ самого ученика.

По нашему стандарту нужен отдельный блок или кнопка:

Посмотреть задания

Цвета после проверки:

зелёный — правильно;

красный — неправильно;

синий — не знаю.

При открытии номера:

условие;

ответ ученика;

правильный ответ;

тема;

статус.

8. Нет KaTeX
Все формулы пока выводятся обычным текстом:

{question.expression && (
  <div className="expression">{question.expression}</div>
)}
Нужно:

добавить общий MathFormula;

заменить вывод на KaTeX;

переписать expression.

Особенно требуют KaTeX:

№6–11 — дроби;

№3 — степень;

№7 — сравнение дробей;

№9 — смешанные числа;

№17–18 — буквенное выражение и уравнение.

Обычные арифметические выражения тоже будут выглядеть аккуратнее.

9. Нет рекомендаций перед началом и согласия
На главной есть только небольшой совет ниже:

постарайся решить задания самостоятельно...

Но начать можно, не прочитав его, потому что поле имени и кнопка стоят раньше.

По нашему стандарту рядом со стартом должны быть:

приготовить бумагу;

выполнять самостоятельно;

не использовать калькулятор и подсказки;

строгого ограничения времени нет;

неудачные попытки не стирать;

если не знаешь — нажать соответствующую кнопку;

это не оценка.

И галочка:

Я прочитал(а) рекомендации и готов(а) начать

Кнопка начала активна только при имени и галочке.

10. Имя не сохраняется
В localStorage сейчас записываются только:

{ answers, current }
Имя не сохраняется.

Если страницу обновить:

ответы останутся;

текущий номер останется;

имя исчезнет;

экран всё равно откроется стартовый.

Нужно сохранять:

{
  screen,
  studentName,
  accepted,
  answers,
  current
}
И восстанавливать их.

11. Экран тоже не сохраняется
Сейчас состояние:

const [screen, setScreen] = useState("home");
после перезагрузки всегда снова становится home, даже если ученик был на №15.

Получается странно: прогресс сохранён, но ребёнок возвращается на главную.

Лучше либо:

восстанавливать экран test;

либо показывать окно «Продолжить диагностику / Начать заново».

Для первого этапа проще просто сохранять screen.

12. «Начать сначала» отсутствует во время теста
В шапке теста только бренд. Нет возможности сбросить прохождение.

Нужна кнопка:

Начать сначала

с подтверждением:

Все сохранённые ответы будут удалены. Начать заново?

Сейчас restart удаляет всё сразу, без предупреждения. В результате это терпимо, но во время теста опасно.

13. Бренд не ведёт на главную
В большинстве новых страниц бренд — ссылка:

<a className="brand" href="/">
Здесь это обычный <div>.

Лучше сделать ссылкой на:

тестовом экране;

результате;

стартовом экране.

Но при уходе во время теста желательно предупредить, что ответы сохранятся.

14. Нет копирования результата
Кнопка Telegram создаёт короткое сообщение только с общим баллом:

Результат моей диагностики перед 6 классом — 15 из 20
Но нет кнопки:

Скопировать результат

И нет полного текста:

имя;

балл;

результаты по блокам;

сильные темы;

темы для повторения;

количество «Не знаю».

Это нужно добавить.

15. Нет скачивания результата
Функции download вообще нет.

Нужна кнопка:

Скачать результат

В файле должны быть:

название;

имя;

дата;

общий результат;

результаты по блокам;

рекомендации;

таблица всех 20 номеров;

ответ ученика;

правильный ответ;

статус.

16. Telegram получает слишком мало информации
Сейчас сообщение содержит только балл и просьбу подсказать темы.

Лучше перед открытием Telegram копировать полный результат, как в диагностике перед 10 классом.

Само автоматическое сообщение можно оставить коротким:

Здравствуйте! Меня зовут ... Я прошёл(ла) диагностику перед 6 классом и получил(а) ... из 20. Хочу обсудить план повторения.
Но рядом должна быть кнопка копирования подробного отчёта.

Проверка текстов по диапазонам
0–7
В целом хорошо, но фраза:

после каникул многое приходится освежать

слишком сезонная. Диагностику могут пройти зимой или весной.

Лучше:

Некоторые темы 5 класса могли забыться — это нормально.

И:

text:
  "Некоторые темы 5 класса пока вызывают трудности. Это нормально: знания можно спокойно восстановить. Перед 6 классом особенно важно укрепить вычисления, дроби и простые уравнения.",
8–13
Логика нормальная:

Хорошая база, но кое-что стоит повторить

Но 8 из 20 — это только 40%. «Большую часть программы ты помнишь» при 8 баллах звучит слишком оптимистично.

Лучше разделить:

0–7;

8–12;

13–16;

17–19;

Либо заменить текст диапазона 8–13:

text:
  "Часть тем 5 класса уже получается, но несколько важных навыков стоит укрепить перед началом программы 6 класса.",
14–17
Хороший и логичный диапазон. Текст подходит.

18–19
Сильный результат, но есть отдельные ошибки. Нужен отдельный текст:

База крепкая. Достаточно разобрать отдельные ошибки и двигаться дальше.

20
Отдельный идеальный результат:

обязательного повторения нет;

никаких «допущенных ошибок»;

никаких заголовков «что повторить»;

переход к новым темам.

Ещё одна важная особенность результата
В блоках используется такой статус:

ratio >= 0.5
  ? "Стоит немного повторить"
  : "Важно восстановить"
Например, если в блоке только два задания и одно верно, сайт говорит:

Стоит немного повторить

Это приемлемо.

Но блок «Геометрия» состоит всего из одного задания. Если оно неверно, сайт делает вывод по всей геометрии:

Важно восстановить

Это звучит слишком категорично по одному примеру.

Лучше для одиночных блоков писать мягче:

const status =
  ratio === 1
    ? "Получается отлично"
    : blockQuestions.length === 1
      ? "Стоит проверить тему"
      : ratio >= 0.5
        ? "Стоит немного повторить"
        : "Важно восстановить";
И текст:

В этом задании возникла трудность — стоит ещё раз проверить тему.

То же касается блока «Работа с информацией», где тоже только одно задание.

Итог по нашему шаблону
Функция	Сейчас
Имя	Есть, но не сохраняется
Рекомендации	Частично
Согласие перед стартом	Нет
KaTeX	Нет
«Далее» без ответа	Почти закрыто, но №19 сломан
«Не знаю»	Нет
Навигация по номерам	Нет
Цвета во время прохождения	Нет
Обзор перед завершением	Частичный
Цветной обзор после завершения	Нет
Ответ ученика в разборе	Нет
Скопировать результат	Нет
Скачать результат	Нет
Telegram	Есть, но только общий балл
Сохранение прогресса	Частичное
Подтверждение сброса	Нет
Логика 20/20	Требует исправления
Как идти, чтобы снова не разломать файл
Не пытаемся внести всё одновременно.

Порядок для 6 класса:

Исправить тексты результата и 20/20.

Подключить KaTeX и переписать формулы.

Переделать структуру ответов под «Не знаю».

Добавить навигацию по номерам.

Переделать обзор перед завершением.

Добавить обзор после результата.

Добавить копирование и скачивание.

Дополнить стартовые рекомендации и сохранение имени.

Финальный прогон.

Первым делом сейчас исправляем только тексты результата, включая диапазоны баллов и идеальный результат. Потом уже берём KaTeX.


можешь переписать весь код сразу?

Да. Я переписала весь файл целиком по нашему общему шаблону на основе твоего исходного кода. 


Что уже добавлено:

KaTeX для всех формул;

исправленная логика текстов, включая отдельный результат для 20/20;

имя, рекомендации и обязательная галочка перед стартом;

сохранение имени, экрана, ответов и текущего номера;

кнопка «Не знаю, как решить»;

запрет перехода, если обязательные поля не заполнены;

исправление задания №19: нужны и периметр, и площадь;

навигация по всем 20 номерам;

цветовые состояния во время прохождения;

полный обзор перед завершением;

зелёные, красные и синие статусы после завершения;

ответ ученика и правильный ответ;

копирование результата;

скачивание результата;

подтверждение перед сбросом;

Telegram;

более мягкая логика для разделов, где всего одно задание.

page_grade6_rewritten.tsx

Замени им содержимое текущего файла страницы 6 класса целиком. После зелёной сборки отдельно добавим недостающие CSS-стили для панели номеров и цветного обзора. 


page_grade6_rewritten.tsx


"use client";

import { useEffect, useMemo, useState } from "react";

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

type Answer = string | string[];
type Screen = "home" | "test" | "review" | "result";

type Question = {
  id: number;
  eyebrow: string;
  prompt: string;
  expression?: string;
  hint?: string;
  type: "text" | "choice" | "multi" | "double" | "table";
  options?: string[];
  fields?: { key: string; label: string; suffix?: string }[];
  topic: string;
  block: string;
  correctLabel: string;
  check: (answer: Answer) => boolean;
};

const TELEGRAM_USERNAME = "vxoab";
const STORAGE_KEY = "math-diagnostic-6-v2";

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(",", ".");

function asNumber(value: string) {
  const cleaned = normalize(value).replace(/[a-zа-яё]/gi, "").replace("=", "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function asFraction(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(",", ".").replace(/[()]/g, "");
  const mixed = cleaned.match(/^(-?\d+)[\s_]+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (!denominator) return null;
    return whole + Math.sign(whole || 1) * numerator / denominator;
  }
  const fraction = cleaned.match(/^(-?\d+)\/(-?\d+)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    return denominator ? Number(fraction[1]) / denominator : null;
  }
  return asNumber(cleaned);
}

const equalsNumber = (target: number) => (answer: Answer) =>
  typeof answer === "string" && asNumber(answer) === target;

const equalsFraction = (target: number) => (answer: Answer) => {
  if (typeof answer !== "string") return false;
  const parsed = asFraction(answer);
  return parsed !== null && Math.abs(parsed - target) < 1e-9;
};

const questions: Question[] = [
  { id: 1, eyebrow: "Порядок действий", prompt: "Вычисли:", expression: String.raw`840:7+36\cdot5-48`, type: "text", topic: "Натуральные числа и порядок действий", block: "Натуральные числа и вычисления", correctLabel: "252", check: equalsNumber(252) },
  { id: 2, eyebrow: "Распределительное свойство", prompt: "Вычисли наиболее удобным способом:", expression: String.raw`27\cdot46+73\cdot46`, type: "text", topic: "Свойства действий и упрощение выражений", block: "Натуральные числа и вычисления", correctLabel: "4600", check: equalsNumber(4600) },
  { id: 3, eyebrow: "Степень числа", prompt: "Вычисли:", expression: String.raw`3^3+72:8`, type: "text", topic: "Степень и порядок действий", block: "Натуральные числа и вычисления", correctLabel: "36", check: equalsNumber(36) },
  { id: 4, eyebrow: "Признаки делимости", prompt: "Выбери все числа, которые делятся одновременно на 2 и на 3:", type: "multi", options: ["126", "235", "318", "440", "513"], topic: "Признаки делимости", block: "Делимость", correctLabel: "126 и 318", check: (answer) => Array.isArray(answer) && [...answer].sort().join(",") === ["126", "318"].sort().join(",") },
  { id: 5, eyebrow: "Делители числа", prompt: "Запиши все делители числа 18 через запятую:", type: "text", hint: "Порядок чисел не важен", topic: "Делители и кратные", block: "Делимость", correctLabel: "1, 2, 3, 6, 9, 18", check: (answer) => { if (typeof answer !== "string") return false; const values = answer.split(/[,; ]+/).filter(Boolean).map(Number).sort((a, b) => a - b); return values.join(",") === "1,2,3,6,9,18"; } },
  { id: 6, eyebrow: "Сокращение дробей", prompt: "Сократи дробь:", expression: String.raw`\frac{24}{36}`, type: "text", hint: "Ответ можно записать через /", topic: "Сокращение дробей", block: "Обыкновенные дроби", correctLabel: "2/3", check: equalsFraction(2 / 3) },
  { id: 7, eyebrow: "Сравнение дробей", prompt: "Сравни дроби:", expression: String.raw`\frac{5}{8}\quad\text{и}\quad\frac{7}{12}`, type: "choice", options: ["5/8 > 7/12", "5/8 < 7/12", "5/8 = 7/12"], topic: "Сравнение дробей", block: "Обыкновенные дроби", correctLabel: "5/8 > 7/12", check: (answer) => answer === "5/8 > 7/12" },
  { id: 8, eyebrow: "Вычитание дробей", prompt: "Вычисли:", expression: String.raw`\frac{5}{6}-\frac{1}{4}`, type: "text", topic: "Общий знаменатель и действия с дробями", block: "Обыкновенные дроби", correctLabel: "7/12", check: equalsFraction(7 / 12) },
  { id: 9, eyebrow: "Смешанные числа", prompt: "Вычисли:", expression: String.raw`2\frac{3}{5}+1\frac{7}{10}`, type: "text", hint: "Например: 2 1/3 или 7/3", topic: "Смешанные числа", block: "Обыкновенные дроби", correctLabel: "4 3/10", check: equalsFraction(4.3) },
  { id: 10, eyebrow: "Умножение дробей", prompt: "Вычисли:", expression: String.raw`\frac{4}{9}\cdot\frac{3}{8}`, type: "text", topic: "Умножение дробей", block: "Обыкновенные дроби", correctLabel: "1/6", check: equalsFraction(1 / 6) },
  { id: 11, eyebrow: "Деление дробей", prompt: "Вычисли:", expression: String.raw`\frac{5}{6}:\frac{10}{9}`, type: "text", topic: "Деление дробей", block: "Обыкновенные дроби", correctLabel: "3/4", check: equalsFraction(3 / 4) },
  { id: 12, eyebrow: "Нахождение части числа", prompt: "В коробке было 36 конфет. Маша съела 5/12 всех конфет. Сколько конфет она съела?", type: "text", topic: "Нахождение части от числа", block: "Обыкновенные дроби", correctLabel: "15", check: equalsNumber(15) },
  { id: 13, eyebrow: "Нахождение целого по части", prompt: "После того как из книги прочитали 48 страниц, оказалось, что прочитано 3/8 всей книги. Сколько страниц в книге?", type: "text", topic: "Нахождение целого по его части", block: "Обыкновенные дроби", correctLabel: "128", check: equalsNumber(128) },
  { id: 14, eyebrow: "Десятичные дроби", prompt: "Вычисли:", expression: String.raw`7{,}35-2{,}8+0{,}45`, type: "text", hint: "Можно использовать запятую или точку", topic: "Сложение и вычитание десятичных дробей", block: "Десятичные дроби", correctLabel: "5", check: equalsNumber(5) },
  { id: 15, eyebrow: "Умножение десятичных дробей", prompt: "Вычисли:", expression: String.raw`4{,}8\cdot0{,}25`, type: "text", topic: "Умножение десятичных дробей", block: "Десятичные дроби", correctLabel: "1,2", check: equalsNumber(1.2) },
  { id: 16, eyebrow: "Округление", prompt: "Округли число 37,846 до десятых.", type: "text", topic: "Округление чисел", block: "Десятичные дроби", correctLabel: "37,8", check: equalsNumber(37.8) },
  { id: 17, eyebrow: "Буквенное выражение", prompt: "Найди значение выражения, если a = 7:", expression: String.raw`5a-12`, type: "text", topic: "Буквенные выражения", block: "Выражения и уравнения", correctLabel: "23", check: equalsNumber(23) },
  { id: 18, eyebrow: "Уравнение", prompt: "Реши уравнение:", expression: String.raw`7x-18=45`, type: "text", topic: "Уравнения", block: "Выражения и уравнения", correctLabel: "x = 9", check: (answer) => typeof answer === "string" && asNumber(answer.toLowerCase().replace("x", "").replace("=", "")) === 9 },
  { id: 19, eyebrow: "Геометрия", prompt: "Длина прямоугольника равна 12 см, а ширина — 7 см. Найди его периметр и площадь.", type: "double", fields: [{ key: "p", label: "Периметр", suffix: "см" }, { key: "s", label: "Площадь", suffix: "см²" }], topic: "Периметр и площадь прямоугольника", block: "Геометрия", correctLabel: "периметр — 38 см, площадь — 84 см²", check: (answer) => typeof answer === "string" && asNumber(answer.split("|")[0] || "") === 38 && asNumber(answer.split("|")[1] || "") === 84 },
  { id: 20, eyebrow: "Работа с таблицей", prompt: "Сколько всего страниц Дима прочитал за четыре дня?", type: "table", topic: "Таблицы и работа с информацией", block: "Работа с информацией", correctLabel: "90", check: equalsNumber(90) },
];

const blockCopy: Record<string, string> = {
  "Натуральные числа и вычисления": "Освежи порядок действий, степени и удобные способы вычислений — это поможет увереннее работать с более сложными выражениями.",
  Делимость: "Повтори признаки делимости, делители и кратные. На этой базе в 6 классе будут изучаться разложение на простые множители, НОД и НОК.",
  "Обыкновенные дроби": "Повтори сокращение дробей и приведение к общему знаменателю. Эти навыки понадобятся уже в начале 6 класса при действиях со смешанными числами.",
  "Десятичные дроби": "Повтори действия с десятичными дробями и округление. Они понадобятся в задачах на проценты, среднее арифметическое и пропорции.",
  "Выражения и уравнения": "Освежи работу с буквенными выражениями и простыми уравнениями. В 6 классе появятся раскрытие скобок, подобные слагаемые и более сложные уравнения.",
  Геометрия: "Ещё раз проверь формулы периметра и площади прямоугольника. Обращай внимание на единицы измерения: сантиметры и квадратные сантиметры — не одно и то же.",
  "Работа с информацией": "Потренируйся читать таблицы и собирать данные из нескольких строк — этот навык пригодится в задачах и диаграммах.",
};

function resultCopy(score: number) {
  if (score <= 7) return { title: "Давай восстановим базу вместе", text: "Некоторые темы 5 класса пока вызывают трудности. Это нормально: знания можно спокойно восстановить. Перед 6 классом особенно важно укрепить вычисления, дроби и простые уравнения.", extra: "Не нужно повторять весь учебник подряд. Лучше начать с основных пробелов и двигаться небольшими шагами.", cta: "Повторить вместе", card: "Вместе восстановим основные темы 5 класса и подготовимся к началу программы 6 класса." };
  if (score <= 12) return { title: "Часть базы уже есть", text: "Некоторые темы 5 класса уже получаются, но несколько важных навыков стоит укрепить перед началом программы 6 класса.", extra: "Посмотри персональные рекомендации ниже — они покажут, с чего лучше начать.", cta: "Подтянуть сложные темы", card: "Разберём только те темы, в которых остались пробелы, без повторения всего учебника." };
  if (score <= 16) return { title: "Хорошая база, но кое-что стоит повторить", text: "Большую часть программы 5 класса ты помнишь. Осталось освежить несколько тем, чтобы увереннее начать 6 класс.", extra: "Повторять всё подряд не понадобится — достаточно разобрать отдельные сложные места.", cta: "Подтянуть сложные темы", card: "Быстро разберём отдельные пробелы и подготовимся к программе 6 класса." };
  if (score <= 19) return { title: "Ты хорошо готов к 6 классу", text: "У тебя крепкая база за 5 класс. Достаточно разобрать отдельные ошибки и можно переходить к новым темам: отношениям и пропорциям, отрицательным числам, раскрытию скобок и более сложным уравнениям.", extra: "Обязательного повторения всей программы не требуется.", cta: "Подготовиться к 6 классу", card: "Разберём отдельные ошибки и начнём знакомиться с темами 6 класса." };
  return { title: "Отличный результат!", text: "У тебя крепкая база за 5 класс. Все задания выполнены правильно — можно переходить к новым темам: отношениям и пропорциям, отрицательным числам, раскрытию скобок и более сложным уравнениям.", extra: "Тем для обязательного повторения нет — можно спокойно двигаться дальше.", cta: "Начать темы 6 класса", card: "Обязательного повторения не требуется — можно переходить к программе 6 класса." };
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
    const timer = window.setInterval(() => { if (renderFormula()) window.clearInterval(timer); }, 100);
    return () => window.clearInterval(timer);
  }, [element, expression]);
  return <div ref={setElement} />;
}

function MathDoodle() {
  return <div className="doodle" aria-hidden="true"><span className="doodle-plus">+</span><span className="doodle-pi">π</span><span className="doodle-frac"><b>5</b><i/><b>8</b></span><div className="doodle-paper"><div/><div/><div/><span>×</span></div><span className="doodle-dot dot-one"/><span className="doodle-dot dot-two"/></div>;
}

function answerHasContent(question: Question, answer: Answer | undefined) {
  if (Array.isArray(answer)) return answer.length > 0;
  if (!answer) return false;
  if (question.type === "double") {
    const parts = answer.split("|");
    return Boolean(parts[0]?.trim() && parts[1]?.trim());
  }
  return answer.trim().length > 0;
}

function formatStudentAnswer(question: Question, answer: Answer | undefined) {
  if (Array.isArray(answer)) return answer.length ? answer.join(", ") : "Ответ не введён";
  if (!answer?.trim()) return "Ответ не введён";
  if (question.type === "double") {
    const [perimeter, area] = answer.split("|");
    return `периметр — ${perimeter || "—"}, площадь — ${area || "—"}`;
  }
  return answer;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character] || character));
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [studentName, setStudentName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [dontKnow, setDontKnow] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (["home", "test", "review"].includes(parsed.screen)) setScreen(parsed.screen);
        setStudentName(parsed.studentName || "");
        setAccepted(Boolean(parsed.accepted));
        setAnswers(parsed.answers || {});
        setDontKnow(parsed.dontKnow || {});
        setCurrent(Math.min(Math.max(parsed.current || 0, 0), questions.length - 1));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || screen === "result") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, studentName, accepted, answers, dontKnow, current }));
  }, [screen, studentName, accepted, answers, dontKnow, current, hydrated]);

  const hasAnswerFor = (question: Question) => Boolean(dontKnow[question.id] || answerHasContent(question, answers[question.id]));

  const updateAnswer = (id: number, value: Answer) => {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    setDontKnow((previous) => ({ ...previous, [id]: false }));
  };

  const markUnknown = (question: Question) => {
    setAnswers((previous) => ({ ...previous, [question.id]: question.type === "multi" ? [] : "" }));
    setDontKnow((previous) => ({ ...previous, [question.id]: true }));
  };

  const score = useMemo(() => questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length, [answers, dontKnow]);
  const answeredCount = useMemo(() => questions.filter((question) => hasAnswerFor(question)).length, [answers, dontKnow]);
  const unknownCount = useMemo(() => questions.filter((question) => dontKnow[question.id]).length, [dontKnow]);

  const start = () => {
    if (!studentName.trim() || !accepted) return;
    setScreen("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    if (!window.confirm("Все сохранённые ответы будут удалены. Начать диагностику заново?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setStudentName(""); setAccepted(false); setAnswers({}); setDontKnow({}); setCurrent(0); setScreen("home"); setToast(""); setCopyFallback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reportText = () => {
    const copy = resultCopy(score);
    const blocks = [...new Set(questions.map((question) => question.block))];
    const blockLines = blocks.map((block) => {
      const blockQuestions = questions.filter((question) => question.block === block);
      const correct = blockQuestions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length;
      return `— ${block}: ${correct} из ${blockQuestions.length}`;
    });
    const strongTopics = questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).map((question) => question.topic);
    const repeatTopics = questions.filter((question) => !question.check(answers[question.id] ?? "")).map((question) => question.topic);
    return [
      "Диагностика «Что повторить перед 6 классом?»",
      `Ученик: ${studentName.trim()}`,
      `Результат: ${score} из ${questions.length}`,
      `Отмечено «Не знаю»: ${unknownCount}`,
      `Вывод: ${copy.title}`,
      `Результаты по разделам:\n${blockLines.join("\n")}`,
      `Получается уверенно:\n${strongTopics.length ? strongTopics.map((topic) => `— ${topic}`).join("\n") : "—"}`,
      `Стоит повторить:\n${repeatTopics.length ? repeatTopics.map((topic) => `— ${topic}`).join("\n") : "— обязательных тем для повторения нет"}`,
      `Работа выполнена: ${new Date().toLocaleString("ru-RU")}`,
    ].join("\n\n");
  };

  const copyResult = async (message = "Результат скопирован") => {
    try { await navigator.clipboard.writeText(reportText()); setToast(message); setCopyFallback(""); }
    catch { setToast("Браузер запретил автоматическое копирование"); setCopyFallback(reportText()); }
    window.setTimeout(() => setToast(""), 4000);
  };

  const downloadResult = () => {
    const rows = questions.map((question) => {
      const studentAnswer = dontKnow[question.id] ? "Не знаю, как решить" : formatStudentAnswer(question, answers[question.id]);
      const status = dontKnow[question.id] ? "Не знаю" : question.check(answers[question.id] ?? "") ? "Правильно" : "Неправильно";
      return `<tr><td>${question.id}</td><td>${escapeHtml(question.topic)}</td><td>${escapeHtml(studentAnswer)}</td><td>${escapeHtml(question.correctLabel)}</td><td>${status}</td></tr>`;
    }).join("");
    const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Результат диагностики</title><style>body{font-family:Arial,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;color:#28222c}h1{color:#674fa6}pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}@media print{button{display:none}}</style><body><h1>Что повторить перед 6 классом?</h1><pre>${escapeHtml(reportText())}</pre><h2>Все задания</h2><table><tr><th>№</th><th>Тема</th><th>Ответ ученика</th><th>Правильный ответ</th><th>Статус</th></tr>${rows}</table><button onclick="window.print()">Печать / сохранить как PDF</button></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `Перед_6_классом_${studentName.trim().replace(/\s+/g, "_") || "ученик"}.html`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (screen === "test") {
    const question = questions[current];
    const answer = answers[question.id] ?? (question.type === "multi" ? [] : "");
    const hasAnswer = hasAnswerFor(question);
    const goNext = () => {
      if (!hasAnswer) return;
      if (current === questions.length - 1) setScreen("review"); else setCurrent((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return <main className="test-shell">
      <header className="site-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Начать сначала</button></header>
      <section className="test-wrap">
        <div className="progress-line"><div><span>Задание {current + 1} из {questions.length}</span><small>{answeredCount} ответов сохранено</small></div><strong>{Math.round(((current + 1) / questions.length) * 100)}%</strong></div>
        <div className="progress-track"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }}/></div>
        <nav className="question-number-nav" aria-label="Переход по заданиям">
          {questions.map((item, index) => {
            const stateClass = dontKnow[item.id] ? "unknown" : answerHasContent(item, answers[item.id]) ? "answered" : "empty";
            return <button type="button" className={`${stateClass} ${index === current ? "current" : ""}`} key={item.id} onClick={() => { setCurrent(index); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{item.id}</button>;
          })}
        </nav>
        <article className="question-card">
          <p className="question-eyebrow">{question.eyebrow}</p><h1>{question.prompt}</h1>
          {question.expression && <div className="expression"><MathFormula expression={question.expression}/></div>}
          {question.type === "table" && <div className="data-table" role="table">{[["Понедельник","18 страниц"],["Вторник","25 страниц"],["Среда","17 страниц"],["Четверг","30 страниц"]].map(([day,pages]) => <div role="row" key={day}><span role="cell">{day}</span><b role="cell">{pages}</b></div>)}</div>}
          {(question.type === "text" || question.type === "table") && <label className="answer-field"><span>Твой ответ</span><input inputMode={question.block === "Обыкновенные дроби" ? "text" : "decimal"} autoFocus value={dontKnow[question.id] ? "" : typeof answer === "string" ? answer : ""} onChange={(event) => updateAnswer(question.id, event.target.value)} placeholder="Введи ответ" onKeyDown={(event) => { if (event.key === "Enter" && hasAnswer) goNext(); }}/></label>}
          {question.type === "choice" && <div className="options">{question.options?.map((option) => <button type="button" className={`option ${answer === option ? "selected" : ""}`} key={option} onClick={() => updateAnswer(question.id, option)}><span className="radio-dot"/>{option}</button>)}</div>}
          {question.type === "multi" && <div className="number-options">{question.options?.map((option) => { const selected = Array.isArray(answer) && answer.includes(option); return <button type="button" className={selected ? "selected" : ""} key={option} onClick={() => updateAnswer(question.id, selected ? (answer as string[]).filter((item) => item !== option) : [...(answer as string[]), option])}>{option}</button>; })}</div>}
          {question.type === "double" && <div className="double-fields">{question.fields?.map((field, index) => { const parts = typeof answer === "string" ? answer.split("|") : ["",""]; return <label className="answer-field" key={field.key}><span>{field.label}</span><div className="input-with-suffix"><input inputMode="numeric" value={dontKnow[question.id] ? "" : parts[index] || ""} onChange={(event) => { const next = [...parts]; next[index] = event.target.value; updateAnswer(question.id, next.join("|")); }} placeholder="Ответ"/><b>{field.suffix}</b></div></label>; })}</div>}
          {question.hint && <p className="field-hint">{question.hint}</p>}
          <div className="test-actions"><button className="button secondary" disabled={current === 0} onClick={() => { setCurrent((value) => value - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>← Назад</button><button className={`button dont-know-button ${dontKnow[question.id] ? "active-dont-know" : ""}`} onClick={() => markUnknown(question)}>{dontKnow[question.id] ? "Отмечено: не знаю" : "Не знаю, как решить"}</button><button className="button primary" disabled={!hasAnswer} onClick={goNext}>{current === questions.length - 1 ? "К обзору" : "Далее"} →</button></div>
        </article>
        <p className="save-note">Ответы и прогресс сохраняются на этом устройстве автоматически</p>
      </section>
    </main>;
  }

  if (screen === "review") {
    const missing = questions.filter((question) => !hasAnswerFor(question));
    const markMissingUnknown = () => {
      setDontKnow((previous) => { const next = { ...previous }; missing.forEach((question) => { next[question.id] = true; }); return next; });
      setAnswers((previous) => { const next = { ...previous }; missing.forEach((question) => { next[question.id] = question.type === "multi" ? [] : ""; }); return next; });
    };
    const finish = () => { if (!window.confirm("После завершения изменить ответы будет нельзя. Узнать результат?")) return; setScreen("result"); localStorage.removeItem(STORAGE_KEY); window.scrollTo({ top: 0, behavior: "smooth" }); };
    return <main className="result-page review-overview"><header className="compact-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header><section className="result-section overview-heading"><p className="kicker">Перед завершением</p><h1>Обзор всех 20 заданий</h1><p>{missing.length ? `Без ответа осталось: ${missing.length}. Вернись к ним или засчитай как «Не знаю, как решить».` : "Все задания заполнены или отмечены как «Не знаю, как решить»."}</p></section><section className="result-section overview-grid">{questions.map((question, index) => { const stateClass = dontKnow[question.id] ? "unknown" : answerHasContent(question, answers[question.id]) ? "answered" : "empty"; return <button className={`overview-item ${stateClass}`} key={question.id} onClick={() => { setCurrent(index); setScreen("test"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><b>№{question.id}</b></button>; })}</section><section className="result-section review-finish">{missing.length > 0 && <button className="button secondary" onClick={markMissingUnknown}>Засчитать пропуски как «Не знаю»</button>}<button className="button primary" disabled={missing.length > 0} onClick={finish}>Узнать результат</button></section></main>;
  }

  if (screen === "result") {
    const copy = resultCopy(score);
    const blocks = [...new Set(questions.map((question) => question.block))];
    const strongTopics = questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).map((question) => question.topic);
    const missed = questions.filter((question) => !question.check(answers[question.id] ?? ""));
    const telegramMessage = encodeURIComponent(`Здравствуйте! Меня зовут ${studentName.trim()}. Результат моей диагностики перед 6 классом — ${score} из ${questions.length}. Хочу обсудить план повторения.`);
    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${telegramMessage}`;
    return <main className="result-page">
      <header className="compact-header result-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Пройти ещё раз</button></header>
      <section className="result-hero"><div className="score-orbit"><strong>{score}</strong><span>из 20</span></div><div><p className="kicker">Диагностика завершена</p><h1>{studentName.trim()}, {copy.title.toLowerCase()}</h1><p>{copy.text}</p><small>{copy.extra}</small></div></section>
      <section className="result-section result-stats oge-stats"><article><strong>{score}/{questions.length}</strong><span>правильных ответов</span></article><article><strong>{unknownCount}</strong><span>«не знаю»</span></article><article><strong>{questions.length - score - unknownCount}</strong><span>ошибок</span></article></section>
      <section className="result-section"><div className="section-heading"><div><p className="kicker">Персональный разбор</p><h2>{studentName.trim()}, вот твой результат по темам</h2></div><span>Рекомендации только по твоим ответам</span></div><div className="block-results">{blocks.map((block) => { const blockQuestions = questions.filter((question) => question.block === block); const correct = blockQuestions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length; const ratio = correct / blockQuestions.length; const isSingle = blockQuestions.length === 1; const status = ratio === 1 ? "Получается отлично" : isSingle ? "Стоит проверить тему" : ratio >= 0.5 ? "Стоит немного повторить" : "Важно восстановить"; return <article className={`block-card ${ratio === 1 ? "great" : ratio >= 0.5 ? "medium" : "restore"}`} key={block}><div className="block-topline"><span>{correct}/{blockQuestions.length}</span><b>{status}</b></div><h3>{block}</h3><p>{ratio === 1 ? "Здесь всё уверенно — можно двигаться дальше." : isSingle ? "В этом задании возникла трудность — стоит ещё раз проверить тему." : blockCopy[block]}</p></article>; })}</div></section>
      <section className="result-section split-result"><article className="topic-panel strong-panel"><p className="kicker">Сильные темы</p><h2>Уже получается</h2><div className="topic-tags">{strongTopics.map((topic) => <span key={topic}>✓ {topic}</span>)}{!strongTopics.length && <p>Сейчас важнее спокойно восстановить базу — начнём с главного.</p>}</div></article><article className="topic-panel repeat-panel"><p className="kicker">{missed.length ? "Точки роста" : "Можно двигаться дальше"}</p><h2>{missed.length ? "Что повторить" : "Тем для обязательного повторения нет"}</h2><div className="topic-tags">{missed.length ? missed.map((question) => <span key={question.id}>{question.topic}</span>) : <p>Все задания выполнены правильно. Можно переходить к новым темам 6 класса без повторения всей программы.</p>}</div></article></section>
      <section className="result-section"><div className="section-heading"><div><p className="kicker">Все задания</p><h2>Посмотри ответы и статусы</h2></div></div><div className="overview-grid result-overview-grid">{questions.map((question) => { const isCorrect = !dontKnow[question.id] && question.check(answers[question.id] ?? ""); const stateClass = dontKnow[question.id] ? "unknown" : isCorrect ? "correct" : "wrong"; return <details className={`overview-item result-answer-item ${stateClass}`} key={question.id}><summary><b>№{question.id}</b><span>{dontKnow[question.id] ? "Не знаю" : isCorrect ? "Правильно" : "Неправильно"}</span></summary><div><p><b>Тема:</b> {question.topic}</p><p><b>Твой ответ:</b> {dontKnow[question.id] ? "Не знаю, как решить" : formatStudentAnswer(question, answers[question.id])}</p><p><b>Правильный ответ:</b> {question.correctLabel}</p></div></details>; })}</div></section>
      <section className="final-cta"><div><p className="kicker">Следующий шаг</p><h2>Хочешь повторить математику без стресса?</h2><p>{copy.card}</p></div><div className="cta-actions"><button className="button secondary" onClick={() => copyResult()}>Скопировать результат</button><button className="button secondary" onClick={downloadResult}>Скачать результат</button><a className="button primary" href={telegramUrl} target="_blank" rel="noreferrer" onClick={() => copyResult("Результат скопирован. Вставь его в сообщение")}>{copy.cta}</a><button className="button secondary" onClick={restart}>Пройти тест ещё раз</button></div>{toast && <p className="copy-toast" role="status">{toast}</p>}{copyFallback && <div className="copy-fallback"><textarea readOnly value={copyFallback}/><button className="button secondary" onClick={() => copyResult()}>Скопировать вручную</button></div>}</section>
    </main>;
  }

  return <main className="home-page"><header className="site-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="header-cta" onClick={start} disabled={!studentName.trim() || !accepted}>Начать диагностику</button></header><section className="hero"><div className="hero-copy"><div className="soft-pill">Бесплатная диагностика перед учебным годом</div><h1>Что повторить<br/>перед <em>6 классом?</em></h1><p className="hero-lead">Пройди небольшую диагностику и узнай, какие темы 5 класса ты помнишь, а что стоит освежить перед новым учебным годом.</p><div className="calm-note"><span>♡</span><p>Это не контрольная и не экзамен. Здесь нет оценок — только понятный результат и рекомендации.</p></div><div className="name-start-card"><label htmlFor="student-name">Как тебя зовут?</label><input id="student-name" type="text" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Введи имя" autoComplete="given-name"/><div className="start-guidance"><h2>Перед началом</h2><ul><li>Приготовь лист бумаги для вычислений.</li><li>Выполняй задания самостоятельно, без калькулятора, учебника и подсказок.</li><li>Строгого ограничения времени нет.</li><li>Не стирай неудачные попытки — они помогают увидеть, что стоит повторить.</li><li>Если не знаешь ответ, нажми «Не знаю, как решить».</li></ul><label className="consent-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)}/><span>Я прочитал(а) рекомендации и готов(а) начать</span></label></div><button className="button primary big" onClick={start} disabled={!studentName.trim() || !accepted}>Начать диагностику <span>→</span></button><p className="name-start-meta"><b>20 заданий</b><span>·</span> около 20 минут <span>·</span> результат сразу</p></div></div><MathDoodle/></section><section className="how"><div className="section-heading home-heading"><div><p className="kicker">Всё просто</p><h2>Как это работает</h2></div><p>Без регистрации, калькулятора и лишнего волнения</p></div><div className="steps">{[["01","Решаешь задания","20 коротких заданий по основным темам 5 класса.","violet"],["02","Получаешь результат","Сразу видишь, что уже получается уверенно.","blue"],["03","Знаешь, что повторить","Получаешь рекомендации именно по своим ошибкам.","pink"]].map(([number,title,text,color]) => <article className={`step-card ${color}`} key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="tip"><span>✦</span><p><b>Небольшой совет:</b> постарайся решить задания самостоятельно. Так рекомендации получатся точнее.</p></div></section><section className="class-section"><div className="section-heading"><div><p className="kicker">Диагностики</p><h2>Выбери свой класс</h2></div><p>Выбирай диагностику по следующему учебному этапу</p></div><div className="class-grid"><button className="class-card active" onClick={start}><span>Доступно сейчас</span><b>Перехожу в 6 класс</b><i>Программа 5 класса →</i></button><a className="class-card active grade-seven-card" href="/7"><span>Доступно сейчас</span><b>Перехожу в 7 класс</b><i>Программа 6 класса →</i></a><a className="class-card active grade-eight-card" href="/8"><span>Доступно сейчас</span><b>Перехожу в 8 класс</b><i>Программа 7 класса →</i></a><a className="class-card active" href="/9"><span>Доступно сейчас</span><b>Перехожу в 9 класс</b><i>Программа 8 класса →</i></a><a className="class-card active" href="/oge"><span>Доступно сейчас</span><b>Начинаю подготовку к ОГЭ</b><i>Входная диагностика →</i></a><a className="class-card active after-nine-card" href="/after9"><span>Доступно сейчас</span><b>Перед 10 классом или колледжем</b><i>Программа 5–9 классов →</i></a>{[5,10,11].map((grade) => <div className="class-card soon" key={grade}><span>Скоро</span><b>Перехожу в {grade} класс</b><i>Диагностика готовится</i></div>)}<div className="class-card soon college"><span>Скоро</span><b>Учусь в колледже</b><i>Диагностика готовится</i></div></div></section><footer><div className="brand"><span className="brand-mark">∿</span><span>Математика без стресса</span></div><p>Проверяем знания, а не ставим оценки ♡</p></footer></main>;
}
page_grade6_rewritten.tsx


"use client";

import { useEffect, useMemo, useState } from "react";

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

type Answer = string | string[];
type Screen = "home" | "test" | "review" | "result";

type Question = {
  id: number;
  eyebrow: string;
  prompt: string;
  expression?: string;
  hint?: string;
  type: "text" | "choice" | "multi" | "double" | "table";
  options?: string[];
  fields?: { key: string; label: string; suffix?: string }[];
  topic: string;
  block: string;
  correctLabel: string;
  check: (answer: Answer) => boolean;
};

const TELEGRAM_USERNAME = "vxoab";
const STORAGE_KEY = "math-diagnostic-6-v2";

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(",", ".");

function asNumber(value: string) {
  const cleaned = normalize(value).replace(/[a-zа-яё]/gi, "").replace("=", "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function asFraction(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/[−–—]/g, "-").replace(",", ".").replace(/[()]/g, "");
  const mixed = cleaned.match(/^(-?\d+)[\s_]+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (!denominator) return null;
    return whole + Math.sign(whole || 1) * numerator / denominator;
  }
  const fraction = cleaned.match(/^(-?\d+)\/(-?\d+)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    return denominator ? Number(fraction[1]) / denominator : null;
  }
  return asNumber(cleaned);
}

const equalsNumber = (target: number) => (answer: Answer) =>
  typeof answer === "string" && asNumber(answer) === target;

const equalsFraction = (target: number) => (answer: Answer) => {
  if (typeof answer !== "string") return false;
  const parsed = asFraction(answer);
  return parsed !== null && Math.abs(parsed - target) < 1e-9;
};

const questions: Question[] = [
  { id: 1, eyebrow: "Порядок действий", prompt: "Вычисли:", expression: String.raw`840:7+36\cdot5-48`, type: "text", topic: "Натуральные числа и порядок действий", block: "Натуральные числа и вычисления", correctLabel: "252", check: equalsNumber(252) },
  { id: 2, eyebrow: "Распределительное свойство", prompt: "Вычисли наиболее удобным способом:", expression: String.raw`27\cdot46+73\cdot46`, type: "text", topic: "Свойства действий и упрощение выражений", block: "Натуральные числа и вычисления", correctLabel: "4600", check: equalsNumber(4600) },
  { id: 3, eyebrow: "Степень числа", prompt: "Вычисли:", expression: String.raw`3^3+72:8`, type: "text", topic: "Степень и порядок действий", block: "Натуральные числа и вычисления", correctLabel: "36", check: equalsNumber(36) },
  { id: 4, eyebrow: "Признаки делимости", prompt: "Выбери все числа, которые делятся одновременно на 2 и на 3:", type: "multi", options: ["126", "235", "318", "440", "513"], topic: "Признаки делимости", block: "Делимость", correctLabel: "126 и 318", check: (answer) => Array.isArray(answer) && [...answer].sort().join(",") === ["126", "318"].sort().join(",") },
  { id: 5, eyebrow: "Делители числа", prompt: "Запиши все делители числа 18 через запятую:", type: "text", hint: "Порядок чисел не важен", topic: "Делители и кратные", block: "Делимость", correctLabel: "1, 2, 3, 6, 9, 18", check: (answer) => { if (typeof answer !== "string") return false; const values = answer.split(/[,; ]+/).filter(Boolean).map(Number).sort((a, b) => a - b); return values.join(",") === "1,2,3,6,9,18"; } },
  { id: 6, eyebrow: "Сокращение дробей", prompt: "Сократи дробь:", expression: String.raw`\frac{24}{36}`, type: "text", hint: "Ответ можно записать через /", topic: "Сокращение дробей", block: "Обыкновенные дроби", correctLabel: "2/3", check: equalsFraction(2 / 3) },
  { id: 7, eyebrow: "Сравнение дробей", prompt: "Сравни дроби:", expression: String.raw`\frac{5}{8}\quad\text{и}\quad\frac{7}{12}`, type: "choice", options: ["5/8 > 7/12", "5/8 < 7/12", "5/8 = 7/12"], topic: "Сравнение дробей", block: "Обыкновенные дроби", correctLabel: "5/8 > 7/12", check: (answer) => answer === "5/8 > 7/12" },
  { id: 8, eyebrow: "Вычитание дробей", prompt: "Вычисли:", expression: String.raw`\frac{5}{6}-\frac{1}{4}`, type: "text", topic: "Общий знаменатель и действия с дробями", block: "Обыкновенные дроби", correctLabel: "7/12", check: equalsFraction(7 / 12) },
  { id: 9, eyebrow: "Смешанные числа", prompt: "Вычисли:", expression: String.raw`2\frac{3}{5}+1\frac{7}{10}`, type: "text", hint: "Например: 2 1/3 или 7/3", topic: "Смешанные числа", block: "Обыкновенные дроби", correctLabel: "4 3/10", check: equalsFraction(4.3) },
  { id: 10, eyebrow: "Умножение дробей", prompt: "Вычисли:", expression: String.raw`\frac{4}{9}\cdot\frac{3}{8}`, type: "text", topic: "Умножение дробей", block: "Обыкновенные дроби", correctLabel: "1/6", check: equalsFraction(1 / 6) },
  { id: 11, eyebrow: "Деление дробей", prompt: "Вычисли:", expression: String.raw`\frac{5}{6}:\frac{10}{9}`, type: "text", topic: "Деление дробей", block: "Обыкновенные дроби", correctLabel: "3/4", check: equalsFraction(3 / 4) },
  { id: 12, eyebrow: "Нахождение части числа", prompt: "В коробке было 36 конфет. Маша съела 5/12 всех конфет. Сколько конфет она съела?", type: "text", topic: "Нахождение части от числа", block: "Обыкновенные дроби", correctLabel: "15", check: equalsNumber(15) },
  { id: 13, eyebrow: "Нахождение целого по части", prompt: "После того как из книги прочитали 48 страниц, оказалось, что прочитано 3/8 всей книги. Сколько страниц в книге?", type: "text", topic: "Нахождение целого по его части", block: "Обыкновенные дроби", correctLabel: "128", check: equalsNumber(128) },
  { id: 14, eyebrow: "Десятичные дроби", prompt: "Вычисли:", expression: String.raw`7{,}35-2{,}8+0{,}45`, type: "text", hint: "Можно использовать запятую или точку", topic: "Сложение и вычитание десятичных дробей", block: "Десятичные дроби", correctLabel: "5", check: equalsNumber(5) },
  { id: 15, eyebrow: "Умножение десятичных дробей", prompt: "Вычисли:", expression: String.raw`4{,}8\cdot0{,}25`, type: "text", topic: "Умножение десятичных дробей", block: "Десятичные дроби", correctLabel: "1,2", check: equalsNumber(1.2) },
  { id: 16, eyebrow: "Округление", prompt: "Округли число 37,846 до десятых.", type: "text", topic: "Округление чисел", block: "Десятичные дроби", correctLabel: "37,8", check: equalsNumber(37.8) },
  { id: 17, eyebrow: "Буквенное выражение", prompt: "Найди значение выражения, если a = 7:", expression: String.raw`5a-12`, type: "text", topic: "Буквенные выражения", block: "Выражения и уравнения", correctLabel: "23", check: equalsNumber(23) },
  { id: 18, eyebrow: "Уравнение", prompt: "Реши уравнение:", expression: String.raw`7x-18=45`, type: "text", topic: "Уравнения", block: "Выражения и уравнения", correctLabel: "x = 9", check: (answer) => typeof answer === "string" && asNumber(answer.toLowerCase().replace("x", "").replace("=", "")) === 9 },
  { id: 19, eyebrow: "Геометрия", prompt: "Длина прямоугольника равна 12 см, а ширина — 7 см. Найди его периметр и площадь.", type: "double", fields: [{ key: "p", label: "Периметр", suffix: "см" }, { key: "s", label: "Площадь", suffix: "см²" }], topic: "Периметр и площадь прямоугольника", block: "Геометрия", correctLabel: "периметр — 38 см, площадь — 84 см²", check: (answer) => typeof answer === "string" && asNumber(answer.split("|")[0] || "") === 38 && asNumber(answer.split("|")[1] || "") === 84 },
  { id: 20, eyebrow: "Работа с таблицей", prompt: "Сколько всего страниц Дима прочитал за четыре дня?", type: "table", topic: "Таблицы и работа с информацией", block: "Работа с информацией", correctLabel: "90", check: equalsNumber(90) },
];

const blockCopy: Record<string, string> = {
  "Натуральные числа и вычисления": "Освежи порядок действий, степени и удобные способы вычислений — это поможет увереннее работать с более сложными выражениями.",
  Делимость: "Повтори признаки делимости, делители и кратные. На этой базе в 6 классе будут изучаться разложение на простые множители, НОД и НОК.",
  "Обыкновенные дроби": "Повтори сокращение дробей и приведение к общему знаменателю. Эти навыки понадобятся уже в начале 6 класса при действиях со смешанными числами.",
  "Десятичные дроби": "Повтори действия с десятичными дробями и округление. Они понадобятся в задачах на проценты, среднее арифметическое и пропорции.",
  "Выражения и уравнения": "Освежи работу с буквенными выражениями и простыми уравнениями. В 6 классе появятся раскрытие скобок, подобные слагаемые и более сложные уравнения.",
  Геометрия: "Ещё раз проверь формулы периметра и площади прямоугольника. Обращай внимание на единицы измерения: сантиметры и квадратные сантиметры — не одно и то же.",
  "Работа с информацией": "Потренируйся читать таблицы и собирать данные из нескольких строк — этот навык пригодится в задачах и диаграммах.",
};

function resultCopy(score: number) {
  if (score <= 7) return { title: "Давай восстановим базу вместе", text: "Некоторые темы 5 класса пока вызывают трудности. Это нормально: знания можно спокойно восстановить. Перед 6 классом особенно важно укрепить вычисления, дроби и простые уравнения.", extra: "Не нужно повторять весь учебник подряд. Лучше начать с основных пробелов и двигаться небольшими шагами.", cta: "Повторить вместе", card: "Вместе восстановим основные темы 5 класса и подготовимся к началу программы 6 класса." };
  if (score <= 12) return { title: "Часть базы уже есть", text: "Некоторые темы 5 класса уже получаются, но несколько важных навыков стоит укрепить перед началом программы 6 класса.", extra: "Посмотри персональные рекомендации ниже — они покажут, с чего лучше начать.", cta: "Подтянуть сложные темы", card: "Разберём только те темы, в которых остались пробелы, без повторения всего учебника." };
  if (score <= 16) return { title: "Хорошая база, но кое-что стоит повторить", text: "Большую часть программы 5 класса ты помнишь. Осталось освежить несколько тем, чтобы увереннее начать 6 класс.", extra: "Повторять всё подряд не понадобится — достаточно разобрать отдельные сложные места.", cta: "Подтянуть сложные темы", card: "Быстро разберём отдельные пробелы и подготовимся к программе 6 класса." };
  if (score <= 19) return { title: "Ты хорошо готов к 6 классу", text: "У тебя крепкая база за 5 класс. Достаточно разобрать отдельные ошибки и можно переходить к новым темам: отношениям и пропорциям, отрицательным числам, раскрытию скобок и более сложным уравнениям.", extra: "Обязательного повторения всей программы не требуется.", cta: "Подготовиться к 6 классу", card: "Разберём отдельные ошибки и начнём знакомиться с темами 6 класса." };
  return { title: "Отличный результат!", text: "У тебя крепкая база за 5 класс. Все задания выполнены правильно — можно переходить к новым темам: отношениям и пропорциям, отрицательным числам, раскрытию скобок и более сложным уравнениям.", extra: "Тем для обязательного повторения нет — можно спокойно двигаться дальше.", cta: "Начать темы 6 класса", card: "Обязательного повторения не требуется — можно переходить к программе 6 класса." };
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
    const timer = window.setInterval(() => { if (renderFormula()) window.clearInterval(timer); }, 100);
    return () => window.clearInterval(timer);
  }, [element, expression]);
  return <div ref={setElement} />;
}

function MathDoodle() {
  return <div className="doodle" aria-hidden="true"><span className="doodle-plus">+</span><span className="doodle-pi">π</span><span className="doodle-frac"><b>5</b><i/><b>8</b></span><div className="doodle-paper"><div/><div/><div/><span>×</span></div><span className="doodle-dot dot-one"/><span className="doodle-dot dot-two"/></div>;
}

function answerHasContent(question: Question, answer: Answer | undefined) {
  if (Array.isArray(answer)) return answer.length > 0;
  if (!answer) return false;
  if (question.type === "double") {
    const parts = answer.split("|");
    return Boolean(parts[0]?.trim() && parts[1]?.trim());
  }
  return answer.trim().length > 0;
}

function formatStudentAnswer(question: Question, answer: Answer | undefined) {
  if (Array.isArray(answer)) return answer.length ? answer.join(", ") : "Ответ не введён";
  if (!answer?.trim()) return "Ответ не введён";
  if (question.type === "double") {
    const [perimeter, area] = answer.split("|");
    return `периметр — ${perimeter || "—"}, площадь — ${area || "—"}`;
  }
  return answer;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character] || character));
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [studentName, setStudentName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [dontKnow, setDontKnow] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (["home", "test", "review"].includes(parsed.screen)) setScreen(parsed.screen);
        setStudentName(parsed.studentName || "");
        setAccepted(Boolean(parsed.accepted));
        setAnswers(parsed.answers || {});
        setDontKnow(parsed.dontKnow || {});
        setCurrent(Math.min(Math.max(parsed.current || 0, 0), questions.length - 1));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || screen === "result") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, studentName, accepted, answers, dontKnow, current }));
  }, [screen, studentName, accepted, answers, dontKnow, current, hydrated]);

  const hasAnswerFor = (question: Question) => Boolean(dontKnow[question.id] || answerHasContent(question, answers[question.id]));

  const updateAnswer = (id: number, value: Answer) => {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    setDontKnow((previous) => ({ ...previous, [id]: false }));
  };

  const markUnknown = (question: Question) => {
    setAnswers((previous) => ({ ...previous, [question.id]: question.type === "multi" ? [] : "" }));
    setDontKnow((previous) => ({ ...previous, [question.id]: true }));
  };

  const score = useMemo(() => questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length, [answers, dontKnow]);
  const answeredCount = useMemo(() => questions.filter((question) => hasAnswerFor(question)).length, [answers, dontKnow]);
  const unknownCount = useMemo(() => questions.filter((question) => dontKnow[question.id]).length, [dontKnow]);

  const start = () => {
    if (!studentName.trim() || !accepted) return;
    setScreen("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    if (!window.confirm("Все сохранённые ответы будут удалены. Начать диагностику заново?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setStudentName(""); setAccepted(false); setAnswers({}); setDontKnow({}); setCurrent(0); setScreen("home"); setToast(""); setCopyFallback("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reportText = () => {
    const copy = resultCopy(score);
    const blocks = [...new Set(questions.map((question) => question.block))];
    const blockLines = blocks.map((block) => {
      const blockQuestions = questions.filter((question) => question.block === block);
      const correct = blockQuestions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length;
      return `— ${block}: ${correct} из ${blockQuestions.length}`;
    });
    const strongTopics = questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).map((question) => question.topic);
    const repeatTopics = questions.filter((question) => !question.check(answers[question.id] ?? "")).map((question) => question.topic);
    return [
      "Диагностика «Что повторить перед 6 классом?»",
      `Ученик: ${studentName.trim()}`,
      `Результат: ${score} из ${questions.length}`,
      `Отмечено «Не знаю»: ${unknownCount}`,
      `Вывод: ${copy.title}`,
      `Результаты по разделам:\n${blockLines.join("\n")}`,
      `Получается уверенно:\n${strongTopics.length ? strongTopics.map((topic) => `— ${topic}`).join("\n") : "—"}`,
      `Стоит повторить:\n${repeatTopics.length ? repeatTopics.map((topic) => `— ${topic}`).join("\n") : "— обязательных тем для повторения нет"}`,
      `Работа выполнена: ${new Date().toLocaleString("ru-RU")}`,
    ].join("\n\n");
  };

  const copyResult = async (message = "Результат скопирован") => {
    try { await navigator.clipboard.writeText(reportText()); setToast(message); setCopyFallback(""); }
    catch { setToast("Браузер запретил автоматическое копирование"); setCopyFallback(reportText()); }
    window.setTimeout(() => setToast(""), 4000);
  };

  const downloadResult = () => {
    const rows = questions.map((question) => {
      const studentAnswer = dontKnow[question.id] ? "Не знаю, как решить" : formatStudentAnswer(question, answers[question.id]);
      const status = dontKnow[question.id] ? "Не знаю" : question.check(answers[question.id] ?? "") ? "Правильно" : "Неправильно";
      return `<tr><td>${question.id}</td><td>${escapeHtml(question.topic)}</td><td>${escapeHtml(studentAnswer)}</td><td>${escapeHtml(question.correctLabel)}</td><td>${status}</td></tr>`;
    }).join("");
    const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Результат диагностики</title><style>body{font-family:Arial,sans-serif;max-width:1000px;margin:40px auto;padding:0 20px;color:#28222c}h1{color:#674fa6}pre{white-space:pre-wrap;background:#f6f1fa;padding:20px;border-radius:16px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #ddd;text-align:left;vertical-align:top}@media print{button{display:none}}</style><body><h1>Что повторить перед 6 классом?</h1><pre>${escapeHtml(reportText())}</pre><h2>Все задания</h2><table><tr><th>№</th><th>Тема</th><th>Ответ ученика</th><th>Правильный ответ</th><th>Статус</th></tr>${rows}</table><button onclick="window.print()">Печать / сохранить как PDF</button></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `Перед_6_классом_${studentName.trim().replace(/\s+/g, "_") || "ученик"}.html`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (screen === "test") {
    const question = questions[current];
    const answer = answers[question.id] ?? (question.type === "multi" ? [] : "");
    const hasAnswer = hasAnswerFor(question);
    const goNext = () => {
      if (!hasAnswer) return;
      if (current === questions.length - 1) setScreen("review"); else setCurrent((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return <main className="test-shell">
      <header className="site-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Начать сначала</button></header>
      <section className="test-wrap">
        <div className="progress-line"><div><span>Задание {current + 1} из {questions.length}</span><small>{answeredCount} ответов сохранено</small></div><strong>{Math.round(((current + 1) / questions.length) * 100)}%</strong></div>
        <div className="progress-track"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }}/></div>
        <nav className="question-number-nav" aria-label="Переход по заданиям">
          {questions.map((item, index) => {
            const stateClass = dontKnow[item.id] ? "unknown" : answerHasContent(item, answers[item.id]) ? "answered" : "empty";
            return <button type="button" className={`${stateClass} ${index === current ? "current" : ""}`} key={item.id} onClick={() => { setCurrent(index); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{item.id}</button>;
          })}
        </nav>
        <article className="question-card">
          <p className="question-eyebrow">{question.eyebrow}</p><h1>{question.prompt}</h1>
          {question.expression && <div className="expression"><MathFormula expression={question.expression}/></div>}
          {question.type === "table" && <div className="data-table" role="table">{[["Понедельник","18 страниц"],["Вторник","25 страниц"],["Среда","17 страниц"],["Четверг","30 страниц"]].map(([day,pages]) => <div role="row" key={day}><span role="cell">{day}</span><b role="cell">{pages}</b></div>)}</div>}
          {(question.type === "text" || question.type === "table") && <label className="answer-field"><span>Твой ответ</span><input inputMode={question.block === "Обыкновенные дроби" ? "text" : "decimal"} autoFocus value={dontKnow[question.id] ? "" : typeof answer === "string" ? answer : ""} onChange={(event) => updateAnswer(question.id, event.target.value)} placeholder="Введи ответ" onKeyDown={(event) => { if (event.key === "Enter" && hasAnswer) goNext(); }}/></label>}
          {question.type === "choice" && <div className="options">{question.options?.map((option) => <button type="button" className={`option ${answer === option ? "selected" : ""}`} key={option} onClick={() => updateAnswer(question.id, option)}><span className="radio-dot"/>{option}</button>)}</div>}
          {question.type === "multi" && <div className="number-options">{question.options?.map((option) => { const selected = Array.isArray(answer) && answer.includes(option); return <button type="button" className={selected ? "selected" : ""} key={option} onClick={() => updateAnswer(question.id, selected ? (answer as string[]).filter((item) => item !== option) : [...(answer as string[]), option])}>{option}</button>; })}</div>}
          {question.type === "double" && <div className="double-fields">{question.fields?.map((field, index) => { const parts = typeof answer === "string" ? answer.split("|") : ["",""]; return <label className="answer-field" key={field.key}><span>{field.label}</span><div className="input-with-suffix"><input inputMode="numeric" value={dontKnow[question.id] ? "" : parts[index] || ""} onChange={(event) => { const next = [...parts]; next[index] = event.target.value; updateAnswer(question.id, next.join("|")); }} placeholder="Ответ"/><b>{field.suffix}</b></div></label>; })}</div>}
          {question.hint && <p className="field-hint">{question.hint}</p>}
          <div className="test-actions"><button className="button secondary" disabled={current === 0} onClick={() => { setCurrent((value) => value - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>← Назад</button><button className={`button dont-know-button ${dontKnow[question.id] ? "active-dont-know" : ""}`} onClick={() => markUnknown(question)}>{dontKnow[question.id] ? "Отмечено: не знаю" : "Не знаю, как решить"}</button><button className="button primary" disabled={!hasAnswer} onClick={goNext}>{current === questions.length - 1 ? "К обзору" : "Далее"} →</button></div>
        </article>
        <p className="save-note">Ответы и прогресс сохраняются на этом устройстве автоматически</p>
      </section>
    </main>;
  }

  if (screen === "review") {
    const missing = questions.filter((question) => !hasAnswerFor(question));
    const markMissingUnknown = () => {
      setDontKnow((previous) => { const next = { ...previous }; missing.forEach((question) => { next[question.id] = true; }); return next; });
      setAnswers((previous) => { const next = { ...previous }; missing.forEach((question) => { next[question.id] = question.type === "multi" ? [] : ""; }); return next; });
    };
    const finish = () => { if (!window.confirm("После завершения изменить ответы будет нельзя. Узнать результат?")) return; setScreen("result"); localStorage.removeItem(STORAGE_KEY); window.scrollTo({ top: 0, behavior: "smooth" }); };
    return <main className="result-page review-overview"><header className="compact-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a></header><section className="result-section overview-heading"><p className="kicker">Перед завершением</p><h1>Обзор всех 20 заданий</h1><p>{missing.length ? `Без ответа осталось: ${missing.length}. Вернись к ним или засчитай как «Не знаю, как решить».` : "Все задания заполнены или отмечены как «Не знаю, как решить»."}</p></section><section className="result-section overview-grid">{questions.map((question, index) => { const stateClass = dontKnow[question.id] ? "unknown" : answerHasContent(question, answers[question.id]) ? "answered" : "empty"; return <button className={`overview-item ${stateClass}`} key={question.id} onClick={() => { setCurrent(index); setScreen("test"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><b>№{question.id}</b></button>; })}</section><section className="result-section review-finish">{missing.length > 0 && <button className="button secondary" onClick={markMissingUnknown}>Засчитать пропуски как «Не знаю»</button>}<button className="button primary" disabled={missing.length > 0} onClick={finish}>Узнать результат</button></section></main>;
  }

  if (screen === "result") {
    const copy = resultCopy(score);
    const blocks = [...new Set(questions.map((question) => question.block))];
    const strongTopics = questions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).map((question) => question.topic);
    const missed = questions.filter((question) => !question.check(answers[question.id] ?? ""));
    const telegramMessage = encodeURIComponent(`Здравствуйте! Меня зовут ${studentName.trim()}. Результат моей диагностики перед 6 классом — ${score} из ${questions.length}. Хочу обсудить план повторения.`);
    const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${telegramMessage}`;
    return <main className="result-page">
      <header className="compact-header result-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="text-button" onClick={restart}>Пройти ещё раз</button></header>
      <section className="result-hero"><div className="score-orbit"><strong>{score}</strong><span>из 20</span></div><div><p className="kicker">Диагностика завершена</p><h1>{studentName.trim()}, {copy.title.toLowerCase()}</h1><p>{copy.text}</p><small>{copy.extra}</small></div></section>
      <section className="result-section result-stats oge-stats"><article><strong>{score}/{questions.length}</strong><span>правильных ответов</span></article><article><strong>{unknownCount}</strong><span>«не знаю»</span></article><article><strong>{questions.length - score - unknownCount}</strong><span>ошибок</span></article></section>
      <section className="result-section"><div className="section-heading"><div><p className="kicker">Персональный разбор</p><h2>{studentName.trim()}, вот твой результат по темам</h2></div><span>Рекомендации только по твоим ответам</span></div><div className="block-results">{blocks.map((block) => { const blockQuestions = questions.filter((question) => question.block === block); const correct = blockQuestions.filter((question) => !dontKnow[question.id] && question.check(answers[question.id] ?? "")).length; const ratio = correct / blockQuestions.length; const isSingle = blockQuestions.length === 1; const status = ratio === 1 ? "Получается отлично" : isSingle ? "Стоит проверить тему" : ratio >= 0.5 ? "Стоит немного повторить" : "Важно восстановить"; return <article className={`block-card ${ratio === 1 ? "great" : ratio >= 0.5 ? "medium" : "restore"}`} key={block}><div className="block-topline"><span>{correct}/{blockQuestions.length}</span><b>{status}</b></div><h3>{block}</h3><p>{ratio === 1 ? "Здесь всё уверенно — можно двигаться дальше." : isSingle ? "В этом задании возникла трудность — стоит ещё раз проверить тему." : blockCopy[block]}</p></article>; })}</div></section>
      <section className="result-section split-result"><article className="topic-panel strong-panel"><p className="kicker">Сильные темы</p><h2>Уже получается</h2><div className="topic-tags">{strongTopics.map((topic) => <span key={topic}>✓ {topic}</span>)}{!strongTopics.length && <p>Сейчас важнее спокойно восстановить базу — начнём с главного.</p>}</div></article><article className="topic-panel repeat-panel"><p className="kicker">{missed.length ? "Точки роста" : "Можно двигаться дальше"}</p><h2>{missed.length ? "Что повторить" : "Тем для обязательного повторения нет"}</h2><div className="topic-tags">{missed.length ? missed.map((question) => <span key={question.id}>{question.topic}</span>) : <p>Все задания выполнены правильно. Можно переходить к новым темам 6 класса без повторения всей программы.</p>}</div></article></section>
      <section className="result-section"><div className="section-heading"><div><p className="kicker">Все задания</p><h2>Посмотри ответы и статусы</h2></div></div><div className="overview-grid result-overview-grid">{questions.map((question) => { const isCorrect = !dontKnow[question.id] && question.check(answers[question.id] ?? ""); const stateClass = dontKnow[question.id] ? "unknown" : isCorrect ? "correct" : "wrong"; return <details className={`overview-item result-answer-item ${stateClass}`} key={question.id}><summary><b>№{question.id}</b><span>{dontKnow[question.id] ? "Не знаю" : isCorrect ? "Правильно" : "Неправильно"}</span></summary><div><p><b>Тема:</b> {question.topic}</p><p><b>Твой ответ:</b> {dontKnow[question.id] ? "Не знаю, как решить" : formatStudentAnswer(question, answers[question.id])}</p><p><b>Правильный ответ:</b> {question.correctLabel}</p></div></details>; })}</div></section>
      <section className="final-cta"><div><p className="kicker">Следующий шаг</p><h2>Хочешь повторить математику без стресса?</h2><p>{copy.card}</p></div><div className="cta-actions"><button className="button secondary" onClick={() => copyResult()}>Скопировать результат</button><button className="button secondary" onClick={downloadResult}>Скачать результат</button><a className="button primary" href={telegramUrl} target="_blank" rel="noreferrer" onClick={() => copyResult("Результат скопирован. Вставь его в сообщение")}>{copy.cta}</a><button className="button secondary" onClick={restart}>Пройти тест ещё раз</button></div>{toast && <p className="copy-toast" role="status">{toast}</p>}{copyFallback && <div className="copy-fallback"><textarea readOnly value={copyFallback}/><button className="button secondary" onClick={() => copyResult()}>Скопировать вручную</button></div>}</section>
    </main>;
  }

  return <main className="home-page"><header className="site-header"><a className="brand" href="/"><span className="brand-mark">∿</span><span>Математика без стресса</span></a><button className="header-cta" onClick={start} disabled={!studentName.trim() || !accepted}>Начать диагностику</button></header><section className="hero"><div className="hero-copy"><div className="soft-pill">Бесплатная диагностика перед учебным годом</div><h1>Что повторить<br/>перед <em>6 классом?</em></h1><p className="hero-lead">Пройди небольшую диагностику и узнай, какие темы 5 класса ты помнишь, а что стоит освежить перед новым учебным годом.</p><div className="calm-note"><span>♡</span><p>Это не контрольная и не экзамен. Здесь нет оценок — только понятный результат и рекомендации.</p></div><div className="name-start-card"><label htmlFor="student-name">Как тебя зовут?</label><input id="student-name" type="text" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Введи имя" autoComplete="given-name"/><div className="start-guidance"><h2>Перед началом</h2><ul><li>Приготовь лист бумаги для вычислений.</li><li>Выполняй задания самостоятельно, без калькулятора, учебника и подсказок.</li><li>Строгого ограничения времени нет.</li><li>Не стирай неудачные попытки — они помогают увидеть, что стоит повторить.</li><li>Если не знаешь ответ, нажми «Не знаю, как решить».</li></ul><label className="consent-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)}/><span>Я прочитал(а) рекомендации и готов(а) начать</span></label></div><button className="button primary big" onClick={start} disabled={!studentName.trim() || !accepted}>Начать диагностику <span>→</span></button><p className="name-start-meta"><b>20 заданий</b><span>·</span> около 20 минут <span>·</span> результат сразу</p></div></div><MathDoodle/></section><section className="how"><div className="section-heading home-heading"><div><p className="kicker">Всё просто</p><h2>Как это работает</h2></div><p>Без регистрации, калькулятора и лишнего волнения</p></div><div className="steps">{[["01","Решаешь задания","20 коротких заданий по основным темам 5 класса.","violet"],["02","Получаешь результат","Сразу видишь, что уже получается уверенно.","blue"],["03","Знаешь, что повторить","Получаешь рекомендации именно по своим ошибкам.","pink"]].map(([number,title,text,color]) => <article className={`step-card ${color}`} key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="tip"><span>✦</span><p><b>Небольшой совет:</b> постарайся решить задания самостоятельно. Так рекомендации получатся точнее.</p></div></section><section className="class-section"><div className="section-heading"><div><p className="kicker">Диагностики</p><h2>Выбери свой класс</h2></div><p>Выбирай диагностику по следующему учебному этапу</p></div><div className="class-grid"><button className="class-card active" onClick={start}><span>Доступно сейчас</span><b>Перехожу в 6 класс</b><i>Программа 5 класса →</i></button><a className="class-card active grade-seven-card" href="/7"><span>Доступно сейчас</span><b>Перехожу в 7 класс</b><i>Программа 6 класса →</i></a><a className="class-card active grade-eight-card" href="/8"><span>Доступно сейчас</span><b>Перехожу в 8 класс</b><i>Программа 7 класса →</i></a><a className="class-card active" href="/9"><span>Доступно сейчас</span><b>Перехожу в 9 класс</b><i>Программа 8 класса →</i></a><a className="class-card active" href="/oge"><span>Доступно сейчас</span><b>Начинаю подготовку к ОГЭ</b><i>Входная диагностика →</i></a><a className="class-card active after-nine-card" href="/after9"><span>Доступно сейчас</span><b>Перед 10 классом или колледжем</b><i>Программа 5–9 классов →</i></a>{[5,10,11].map((grade) => <div className="class-card soon" key={grade}><span>Скоро</span><b>Перехожу в {grade} класс</b><i>Диагностика готовится</i></div>)}<div className="class-card soon college"><span>Скоро</span><b>Учусь в колледже</b><i>Диагностика готовится</i></div></div></section><footer><div className="brand"><span className="brand-mark">∿</span><span>Математика без стресса</span></div><p>Проверяем знания, а не ставим оценки ♡</p></footer></main>;
}
