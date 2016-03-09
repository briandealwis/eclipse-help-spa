package org.eclipse.help.web.spa;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

public class EmbeddingServlet extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String servletPath = req.getServletPath();
		String pathInfo = req.getPathInfo();
		// /vs services are doubly-indirected under /vs/service/XXX
		if ("/vs".equals(servletPath)) {
			if (pathInfo.startsWith("/embed/topic/")) {
				pathInfo = "/service/nftopic" + pathInfo.substring("/embed/topic".length());
			} else if (pathInfo.startsWith("/embed/content/")) {
				pathInfo = "/service/nftopic" + pathInfo.substring("/embed/content".length());
			} else if (pathInfo.startsWith("/embed/nav/")) {
				pathInfo = "/service/nav" + pathInfo.substring("/embed/nav".length());
			} else {
				resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
		} else {
			if (pathInfo.startsWith("/topic/")) {
				servletPath = "/nftopic";
				pathInfo = pathInfo.substring("/topic".length());
			} else if (pathInfo.startsWith("/content/")) {
				servletPath = "/nftopic";
				pathInfo = pathInfo.substring("/content".length());
			} else if (pathInfo.startsWith("/nav/")) {
				servletPath = "/nav";
				pathInfo = pathInfo.substring("/nav".length());
			} else {
				resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}

		}
		String query = req.getQueryString();
		// returnType is necessary for the /vs/services
		query = (query == null ? "" : query + "&") + "returnType=html&noframes=true";
		RequestDispatcher dispatcher = req.getRequestDispatcher(servletPath);
		if (dispatcher == null) {
			resp.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Cannot find redirector");
			return;
		}
		dispatcher.forward(
				new ForwardedHttpServletRequest(req, servletPath, pathInfo, query),
				new HttpServletResponseWrapper(resp));
	}

}
