// ===============================
// Essential Star — основной скрипт
// Новая версия с поддержкой тёмной темы и обновлённым дизайном
// ===============================

/* Инициализация Firebase Realtime Database. Данные проекта уже заданы,
   поэтому просто подключаемся и создаём ссылку на инвентаризацию. */
firebase.initializeApp({
  apiKey: "AIzaSyD_hUKXdMOB-vEoGwpdxRvL-Q0inphtSU4",
  authDomain: "last-dance-5915a.firebaseapp.com",
  projectId: "last-dance-5915a",
  storageBucket: "last-dance-5915a.firebasestorage.app",
  messagingSenderId: "883390850",
  appId: "1:883390850:web:60e49511ee7f8451c8f79b"
});

const db = firebase.database();
const inventoryRef = db.ref("inventory");
const HISTORY_RETENTION_DAYS = 90;
const HISTORY_PASSWORD = '1510';


// ===== ДАННЫЕ =====
const OILS_LIST = [
  'Аир','Анис','Апельсин','Базилик','Бензоин','Бергамот','Бэй','Ваниль','Вербена','Ветивер',
  'Гвоздика','Герань','Голубой лотос','Грейпфрут','Ель','Жасмин','Женьшень','Зелёный чай',
  'Имбирь','Иланг-иланг','Иссоп','Какао','Камфора','Каннабис','Кардамон','Каяпут','Кедр',
  'Кинза','Кипарис','Кориандр','Корица','Кофе','Куркума','Лаванда','Лавр','Ладан','Лайм',
  'Лемонграсс','Лилия','Лимон','Магнолия','Майоран','Мандарин','Мелисса','Мирра',
  'Можжевельник','Морковь','Мускатный орех','Мята','Нарцисс','Нероли','Орегано',
  'Пальмароза','Пачули','Петегрейн','Петрушка','Пижма','Пион','Пихта','Полынь','Помело',
  'Роза','Ромашка','Розмарин','Сандал','Сельдерей','Сосна','Стиракс','Табак','Тимьян',
  'Тмин','Укроп','Фенхель','Фрезия','Чайное дерево','Чеснок','Чёрный перец','Шафран',
  'Шалфей мускатный','Эвкалипт'
];

// Начальные значения. Изменены согласно новым требованиям:
//  - Масла имеют 2000 мл, 200 коробок и 3000 этикеток.
//  - Универсальные расходники (крышки, флакончики, инструкции) имеют 5000 шт.
const INITIAL_DATA = {
  universal: { caps: 5000, bottles: 5000, instructions: 5000, packets: 5000, bulkBoxes: 5000 },
  oils: OILS_LIST.reduce((acc, oil) => {
    acc[oil] = { ml: 2000, boxes: 200, labels: 3000 };
    return acc;
  }, {}),
  lastUpdated: new Date().toISOString()
};

// ===== СОСТОЯНИЕ =====
let inventoryData = null;
// Параметры сортировки по умолчанию
let currentSortField = 'ml';
let sortDescending = true;
// Состояние сворачивания списка масел
let oilsCollapsedState = null;

// ===== СЛУЖЕБНЫЕ ДАННЫЕ =====
// Иконки для универсальных расходников (используются эмодзи)
const SUPPLY_ICONS = {
  caps: '🧢',
  bottles: '🧴',
  instructions: '📄',
  packets: '🛍️',
  bulkBoxes: '📦'
};

const UNITS_PER_BULK_BOX = 25;

// Эмодзи для отображения рядом с названием каждого масла. Если масло отсутствует в списке,
// по умолчанию используется символ флакона. Это позволяет быстро визуально различать масла.
const OIL_EMOJIS = {
  'Апельсин': '🍊',
  'Мандарин': '🍊',
  'Лимон': '🍋',
  'Лайм': '🍋',
  'Грейпфрут': '🍊',
  'Бергамот': '🍋',
  'Лаванда': '💜',
  'Роза': '🌹',
  'Мята': '🌿',
  'Эвкалипт': '🌿',
  'Базилик': '🌿',
  'Анис': '⭐',
  'Ваниль': '🍦',
  'Гвоздика': '🌺',
  'Имбирь': '🫚',
  'Какао': '🍫',
  'Корица': '🍂',
  'Кориандр': '🌿',
  'Кардамон': '🌿',
  'Кофе': '☕',
  'Мускатный орех': '🥜',
  'Шафран': '🌼',
  'Лемонграсс': '🌿',
  'Бензоин': '🪵',
  'Кедр': '🌲',
  'Ель': '🌲',
  'Сосна': '🌲',
  'Мирра': '🪵',
  'Сандал': '🪵',
  'Ладан': '🪵',
  'Табак': '🚬',
  'Тимьян': '🌿',
  'Фенхель': '🌿',
  'Фрезия': '🌸',
  'Чайное дерево': '🍵',
  'Чеснок': '🧄',
  'Чёрный перец': '🌶',
  'Камфора': '🌿',
  'Каннабис': '🌿',
  'Куркума': '🌿',
  'Иссоп': '🌿',
  'Жасмин': '🌼',
  'Герань': '🌸',
  'Женьшень': '🌿',
  'Вербена': '🌿',
  'Пихта': '🌲',
  'Петрушка': '🌿',
  'Укроп': '🌿',
  'Шалфей мускатный': '🌿',
  'Стиракс': '🪵',
  'Куркума': '🌿'
};

// Сопоставление названий масел с файлами иконок. Для каждого эмодзи из OIL_EMOJIS
// указан соответствующий PNG‑файл из каталога oil_icons. Если масло не найдено в OIL_EMOJIS,
// будет использован файл по умолчанию (1f9b4.png — бутылочка).
const OIL_ICON_FILES = {
  '🍊': '1f34a.png', // апельсин, мандарин, грейпфрут, бергамот
  '🍋': '1f34b.png', // лимон, лайм
  '💜': '1f49c.png', // лаванда (фиолетовое сердце)
  '🌹': '1f339.png', // роза
  '🌿': '1f33f.png', // травы (мята, эвкалипт, базилик и др.)
  '⭐': '2b50.png', // звезда (анис)
  '🍦': '1f366.png', // ваниль (мороженое)
  '🌺': '1f33a.png', // гвоздика (цветок)
  '🫚': '1fad9.png', // имбирь
  '🍫': '1f36b.png', // какао (шоколад)
  '🍂': '1f342.png', // корица (лист)
  '☕': '2615.png', // кофе
  '🥜': '1f95c.png', // мускатный орех (арахис)
  '🌼': '1f33c.png', // шафран, жасмин (цветок)
  '🪵': '1fa93.png', // древесные масла (бензоин, мирра, сандал, стиракс и др.)
  '🌲': '1f332.png', // хвойные (кедр, ель, сосна, пихта)
  '🚬': '1f6ac.png', // табак
  '🌸': '1f338.png', // цветочные (фрезия, герань)
  '🍵': '1f375.png', // чай (чайное дерево)
  '🧄': '1f9c4.png', // чеснок
  '🌶': '1f336.png', // чёрный перец (перчик)
  '🧴': '1f9b4.png'  // по умолчанию — бутылочка
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  loadInventoryData();
  initializeEventListeners();

  // Настройка кнопки возврата вверх
  const scrollBtn = document.getElementById('scrollToTopBtn');
  if (scrollBtn) {
    // Показать или скрыть кнопку в зависимости от прокрутки
    window.addEventListener('scroll', () => {
      // Отображаем кнопку только когда прокрутка больше 400px
      if (window.pageYOffset > 400) {
        scrollBtn.classList.add('show');
      } else {
        scrollBtn.classList.remove('show');
      }
    });
    // Прокрутка вверх при клике
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// Настройка темы: применить сохранённое значение и привязать обработчик к кнопке
function setupTheme() {
  const savedTheme = localStorage.getItem('theme');
  const isDarkPreferred = savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('dark', isDarkPreferred);
  const themeToggleInput = document.getElementById('themeToggle');
  if (themeToggleInput) {
    // установить положение переключателя согласно текущей теме
    themeToggleInput.checked = isDarkPreferred;
    // слушать изменение состояния
    themeToggleInput.addEventListener('change', () => {
      const newDark = themeToggleInput.checked;
      document.body.classList.toggle('dark', newDark);
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
    });
  }
}

function updateThemeToggleIcon() {
  // функция больше не используется, так как переключатель темы реализован через ползунок
}

function getHistoryCutoffIso() {
  return new Date(Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function pruneHistoryEntries(entries = []) {
  const cutoff = Date.parse(getHistoryCutoffIso());
  return entries.filter(entry => {
    const ts = Date.parse(entry?.timestamp);
    return Number.isFinite(ts) && ts >= cutoff;
  });
}

function appendHistoryEntry(section, details) {
  if (!inventoryData) return;
  const nextEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    section,
    details,
    timestamp: new Date().toISOString()
  };
  const history = pruneHistoryEntries(Array.isArray(inventoryData.history) ? inventoryData.history : []);
  history.push(nextEntry);
  inventoryData.history = history;
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const history = pruneHistoryEntries(Array.isArray(inventoryData?.history) ? inventoryData.history : []);
  if (!history.length) {
    list.innerHTML = '<div class="history-empty">Пока нет записей об изменениях.</div>';
    return;
  }
  const sorted = history.slice().sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  list.innerHTML = sorted.map(entry => {
    const date = new Date(entry.timestamp);
    const dateText = Number.isFinite(date.getTime())
      ? date.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'medium' })
      : 'Неизвестная дата';
    const sectionLabel = entry.section === 'production' ? 'Производство' : 'Редактирование остатков';
    const sectionClass = entry.section === 'production' ? 'history-production' : 'history-edit';
    return `
      <div class="history-item ${sectionClass}">
        <div class="history-item-head">
          <span class="history-badge">${sectionLabel}</span>
          <span class="history-time">${dateText}</span>
        </div>
        <div class="history-details">${entry.details}</div>
      </div>
    `;
  }).join('');
}

// ===== ЗАГРУЗКА / СИНХРОНИЗАЦИЯ =====
function loadInventoryData() {
  inventoryRef.on("value", snapshot => {
    if (!snapshot.exists()) {
      inventoryData = JSON.parse(JSON.stringify(INITIAL_DATA));
      inventoryRef.set(inventoryData);
    } else {
      inventoryData = snapshot.val();
      normalizeInventoryData();
    }
    renderAll();
  });
}

function normalizeInventoryData() {
  if (!inventoryData.universal) {
    inventoryData.universal = {};
  }
  inventoryData.universal.caps = Number.isFinite(inventoryData.universal.caps) ? inventoryData.universal.caps : 0;
  inventoryData.universal.bottles = Number.isFinite(inventoryData.universal.bottles) ? inventoryData.universal.bottles : 0;
  inventoryData.universal.instructions = Number.isFinite(inventoryData.universal.instructions) ? inventoryData.universal.instructions : 0;
  inventoryData.universal.packets = Number.isFinite(inventoryData.universal.packets) ? inventoryData.universal.packets : 5000;
  inventoryData.universal.bulkBoxes = Number.isFinite(inventoryData.universal.bulkBoxes) ? inventoryData.universal.bulkBoxes : 5000;
  inventoryData.history = pruneHistoryEntries(Array.isArray(inventoryData.history) ? inventoryData.history : []);
}

// Сохранение данных и обновление времени
function saveInventoryData() {
  inventoryData.lastUpdated = new Date().toISOString();
  inventoryRef.set(inventoryData);
  showNotification('Данные сохранены и синхронизированы', 'success');
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function initializeEventListeners() {
  // Поиск по маслам
  document.getElementById('searchInput').addEventListener('input', () => {
    renderOilsTable();
  });
  // Настройка сортировки по столбцам
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (currentSortField === field) {
        // поменять направление сортировки
        sortDescending = !sortDescending;
      } else {
        currentSortField = field;
        sortDescending = true;
      }
      updateSortArrows();
      renderOilsTable();
    });
  });
  // Обработчики производства
  document.getElementById('productionOilSelect').addEventListener('change', updateProductionPreview);
  document.getElementById('productionQuantity').addEventListener('input', updateProductionPreview);
  document.getElementById('submitProduction').addEventListener('click', submitProduction);
  // Ручное редактирование
  document.getElementById('editOilSelect').addEventListener('change', () => {
    const oil = document.getElementById('editOilSelect').value;
    if (oil && inventoryData.oils[oil]) {
      document.getElementById('editOilMl').value = inventoryData.oils[oil].ml;
      document.getElementById('editOilBoxes').value = inventoryData.oils[oil].boxes;
      document.getElementById('editOilLabels').value = inventoryData.oils[oil].labels;
    }
  });
  // Новые кнопки редактирования и массового обновления
  const universalBtn = document.getElementById('applyUniversal');
  if (universalBtn) universalBtn.addEventListener('click', applyUniversalEdit);
  const oilBtn = document.getElementById('applyOilEdit');
  if (oilBtn) oilBtn.addEventListener('click', applySingleOilEdit);
  const batchBtn = document.getElementById('applyBatchOil');
  if (batchBtn) batchBtn.addEventListener('click', applyBatchOilEdit);
  // Сброс данных
  const resetBtn = document.getElementById('resetAll');
  if (resetBtn) resetBtn.addEventListener('click', resetAllData);

  // Авторизация для доступа к редактированию
  const editPasswordBtn = document.getElementById('editPasswordButton');
  const editPasswordInput = document.getElementById('editPasswordInput');
  if (editPasswordBtn && editPasswordInput) {
    editPasswordBtn.addEventListener('click', checkEditPassword);
    editPasswordInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        checkEditPassword();
      }
    });
  }

  // Сворачиваемый список масел
  const oilsToggle = document.getElementById('oilsToggle');
  const oilsCollapse = document.getElementById('oilsCollapse');
  const oilsArrow = document.getElementById('oilsArrow');
  if (oilsToggle && oilsCollapse && oilsArrow) {
    // Функция для применения состояния сворачивания/разворачивания
    function setOilsCollapsed(collapsed) {
      oilsCollapsedState = collapsed;
      if (collapsed) {
        // скрыть содержимое, повернуть стрелку
        oilsCollapse.style.maxHeight = '0px';
        oilsArrow.style.transform = 'rotate(-90deg)';
      } else {
        // установить высоту, соответствующую содержимому
        oilsCollapse.style.maxHeight = oilsCollapse.scrollHeight + 'px';
        oilsArrow.style.transform = 'rotate(0deg)';
      }
    }
    // Устанавливаем начальное состояние: свернуть на маленьких экранах (<768px), иначе развернуть
    oilsCollapsedState = window.innerWidth < 768;
    setOilsCollapsed(oilsCollapsedState);
    // При клике переключаем состояние
    oilsToggle.addEventListener('click', () => {
      setOilsCollapsed(!oilsCollapsedState);
    });
    // При изменении размера окна: если список раскрыт, обновить maxHeight под новую высоту
    window.addEventListener('resize', () => {
      if (!oilsCollapsedState) {
        oilsCollapse.style.maxHeight = oilsCollapse.scrollHeight + 'px';
      }
    });
  }

  // --- Элементы сортировки для мобильного интерфейса ---
  const sortFieldSelect = document.getElementById('sortField');
  const sortOrderBtn = document.getElementById('sortOrderBtn');
  if (sortFieldSelect) {
    sortFieldSelect.value = currentSortField;
    sortFieldSelect.addEventListener('change', () => {
      currentSortField = sortFieldSelect.value;
      // При изменении поля сортировки сохраняем предыдущее направление
      updateSortArrows();
      renderOilsTable();
      updateSortButton();
    });
  }
  if (sortOrderBtn) {
    // Устанавливаем начальное значение стрелки
    updateSortButton();
    sortOrderBtn.addEventListener('click', () => {
      sortDescending = !sortDescending;
      updateSortArrows();
      renderOilsTable();
      updateSortButton();
    });
  }

  // --- Пароль для доступа к вводу производства ---
  const productionPwdBtn = document.getElementById('productionPasswordButton');
  const productionPwdInput = document.getElementById('productionPasswordInput');
  if (productionPwdBtn && productionPwdInput) {
    productionPwdBtn.addEventListener('click', checkProductionPassword);
    productionPwdInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        checkProductionPassword();
      }
    });
  }

  const historyPwdBtn = document.getElementById('historyPasswordButton');
  const historyPwdInput = document.getElementById('historyPasswordInput');
  if (historyPwdBtn && historyPwdInput) {
    historyPwdBtn.addEventListener('click', checkHistoryPassword);
    historyPwdInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        checkHistoryPassword();
      }
    });
  }

  const mobileOpenBtn = document.getElementById('mobileProductionOpenBtn');
  const mobileCloseBtn = document.getElementById('mobileProductionCloseBtn');
  if (mobileOpenBtn) {
    mobileOpenBtn.addEventListener('click', () => toggleMobileProductionPopup(true));
  }
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', () => toggleMobileProductionPopup(false));
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      toggleMobileProductionPopup(false);
    }
  });
}

// ===== РЕНДЕР ВСЕХ КОМПОНЕНТОВ =====
function renderAll() {
  renderUniversalSupplies();
  renderStatistics();
  populateSelects();
  renderOilsTable();
  updateSortArrows();
  updateProductionPreview();
  renderHistory();
}

// Рендер универсальных расходников
function renderUniversalSupplies() {
  const container = document.getElementById('universalSupplies');
  const { caps, bottles, instructions, packets, bulkBoxes } = inventoryData.universal;
  // Максимальное значение для шкалы расходников — 5000 единиц
  const supplies = [
    { type: 'caps', name: 'Крышки', value: caps, max: 5000 },
    { type: 'bottles', name: 'Флакончики', value: bottles, max: 5000 },
    { type: 'instructions', name: 'Инструкции', value: instructions, max: 5000 },
    { type: 'packets', name: 'Пакетики', value: packets, max: 5000 },
    { type: 'bulkBoxes', name: 'Коробы', value: bulkBoxes, max: 5000 }
  ];
  container.innerHTML = supplies.map(item => {
    const percent = Math.min(100, (item.value / item.max) * 100);
    return `
      <div class="supply-item">
        <div class="supply-info">
          <div class="icon-box ${item.type}">${SUPPLY_ICONS[item.type]}</div>
          <div class="details">
            <div class="name">${item.name}</div>
            <div class="value">Остаток: ${item.value.toLocaleString()} шт</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="${item.type}-fill" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Рендер таблицы масел
function renderOilsTable() {
  const tbody = document.getElementById('oilsTableBody');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  let oils = Object.entries(inventoryData.oils);
  if (searchTerm) {
    oils = oils.filter(([name]) => name.toLowerCase().includes(searchTerm));
  }
  // Сортировка по выбранному полю
  oils.sort((aEntry, bEntry) => {
    const [nameA, a] = aEntry;
    const [nameB, b] = bEntry;
    let diff;
    switch (currentSortField) {
      case 'boxes':
        diff = a.boxes - b.boxes;
        break;
      case 'labels':
        diff = a.labels - b.labels;
        break;
      case 'name':
        diff = nameA.localeCompare(nameB);
        break;
      case 'ml':
      default:
        diff = a.ml - b.ml;
        break;
    }
    return sortDescending ? -diff : diff;
  });
  tbody.innerHTML = oils.map(([name, data]) => {
    const status = getStockStatus(data.ml, data.boxes, data.labels);
    // Определяем эмодзи и соответствующий файл иконки. Если масло не найдено в OIL_EMOJIS,
    // используем эмодзи бутылочки и файл по умолчанию.
    const emoji = OIL_EMOJIS[name] || '🧴';
    const iconFile = OIL_ICON_FILES[emoji] || '1f9b4.png';
    return `
      <tr class="${status.class}">
        <td data-label="Масло"><img src="oil_icons/${iconFile}" alt="${name}" class="oil-img-icon">${name}</td>
        <td data-label="Объём">${data.ml.toLocaleString()} мл</td>
        <td data-label="Коробки">${data.boxes.toLocaleString()}</td>
        <td data-label="Этикетки">${data.labels.toLocaleString()}</td>
        <td data-label="Статус"><span class="status-label">${status.text}</span></td>
        <td data-label="Действия"><button class="edit-button" onclick="editOil('${name}')" aria-label="Редактировать">✏️</button></td>
      </tr>
    `;
  }).join('');

  // Если список масел раскрыт, обновить высоту контейнера, чтобы учесть изменение содержимого
  const oilsCollapse = document.getElementById('oilsCollapse');
  if (oilsCollapse && typeof oilsCollapsedState !== 'undefined' && !oilsCollapsedState) {
    oilsCollapse.style.maxHeight = oilsCollapse.scrollHeight + 'px';
  }
}

// Рендер статистики
function renderStatistics() {
  const oils = Object.values(inventoryData.oils);
  const totalMl = oils.reduce((sum, oil) => sum + oil.ml, 0);
  // Подсчёт масел с низким и средним запасом. Пороговые значения определяются в getStockStatus().
  const lowStock = oils.filter(oil => {
    const status = getStockStatus(oil.ml, oil.boxes, oil.labels);
    return status.class === 'status-low';
  }).length;
  const mediumStock = oils.filter(oil => {
    const status = getStockStatus(oil.ml, oil.boxes, oil.labels);
    return status.class === 'status-medium';
  }).length;
  // Подсчёт масел с очень малым количеством коробок и этикеток
  const fewBoxes = oils.filter(oil => oil.boxes < 20).length;
  const fewLabels = oils.filter(oil => oil.labels < 100).length;
  document.getElementById('totalOilsCount').textContent = OILS_LIST.length;
  document.getElementById('totalOilMl').textContent = totalMl.toLocaleString() + ' мл';
  document.getElementById('lowStockCount').textContent = lowStock;
  // Обновляем новые элементы статистики
  const mediumElem = document.getElementById('mediumStockCount');
  if (mediumElem) mediumElem.textContent = mediumStock;
  const fewBoxesElem = document.getElementById('fewBoxesCount');
  if (fewBoxesElem) fewBoxesElem.textContent = fewBoxes;
  const fewLabelsElem = document.getElementById('fewLabelsCount');
  if (fewLabelsElem) fewLabelsElem.textContent = fewLabels;
}

// Заполнение селекторов
function populateSelects() {
  const productionSelect = document.getElementById('productionOilSelect');
  const editSelect = document.getElementById('editOilSelect');
  const batchSelect = document.getElementById('batchOilSelect');
  const optionsHtml = OILS_LIST.map(oil => `<option value="${oil}">${oil}</option>`).join('');
  if (productionSelect) productionSelect.innerHTML = optionsHtml;
  if (editSelect) editSelect.innerHTML = optionsHtml;
  if (batchSelect) batchSelect.innerHTML = optionsHtml;
  // Установить значения редактируемого масла (первый элемент по умолчанию)
  const firstOil = OILS_LIST[0];
  if (firstOil && inventoryData.oils[firstOil]) {
    document.getElementById('editOilMl').value = inventoryData.oils[firstOil].ml;
    document.getElementById('editOilBoxes').value = inventoryData.oils[firstOil].boxes;
    document.getElementById('editOilLabels').value = inventoryData.oils[firstOil].labels;
  }
  // Заполнить универсальные расходники
  document.getElementById('editCaps').value = inventoryData.universal.caps;
  document.getElementById('editBottles').value = inventoryData.universal.bottles;
  document.getElementById('editInstructions').value = inventoryData.universal.instructions;
  document.getElementById('editPackets').value = inventoryData.universal.packets;
  document.getElementById('editBulkBoxes').value = inventoryData.universal.bulkBoxes;
}

// Обновление предпросмотра производства
function updateProductionPreview() {
  const oilName = document.getElementById('productionOilSelect').value;
  const quantity = parseInt(document.getElementById('productionQuantity').value) || 0;
  const preview = document.getElementById('productionPreview');
  if (!oilName || quantity <= 0) {
    preview.classList.add('hidden');
    return;
  }
  const oilData = inventoryData.oils[oilName];
  if (!oilData) return;
  const requiredMl = quantity * 10;
  const requiredBulkBoxes = Math.ceil(quantity / UNITS_PER_BULK_BOX);
  // Рассчитываем максимальное количество единиц, которое можно произвести исходя из доступных ресурсов.
  const maxUnitsByResources = Math.min(
    inventoryData.universal.caps,
    inventoryData.universal.bottles,
    inventoryData.universal.instructions,
    inventoryData.universal.packets,
    inventoryData.universal.bulkBoxes * UNITS_PER_BULK_BOX,
    Math.floor(oilData.ml / 10),
    oilData.boxes,
    oilData.labels
  );
  preview.innerHTML = `
    <div class="font-medium mb-2">Расход на ${quantity} ед.:</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;font-size:0.85rem;">
        <div>Крышки: <strong>${quantity} шт</strong></div>
        <div>Флакончики: <strong>${quantity} шт</strong></div>
        <div>Инструкции: <strong>${quantity} шт</strong></div>
        <div>Пакетики: <strong>${quantity} шт</strong></div>
        <div>Коробы: <strong>${requiredBulkBoxes} шт</strong></div>
        <div>Масло ${oilName}: <strong>${requiredMl} мл</strong></div>
        <div>Коробки: <strong>${quantity} шт</strong></div>
        <div>Этикетки: <strong>${quantity} шт</strong></div>
    </div>
    ${maxUnitsByResources < quantity ? 
      `<div style="margin-top:0.5rem;color:var(--status-low-text);font-weight:600;">⚠️ Можно произвести только ${maxUnitsByResources} ед.</div>` : 
      `<div style="margin-top:0.5rem;color:var(--status-good-text);font-weight:600;">✓ Достаточно материалов</div>`
    }
  `;
  preview.classList.remove('hidden');
}

// Отправка данных о производстве
function submitProduction() {
  const oilName = document.getElementById('productionOilSelect').value;
  const quantity = parseInt(document.getElementById('productionQuantity').value) || 0;
  if (!oilName || quantity <= 0) {
    showNotification('Введите корректное количество', 'error');
    return;
  }
  const oilData = inventoryData.oils[oilName];
  if (!oilData) return;
  const requiredMl = quantity * 10;
  const requiredBulkBoxes = Math.ceil(quantity / UNITS_PER_BULK_BOX);
  // Проверка достаточности материалов
  if (inventoryData.universal.caps < quantity) {
    showNotification(`Недостаточно крышек. Нужно: ${quantity}, есть: ${inventoryData.universal.caps}`, 'error');
    return;
  }
  if (inventoryData.universal.bottles < quantity) {
    showNotification(`Недостаточно флакончиков. Нужно: ${quantity}, есть: ${inventoryData.universal.bottles}`, 'error');
    return;
  }
  if (inventoryData.universal.instructions < quantity) {
    showNotification(`Недостаточно инструкций. Нужно: ${quantity}, есть: ${inventoryData.universal.instructions}`, 'error');
    return;
  }
  if (inventoryData.universal.packets < quantity) {
    showNotification(`Недостаточно пакетиков. Нужно: ${quantity}, есть: ${inventoryData.universal.packets}`, 'error');
    return;
  }
  if (inventoryData.universal.bulkBoxes < requiredBulkBoxes) {
    showNotification(`Недостаточно коробов. Нужно: ${requiredBulkBoxes}, есть: ${inventoryData.universal.bulkBoxes}`, 'error');
    return;
  }
  if (oilData.ml < requiredMl) {
    showNotification(`Недостаточно масла ${oilName}. Нужно: ${requiredMl} мл, есть: ${oilData.ml} мл`, 'error');
    return;
  }
  if (oilData.boxes < quantity) {
    showNotification(`Недостаточно коробок для ${oilName}. Нужно: ${quantity}, есть: ${oilData.boxes}`, 'error');
    return;
  }
  if (oilData.labels < quantity) {
    showNotification(`Недостаточно этикеток для ${oilName}. Нужно: ${quantity}, есть: ${oilData.labels}`, 'error');
    return;
  }
  // Списание материалов
  inventoryData.universal.caps -= quantity;
  inventoryData.universal.bottles -= quantity;
  inventoryData.universal.instructions -= quantity;
  inventoryData.universal.packets -= quantity;
  inventoryData.universal.bulkBoxes -= requiredBulkBoxes;
  oilData.ml -= requiredMl;
  oilData.boxes -= quantity;
  oilData.labels -= quantity;
  appendHistoryEntry('production', `Списано для ${oilName}: ${quantity} шт продукции (масло ${requiredMl} мл, коробы ${requiredBulkBoxes} шт).`);
  saveInventoryData();
  renderAll();
  showNotification(`Производство ${quantity} ед. масла "${oilName}" зафиксировано`, 'success');
  document.getElementById('productionQuantity').value = 1;
  updateProductionPreview();
}

// Ручное обновление всех остатков
function updateAllManually() {
  inventoryData.universal.caps = parseInt(document.getElementById('editCaps').value) || 0;
  inventoryData.universal.bottles = parseInt(document.getElementById('editBottles').value) || 0;
  inventoryData.universal.instructions = parseInt(document.getElementById('editInstructions').value) || 0;
  inventoryData.universal.packets = parseInt(document.getElementById('editPackets').value) || 0;
  inventoryData.universal.bulkBoxes = parseInt(document.getElementById('editBulkBoxes').value) || 0;
  const oilName = document.getElementById('editOilSelect').value;
  if (oilName && inventoryData.oils[oilName]) {
    inventoryData.oils[oilName].ml = parseInt(document.getElementById('editOilMl').value) || 0;
    inventoryData.oils[oilName].boxes = parseInt(document.getElementById('editOilBoxes').value) || 0;
    inventoryData.oils[oilName].labels = parseInt(document.getElementById('editOilLabels').value) || 0;
  }
  saveInventoryData();
  renderAll();
  showNotification('Остатки успешно обновлены', 'success');
}

// Применить значение ко всем маслам
function applyToAllOils() {
  const addMl = parseInt(document.getElementById('addToAllMl').value) || 0;
  if (addMl === 0) {
    showNotification('Введите значение для добавления', 'warning');
    return;
  }
  for (const oilName in inventoryData.oils) {
    inventoryData.oils[oilName].ml = Math.max(0, inventoryData.oils[oilName].ml + addMl);
  }
  saveInventoryData();
  renderAll();
  showNotification(`Добавлено ${addMl} мл ко всем маслам`, 'success');
  document.getElementById('addToAllMl').value = '';
}

// Сброс всех данных
function resetAllData() {
  if (confirm('Вы уверены, что хотите сбросить все данные к начальным значениям?')) {
    inventoryData = JSON.parse(JSON.stringify(INITIAL_DATA));
    saveInventoryData();
    renderAll();
    showNotification('Все данные сброшены к начальным значениям', 'success');
  }
}

// Обновить стрелки сортировки в заголовках таблицы
function updateSortArrows() {
  const headers = document.querySelectorAll('th[data-sort]');
  headers.forEach(th => {
    const field = th.getAttribute('data-sort');
    th.classList.remove('sorted-desc', 'sorted-asc');
    const arrow = th.querySelector('.sort-arrow');
    if (!arrow) return;
    // По умолчанию стрелка вниз
    arrow.textContent = '▼';
    if (field === currentSortField) {
      if (sortDescending) {
        th.classList.add('sorted-desc');
        arrow.textContent = '▼';
      } else {
        th.classList.add('sorted-asc');
        arrow.textContent = '▲';
      }
    }
  });
  // Также обновляем кнопку сортировки в мобильном интерфейсе
  updateSortButton();
}

// Обновляет отображение кнопки порядка сортировки (на мобильных устройствах)
function updateSortButton() {
  const sortOrderBtn = document.getElementById('sortOrderBtn');
  if (!sortOrderBtn) return;
  // Отображаем стрелку в зависимости от sortDescending
  sortOrderBtn.textContent = sortDescending ? '▼' : '▲';
}

// ===== Новые функции редактирования =====
// Применение изменений универсальных расходников. Если поле пустое, значение не изменяется.
function applyUniversalEdit() {
  let changed = false;
  const capsVal = document.getElementById('editCaps').value;
  const bottlesVal = document.getElementById('editBottles').value;
  const instrVal = document.getElementById('editInstructions').value;
  const packetsVal = document.getElementById('editPackets').value;
  const bulkBoxesVal = document.getElementById('editBulkBoxes').value;
  if (capsVal !== '') {
    inventoryData.universal.caps = Math.max(0, parseInt(capsVal));
    changed = true;
  }
  if (bottlesVal !== '') {
    inventoryData.universal.bottles = Math.max(0, parseInt(bottlesVal));
    changed = true;
  }
  if (instrVal !== '') {
    inventoryData.universal.instructions = Math.max(0, parseInt(instrVal));
    changed = true;
  }
  if (packetsVal !== '') {
    inventoryData.universal.packets = Math.max(0, parseInt(packetsVal));
    changed = true;
  }
  if (bulkBoxesVal !== '') {
    inventoryData.universal.bulkBoxes = Math.max(0, parseInt(bulkBoxesVal));
    changed = true;
  }
  if (changed) {
    appendHistoryEntry('edit', 'Обновлены универсальные расходники.');
    saveInventoryData();
    renderAll();
    showNotification('Универсальные расходники обновлены', 'success');
  } else {
    showNotification('Изменений не внесено', 'info');
  }
}

// Применение изменений для одного масла. Если поле пустое, значение не меняется.
function applySingleOilEdit() {
  const oilName = document.getElementById('editOilSelect').value;
  if (!oilName || !inventoryData.oils[oilName]) {
    showNotification('Выберите масло для редактирования', 'warning');
    return;
  }
  const oil = inventoryData.oils[oilName];
  let changed = false;
  const mlVal = document.getElementById('editOilMl').value;
  const boxesVal = document.getElementById('editOilBoxes').value;
  const labelsVal = document.getElementById('editOilLabels').value;
  if (mlVal !== '') {
    oil.ml = Math.max(0, parseInt(mlVal));
    changed = true;
  }
  if (boxesVal !== '') {
    oil.boxes = Math.max(0, parseInt(boxesVal));
    changed = true;
  }
  if (labelsVal !== '') {
    oil.labels = Math.max(0, parseInt(labelsVal));
    changed = true;
  }
  if (changed) {
    appendHistoryEntry('edit', `Изменены остатки масла "${oilName}".`);
    saveInventoryData();
    renderAll();
    showNotification(`Данные масла "${oilName}" обновлены`, 'success');
  } else {
    showNotification('Изменений не внесено', 'info');
  }
}

// Массовое редактирование масел. Устанавливает новое значение мл для выбранных масел.
function applyBatchOilEdit() {
  const selectElem = document.getElementById('batchOilSelect');
  const selectedOptions = Array.from(selectElem ? selectElem.selectedOptions : []).map(opt => opt.value);
  const newMlStr = document.getElementById('batchOilMl').value;
  if (!selectedOptions.length) {
    showNotification('Выберите хотя бы одно масло', 'warning');
    return;
  }
  if (newMlStr === '') {
    showNotification('Введите новое значение объёма (мл)', 'warning');
    return;
  }
  const newMl = Math.max(0, parseInt(newMlStr));
  selectedOptions.forEach(name => {
    if (inventoryData.oils[name]) {
      inventoryData.oils[name].ml = newMl;
    }
  });
  // очистить поле ввода
  document.getElementById('batchOilMl').value = '';
  // сбросить выбор (опционально)
  // selectElem.selectedIndex = -1;
  appendHistoryEntry('edit', `Массовое изменение для ${selectedOptions.length} масел: новое значение ${newMl} мл.`);
  saveInventoryData();
  renderAll();
  showNotification(`Обновлены ${selectedOptions.length} масел`, 'success');
}

// Получить статус запаса
function getStockStatus(ml, boxes, labels) {
  if (ml < 500 || boxes < 50 || labels < 50) {
    return { class: 'status-low', text: 'Низкий запас' };
  } else if (ml < 1000 || boxes < 100 || labels < 100) {
    return { class: 'status-medium', text: 'Средний запас' };
  } else {
    return { class: 'status-good', text: 'Достаточно' };
  }
}

// Показывать уведомления
function showNotification(message, type = 'info') {
  const icons = {
    success: '✔️',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  const colors = {
    success: { bg: getComputedStyle(document.documentElement).getPropertyValue('--status-good-bg'), text: getComputedStyle(document.documentElement).getPropertyValue('--status-good-text') },
    error: { bg: getComputedStyle(document.documentElement).getPropertyValue('--status-low-bg'), text: getComputedStyle(document.documentElement).getPropertyValue('--status-low-text') },
    warning: { bg: getComputedStyle(document.documentElement).getPropertyValue('--status-med-bg'), text: getComputedStyle(document.documentElement).getPropertyValue('--status-med-text') },
    info: { bg: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'), text: '#ffffff' }
  };
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.style.background = colors[type].bg.trim();
  notif.style.color = colors[type].text.trim();
  notif.style.border = `1px solid ${colors[type].text.trim()}`;
  notif.innerHTML = `
    <span>${icons[type]}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.remove();
  }, 3000);
}

// Проверка пароля для доступа к блоку редактирования. При правильном пароле показываем
// скрытый блок и скрываем форму ввода. При неправильном — выводим сообщение об ошибке.
function checkEditPassword() {
  const input = document.getElementById('editPasswordInput');
  const errorDiv = document.getElementById('editPasswordError');
  if (!input) return;
  const pwd = input.value;
  if (pwd === '671124') {
    // Скрываем форму авторизации и показываем блок редактирования
    const authCard = document.getElementById('editAuthCard');
    const editSection = document.querySelector('.edit-section');
    if (authCard) authCard.style.display = 'none';
    if (editSection) editSection.style.display = '';
    // Очищаем сообщение и поле
    if (errorDiv) errorDiv.textContent = '';
    input.value = '';
    // Обновить селекты и значения, если необходимо
    populateSelects();
  } else {
    // Неправильный пароль
    if (errorDiv) errorDiv.textContent = 'Это для Никиты!';
  }
}

// Проверка пароля для доступа к блоку ввода произведённой продукции. При правильном пароле
// скрываем карточку авторизации и показываем блок ввода. Если пароль неверен — показываем
// сообщение об ошибке. Пароль хранится в коде как '23040'. После успешного входа
// обновляем предпросмотр производства.
function checkProductionPassword() {
  const input = document.getElementById('productionPasswordInput');
  const errorDiv = document.getElementById('productionPasswordError');
  if (!input) return;
  const pwd = input.value;
  if (pwd === '23040') {
    // Скрываем форму авторизации и показываем секцию производства
    const authCard = document.getElementById('productionAuthCard');
    const productionSection = document.getElementById('productionSection');
    if (authCard) authCard.style.display = 'none';
    if (productionSection) productionSection.style.display = '';
    // Очищаем сообщение об ошибке и поле
    if (errorDiv) errorDiv.textContent = '';
    input.value = '';
    // Обновляем предпросмотр, чтобы поле расчёта отобразилось корректно при открытии
    updateProductionPreview();
  } else {
    // Неверный пароль
    if (errorDiv) errorDiv.textContent = 'Это для Тани!';
  }
}

function checkHistoryPassword() {
  const input = document.getElementById('historyPasswordInput');
  const errorDiv = document.getElementById('historyPasswordError');
  if (!input) return;
  if (input.value === HISTORY_PASSWORD) {
    const authCard = document.getElementById('historyAuthCard');
    const section = document.getElementById('historySection');
    if (authCard) authCard.style.display = 'none';
    if (section) section.style.display = '';
    if (errorDiv) errorDiv.textContent = '';
    input.value = '';
    renderHistory();
  } else if (errorDiv) {
    errorDiv.textContent = 'Неверный пароль';
  }
}

function toggleMobileProductionPopup(show) {
  const overlay = document.getElementById('mobileProductionOverlay');
  const panel = document.getElementById('productionPanel');
  if (!overlay || !panel || window.innerWidth > 768) return;
  if (show) {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.appendChild(panel);
  } else {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    const grid = document.querySelector('#statistics .cards-grid');
    if (grid) {
      grid.appendChild(panel);
    }
  }
}

// Функция для кнопки редактирования масла (глобальная)
window.editOil = function(oilName) {
  document.getElementById('editOilSelect').value = oilName;
  document.getElementById('editOilSelect').dispatchEvent(new Event('change'));
  // Прокрутка к разделу редактирования для удобства
  document.getElementById('edit').scrollIntoView({ behavior: 'smooth' });
};
