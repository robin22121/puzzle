/* ===== 재산세 계산기 ===== */

let fairRatio = 60;
let cityArea = 'yes';

// 재산세 누진세율 (주택)
function calcPropertyTax(taxBase) {
  if (taxBase <= 60000000) {
    return taxBase * 0.001;
  } else if (taxBase <= 150000000) {
    return 60000 + (taxBase - 60000000) * 0.0015;
  } else if (taxBase <= 300000000) {
    return 195000 + (taxBase - 150000000) * 0.0025;
  } else {
    return 570000 + (taxBase - 300000000) * 0.004;
  }
}

function calculate() {
  const officialPrice = parseNumber(document.getElementById('officialPrice').value);

  // 과세표준 = 공시가격 × 공정시장가액비율
  const taxBase = Math.round(officialPrice * (fairRatio / 100));

  // 재산세
  const propTax = Math.round(calcPropertyTax(taxBase));

  // 도시지역분: 과세표준의 0.14%
  const cityTax = (cityArea === 'yes') ? Math.round(taxBase * 0.0014) : 0;

  // 지방교육세: 재산세의 20%
  const eduTax = Math.round(propTax * 0.2);

  const total = propTax + cityTax + eduTax;

  // 적용 세율 계산
  let rateStr = '0.1%';
  if (taxBase <= 60000000) rateStr = '0.1%';
  else if (taxBase <= 150000000) rateStr = '0.15%';
  else if (taxBase <= 300000000) rateStr = '0.25%';
  else rateStr = '0.4%';

  // 결과 표시
  setResultValue(document.getElementById('resultTotal'), formatNumber(total), '원');
  document.getElementById('resultTotalKr').textContent = toKoreanMoney(total);
  document.getElementById('resultOfficial').textContent = formatNumber(officialPrice) + '원';
  document.getElementById('resultTaxBase').textContent = formatNumber(taxBase) + '원';
  document.getElementById('resultRate').textContent = rateStr;
  document.getElementById('resultPropertyTax').textContent = formatNumber(propTax) + '원';
  document.getElementById('resultCityTax').textContent = formatNumber(cityTax) + '원';
  document.getElementById('resultEduTax').textContent = formatNumber(eduTax) + '원';
  document.getElementById('resultTotalHighlight').textContent = formatNumber(total) + '원';

  // 바 차트
  const maxVal = Math.max(propTax, cityTax, eduTax, 1);
  document.getElementById('barProp').style.width = (propTax / maxVal * 100) + '%';
  document.getElementById('barCity').style.width = (cityTax / maxVal * 100) + '%';
  document.getElementById('barEdu').style.width = (eduTax / maxVal * 100) + '%';
  document.getElementById('barPropAmt').textContent = formatNumber(propTax) + '원';
  document.getElementById('barCityAmt').textContent = formatNumber(cityTax) + '원';
  document.getElementById('barEduAmt').textContent = formatNumber(eduTax) + '원';
}

document.addEventListener('DOMContentLoaded', () => {
  bindCommaInput(document.getElementById('officialPrice'), calculate);

  bindSlider(document.getElementById('fairRatio'), document.getElementById('fairRatioValue'), (v) => {
    fairRatio = v;
    calculate();
  });

  bindRadioGroup(document.getElementById('cityArea'), (v) => {
    cityArea = v;
    calculate();
  });
});
