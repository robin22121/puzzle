/* ===== Common Utilities ===== */

/**
 * 숫자에 천 단위 콤마 포맷
 */
function formatNumber(num) {
  if (num === '' || num === null || num === undefined || isNaN(num)) return '0';
  return Math.round(Number(num)).toLocaleString('ko-KR');
}

/**
 * 콤마 제거 후 숫자 반환
 */
function parseNumber(str) {
  if (!str) return 0;
  return Number(String(str).replace(/[^0-9.-]/g, '')) || 0;
}

/**
 * 금액을 한글로 변환 (예: 350000000 → "3억 5,000만원")
 */
function toKoreanMoney(num) {
  if (!num || num === 0) return '';
  num = Math.round(Number(num));
  if (isNaN(num)) return '';

  const units = [
    { value: 100000000, label: '억' },
    { value: 10000, label: '만' }
  ];

  let result = '';
  let remaining = Math.abs(num);

  for (const unit of units) {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value);
      result += formatNumber(count) + unit.label + ' ';
      remaining %= unit.value;
    }
  }

  if (remaining > 0 && num < 10000) {
    result += formatNumber(remaining);
  }

  return (num < 0 ? '-' : '') + result.trim() + '원';
}

/**
 * 입력 필드에 콤마 포맷 자동 적용
 */
function bindCommaInput(input, callback) {
  input.addEventListener('input', function () {
    const raw = parseNumber(this.value);
    const cursor = this.selectionStart;
    const prevLen = this.value.length;

    if (raw === 0 && this.value === '') {
      this.value = '';
    } else {
      this.value = formatNumber(raw);
    }

    // 커서 위치 보정
    const diff = this.value.length - prevLen;
    this.setSelectionRange(cursor + diff, cursor + diff);

    // 한글 금액 표시 업데이트
    const koreanEl = this.parentElement.querySelector('.korean-amount');
    if (koreanEl) {
      koreanEl.textContent = toKoreanMoney(raw);
    }

    if (callback) callback(raw);
  });

  // 모바일: 숫자 키패드 활성화
  input.setAttribute('inputmode', 'numeric');
}

/**
 * 라디오 버튼 그룹 바인딩
 */
function bindRadioGroup(container, callback) {
  const buttons = container.querySelectorAll('.radio-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      if (callback) callback(this.dataset.value);
    });
  });
}

/**
 * 슬라이더와 입력값 동기화
 */
function bindSlider(slider, valueEl, callback) {
  slider.addEventListener('input', function () {
    if (valueEl) valueEl.textContent = this.value + '%';
    if (callback) callback(Number(this.value));
  });
}

/**
 * 모바일 메뉴 토글
 */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.header-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
}

// 페이지 로드 시 공통 초기화
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
});
