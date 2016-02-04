angular.module('org.eclipse.help.widgets', ['org.eclipse.help.model'])

.directive('searchResults', function(HelpAccess) {
	return {
		restrict: 'E',
        replace: true,
        scope: {
        	'results':'=',
        	'select':'&onSelect',
    	},
    	controller: function($scope, HelpAccess) {
    		var labeller = HelpAccess.search.getLabelProvider();
    		$scope.getLabel = labeller.getLabel;
			$scope.getSummary = labeller.getSummary;
			$scope.getCategory = labeller.getCategory;
    	},
        template: '<div>'
        		+ '<p>{{results.length}} Results</p>'
                + '<ul class="search-results">'
                + '<li ng-repeat="result in results" ng-click="select({result:result})">'
                + '<span class="search-title">{{getLabel(result)}}</span>'
                + '</li>'
                + '</ul>'
                + '</div>'
                //+ '<span class="search-summary">{{getSummary(result)}}</span>'
                //+ '<span class="search-category">{{getCategory(result)}}</span>'

	}
})
