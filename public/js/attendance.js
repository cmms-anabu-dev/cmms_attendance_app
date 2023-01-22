document.addEventListener("DOMContentLoaded", function (event) {
	var labels = [];

	time();

	function time() {
		var date = new Date();
		var s = date.getSeconds();
		var m = date.getMinutes();
		var h = date.getHours();
		const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.getElementById('currentdt').innerHTML =  date.getFullYear() + ", " + monthNames[date.getMonth()] + " " + date.getDate() + " " + ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2) + ":" + ("0" + s).substr(-2);
	};
	
	setInterval(time, 1000);

	function printContainer (lastname, firstname, phonenum, baptism, check) {
		var tr = $('<tr>');
		
		var tdt = $('<td>');
		var divt = $('<div>');
		var input = $('<input/>');

		var tdm = $('<td>');
		var a = $('<a>');
		var lbl = $('<label>');

		var tdb = $('<td>');
		var divb = $('<div>');

		// Appending the properties

		tr.attr('id', 'person');

		divt.addClass("d-flex align-items-center");
		input.attr('type', 'checkbox');
		input.attr('name', 'box');
		input.attr('value', lastname + '_' + firstname);
		input.attr('checked', check);

		a.attr('href', "/profile?phonenum=" + phonenum);
		lbl.text(lastname + ', ' + firstname);
		lbl.attr('id', 'lbl');

		divb.addClass("category");
		divb.attr('id', baptism);
		divb.text(baptism);

		// Contructing the frame

		divt.append(input);
		tdt.append(divt);

		a.append(lbl);
		tdm.append(a);

		tdb.append(divb);

		tr.append(tdt);
		tr.append(tdm);
		tr.append(tdb);
		$('tbody').append(tr);
	}
	
	function updateCheckboxValues() {
		$('input[type=checkbox][name=box]').each(function () {
			var input_val = $(this).val();
			var input_spl = input_val.split('_');
			var name = input_spl[0].replace(' ', '-') + '_' + input_spl[1].replace(' ', '-');

			$(this).attr('value', name);
		});
	}

	function initPosts(names) {
		for(var i = 0; i < names.length; i++)
			printContainer(names[i].lastname, names[i].firstname,
						   names[i].phonenum , names[i].baptism ,
						   names[i].checked);
	}

	function initLabels () {
		$.get("loadUsers", {}, (data) => {
			data.forEach((item) => {
				labels.push({
					firstname: item.firstname,
					lastname: item.lastname,
					phonenum: item.phonenum,
					baptism: item.baptism,
					checked: false
				});
			});
		});
	}

	$('#search_bar').keyup(function () {
		var index;
		var indices = [];

		if($('label#lbl').length >= 0 && $('label#lbl').length <= labels.length) {
			if($('label#lbl').length != 0) {
				$('label#lbl').each(function () {
					var strSplit = $(this).text().split(', ');
					console.log(strSplit);
					index = labels.findIndex((item) => {
						return item.firstname == strSplit[1] && item.lastname == strSplit[0]; 
					});
					
					if(index != -1) {
						labels[index].checked = $("input[type=checkbox][name=box][value=" + strSplit[0].replace(' ', '-') + '_' + strSplit[1].replace(' ', '-') + "]").is(':checked');
					}
				});
			}

			$('tbody').empty();
			initPosts(labels);
		}

		
		$.get("searchUsers", {q_list: $(this).val()}, (data) => {
			data.forEach((item) => {
				index = labels.findIndex((lbl) => {
					return lbl.firstname == item.firstname && lbl.lastname == item.lastname &&
						   lbl.phonenum == item.phonenum   && lbl.baptism == item.baptism;
				});

				if(index != -1) {
					indices.push(index);
					labels[index].checked = $("input[type=checkbox][name=box][value=" + item.lastname.replace(' ', '-') + '_' + item.firstname.replace(' ', '-') + "]").is(':checked');
				}
			});

			$('tbody').empty();
			for(var i = 0; i < indices.length; i++)
				printContainer(labels[indices[i]].lastname, labels[indices[i]].firstname,
							   labels[indices[i]].phonenum, labels[indices[i]].baptism,
							   labels[indices[i]].checked);
		});
	});

	function checkSession() {
		if($('#session').val() == "SelectSession")
			$('#submit').prop('disabled', true);
		else
			$('#submit').prop('disabled', false);
	}

	function reset() {
		for(var i = 0; i < labels.length; i++)
			labels[i].checked = false;
		
		$('#search_bar').text('');

		$('#session').val("SelectSession");

		$('tbody').empty();
		
		initPosts(labels);
	}

	initLabels();
	updateCheckboxValues();
	checkSession();

	$("#session").click(() => {
		checkSession();
	});

	$("#submit").click(() => {
		var attendance = [];
		var index;

		if($('label#lbl').length >= 0 && $('label#lbl').length <= labels.length) {
			if($('label#lbl').length != 0) {
				$('label#lbl').each(function () {
					var strSplit = $(this).text().split(', ');
					console.log(strSplit);
					index = labels.findIndex((item) => {
						return item.firstname == strSplit[1] && item.lastname == strSplit[0]; 
					});
					
					if(index != -1) {
						labels[index].checked = $("input[type=checkbox][name=box][value=" + strSplit[0].replace(' ', '-') + '_' + strSplit[1].replace(' ', '-') + "]").is(':checked');
					}
				});
			}
		}

		for(var i = 0; i < labels.length; i++)
			if(labels[i].checked)
				attendance.push(labels[i]);

		$.get("submitAttendance", {data: attendance, session: $('#session').val()}, (result) => {
			if(result) {
				$.get("addSession", {session: $('#session').val()});

				var toastElList = [].slice.call(document.querySelectorAll('.toast'))
				var toastList = toastElList.map(function(toastEl) {
					return new bootstrap.Toast(toastEl)
				});
				toastList.forEach(toast => toast.show());
			}
		});

		reset();
	});
});
