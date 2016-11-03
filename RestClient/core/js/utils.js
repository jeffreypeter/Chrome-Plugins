console.log("Utils.js loaded")
var msg = { error:"danger", info:"info", warning:"warning", success:"success" }

function msgAlert(msg,type) {
//	console.log(type+" ::IN msg:: "+msg);
	$.notify({
		icon: 'fa fa-exclamation-circle',
		message: msg
	},{
		type: type,
		delay:2000,
		z_index:9999,
		animate: {
			enter: 'animated fadeInDown',
			exit: 'animated fadeOutUp'
		}	
	});
}

function validateJsonObjects(object) {
//	object = {item:'',item2:'test'};
	flag = true;
	if(typeof object != 'undefined' && !$.isEmptyObject(object) ) {
		$.each(object, function(i, data) {
		    if(typeof data != 'undefined' && !$.isEmptyObject(data)) {
		    	console.log(data);
		    } else {
		    	flag = false;
		    	return false;
		    }
		});		
	} else {
		flag = false;
	}
	return flag;
}
function validateJsonObject(object) {
	flag = true;
	if(typeof object != 'undefined' && !$.isEmptyObject(object) ) {
		
	} else {
		flag = false;
	}
	return flag;
}

function retrieveObject(object,key,value) {
//	key = 'itemName';
//	value = '1'
//	object = [{itemName:'1',itemValue:'test1'},{itemName:'2',itemValue:'test2'}];
	console.log(key+" -- "+value);
	var finalData;
	if(typeof key == 'undefined' || typeof value == 'undefined') {
		throw "key or value is undefined";
	} 
	if(typeof object != 'undefined' && !$.isEmptyObject(object)) {		
		$.each(object, function(i, data) {
	    	if(data[key] == value) {
	    		finalData = data;
	    		object.splice(i,1);
	    		return false;	    		
	    	}
		});
		console.log(object);
	} else {
		throw "Object is undefined or Empty";		
	}
	if(typeof finalData == 'undefined' || $.isEmptyObject(finalData) ) {
		throw "Data not found";
	}
	return finalData;
}
function retrieveObjectIndex(object,key,value) {
//	key = 'itemName';
//	value = '1'
//	object = [{itemName:'1',itemValue:'test1'},{itemName:'2',itemValue:'test2'}];
	console.log(key+" -- "+value);
	var index;
	if(typeof key == 'undefined' || typeof value == 'undefined') {
		throw "key or value is undefined";
	} 
	if(typeof object != 'undefined' && !$.isEmptyObject(object)) {		
		$.each(object, function(i, data) {
	    	if(data[key] == value) {
	    		index = i;	    		
	    		return false;	    		
	    	}
		});
	}
	if(typeof index == 'undefined') {
		index = -1;
	}
	return index;
}
function getCurrentTimeStamp(){
	 var today = new Date();
	    var dd = today.getDate();
	    var mm = today.getMonth()+1; //January is 0!
	    var yyyy = today.getFullYear();
	    var sc = today.getSeconds();
	    var mn= today.getMinutes();
	    var hr = today.getHours();	     
	    var date = dd+'/'+mm+'/'+yyyy+'-'+hr+':'+mn+':'+sc;
	    return date;
}