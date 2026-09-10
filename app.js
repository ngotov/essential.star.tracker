const SECTIONS={1:["Универсальная база","Самые переносимые поп/рок-скелеты и их ключевые вариации."],2:["Свинг, шаффл, блюз и фанк","Триольное деление, ghost-ноты и pocket."],3:["Рок, кантри, панк и металл","Те же опорные доли, но другая атака, скорость и плотность."],4:["Hip-hop, R&B и современный рэп","Breaks, sampling, swing, half-time, trap и drill."],5:["Электронная и клубная музыка","Four-on-the-floor, broken beats, bass music и экстремальная редактура."],6:["Ямайка, Карибы и Латинская Америка","Timeline-паттерны и взаимосвязанные голоса ансамбля."],7:["Бразилия и Африка","Timeline, низ, shaker, ответ и циклическая вариация."],8:["Арабские iqa‘at, индийские tala, flamenco и additive meters","Циклы счёта: сначала ориентация в форме, потом украшения."],9:["Нечётные размеры и продвинутые временные конструкции","Odd meter, cross-rhythm, polymeter и controlled chaos."]};
const SPECIAL={
"1.1":"Бочка на 1 и 3, малый на 2 и 4, хэт восьмыми. Нулевая точка для попа и рока.",
"1.2":"Тот же backbeat, но дополнительная бочка создаёт толчок между сильными долями.",
"1.3":"Backbeat стабилен, а бочка предвосхищает доли и начинает разговаривать с басом.",
"1.4":"Ghost-ноты, удары на e/a и открытый хэт превращают статичный такт в вопрос–ответ.",
"1.6":"Бочка на каждой четверти, clap/snare на 2 и 4 и оффбит-хэт дают прямой танцевальный вектор.",
"1.7":"Главный snare один раз на 3: пульс может быть быстрым, а ощущение — тяжёлым half-time.",
"1.9":"Два низких удара и общий хлопок: массовый телесный жест до появления обычной установки.",
"1.10":"Compound meter: крупная доля делится на три; это не просто swing поверх 4/4.",
"2.2":"Пара восьмых ощущается как первая и третья ноты триоли: длинно–коротко при стабильном backbeat.",
"2.5":"Half-time shuffle: snare на 3, триольный хэт и очень тихие внутренние ghost-ноты.",
"2.6":"Тяжёлый роковый родственник Purdie shuffle: interlock бочки, хэта и ghosts на триольной сетке.",
"2.7":"Rosanna — двухтактовый half-time shuffle: swung hats, snare на 3, ghosts и меняющаяся синкопа бочки.",
"2.12":"Пятиударная Bo Diddley-клетка создаёт 3–3–2-подобное движение поверх четырёхдольного пульса.",
"4.2":"Boom bap: тяжёлая бочка и snare на backbeat, sampled feel и пространство между ударами.",
"4.6":"Dilla time: намеренно несовпадающие микросмещения слоёв создают pocket, а не случайный humanize.",
"4.9":"Trap-каркас: half-time snare/clap, свободная бочка и быстрая поверхность хэта.",
"4.10":"Trap-грув меняет деление хэта внутри фразы: восьмые, шестнадцатые, триоли и rolls.",
"4.12":"UK/NY drill: скользящая синкопа kick/808 вокруг устойчивого half-time ориентира.",
"5.10":"2-step garage убирает часть прямых бочек: swing и snare оставляют узнаваемый пульс, но низ становится broken.",
"5.11":"Jungle: break режется и переставляется так, чтобы крупный пульс сохранялся под быстрыми ghost/snare событиями.",
"5.12":"DnB two-step: быстрый темп, snare-якоря и синкопированная бочка под непрерывной поверхностью.",
"5.13":"Dubstep half-step: проект быстрый, но большой snare на 3 заставляет тело слышать половинный темп.",
"6.3":"One drop оставляет первую долю пустой или лёгкой и ставит главный drum-акцент на третью.",
"6.6":"Dembow/reggaeton: повторяющаяся связка низких и высоких атак образует узнаваемый танцевальный двигатель.",
"6.9":"Tresillo/habanera/cinquillo — родственные синкопированные timeline-клетки, которые пережили множество жанров.",
"6.10":"Son clave — двухтактовый timeline 3–2 или 2–3, относительно которого ориентируются остальные партии.",
"6.11":"Rumba clave родственна son clave, но одна из атак сдвинута, отчего фраза ощущается острее.",
"7.6":"Afrobeat строится не одной установкой, а взаимной блокировкой kick, snare, guitar, shaker и percussion.",
"7.8":"Современный Afrobeats pop pocket часто оставляет много воздуха и избегает тяжёлого западного backbeat-шаблона.",
"7.12":"Amapiano: просторный pocket, shaker/perc и поздние мелодические log-drum удары.",
"8.1":"Maqsum — короткий универсальный арабский iqa‘: DUM/TAK-каркас сначала, ornaments потом.",
"8.7":"Keharwa — восьмиматрный цикл 4+4; важно слышать границу двух половин, а не только набор tabla-ударов.",
"8.9":"Teental: 16 матр, группы 4+4+4+4; sam и khali важнее количества украшений.",
"8.13":"Flamenco compás организуется системой акцентов внутри 12 пульсов, а не просто надписью 12/8.",
"8.16":"Kopanitsa 11/8 удобно сначала чувствовать как 2+2+3+2+2, где длинная группа служит ориентиром.",
"9.5":"Hemiola заставляет одну и ту же длительность попеременно читаться как две тройки и три двойки.",
"9.7":"Polymeter: партии повторяют циклы разной длины и снова сходятся только через общий большой период.",
"9.11":"Euclidean rhythm распределяет заданное число ударов по циклу максимально равномерно; rotation меняет характер.",
"9.12":"Controlled chaos — это не отсутствие структуры: вероятность и glitch работают, когда крупная фраза остаётся читаемой."
};
const GENERIC={1:"Базовый переносимый скелет: слушай опорные kick/snare и плотность поверхности.",2:"Здесь groove создают subdivision, динамика и microtiming; посадка важнее количества нот.",3:"Роковый словарь: характер задают backbeat, атака, скорость, тарелки и плотность ног.",4:"Hip-hop/R&B словарь: break, swing, half-time и взаимодействие бочки с басом.",5:"Клубный словарь: pulse, степень broken/four-on-floor движения и sound design.",6:"Timeline и ансамблевая логика: не своди стиль к одной партии барабанов.",7:"Слушай распределение функций между timeline, низом, shaker и ответными ударами.",8:"Это цикл счёта, а не просто drum-loop: сначала удерживай форму, затем добавляй ornaments.",9:"Продвинутая временная конструкция: сначала поймай крупную группировку, затем внутренние смещения."};
let rows=[],priority="all",current=null,stopTimer=null;
const esc=s=>String(s).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function stopAudio(){clearTimeout(stopTimer);if(current){current.pause();current=null}document.querySelectorAll(".play").forEach(b=>{b.classList.remove("playing");b.textContent="▶ Слушать"})}
function play(button,item,index){const was=button.classList.contains("playing");stopAudio();if(was)return;const section=Number(item.id.split(".")[0]),start=index*8.25,end=start+8,a=new Audio(`audio/section-${section}.mp3`);current=a;const begin=()=>{a.currentTime=start;a.play().then(()=>{button.classList.add("playing");button.textContent="■ Стоп";stopTimer=setTimeout(stopAudio,(end-start)*1000)}).catch(()=>{button.textContent="Ошибка аудио"})};if(a.readyState>=1)begin();else a.addEventListener("loadedmetadata",begin,{once:true});a.load()}
function youtube(ref){return `https://www.youtube.com/results?search_query=${encodeURIComponent(ref)}`}
function render(){let html="";for(let sec=1;sec<=9;sec++){const sr=rows.filter(x=>Number(x.id.split(".")[0])===sec),meta=SECTIONS[sec];html+=`<section class="section" id="section-${sec}"><div class="section-head"><div class="section-number">${sec}</div><div><h2>${esc(meta[0])}</h2><p>${esc(meta[1])} · ${sr.length} пунктов</p></div></div><div class="grid">`;sr.forEach((x,i)=>{html+=`<article class="card" data-priority="${x.priority}" data-search="${esc((x.id+" "+x.title+" "+x.ref).toLowerCase())}"><div class="card-top"><span class="id">${x.id}</span><span class="priority">ПРИОРИТЕТ ${x.priority}</span></div><h3>${esc(x.title)}</h3><div class="meta">${esc(x.meter)} · BPM ${esc(x.bpm)}</div><div class="description">${esc(SPECIAL[x.id]||GENERIC[sec])}</div><div class="player-row"><button class="play" data-id="${x.id}">▶ Слушать</button><a class="reference-link" target="_blank" rel="noopener" href="${youtube(x.ref)}">Референс ↗</a></div><div class="reference">${esc(x.ref)}</div></article>`});html+="</div></section>"}document.getElementById("app").innerHTML=html;document.querySelectorAll(".play").forEach(b=>{const item=rows.find(x=>x.id===b.dataset.id),sec=Number(item.id.split(".")[0]),index=rows.filter(x=>Number(x.id.split(".")[0])===sec).findIndex(x=>x.id===item.id);b.onclick=()=>play(b,item,index)});applyFilter()}
function applyFilter(){const q=document.getElementById("q").value.trim().toLowerCase();document.querySelectorAll(".card").forEach(c=>c.classList.toggle("hidden",!((priority==="all"||c.dataset.priority===priority)&&(!q||c.dataset.search.includes(q)))));document.querySelectorAll(".section").forEach(s=>s.classList.toggle("hidden",!s.querySelector(".card:not(.hidden)")))}
async function boot(){for(let sec=1;sec<=9;sec++){const r=await fetch(`data/section-${sec}.json`);if(!r.ok)throw new Error(`section ${sec}`);rows.push(...await r.json());const a=document.createElement("a");a.className="nav-pill";a.href=`#section-${sec}`;a.textContent=`${sec}. ${SECTIONS[sec][0]}`;document.getElementById("nav").appendChild(a)}render()}
document.getElementById("q").addEventListener("input",applyFilter);document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{priority=b.dataset.p;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));applyFilter()}));boot().catch(e=>{document.getElementById("app").innerHTML=`<div class="loading">Не удалось загрузить данные атласа: ${esc(e.message)}</div>`});