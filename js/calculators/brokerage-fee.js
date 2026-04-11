/* ===== 중개보수 계산기 ===== */

// 매매/교환 요율표
const SALE_RATES = [
  { max: 50000000,        rate: 0.006,  limit: 250000 },
  { max: 200000000,       rate: 0.005,  limit: 800000 },
  { max: 900000000,       rate: 0.004,  limit: null },
  { max: 1200000000,      rate: 0.005,  limit: null },
  { max: Infinity,        rate: 0.007,  limit: null },
];

// 전세/월세(임대차) 요율표
const LEASE_RATES = [
  { max: 50000000,        rate: 0.005,  limit: 200000 },
  { max: 100000000,       rate: 0.004,  limit: 300000 },
  { max: 600000000,       rate: 0.003,  limit: null },
  { max: 1200000000,      rate: 0.004,  limit: null },
  { max: Infinity,        rate: 0.008,  limit: null },
];

let dealType = '매매';

function calculate() {
  const dealAmount = parseNumber(document.getElementById('dealAmount').value);
  const monthlyRent = parseNumber(document.getElementById('monthlyRent').value);

  // 월세일 경우 환산보증금 계산
  let baseAmount = dealAmount;
  if (dealType === '월세') {
    baseAmount = dealAmount + (monthlyRent * 100);
    // 환산보증금이 5천만 미만이면 보증금 + 월세*70
    if (baseAmount < 50000000) {
      baseAmount = dealAmount + (monthlyRent * 70);
    }
  }

  const rates = (dealType === '매매') ? SALE_RATES : LEASE_RATES;

  let rate = 0;
  let limit = null;
  for (const tier of rates) {
    if (baseAmount < tier.max) {
      rate = tier.rate;
      limit = tier.limit;
      break;
    }
  }

  let fee = baseAmount * rate;
  if (limit !== null && fee > limit) {
    fee = limit;
  }

  const feeWithVat = fee * 1.1;

  // 결과 표시
  setResultValue(document.getElementById('resultFee'), formatNumber(fee), '원');
  document.getElementById('resultFeeKr').textContent = toKoreanMoney(fee);
  document.getElementById('resultDealType').textContent = dealType;
  document.getElementById('resultDealAmount').textContent = formatNumber(baseAmount) + '원';
  document.getElementById('resultRate').textContent = (rate * 100).toFixed(1) + '%';
  document.getElementById('resultLimit').textContent = limit ? formatNumber(limit) + '원' : '없음';
  document.getElementById('resultWithVat').textContent = formatNumber(feeWithVat) + '원';
}

document.addEventListener('DOMContentLoaded', () => {
  const dealAmountInput = document.getElementById('dealAmount');
  const monthlyRentInput = document.getElementById('monthlyRent');
  const monthlyRentGroup = document.getElementById('monthlyRentGroup');

  bindCommaInput(dealAmountInput, calculate);
  bindCommaInput(monthlyRentInput, calculate);

  bindRadioGroup(document.getElementById('dealType'), (value) => {
    dealType = value;
    monthlyRentGroup.style.display = (value === '월세') ? '' : 'none';
    calculate();
  });
});
