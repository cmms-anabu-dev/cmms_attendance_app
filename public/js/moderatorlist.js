document.addEventListener("DOMContentLoaded", function (event) {
    $(".delete").click(function () {
        var phonenum = $(this).data("id");
        console.log(phonenum);

        $.get('deleteModerator', {phonenum: phonenum}, function (result) {
            if (result) {
                // alert("Moderator successfuly deleted");
                window.location.href ="/load_moderators";
            }
            else {
                // alert("There is an error in deleting moderator");
                var toastElList = [].slice.call(document.querySelectorAll('.toast'))
					var toastList = toastElList.map(function(toastEl) {
						return new bootstrap.Toast(toastEl)
					});

                toastList.forEach(toast => toast.show());
            }
        })
    });

    $(".edit").click(function(){
        console.log($(this).data("phonenum"));
        console.log($(this).data("lastname"));
        console.log($(this).data("firstname"));
        console.log($(this).data("password"));
        var phonenum = $(this).data("phonenum");
        var lastname = $(this).data("lastname");
        var firstname = $(this).data("firstname");
        document.getElementById("spanlastname").textContent=lastname;
        document.getElementById("spanfirstname").textContent=firstname;
        $("#phonenum").attr('value', phonenum);
        $("#firstname").attr('value', firstname);
        $("#lastname").attr('value', lastname);
        var a = $("#update").data("phonenum");
        $("#update").attr('data-phonenum', phonenum);
    })

    $("#clear, #cancel").click(function(){
        document.getElementById("spanlastname").textContent=null;
        document.getElementById("spanfirstname").textContent=null;
        $("#phonenum").attr('value', null);
        $("#firstname").attr('value', null);
        $("#lastname").attr('value', null);
        $("#new-password").attr('value', null);
        $("#confirm-new-password").attr('value', null);
        var a = $("#update").data("phonenum");
        $("#update").attr('data-phonenum', null);
    });

    $("#update").click(function () {
        var origphonenum = $(this).attr('data-phonenum');
        var phonenum = $("#phonenum").val()
        var lastname = $("#lastname").val();
        var firstname = $("#firstname").val();
        var newPassword = $("#new-password").val();
        var confirmnewPassword = $("#confirm-new-password").val();

        if (phonenum == "" || lastname == "" || firstname == "" || (newPassword != "" && confirmnewPassword == "") || (newPassword == "" && confirmnewPassword != "")){
			$("#message-error").text("Please fill up all fields.");
        } else if (newPassword != confirmnewPassword) {
			$("#message-error").text("The passwords do not match. Please try again.");
        } else {
            $("#message-error").text("");
            $.get('updateModerator', {origphonenum: origphonenum, phonenum: phonenum, lastname:lastname, firstname:firstname, password:newPassword}, function (result) {
            if (result) {
                var toastElList = [].slice.call(document.querySelectorAll('.toast.bg-success'))
				var toastList = toastElList.map(function(toastEl) {
					return new bootstrap.Toast(toastEl)
				});
				toastList.forEach(toast => toast.show());

                console.log("result updated");
                // window.location.href ="/load_moderators";
            } else {
                var toastElList = [].slice.call(document.querySelectorAll('.toast.bg-danger'))
				var toastList = toastElList.map(function(toastEl) {
					return new bootstrap.Toast(toastEl)
				});
				toastList.forEach(toast => toast.show());

                console.log("result not updated");
            }
            });
        }
    });
	
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
