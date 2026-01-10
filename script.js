<script type="module">
// Основной скрипт для приложения Essential Star

// Конфигурация Firebase (используем Realtime Database)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
    getFirestore,
    doc,
    onSnapshot,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyArBA1DUY-kksabrqDxQ5CYOSBcAVwEAqQ",
    authDomain: "my-first-project-dc4e5.firebaseapp.com",
    projectId: "my-first-project-dc4e5",
    storageBucket: "my-first-project-dc4e5.firebasestorage.app",
    messagingSenderId: "643846849382",
    appId: "1:643846849382:web:ca9ef5965e8816875afea7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const inventoryRef = doc(db, "storage", "current");

// Инициализация Firebase (в реальном проекте нужно заменить на реальные ключи)
// Для демо используем localStorage

const OILS_LIST = [
    'Аир', 'Анис', 'Апельсин', 'Базилик', 'Бензоин', 'Бергамот', 'Бэй', 'Ваниль',
    'Вербена', 'Ветивер', 'Гвоздика', 'Герань', 'Голубой лотос', 'Грейпфрут', 'Ель',
    'Жасмин', 'Женьшень', 'Зелёный чай', 'Имбирь', 'Иланг-иланг', 'Иссоп', 'Какао',
    'Камфора', 'Каннабис', 'Кардамон', 'Каяпут', 'Кедр', 'Кинза', 'Кипарис', 'Кориандр',
    'Корица', 'Кофе', 'Куркума', 'Лаванда', 'Лавр', 'Ладан', 'Лайм', 'Лемонграсс',
    'Лилия', 'Лимон', 'Магнолия', 'Майоран', 'Мандарин', 'Мелисса', 'Мирра', 'Можжевельник',
    'Морковь', 'Мускатный орех', 'Мята', 'Нарцисс', 'Нероли', 'Орегано', 'Пальмароза',
    'Пачули', 'Петегрейн', 'Петрушка', 'Пижма', 'Пион', 'Пихта', 'Полынь', 'Помело',
    'Роза', 'Ромашка', 'Розмарин', 'Сандал', 'Сельдерей', 'Сосна', 'Стиракс', 'Табак',
    'Тимьян', 'Тмин', 'Укроп', 'Фенхель', 'Фрезия', 'Чайное дерево', 'Чеснок',
    'Чёрный перец', 'Шафран', 'Шалфей мускатный', 'Эвкалипт'
];

// Начальные данные
const INITIAL_DATA = {
    universal: {
        caps: 10000,
        bottles: 10000,
        instructions: 10000
    },
    oils: OILS_LIST.reduce((acc, oil) => {
        acc[oil] = {
            ml: 5000,
            boxes: 500,
            labels: 500
        };
        return acc;
    }, {}),
    lastUpdated: new Date().toISOString()
};

// Глобальное состояние
let inventoryData = null;
let sortDescending = true;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function () {
    subscribeToInventory();
    initializeEventListeners();
});

import {
    getFirestore,
    doc,
    onSnapshot,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

async function subscribeToInventory() {
    const snap = await getDoc(inventoryRef);

    if (!snap.exists()) {
        await setDoc(inventoryRef, JSON.parse(JSON.stringify(INITIAL_DATA)));
    }

    onSnapshot(inventoryRef, (liveSnap) => {
        if (liveSnap.exists()) {
            inventoryData = liveSnap.data();
            renderAll();
        }
    });
}
// Загрузка данных из localStorage


// Сохранение данных в localStorage


// Инициализация обработчиков событий
function initializeEventListeners() {
    // Поиск
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterOils(e.target.value);
    });

    // Сортировка
    document.getElementById('sortToggle').addEventListener('click', function() {
        sortDescending = !sortDescending;
        const icon = document.getElementById('sortIcon');
        icon.setAttribute('data-feather', sortDescending ? 'arrow-down' : 'arrow-up');
        feather.replace();
        renderOilsTable();
    });

    // Ввод производства
    document.getElementById('productionOilSelect').addEventListener('change', updateProductionPreview);
    document.getElementById('productionQuantity').addEventListener('input', updateProductionPreview);
    document.getElementById('submitProduction').addEventListener('click', submitProduction);

    // Ручное редактирование
    document.getElementById('editOilSelect').addEventListener('change', function() {
        const oil = this.value;
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

// Рендер всех компонентов
function renderAll() {
    renderUniversalSupplies();
    renderOilsTable();
    renderStatistics();
    populateSelects();
    updateProductionPreview();
}

// Рендер универсальных расходников
function renderUniversalSupplies() {
    const container = document.getElementById('universalSupplies');
    const { caps, bottles, instructions } = inventoryData.universal;
    
    const supplies = [
        { name: 'Крышки', value: caps, icon: 'package', color: 'primary' },
        { name: 'Флакончики', value: bottles, icon: 'droplet', color: 'secondary' },
        { name: 'Инструкции', value: instructions, icon: 'file-text', color: 'green' }
    ];

    container.innerHTML = supplies.map(supply => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
                <div class="p-2 bg-${supply.color}-100 rounded-lg mr-3">
                    <i data-feather="${supply.icon}" class="text-${supply.color}-600 w-5 h-5"></i>
                </div>
                <div>
                    <div class="font-medium text-gray-800">${supply.name}</div>
                    <div class="text-sm text-gray-600">Остаток: ${supply.value.toLocaleString()} шт</div>
                </div>
            </div>
            <div class="text-right">
                <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-${supply.color}-500" style="width: ${Math.min(100, (supply.value / 10000) * 100)}%"></div>
                </div>
            </div>
        </div>
    `).join('');

    feather.replace();
}

// Рендер таблицы масел
function renderOilsTable() {
    const tbody = document.getElementById('oilsTableBody');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Фильтрация и сортировка
    let oils = Object.entries(inventoryData.oils);
    
    if (searchTerm) {
        oils = oils.filter(([name]) => name.toLowerCase().includes(searchTerm));
    }
    
    oils.sort(([, a], [, b]) => {
        return sortDescending ? b.ml - a.ml : a.ml - b.ml;
    });

    tbody.innerHTML = oils.map(([name, data]) => {
        const status = getStockStatus(data.ml, data.boxes, data.labels);
        return `
            <tr class="fade-in">
                <td class="py-4 px-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-primary-100 rounded-lg mr-3">
                            <i data-feather="droplet" class="text-primary-600 w-5 h-5"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-800">${name}</div>
                            <div class="text-sm text-gray-500">Эфирное масло</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6">
                    <div class="font-semibold text-gray-800">${data.ml.toLocaleString()} мл</div>
                    <div class="text-sm text-gray-500">${Math.floor(data.ml / 10)} единиц</div>
                </td>
                <td class="py-4 px-6">
                    <div class="font-medium ${data.boxes < 100 ? 'text-red-600' : 'text-gray-800'}">
                        ${data.boxes.toLocaleString()} шт
                    </div>
                </td>
                <td class="py-4 px-6">
                    <div class="font-medium ${data.labels < 100 ? 'text-red-600' : 'text-gray-800'}">
                        ${data.labels.toLocaleString()} шт
                    </div>
                </td>
                <td class="py-4 px-6">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${status.class}">
                        ${status.text}
                    </span>
                </td>
                <td class="py-4 px-6">
                    <button onclick="editOil('${name}')" class="text-primary-600 hover:text-primary-800 transition mr-3">
                        <i data-feather="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="showOilHistory('${name}')" class="text-gray-600 hover:text-gray-800 transition">
                        <i data-feather="history" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    feather.replace();
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

// Заполнение выпадающих списков
function populateSelects() {
    const productionSelect = document.getElementById('productionOilSelect');
    const editSelect = document.getElementById('editOilSelect');
    
    productionSelect.innerHTML = OILS_LIST.map(oil => 
        `<option value="${oil}">${oil}</option>`
    ).join('');
    
    editSelect.innerHTML = OILS_LIST.map(oil => 
        `<option value="${oil}">${oil}</option>`
    ).join('');
    
    // Заполнить текущие значения для редактирования
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
        <div class="font-medium mb-2">Расход на ${quantity} единиц:</div>
        <div class="grid grid-cols-2 gap-2 text-sm">
            <div>Крышки: <span class="font-semibold">${quantity} шт</span></div>
            <div>Флакончики: <span class="font-semibold">${quantity} шт</span></div>
            <div>Инструкции: <span class="font-semibold">${quantity} шт</span></div>
            <div>Масло ${oilName}: <span class="font-semibold">${requiredMl} мл</span></div>
            <div>Коробки ${oilName}: <span class="font-semibold">${quantity} шт</span></div>
            <div>Этикетки ${oilName}: <span class="font-semibold">${quantity} шт</span></div>
        </div>
        ${canProduceUnits < quantity ? 
            `<div class="mt-2 text-red-600 font-medium">
                ⚠️ Можно произвести только ${canProduceUnits} единиц
            </div>` : 
            `<div class="mt-2 text-green-600 font-medium">
                ✓ Достаточно материалов
            </div>`
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
    
    saveInventoryToFirebase();;
    renderAll();
    
    showNotification(`Производство ${quantity} единиц масла "${oilName}" зафиксировано`, 'success');
    document.getElementById('productionQuantity').value = 1;
    updateProductionPreview();
}

// Ручное обновление всех остатков
function updateAllManually() {
    // Обновить универсальные расходники
    inventoryData.universal.caps = parseInt(document.getElementById('editCaps').value) || 0;
    inventoryData.universal.bottles = parseInt(document.getElementById('editBottles').value) || 0;
    inventoryData.universal.instructions = parseInt(document.getElementById('editInstructions').value) || 0;
    
    // Обновить выбранное масло
    const oilName = document.getElementById('editOilSelect').value;
    if (oilName && inventoryData.oils[oilName]) {
        inventoryData.oils[oilName].ml = parseInt(document.getElementById('editOilMl').value) || 0;
        inventoryData.oils[oilName].boxes = parseInt(document.getElementById('editOilBoxes').value) || 0;
        inventoryData.oils[oilName].labels = parseInt(document.getElementById('editOilLabels').value) || 0;
    }
    
    saveInventoryToFirebase();
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
    
    saveInventoryToFirebase();
    renderAll();
    showNotification(`Добавлено ${addMl} мл ко всем маслам`, 'success');
    document.getElementById('addToAllMl').value = '';
}

// Сброс всех данных
function resetAllData() {
    if (confirm('Вы уверены, что хотите сбросить все данные к начальным значениям?')) {
        inventoryData = JSON.parse(JSON.stringify(INITIAL_DATA));
        saveInventoryToFirebase();
        renderAll();
        showNotification('Все данные сброшены к начальным значениям', 'success');
    }
}

// Фильтрация масел
function filterOils(searchTerm) {
    renderOilsTable();
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

function saveInventoryToFirebase() {
    inventoryData.lastUpdated = new Date().toISOString();
    setDoc(inventoryRef, inventoryData);
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const types = {
        success: 'bg-green-100 border-green-400 text-green-700',
        error: 'bg-red-100 border-red-400 text-red-700',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${types[type]} border px-6 py-4 rounded-lg shadow-lg max-w-md`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i data-feather="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    feather.replace();
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Функции для кнопок действий (глобальные для использования в inline обработчиках)
window.editOil = function(oilName) {
    document.getElementById('editOilSelect').value = oilName;
    document.getElementById('editOilSelect').dispatchEvent(new Event('change'));
    document.getElementById('editOilSelect').scrollIntoView({ behavior: 'smooth' });
};

window.showOilHistory = function(oilName) {
    showNotification(`История изменений для "${oilName}" будет доступна в расширенной версии`, 'info');
};
</script>
