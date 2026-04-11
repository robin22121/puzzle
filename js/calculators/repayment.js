/* ===== 상환 스케줄 계산기 ===== */

let interestRate = 4;
let repaymentMethod = 'equalPrincipalInterest';
let viewMode = 'yearly';

const METHOD_NAMES = {
  equalPrincipalInterest: '원리금균등상환',
  equalPrincipal: '원금균등상환',
  bullet: '만기일시상환',
};

function generateSchedule(principal, annualRate, years, method, graceMonths) {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  const schedule = [];
  let balance = principal;

  // 거치기간 이후 상환 개월 수
  const repayMonths = totalMonths - graceMonths;

  // 원리금균등상환 월 상환액 사전 계산 (거치 후 잔액 기준)
  let equalPayment = 0;
  if (method === 'equalPrincipalInterest' && repayMonths > 0 && monthlyRate > 0) {
    equalPayment = balance * monthlyRate * Math.pow(1 + monthlyRate, repayMonths) /
      (Math.pow(1 + monthlyRate, repayMonths) - 1);
  }

  for (let month = 1; month <= totalMonths; month++) {
    const isGrace = month <= graceMonths;
    let monthlyInterest = Math.round(balance * monthlyRate);
    let monthlyPrincipal = 0;
    let monthlyPayment = 0;

    if (method === 'bullet') {
      // 만기일시: 매월 이자만, 마지막달 원금 전액
      monthlyPrincipal = (month === totalMonths) ? balance : 0;
      monthlyPayment = monthlyInterest + monthlyPrincipal;

    } else if (isGrace) {
      // 거치기간: 이자만 납부
      monthlyPrincipal = 0;
      monthlyPayment = monthlyInterest;

    } else if (method === 'equalPrincipalInterest') {
      // 원리금균등상환: 거치기간 종료 시점의 잔액 기준 고정 상환액
      monthlyPayment = Math.round(equalPayment);
      monthlyPrincipal = monthlyPayment - monthlyInterest;

    } else if (method === 'equalPrincipal') {
      // 원금균등상환: 거치 후 남은 기간으로 균등 분할
      monthlyPrincipal = Math.round(principal / repayMonths);
      monthlyPayment = monthlyPrincipal + monthlyInterest;
    }

    balance = Math.max(balance - monthlyPrincipal, 0);

    // 마지막달 잔액 보정
    if (month === totalMonths && balance > 0) {
      monthlyPrincipal += balance;
      monthlyPayment = monthlyPrincipal + monthlyInterest;
      balance = 0;
    }

    schedule.push({
      month,
      year: Math.ceil(month / 12),
      payment: monthlyPayment,
      principal: monthlyPrincipal,
      interest: monthlyInterest,
      balance,
    });
  }

  return schedule;
}

function calculate() {
  const principal = parseNumber(document.getElementById('loanAmount').value);
  const years = Number(document.getElementById('loanPeriod').value);
  const graceMonths = Number(document.getElementById('gracePeriod').value);

  if (principal <= 0) {
    document.getElementById('scheduleSection').style.display = 'none';
    return;
  }

  const schedule = generateSchedule(principal, interestRate, years, repaymentMethod, graceMonths);

  const totalInterest = schedule.reduce((sum, r) => sum + r.interest, 0);
  const totalPayment = principal + totalInterest;

  // 첫 달 상환액 (요약용)
  const firstPayment = schedule.length > 0 ? schedule[graceMonths > 0 ? graceMonths : 0].payment : 0;

  // 결과 헤더
  setResultValue(document.getElementById('resultMonthly'), formatNumber(firstPayment), '원');
  document.getElementById('resultMonthlyKr').textContent = toKoreanMoney(firstPayment);
  document.getElementById('resultLoanAmt').textContent = formatNumber(principal) + '원';
  document.getElementById('resultPeriod').textContent = years + '년 (' + (years * 12) + '개월)';
  document.getElementById('resultMethod').textContent = METHOD_NAMES[repaymentMethod];
  document.getElementById('resultTotalPrincipal').textContent = formatNumber(principal) + '원';
  document.getElementById('resultTotalInterest').textContent = formatNumber(totalInterest) + '원';
  document.getElementById('resultTotalPayment').textContent = formatNumber(totalPayment) + '원';

  // 바 차트
  const maxVal = Math.max(principal, totalInterest, 1);
  document.getElementById('barPrincipal').style.width = (principal / maxVal * 100) + '%';
  document.getElementById('barInterest').style.width = (totalInterest / maxVal * 100) + '%';
  document.getElementById('barPrincipalAmt').textContent = formatNumber(principal) + '원';
  document.getElementById('barInterestAmt').textContent = formatNumber(totalInterest) + '원';

  // 요약 카드
  const interestRatio = principal > 0 ? (totalInterest / principal * 100).toFixed(1) : 0;
  document.getElementById('summaryCards').innerHTML = `
    <div class="summary-card primary">
      <div class="summary-card-label">월 상환액</div>
      <div class="summary-card-value">${formatNumber(firstPayment)}<small>원</small></div>
      <div class="summary-card-sub">${toKoreanMoney(firstPayment)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-label">총 이자</div>
      <div class="summary-card-value">${formatNumber(totalInterest)}<small>원</small></div>
      <div class="summary-card-sub">${toKoreanMoney(totalInterest)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-label">이자 비율</div>
      <div class="summary-card-value">${interestRatio}<small>%</small></div>
      <div class="summary-card-sub">원금 대비</div>
    </div>
  `;

  // 스케줄 테이블 렌더링
  renderSchedule(schedule);
  document.getElementById('scheduleSection').style.display = '';
}

function renderSchedule(schedule) {
  const tbody = document.getElementById('scheduleBody');

  if (viewMode === 'yearly') {
    document.getElementById('colHeader').textContent = '연차';
    // 연도별 집계
    const yearlyData = {};
    schedule.forEach(r => {
      if (!yearlyData[r.year]) {
        yearlyData[r.year] = { payment: 0, principal: 0, interest: 0, balance: 0 };
      }
      yearlyData[r.year].payment += r.payment;
      yearlyData[r.year].principal += r.principal;
      yearlyData[r.year].interest += r.interest;
      yearlyData[r.year].balance = r.balance;
    });

    tbody.innerHTML = Object.entries(yearlyData).map(([year, data]) =>
      `<tr>
        <td>${year}년차</td>
        <td>${formatNumber(data.payment)}원</td>
        <td>${formatNumber(data.principal)}원</td>
        <td>${formatNumber(data.interest)}원</td>
        <td>${formatNumber(data.balance)}원</td>
      </tr>`
    ).join('');
  } else {
    document.getElementById('colHeader').textContent = '회차';
    tbody.innerHTML = schedule.map(r => {
      const isYearEnd = r.month % 12 === 0;
      return `<tr class="${isYearEnd ? 'year-row' : ''}">
        <td>${r.month}회</td>
        <td>${formatNumber(r.payment)}원</td>
        <td>${formatNumber(r.principal)}원</td>
        <td>${formatNumber(r.interest)}원</td>
        <td>${formatNumber(r.balance)}원</td>
      </tr>`;
    }).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loanAmountInput = document.getElementById('loanAmount');

  // URL 파라미터에서 LTV 연동 데이터 수신
  const params = new URLSearchParams(window.location.search);
  if (params.get('loan')) {
    const loanVal = Number(params.get('loan'));
    loanAmountInput.value = formatNumber(loanVal);
    const koreanEl = loanAmountInput.parentElement.querySelector('.korean-amount');
    if (koreanEl) koreanEl.textContent = toKoreanMoney(loanVal);
    document.getElementById('ltvBanner').style.display = '';
  }
  if (params.get('rate')) {
    interestRate = Number(params.get('rate'));
    document.getElementById('interestRate').value = interestRate;
    document.getElementById('interestRateValue').textContent = interestRate + '%';
  }
  if (params.get('period')) {
    document.getElementById('loanPeriod').value = params.get('period');
  }

  bindCommaInput(loanAmountInput, calculate);

  bindSlider(document.getElementById('interestRate'), document.getElementById('interestRateValue'), (v) => {
    interestRate = v;
    calculate();
  });

  document.getElementById('loanPeriod').addEventListener('change', calculate);
  document.getElementById('gracePeriod').addEventListener('change', calculate);

  bindRadioGroup(document.getElementById('repaymentMethod'), (v) => {
    repaymentMethod = v;
    // 만기일시는 거치기간 불필요
    document.getElementById('gracePeriodGroup').style.display = (v === 'bullet') ? 'none' : '';
    calculate();
  });

  // 보기 토글
  document.getElementById('viewYearly').addEventListener('click', function () {
    viewMode = 'yearly';
    this.classList.add('active');
    document.getElementById('viewMonthly').classList.remove('active');
    calculate();
  });

  document.getElementById('viewMonthly').addEventListener('click', function () {
    viewMode = 'monthly';
    this.classList.add('active');
    document.getElementById('viewYearly').classList.remove('active');
    calculate();
  });

  // 초기 계산 (파라미터가 있는 경우)
  if (params.get('loan')) {
    calculate();
  }
});
