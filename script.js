// ============================
// Редирект из Telegram в браузер
// ============================

(function() {
  // Проверяем, открыт ли сайт в Telegram WebView
  if (window.TelegramWebview) {
    const url = window.location.href;
    const chromeUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`;
    window.location.href = chromeUrl;
  }
})();

// ============================
// Таймер обратного отсчета
// ============================

// Целевая дата и время свадьбы
const targetDate = new Date("2026-07-24T14:20:00").getTime();

// Обновляем каждую секунду
setInterval(() => {
  const now = new Date().getTime();          // Текущее время
  const dist = targetDate - now;             // Разница во времени до события
  if (dist <= 0) return;                     // Если время прошло — останавливаем

  // Вычисляем дни, часы, минуты, секунды
  document.getElementById('days').textContent = Math.floor(dist / (1000 * 60 * 60 * 24));
  document.getElementById('hours').textContent = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  document.getElementById('minutes').textContent = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
  document.getElementById('seconds').textContent = Math.floor((dist % (1000 * 60)) / 1000);
}, 1000);

// ============================
// Функция для открытия/закрытия бокового меню
// ============================
function toggleMenu() {
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
function setIcon(isOn) {
  if (isOn) {
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
function fadeTo(targetVolume, duration = 600, done) {
  try { music.muted = false; } catch (e) { }
  const startVol = Math.max(0, Math.min(1, music.volume || 0)); // стартовая громкость
  const start = performance.now();
  if (fadeReq) cancelAnimationFrame(fadeReq);

  function step(ts) {
    const t = Math.min(1, (ts - start) / duration); // прогресс от 0 до 1
    const v = startVol + (targetVolume - startVol) * t; // новое значение громкости
    music.volume = Math.max(0, Math.min(1, v));
    if (t < 1) {
      fadeReq = requestAnimationFrame(step);
    } else {
      music.volume = Math.max(0, Math.min(1, targetVolume));
      if (done) done(); // вызываем колбэк, если есть
    }
  }
  fadeReq = requestAnimationFrame(step);
}

// Включение музыки с плавным нарастанием
async function playWithFade() {
  try {
    music.volume = 0;
    music.muted = false;
    await music.play();
    fadeTo(1, 600); // плавно до 100% громкости
    setIcon(true);
    localStorage.setItem("music", "on"); // сохраняем состояние
  } catch (e) {
    setIcon(false);
    localStorage.setItem("music", "off");
  }
}

// Пауза музыки с плавным затуханием
function pauseWithFade() {
  fadeTo(0, 500, () => {
    try { music.pause(); } catch (e) { }
    music.muted = true;
  });
  setIcon(false);
  localStorage.setItem("music", "off");
}

// Обработчик кнопки (вкл/выкл музыку)
btn.addEventListener("click", () => {
  const isPlaying = !music.paused && !music.ended && music.currentTime > 0 && !music.muted && music.volume > 0.01;
  if (isPlaying) {
    pauseWithFade();
  } else {
    playWithFade();
  }
});

// При загрузке страницы восстанавливаем состояние из localStorage
window.addEventListener("load", () => {
  const saved = localStorage.getItem("music");
  if (saved === "on") {
    playWithFade();
  } else {
    setIcon(false);
    music.muted = true;
    music.volume = 0;
  }
});

// Первый клик по странице (некоторые браузеры требуют взаимодействия для воспроизведения звука)
document.addEventListener("click", function onFirstClick() {
  if (localStorage.getItem("music") === "on" && (music.paused || music.muted)) {
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
//setInterval(() => showSlide(currentSlide + 1), 5000);


// ============================
// Свайп для мобильных устройств (dress-slider)
// ============================
const slider = document.querySelector('.dress-slides');
let startX = 0;
let isDragging = false;

slider.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

slider.addEventListener('touchend', (e) => {
  if (!isDragging) return;
  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;

  if (Math.abs(diff) > 50) { // Минимальная длина свайпа
    if (diff > 0) {
      showSlide(currentSlide - 1); // свайп вправо
    } else {
      showSlide(currentSlide + 1); // свайп влево
    }
  }
  isDragging = false;
});


// ============================
// Добавление события в календарь (.ics файл)
// ============================

document.getElementById('addToCalendar').addEventListener('click', function () {
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

// ============================
// Обработка прелоадера (заставки)
// ============================
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

/// ============================
// Кнопка построения маршрута (с выбором)
// ============================

let closeOnEscape = null; // Выносим наружу

function showRouteModal(address, locationType) {
  const modal = document.getElementById('routeModal');
  
  modal.style.display = 'flex';
  
  // Упрощаем логику обработчиков
  const buttons = modal.querySelectorAll('.route-modal-btn');
  buttons.forEach(btn => {
    btn.onclick = function() {
      let url = '';
      
      if (this.classList.contains('yandex-btn')) {
        if (locationType === 'загс') {
          url = 'https://yandex.ru/maps/-/CLAQB6I-';
        } else if (locationType === 'ресторан') {
          url = 'https://yandex.ru/maps/-/CLuerL3S';
        }
      } else if (this.classList.contains('google-btn')) {
        if (locationType === 'загс') {
          url = 'https://maps.app.goo.gl/4Dg7xoxNkDB89YqEA';
        } else if (locationType === 'ресторан') {
          url = 'https://maps.app.goo.gl/oeKhRvd7AcQuPfgt9';
        }
      } else if (this.classList.contains('dgis-btn')) {
        if (locationType === 'загс') {
          url = 'https://go.2gis.com/MeDDk';
        } else if (locationType === 'ресторан') {
          url = 'https://go.2gis.com/xxT8s';
        }
      }
      
      if (url) {
        window.open(url, '_blank');
      }
      hideModal();
    };
  });
  
  // Закрытие по клику на затемненную область
  modal.onclick = function(e) {
    if (e.target === modal) hideModal();
  };
  
  // Закрытие по Escape
  closeOnEscape = function(e) {
    if (e.key === 'Escape') hideModal();
  };
  document.addEventListener('keydown', closeOnEscape);
}

function hideModal() {
  const modal = document.getElementById('routeModal');
  modal.style.display = 'none';
  document.removeEventListener('keydown', closeOnEscape);
}

// ИСПРАВЛЕННЫЙ обработчик для кнопок
document.querySelectorAll('.small-btn').forEach(button => {
  button.addEventListener('click', function() {
    const location = this.getAttribute('data-location');
    
    if (location === 'Ресторан') {
      showRouteModal('Ленинградская область, Гатчинский муниципальный округ, Сусанинское сельское поселение', 'ресторан');
    } else {
      showRouteModal('Большая Монетная ул., 17, Санкт-Петербург', 'загс');
    }
  });
});

// ============================
// Подсказки для цветовой палитры
// ============================

document.addEventListener('DOMContentLoaded', function () {
  const colorCircles = document.querySelectorAll('.dress-colors div');

  // Обработчик для наведения на десктопах
  colorCircles.forEach(circle => {
    // Для мобильных устройств - обработка клика
    circle.addEventListener('click', function (e) {
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
    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 768 && !e.target.closest('.dress-colors div')) {
        colorCircles.forEach(c => c.classList.remove('active'));
      }
    });
  });
});

// Функция отправки данных в Telegram
async function sendToTelegram(formData) {
  try {
    // Формируем текст сообщения
    const text = `
💌 <b>Новое подтверждение присутствия</b> 💌

👤 Имя: <b>${formData.name}</b>
👥 Количество гостей: <b>${formData.guests}</b>
🎉 Присутствие: <b>${formData.attendance === 'yes' ? '✅ Да' : '❌ Нет'}</b>
📝 Пожелания: ${formData.message && formData.message.trim() !== '' ? formData.message : '—'}
    `.trim();

    // Отправляем запрос к Telegram API
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });

    // Проверяем статус ответа
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка Telegram API:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error);
    return false;
  }
}

// Функция инициализации формы
function initForm() {
  const form = document.getElementById('attendanceForm');
  
  if (!form) {
    console.error('Форма не найдена!');
    return;
  }

  // Обработка отправки формы
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('formMessage');
    
    // Проверяем, что элементы существуют
    if (!submitBtn || !messageDiv) {
      console.error('Не найдены необходимые элементы формы');
      return;
    }
    
    // Получаем данные формы
    const nameInput = document.getElementById('name');
    const guestsSelect = document.getElementById('guests');
    const attendanceRadio = document.querySelector('input[name="attendance"]:checked');
    const messageTextarea = document.getElementById('message');
    
    // Проверяем обязательные поля
    if (!nameInput || !guestsSelect || !attendanceRadio) {
      messageDiv.textContent = 'Ошибка: не найдены необходимые поля формы';
      messageDiv.className = 'form-message error';
      messageDiv.style.display = 'block';
      return;
    }
    
    const formData = {
      name: nameInput.value.trim(),
      guests: guestsSelect.value,
      attendance: attendanceRadio.value,
      message: messageTextarea ? messageTextarea.value.trim() : ''
    };
    
    // Дополнительная валидация
    if (!formData.name) {
      messageDiv.textContent = 'Пожалуйста, введите ваше имя';
      messageDiv.className = 'form-message error';
      messageDiv.style.display = 'block';
      return;
    }
    
    if (!formData.guests) {
      messageDiv.textContent = 'Пожалуйста, выберите количество гостей';
      messageDiv.className = 'form-message error';
      messageDiv.style.display = 'block';
      return;
    }
    
    // Показываем состояние загрузки
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    messageDiv.style.display = 'none';
    
    try {
      // Отправляем данные в Telegram
      const success = await sendToTelegram(formData);
      
      if (success) {
        // Показываем сообщение об успехе
        messageDiv.textContent = 'Спасибо! Мы получили ваш ответ';
        messageDiv.className = 'form-message success';
        
        // Очищаем форму
        form.reset();

        // Конфетти и всплывающее сообщение над формой
        try {
          launchConfettiOver(form, 1200);
          showSuccessToast(form, 'Спасибо! Мы получили ваш ответ 💕');
        } catch (err) { /* no-op */ }
      } else {
        throw new Error('Ошибка отправки в Telegram');
      }
    } catch (error) {
      // Показываем сообщение об ошибке
      messageDiv.textContent = 'Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.';
      messageDiv.className = 'form-message error';
      console.error('Ошибка при обработке формы:', error);
    } finally {
      // Возвращаем кнопку в исходное состояние
      submitBtn.disabled = false;
      submitBtn.textContent = 'Подтвердить присутствие';
      messageDiv.style.display = 'block';
    }
  });

  // Валидация формы в реальном времени
  form.addEventListener('input', function(e) {
    const nameInput = document.getElementById('name');
    const guestsSelect = document.getElementById('guests');
    const attendanceRadio = document.querySelector('input[name="attendance"]:checked');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!nameInput || !guestsSelect || !submitBtn) return;
    
    // Проверяем, заполнены ли обязательные поля
    const isNameValid = nameInput.value.trim().length > 0;
    const isGuestsValid = guestsSelect.value !== '';
    const isAttendanceValid = attendanceRadio !== null;
    
    // Активируем/деактивируем кнопку отправки
    submitBtn.disabled = !(isNameValid && isGuestsValid && isAttendanceValid);
  });
}

// Инициализируем форму когда DOM полностью загружен
document.addEventListener('DOMContentLoaded', initForm);

// Дополнительная проверка на случай если DOM уже загружен
if (document.readyState !== 'loading') {
  initForm();
}

// ============================
// Confetti and success toast helpers
// ============================
function launchConfettiOver(anchorEl, durationMs = 1200) {
  if (!anchorEl) return;
  const rect = anchorEl.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  const parent = anchorEl.parentElement || document.body;
  canvas.style.position = 'absolute';
  canvas.style.left = rect.left + window.scrollX + 'px';
  canvas.style.top = rect.top + window.scrollY + 'px';
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 30;
  parent.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  function resize() {
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const cs = getComputedStyle(document.documentElement);
  const palette = [
    (cs.getPropertyValue('--primary') || '#EA785B').trim(),
    (cs.getPropertyValue('--secondary') || '#5F5420').trim(),
    '#FFD166', '#06D6A0', '#118AB2', '#EF476F'
  ];

  const pieces = Array.from({ length: 120 }).map(() => {
    const x = Math.random() * rect.width;
    const y = -10 - Math.random() * 40;
    const size = 6 + Math.random() * 8;
    const vy = 80 + Math.random() * 140;
    const vx = -60 + Math.random() * 120;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const shape = Math.random() < 0.6 ? 'circle' : 'triangle';
    const rot = Math.random() * Math.PI * 2;
    const vr = (-1 + Math.random() * 2) * 2;
    return { x, y, size, vy, vx, color, shape, rot, vr, life: 0 };
  });

  let running = true; const start = performance.now();
  function step(ts) {
    const dt = Math.min(50, ts - (step._last || ts));
    step._last = ts;
    const elapsed = ts - start;
    if (elapsed > durationMs) running = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.life += dt;
      p.x += p.vx * dt / 1000;
      p.y += p.vy * dt / 1000;
      p.vy += 300 * dt / 1000; // gravity
      p.vx *= 0.995;
      p.rot += p.vr * dt / 1000;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    if (running) requestAnimationFrame(step); else setTimeout(() => { try { canvas.remove(); } catch (e) {} }, 300);
  }
  requestAnimationFrame(step);
}

function showSuccessToast(anchorEl, text) {
  const container = anchorEl.closest('.attendance-form') || anchorEl.parentElement || document.body;
  const toast = document.createElement('div');
  toast.className = 'success-message';
  toast.textContent = text || 'Спасибо! Мы получили ваш ответ 💕';
  container.style.position = container.style.position || 'relative';
  container.appendChild(toast);
  setTimeout(() => { try { toast.remove(); } catch (e) {} }, 5000);
}

// ============================
// Scroll Reveal (IntersectionObserver)
// ============================
(function initScrollReveal() {
  try {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    const revealNodes = document.querySelectorAll('.reveal');
    revealNodes.forEach(el => observer.observe(el));

    // Progressive enhancement: if JS disabled, content remains visible (CSS default covers)
  } catch (e) {
    // Fallback: ensure elements are visible if IntersectionObserver not supported
    const revealNodes = document.querySelectorAll('.reveal');
    revealNodes.forEach(el => el.classList.add('visible'));
  }
})();

// ============================
// Hero background particles
// ============================
(function initHeroParticles() {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('heroParticles');
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const particles = [];
  // Use site palette (CSS variables)
  const cs = getComputedStyle(document.documentElement);
  const palette = [
    (cs.getPropertyValue('--primary') || '#EA785B').trim(),
    (cs.getPropertyValue('--secondary') || '#5F5420').trim(),
    (cs.getPropertyValue('--paper-edge') || '#EDBEE4').trim(),
    (cs.getPropertyValue('--light-text') || '#FFFFFF').trim()
  ];
  let lastTs = 0;
  let running = true;

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    const color = palette[Math.floor(Math.random() * palette.length)] || '#FFFFFF';
    return {
      x: rand(0, width),
      y: rand(0, height),
      r: rand(1.2, 2.8),
      vx: rand(-10, 10),
      vy: rand(-6, 6),
      alpha: rand(0.35, 0.7),
      color,
      twinkleFreq: rand(0.5, 1.5)
    };
  }

  function ensureCount() {
    const target = Math.max(20, Math.min(40, Math.round((width * height) / 30000)));
    while (particles.length < target) particles.push(createParticle());
    if (particles.length > target) particles.length = target;
  }

  function update(dt, t) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * dt * 0.5;
      p.y += p.vy * dt * 0.5;
      // gentle wrap-around
      if (p.x < -5) p.x = width + 5; else if (p.x > width + 5) p.x = -5;
      if (p.y < -5) p.y = height + 5; else if (p.y > height + 5) p.y = -5;
      // twinkle alpha
      const tw = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * p.twinkleFreq + i));
      p.currentAlpha = p.alpha * tw;
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = p.currentAlpha || p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(ts) {
    if (!running) { lastTs = ts; requestAnimationFrame(loop); return; }
    const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000 || 0.016));
    lastTs = ts;
    const t = ts / 1000;
    update(dt, t);
    render();
    requestAnimationFrame(loop);
  }

  const io = new IntersectionObserver((entries) => {
    running = entries[0]?.isIntersecting !== false;
  }, { threshold: 0.01 });
  io.observe(hero);

  window.addEventListener('resize', () => { resize(); ensureCount(); });
  resize();
  ensureCount();
  requestAnimationFrame((ts) => { lastTs = ts; requestAnimationFrame(loop); });
})();

// 3D tilt effect removed per request
