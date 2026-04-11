/* ===== DTI / DSR 계산기 ===== */

let interestRate = 4;

// 원리금균등상환 월 상환액 계산
function calcMonthlyPayment(principal, annualRate, years) {
  if (principal === 0 || annualRate === 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
    (Math.pow(1 + monthlyRate, months) - 1);
}

function calculate() {
  const annualIncome = parseNumber(document.getElementById('annualIncome').value);
  const mortgageAmount = parseNumber(document.getElementById('mortgageAmount').value);
  const loanPeriod = Number(document.getElementById('loanPeriod').value);
  const otherDebt = parseNumber(document.getElementById('otherDebt').value);

  // 주담대 연이자
  const annualInterest = Math.round(mortgageAmount * (interestRate / 100));

  // 주담대 월 원리금 (원리금균등상환)
  const monthlyPayment = calcMonthlyPayment(mortgageAmount, interestRate, loanPeriod);
  const annualPayment = Math.round(monthlyPayment * 12);

  // DTI = (주담대 연이자 + 기타 대출 원리금) / 연소득
  const dti = annualIncome > 0 ? ((annualInterest + otherDebt) / annualIncome * 100) : 0;

  // DSR = (주담대 연원리금 + 기타 대출 원리금) / 연소득
  const dsr = annualIncome > 0 ? ((annualPayment + otherDebt) / annualIncome * 100) : 0;

  // 상태 판단
  let status = '정보를 입력해주세요';
  if (annualIncome > 0 && mortgageAmount > 0) {
    if (dsr <= 40) status = 'DSR 40% 이내 — 대출 가능 범위';
    else if (dsr <= 60) status = 'DSR 40% 초과 — 대출 한도 주의';
    else status = 'DSR 60% 초과 — 대출 어려울 수 있음';
  }

  // 결과 표시
  setResultValue(document.getElementById('resultDSR'), dsr.toFixed(1), '%');
  document.getElementById('resultStatus').textContent = status;
  document.getElementById('resultIncome').textContent = formatNumber(annualIncome) + '원';
  document.getElementById('resultMortgageInterest').textContent = formatNumber(annualInterest) + '원';
  document.getElementById('resultMortgagePayment').textContent = formatNumber(annualPayment) + '원';
  document.getElementById('resultOtherDebt').textContent = formatNumber(otherDebt) + '원';
  document.getElementById('resultDTI').textContent = dti.toFixed(1) + '%';
  document.getElementById('resultDSRDetail').textContent = dsr.toFixed(1) + '%';

  // 바 차트 (100% 기준)
  document.getElementById('barDTI').style.width = Math.min(dti, 100) + '%';
  document.getElementById('barDTIAmt').textContent = dti.toFixed(1) + '%';
  document.getElementById('barDSR').style.width = Math.min(dsr, 100) + '%';
  document.getElementById('barDSRAmt').textContent = dsr.toFixed(1) + '%';

  // 색상 변경 (초과 시 빨간색)
  document.getElementById('barDTI').className = 'bar-fill ' + (dti > 60 ? 'red' : 'blue');
  document.getElementById('barDSR').className = 'bar-fill ' + (dsr > 40 ? 'red' : 'orange');
}

document.addEventListener('DOMContentLoaded', () => {
  bindCommaInput(document.getElementById('annualIncome'), calculate);
  bindCommaInput(document.getElementById('mortgageAmount'), calculate);
  bindCommaInput(document.getElementById('otherDebt'), calculate);

  bindSlider(document.getElementById('interestRate'), document.getElementById('interestRateValue'), (v) => {
    interestRate = v;
    calculate();
  });

  document.getElementById('loanPeriod').addEventListener('change', calculate);
});
