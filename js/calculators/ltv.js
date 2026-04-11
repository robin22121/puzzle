/* ===== LTV 대출가능액 계산기 ===== */

let ltvRatio = 50;

function calculate() {
  const housePrice = parseNumber(document.getElementById('housePrice').value);
  const priorLoan = parseNumber(document.getElementById('priorLoan').value);
  const deposit = parseNumber(document.getElementById('deposit').value);

  // LTV 한도
  const ltvLimit = Math.round(housePrice * (ltvRatio / 100));

  // 대출 가능액
  const loanAmount = Math.max(ltvLimit - priorLoan - deposit, 0);

  // 필요 자기자본
  const ownCapital = Math.max(housePrice - loanAmount, 0);

  // 결과 표시
  setResultValue(document.getElementById('resultLoan'), formatNumber(loanAmount), '원');
  document.getElementById('resultLoanKr').textContent = toKoreanMoney(loanAmount);
  document.getElementById('resultHousePrice').textContent = formatNumber(housePrice) + '원';
  document.getElementById('resultLtvLimit').textContent = formatNumber(ltvLimit) + '원';
  document.getElementById('resultPriorLoan').textContent = '-' + formatNumber(priorLoan) + '원';
  document.getElementById('resultDeposit').textContent = '-' + formatNumber(deposit) + '원';
  document.getElementById('resultOwnCapital').textContent = formatNumber(ownCapital) + '원';

  // 바 차트
  const total = Math.max(housePrice, 1);
  document.getElementById('barLoan').style.width = (loanAmount / total * 100) + '%';
  document.getElementById('barOwn').style.width = (ownCapital / total * 100) + '%';
  document.getElementById('barLoanAmt').textContent = formatNumber(loanAmount) + '원';
  document.getElementById('barOwnAmt').textContent = formatNumber(ownCapital) + '원';

  // 상환 스케줄 연동 버튼
  const repayBtn = document.getElementById('goRepayment');
  if (loanAmount > 0) {
    repayBtn.style.display = 'block';
    repayBtn.href = 'repayment.html?loan=' + loanAmount + '&rate=4&period=20';
  } else {
    repayBtn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindCommaInput(document.getElementById('housePrice'), calculate);
  bindCommaInput(document.getElementById('priorLoan'), calculate);
  bindCommaInput(document.getElementById('deposit'), calculate);

  bindSlider(document.getElementById('ltvRatio'), document.getElementById('ltvRatioValue'), (v) => {
    ltvRatio = v;
    calculate();
  });
});
