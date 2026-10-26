/* ===== 시간을 사세여 — 0단계 랜딩 ===== */

/**
 * 신청서를 받을 주소 (Formspree, Google Apps Script 등 JSON POST를 받는 곳).
 * 비워 두면 테스트 모드로 이 브라우저(localStorage)에만 저장된다.
 */
const SUBMIT_ENDPOINT = '';
const LOCAL_STORAGE_KEY = 'timebuy-applications';

/**
 * 카테고리와 위험 등급 (기획서 '카테고리와 허용 범위' 표 기준)
 * risk: low | mid | soon(높음 — 인증 체계가 갖춰진 뒤 오픈)
 */
const CATEGORIES = [
  { id: 'errand', name: '심부름·줄서기', risk: 'low', examples: '팝업 줄서기, 티켓팅 대기, 물건 전달', price: 15000, condition: '본인인증' },
  { id: 'pet', name: '반려동물', risk: 'low', examples: '강아지 산책, 방문 펫시터', price: 15000, condition: '본인인증, 반려동물 배상 규정' },
  { id: 'together', name: '같이 하기(동행)', risk: 'mid', examples: '놀이공원, 벚꽃놀이, 영화, 혼밥 탈출, 전시회', price: 13000, condition: '본인인증, 공개 장소만, 동성/이성 선택 표시' },
  { id: 'role', name: '역할 대행', risk: 'mid', examples: '하객·결혼식 친구, 가족 모임 동행, 면접·발표 연습 상대', price: 30000, condition: '본인인증, 금지 행위 동의' },
  { id: 'skill', name: '배움·재능', risk: 'mid', examples: '사진 촬영, 언어 교환, 운동 파트너, 등산 가이드', price: 25000, condition: '본인인증, 자격증 있으면 배지' },
  { id: 'talk', name: '말벗·고민 듣기', risk: 'mid', examples: '비대면 대화, 하소연 듣기', price: 10000, condition: "'전문 상담 아님' 표기, 위기 신호 시 전문기관 안내" },
  { id: 'expert', name: '전문 상담', risk: 'soon', examples: '심리·진로·법률·재무 상담', condition: '자격증·면허 검수 필수' },
  { id: 'kids', name: '아이 돌봄·등하원', risk: 'soon', examples: '등하원 동행, 하원 후 돌봄', condition: '신원·범죄경력 확인, 가입 보험' },
  { id: 'influencer', name: '인플루언서 만남', risk: 'soon', examples: '저녁 식사, 팬미팅', condition: '계정 소유 인증, 플랫폼 지정 장소' }
];

const RISK_LABELS = { low: '위험 낮음', mid: '위험 중간', soon: '준비 중' };

const RISK_ICONS = {
  low: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10"/></svg>',
  mid: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  soon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>'
};

/**
 * 등록할 수 없는 표현 (기획서 '법적 위험과 안전 정책' — 은어 필터 초안)
 */
const BANNED_WORDS = [
  '조건', '애인대행', '애인 대행', '스폰', '숙박', '모텔', '호텔', '술 접대', '술접대',
  '술자리', '노래방', '스킨십', '키스', '19금', '대리시험', '대리 시험', '대리출석', '대리 출석', '운전대행', '운전 대행'
];

/**
 * 연락처 패턴 — 외부 직거래 방지 (전화번호, 카톡 ID, 계좌번호)
 */
const CONTACT_PATTERNS = [
  /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/,
  /(카톡|카카오톡|오픈채팅|kakao|텔레그램|telegram|라인\s*id)/i,
  /\d{3,6}-\d{2,6}-\d{4,7}/,
  /(계좌|입금)/
];

/**
 * 금지어·연락처가 들어 있으면 이유를 돌려준다.
 */
function findViolation(text) {
  const normalized = text.toLowerCase();
  const word = BANNED_WORDS.find(w => normalized.includes(w));
  if (word) return `'${word}' 같은 표현은 등록할 수 없어요. 금지 행위를 확인해 주세요.`;
  if (CONTACT_PATTERNS.some(p => p.test(text))) {
    return '연락처·메신저·계좌 정보는 적을 수 없어요. 대화는 앱 채팅에서만 할 수 있어요.';
  }
  return '';
}

/* ===== 카테고리 카드 ===== */
function renderCategories() {
  const grid = document.getElementById('categoryGrid');

  CATEGORIES.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'calc-card tb-cat-card' + (cat.risk === 'soon' ? ' soon' : '');
    card.dataset.category = cat.risk;

    const icon = document.createElement('div');
    icon.className = 'calc-card-icon ' + cat.risk;
    icon.innerHTML = RISK_ICONS[cat.risk];

    const title = document.createElement('h3');
    title.textContent = cat.name;

    const examples = document.createElement('p');
    examples.className = 'tb-cat-examples';
    examples.textContent = cat.examples;

    const condition = document.createElement('p');
    condition.textContent = '조건: ' + cat.condition;

    const footer = document.createElement('div');
    footer.className = 'calc-card-footer';

    const tag = document.createElement('span');
    tag.className = 'calc-card-tag ' + cat.risk;
    tag.textContent = RISK_LABELS[cat.risk];

    const price = document.createElement('span');
    price.className = 'tb-cat-price';
    price.textContent = cat.price ? `시간당 ${formatNumber(cat.price)}원~` : '오픈 예정';

    footer.append(tag, price);
    card.append(icon, title, examples, condition, footer);

    if (cat.risk !== 'soon') {
      card.addEventListener('click', () => {
        document.getElementById('category').value = cat.id;
        document.getElementById('apply').scrollIntoView();
      });
    }

    grid.appendChild(card);
  });
}

function initCategoryTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.tb-cat-card');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;
      cards.forEach(card => {
        card.style.display = (category === 'all' || card.dataset.category === category) ? '' : 'none';
      });
    });
  });
}

/* ===== 신청 폼 ===== */
const FORM_TEXT = {
  buy: {
    activity: '하고 싶은 활동',
    activityPlaceholder: '예: 토요일 놀이공원 같이 가기',
    person: '함께할 사람 조건',
    personPlaceholder: '예: 20대 동성, 사진 잘 찍는 분',
    price: '시간당 예산'
  },
  sell: {
    activity: '팔고 싶은 시간(활동)',
    activityPlaceholder: '예: 평일 저녁 강아지 산책',
    person: '나의 강점·소개',
    personPlaceholder: '예: 대형견 산책 경험 5년',
    price: '희망 시간당 가격'
  }
};

let applyType = 'buy';

function setApplyType(type) {
  applyType = type;
  const text = FORM_TEXT[type];
  document.getElementById('activityLabel').textContent = text.activity;
  document.getElementById('activity').placeholder = text.activityPlaceholder;
  document.getElementById('personLabel').textContent = text.person;
  document.getElementById('person').placeholder = text.personPlaceholder;
  document.getElementById('priceLabel').textContent = text.price;

  document.querySelectorAll('#applyType .radio-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === type);
  });
}

function fillCategorySelect() {
  const select = document.getElementById('category');
  CATEGORIES.filter(cat => cat.risk !== 'soon').forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

function showMessage(text, type) {
  const el = document.getElementById('formMessage');
  el.textContent = text;
  el.className = 'tb-form-message ' + type;
}

function collectForm() {
  return {
    type: applyType,
    category: document.getElementById('category').value,
    activity: document.getElementById('activity').value.trim(),
    person: document.getElementById('person').value.trim(),
    region: document.getElementById('region').value.trim(),
    pricePerHour: parseNumber(document.getElementById('price').value),
    email: document.getElementById('email').value.trim(),
    submittedAt: new Date().toISOString()
  };
}

function validateForm(data) {
  if (!data.activity) return '활동을 적어 주세요.';
  if (!data.region) return '지역을 적어 주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return '이메일 주소를 확인해 주세요.';
  if (!document.getElementById('agreeAdult').checked) return '만 19세 이상만 신청할 수 있어요.';
  if (!document.getElementById('agreeRules').checked) return '금지 행위 동의가 필요해요.';
  return findViolation(data.activity) || findViolation(data.person) || findViolation(data.region);
}

async function submitApplication(data) {
  if (!SUBMIT_ENDPOINT) {
    const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    saved.push(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saved));
    return;
  }

  const res = await fetch(SUBMIT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('submit failed: ' + res.status);
}

function initApplyForm() {
  fillCategorySelect();
  bindRadioGroup(document.getElementById('applyType'), setApplyType);
  bindCommaInput(document.getElementById('price'));

  document.querySelectorAll('[data-apply-type]').forEach(link => {
    link.addEventListener('click', () => setApplyType(link.dataset.applyType));
  });

  const form = document.getElementById('applyForm');
  const submitBtn = form.querySelector('.tb-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = collectForm();
    const error = validateForm(data);
    if (error) {
      showMessage(error, 'error');
      return;
    }

    submitBtn.disabled = true;
    try {
      await submitApplication(data);
      form.reset();
      setApplyType(applyType);
      showMessage(SUBMIT_ENDPOINT
        ? '신청이 접수됐어요. 출시되면 이메일로 알려드릴게요.'
        : '테스트 모드: 접수 주소가 설정되지 않아 이 브라우저에만 저장됐어요.', 'success');
    } catch (err) {
      showMessage('접수에 실패했어요. 잠시 후 다시 시도해 주세요.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-price]').forEach(el => {
    el.textContent = formatNumber(el.dataset.price) + '원';
  });

  renderCategories();
  initCategoryTabs();
  initApplyForm();
});
