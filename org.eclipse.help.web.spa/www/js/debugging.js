// dynamically add a requirement to the main app module
angular.module('org.eclipse.help').requires.push('org.eclipse.help.debugging');

angular.module('org.eclipse.help.debugging', [])

/**************************************\
 ** Dump UI router/view state changes
\**************************************/
.run(function($rootScope) {
	console.log("org.eclipse.help.debugging: run()");
	/** if non-null, show more information */
	$rootScope.DEBUGGING_AVAILABLE = true;
	$rootScope.DEBUGGING = false;
	
	$rootScope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
		console.log("[STATE] Switched to {" + to.name + "} from {" + from.name + "}");
	});
	$rootScope.$on('$stateChangeStart', function(e, to, toParams, from, fromParams) {
		console.log("[STATE] Start state switch to {" + to.name + "} from {" + from.name + "}");
		//console.dir(arguments);
	});
	$rootScope.$on('$stateChangeError', function(e) {
		console.log("[STATE] Error switching state");
		console.dir(arguments);
	});
	$rootScope.$on('$stateNotFound', function(e) {
		console.log("[STATE] State not found: ");
		console.dir(arguments);
	});

	$rootScope.$on('$locationChangeStart', function(e, newUrl, oldUrl) {
		console.log("[LOCATION] Changing to " + newUrl + " from " + oldUrl);
	});
	$rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
		console.log("[LOCATION] Change success to " + newUrl + " from " + oldUrl);
		console.dir(arguments);
	});
})

/**************************************\
 ** Web debugging aids
\**************************************/
.factory('loggingInterceptor', function($log) {  
    return {
    	request: function(config) {
    		$log.debug('requested: ' + config.url);
    		return config;
    	}
    };
})

.config(function($httpProvider) {
    $httpProvider.interceptors.push('loggingInterceptor');
})

;
