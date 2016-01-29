angular.module('org.eclipse.help', 
		[
		 'org.eclipse.help.config',
		 'org.eclipse.help.model',
		 'org.eclipse.help.ui.toctree'
		 ])

// allow underscore.js to be injected into controllers; means we
// can use _ in expressions (http://stackoverflow.com/a/23984685)
.constant('_', window._)

.controller('MainController', function($scope, HelpAccess) {
	$scope.selectedTopic = undefined;
	$scope.selectedHelpItem = 'org.eclipse.platform.doc.isv/guide/ua_help_infocenter_preferences.htm';
	
	$scope.contented = HelpAccess.getContentProvider();
	$scope.labeller = HelpAccess.getLabelProvider();
})

.controller('DocumentController', function($scope, HelpAccess, $sce) {
	var helpPath = $scope.selectedHelpItem;
	// 'org.eclipse.platform.doc.isv/guide/ua_help_infocenter_preferences.htm';
	var remoteUrl = HelpAccess.asDocumentUrl(helpPath);
	$scope.topicUrl = $sce.trustAsResourceUrl(remoteUrl);
//	$http.get(remoteUrl).then(function(response) {
//		$scope.content = $sce.trustAsHtml(response.data);
//	});
})

.run(function($rootScope, BrandingTitle) {
	console.log("org.eclipse.help >> run()")
	$rootScope.BrandingTitle = BrandingTitle;
})
;
