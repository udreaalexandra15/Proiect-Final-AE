/*global $*/

// READ recods on page load
$(document).ready(function () {
    console.log('here');
    readRecords(); // calling function
});

// READ records
function readRecords() {
    $.get("/reviews/", {}, function (data, status) {
        console.log(data);
        data.forEach(function(value) {
            console.log(value);
            var row = '<tr id="row_id_'+ value.id +'">'
            			+ displayColumns(value)
        				+ '</tr>';
            $('#articles').append(row);
        });
    });
}

function displayColumns(value) {
    return '<td>'+value.id+'</td>'
            + '<td class="name">'+value.name+'</td>'
            + '<td class="content">'+value.content+'</td>'
            + '<td class="score">'+value.score+'</td>'
             + '<td class="score">'+value.createdAt+'</td>'
              + '<td class="score">'+value.updatedAt+'</td>'
			+ '<td align="center">'
			+	'<button onclick="viewRecord('+ value.id +')" class="btn btn-edit">Update</button>'
			+ '</td>'
			+ '<td align="center">'
			+	'<button onclick="deleteRecord('+ value.id +')" class="btn btn-danger">Delete</button>'
			+ '</td>';
}

function addRecord() {
    $('#id').val('');
    $('#product_id').val('');
    $('#name').val('');
    $('#content').val('');
    $('#score').val('');
    
    $('#myModalLabel').html('Add New Review');
}

function viewRecord(id) {
    var url = "/reviews/" + id;
    
    $.get(url, {}, function (data, status) {
        //bind the values to the form fields
        $('#product_id').val(data.product_id);
        $('#name').val(data.name);
        $('#content').val(data.content);
        $('#id').val(id);
        $('#score').val(data.score);
        $('#myModalLabel').html('Edit Review');
        
        $('#add_new_record_modal').modal('show');
    });
}

function saveRecord() {
    //get data from the html form
    var formData = $('#record_form').serializeObject();
    
    //decide if it's an edit or create
    if(formData.id) {
        updateRecord(formData);
    } else {
        createRecord(formData);
    }
}

function createRecord(formData) {
    $.ajax({
        url: '/reviews/',
        type: 'POST',
        accepts: {
            json: 'application/json'
        },
        data: formData,
        success: function(data) {
            $('#add_new_record_modal').modal('hide');
            
            var row = '<tr id="row_id_'+ data.id +'">'
            			+ displayColumns(data)
        				+ '</tr>';
            $('#articles').append(row);
        } 
    });
}

function updateRecord(formData) {
    $.ajax({
        url: '/reviews/'+formData.id,
        type: 'PUT',
        accepts: {
            json: 'application/json'
        },
        data: formData,
        success: function(data) {
            $('#row_id_'+formData.id+'>td.product_id').html(formData.product_id);
            $('#row_id_'+formData.id+'>td.name').html(formData.name);
            $('#row_id_'+formData.id+'>td.score').html(formData.score);
            $('#row_id_'+formData.id+'>td.content').html(formData.content);
            $('#add_new_record_modal').modal('hide');
        } 
    });
}

function deleteRecord(id) {
    $.ajax({
        url: '/reviews/'+id,
        type: 'DELETE',
        success: function(data) {
            $('#row_id_'+id).remove();
        }
    });
}


function readRecords(productId) {   
    $.get("/reviews", {}, function (data, status) {
        console.log('data ' + JSON.stringify(data));
        data.forEach(function(value) {
             if(value.product_id == productId){
            var row = '<tr id="row_id_'+ value.id +'">'
            			+ displayColumns(value)
        				+ '</tr>';
            $('#articles').append(row);
             }
        });
    });
}