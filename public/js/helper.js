
let Helper = {
  commaSeparateNumber: (val) => {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
  },
  getAmountVal: (amountVal) => {
    if (amountVal == '') {
        amountVal = '1000000';
        return Helper.commaSeparateNumber(amountVal);
    }
    if(typeof amountVal === 'string') amountVal = amountVal.replace(/,/g, "");
    return parseInt(amountVal);
  },
  getInterest : (interestVal) => {
    if (interestVal == '') {
        interestVal = .15;
        return interestVal;
    } else {
        interestVal = interestVal / 100;
    }
    return parseFloat(interestVal);
  },
  getDownAmount: (percentVal, amountVal) => {
    if(typeof percentVal !== 'string') amountVal = amountVal + '';
    
    let amtVal = Helper.getAmountVal(amountVal);

    if (percentVal == '') {
        percentVal = .2;
        return percentVal;
    } else {
        percentVal = percentVal / 100;
    }
    let downVal = percentVal * amtVal;
    // downVal = Helper.commaSeparateNumber(downVal);
    return downVal;
  }
}

export default Helper;