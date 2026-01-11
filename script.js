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

const INITIAL_DATA = {
  universal: { caps: 10000, bottles: 10000, instructions: 10000 },
  oils: OILS_LIST.reduce((acc, oil) => {
    acc[oil] = { ml: 5000, boxes: 500, labels: 500 };
    return acc;
  }, {}),
  lastUpdated: new Date().toISOString()
};

// ===== СОСТОЯНИЕ =====
let inventoryData = null;
let sortDescending = true;

// ===== СЛУЖЕБНЫЕ ДАННЫЕ =====
// Иконки для универсальных расходников (используются эмодзи)
const SUPPLY_ICONS = {
  caps: '🧢',
  bottles: '🧴',
  instructions: '📄'
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  loadInventoryData();
  initializeEventListeners();
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

// ===== ЗАГРУЗКА / СИНХРОНИЗАЦИЯ =====
function loadInventoryData() {
  inventoryRef.on("value", snapshot => {
    if (!snapshot.exists()) {
      inventoryData = JSON.parse(JSON.stringify(INITIAL_DATA));
      inventoryRef.set(inventoryData);
    } else {
      inventoryData = snapshot.val();
    }
    renderAll();
  });
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
  // Переключение сортировки
  document.getElementById('sortToggle').addEventListener('click', () => {
    sortDescending = !sortDescending;
    document.getElementById('sortDirection').textContent = sortDescending ? '↓' : '↑';
    renderOilsTable();
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
  document.getElementById('updateAll').addEventListener('click', updateAllManually);
  document.getElementById('applyToAll').addEventListener('click', applyToAllOils);
  document.getElementById('resetAll').addEventListener('click', resetAllData);
}

// ===== РЕНДЕР ВСЕХ КОМПОНЕНТОВ =====
function renderAll() {
  renderUniversalSupplies();
  renderStatistics();
  populateSelects();
  renderOilsTable();
  updateProductionPreview();
}

// Рендер универсальных расходников
function renderUniversalSupplies() {
  const container = document.getElementById('universalSupplies');
  const { caps, bottles, instructions } = inventoryData.universal;
  const supplies = [
    { type: 'caps', name: 'Крышки', value: caps, max: 10000 },
    { type: 'bottles', name: 'Флакончики', value: bottles, max: 10000 },
    { type: 'instructions', name: 'Инструкции', value: instructions, max: 10000 }
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
  oils.sort(([, a], [, b]) => sortDescending ? b.ml - a.ml : a.ml - b.ml);
  tbody.innerHTML = oils.map(([name, data]) => {
    const status = getStockStatus(data.ml, data.boxes, data.labels);
    return `
      <tr class="${status.class}">
        <td data-label="Масло">${name}</td>
        <td data-label="Объём">${data.ml.toLocaleString()} мл</td>
        <td data-label="Коробки">${data.boxes.toLocaleString()}</td>
        <td data-label="Этикетки">${data.labels.toLocaleString()}</td>
        <td data-label="Статус"><span class="status-label">${status.text}</span></td>
        <td data-label="Действия"><button class="edit-button" onclick="editOil('${name}')" aria-label="Редактировать">✏️</button></td>
      </tr>
    `;
  }).join('');
}

// Рендер статистики
function renderStatistics() {
  const oils = Object.values(inventoryData.oils);
  const totalMl = oils.reduce((sum, oil) => sum + oil.ml, 0);
  const lowStock = oils.filter(oil => oil.ml < 1000 || oil.boxes < 100 || oil.labels < 100).length;
  document.getElementById('totalOilsCount').textContent = OILS_LIST.length;
  document.getElementById('totalOilMl').textContent = totalMl.toLocaleString() + ' мл';
  document.getElementById('lowStockCount').textContent = lowStock;
}

// Заполнение селекторов
function populateSelects() {
  const productionSelect = document.getElementById('productionOilSelect');
  const editSelect = document.getElementById('editOilSelect');
  productionSelect.innerHTML = OILS_LIST.map(oil => `<option value="${oil}">${oil}</option>`).join('');
  editSelect.innerHTML = OILS_LIST.map(oil => `<option value="${oil}">${oil}</option>`).join('');
  // Установить значения редактируемого масла
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
  const canProduce = Math.min(
    Math.floor(inventoryData.universal.caps / quantity),
    Math.floor(inventoryData.universal.bottles / quantity),
    Math.floor(inventoryData.universal.instructions / quantity),
    Math.floor(oilData.ml / requiredMl),
    Math.floor(oilData.boxes / quantity),
    Math.floor(oilData.labels / quantity)
  );
  const canProduceUnits = Math.max(0, canProduce);
  preview.innerHTML = `
    <div class="font-medium mb-2">Расход на ${quantity} ед.:</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;font-size:0.85rem;">
        <div>Крышки: <strong>${quantity} шт</strong></div>
        <div>Флакончики: <strong>${quantity} шт</strong></div>
        <div>Инструкции: <strong>${quantity} шт</strong></div>
        <div>Масло ${oilName}: <strong>${requiredMl} мл</strong></div>
        <div>Коробки: <strong>${quantity} шт</strong></div>
        <div>Этикетки: <strong>${quantity} шт</strong></div>
    </div>
    ${canProduceUnits < quantity ? 
      `<div style="margin-top:0.5rem;color:var(--status-low-text);font-weight:600;">⚠️ Можно произвести только ${canProduceUnits} ед.</div>` : 
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
  oilData.ml -= requiredMl;
  oilData.boxes -= quantity;
  oilData.labels -= quantity;
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

// Функция для кнопки редактирования масла (глобальная)
window.editOil = function(oilName) {
  document.getElementById('editOilSelect').value = oilName;
  document.getElementById('editOilSelect').dispatchEvent(new Event('change'));
  // Прокрутка к разделу редактирования для удобства
  document.getElementById('edit').scrollIntoView({ behavior: 'smooth' });
};