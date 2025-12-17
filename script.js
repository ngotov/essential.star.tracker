document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    const oils = [
        "Аир", "Анис", "Апельсин", "Базилик", "Бэй", "Бензоин", "Бергамот", "Ваниль", "Вербена", 
        "Ветивер", "Гвоздика", "Герань", "Голубой лотос", "Грейпфрут", "Ель", "Жасмин", "Женьшень", 
        "Зелёный чай", "Имбирь", "Иланг-иланг", "Иссоп", "Какао", "Камфора", "Каннабис", "Кардамон", 
        "Каяпут", "Кедр", "Кинза", "Кипарис", "Кориандр", "Корица", "Кофе", "Куркума", "Лаванда", 
        "Лавр", "Ладан", "Лайм", "Лемонграсс", "Лилия", "Лимон", "Магнолия", "Майоран", "Мандарин", 
        "Мелисса", "Мирра", "Можжевельник", "Морковь", "Мускатный орех", "Мята", "Нарцисс", "Нероли", 
        "Орегано", "Пальмароза", "Пачули", "Петегрейн", "Петрушка", "Пижма", "Пион", "Пихта", "Полынь", 
        "Помело", "Роза", "Ромашка", "Розмарин", "Сандал", "Сельдерей", "Сосна", "Стиракс", "Табак", 
        "Тимьян", "Тмин", "Укроп", "Фенхель", "Фрезия", "Чайное дерево", "Чеснок", "Чёрный перец", 
        "Шафран", "Шалфей мускатный", "Эвкалипт"
    ];

    // Load data from localStorage or initialize
    let supplies = {};
let oilData = {};

db.collection("app").doc("supplies").get().then(doc => {
    supplies = doc.exists ? doc.data() : { lids: 5000, bottles: 5000, manuals: 5000 };
    renderSupplies();
});

db.collection("app").doc("oils").get().then(doc => {
    oilData = doc.exists ? doc.data() : {};
    renderOilCards();
});

    
    // Initialize oil data if empty
    oils.forEach(oil => {
        if (!oilData[oil]) {
            oilData[oil] = {
                boxes: 500,
                labels: 500,
                oil: 2000 // in ml
};
        }
    });

    // Save initial data
    db.collection("app").doc("oils").set(oilData);
    db.collection("app").doc("supplies").set(supplies);


    // Populate oil select dropdowns
    const oilSelect = document.getElementById('oil-select');
    const editOilSelect = document.getElementById('edit-oil-select');
    
    oils.forEach(oil => {
        const option = document.createElement('option');
        option.value = oil;
        option.textContent = oil;
        oilSelect.appendChild(option);
        
        const editOption = document.createElement('option');
        editOption.value = oil;
        editOption.textContent = oil;
        editOilSelect.appendChild(editOption);
    });

    // Render oil cards
  

    // Production form handler
    document.getElementById('add-production').addEventListener('click', function() {
        const selectedOil = oilSelect.value;
        const count = parseInt(document.getElementById('production-count').value);
        
        if (!selectedOil || isNaN(count) || count <= 0) {
            alert('Пожалуйста, выберите масло и введите корректное количество');
            return;
        }
        
        // Update oil data
        oilData[selectedOil].boxes -= count;
        oilData[selectedOil].labels -= count;
        oilData[selectedOil].oil -= count * 10;
        
        // Update supplies
        supplies.lids -= count;
        supplies.bottles -= count;
        supplies.manuals -= count;
        
        // Save to localStorage
        db.collection("app").doc("oils").set(oilData);
db.collection("app").doc("supplies").set(supplies);

        
        // Update UI
       
        
        // Reset form
        document.getElementById('production-count').value = '';
    });

    // Edit oil data handler
    document.getElementById('update-oil').addEventListener('click', function() {
        const selectedOil = editOilSelect.value;
        const boxes = parseInt(document.getElementById('edit-boxes').value);
        const labels = parseInt(document.getElementById('edit-labels').value);
        const oil = parseInt(document.getElementById('edit-oil').value);
        
        if (!selectedOil) {
            alert('Пожалуйста, выберите масло');
            return;
        }
        
        if (!isNaN(boxes)) oilData[selectedOil].boxes = boxes;
        if (!isNaN(labels)) oilData[selectedOil].labels = labels;
        if (!isNaN(oil)) oilData[selectedOil].oil = oil;
        
        db.collection("app").doc("oils").get().then(doc => {
    oilData = doc.data();
    renderOilCards();
    });

    // Edit oil select change handler
    editOilSelect.addEventListener('change', function() {
        const selectedOil = this.value;
        if (!selectedOil) return;
        
        document.getElementById('edit-boxes').value = oilData[selectedOil].boxes;
        document.getElementById('edit-labels').value = oilData[selectedOil].labels;
        document.getElementById('edit-oil').value = oilData[selectedOil].oil;
    });

    // Functions
    function renderOilCards() {
        const container = document.getElementById('oil-accordion-container');
        container.innerHTML = '';
        
        oils.forEach(oil => {
            const data = oilData[oil];
            const accordionItem = document.createElement('div');
            accordionItem.className = 'border border-gray-200 rounded-lg overflow-hidden';
            accordionItem.innerHTML = `
                <button class="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none transition duration-200">
                    <h3 class="font-medium text-lg text-left">${oil}</h3>
                    <i data-feather="chevron-down" class="accordion-icon transform transition-transform duration-200"></i>
                </button>
                <div class="accordion-content hidden p-4 bg-white border-t border-gray-200">
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm">Коробки: ${data.boxes}</span>
                                <span class="text-sm">${Math.round((data.boxes / 500) * 100)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-bar-fill bg-primary-500" style="width: ${Math.min(100, (data.boxes / 500) * 100)}%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm">Этикетки: ${data.labels}</span>
                                <span class="text-sm">${Math.round((data.labels / 500) * 100)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-bar-fill bg-secondary-500" style="width: ${Math.min(100, (data.labels / 500) * 100)}%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm">Масло: ${data.oil} мл</span>
                                <span class="text-sm">${Math.round((data.oil / 2000) * 100)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-bar-fill bg-yellow-500" style="width: ${Math.min(100, (data.oil / 2000) * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(accordionItem);
        });

        // Initialize accordion functionality
        document.querySelectorAll('#oil-accordion-container button').forEach(button => {
            button.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('.accordion-icon');
                
                if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.add('rotate-180');
                } else {
                    content.classList.add('hidden');
                    icon.classList.remove('rotate-180');
                }
            });
        });

        // Initialize search functionality
        const searchInput = document.getElementById('oil-search');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('#oil-accordion-container > div').forEach(item => {
                    const oilName = item.querySelector('h3').textContent.toLowerCase();
                    if (oilName.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    }
function renderSupplies() {
        const suppliesContainer = document.querySelector('custom-supplies-card');
        if (suppliesContainer) {
            suppliesContainer.setAttribute('lids', supplies.lids);
            suppliesContainer.setAttribute('bottles', supplies.bottles);
            suppliesContainer.setAttribute('manuals', supplies.manuals);
        }
    }
});

function updateSupplies(type) {
    const input = document.getElementById(`edit-${type}`);
    const value = parseInt(input.value);
    
    if (isNaN(value) || value < 0) {
        alert('Пожалуйста, введите корректное число');
        return;
    }
    
  db.collection("app").doc("supplies").get().then(doc => {
    supplies = doc.data();
    renderSupplies();
});

    
    // Update UI
    const suppliesContainer = document.querySelector('custom-supplies-card');
    if (suppliesContainer) {
        suppliesContainer.setAttribute(type, value);
    }
    
    input.value = '';
}
