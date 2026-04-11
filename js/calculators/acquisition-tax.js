/* ===== 취득세 계산기 ===== */

let propertyType = '주택';
let houseCount = '1';
let areaType = '85이하';
let adjustedArea = 'no';

function getHouseTaxRate(price, count, adjusted) {
  // 1주택
  if (count === '1') {
    if (price <= 600000000) return 0.01;
    if (price <= 900000000) {
      // 6~9억 구간: 점진적 세율
      return ((price / 100000000) * 2 / 3 - 3) / 100;
    }
    return 0.03;
  }
  // 2주택
  if (count === '2') {
    if (adjusted === 'yes') return 0.08;
    return 0.01; // 비조정 2주택 1~3%
  }
  // 3주택 이상
  if (adjusted === 'yes') return 0.12;
  return 0.08;
}

function calculate() {
  const price = parseNumber(document.getElementById('acquisitionPrice').value);

  let taxRate = 0;
  let acqTax = 0;
  let eduTax = 0;
  let farmTax = 0;

  if (propertyType === '주택') {
    taxRate = getHouseTaxRate(price, houseCount, adjustedArea);
    acqTax = Math.round(price * taxRate);

    // 지방교육세: 취득세의 10% (중과 시 별도 계산)
    eduTax = Math.round(acqTax * 0.1);

    // 농어촌특별세: 85m² 초과 시 취득가액의 0.2%
    if (areaType === '85초과') {
      farmTax = Math.round(price * 0.002);
    }
  } else if (propertyType === '상가') {
    taxRate = 0.04;
    acqTax = Math.round(price * taxRate);
    eduTax = Math.round(acqTax * 0.1);
    farmTax = Math.round(price * 0.002);
  } else {
    // 토지
    taxRate = 0.04;
    acqTax = Math.round(price * taxRate);
    eduTax = Math.round(acqTax * 0.1);
    farmTax = Math.round(price * 0.002);
  }

  const total = acqTax + eduTax + farmTax;

  // 결과 표시
  document.getElementById('resultTotal').innerHTML = formatNumber(total) + '<small>원</small>';
  document.getElementById('resultTotalKr').textContent = toKoreanMoney(total);
  document.getElementById('resultPrice').textContent = formatNumber(price) + '원';
  document.getElementById('resultTaxRate').textContent = (taxRate * 100).toFixed(1) + '%';
  document.getElementById('resultAcqTax').textContent = formatNumber(acqTax) + '원';
  document.getElementById('resultEduTax').textContent = formatNumber(eduTax) + '원';
  document.getElementById('resultFarmTax').textContent = formatNumber(farmTax) + '원';
  document.getElementById('resultTotalHighlight').textContent = formatNumber(total) + '원';

  // 바 차트 업데이트
  const maxVal = Math.max(acqTax, eduTax, farmTax, 1);
  document.getElementById('barAcq').style.width = (acqTax / maxVal * 100) + '%';
  document.getElementById('barEdu').style.width = (eduTax / maxVal * 100) + '%';
  document.getElementById('barFarm').style.width = (farmTax / maxVal * 100) + '%';
  document.getElementById('barAcqAmt').textContent = formatNumber(acqTax) + '원';
  document.getElementById('barEduAmt').textContent = formatNumber(eduTax) + '원';
  document.getElementById('barFarmAmt').textContent = formatNumber(farmTax) + '원';
}

function toggleFields() {
  const isHouse = propertyType === '주택';
  document.getElementById('houseCountGroup').style.display = isHouse ? '' : 'none';
  document.getElementById('areaGroup').style.display = isHouse ? '' : 'none';
  document.getElementById('adjustedAreaGroup').style.display = isHouse ? '' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  bindCommaInput(document.getElementById('acquisitionPrice'), calculate);

  bindRadioGroup(document.getElementById('propertyType'), (v) => {
    propertyType = v;
    toggleFields();
    calculate();
  });

  bindRadioGroup(document.getElementById('houseCount'), (v) => {
    houseCount = v;
    calculate();
  });

  bindRadioGroup(document.getElementById('areaType'), (v) => {
    areaType = v;
    calculate();
  });

  bindRadioGroup(document.getElementById('adjustedArea'), (v) => {
    adjustedArea = v;
    calculate();
  });

  toggleFields();
});
