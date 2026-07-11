// SEA LORDS — vanilla JS (no framework, no build step)

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.accordion-item').forEach((item) => {
    const head = item.querySelector('.accordion-head');
    const panel = item.querySelector('.accordion-panel');
    if (!head || !panel) return;
    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.accordion-item.is-open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.accordion-panel').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach((b) => b.classList.remove('is-active'));
      tabPanels.forEach((p) => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      const panel = document.querySelector(`.tab-panel[data-tab="${target}"]`);
      if (panel) panel.classList.add('is-active');
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  const currentPage = document.body.getAttribute('data-page');
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.getAttribute('data-nav') === currentPage) link.classList.add('is-active');
  });

  const pickerGrid = document.getElementById('formPickerGrid');
  const wizardBox = document.getElementById('formWizard');
  if (pickerGrid && wizardBox) initFormBuilder(pickerGrid, wizardBox);

  const islandsGrid = document.getElementById('islandsGrid');
  if (islandsGrid) initIslandsPage(islandsGrid);

  const achvList = document.getElementById('achievementsList');
  if (achvList) initAchievements(achvList);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
});

/* ============================================================
   Achievements — EDIT THIS to record the "firsts" of the season.
============================================================ */
const ACHIEVEMENTS = [
  { icon: '🏆', title: 'اولین فرمانروا', holder: 'ثبت نشده' },
  { icon: '⚔', title: 'اولین جنگ', holder: 'ثبت نشده' },
  { icon: '👑', title: 'اولین تصرف', holder: 'ثبت نشده' },
  { icon: '🤝', title: 'اولین اتحاد', holder: 'ثبت نشده' },
  { icon: '💰', title: 'ثروتمندترین جزیره', holder: 'ثبت نشده' },
];

function initAchievements(container) {
  container.innerHTML = ACHIEVEMENTS.map((a) => `
    <div class="achv-row">
      <span class="achv-icon">${a.icon}</span>
      <span class="achv-title">${a.title}</span>
      <span class="achv-holder">${a.holder}</span>
    </div>`).join('');
}

/* ============================================================
   Islands data — EDIT THIS to assign owners/alliances/status.
   Everything else on the page updates automatically.
============================================================ */
const ISLANDS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `جزیره ${i + 1}`,
  owner: 'ندارد',
  alliance: 'ندارد',
  status: 'ندارد',
  desc: 'این جزیره آماده پذیرش یک فرمانرواست.',
}));

function initIslandsPage(grid) {
  grid.innerHTML = ISLANDS.map((isl) => `
    <div class="island-card" data-id="${isl.id}">
      <span class="isl-icon">🏝</span>
      <span class="isl-name">${isl.name}</span>
      <span class="isl-dot ${isl.owner === 'ندارد' ? 'is-free' : 'is-claimed'}"></span>
    </div>`).join('');

  grid.querySelectorAll('.island-card').forEach((card) => {
    card.addEventListener('click', () => {
      const isl = ISLANDS.find((x) => x.id === Number(card.getAttribute('data-id')));
      openIslandModal(isl);
    });
  });
}

function openIslandModal(isl) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-panel">
      <button type="button" class="modal-close" id="islModalClose">×</button>
      <div class="modal-head">
        <span class="item-emoji">🏝</span>
        <b>${isl.name}</b>
      </div>
      <div class="island-modal-row"><span>👑 فرمانروا</span><b>${isl.owner}</b></div>
      <div class="island-modal-row"><span>🤝 اتحاد</span><b>${isl.alliance}</b></div>
      <div class="island-modal-row"><span>📍 وضعیت</span><b>${isl.status}</b></div>
      <div class="modal-section-label">📜 توضیحات</div>
      <p class="modal-desc">${isl.desc}</p>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('#islModalClose').addEventListener('click', close);
}

/* ============================================================
   Game data — prices, stats, capacities, descriptions
   (kept in sync with the Market page)
============================================================ */
const RESOURCES = [
  { key: 'coin', label: 'سکه', icon: '💰', desc: 'واحد اصلی اقتصاد بازی که برای ساخت، آموزش و خرید استفاده می‌شود.' },
  { key: 'wood', label: 'چوب', icon: '🪵', desc: 'برای ساخت ساختمان‌ها، کشتی‌ها و برخی تجهیزات موردنیاز است.' },
  { key: 'stone', label: 'سنگ', icon: '🪨', desc: 'منبع اصلی ساخت سازه‌های دفاعی و ساختمان‌های مستحکم.' },
  { key: 'fish', label: 'ماهی', icon: '🐟', desc: 'غذای اصلی مردم و ارتش؛ بدون آن آموزش نیرو ممکن نیست.' },
  { key: 'pop', label: 'جمعیت', icon: '👥', desc: 'نیروی انسانی جزیره که در ساختمان‌ها فعالیت می‌کند یا سرباز می‌شود.' },
];

const TROOPS = [
  { key: 'spear', label: 'نیزه‌دار', icon: '🛡', cost: { coin: 20, fish: 4 }, stats: [{ label: '⚔ حمله', stars: 3 }, { label: '🛡 دفاع', stars: 5 }, { label: '🏃 سرعت', stars: 2 }], desc: 'نیروی دفاعی خط مقدم با مقاومت بالا در نبردها.' },
  { key: 'sword', label: 'شمشیرزن', icon: '🗡', cost: { coin: 30, fish: 5 }, stats: [{ label: '⚔ حمله', stars: 4 }, { label: '🛡 دفاع', stars: 3 }, { label: '🏃 سرعت', stars: 3 }], desc: 'نیروی متعادل با عملکرد مناسب در حمله و دفاع.' },
  { key: 'archer', label: 'کماندار', icon: '🏹', cost: { coin: 35, fish: 5 }, stats: [{ label: '⚔ حمله', stars: 5 }, { label: '🛡 دفاع', stars: 2 }, { label: '🏃 سرعت', stars: 4 }], desc: 'نیروی دوربرد با قدرت تهاجمی بالا و مناسب برای پشتیبانی.' },
  { key: 'axe', label: 'تبرزن', icon: '🪓', cost: { coin: 45, fish: 6 }, stats: [{ label: '⚔ حمله', stars: 5 }, { label: '🛡 دفاع', stars: 2 }, { label: '🏃 سرعت', stars: 2 }], desc: 'نیروی هجومی سنگین با قدرت تخریب بالا در نبردهای نزدیک.' },
];

const SHIPS = [
  { key: 'merchant', label: 'کشتی تجاری', icon: '🚢', cost: { coin: 250, wood: 150, stone: 50 }, capacity: 20, cargo: 500, stats: [{ label: '🛡 دفاع', stars: 2 }, { label: '🏃 سرعت', stars: 3 }], desc: 'مناسب برای حمل منابع، کالا و انجام تجارت میان جزایر.' },
  { key: 'transport', label: 'کشتی ترابری', icon: '⛴', cost: { coin: 350, wood: 220, stone: 80 }, capacity: 80, cargo: 200, stats: [{ label: '🛡 دفاع', stars: 3 }, { label: '🏃 سرعت', stars: 3 }], desc: 'برای جابه‌جایی سربازان و تجهیزات نظامی بین جزایر استفاده می‌شود.' },
  { key: 'escort', label: 'کشتی محافظ', icon: '🛡', cost: { coin: 450, wood: 280, stone: 120 }, capacity: 40, cargo: 100, stats: [{ label: '⚔ حمله', stars: 3 }, { label: '🛡 دفاع', stars: 5 }, { label: '🏃 سرعت', stars: 3 }], desc: 'وظیفه اسکورت کشتی‌های تجاری و دفاع از ناوگان را بر عهده دارد.' },
  { key: 'warship', label: 'کشتی جنگی', icon: '⚔', cost: { coin: 700, wood: 400, stone: 200 }, capacity: 60, cargo: 50, stats: [{ label: '⚔ حمله', stars: 5 }, { label: '🛡 دفاع', stars: 4 }, { label: '🏃 سرعت', stars: 2 }], desc: 'اصلی‌ترین نیروی دریایی در نبردها و حمله به ناوگان دشمن.' },
];

const BUILDINGS = [
  { key: 'house', label: 'خانه مسکونی', icon: '🏘', cost: { coin: 150, wood: 80, stone: 50 }, stats: [{ label: '👥 جمعیت', value: '+10' }, { label: '📈 بازده', stars: 3 }], desc: 'افزایش ظرفیت جمعیت جزیره.' },
  { key: 'lumber', label: 'اردوگاه چوب‌بری', icon: '🪵', cost: { coin: 200, wood: 60, stone: 80 }, stats: [{ label: '🪵 تولید', stars: 5 }, { label: '⚡ سرعت', stars: 3 }], desc: 'تولید چوب موردنیاز برای ساختمان‌ها و کشتی‌ها.' },
  { key: 'quarry', label: 'معدن سنگ', icon: '🪨', cost: { coin: 220, wood: 70, stone: 90 }, stats: [{ label: '🪨 تولید', stars: 5 }, { label: '⚡ سرعت', stars: 3 }], desc: 'تولید سنگ جهت توسعه سازه‌ها و استحکامات.' },
  { key: 'workshop', label: 'کارگاه ادوات', icon: '🛠', cost: { coin: 350, wood: 120, stone: 120 }, stats: [{ label: '⚔ تولید تجهیزات', stars: 5 }, { label: '⚡ سرعت', stars: 3 }], desc: 'تولید شمشیر، نیزه، کمان و تبر برای آموزش سربازان.' },
  { key: 'harbor', label: 'بندر', icon: '⚓', cost: { coin: 500, wood: 250, stone: 180 }, stats: [{ label: '🚢 ظرفیت', stars: 5 }, { label: '⚡ سرعت ساخت', stars: 3 }], desc: 'افزایش ظرفیت ناوگان و امکان اعزام کشتی‌های بیشتر.' },
  { key: 'tower', label: 'برج نگهبانی', icon: '🏰', cost: { coin: 450, wood: 100, stone: 220 }, stats: [{ label: '🛡 دفاع', stars: 5 }, { label: '👁 دیدبانی', stars: 4 }], desc: 'افزایش قدرت دفاعی جزیره در برابر حملات دشمن.' },
];

const RESOURCE_ICON = { coin: '💰', wood: '🪵', stone: '🪨', fish: '🐟', pop: '👥' };
const RESOURCE_NAME = { coin: 'سکه', wood: 'چوب', stone: 'سنگ', fish: 'ماهی', pop: 'جمعیت' };

function todayFa() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}
function fmtDate(isoDate) {
  return isoDate ? isoDate.replaceAll('-', '/') : '';
}
function stepperSummary(items, counts) {
  const parts = items.filter((it) => (counts[it.key] || 0) > 0).map((it) => `${it.icon} ${counts[it.key]}x ${it.label}`);
  return parts.length ? parts.join('، ') : '—';
}
function starsHtml(n, max = 5) {
  return `<span class="stars"><span class="filled">${'★'.repeat(n)}</span>${'☆'.repeat(max - n)}</span>`;
}
function addCost(totals, cost, qty) {
  Object.keys(cost || {}).forEach((k) => { totals[k] = (totals[k] || 0) + cost[k] * qty; });
}
function formatTotals(totals) {
  const parts = Object.keys(totals).filter((k) => totals[k] > 0).map((k) => `${RESOURCE_ICON[k]} ${totals[k]} ${RESOURCE_NAME[k]}`);
  return parts.length ? parts.join('\n') : '—';
}
function cargoCapacityFromShips(values) {
  const merchantCargo = SHIPS.find((s) => s.key === 'merchant').cargo;
  const escortCargo = SHIPS.find((s) => s.key === 'escort').cargo;
  return (parseInt(values.merchant_ships, 10) || 0) * merchantCargo + (parseInt(values.escort_ships, 10) || 0) * escortCargo;
}

/* ============================================================
   Form definitions
============================================================ */
const SEA_LORDS_FORMS = [
  {
    key: 'war', icon: '⚔️', title: 'فرم اعلان جنگ', sub: 'ثبت رسمی یک حمله',
    fields: [
      { key: 'attacker', label: 'جزیره مهاجم', type: 'text' },
      { key: 'defender', label: 'جزیره مدافع', type: 'text' },
      { key: 'target', label: 'هدف حمله', type: 'text' },
      { key: 'fleet', label: 'ناوگان اعزامی', type: 'stepper', items: SHIPS, hint: 'اول ناوگان رو مشخص کن؛ ظرفیت نیروی قابل‌حمل بهش بستگی داره' },
      { key: 'troops', label: 'نیروهای اعزامی', type: 'stepper', items: TROOPS, hint: 'نیروها نمی‌تونن از ظرفیت ناوگانی که انتخاب کردی بیشتر بشن', capacityFrom: 'fleet' },
      { key: 'time', label: 'زمان آغاز حمله', type: 'datetime' },
      { key: 'scenario', label: 'رول جنگ', type: 'textarea', hint: 'حداقل ۵ خط و بدون محدودیت در حداکثر تعداد خطوط' },
      { key: 'signature', label: 'امضای فرمانروای مهاجم', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم اعلان جنگ
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره مهاجم : ${v.attacker}
|🔹| - جزیره مدافع : ${v.defender}
|🔹| - هدف حمله : ${v.target}
|🔹| - ناوگان اعزامی : ${v.fleet}
|🔹| - تعداد نیروهای اعزامی : ${v.troops}
|🔹| - زمان آغاز حمله : ${v.time}

📝 رول جنگ:
${v.scenario}

🖋️ امضای فرمانروای مهاجم : ${v.signature}`,
  },
  {
    key: 'trade', icon: '🤝', title: 'فرم تجارت', sub: 'مبادله منابع بین دو جزیره',
    fields: [
      { key: 'from', label: 'جزیره ارسال‌کننده', type: 'text' },
      { key: 'to', label: 'جزیره دریافت‌کننده', type: 'text' },
      { key: 'merchant_ships', label: 'تعداد کشتی‌های تجاری', type: 'number', min: 0, max: 20 },
      { key: 'escort_ships', label: 'تعداد کشتی‌های محافظ', type: 'number', min: 0, max: 20 },
      {
        key: 'sent', label: 'منابع ارسالی', type: 'stepper', items: RESOURCES,
        hint: 'مقدار کل نمی‌تونه از ظرفیت کشتی‌هایی که مشخص کردی بیشتر بشه',
        capacityCalc: cargoCapacityFromShips, capacityLabel: '📦 ظرفیت محموله', capacityUnit: 'واحد کالا',
        capacityEmptyMsg: '⚠️ اول تعداد کشتی رو مشخص کن',
      },
      {
        key: 'received', label: 'منابع دریافتی', type: 'stepper', items: RESOURCES,
        hint: 'مقدار کل نمی‌تونه از ظرفیت کشتی‌هایی که مشخص کردی بیشتر بشه',
        capacityCalc: cargoCapacityFromShips, capacityLabel: '📦 ظرفیت محموله', capacityUnit: 'واحد کالا',
        capacityEmptyMsg: '⚠️ اول تعداد کشتی رو مشخص کن',
      },
      { key: 'signature', label: 'امضای فرستنده (امضای شما)', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم تجارت
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره ارسال‌کننده : ${v.from}
|🔹| - جزیره دریافت‌کننده : ${v.to}
|🔹| - منابع ارسالی : ${v.sent}
|🔹| - منابع دریافتی : ${v.received}
|🔹| - تعداد کشتی‌های تجاری : ${v.merchant_ships}
|🔹| - تعداد کشتی‌های محافظ : ${v.escort_ships}
|🔹| - تاریخ ثبت : ${todayFa()}
🖋️ امضای فرستنده : ${v.signature}
🖋️ امضای دریافت‌کننده :`,
  },
  {
    key: 'capture', icon: '🏝', title: 'فرم درخواست تصرف', sub: 'ثبت تصرف جزیره پس از پیروزی',
    fields: [
      { key: 'attacker', label: 'جزیره مهاجم', type: 'text' },
      { key: 'island', label: 'جزیره موردنظر', type: 'text' },
      { key: 'battle_date', label: 'تاریخ نبرد', type: 'date' },
      { key: 'signature', label: 'امضای فرمانروای پیروز', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم درخواست تصرف
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره مهاجم : ${v.attacker}
|🔹| - جزیره موردنظر : ${v.island}
|🔹| - تاریخ نبرد : ${fmtDate(v.battle_date)}
|🔹| - نتیجه اعلام‌شده توسط مدیریت : (توسط مدیریت تکمیل می‌شود)
🖋️ امضای فرمانروای پیروز : ${v.signature}`,
  },
  {
    key: 'alliance', icon: '🤝', title: 'فرم ساخت اتحاد', sub: 'تشکیل یک اتحاد رسمی',
    fields: [
      { key: 'name', label: 'نام اتحاد', type: 'text' },
      { key: 'founder_island', label: 'جزیره بنیان‌گذار', type: 'text' },
      { key: 'founder_lord', label: 'فرمانروای بنیان‌گذار', type: 'text' },
      { key: 'members', label: 'اعضای اولیه', type: 'tag-list', hint: 'اسم هر عضو رو بنویس و بزن +، می‌تونی چندتا اضافه کنی' },
      { key: 'goal', label: 'هدف از تشکیل اتحاد', type: 'text' },
      { key: 'signature', label: 'امضای بنیان‌گذار', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم ساخت اتحاد
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - نام اتحاد : ${v.name}
|🔹| - جزیره بنیان‌گذار : ${v.founder_island}
|🔹| - فرمانروای بنیان‌گذار : ${v.founder_lord}
|🔹| - اعضای اولیه : ${v.members}
|🔹| - هدف از تشکیل اتحاد : ${v.goal}
|🔹| - تاریخ ثبت : ${todayFa()}
🖋️ امضای بنیان‌گذار : ${v.signature}`,
  },
  {
    key: 'peace', icon: '🕊', title: 'فرم درخواست صلح', sub: 'پایان دادن به یک جنگ',
    fields: [
      { key: 'island1', label: 'جزیره اول (جزیره شما)', type: 'text' },
      { key: 'island2', label: 'جزیره دوم', type: 'text' },
      { key: 'duration', label: 'مدت پیمان (تعداد بازده)', type: 'number', min: 1, max: 60, unit: 'بازده' },
      { key: 'terms', label: 'شرایط توافق', type: 'textarea' },
      { key: 'signature', label: 'امضای فرمانروای اول (امضای شما)', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم درخواست صلح
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره اول : ${v.island1}
|🔹| - جزیره دوم : ${v.island2}
|🔹| - مدت پیمان : ${v.duration} بازده
|🔹| - شرایط توافق : ${v.terms}
🖋️ امضای فرمانروای اول : ${v.signature}
🖋️ امضای فرمانروای دوم :`,
  },
  {
    key: 'loot', icon: '☠️', title: 'فرم غارت', sub: 'ثبت غنیمت پس از پیروزی',
    fields: [
      { key: 'winner', label: 'جزیره پیروز', type: 'text' },
      { key: 'loser', label: 'جزیره شکست‌خورده', type: 'text' },
      { key: 'battle_date', label: 'تاریخ نبرد', type: 'date' },
      { key: 'ships', label: 'کشتی‌های حمل غنیمت', type: 'stepper', items: SHIPS, hint: 'تعداد هر کشتی که برای حمل غنیمت اعزام می‌شه' },
      { key: 'signature', label: 'امضای فرمانروای پیروز', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم غارت
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره پیروز : ${v.winner}
|🔹| - جزیره شکست‌خورده : ${v.loser}
|🔹| - تاریخ نبرد : ${fmtDate(v.battle_date)}
|🔹| - تعداد کشتی‌های حمل غنیمت : ${v.ships}

📝 میزان غنیمت پس از بررسی نبرد، توسط مدیریت تعیین و ثبت خواهد شد.

🖋️ امضای فرمانروای پیروز : ${v.signature}`,
  },
  {
    key: 'purchase', icon: '🛒', title: 'فرم خرید', sub: 'خرید ساختمان، ارتش و ناوگان — همه با هم',
    fields: [
      { key: 'island', label: 'نام جزیره', type: 'text' },
      { key: 'lord', label: 'نام فرمانروا', type: 'text' },
      { key: 'cart', label: 'سبد خرید', type: 'cart', hint: 'از هر دسته هرچقدر خواستی اضافه کن؛ روی ℹ️ بزن قیمت و قدرت هر آیتم رو ببین' },
      { key: 'signature', label: 'امضای فرمانروا', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم خرید
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - نام جزیره : ${v.island}
|🔹| - نام فرمانروا : ${v.lord}

|🔹| - آیتم‌های خریداری‌شده :
${v.cart_items}

|🔹| - هزینه کل :
${v.cart_totals}

|🔹| - تاریخ ثبت : ${todayFa()}
🖋️ امضای فرمانروا : ${v.signature}`,
  },
];

/* ============================================================
   Wizard engine
============================================================ */
function initFormBuilder(pickerGrid, wizardBox) {
  let state = null;

  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  function openItemModal(item) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const priceRows = item.cost
      ? Object.keys(item.cost).map((k) => `<div class="stat-row"><span>${RESOURCE_ICON[k]} ${RESOURCE_NAME[k]}</span><b>${item.cost[k]}</b></div>`).join('')
      : '<div class="stat-row"><span>منبع خام است، قیمت ندارد</span></div>';
    const powerRows = (item.stats || []).map((s) =>
      `<div class="stat-row"><span>${s.label}</span>${s.stars !== undefined ? starsHtml(s.stars) : `<b>${s.value}</b>`}</div>`
    ).join('') || '<div class="stat-row"><span>—</span></div>';
    const capacityRow = item.capacity ? `<div class="stat-row"><span>👥 ظرفیت حمل سرباز</span><b>${item.capacity}</b></div>` : '';

    overlay.innerHTML = `
      <div class="modal-panel">
        <button type="button" class="modal-close" id="modalClose">×</button>
        <div class="modal-head">
          <span class="item-emoji">${item.icon}</span>
          <b>${item.label}</b>
        </div>
        <div class="modal-section-label">💰 قیمت</div>
        <div class="stat-list">${priceRows}</div>
        <div class="modal-section-label">⭐ قدرت</div>
        <div class="stat-list">${powerRows}${capacityRow}</div>
        <div class="modal-section-label">📝 توضیحات</div>
        <p class="modal-desc">${item.desc || 'توضیحاتی ثبت نشده.'}</p>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('#modalClose').addEventListener('click', close);
  }

  function renderPicker() {
    pickerGrid.innerHTML = SEA_LORDS_FORMS.map((f, i) => `
      <button class="form-pick-card" data-index="${i}">
        <span class="fp-icon">${f.icon}</span>
        <span><span class="fp-title">${f.title}</span><span class="fp-sub">${f.sub}</span></span>
      </button>`).join('');
    pickerGrid.querySelectorAll('.form-pick-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const form = SEA_LORDS_FORMS[Number(btn.getAttribute('data-index'))];
        state = { form, step: 0, values: {}, stepperCounts: {}, tagItems: {}, cart: { building: {}, troop: {}, ship: {} } };
        pickerGrid.style.display = 'none';
        wizardBox.style.display = 'block';
        renderWizard();
        wizardBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function backToPicker() {
    state = null;
    wizardBox.style.display = 'none';
    wizardBox.innerHTML = '';
    pickerGrid.style.display = 'grid';
    pickerGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function fleetCapacity() {
    const fleetCounts = state.stepperCounts.fleet || {};
    return SHIPS.reduce((sum, s) => sum + (fleetCounts[s.key] || 0) * s.capacity, 0);
  }
  function stepperTotal(key) {
    return Object.values(state.stepperCounts[key] || {}).reduce((a, b) => a + b, 0);
  }
  function getFieldCapacity(field) {
    if (field.capacityFrom) return fleetCapacity();
    if (field.capacityCalc) return field.capacityCalc(state.values);
    return Infinity;
  }

  function renderCapacityBox(field) {
    const cap = getFieldCapacity(field);
    const used = stepperTotal(field.key);
    const full = used >= cap;
    const label = field.capacityLabel || '👥 ظرفیت ناوگان';
    const unit = field.capacityUnit || 'نفر';
    return `<div class="capacity-box ${full ? 'is-full' : ''}">
      <span>${label}</span>
      <b>${used} / ${cap} ${unit}</b>
    </div>`;
  }

  function stepperRowsHtml(items, counts, showInfo) {
    return items.map((it) => `
      <div class="stepper-row" data-key="${it.key}">
        <span class="st-icon">${it.icon}</span>
        <span class="st-label-wrap">
          <span class="st-label">${it.label}</span>
          ${showInfo ? `<button type="button" class="info-btn" data-info="${it.key}">ℹ️</button>` : ''}
        </span>
        <div class="stepper-controls">
          <button type="button" class="stepper-btn" data-action="dec">−</button>
          <span class="stepper-count" data-count>${counts[it.key] || 0}</span>
          <button type="button" class="stepper-btn" data-action="inc">+</button>
        </div>
      </div>`).join('');
  }

  function cartSummaryHtml() {
    const { building, troop, ship } = state.cart;
    let count = 0;
    const totals = {};
    BUILDINGS.forEach((b) => { const c = building[b.key] || 0; if (c) { count += c; addCost(totals, b.cost, c); } });
    TROOPS.forEach((t) => { const c = troop[t.key] || 0; if (c) { count += c; addCost(totals, t.cost, c); } });
    SHIPS.forEach((s) => { const c = ship[s.key] || 0; if (c) { count += c; addCost(totals, s.cost, c); } });

    if (count === 0) {
      return `<div class="cart-summary"><div class="cart-summary-empty">هنوز چیزی به سبد اضافه نکردی</div></div>`;
    }
    const rows = Object.keys(totals).filter((k) => totals[k] > 0)
      .map((k) => `<div class="cart-summary-row"><span>${RESOURCE_ICON[k]} ${RESOURCE_NAME[k]}</span><b>${totals[k]}</b></div>`).join('');
    return `<div class="cart-summary">
      <div class="cart-summary-count">🧺 ${count} آیتم انتخاب شده</div>
      ${rows}
    </div>`;
  }

  function wireCartCategory(catKey, items) {
    document.querySelectorAll(`#fbCart-${catKey} .stepper-row`).forEach((row) => {
      const key = row.getAttribute('data-key');
      row.querySelectorAll('.stepper-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const counts = state.cart[catKey];
          const current = counts[key] || 0;
          counts[key] = btn.getAttribute('data-action') === 'inc' ? current + 1 : Math.max(0, current - 1);
          row.querySelector('[data-count]').textContent = counts[key];
          document.getElementById('fbCartSummary').innerHTML = cartSummaryHtml();
        });
      });
      const infoBtn = row.querySelector('.info-btn');
      if (infoBtn) infoBtn.addEventListener('click', () => {
        const item = items.find((it) => it.key === key);
        openItemModal(item);
      });
    });
  }

  function fieldInputHtml(field, currentVal) {
    if (field.type === 'textarea') return `<textarea class="field-textarea" id="fbInput">${currentVal || ''}</textarea>`;
    if (field.type === 'date') return `<input class="field-input" id="fbInput" type="date" value="${currentVal || ''}">`;
    if (field.type === 'datetime') return `<input class="field-input" id="fbInput" type="datetime-local" value="${currentVal || ''}">`;

    if (field.type === 'select') {
      return `<div class="custom-select" id="fbCustomSelect" data-value="${currentVal || ''}">
        <button type="button" class="custom-select-btn ${!currentVal ? 'is-placeholder' : ''}" id="fbSelectBtn">
          <span id="fbSelectLabel">${currentVal || 'یکی رو انتخاب کن'}</span>
          <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="custom-select-list" id="fbSelectList" style="display:none;">
          ${field.options.map((o) => `<button type="button" class="custom-select-option ${o === currentVal ? 'is-selected' : ''}" data-value="${o}">${o}</button>`).join('')}
        </div>
      </div>`;
    }

    if (field.type === 'number') {
      const min = field.min ?? 0, max = field.max ?? 100;
      const val = currentVal !== undefined && currentVal !== '' ? currentVal : min;
      return `<div class="number-field">
        <input type="range" id="fbRange" min="${min}" max="${max}" value="${val}">
        <input type="number" class="number-box" id="fbInput" min="${min}" max="${max}" value="${val}">
      </div>`;
    }

    if (field.type === 'stepper') {
      const counts = state.stepperCounts[field.key] || {};
      const capBox = (field.capacityFrom || field.capacityCalc) ? renderCapacityBox(field) : '';
      return `${capBox}<div class="stepper-list" id="fbStepperList">${stepperRowsHtml(field.items, counts, true)}</div>`;
    }

    if (field.type === 'tag-list') {
      const tags = state.tagItems[field.key] || [];
      return `<div class="tag-input-row">
        <input class="field-input" id="fbTagInput" type="text" placeholder="اسم عضو را بنویس...">
        <button type="button" class="tag-add-btn" id="fbTagAdd">+</button>
      </div>
      <div class="tag-list" id="fbTagList">
        ${tags.length ? tags.map((t, i) => `<span class="tag-chip">${t}<button type="button" data-remove="${i}">×</button></span>`).join('') : '<span class="tag-empty-hint">هنوز عضوی اضافه نشده</span>'}
      </div>`;
    }

    if (field.type === 'cart') {
      const cats = [
        { key: 'building', title: '🏗 ساختمان‌ها', items: BUILDINGS },
        { key: 'troop', title: '⚔ ارتش', items: TROOPS },
        { key: 'ship', title: '🚢 ناوگان', items: SHIPS },
      ];
      const sections = cats.map((c) => `
        <div class="cart-category" id="fbCart-${c.key}">
          <div class="cart-category-title">${c.title}</div>
          <div class="stepper-list">${stepperRowsHtml(c.items, state.cart[c.key], true)}</div>
        </div>`).join('');
      return `${sections}<div id="fbCartSummary">${cartSummaryHtml()}</div>`;
    }

    return `<input class="field-input" id="fbInput" type="text" value="${(currentVal || '').toString().replace(/"/g, '&quot;')}" placeholder="اینجا بنویس...">`;
  }

  function wireFieldEvents(field) {
    if (field.type === 'number') {
      const range = document.getElementById('fbRange');
      const box = document.getElementById('fbInput');
      range.addEventListener('input', () => { box.value = range.value; });
      box.addEventListener('input', () => { range.value = box.value; });
    }

    if (field.type === 'stepper') {
      if (!state.stepperCounts[field.key]) state.stepperCounts[field.key] = {};
      const counts = state.stepperCounts[field.key];
      document.querySelectorAll('#fbStepperList .stepper-row').forEach((row) => {
        const key = row.getAttribute('data-key');
        row.querySelectorAll('.stepper-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const current = counts[key] || 0;
            if (action === 'inc') {
              if (field.capacityFrom || field.capacityCalc) {
                const cap = getFieldCapacity(field);
                const used = Object.values(counts).reduce((a, b) => a + b, 0);
                if (used + 1 > cap) {
                  showToast(cap === 0 ? (field.capacityEmptyMsg || '⚠️ اول ناوگان اعزام کن') : '⚠️ ظرفیت تکمیله');
                  return;
                }
              }
              counts[key] = current + 1;
            } else {
              counts[key] = Math.max(0, current - 1);
            }
            row.querySelector('[data-count]').textContent = counts[key];
            if (field.capacityFrom || field.capacityCalc) {
              const capBoxEl = document.querySelector('.capacity-box');
              if (capBoxEl) capBoxEl.outerHTML = renderCapacityBox(field);
            }
          });
        });
        const infoBtn = row.querySelector('.info-btn');
        if (infoBtn) infoBtn.addEventListener('click', () => {
          const item = field.items.find((it) => it.key === key);
          openItemModal(item);
        });
      });
    }

    if (field.type === 'tag-list') {
      if (!state.tagItems[field.key]) state.tagItems[field.key] = [];
      const tags = state.tagItems[field.key];
      const input = document.getElementById('fbTagInput');
      const listEl = document.getElementById('fbTagList');
      function redrawTags() {
        listEl.innerHTML = tags.length ? tags.map((t, i) => `<span class="tag-chip">${t}<button type="button" data-remove="${i}">×</button></span>`).join('') : '<span class="tag-empty-hint">هنوز عضوی اضافه نشده</span>';
        listEl.querySelectorAll('[data-remove]').forEach((btn) => btn.addEventListener('click', () => { tags.splice(Number(btn.getAttribute('data-remove')), 1); redrawTags(); }));
      }
      function addTag() { const val = input.value.trim(); if (!val) return; tags.push(val); input.value = ''; redrawTags(); input.focus(); }
      document.getElementById('fbTagAdd').addEventListener('click', addTag);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } });
      redrawTags();
    }

    if (field.type === 'select') {
      const wrap = document.getElementById('fbCustomSelect');
      const btn = document.getElementById('fbSelectBtn');
      const list = document.getElementById('fbSelectList');
      const label = document.getElementById('fbSelectLabel');
      btn.addEventListener('click', () => {
        const willOpen = list.style.display === 'none';
        list.style.display = willOpen ? 'block' : 'none';
        wrap.classList.toggle('is-open', willOpen);
      });
      list.querySelectorAll('.custom-select-option').forEach((opt) => {
        opt.addEventListener('click', () => {
          const val = opt.getAttribute('data-value');
          wrap.setAttribute('data-value', val);
          label.textContent = val;
          btn.classList.remove('is-placeholder');
          list.querySelectorAll('.custom-select-option').forEach((o) => o.classList.remove('is-selected'));
          opt.classList.add('is-selected');
          list.style.display = 'none';
          wrap.classList.remove('is-open');
        });
      });
    }

    if (field.type === 'cart') {
      wireCartCategory('building', BUILDINGS);
      wireCartCategory('troop', TROOPS);
      wireCartCategory('ship', SHIPS);
    }
  }

  function readFieldValue(field) {
    if (field.type === 'stepper') return stepperSummary(field.items, state.stepperCounts[field.key] || {});
    if (field.type === 'tag-list') return (state.tagItems[field.key] || []).join('، ');
    if (field.type === 'select') { const wrap = document.getElementById('fbCustomSelect'); return wrap ? wrap.getAttribute('data-value') || '' : ''; }
    const el = document.getElementById('fbInput');
    return el ? el.value.trim() : '';
  }

  function fieldHasValue(field) {
    if (field.type === 'stepper') return Object.values(state.stepperCounts[field.key] || {}).some((c) => c > 0);
    if (field.type === 'tag-list') return (state.tagItems[field.key] || []).length > 0;
    if (field.type === 'select') { const wrap = document.getElementById('fbCustomSelect'); return !!(wrap && wrap.getAttribute('data-value')); }
    if (field.type === 'cart') {
      const { building, troop, ship } = state.cart;
      return [building, troop, ship].some((cat) => Object.values(cat).some((c) => c > 0));
    }
    const el = document.getElementById('fbInput');
    return el && el.value.trim().length > 0;
  }

  function finalizeCart() {
    const { building, troop, ship } = state.cart;
    const lines = [];
    const totals = {};
    BUILDINGS.forEach((b) => { const c = building[b.key] || 0; if (c) { lines.push(`${b.icon} ${b.label} × ${c}`); addCost(totals, b.cost, c); } });
    TROOPS.forEach((t) => { const c = troop[t.key] || 0; if (c) { lines.push(`${t.icon} ${t.label} × ${c}`); addCost(totals, t.cost, c); } });
    SHIPS.forEach((s) => { const c = ship[s.key] || 0; if (c) { lines.push(`${s.icon} ${s.label} × ${c}`); addCost(totals, s.cost, c); } });
    state.values.cart_items = lines.join('\n');
    state.values.cart_totals = formatTotals(totals);
  }

  function renderWizard() {
    const { form, step, values } = state;
    const totalSteps = form.fields.length;

    if (step < totalSteps) {
      const field = form.fields[step];
      const pct = Math.round((step / (totalSteps + 1)) * 100);
      const currentVal = values[field.key];

      wizardBox.innerHTML = `
        <button class="wizard-back" id="fbBackToPicker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6"/></svg>
          انتخاب فرم دیگر
        </button>
        <div class="wizard-progress">مرحله ${step + 1} از ${totalSteps} — ${form.title}</div>
        <div class="wizard-track"><div class="wizard-track-fill" style="width:${pct}%"></div></div>
        <div class="field-group">
          <label class="field-label">${field.label}</label>
          ${fieldInputHtml(field, currentVal)}
          ${field.hint ? `<span class="field-hint">${field.hint}</span>` : ''}
        </div>
        <div class="wizard-actions">
          ${step > 0 ? `<button class="btn btn-ghost" id="fbPrev">بازگشت</button>` : ''}
          <button class="btn btn-gold" id="fbNext">${step === totalSteps - 1 ? 'تکمیل فرم ✅' : 'بعدی ←'}</button>
        </div>`;

      wireFieldEvents(field);
      document.getElementById('fbBackToPicker').addEventListener('click', backToPicker);
      if (step > 0) {
        document.getElementById('fbPrev').addEventListener('click', () => {
          if (field.type === 'cart') finalizeCart(); else values[field.key] = readFieldValue(field);
          state.step -= 1; renderWizard();
        });
      }
      document.getElementById('fbNext').addEventListener('click', () => {
        if (!fieldHasValue(field)) { showToast('⚠️ این بخش خالیه، پرش کن'); return; }
        if (field.type === 'cart') finalizeCart(); else values[field.key] = readFieldValue(field);
        state.step += 1; renderWizard();
      });
    } else {
      const text = form.compile(values);
      wizardBox.innerHTML = `
        <button class="wizard-back" id="fbBackToPicker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6"/></svg>
          انتخاب فرم دیگر
        </button>
        <div class="wizard-progress">✅ فرم تکمیل شد — ${form.title}</div>
        <div class="compiled-box">${text.replace(/</g, '&lt;')}</div>
        <div class="wizard-actions">
          <button class="btn btn-ghost" id="fbEdit">✏️ ویرایش آخرین بخش</button>
          <button class="btn btn-ghost" id="fbCopy">📋 کپی متن</button>
        </div>
        <div class="wizard-actions">
          <a class="btn btn-gold" id="fbSubmit" href="https://rubika.ir/MeeSHaYaN" target="_blank" rel="noopener">📨 ثبت نهایی و ارسال به پشتیبانی</a>
        </div>
        <div class="wizard-actions">
          <button class="btn btn-ghost" id="fbRestart">🔄 ساخت یک فرم جدید</button>
        </div>`;
      document.getElementById('fbBackToPicker').addEventListener('click', backToPicker);
      document.getElementById('fbEdit').addEventListener('click', () => { state.step -= 1; renderWizard(); });
      document.getElementById('fbCopy').addEventListener('click', () => { copyText(text); showToast('📋 متن کپی شد'); });
      document.getElementById('fbSubmit').addEventListener('click', () => { copyText(text); showToast('📋 متن کپی شد؛ داخل چت پیست و ارسال کن'); });
      document.getElementById('fbRestart').addEventListener('click', backToPicker);
    }
  }

  renderPicker();
}
