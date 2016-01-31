angular.module('org.eclipse.help', 
		[
		 'org.eclipse.help.config',
		 'org.eclipse.help.model',
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

.controller('MainController', function($scope, HelpAccess) {
	function transform(item) {
		return {
			title: HelpAccess.getLabelProvider().getLabel(item),
			expanded: !HelpAccess.isLeaf(item),
			children: (HelpAccess.isLeaf(item) ? undefined : []),
			item: item
		};
	}
	$scope.titleDef = {
			field: 'title',
			displayName: 'Description',
			filterable: true,
			sortable: false
	};
	$scope.toc = {};
	$scope.expandItem = function(branch) {
		HelpAccess.getContentProvider().children(branch.item).then(function(children) {
			branch.children = _.map(children, transform);
		});
	}
	$scope.showItem = function(branch) {
		$scope.selectedHelpItem = branch.item;
	}
	
	HelpAccess.getContentProvider().roots().then(function(roots) {
		$scope.toc = _.map(roots, transform);
	});
	//$scope.selectedTopic = undefined;
	$scope.selectedHelpItem = 'org.eclipse.platform.doc.isv/guide/ua_help_infocenter_preferences.htm';
})

.controller('DocumentController', function($scope, HelpAccess, $sce) {
	$scope.$watch('selectedHelpItem', function(item) {
		// 'org.eclipse.platform.doc.isv/guide/ua_help_infocenter_preferences.htm';
		var remoteUrl = HelpAccess.asDocumentUrl(item);
		$scope.topicUrl = $sce.trustAsResourceUrl(remoteUrl);
		//	$http.get(remoteUrl).then(function(response) {
		//		$scope.content = $sce.trustAsHtml(response.data);
		//	});
	});
})

.run(function($rootScope, BrandingTitle) {
	console.log("org.eclipse.help >> run()")
	$rootScope.BrandingTitle = BrandingTitle;
})
;
