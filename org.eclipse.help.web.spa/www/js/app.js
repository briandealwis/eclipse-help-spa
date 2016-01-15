angular.module('EclipseHelp', ['ui.bootstrap'])

.controller('MainController', function($scope) {
})

.directive('tableOfContents', function() {
	return {
		restrict: 'E',
		replace: true,
		template: '<ul class="treexxx">'
			+ '<li><i class="glyphicon glyphicon-book"/> <a ng-click="open()">aaa</a></li>'
			+ '<li><i class="glyphicon glyphicon-book"/> <a ng-click="open()">bbb</a></li>'
			+ '<li><i class="glyphicon glyphicon-book"/> <a ng-click="open()">ccc</a></li>'
			+ '</ul>'
	}
})
;
