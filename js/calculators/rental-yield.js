/* ===== 임대수익률 계산기 ===== */

let loanRate = 4;

function calculate() {
  const purchasePrice = parseNumber(document.getElementById('purchasePrice').value);
  const rentalDeposit = parseNumber(document.getElementById('rentalDeposit').value);
  const monthlyIncome = parseNumber(document.getElementById('monthlyIncome').value);
  const loanAmount = parseNumber(document.getElementById('loanAmount').value);
  const annualCost = parseNumber(document.getElementById('annualCost').value);

  // 연간 임대수입
  const annualIncome = monthlyIncome * 12;

  // 연간 대출이자
  const annualInterest = Math.round(loanAmount * (loanRate / 100));

  // 실투자금 = 매입가 - 대출 - 보증금
  const ownMoney = Math.max(purchasePrice - loanAmount - rentalDeposit, 0);

  // 순수익
  const netIncome = annualIncome - annualInterest - annualCost;

  // 총 수익률 = 연 임대수입 / 매입가
  const grossYield = purchasePrice > 0 ? (annualIncome / purchasePrice * 100) : 0;

  // 실질 수익률 = 순수익 / 실투자금
  const netYield = ownMoney > 0 ? (netIncome / ownMoney * 100) : 0;

  // 결과 표시
  document.getElementById('resultYield').innerHTML = grossYield.toFixed(2) + '<small>%</small>';
  document.getElementById('resultPurchase').textContent = formatNumber(purchasePrice) + '원';
  document.getElementById('resultOwnMoney').textContent = formatNumber(ownMoney) + '원';
  document.getElementById('resultAnnualIncome').textContent = formatNumber(annualIncome) + '원';
  document.getElementById('resultLoanInterest').textContent = formatNumber(annualInterest) + '원';
  document.getElementById('resultCost').textContent = formatNumber(annualCost) + '원';
  document.getElementById('resultNetIncome').textContent = formatNumber(netIncome) + '원';
  document.getElementById('resultNetYield').textContent = netYield.toFixed(2) + '%';

  // 바 차트
  const maxVal = Math.max(annualIncome, annualInterest, annualCost, Math.abs(netIncome), 1);
  document.getElementById('barIncome').style.width = (annualIncome / maxVal * 100) + '%';
  document.getElementById('barInterest').style.width = (annualInterest / maxVal * 100) + '%';
  document.getElementById('barMgmt').style.width = (annualCost / maxVal * 100) + '%';
  document.getElementById('barNet').style.width = (Math.max(netIncome, 0) / maxVal * 100) + '%';
  document.getElementById('barIncomeAmt').textContent = formatNumber(annualIncome) + '원';
  document.getElementById('barInterestAmt').textContent = formatNumber(annualInterest) + '원';
  document.getElementById('barMgmtAmt').textContent = formatNumber(annualCost) + '원';
  document.getElementById('barNetAmt').textContent = formatNumber(netIncome) + '원';
}

document.addEventListener('DOMContentLoaded', () => {
  bindCommaInput(document.getElementById('purchasePrice'), calculate);
  bindCommaInput(document.getElementById('rentalDeposit'), calculate);
  bindCommaInput(document.getElementById('monthlyIncome'), calculate);
  bindCommaInput(document.getElementById('loanAmount'), calculate);
  bindCommaInput(document.getElementById('annualCost'), calculate);

  bindSlider(document.getElementById('loanRate'), document.getElementById('loanRateValue'), (v) => {
    loanRate = v;
    calculate();
  });
});
