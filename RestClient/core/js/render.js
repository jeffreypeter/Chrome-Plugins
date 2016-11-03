console.log("render.js loaded");
function loadTestData(testCase) {
	console.log("IN:: loadTestData");
	console.log(testCase);
	$("#ldata-type").val(testCase.type);
	$('#ldata-testName').val(testCase.testCaseName)
	$("#ldata-url").val(testCase.url);
	editor.setValue(testCase.requestBody);
	/*$("#datatype").val(testCase.datatype);*/
}