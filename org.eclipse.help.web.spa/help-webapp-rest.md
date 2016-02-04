# Webapp Protocol

The Eclipse Help server is rooted at some base URL.  We'll use the Eclipse Mars release train
help in these examples, whose base URL is `http://help.eclipse.org/mars`.

All services are available under _baseURL_`/vs/service/`_service_ with some set of parameters.

## `tocfragment`: Table of Contents Service

The ToC Service returns partial URLs relative to _baseURL_`/vs/service/tocfragment`.
For example, the Eclipse Mars Help's ToC service is at `http://help.eclipse.org/mars/vs/service/tocfragment`.

The Table of Contents fragment model is a forest of `node`s.  
The top-level nodes represent topics or guides, and
the children are points within that topic.  
Each topic and node has corresponding help content, which may be generated.

The ToC Service supports additional query parameters:

   * `returnType`: either `xml` (default) or `json`
   * `lang`: the locale

(There is some support in providing search scopes via a cookie.) 

The following shows the XML response.

### Top-Level Help Topics

Retrieve the help topics hosted by a Help server:

```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/tocfragment'
HTTP/1.1 200 OK
Date: Fri, 15 Jan 2016 17:33:42 GMT
Server: Jetty(9.2.13.v20150730)
Content-Type: application/xml; charset=UTF-8
Cache-Control: no-cache
Pragma: no-cache
Expires: Thu, 01 Jan 1970 00:00:00 GMT
Content-Length: 16361

<?xml version="1.0" encoding="UTF-8"?>
<tree_data>
<node
      title="Workbench User Guide"
      id="/org.eclipse.platform.doc.user/toc.xml"
      href="../topic/../nav/0"
      image="toc_closed">
</node>
<node
      title="Java development user guide"
      id="/org.eclipse.jdt.doc.user/toc.xml"
      href="../topic/../nav/1"
      image="toc_closed">
</node>
</tree_data>
```

Each `node` has a set of fields:

* `title` is the label to be shown
* `id` is the unique server-side identifier for that node
    * for root-level nodes, this is the Help _topic_
    * for child nodes, this is the content path _relative to the topic_, and not
      an absolute content path.  The full content path can usually be seen in the `href` field.     
* `href` is the URL to obtain the help content associated with that node (relative to the 
`advanced/tocfragment` URL). Examples include:
	* `../topic/../nav/0` 
 	* `../topic/../nav/0_1`
	* `../topic/org.eclipse.platform.doc.user/gettingStarted/intro/overview.htm?cp=0_0`
* `is_leaf` is `true` if it is a leaf-node
* `image` is the associated icon style to be shown. Known values are:
    * `toc_closed`: a top-level Help topic
    * `container_topic`: a folder node that has associated content
  	* `container_obj`: a folder node that has no associated content (will have generated content)
    * `topic`: a leaf node with content


Be sure to see *Retrieving Help Contents* below. 



### Expand a ToC Branch a particular node

Use `toc&path` to retrieve the child nodes of a particular node.
This call uses two arguments:

    * `toc` is the `id` of the Help topic (the root node)
    * `path` is a _relative_ content path within a topic;
      if unspecified, then returns the topic contents
   
The call returns the entire branch rooted at the topic.
 
```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/tocfragment?toc=/org.eclipse.platform.doc.user/toc.xml&path=1'
HTTP/1.1 200 OK
Date: Fri, 15 Jan 2016 17:51:22 GMT
Server: Jetty(9.2.13.v20150730)
Content-Type: application/xml; charset=UTF-8
Cache-Control: no-cache
Pragma: no-cache
Expires: Thu, 01 Jan 1970 00:00:00 GMT
Content-Length: 1953

<?xml version="1.0" encoding="UTF-8"?>
<tree_data>
<node
      title="Workbench User Guide"
      id="/org.eclipse.platform.doc.user/toc.xml"
      href="../topic/../nav/0"
      image="toc_closed">
<node
      title="Eclipse platform overview"
      id="0"
      href="../topic/org.eclipse.platform.doc.user/gettingStarted/intro/overview.htm?cp=0_0"
      is_leaf="true"
      image="topic">
</node>
<node
      title="Getting started"
      id="1"
      href="../topic/../nav/0_1"
      image="container_obj">
<node
      title="Basic tutorial"
      id="1_0"
      href="../topic/org.eclipse.platform.doc.user/gettingStarted/qs-01.htm?cp=0_1_0"
      image="container_topic">
</node>
<node
      title="Team CVS tutorial"
      id="1_1"
      href="../topic/org.eclipse.platform.doc.user/gettingStarted/qs-60_team.htm?cp=0_1_1"
      image="container_topic">
</node>
</node>
<node
      title="Concepts"
      id="2"
      href="../topic/../nav/0_2"
      image="container_obj">
</node>
<node
      title="Tasks"
      id="3"
      href="../topic/../nav/0_3"
      image="container_obj">
</node>
</node>
</tree_data>
```


### Retrieve ToC Path for a Document

The absolute content path for a URL to Help content can be retrieved too.
  
```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/tocfragment?topic=http://help.eclipse.org/mars/topic/org.eclipse.platform.doc.user/gettingStarted/intro/overview.htm'
HTTP/1.1 200 OK
Date: Fri, 15 Jan 2016 17:41:50 GMT
Server: Jetty(9.2.13.v20150730)
Content-Type: application/xml; charset=UTF-8
Cache-Control: no-cache
Pragma: no-cache
Expires: Thu, 01 Jan 1970 00:00:00 GMT
Content-Length: 91

<?xml version="1.0" encoding="UTF-8"?>
<tree_data>
<numeric_path path="0_0"/>
</tree_data>
```

```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/tocfragment?topic=http://help.eclipse.org/mars/topic/org.eclipse.platform.doc.isv/guide/ua_help_infocenter_preferences.htm'
HTTP/1.1 200 OK
Date: Fri, 15 Jan 2016 17:38:19 GMT
Server: Jetty(9.2.13.v20150730)
Content-Type: application/xml; charset=UTF-8
Cache-Control: no-cache
Pragma: no-cache
Expires: Thu, 01 Jan 1970 00:00:00 GMT
Content-Length: 102

<?xml version="1.0" encoding="UTF-8"?>
<tree_data>
<numeric_path path="2_0_19_1_0_3_3"/>
</tree_data>
```

### Retrieve the ToC Branch for a particular node

Use `expandPath` with an _absolute_ content path to retrieve the ToC branch to that node.

```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/tocfragment?expandPath=0_1&errorSuppress=true'
HTTP/1.1 200 OK
Date: Fri, 15 Jan 2016 18:45:43 GMT
Server: Jetty(9.2.13.v20150730)
Content-Type: application/xml; charset=UTF-8
Cache-Control: no-cache
Pragma: no-cache
Expires: Thu, 01 Jan 1970 00:00:00 GMT
Content-Length: 1450

<?xml version="1.0" encoding="UTF-8"?>
<tree_data>
<node
      title="Workbench User Guide"
      id="/org.eclipse.platform.doc.user/toc.xml"
      href="../topic/../nav/0"
      image="toc_closed">
<node
      title="Eclipse platform overview"
      id="0"
      href="../topic/org.eclipse.platform.doc.user/gettingStarted/intro/overview.htm?cp=0_0"
      is_leaf="true"
      image="topic">
</node>
<node
      title="Getting started"
      id="1"
      href="../topic/../nav/0_1"
      is_selected="true"
      is_highlighted="true"
      image="container_obj">
</node>
<node
      title="Concepts"
      id="2"
      href="../topic/../nav/0_2"
      image="container_obj">
</node>
<node
      title="Tasks"
      id="3"
      href="../topic/../nav/0_3"
      image="container_obj">
</node>
</node>
</tree_data>
```




## Basic Search Service 

The Search Service returns partial URLs relative to _baseURL_`/search`.
For example, the Eclipse Mars Help's Search service is at `http://help.eclipse.org/mars/vs/service/search`.

The Search model returns a list of nodes.  Each node has corresponding help content,
which have a stable URL (and may be generated).

The Basic Search Service supports additional query parameters:

   * `returnType`: either `xml` (default) or `json`
   * `lang`: the locale

(There is some support in providing search scopes via a cookie.) 

The following shows the XML response.

```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/search?returnType=xml&phrase=Runnable'
HTTP/1.1 200 OK
Date: Wed, 03 Feb 2016 17:45:07 GMT
Server: Jetty(9.2.13.v20150730)
Cache-Control: no-store, no-cache, must-revalidate
Content-Type: application/xml; charset=UTF-8
Transfer-Encoding: chunked

<?xml version="1.0" encoding="UTF-8"?>
<searchHits>
   <hit
         href="/org.eclipse.jdt.doc.user/reference/ref-export-runnable-jar.htm"
         label="Runnable JAR File Exporter"
         score="4.652252">
      <summary>The [Opens the Runnable JAR export wizard] Runnable Jar Export wizard allows you to create a runnable JAR file. Runnable JAR file specification Runnable JAR Specification O...</summary>
   </hit>
   <hit
         href="/org.eclipse.jdt.doc.user/tasks/tasks-37.htm"
         label="Creating a New Runnable JAR File"
         score="4.352068">
      <summary>To create a new runnable JAR file in the workbench: From the menu bar&apos;s File menu, select Export. Expand the Java node and select Runnable JAR file. Click Next. In the [Ope...</summary>
   </hit>
</searchHits>
```

JSON:
```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/search?returnType=json&phrase=Runnable'
HTTP/1.1 200 OK
Date: Wed, 03 Feb 2016 17:44:46 GMT
Server: Jetty(9.2.13.v20150730)
Cache-Control: no-store, no-cache, must-revalidate
Content-Type: text/plain; charset=UTF-8
Vary: Accept-Encoding
Transfer-Encoding: chunked

{
   identifier:'id',
   label:'label',
   items:[
      {
         href:'%2Forg.eclipse.jdt.doc.user%2Freference%2Fref-export-runnable-jar.htm',
         summary:'The+%5BOpens+the+Runnable+JAR+export+wizard%5D+Runnable+Jar+Export+wizard+allows+you+to+create+a+runnable+JAR+file.+Runnable+JAR+file+specification+Runnable+JAR+Specification+O...',
         label:'Runnable+JAR+File+Exporter',
         tagName:'hit',
         score:'4.652252',
         id:'0'
      },
      {
         href:'%2Forg.eclipse.jdt.doc.user%2Ftasks%2Ftasks-37.htm',
         summary:'To+create+a+new+runnable+JAR+file+in+the+workbench%3A+From+the+menu+bar%27s+File+menu%2C+select+Export.+Expand+the+Java+node+and+select+Runnable+JAR+file.+Click+Next.+In+the+%5BOpe...',
         label:'Creating+a+New+Runnable+JAR+File',
         tagName:'hit',
         score:'4.352068',
         id:'1'
      }]
}
```



## Advanced Search Service

There is an advanced search service available at _baseURL_`/advancedsearch`.

The Advanced Search Service supports additional query parameters:

   * `searchWord`:	- specifies the search keyword
   * `quickSearch` (_boolean; optional_): specifies if it is a quick search. Scopes
 	 just the selected toc or topic
   * `quickSearchType` (_optional_): specifies <code>QuickSearchTopic</code> for topic
		quick search
   * `scope` (_optional_; unclear): specifies search scope values
   * `workingSet` (_optional; unclear_): specifies the working set for scoped search
   * `maxHits` (_optional; int_): specifies the number of hits to return, default value is 500
   * `fieldSearch` (_optional; boolean_) specifies if field-only search should be performed;
  		if set to false, default field "contents" and all other fields will be searched
   * `lang` (_optional; locale_): specifies the locale
   * `returnType`(_optional; string_) specifies the return type of the servlet.
 		Accepts either <code>xml</code> (default) or <code>json</code>

JSON:
```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/advancedsearch?returnType=xml&searchWord=Runnable'HTTP/1.1 200 OK
HTTP/1.1 200 OK
Date: Wed, 03 Feb 2016 18:31:32 GMT
Server: Jetty(9.2.13.v20150730)
Cache-Control: no-store, no-cache, must-revalidate
Content-Type: text/plain; charset=UTF-8
Expires: Thu, 01 Jan 1970 00:00:00 GMT
Set-Cookie: JSESSIONID=g87vr82z35nf1euhngls62lux;Path=/help
Vary: Accept-Encoding
Transfer-Encoding: chunked

{
   identifier:'id',
   label:'label',
   items:[
      {
         href:'%2Forg.eclipse.jdt.doc.user%2Freference%2Fref-export-runnable-jar.htm%3Fresultof%3D%2522%2552%2575%256e%256e%2561%2562%256c%2565%2522%2520%2522%2572%2575%256e%256e%2561%2562%256c%2522%2520',
         summary:'The+%5BOpens+the+Runnable+JAR+export+wizard%5D+Runnable+Jar+Export+wizard+allows+you+to+create+a+runnable+JAR+file.+Runnable+JAR+file+specification+Runnable+JAR+Specification+O...',
         label:'Runnable+JAR+File+Exporter',
         tagName:'hit',
         category:'Java+development+user+guide',
         categoryHref:'..%2Fnav%2F1',
         score:'1.0',
         id:'0'
      }]
}
```

XML:
```
$ curl -isk 'http://help.eclipse.org/mars/vs/service/advancedsearch?returnType=xml&searchWord=Runnable'HTTP/1.1 200 OK
Date: Wed, 03 Feb 2016 18:30:08 GMT
Server: Jetty(9.2.13.v20150730)
Cache-Control: no-store, no-cache, must-revalidate
Content-Type: application/xml; charset=UTF-8
Expires: Thu, 01 Jan 1970 00:00:00 GMT
Set-Cookie: JSESSIONID=raw3g0e9467i1ukqy0zcjhczw;Path=/help
Transfer-Encoding: chunked

<?xml version="1.0" encoding="UTF-8"?>
<searchHits>
   <hit
         href="/org.eclipse.jdt.doc.user/reference/ref-export-runnable-jar.htm?resultof=%22%52%75%6e%6e%61%62%6c%65%22%20%22%72%75%6e%6e%61%62%6c%22%20"
         label="Runnable JAR File Exporter"
         score="1.0">
     <category
           href="../nav/1">
Java development user guide</category>
      <summary>The [Opens the Runnable JAR export wizard] Runnable Jar Export wizard allows you to create a runnable JAR file. Runnable JAR file specification Runnable JAR Specification O...</summary>
   </hit>
</searchHits>
```


## Index Fragment Service 

The Index Fragment Service returns partial URLs relative to _baseURL_`/indexfragment`.
For example, the Eclipse Mars Help's Index Fragment service is at `http://help.eclipse.org/mars/vs/service/indexfragment`.

```
$ curl -isk http://help.eclipse.org/mars/vs/service/indexfragment
HTTP/1.1 200 OK
Date: Fri, 15 Jan 2016 19:59:59 GMT
Server: Jetty(9.2.13.v20150730)
Content-Type: application/xml; charset=UTF-8
Cache-Control: no-cache
Pragma: no-cache
Expires: Thu, 01 Jan 1970 00:00:00 GMT
Content-Length: 3737

<?xml version="1.0" encoding="UTF-8"?>
<tree_data enableNext = "true" enablePrevious = "false">
<node
      title="@Basic"
      id="e0">
<node
      title="Basic mapping"
      id="s0"
      href="../topic/org.eclipse.jpt.doc.user/tasks011.htm#sthref203">
</node>
</node>
</tree_data>
```

## Nav Service

The Search Service returns partial URLs relative to _baseURL_`/nav`.
For example, the Eclipse Mars Help's Search service is at `http://help.eclipse.org/mars/vs/service/search`.

## Retrieving Help Content

When retrieving the help content, there are three services.  Should retrieve
these relative to _baseURL_ without the `/vs/service` as the content 
returns relative links and '/nav' returns HTML by default, but `/vs/service/nav`
returns XML.

  * `nftopic`: no frames (equivalent to `&noframes=1`)
  * `rtopic`: raw? maybe remote? (no breadcrumb)
  * `topic`: rewrite to embed content within the old-style server-side frames system
  * `ntopic`: suitable for narrow screen (breadcrumbs)

If using `topic`, it's important to rewrite the URL to
append a 'noframes=true' query parameter. The help webapp will otherwise rewrite content
to wrap into its now-deprecated server-side help viewer. 

To retrieve the "_Legal_" content (with
`href="../topic/org.eclipse.platform.doc.user/notices.html?cp=0_7"`), we'd
end up retrieving:

```
$ curl -isk 'http://help.eclipse.org/mars/topic/org.eclipse.platform.doc.user/notices.html?cp=0_7&noframes=1'
HTTP/1.1 200 OK
Date: Fri, 15 Jan 2016 18:08:16 GMT
Server: Jetty(9.2.13.v20150730)
Content-Type: text/html
Cache-Control: max-age=10
Content-Length: 1424
Vary: Accept-Encoding

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html lang="en">
<head>
...etc...
```

