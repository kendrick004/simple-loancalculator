let donuteChart = null;
let lineGraph = null;
(function($) {
    let minNumber = 0;
    let maxAmount = 500000000;
    let maxMonth = 60;
    let maxInterest = 100;
    let monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let globalTotalInterest = 0;
    let dateToday = new Date();
    let globalMonth = dateToday.getMonth();
    let globalYear = dateToday.getFullYear();
    let globalCurrencySymbol = '₱';
    $('.input-percent').mask('##.##%', {
        reverse: true
    });
    $('.money').mask('000,000,000,000,000', {
        reverse: true
    });
    calculateLoan();
    function commaSeparateNumber(val) {
        while (/(\d+)(\d{3})/.test(val.toString())) {
            val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
        }
        return val;
    }
    function getAmountVal() {
        let amountVal = $('#loan-calc-input-amount').val();
        if (amountVal == '') {
            amountVal = '1000000';
            $('#loan-calc-input-amount').val(commaSeparateNumber(amountVal));
        }
        amountVal = amountVal.replace(/,/g, "");
        return parseInt(amountVal);
    }
    function getInterest() {
        let interestVal = $('#loan-calc-input-interest').val();
        if (interestVal == '') {
            interestVal = .15;
            $('#loan-calc-input-interest').val('15%');
        } else {
            interestVal = interestVal.replace('%', '') / 100;
        }
        return parseFloat(interestVal);
    }
    function getDownAmount() {
        let amountVal = getAmountVal();
        let percentVal = $('#loan-calc-input-down-percent').val();
        if (percentVal == '') {
            percentVal = .2;
            $('#loan-calc-input-down-percent').val('20%');
        } else {
            percentVal = percentVal.replace('%', '') / 100;
        }
        let downVal = percentVal * amountVal;
        $('#loan-calc-input-down-amount').val(commaSeparateNumber(downVal));
        return downVal;
    }
    $('#loan-calc-input-down-amount').change(function() {
        let amountVal = getAmountVal();
        let downVal = 0;
        if ($('#loan-calc-input-down-amount').val() == '') {
            downVal = amountVal * .2;
            $('#loan-calc-input-down-amount').val(downVal);
        } else {
            let downVal = parseInt($('#loan-calc-input-down-amount').val().replace(/,/g, ""));
            if (downVal > amountVal) {
                downVal = amountVal * .2;
                $('#loan-calc-input-down-amount').val(downVal);
            }
        }
        let percenVal = (downVal / amountVal) * 100;
        $('#loan-calc-input-down-percent').val(percenVal.toFixed(2) + '%');
    });
    $('.choice-term').on('click', function() {
        let termVal = $(this).attr('data-term');
        $('#loan-calc-input-term').val(termVal);
        calculateLoan();
        $('#term-dropdown-val').text($(this).attr('data-term-label'));
    });
    $('.term-type').on('click', function() {
        let termVal = $('#loan-calc-input-term').val();
        if ($(this).attr('href').indexOf('months') == -1) {
            $(".term-years li").removeClass('active');
        } else {
            $(".term-months li").removeClass('active');
        }
        $("li[data-term='" + termVal + "']").addClass('active');
    });
    $('.loan-calc-tool-input').change(function() {
        calculateLoan();
    });
    function calculateLoan() {
        let apr = getInterest();
        let months = parseInt($('#loan-calc-input-term').val());
        let vehicleamount = getAmountVal();
        let downpayment = getDownAmount();
        let amount = vehicleamount - downpayment;
        let monthlyPayment = (((amount * apr) + amount) / months).toFixed(2);
        let total = (monthlyPayment * months).toFixed(2);
        globalTotalInterest = (total - amount).toFixed(2);
        let pesoSign = '<span style="font-family: Arial">' + globalCurrencySymbol + ' </span> ' + ' ';
        $('#monthly-payment-value').html(pesoSign + commaSeparateNumber(monthlyPayment));
        $('#loan-detail-over-principal').html(pesoSign + commaSeparateNumber(amount));
        $('#loan-detail-over-down').html(pesoSign + commaSeparateNumber(downpayment));
        $('#loan-detail-over-monthly').html(pesoSign + commaSeparateNumber(monthlyPayment));
        $('#loan-detail-over-total-int').html(pesoSign + commaSeparateNumber(globalTotalInterest));
        $('#loan-detail-over-total-pay').html(pesoSign + commaSeparateNumber(total));
        updateDonutChart(globalTotalInterest, amount, downpayment);
        updateTableData(monthlyPayment, total, months);
        updateLineGraph(monthlyPayment, total, (amount / months), amount, months);
    }
    $('.loan-calc-tool-input').on('input', function() {
        if (this.value === '' || this.value == '0') {
            this.value = '';
        }
    });
    function updateTableData(monthlyPayment, totalAmount, termMonths) {
        let tableData = [];
        termMonths += globalMonth;
        let thisYear = globalYear;
        let rowDate = '';
        for (i = globalMonth; i < termMonths; i++) {
            if ((i % 12 == 0) && (i > globalMonth)) {
                thisYear++;
            }
            rowDate = monthName[i % 12] + " " + thisYear;
            totalAmount -= monthlyPayment;
            tableData.push([rowDate, commaSeparateNumber(monthlyPayment), commaSeparateNumber(totalAmount.toFixed(2))]);
        }
        $('#calc-repayment-data-table').DataTable({
            destroy: true,
            data: tableData,
            columns: [{
                title: "Date"
            }, {
                title: "Monthly"
            }, {
                title: "Balance"
            }, ],
            "pagingType": "simple",
            "displayLength": 6,
            "searching": false,
            "info": false,
            "order": [[2, "desc"]],
            "lengthMenu": [[6, 12, 24, -1], [6, 12, 24, "All"]],
            "oLanguage": {
                "oPaginate": {
                    "sNext": ">",
                    "sPrevious": "<"
                }
            }
        });
    }
    function updateLineGraph(monthlyPayment, totalAmount, monthlyPrincipal, principal, termMonths) {
        let lineChartData = {};
        lineChartData.labels = [];
        lineChartData.datasets = [];
        termMonths += globalMonth;
        let thisYear = 0;
        for (line = 0; line < 2; line++) {
            lineChartData.datasets.push({});
            dataset = lineChartData.datasets[line];
            if (line == 1) {
                dataset.label = "Total Payment";
                dataset.backgroundColor = "rgba(10,96,203,0.1)";
                dataset.borderColor = "rgba(10,96,203,1)";
                dataset.pointHoverBackgroundColor = "rgba(10,96,203,0.5)";
                dataset.pointHoverBorderColor = "rgba(10,96,203,1)";
            } else {
                dataset.label = "Principal";
                dataset.backgroundColor = "rgba(52,205,151,0.4)";
                dataset.borderColor = "rgba(52,205,151,1)";
                dataset.pointHoverBackgroundColor = "rgba(52,205,151,0.5)";
                dataset.pointHoverBorderColor = "rgba(52,205,151,1)";
            }
            dataset.borderJoinStyle = 'miter';
            dataset.lineTension = 0.1;
            dataset.pointBackgroundColor = "#fff";
            dataset.pointBorderWidth = 4;
            dataset.pointHoverRadius = 2;
            dataset.pointHoverBorderWidth = 3;
            dataset.pointRadius = 1;
            dataset.pointHitRadius = 5;
            dataset.data = [];
        }
        totalPaymentData = [];
        pricipalData = [];
        thisYear = globalYear;
        for (i = globalMonth; i < termMonths; i++) {
            if ((i % 12 == 0) && (i > globalMonth)) {
                thisYear++;
            }
            rowDate = monthName[i % 12] + " " + thisYear;
            totalAmount -= monthlyPayment;
            principal -= monthlyPrincipal;
            totalPaymentData.push(totalAmount.toFixed(2));
            pricipalData.push(principal.toFixed(2));
            lineChartData.labels.push(rowDate);
        }
        lineChartData.datasets[0].data = pricipalData;
        lineChartData.datasets[1].data = totalPaymentData;
        let lineOptions = {
            legend: {
                display: false,
            },
            responsive: true,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    fontColor: '#455964',
                    boxWidth: 10,
                    padding: 20,
                }
            }
        };
        if (lineGraph != null) {
            lineGraph.destroy();
        }
        let canvas = $("#detail-line-graph").get(0);
        let ctx = $("#detail-line-graph").get(0).getContext("2d");
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        lineGraph = Chart.Line(ctx, {
            data: lineChartData,
            options: lineOptions
        });
    }
    function updateDonutChart(totalInterest, amount, downpayment) {
        $("#payment-breakdown-interest").html(globalCurrencySymbol + ' ' + commaSeparateNumber(totalInterest));
        $("#payment-breakdown-principal").html(globalCurrencySymbol + ' ' + commaSeparateNumber(amount));
        $("#payment-breakdown-downpayment").html(globalCurrencySymbol + ' ' + commaSeparateNumber(downpayment));
        let data = {
            labels: ["Principal", "Interest", "Down Payment"],
            datasets: [{
                data: [amount, totalInterest, downpayment],
                backgroundColor: ["#2EDEA1", "#FF6384", "#FEDD85", ],
                hoverBackgroundColor: ["#26D196", "#E64365", '#EDCC72', ],
                borderColor: ["#FFF", "#FFF", "#FFF", ],
                borderWidth: [5, 5, 5, ],
            }]
        };
        let options = {
            legend: {
                display: false,
            },
            cutoutPercentage: 55,
            maintainAspectRatio: true,
            responsive: true,
        };
        if (donuteChart != null) {
            donuteChart.destroy();
        }
        let canvas = $("#payment-division-donut").get(0);
        let ctx = $("#payment-division-donut").get(0).getContext("2d");
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        donuteChart = new Chart(ctx,{
            type: 'doughnut',
            data: data,
            options: options,
        });
    }
}
)(jQuery);
