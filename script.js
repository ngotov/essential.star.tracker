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

// Начальные значения. Изменены согласно новым требованиям:
//  - Масла имеют 2000 мл, 200 коробок и 3000 этикеток.
//  - Универсальные расходники (крышки, флакончики, инструкции) имеют 5000 шт.
const INITIAL_DATA = {
  universal: { caps: 5000, bottles: 5000, instructions: 5000 },
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
  instructions: '📄'
};

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
  '🍊': '1f34a.png',
  '🍋': '1f34b.png',
  '💜': '1f49c.png',
  '🌹': '1f339.png',
  '🌿': '1f33f.png',
  '⭐': '2b50.png',
  '🍦': '1f366.png',
  '🌺': '1f33a.png',
  '🫚': '1fad9.png',
  '🍫': '1f36b.png',
  '🍂': '1f342.png',
  '☕': '2615.png',
  '🥜': '1f95c.png',
  '🌼': '1f33c.png',
  '🪵': '1fa93.png',
  '🌲': '1f332.png',
  '🚬': '1f6ac.png',
  '🌸': '1f338.png',
  '🍵': '1f375.png',
  '🧄': '1f9c4.png',
  '🌶': '1f336.png',
  '🧴': '1f9b4.png'  // по умолчанию
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  loadInventoryData();
  initializeEventListeners();

  // Настройка кнопки возврата вверх
  const scrollBtn = document.getElementById('scrollToTopBtn');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 400) {
        scrollBtn.classList.add('show');
      } else {
        scrollBtn.classList.remove('show');
      }
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// Настройка темы: применить сохранённое значение и привязать обработчик к кнопке
function setupTheme() {
  const savedTheme = localStorage.getItem('theme');
  const isDarkPreferred = savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('dark', isDarkPreferred);
  const themeToggleInput = document.getElementById('themeToggle');
  if (themeToggleInput) {
    themeToggleInput.checked = isDarkPreferred;
    themeToggleInput.addEventListener('change', () => {
      const newDark = themeToggleInput.checked;
      document.body.classList.toggle('dark', newDark);
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
    });
  }
}

// ===== ЗАГРУЗКА / СИНХРОНИЗАЦИЯ =====
function loadInventoryData() {
  inventoryRef.on('value', snapshot => {
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
  // Сортировка
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (currentSortField === field) {
        sortDescending = !sortDescending;
      } else {
        currentSortField = field;
        sortDescending = true;
      }
      updateSortArrows();
      renderOilsTable();
    });
  });
  // Производство
  document.getElementById('productionOilSelect').addEventListener('change', updateProductionPreview);
  document.getElementById('productionQuantity').addEventListener('input', updateProductionPreview);
  document.getElementById('submitProduction').addEventListener('click', submitProduction);
  // Ручное редактирование: обновление полей при выборе масла
  document.getElementById('editOilSelect').addEventListener('change', () => {
    const oil = document.getElementById('editOilSelect').value;
    if (oil && inventoryData.oils[oil]) {
      document.getElementById('editOilMl').value = inventoryData.oils[oil].ml;
      document.getElementById('editOilBoxes').value = inventoryData.oils[oil].boxes;
      document.getElementById('editOilLabels').value = inventoryData.oils[oil].labels;
    }
  });
  // Кнопки редактирования
  const universalBtn = document.getElementById('applyUniversal');
  if (universalBtn) universalBtn.addEventListener('click', applyUniversalEdit);
  const oilBtn = document.getElementById('applyOilEdit');
  if (oilBtn) oilBtn.addEventListener('click', applySingleOilEdit);
  const batchBtn = document.getElementById('applyBatchOil');
  if (batchBtn) batchBtn.addEventListener('click', applyBatchOilEdit);
  // Сброс данных
  const resetBtn = document.getElementById('resetAll');
  if (resetBtn) resetBtn.addEventListener('click', resetAllData);

  // Авторизация доступа к редактированию
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
    function setOilsCollapsed(collapsed) {
      oilsCollapsedState = collapsed;
      if (collapsed) {
        oilsCollapse.style.maxHeight = '0px';
        oilsArrow.style.transform = 'rotate(-90deg)';
      } else {
        oilsCollapse.style.maxHeight = oilsCollapse.scrollHeight + 'px';
        oilsArrow.style.transform = 'rotate(0deg)';
      }
    }
    oilsCollapsedState = window.innerWidth < 768;
    setOilsCollapsed(oilsCollapsedState);
    oilsToggle.addEventListener('click', () => {
      setOilsCollapsed(!oilsCollapsedState);
    });
    window.addEventListener('resize', () => {
      if (!oilsCollapsedState) {
        oilsCollapse.style.maxHeight = oilsCollapse.scrollHeight + 'px';
      }
    });
  }
}

// ===== РЕНДЕР =====
function renderAll() {
  renderUniversalSupplies();
  renderStatistics();
  populateSelects();
  renderOilsTable();
  updateSortArrows();
  updateProductionPreview();
}

// Универсальные расходники
function renderUniversalSupplies() {
  const container = document.getElementById('universalSupplies');
  const { caps, bottles, instructions } = inventoryData.universal;
  const supplies = [
    { type: 'caps', name: 'Крышки', value: caps, max: 5000 },
    { type: 'bottles', name: 'Флакончики', value: bottles, max: 5000 },
    { type: 'instructions', name: 'Инструкции', value: instructions, max: 5000 }
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

// Таблица масел
function renderOilsTable() {
  const tbody = document.getElementById('oilsTableBody');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  let oils = Object.entries(inventoryData.oils);
  if (searchTerm) {
    oils = oils.filter(([name]) => name.toLowerCase().includes(searchTerm));
  }
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
  const oilsCollapse = document.getElementById('oilsCollapse');
  if (oilsCollapse && typeof oilsCollapsedState !== 'undefined' && !oilsCollapsedState) {
    oilsCollapse.style.maxHeight = oilsCollapse.scrollHeight + 'px';
  }
}

// Статистика
function renderStatistics() {
  const oils = Object.values(inventoryData.oils);
  const totalMl = oils.reduce((sum, oil) => sum + oil.ml, 0);
  const lowStock = oils.filter(oil => getStockStatus(oil.ml, oil.boxes, oil.labels).class === 'status-low').length;
  const mediumStock = oils.filter(oil => getStockStatus(oil.ml, oil.boxes, oil.labels).class === 'status-medium').length;
  const fewBoxes = oils.filter(oil => oil.boxes < 20).length;
  const fewLabels = oils.filter(oil => oil.labels < 100).length;
  document.getElementById('totalOilsCount').textContent = OILS_LIST.length;
  document.getElementById('totalOilMl').textContent = totalMl.toLocaleString() + ' мл';
  document.getElementById('lowStockCount').textContent = lowStock;
  const mediumElem = document.getElementById('mediumStockCount');
  if (mediumElem) mediumElem.textContent = mediumStock;
  const fewBoxesElem = document.getElementById('fewBoxesCount');
  if (fewBoxesElem) fewBoxesElem.textContent = fewBoxes;
  const fewLabelsElem = document.getElementById('fewLabelsCount');
  if (fewLabelsElem) fewLabelsElem.textContent = fewLabels;
}

// Селекты
function populateSelects() {
  const productionSelect = document.getElementById('productionOilSelect');
  const editSelect = document.getElementById('editOilSelect');
  const batchSelect = document.getElementById('batchOilSelect');
  const optionsHtml = OILS_LIST.map(oil => `<option value="${oil}">${oil}</option>`).join('');
  if (productionSelect) productionSelect.innerHTML = optionsHtml;
  if (editSelect) editSelect.innerHTML = optionsHtml;
  if (batchSelect) batchSelect.innerHTML = optionsHtml;
  const firstOil = OILS_LIST[0];
  if (firstOil && inventoryData.oils[firstOil]) {
    document.getElementById('editOilMl').value = inventoryData.oils[firstOil].ml;
    document.getElementById('editOilBoxes').value = inventoryData.oils[firstOil].boxes;
    document.getElementById('editOilLabels').value = inventoryData.oils[firstOil].labels;
  }
  document.getElementById('editCaps').value = inventoryData.universal.caps;
  document.getElementById('editBottles').value = inventoryData.universal.bottles;
  document.getElementById('editInstructions').value = inventoryData.universal.instructions;
}

// Предпросмотр производства
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
  const maxUnitsByResources = Math.min(
    inventoryData.universal.caps,
    inventoryData.universal.bottles,
    inventoryData.universal.instructions,
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

// Производство
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

// Изменение универсальных расходников: если поле пустое, значение не меняется
function applyUniversalEdit() {
  let changed = false;
  const capsVal = document.getElementById('editCaps').value;
  const bottlesVal = document.getElementById('editBottles').value;
  const instrVal = document.getElementById('editInstructions').value;
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
  if (changed) {
    saveInventoryData();
    renderAll();
    showNotification('Универсальные расходники обновлены', 'success');
  } else {
    showNotification('Изменений не внесено', 'info');
  }
}

// Изменение одного масла: если поле пустое, значение не меняется
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
    saveInventoryData();
    renderAll();
    showNotification(`Данные масла "${oilName}" обновлены`, 'success');
  } else {
    showNotification('Изменений не внесено', 'info');
  }
}

// Массовое изменение: устанавливает новое значение мл для выбранных масел
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
  document.getElementById('batchOilMl').value = '';
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

// Уведомления
function showNotification(message, type = 'info') {
  const icons = { success: '✔️', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const colors = {
    success: {
      bg: getComputedStyle(document.documentElement).getPropertyValue('--status-good-bg'),
      text: getComputedStyle(document.documentElement).getPropertyValue('--status-good-text')
    },
    error: {
      bg: getComputedStyle(document.documentElement).getPropertyValue('--status-low-bg'),
      text: getComputedStyle(document.documentElement).getPropertyValue('--status-low-text')
    },
    warning: {
      bg: getComputedStyle(document.documentElement).getPropertyValue('--status-med-bg'),
      text: getComputedStyle(document.documentElement).getPropertyValue('--status-med-text')
    },
    info: {
      bg: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
      text: '#ffffff'
    }
  };
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.style.background = colors[type].bg.trim();
  notif.style.color = colors[type].text.trim();
  notif.style.border = `1px solid ${colors[type].text.trim()}`;
  notif.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.remove();
  }, 3000);
}

// Парольная защита блока редактирования
function checkEditPassword() {
  const input = document.getElementById('editPasswordInput');
  const errorDiv = document.getElementById('editPasswordError');
  if (!input) return;
  const pwd = input.value;
  if (pwd === '671124') {
    const authCard = document.getElementById('editAuthCard');
    const editSection = document.querySelector('.edit-section');
    if (authCard) authCard.style.display = 'none';
    if (editSection) editSection.style.display = '';
    if (errorDiv) errorDiv.textContent = '';
    input.value = '';
    populateSelects();
  } else {
    if (errorDiv) errorDiv.textContent = 'Это для Никиты!';
  }
}

// Выбор масла для редактирования — глобальная функция для кнопки ✏️
window.editOil = function(oilName) {
  document.getElementById('editOilSelect').value = oilName;
  document.getElementById('editOilSelect').dispatchEvent(new Event('change'));
  document.getElementById('edit').scrollIntoView({ behavior: 'smooth' });
};
