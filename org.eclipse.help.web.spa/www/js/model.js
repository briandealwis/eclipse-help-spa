angular.module('org.eclipse.help.model', [])

.factory('HelpAccess', function($http, $q, baseUrl) {
	
	/**
	 * The Eclipse Help tocfragment service encodes all strings and
	 * identifiers with application/x-www-form-urlencoded percent-encoding */
	function decode(x) {
		x = x.replace(/\+/g, '%20');
		return decodeURIComponent(x);
	}

	function encode(x) {
		return encodeURIComponent(x);
	}
	
	/**
	 * Return the list of Help Topics/Guides
	 * @returns a promise 
	 */
	function topics() {
		return $http.get(tocfragmentUrl + '?returnType=json')
		.then(function(response) {
			return response.data.items;
		});
	}
	
	/** object is a JSON topic item */
	function children(object) {
		var id = decodeURIComponent(object.id);
		var split = id.split('\$');
		var deetsParms = encode(split[0]) + (split.length > 1 ? '&path=' + encode(split[1]) : '');
		return $http.get(baseUrl + '/tocfragment?returnType=json&toc=' + deetsParms)
		.then(function(response) {
			return response.data.items;
		});
	}
	
	/** object is a JSON topic item */
	function parent(object) {
		var id = decodeURIComponent(object.id);
		var split = id.split('\$');
		// already a root element, so return null
		if(split.length == 1) { return $q.when(null); }
		var lastUnderscore = split[1].lastIndexOf('_');
		var deetsParms = encode(split[0]) + (lastUnderscore >= 0 
				? '&path=' + encode(split[1].substring(0, lastUnderscore)) : '');
		return $http.get(baseUrl + '/tocfragment?returnType=json&toc=' + deetsParms)
		.then(function(response) {
			return response.data.items;
		});
	}


	var topicContentUrl = baseUrl + '/vs/service/nftopic';
	var tocfragmentUrl = baseUrl + '/vs/service/tocfragment';

	return {
		baseUrl: baseUrl,
		
		/**
		 * Return a URL for obtaining the content of the Help document at the
		 * provided path
		 */
		asDocumentUrl: function(path) {
			return topicContentUrl + '/' + path;
		},
		
		/** Return a Content Provider: each returns a promise */
		getLabelProvider: function() {
			return {
				getLabelClasses: function getLabelClasses(object) {
					if(object.image == 'toc_closed') {
						return ['glyphicon', 'glyphicon-book'];
					} else if(object.image == 'container_topic') {
						return ['glyphicon', 'glyphicon-folder-open'];
					} else if(object.image == 'container_obj') {
						return ['glyphicon', 'glyphicon-folder-close'];
					} else /*if(object.image == 'topic')*/ {
						return ['glyphicon', 'glyphicon-file'];
					}
				},
				getLabel: function getLabel(object) {
					return decode(object.title);
				}
			}
		},
		
		/** Return a Content Provider: each returns a promise */
		getContentProvider: function() {
//			return {
//				roots: topics,
//				children: children,
//				hasChildren: function(parent) { return parent.image != 'topic'; },
//				parent: parent
//			};
			
			var testRoots = [
					      {
					         href:'..%2Ftopic%2F..%2Fnav%2F0',
					         tagName:'Topic',
					         type:'toc',
					         image:'toc_closed',
					         title:'Workbench+User+Guide',
					         id:'%2Forg.eclipse.platform.doc.user%2Ftoc.xml'
					      }
					   ];
			var testChildren = {
					'%2Forg.eclipse.platform.doc.user%2Ftoc.xml': [
                           {
                               href:'..%2Ftopic%2Forg.eclipse.platform.doc.user%2FgettingStarted%2Fintro%2Foverview.htm%3Fcp%3D0_0',
                               tagName:'Topic',
                               type:'toc',
                               is_leaf:'true',
                               image:'topic',
                               title:'Eclipse+platform+overview',
                               id:'%2Forg.eclipse.platform.doc.user%2Ftoc.xml%240'
                            },
                            {
                               href:'..%2Ftopic%2F..%2Fnav%2F0_1',
                               tagName:'Topic',
                               type:'toc',
                               image:'container_obj',
                               title:'Getting+started',
                               id:'%2Forg.eclipse.platform.doc.user%2Ftoc.xml%241'
                            },
                            {
                               href:'..%2Ftopic%2F..%2Fnav%2F0_2',
                               tagName:'Topic',
                               type:'toc',
                               image:'container_obj',
                               title:'Concepts',
                               id:'%2Forg.eclipse.platform.doc.user%2Ftoc.xml%242'
                            }],
                        '%2Forg.eclipse.platform.doc.user%2Ftoc.xml%241': [
                             {
						         href:'..%2Ftopic%2Forg.eclipse.platform.doc.user%2FgettingStarted%2Fqs-01.htm%3Fcp%3D0_1_0',
						         tagName:'Topic',
						         type:'toc',
						         image:'container_topic',
						         title:'Basic+tutorial',
						         id:'%2Forg.eclipse.platform.doc.user%2Ftoc.xml%241_0'
                             },
                             {
						         href:'..%2Ftopic%2Forg.eclipse.platform.doc.user%2FgettingStarted%2Fqs-60_team.htm%3Fcp%3D0_1_1',
						         tagName:'Topic',
						         type:'toc',
						         image:'container_topic',
						         title:'Team+CVS+tutorial',
						         id:'%2Forg.eclipse.platform.doc.user%2Ftoc.xml%241_1'
                             }],
                         '%2Forg.eclipse.platform.doc.user%2Ftoc.xml%242': [
							{
							    href:'..%2Ftopic%2Forg.eclipse.platform.doc.user%2Fconcepts%2Fwelcome.htm%3Fcp%3D0_2_0',
							    tagName:'Topic',
							    type:'toc',
							    is_leaf:'true',
							    image:'topic',
							    title:'Welcome',
							    id:'%2Forg.eclipse.platform.doc.user%2Ftoc.xml%242_0'
							 },
							 {
							    href:'..%2Ftopic%2Forg.eclipse.platform.doc.user%2Fconcepts%2Fconcepts-2.htm%3Fcp%3D0_2_1',
							    tagName:'Topic',
							    type:'toc',
							    image:'container_topic',
							    title:'Workbench',
							    id:'%2Forg.eclipse.platform.doc.user%2Ftoc.xml%242_1'
							 }]
						 };
			return {
				roots: function() { return $q.when(testRoots); },
				children: function(parent) { return $q.when(testChildren[parent.id]); },
				hasChildren: function(parent) { return parent.image != 'topic'; },
				parent: function(child) { return null; }
			};
		}
	}
})
;