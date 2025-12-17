console.log("script.js живой", typeof db);

document.addEventListener('DOMContentLoaded', function () {

    const oils = [
        "Аир","Анис","Апельсин","Базилик","Бэй","Бензоин","Бергамот","Ваниль","Вербена",
        "Ветивер","Гвоздика","Герань","Голубой лотос","Грейпфрут","Ель","Жасмин","Женьшень",
        "Зелёный чай","Имбирь","Иланг-иланг","Иссоп","Какао","Камфора","Каннабис","Кардамон",
        "Каяпут","Кедр","Кинза","Кипарис","Кориандр","Корица","Кофе","Куркума","Лаванда",
        "Лавр","Ладан","Лайм","Лемонграсс","Лилия","Лимон","Магнолия","Майоран","Мандарин",
        "Мелисса","Мирра","Можжевельник","Морковь","Мускатный орех","Мята","Нарцисс","Нероли",
        "Орегано","Пальмароза","Пачули","Петегрейн","Петрушка","Пижма","Пион","Пихта","Полынь",
        "Помело","Роза","Ромашка","Розмарин","Сандал","Сельдерей","Сосна","Стиракс","Табак",
        "Тимьян","Тмин","Укроп","Фенхель","Фрезия","Чайное дерево","Чеснок","Чёрный перец",
        "Шафран","Шалфей мускатный","Эвкалипт"
    ];

    let oilData = {};
    let supplies = {};

    const oilSelect = document.getElementById('oil-select');
    const editOilSelect = document.getElementById('edit-oil-select');

    oils.forEach(oil => {
        oilSelect.innerHTML += `<option value="${oil}">${oil}</option>`;
        editOilSelect.innerHTML += `<option value="${oil}">${oil}</option>`;
    });

    // ---------- LOAD OILS ----------
    db.collection("app").doc("oils").get().then(doc => {
        oilData = doc.exists ? doc.data() : {};

        oils.forEach(oil => {
            if (!oilData[oil]) {
                oilData[oil] = { boxes: 500, labels: 500, oil: 2000 };
            }
        });

        return db.collection("app").doc("oils").set(oilData);
    }).then(renderOilCards);

    // ---------- LOAD SUPPLIES ----------
    db.collection("app").doc("supplies").get().then(doc => {
        supplies = doc.exists
            ? doc.data()
            : { lids: 5000, bottles: 5000, manuals: 5000 };

        return db.collection("app").doc("supplies").set(supplies);
    }).then(renderSupplies);

    // ---------- PRODUCTION ----------
    document.getElementById('add-production').addEventListener('click', () => {
        const oil = oilSelect.value;
        const count = parseInt(document.getElementById('production-count').value);

        if (!oil || isNaN(count) || count <= 0) return alert('Ошибка ввода');

        oilData[oil].boxes -= count;
        oilData[oil].labels -= count;
        oilData[oil].oil -= count * 10;

        supplies.lids -= count;
        supplies.bottles -= count;
        supplies.manuals -= count;

        Promise.all([
            db.collection("app").doc("oils").set(oilData),
            db.collection("app").doc("supplies").set(supplies)
        ]).then(() => {
            renderOilCards();
            renderSupplies();
        });

        document.getElementById('production-count').value = '';
    });

    // ---------- EDIT OIL ----------
    document.getElementById('update-oil').addEventListener('click', () => {
        const oil = editOilSelect.value;
        if (!oil) return;

        const b = parseInt(editBoxes.value);
        const l = parseInt(editLabels.value);
        const o = parseInt(editOil.value);

        if (!isNaN(b)) oilData[oil].boxes = b;
        if (!isNaN(l)) oilData[oil].labels = l;
        if (!isNaN(o)) oilData[oil].oil = o;

        db.collection("app").doc("oils").set(oilData).then(renderOilCards);
    });

    editOilSelect.addEventListener('change', () => {
        const oil = editOilSelect.value;
        if (!oil) return;

        editBoxes.value = oilData[oil].boxes;
        editLabels.value = oilData[oil].labels;
        editOil.value = oilData[oil].oil;
    });

    // ---------- RENDER ----------
    function renderOilCards() {
        const container = document.getElementById('oil-accordion-container');
        container.innerHTML = '';

        oils.forEach(oil => {
            const d = oilData[oil];
            container.innerHTML += `
            <div class="border rounded">
                <button class="w-full p-3 flex justify-between">
                    <span>${oil}</span><span>▼</span>
                </button>
                <div class="p-3 hidden">
                    Коробки: ${d.boxes}<br>
                    Этикетки: ${d.labels}<br>
                    Масло: ${d.oil} мл
                </div>
            </div>`;
        });

        container.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => btn.nextElementSibling.classList.toggle('hidden');
        });
    }

    function renderSupplies() {
        const el = document.querySelector('custom-supplies-card');
        if (!el) return;
        el.setAttribute('lids', supplies.lids);
        el.setAttribute('bottles', supplies.bottles);
        el.setAttribute('manuals', supplies.manuals);
    }

});

// ---------- UPDATE SUPPLIES ----------
function updateSupplies(type) {
    const value = parseInt(document.getElementById(`edit-${type}`).value);
    if (isNaN(value)) return;

    db.collection("app").doc("supplies").get().then(doc => {
        const s = doc.data();
        s[type] = value;
        return db.collection("app").doc("supplies").set(s);
    }).then(() => location.reload());
}
