// dynamically add a requirement to the main app module
angular.module('org.eclipse.help').requires.push('org.eclipse.help.ui.bootstrap');

angular.module('org.eclipse.help.ui.bootstrap', ['ui.bootstrap'])

.directive('toolbar', function() {
	return {
		restrict: 'E',
		template: '<ul class="treexxx">'
			+ '<li>Tool Item</li>'
			+ '<li>Tool Item</li>'
			+ '<li>Tool Item</li>'
			+ '</ul>'
	}
})
;