angular.module('org.eclipse.help.model', [])

.factory('HelpAccess', function($http, $q, baseUrl) {
	
	/**
	 * The Eclipse Help services encode all strings and
	 * identifiers from JSON with application/x-www-form-urlencoded
	 * percent-encoding */
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
	

	/* Don't use /vs/service/ for topics and nav links as
	 * internal links are relative and the services return 
	 * XML and not HTML */ 
	var topicContentUrl = baseUrl + '/vs/service/nftopic';
	var navContentUrl = baseUrl + '/nav';
	var tocfragmentUrl = baseUrl + '/vs/service/tocfragment';
	var searchUrl = baseUrl + '/vs/service/advancedsearch';

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
		return $http.get(tocfragmentUrl + '?returnType=json&toc=' + deetsParms)
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
		return $http.get(tocfragmentUrl + '?returnType=json&toc=' + deetsParms)
		.then(function(response) {
			return response.data.items;
		});
	}
	/**
	 * Return a URL for obtaining the content of the Help document at the
	 * provided path
	 */
	function asDocumentURL(item) {
		var path = decode(item.href || item);
		path = elideParentReferences(path);
		if(path.indexOf('http') == 0) {
			return path
		}
		if(path.indexOf('../topic/') == 0) {
			return elideParentReferences(topicContentUrl + '/' + path);
		} else if(path.indexOf('../nav/') == 0) {
			return elideParentReferences(navContentUrl + '/' + path) + '?returnType=html';
		} else if(path.indexOf('/') == 0) {
			return topicContentUrl + path;
		} else {
			return topicContentUrl + '/' + path;
		}
	}

	return {
		baseUrl: baseUrl,
		asDocumentUrl: asDocumentURL,
		
		isLeaf: function(item) {
			return item.image == 'topic';

		},
		
		search: {
			query:  function query(searchText, maxHits) {
				if(!maxHits) { maxHits = 50; }
				var url = searchUrl + '?returnType=json';
				url += '&searchWord=' + encode(searchText);
				url += '&maxHits=' + maxHits;
				return $q.when([
					      {
					         href:'%2Forg.eclipse.jdt.doc.user%2Freference%2Fref-export-runnable-jar.htm%3Fresultof%3D%2522%2552%2575%256e%256e%2561%2562%256c%2565%2522%2520%2522%2572%2575%256e%256e%2561%2562%256c%2522%2520',
					         summary:'The+%5BOpens+the+Runnable+JAR+export+wizard%5D+Runnable+Jar+Export+wizard+allows+you+to+create+a+runnable+JAR+file.+Runnable+JAR+file+specification+Runnable+JAR+Specification+O...',
					         label:'Runnable+JAR+File+Exporter',
					         tagName:'hit',
					         category:'Java+development+user+guide',
					         categoryHref:'..%2Fnav%2F1',
					         score:'1.0',
					         id:'0'
					      },
					      {
					         href:'%2Forg.eclipse.jdt.doc.user%2Ftasks%2Ftasks-37.htm%3Fresultof%3D%2522%2552%2575%256e%256e%2561%2562%256c%2565%2522%2520%2522%2572%2575%256e%256e%2561%2562%256c%2522%2520',
					         summary:'To+create+a+new+runnable+JAR+file+in+the+workbench%3A+From+the+menu+bar%27s+File+menu%2C+select+Export.+Expand+the+Java+node+and+select+Runnable+JAR+file.+Click+Next.+In+the+%5BOpe...',
					         label:'Creating+a+New+Runnable+JAR+File',
					         tagName:'hit',
					         category:'Java+development+user+guide',
					         categoryHref:'..%2Fnav%2F1',
					         score:'0.93612075',
					         id:'1'
					      },
					      {
					         href:'%2Forg.eclipse.platform.doc.isv%2Freference%2Fapi%2Forg%2Feclipse%2Fosgi%2Fservice%2Frunnable%2Fpackage-summary.html%3Fresultof%3D%2522%2552%2575%256e%256e%2561%2562%256c%2565%2522%2520%2522%2572%2575%256e%256e%2561%2562%256c%2522%2520',
					         summary:'JavaScript+is+disabled+on+your+browser.+Skip+navigation+links+Overview+Package+Class+Use+Tree+Deprecated+Index+Help+Eclipse+Platform+Mars+%284.5%29+Prev+Package+Next+Package+Fr...',
					         label:'org.eclipse.osgi.service.runnable+%28Eclipse+Platform+API+Specification%29',
					         tagName:'hit',
					         category:'Java+development+user+guide',
					         categoryHref:'..%2Fnav%2F1',
					         score:'0.6234601',
					         id:'2'
					      }]);
					      
				return $http.get(url)
				.then(function(response) {
					return response.data.items;
				});
			},
			asDocumentUrl: function(searchResult) {
				return asDocumentURL(searchResult.href);
			},
			getLabelProvider: function() {
				return {
					getLabel: function getLabel(searchResult) {
						return decode(searchResult.label);
					},
					getSummary: function getSummary(searchResult) {
						return decode(searchResult.summary);
					},
					getCategory: function getCategory(searchResult) {
						return decode(searchResult.category);
					}
				}
			}
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