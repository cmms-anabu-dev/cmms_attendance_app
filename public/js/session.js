document.addEventListener("DOMContentLoaded", function (event) {

    $(".delete").click(function () {
        var date = this.dataset.date;
        var session = this.dataset.session;
        var url = '/deleteSession?date='+date+'&session='+session;
       
        $.get(url, (data, status, xhr) => {
            // alert(status);
            if (status == "success") {
                window.location.href = "/sessions";
            }
            else {
                var toastElList = [].slice.call(document.querySelectorAll('.toast'))
                var toastList = toastElList.map(function(toastEl) {
                    return new bootstrap.Toast(toastEl)
                });

                toastList.forEach(toast => toast.show());
            }
        });
    });

    
    $("#generate-report").click(function () {
        var iso_start_date = $('#start_date').val() + "T00:00:00.000Z";
        var iso_end_date = $('#end_date').val() + "T00:00:00.000Z";
        var session = $("input[name='opt_session']:checked").val();

        $.get('generateReport', {start_date: iso_start_date, end_date: iso_end_date, q_ses: session}, function (result) {
            console.log(result);

            var headers = {
                session: 'Session', 
                phonenum: "Phone Number",
                firstname: "First Name",
                lastname: "Last Name",
                baptism: "Baptism",
                date: "Date",

            };
    
            var itemsFormatted = [];
    
            Array.prototype.forEach.call(result, item => {
                itemsFormatted.push({
                    session: item.session,
                    phonenum: item.phonenum,
                    firstname: item.firstname,
                    lastname: item.lastname,
                    baptism: item.baptism,
                    date: item.date
                });
            });
    
            var fileTitle = 'Report' + "_" + $('#start_date').val() + "_" + $('#end_date').val() + session;
            
    
            exportCSVFile(headers, itemsFormatted, fileTitle);
        });

        function convertToCSV(objArray) {
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var str = '';
        
            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var index in array[i]) {
                    if (line != '') line += ','
        
                    line += array[i][index];
                }
        
                str += line + '\r\n';
            }
        
            return str;
        }
        
        function exportCSVFile(headers, items, fileTitle) {
            if (headers) {
                items.unshift(headers);
            }
        
            // Convert Object to JSON
            var jsonObject = JSON.stringify(items);
        
            var csv = convertToCSV(jsonObject);
        
            var exportedFilenmae = fileTitle + '.csv' || 'export.csv';
        
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, exportedFilenmae);
            } else {
                var link = document.createElement("a");
                if (link.download !== undefined) { 
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", exportedFilenmae);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        }
    });

    $(".btn").click(function () { 
        //console.log("SEARCH!");
        var info = document.querySelector('.form-control');
        let arrName = info.value.split(', ');

        console.log(arrName);
        
        
        var url = `/searchInfo?date=${arrName[0]}&session=${arrName[1]}`;
        $.post(url, (data, status, xhr) => {
            if (status == "success") {
                if (!data) {
                    console.log("Does not Exist!");
                }
                else {
                    console.log("Exist!");
                    window.location.href = "/sessionAttendance?date=" + arrName[0] + "&session=" + arrName[1];
                }
            }
        });
        
    });

    function initDates () {
        var day = new Date();
        var today = day.getFullYear() + '-' + (day.getMonth() + 1).toString().padStart(2, 0) + '-' + day.getDate().toString().padStart(2, 0);

        $('#start_date').val(today);
        $('#end_date').val(today);
    }

    function checkDateRange () {
        if($('#start_date').val() > $('#end_date').val() || $('#start_date').val() == '' || $('#end_date').val() == '')
            $('button#generate-report').prop('disabled', false);
        else
            $('button#generate-report').prop('disabled', true);
    }

    initDates();
    //checkDateRange();

    // $('#exit_btn').click(() => {
    //     $('#replay_modal').prop('display', 'none');
    // })
});
