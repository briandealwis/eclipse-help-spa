angular.module('org.eclipse.help', 
		[
		 'org.eclipse.help.config',
		 'org.eclipse.help.model',
		 'org.eclipse.help.widgets',
		 'treeGrid'
		 ])

.config(function($provide){
    $provide.decorator("$sceDelegate", function($delegate, $log){
        return {
        	getTrusted: function(type, value) {
        		var result = $delegate.getTrusted(type, value);
        		$log.info("$sceDelegate input: " + value);
        		$log.info("$sceDelegate output: " + result);
        		return result;
        	},
        	trustAs: $delegate.trustAs,
        	valueOf: $delegate.valueOf,
        };
    });
})

// allow underscore.js to be injected into controllers; means we
// can use _ in expressions (http://stackoverflow.com/a/23984685)
.constant('_', window._)

.controller('MainController', function($scope, $location, $rootScope, HelpAccess) {
	function transform(item) {
		return {
			title: HelpAccess.getLabelProvider().getLabel(item),
			expanded:false,
			children: (HelpAccess.isLeaf(item) ? undefined : [{ title: 'loading...'}]),
			item: item
		};
	}
	$scope.titleDef = {
			field: 'title',
			displayName: 'Contents',
			filterable: true,
			sortable: false
	};
	$scope.toc = {};
	// FIXME: take from configuration
	$scope.selectedHelpItem =  'org.eclipse.platform.doc.isv/guide/ua_help_infocenter_preferences.htm';
	$scope.searchInProgress = false;
	$scope.searchToBeShown = false;

	$scope.showItem = function(branch) {
		$scope.selectedHelpItem = branch.item;
	}
	$scope.expandItem = function(branch) {
		HelpAccess.getContentProvider().children(branch.item).then(function(children) {
			branch.children = _.map(children, transform);
		});
	}
	HelpAccess.getContentProvider().roots().then(function(roots) {
		$scope.toc = _.map(roots, transform);
	});

	$rootScope.quickSearch = function(searchText) {
		$scope.searchInProgress = true;
		$scope.searchResults = null;
		$scope.searchToBeShown = true;
		return HelpAccess.search.query(searchText).then(function(results) {
			$scope.searchInProgress = false;
			$scope.searchResults = results;
			$scope.searchToBeShown = true;
		}, function(err) {
			$scope.searchInProgress = false;
			alert('An error occurred when searching: ' + JSON.stringify(err));
		});
	}
	$scope.showSearchResult = function(result) {
		// ugh, this is starting to get ugly
		$scope.selectedHelpItem = HelpAccess.search.asDocumentUrl(result);
	};
	
	$rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
		var newTopic = $location.search().topic;
		if(newTopic) {
			console.log("[LOCATION] showing topic " + newTopic);
			$scope.selectedHelpItem = newTopic; 
		}
	});
})

.controller('SearchController', function($scope, HelpAccess, $sce) {
	$scope.searchText = null;
})

.controller('DocumentController', function($scope, HelpAccess, $sce, $http) {
	$scope.$watch('selectedHelpItem', function(item) {
		// 'org.eclipse.platform.doc.isv/guide/ua_help_infocenter_preferences.htm';
		var remoteUrl = HelpAccess.asDocumentUrl(item);
		console.log("HELP SWITCH: " + remoteUrl);
		$scope.topicUrl = $sce.trustAsResourceUrl(remoteUrl);
//		$http.get(remoteUrl).then(function(response) {
//			$scope.content = $sce.trustAsHtml(response.data);
//		}, function(err) {
//			$scope.content = err;
//		});
	});
})

.run(function($rootScope, BrandingTitle) {
	console.log("org.eclipse.help >> run()")
	$rootScope.BrandingTitle = BrandingTitle;
})
;
