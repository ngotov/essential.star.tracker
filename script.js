<script type="module">
/* =========================
   FIREBASE
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot
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

/* =========================
   DATA
========================= */
const OILS_LIST = [
  'Аир','Анис','Апельсин','Базилик','Бензоин','Бергамот','Бэй','Ваниль',
  'Вербена','Ветивер','Гвоздика','Герань','Голубой лотос','Грейпфрут','Ель',
  'Жасмин','Женьшень','Зелёный чай','Имбирь','Иланг-иланг','Иссоп','Какао',
  'Камфора','Каннабис','Кардамон','Каяпут','Кедр','Кинза','Кипарис','Кориандр',
  'Корица','Кофе','Куркума','Лаванда','Лавр','Ладан','Лайм','Лемонграсс',
  'Лилия','Лимон','Магнолия','Майоран','Мандарин','Мелисса','Мирра','Можжевельник',
  'Морковь','Мускатный орех','Мята','Нарцисс','Нероли','Орегано','Пальмароза',
  'Пачули','Петегрейн','Петрушка','Пижма','Пион','Пихта','Полынь','Помело',
  'Роза','Ромашка','Розмарин','Сандал','Сельдерей','Сосна','Стиракс','Табак',
  'Тимьян','Тмин','Укроп','Фенхель','Фрезия','Чайное дерево','Чеснок',
  'Чёрный перец','Шафран','Шалфей мускатный','Эвкалипт'
];

const INITIAL_DATA = {
  universal: { caps: 10000, bottles: 10000, instructions: 10000 },
  oils: OILS_LIST.reduce((a, o) => {
    a[o] = { ml: 5000, boxes: 500, labels: 500 };
    return a;
  }, {}),
  lastUpdated: new Date().toISOString()
};

let inventoryData = null;
let sortDescending = true;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await initFirestore();
  initListeners();
});

/* =========================
   FIRESTORE LOGIC
========================= */
async function initFirestore() {
  const snap = await getDoc(inventoryRef);

  if (!snap.exists()) {
    await setDoc(inventoryRef, structuredClone(INITIAL_DATA));
  }

  onSnapshot(inventoryRef, (docSnap) => {
    if (docSnap.exists()) {
      inventoryData = docSnap.data();
      renderAll();
    }
  });
}

function saveToFirestore() {
  inventoryData.lastUpdated = new Date().toISOString();
  setDoc(inventoryRef, inventoryData);
}

/* =========================
   UI LOGIC (ТВОЙ КОД, БЕЗ localStorage)
========================= */
function initListeners() {
  document.getElementById("updateAll").onclick = updateAllManually;
  document.getElementById("resetAll").onclick = resetAllData;
  document.getElementById("submitProduction").onclick = submitProduction;
}

function renderAll() {
  // тут твои renderUniversalSupplies(), renderOilsTable() и т.д.
}

/* =========================
   ACTIONS
========================= */
function updateAllManually() {
  inventoryData.universal.caps = +editCaps.value || 0;
  inventoryData.universal.bottles = +editBottles.value || 0;
  inventoryData.universal.instructions = +editInstructions.value || 0;
  saveToFirestore();
}

function submitProduction() {
  const oil = productionOilSelect.value;
  const qty = +productionQuantity.value || 0;
  if (!oil || qty <= 0) return;

  inventoryData.universal.caps -= qty;
  inventoryData.universal.bottles -= qty;
  inventoryData.universal.instructions -= qty;
  inventoryData.oils[oil].ml -= qty * 10;
  inventoryData.oils[oil].boxes -= qty;
  inventoryData.oils[oil].labels -= qty;

  saveToFirestore();
}

function resetAllData() {
  if (confirm("Сбросить все данные?")) {
    inventoryData = structuredClone(INITIAL_DATA);
    saveToFirestore();
  }
}
</script>
