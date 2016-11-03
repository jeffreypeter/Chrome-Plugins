console.log("db-utils loaded");
var db;
var savePathNavBar={project:'',operation:'',testCase:''};
var projectTreeData= {};
var selectedItem={};
getDbConnection();
var projects=[];

function getDbConnection() {
	console.log("IN:: getDbConnection");
	try {
		var request = window.indexedDB.open("JustRestDB", 1);
		request.onerror = function(event) {
			console.log("Database error code: " + event.target.errorCode);
		};
		request.onupgradeneeded = function(event) {
			console.log("Upgrading");
			db = event.target.result;
			db.createObjectStore("Projects", {
				keyPath : "projectName"
			});
			/*db.createObjectStore("TestCases", {
				autoIncrement : true		
			});
			transaction = event.target.transaction.objectStore('TestCases');
			transaction.createIndex('TestNameIndex', 'testCaseName');*/
		};
		request.onsuccess = function(event) {
			console.log("db Success");
			db = event.target.result;
			getProjectList();
		}
		return db;
	} catch (e) {
		alert("Exception:: getDbConnection:: " + e.message);
		return undefined;
	}
}
function getProjectNameList() {
	console.log("IN:: getProjectNameList");
	var transaction = db.transaction([ "Projects" ], "readwrite");
	var objectStore = transaction.objectStore("Projects");
	var getProjLstReq = objectStore.getAllKeys();
	getProjLstReq.onsuccess = function(event) {
		console.log(event.target.result);
	}
	getProjLstReq.onerror = function (event) {
		console.log("getProjLstReq error");
	}
}
function getProjectList() {
	console.log("IN:: getProjectList");
	var transaction = db.transaction([ "Projects" ], "readwrite");
	var objectStore = transaction.objectStore("Projects");
	var getProjLstReq = objectStore.openCursor();
	projects=[];
	getProjLstReq.onsuccess = function (event) {
		var cursor = event.target.result;
		if (cursor) {
            projects.push(cursor.value) 
            cursor.continue();
       };
	}
	transaction.oncomplete = function(event) {
		console.log(projects);
		loadProjectList();
	}
}

function createProject(project) {
	console.log("IN:: create Project");
	console.log("projectName:: " + project.projectName)
	var data = {project:project.projectName,updatedDate:getCurrentTimeStamp()};
	var index = getDataIndices(data);
	if(index.projectIndex == -1) {
		console.log(project);
		var transaction = db.transaction([ "Projects" ], "readwrite");
		var objectStore = transaction.objectStore("Projects");		
		var createProjReq = objectStore.add(project);		
		createProjReq.onerror = function(event) {
			msgAlert("Project Creation Failed", msg.error);
		}
		return createProjReq;
	} else {
		msgAlert("Project Exsits ", msg.warning);
	}
}


function createOperation(operation) {
	console.log("IN createOperation");
	
	if(validateJsonObject(savePathNavBar.project)) {
		console.log("projectName:: " + savePathNavBar.project+" -operationName:: "+operation.operationName);
		var data = {
				project:savePathNavBar.project
		}
		var indexData = getDataIndices(data);
		var index = indexData.projectIndex;
		
		if(index == -1) {
			msgAlert("Invalid Project", msg.error);
		} else {
			if( typeof projects[index].operations == 'undefined') {
				projects[index].operations = [];
			}			
			projects[index].operations.push(operation);
			var request = updateProject(projects[index],"update");
		}
	} else {
		msgAlert('Please select a project',msg.warning);
	}
	return request;
}

function createTestCase(testCase) {
	console.log("IN:: createTestCase");
	console.log("testCase:: "+JSON.stringify(testCase));
	console.log("savePathNavBar:: "+JSON.stringify(savePathNavBar));
	testCase.projectName = savePathNavBar.project;
	testCase.operationName= savePathNavBar.operation;
	
	if(validateJsonObject(savePathNavBar.project) && validateJsonObject(savePathNavBar.operation)) {
		
		var projectIndex = retrieveObjectIndex(projects,"projectName",testCase.projectName);
		var operationName = testCase.operationName;
		var operationIndex;
		if (typeof projects[projectIndex].operations == 'undefined') {
			projects[projectIndex].operations = []; 
			// work in progress
		} else {
			operationIndex = retrieveObjectIndex(projects[projectIndex].operations,"operationName",operationName);
		}
		if(typeof projects[projectIndex].operations[operationIndex].testCases == 'undefined') {
			projects[projectIndex].operations[operationIndex].testCases = [];
		}
		projects[projectIndex].operations[operationIndex].testCases.push(testCase);
		var request = updateProject(projects[projectIndex],"update");
		request.onsuccess = function (event) {
			loadProjectList();
			msgAlert("TestCase Added",msg.success);
		}
	} else {
		msgAlert("Please select a Operation");
	}
}

function getTestCase(path) {
	console.log("IN:: getTestCase");
	var projectName = path.root;
	var operationName = path.branch;
	var testCaseName = path.leaf;
	var projectIndex = retrieveObjectIndex(projects,"projectName",projectName);
	var operationIndex = retrieveObjectIndex(projects[projectIndex].operations,"operationName",operationName);
	var testCaseIndex =  retrieveObjectIndex(projects[projectIndex].operations[operationIndex].testCases,"testCaseName",testCaseName);
	return projects[projectIndex].operations[operationIndex].testCases[testCaseIndex]
}

function editData(name) {
	console.log("IN:: editData")
	console.log(savePathNavBar);
	var index = getDataIndices(savePathNavBar);
	console.log(index);
	if(validateJsonObject(savePathNavBar.testCase)) {
		console.log("In edit testCase");
		projects[index.projectIndex].operations[index.operationIndex].testCases[testCaseIndex].testCaseName = name;
		var request = updateProject(projects[index.projectIndex],"update");
		request.onsuccess = function (event) {
			renderModalPrompt({
				action:"hide",
				title:"Edit Item"
			});
			loadProjectList();
			msgAlert("TestCase is edited Successfully",msg.success);
		}
	} else if (validateJsonObject(savePathNavBar.operation)) {
		console.log("In edit operation");
		projects[index.projectIndex].operations[index.operationIndex].operationName = name;
		var request = updateProject(projects[index.projectIndex],"update");
		request.onsuccess = function (event) {
			loadProjectList();
			renderModalPrompt({
				action:"hide",
				title:"Edit Item"
			});
			msgAlert("Operation is edited Successfully",msg.success);
		}
	} else if (validateJsonObject(savePathNavBar.project)) {
		var exProjectIndex = retrieveObjectIndex(projects,"projectName",name)
		console.log("IN edit project- "+exProjectIndex)
		var project = projects[index.projectIndex];
		console.log("Existing project - "+JSON.stringify(project))
		
		if(exProjectIndex == -1) {
			var request = updateProject(projects[index.projectIndex],"delete");
			request.onsuccess = function (event) {
				projects.splice(index.projectIndex,1);
				project.projectName = name;								
				request = createProject(project);				
				request.onsuccess = editProject;
			}			
		} else {
			msgAlert("Project already exists",msg.warning);
		}
		
	} else {
		msgAlert("Please select an item to edit",msg.warning);
	}
}
function editProject() {
	try {
		console.log("IN EditProject");
		loadProjectList();
		msgAlert("Project is edited successfully",msg.success);
	} catch(e) {
		msgAlert("Exception occued",msg.error);
	}
}
function updateProject(project,action) {
	console.log("IN:: UpdateProject - "+ action);
	var transaction = db.transaction([ "Projects" ], "readwrite");
	var objectStore = transaction.objectStore("Projects");
	console.log("Project Name::" +project.projectName);
	if(action == 'delete') {
		console.log('IN Delete action- '+project.projectName);
		var request = objectStore.delete(project.projectName);
		
		request.onerror = function(event) {
			console.log(event.target.result);
			msgAlert("Exception while Deleting project",msg.error);
		}
	} else if (action == 'update') {
		console.log('IN update action');
		var request = objectStore.put(project);	
		request.onerror = function(event) {
			console.log(event.target.result);
			msgAlert("Exception while Updating project",msg.error);
		}
	} else {
		msgAlert("Invalid operation",msg.danger);
	}
	
	return request;
}

function deleteData() {
	console.log("IN:: deleteData")
	console.log(savePathNavBar);
	var index = getDataIndices(savePathNavBar);
	console.log(index);
	var name;
//	try {
		if(validateJsonObject(savePathNavBar.testCase)) {
			console.log("In delete testCase");
			name = projects[index.projectIndex].operations[index.operationIndex].testCases[testCaseIndex].testCaseName;
			var request = updateProject(projects[index.projectIndex],"update");
			request.onsuccess = function (event) {
				projects[index.projectIndex].operations[index.operationIndex].testCases.splice(index.testCaseIndex,1);
				loadProjectList();
				msgAlert(name + " is deleted Successfully",msg.success);
			}
		} else if (validateJsonObject(savePathNavBar.operation)) {
			console.log("In delete operation");
			name = projects[index.projectIndex].operations[index.operationIndex].operationName;
			
			var request = updateProject(projects[index.projectIndex],"update");
			projects[index.projectIndex].operations.splice(index.operationIndex,1);
			request.onsuccess = function (event) {				
				loadProjectList();
				msgAlert(name + " is deleted Successfully",msg.success);
			}
		} else if (validateJsonObject(savePathNavBar.project)) {
			console.log("IN delete project")
			name = projects[index.projectIndex].projectName;
			var request = updateProject(projects[index.projectIndex],"delete");
			request.onsuccess = function (event) {
				projects.splice(index.projectIndex,1);
				loadProjectList();
				msgAlert(name + " is deleted Successfully",msg.success);
			}
		} else {
			msgAlert("Please select an item to delete",msg.warning);
		}
//	} catch(e) {
//		console.log(e);
//		msgAlert("Unable to Delete exception occured",msg.error);
//	}
	
} 
function loadProjectList() {			
	var projectListTree = [];
	for(projectIndex in projects) {
		var project = projects[projectIndex];
		var operationNodes = [];
		var projectData = {text:project.projectName};
		if( typeof project.operations != 'undefined' && project.operations.length > 0 ) {			
			for(operationIndex in project.operations) {
				var testCaseNodes =[];
				var operationData = {text:project.operations[operationIndex].operationName};
				if( typeof project.operations[operationIndex].testCases != 'undefined' && project.operations[operationIndex].testCases.length > 0 ) {
					for(testCaseIndex in project.operations[operationIndex].testCases) {
						var testCaseData = {text:project.operations[operationIndex].testCases[testCaseIndex].testCaseName};
						testCaseNodes.push(testCaseData);
					}
					operationData.nodes=testCaseNodes;
				}
				operationNodes.push(operationData);
			}
			projectData.nodes = operationNodes;
		}
		
		projectListTree.push(projectData);
	}
	console.log(JSON.stringify(projectListTree))
	projectExplorerTree = projectListTree;
	$('#project-explorer-tree').treeview({
		data: projectListTree,
		showBorder:false,
		onNodeSelected: function(event, data) {
		    var path = getPath(event,data,"#project-explorer-tree");
		    selectedItem = data;
		    console.log(data);
		    savePathNavBar = {project:path.root,operation:path.branch,testCase:path.leaf};
		    $('#project-explorer-tree').treeview('expandNode', [ data.nodeId, { levels: 1, silent: true } ]);
		    if(validateJsonObject(path.leaf)) {
		    	loadTestData(getTestCase(path));			    	
		    }
		    console.log(savePathNavBar);
		  },
		  onNodeUnselected: function (event,data) {
			  savePathNavBar={project:'',operation:'',testCase:''};
			  selectedItem ={};
			  console.log("Clear savePathNavBar");
		  } 
		});		
	if(!validateJsonObject( projectListTree)) {
		$('#project-tree').html("<p style='margin:10px'>No Project has been created</p>")
	}
	
	return projectListTree;
}
function setSavePath(event,data,id) {
	savePathNavBar={project:'',operation:'',testCase:''};
	console.log("IN:: setSavePath");
	var leafNode = $(id).treeview('getParent', data.nodeId);	
	if(leafNode.selector == id) {		
		console.log("Parent Node");
		savePathNavBar.project = data.text;		
	} else {		
		var childNode = $(id).treeview('getParent', leafNode.nodeId);
		if(childNode.selector == id) {
			console.log(leafNode);
			savePathNavBar.project = leafNode.text;
			savePathNavBar.operation = data.text;
			console.log("Operation Node");
		} else {
			var rootNode = $(id).treeview('getParent', childNode.nodeId);
			savePathNavBar.project = childNode.text;
			savePathNavBar.operation = leafNode.text;
			savePathNavBar.testCase = data.text;
			console.log("Test case");
		}
	}
	console.log(savePathNavBar);
}
function getPath(event,data,id) {
	var object = {};
	var leafNode = $(id).treeview('getParent', data.nodeId);	
	if(leafNode.selector == id) {		
		console.log("Parent Node");
		object.root = data.text;		
	} else {		
		var childNode = $(id).treeview('getParent', leafNode.nodeId);
		if(childNode.selector == id) {
			console.log(leafNode);
			object.root = leafNode.text;
			object.branch = data.text;
			console.log("Operation Node");
		} else {
			var rootNode = $(id).treeview('getParent', childNode.nodeId);
			object.root = childNode.text;
			object.branch = leafNode.text;
			object.leaf = data.text;
			console.log("Test case");
		}
	}
	return object;
}
function getDataIndices(data) {
	console.log("getDataIndices");
	var object = {};
	if(validateJsonObject(data.project)) {
		var projectIndex = retrieveObjectIndex(projects,"projectName",data.project);
		object.projectIndex = projectIndex;
		if(validateJsonObject(data.operation)) {
			var operationIndex = retrieveObjectIndex(projects[projectIndex].operations,"operationName",data.operation);
			object.operationIndex = operationIndex;object.operationIndex = operationIndex
			if(validateJsonObject(data.testCase)) {
				var testCaseIndex = retrieveObjectIndex(projects[projectIndex].operations[operationIndex].testCases,"testCaseName",data.testCase);
				object.testCaseIndex = testCaseIndex
			}
		} 
	}
	console.log(object);
	return object;
}