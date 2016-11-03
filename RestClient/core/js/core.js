console.log("Core.js Loaded");
var editor;

$(document).ready(
		function() {
			console.log("Lets Rest");	
			$('#sidenav').simplerSidebar({
				opener : '#toggle-sidenav',
				top : 46,
				animation : {
					easing : 'easeOutQuint'
				},
				sidebar : {
					align : 'right',
					width : 400,
					closingLinks : '.close-sidebar',
					css : {
						zIndex : 3000
					}
				}
			});
			loadFormData();
			console.log("Init:: CodeMirror");
			editor = CodeMirror.fromTextArea(document
					.getElementById("ldata-requestBody"), {
				lineNumbers : true,
				matchBrackets : true,
				mode : "javascript",
				scrollbarStyle : "simple"
			});
			editor.setSize(null, "100%");
			$('#resize-requestBody').resizable({
				handles : 's',
				minHeight : 400
			});
			$('#sidebar-wrapper').resizable({
				handles : 'w'
			});
			
		});
$('.easy-sidebar-toggle').click(function(e) {
	e.preventDefault();
	$('body').toggleClass('toggled');
	$('.navbar.easy-sidebar').removeClass('toggled');
});
$('html').on('swiperight', function() {
	$('body').addClass('toggled');
});
$('html').on('swipeleft', function() {
	$('body').removeClass('toggled');
});

/**
 * Click Events
 */
$("#send").click(httpConnection);
$("#save-data").click(saveData);
$("#reset-data").click(clearInput);
$("a[id^='sidebar-create-']").click(function(event) {
	event.preventDefault();
	renderCreatePanel('show',$(this).html())
});
$("#sidebar-collapse-cancel").click(function(event) {
	event.preventDefault();
	renderCreatePanel('hide',"");
});
$("#sidebar-collapse-create").click(function(event) {
	event.preventDefault();
	createData();
});

$('#sidebar-save').on('click',function (e){
	e.preventDefault();
	saveTestCase();
});
$('#sidebar-collapse-tree').on('click',function (){
	$('#project-explorer-tree').treeview('collapseAll', { silent: true });
});
$('#sidebar-expand-tree').on('click',function (){
	$('#project-explorer-tree').treeview('expandAll', { levels: 1, silent: true });
});

$('#project-explorer-tree-search').on('click',function() {
	searchTree('#project-explorer-tree');
});
$('#sidebar-delete').on('click',function (){
	deleteData();
}) 
$('#sidebar-edit').on('click',function() {
	/*editData();*/
	console.log("editable")
	$("li[data-nodeid="+selectedItem.nodeId+"]").attr("contentEditable","true")
	$("li[data-nodeid="+selectedItem.nodeId+"]").focus();
})
$('#project-explorer-tree-search').on('click',function() {
	 var pattern = $('#project-explorer-tree-pattern').val();
     var options = {
       ignoreCase: true,
       exactMatch: false,
       revealResults: true
     };
     var results = $('#project-explorer-tree').treeview('search', [ pattern, options ]);
     console.log(results)
     /*var output = '<p>' + results.length + ' matches found</p>';
     $.each(results, function (index, result) {
       output += '<p>- ' + result.text + '</p>';
     });
     $('#search-output').html(output);*/
});
$('#project-explorer-tree-clear').on('click',function() {
	 $('#project-explorer-tree').treeview('clearSearch');
	 $('#project-explorer-tree-pattern').val("");
})

/**
 * Treeview Events 
 */
/*$('#project-tree').on('nodeSelected',function(event,data) {
	console.log(data);
    id='#project-tree';
    setSavePath(event,data,id)
});
$('#project-tree').on('onNodeUnselected',function(event,data) {
	 console.log("Clear savePathModal");
	 savePathModal= {project:'',operation:'',testCase:''};
});
$('#project-explorer-tree').on('nodeSelected',function(event,data) {
	var path = getPath(event,data,"#project-explorer-tree");
    if(validateJsonObject(path.leaf)) {
    	getTestCase(path);
    }
    console.log(path);
});*/
//$('#project-explorer-tree').on('nodeSelected',function(event,node) {
//	console.log("onNodeUnselected");
//});


function searchTree(id) {
	var pattern = $(id+'-pattern').val();
    var options = {
     /* ignoreCase: $('#chk-ignore-case').is(':checked'),
      exactMatch: $('#chk-exact-match').is(':checked'),
      revealResults: $('#chk-reveal-results').is(':checked')*/
    };
    var results = $(id).treeview('search', [ pattern, options ]);
    console.log(results)
}
function saveTestCase() {
	console.log("IN:: saveTestCase");
	var type = $("#ldata-type").val();
	var url = $("#ldata-url").val();
	var requestBody = editor.getValue();
	var testName = $('#ldata-testName').val();	
	var testCase = {testCaseName:testName,url:url,type:type,requestBody:requestBody,updatedDate:'1'};
	if(validateJsonObject(testCase.testCaseName)) {
		createTestCase(testCase);
	} else {
		msgAlert("Please Enter Testcase Name",msg.warning);
	}
}

function createData() {
	console.log("In createData");
	var type = $("#sidebar-collapse-type").val();
	var name = $("#sidebar-collapse-name").val();
	console.log("name:: "+name+"-type:: "+type);
	var flag;
	if(name) {
		if(type.toLowerCase() == 'project') {
			flag = createProject(name);
		} else if (type.toLowerCase() == 'operation') {
			flag = createOperation(name);
		} else {
			msgAlert('Create type invalid',msg.error);
		}
	} else {
		msgAlert('Name invalid',msg.error);
	}
	if (flag) {
		resetSideBar();
	}
}
function renderCreatePanel(action,type) {
	console.log("In createData");
//	$("#modal-create-dropdown").collapse("hide");
	if(action == 'show') {
		$("#sidebar-collapse-create-panel").collapse("show");
		$("#sidebar-collapse-type").val(type);
		$("#sidebar-collapse-name").focus();
	} else if (action == 'hide') {
		$("#sidebar-collapse-create-panel").collapse("hide");
		$("#sidebar-collapse-type").val("");
		$("#sidebar-collapse-name").val("");
	}
}
function clearInput() {
	$('input').val('');
	editor.setValue('');
}
function resetSideBar() {
	console.log("IN:: resetSideBar");
	renderCreatePanel('hide',"");
	/*$("#modal-collapse-type").val("");
	$("#modal-collapse-name").val("");
	$("#modal-create-dropdown").collapse("show");
	$("#modal-create-panel").collapse("hide");
	savePathModal={project:'',operation:'',testCase:''};*/
}
function httpConnection() {
	console.log("IN:: httpConnection");
	var type = $("#ldata-type").val();
	var url = $("#ldata-url").val();
	var requestBody = editor.getValue();
	var datatype = "json";//("#datatype").val();
	console.log("type::" + type + "\nurl::" + url + "\nrequestBody::"
			+ requestBody + "\ndatatype::" + datatype);
	setFormData();
	$.ajax({
		url : url,
		type : "POST",
		contentType : "application/json",
		dataType : "json",
		data : requestBody,
		success : function(responseBody, status, response) {
			console.log(responseBody);
			//			  console.log(response.getResponseHeader("date"));
			console.log(response.getAllResponseHeaders());
			setResponseBody(responseBody);
		}
	});

}
function setResponseBody(responseBody) {
	console.log("IN:: responseBody");
	$("#responseBody").JSONView(responseBody);
}
function setFormData() {
	console.log("IN:: setFormData");
	var type = $("#ldata-type").val();
	var url = $("#ldata-url").val();
	var requestBody = editor.getValue();
	var testName = $('#ldata-testName').val();
	localStorage.setItem("type", type);
	localStorage.setItem("url", url);
	localStorage.setItem("requestBody", requestBody);
	localStorage.setItem("testName", testName);
	//    localStorage.setItem("datatype", datatype);
}
function loadFormData() {

	$("#ldata-type").val(localStorage.getItem("type"));
	$('#ldata-testName').val(localStorage.getItem("testName"))
	$('#modal-save-testName').val(localStorage.getItem("testName"));
	$("#ldata-url").val(localStorage.getItem("url"));
	$("#ldata-requestBody").val(localStorage.getItem("requestBody"));
	$("#datatype").val(localStorage.getItem("datatype"));
}

function saveData(projectName, operation) {
	console.log("IN:: SaveData");
	$("#modal-save-window").modal();
	loadProjectList();
}
