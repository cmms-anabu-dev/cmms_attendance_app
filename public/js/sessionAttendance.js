document.addEventListener("DOMContentLoaded", function (event) {
    // Delete Attendance
    $(".delete").click(function () {
        var date = this.dataset.date;
        var session = this.dataset.session;
        var phonenum = this.dataset.phonenum;
        var url = '/deleteAttendance?date='+date+'&session='+session+"&phonenum="+phonenum;

        $.get(url, (data, status, xhr) => {
            // alert(status);
            if (status == "success") {
                window.location.href = "/sessionAttendance?date=" + date + "&session=" + session;
            }
            else {
                var toastElList = [].slice.call(document.querySelectorAll('.toast'));
                var toastList = toastElList.map(function(toastEl) {
                    return new bootstrap.Toast(toastEl)
                });

                toastList.forEach(toast => toast.show());
            }
        });
    });

    // Print Attendance
    $("#print-attendance").click(function () {
        var str_date = $('#nav_date').text();
        var str_session = $('#nav_session').text();
        
        var months = {
            "January": "01",
            "February": "02",
            "March": "03",
            "April": "04",
            "May": "05",
            "June": "06",
            "July": "07",
            "August": "08",
            "September": "09",
            "October": "10",
            "November": "11",
            "December": "12",
        };

        str_date = str_date.split(' ');

        var year = str_date[0].substr(0, 4);
        var month = months[str_date[1]];
        var day = str_date[2];

        if(parseInt(day) < 10)
            day = "0" + day;
        
        // YYYY-MM-DDTHH:mm:ss.sssZ
        var iso_start_date = year + "-" + month + "-" + day + "T" + "00:00:00.000Z";
        
        $.get('generateAttendence', {start_date: iso_start_date, q_ses: str_session}, function (result) {
            var headers = {
                session: 'Sessions', 
                phonenum: "Phone Number",
                firstname: "First Name",
                lastname: "Last Name",
                baptism: "Baptism",
                date: "Date",
                logtime: "Time"
            };
    
            var itemsFormatted = [];

            Array.prototype.forEach.call(result, item => {
                itemsFormatted.push({
                    session: item.session,
                    phonenum: item.phonenum,
                    firstname: item.firstname,
                    lastname: item.lastname,
                    baptism: item.baptism,
                    date: item.date,
                    logtime: item.logtime
                });
            });

            var fileTitle = 'attendance_' + year + "-" + month + "-" + day + "_" + str_session; 
    
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


    // Search Phone Number
    $("#button").click(function () { 
        var phonenum = document.querySelector('#forme');
        console.log(phonenum.value);
        var url = `/searchPhone?phonenum=${phonenum.value}`;
        $.post(url, (data, status, xhr) => {
            if (status == "success") {
                if (!data) {
                    console.log("Does not Exist!");
                }
                else {
                    console.log("Exist!");
                    window.location.href =`/profile?phonenum=${phonenum.value}`;
                }
            }
        });
        
    });
});
