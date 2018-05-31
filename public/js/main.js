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
  if(storage.getItem('brands') !== null){
    hasLocal = storage.getObject('brands');
  }

  function loadBrands(){
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
  
    $('#model').html('').html('<label>Models</label><select id="select-model"></select>');
    
    $('#select-brand').off('change').on('change',function(){
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

        $('#select-model').off('change').on('change',function(){
          let $this = $(this);
          let brand_model = hasLocal.filter(function(elem){
            return elem.id === parseInt($('#select-brand').val());
          });
          console.log(brand_model);
          if(brand_model.length > 0){
            brand_model = brand_model[0];
            let model = brand_model.models.filter(elem=>{
              return elem.id === parseInt($this.val())
            });
            if(model.length > 0){
              $('#inp-loan-amt').val(model[0].price + '');
            }else{
              $('#inp-loan-amt').val(1000000);
            }
            console.log(calculateLoan());
          }
        });
      }else{
        $('#model').html('').html(`
          <label>Models</label>
          <select id="select-model"></select>
        `);
      }
    });

    $('#select-brand').trigger('change');
    $('#select-model').trigger('change');
  }

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
    console.log(calculateLoan());
  });

  $('#inp-terms-val').on('change',function(){
    console.log(calculateLoan());
  });

  $('#btncalc').on('click',function(){
    console.log(calculateLoan());
  });

  $('#btnsync').on('click',function(){
    getBrands();
  });

  $('#inp-down-per').on('change',function(){
    console.log(calculateLoan());
  });

  $('#inp-interest-amt').on('change',function(){
    console.log(calculateLoan());
  });

  $('#btnunsync').on('click',function(){
    hasLocal = [];
    storage.deleteObject('brands');
    $('#inp-loan-amt').val('1000000');
    $('#inp-interest-amt').val('15');
    $('#inp-down-per').val('20');
    $('#inp-down-amt').val('200000');
    loadBrands();
    calculateLoan();
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
      $('#downpay').text(`P ${Helper.commaSeparateNumber(downpayment.toFixed(2))}`);
      $('#totalint').text(`P ${Helper.commaSeparateNumber(globalTotalInterest)}`);
      $('#totalpay').text(`P ${Helper.commaSeparateNumber(total)}`);

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

  loadBrands();
  calculateLoan();

  function getBrands(){
    $('#btnsync').attr('disabled', 'disabled');
    $.getJSON(`/auto/all`, (data)=>{
      storage.setObject('brands', data);
      hasLocal = data;
      $('#btnsync').removeAttr('disabled');
      loadBrands();
      calculateLoan();
    });
  }
});