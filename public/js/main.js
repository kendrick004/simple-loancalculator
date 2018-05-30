import $ from 'jquery';

window.jQuery = $;
window.$ = $;

import Helper from '../js/helper';

let storage ;

let hasLocal = [];

if(window.localStorage){
  storage = window.localStorage;

  Storage.prototype.setObject = function(key, value) {
      this.setItem(key, JSON.stringify(value));
  }

  Storage.prototype.getObject = function(key) {
      let value = JSON.parse(this.getItem(key));
      return value;
  }

  Storage.prototype.deleteObject = function(key){
    window.localStorage.removeItem(key);
  }
}

$(document).ready(function(){
  if(storage.getItem('brands') === null){
    getBrands();
  }else{
    hasLocal = storage.getObject('brands');
  }

  let selects = [];
  let header = `<select id="select-brand">`;
  let options = [];
  for(let i = 0;i < hasLocal.length; i++){
    let brand = hasLocal[i];
    options.push(`<option value="${brand.id}">${brand.name}</option>`);
  }
  let footer = `</select>`;

  $('#brand').html('').html(`
    <label>Brands</label>
    ${header}${options.join('')}${footer}
  `);

  $('#model').html('<label>Models</label><select id="select-model"></select>');

  $('#select-brand').on('change',function(){
    let $this = $(this);
    let brand_model = hasLocal.filter(function(elem){
      return elem.id === parseInt($this.val());
    });

    if(brand_model.length > 0){
      brand_model = brand_model[0];
      let mHeader = `<select id="select-model">`;
      let mOptions = [];
      for(let i = 0; i < brand_model.models.length; i++){
        let model = brand_model.models[i];
        mOptions.push(`<option value="${model.id}">${model.name}</option>`);
      }
      let mFooter = `</select>`;
  
      $('#model').html('').html(`
        <label>Models</label>
        ${mHeader}${mOptions.join('')}${mFooter}
      `);
    }else{
      $('#model').html('').html(`
        <label>Models</label>
        <select id="select-model"></select>
      `);
    }
  });

  $('#select-brand').trigger('change');

  $('#inp-down-amt').on('change', function(){
    let amountVal = $('#inp-loan-amt').val();

    amountVal = Helper.getAmountVal(amountVal);
    let downVal = 0;
    if ($('#inp-down-amt').val() == '') {
        downVal = amountVal * .2;
        $('#inp-down-amt').val(downVal);
    } else {
        downVal = parseInt($('#inp-down-amt').val());
        if (downVal > amountVal) {  
            downVal = amountVal * .2;
            $('#inp-down-amt').val(downVal);
        }
    }
    let percenVal = (downVal / amountVal) * 100;
    $('#inp-down-per').val(percenVal.toFixed(2));
  });

  $('#btncalc').on('click',function(){
    console.log(calculateLoan());
  });

  function calculateLoan() {
      let amountVal = $('#inp-loan-amt').val();
      let interestVal = $('#inp-interest-amt').val();
      let downVal = $('#inp-down-amt').val();
      let downPer = $('#inp-down-per').val();
      let termsVal = parseInt($('#inp-terms-val').val());

      let apr = Helper.getInterest(interestVal);
      let months = termsVal;
      let vehicleamount = Helper.getAmountVal(amountVal);
      let downpayment = Helper.getDownAmount(downPer, vehicleamount);
      let amount = vehicleamount - downpayment;
      let monthlyPayment = (((amount * apr) + amount) / months).toFixed(2);
      let total = (monthlyPayment * months).toFixed(2);
      let globalTotalInterest = (total - amount).toFixed(2);

      $('#monthly').text(`P ${Helper.commaSeparateNumber(monthlyPayment)}`);

      return {
        apr : apr,
        months: months,
        vehicleamount: vehicleamount,
        downpayment: downpayment,
        amount: amount,
        monthlyPayment: monthlyPayment,
        total: total,
        globalTotalInterest, globalTotalInterest
      };
  }  

  calculateLoan();

  function getBrands(){
    $.getJSON(`/auto/all`, (data)=>{
      storage.setObject('brands', data);
      hasLocal = data;
    });
  }
});