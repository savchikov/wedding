// ============================
// Таймер обратного отсчета
// ============================

// Целевая дата и время свадьбы
const targetDate = new Date("2026-07-24T14:20:00").getTime();

// Обновляем каждую секунду
setInterval(()=>{
  const now = new Date().getTime();          // Текущее время
  const dist = targetDate - now;             // Разница во времени до события
  if(dist<=0)return;                         // Если время прошло — останавливаем

  // Вычисляем дни, часы, минуты, секунды
  document.getElementById('days').textContent = Math.floor(dist/(1000*60*60*24));
  document.getElementById('hours').textContent = Math.floor((dist%(1000*60*60*24))/(1000*60*60));
  document.getElementById('minutes').textContent = Math.floor((dist%(1000*60*60))/(1000*60));
  document.getElementById('seconds').textContent = Math.floor((dist%(1000*60))/1000);
},1000);


// ============================
// Функция для открытия/закрытия бокового меню
// ============================
function toggleMenu(){
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
}


// ============================
// Управление музыкой
// ============================

const music = document.getElementById('bgMusic'); // Тег <audio>
const btn = document.getElementById('musicBtn');  // Кнопка в интерфейсе
const icon = document.getElementById('iconSound');// Иконка (SVG)

// Функция смены иконки (звук вкл/выкл)
function setIcon(isOn){
  if(isOn){
    icon.innerHTML = `
      <polygon points="3,9 9,9 13,5 13,19 9,15 3,15"/>
      <path d="M16 8a5 5 0 0 1 0 8"/>
    `;
  } else {
    icon.innerHTML = `
      <polygon points="3,9 9,9 13,5 13,19 9,15 3,15"/>
      <line x1="15" y1="9" x2="21" y2="15" />
      <line x1="21" y1="9" x2="15" y2="15" />
    `;
  }
}

// Анимация плавного изменения громкости
let fadeReq = null;
function fadeTo(targetVolume, duration = 600, done){
  try { music.muted = false; } catch(e){}
  const startVol = Math.max(0, Math.min(1, music.volume || 0)); // стартовая громкость
  const start = performance.now();
  if (fadeReq) cancelAnimationFrame(fadeReq);

  function step(ts){
    const t = Math.min(1, (ts - start) / duration); // прогресс от 0 до 1
    const v = startVol + (targetVolume - startVol) * t; // новое значение громкости
    music.volume = Math.max(0, Math.min(1, v));
    if (t < 1){
      fadeReq = requestAnimationFrame(step);
    } else {
      music.volume = Math.max(0, Math.min(1, targetVolume));
      if (done) done(); // вызываем колбэк, если есть
    }
  }
  fadeReq = requestAnimationFrame(step);
}

// Включение музыки с плавным нарастанием
async function playWithFade(){
  try{
    music.volume = 0;
    music.muted = false;
    await music.play();
    fadeTo(1, 600); // плавно до 100% громкости
    setIcon(true);
    localStorage.setItem("music","on"); // сохраняем состояние
  }catch(e){
    setIcon(false);
    localStorage.setItem("music","off");
  }
}

// Пауза музыки с плавным затуханием
function pauseWithFade(){
  fadeTo(0, 500, ()=>{
    try { music.pause(); } catch(e){}
    music.muted = true;
  });
  setIcon(false);
  localStorage.setItem("music","off");
}

// Обработчик кнопки (вкл/выкл музыку)
btn.addEventListener("click", ()=>{
  const isPlaying = !music.paused && !music.ended && music.currentTime > 0 && !music.muted && music.volume > 0.01;
  if (isPlaying){
    pauseWithFade();
  } else {
    playWithFade();
  }
});

// При загрузке страницы восстанавливаем состояние из localStorage
window.addEventListener("load", ()=>{
  const saved = localStorage.getItem("music");
  if(saved === "on"){
    playWithFade();
  } else {
    setIcon(false);
    music.muted = true;
    music.volume = 0;
  }
});

// Первый клик по странице (некоторые браузеры требуют взаимодействия для воспроизведения звука)
document.addEventListener("click", function onFirstClick(){
  if(localStorage.getItem("music") === "on" && (music.paused || music.muted)){
    playWithFade();
  }
  document.removeEventListener("click", onFirstClick);
}, { once: true });


// ============================
// Слайдер для дресс-кода
// ============================

let currentSlide = 0;
const slides = document.querySelectorAll('.dress-slide');
const slidesContainer = document.querySelector('.dress-slides');

// Переключение на нужный слайд
function showSlide(index) {
  if (index >= slides.length) currentSlide = 0;         // Если конец – возвращаемся к первому
  else if (index < 0) currentSlide = slides.length - 1; // Если меньше нуля – последний
  else currentSlide = index;
  
  slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Кнопки "влево" и "вправо"
document.querySelector('.prev-btn').addEventListener('click', () => showSlide(currentSlide - 1));
document.querySelector('.next-btn').addEventListener('click', () => showSlide(currentSlide + 1));

// Автоперелистывание каждые 5 секунд
setInterval(() => showSlide(currentSlide + 1), 5000);


// ============================
// Добавление события в календарь (.ics файл)
// ============================

document.getElementById('addToCalendar').addEventListener('click', function() {
  const event = {
    title: 'Свадьба Артёма и Елизаветы',
    start: '2026-07-24T14:20:00',
    end: '2026-07-24T22:00:00',
    address: 'Большая Монетная ул., 17, Санкт-Петербург',
    description: 'Приглашение на свадьбу Артёма и Елизаветы'
  };
  
  // Формируем содержимое .ics файла
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DTSTART:${event.start.replace(/[-:]/g, '')}`, // убираем лишние символы
    `DTEND:${event.end.replace(/[-:]/g, '')}`,
    `LOCATION:${event.address}`,
    `DESCRIPTION:${event.description}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
  
  // Скачиваем файл
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Свадьба_Артема_и_Елизаветы.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  let opened = false;

  function openPreloader() {
    if (opened) return;
    opened = true;
    
    // Добавляем анимацию исчезновения
    preloader.style.opacity = "0";
    preloader.style.transition = "opacity 0.8s ease, visibility 0.8s ease";
    
    setTimeout(() => {
      preloader.style.visibility = "hidden";
    }, 800);
  }

  // Открытие по клику
  preloader.addEventListener('click', openPreloader);
  
  // Автоматическое открытие через 10 секунд
  setTimeout(() => {
    if (!opened) openPreloader();
  }, 10000);
});
// ============================
// Кнопка построения маршрута (с выбором)
// ============================

document.getElementById('routeBtn').addEventListener('click', function() {
  const address = 'Большая Монетная ул., 17, Санкт-Петербург';
  const encodedAddress = encodeURIComponent(address);
  const modal = document.getElementById('routeModal');
  
  // Показываем модальное окно
  modal.style.display = 'flex';
  
  // Добавляем обработчики для кнопок
  modal.querySelector('.yandex-btn').addEventListener('click', function() {
    window.open(`https://yandex.ru/maps/?rtext=~${encodedAddress}`, '_blank');
    hideModal();
  });
  
  modal.querySelector('.google-btn').addEventListener('click', function() {
    window.open(`https://www.google.com/maps/dir//${encodedAddress}`, '_blank');
    hideModal();
  });
  
  modal.querySelector('.dgis-btn').addEventListener('click', function() {
    window.open(`https://2gis.ru/spb/search/${encodedAddress}`, '_blank');
    hideModal();
  });
  
  modal.querySelector('.cancel-btn').addEventListener('click', function() {
    hideModal();
  });
  
  // Функция скрытия модального окна
  function hideModal() {
    modal.style.display = 'none';
    document.removeEventListener('keydown', closeOnEscape);
  }
  
  // Закрытие по клику на затемненную область
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      hideModal();
    }
  });
  
  // Закрытие по клавише Escape
  function closeOnEscape(e) {
    if (e.key === 'Escape') {
      hideModal();
    }
  }
  
  document.addEventListener('keydown', closeOnEscape);
});

// ============================
// Подсказки для цветовой палитры
// ============================

document.addEventListener('DOMContentLoaded', function() {
  const colorCircles = document.querySelectorAll('.dress-colors div');
  
  // Обработчик для наведения на десктопах
  colorCircles.forEach(circle => {
    // Для мобильных устройств - обработка клика
    circle.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) { // Только на мобильных
        e.preventDefault();
        // Сначала скрываем все подсказки
        colorCircles.forEach(c => c.classList.remove('active'));
        // Показываем подсказку для текущего элемента
        this.classList.add('active');
        
        // Скрываем подсказку через 2 секунды
        setTimeout(() => {
          this.classList.remove('active');
        }, 2000);
      }
    });
    
    // Скрываем подсказку при клике вне кружка на мобильных
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768 && !e.target.closest('.dress-colors div')) {
        colorCircles.forEach(c => c.classList.remove('active'));
      }
    });
  });
});