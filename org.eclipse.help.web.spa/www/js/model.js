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

	function strip(s, prefix) {
		return s.indexOf(prefix) == 0 ? s.substring(prefix.length) : s;
	}
	
	function elideParentReferences(path) {
		// need to iterate as the regex doesn't re-start on the replaced content
		// e.g., /a/../b/../c
		var replaced;
		while((replaced = path.replace(/\/\w+\/\.\.\//, '/')) != path) {
			path = replaced;
		}
		return path;
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
	var navContentUrl = baseUrl + '/vs/service/nav';
	var tocfragmentUrl = baseUrl + '/vs/service/tocfragment';

	return {
		baseUrl: baseUrl,
		
		/**
		 * Return a URL for obtaining the content of the Help document at the
		 * provided path
		 */
		asDocumentUrl: function(item) {
			var path = decode(item.href || item);
			path = elideParentReferences(path);
			// URLs assume they're relative to .../XXX.jsp
			if(path.indexOf('../topic/') == 0) {
				return elideParentReferences(topicContentUrl + '/' + path);
			} else if(path.indexOf('../nav/') == 0) {
				return elideParentReferences(navContentUrl + '/' + path) + '?returnType=html';
			} else {
				return topicContentUrl + '/' + path;
			}
		},
		
		isLeaf: function(item) {
			return item.image == 'topic';

		},
		
		/** Return a Content Provider: each returns a promise */
		getLabelProvider: function() {
			return {
				getLabelClasses: function getLabelClasses(item) {
					if(item.image == 'toc_closed') {
						return ['glyphicon', 'glyphicon-book'];
					} else if(item.image == 'container_topic') {
						return ['glyphicon', 'glyphicon-folder-open'];
					} else if(item.image == 'container_obj') {
						return ['glyphicon', 'glyphicon-folder-close'];
					} else /*if(item.image == 'topic')*/ {
						return ['glyphicon', 'glyphicon-file'];
					}
				},
				getLabel: function getLabel(item) {
					return decode(item.title);
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