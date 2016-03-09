package org.eclipse.help.web.spa;

import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

public class ForwardedHttpServletRequest extends HttpServletRequestWrapper {

	private HttpServletRequest wrapped;
	private String servletPath;
	private String pathInfo;
	private String query;
	private Map<String, String[]> parameters;

	public ForwardedHttpServletRequest(HttpServletRequest req, String servletPath, String pathInfo, String query) {
		super(req);
		this.wrapped = req;
		this.servletPath = servletPath;
		this.pathInfo = pathInfo;
		this.query = query;
		parameters = new HashMap<>();
		if (this.query != null) {
			String[] emptyArray = new String[0];
			for (String pair : this.query.split("&")) {
				String[] kv = pair.split("=");
				String[] oldList = parameters.get(kv[0]);
				if (oldList == null) {
					oldList = emptyArray;
				}
				String[] newList = Arrays.copyOf(oldList, oldList.length + 1);
				newList[oldList.length] = kv[1];
				parameters.put(kv[0], newList);
			}
		}
	}

	@Override
	public String getServletPath() {
		return servletPath;
	}

	@Override
	public String getPathInfo() {
		return pathInfo;
	}

	@Override
	public String getQueryString() {
		return query;
	}

	@Override
	public Map<String, String[]> getParameterMap() {
		return parameters;
	}

	@Override
	public String getParameter(String name) {
		String[] values = parameters.get(name);
		return values == null || values.length == 0 ? null : values[0];
	}

	@Override
	public Enumeration<String> getParameterNames() {
		return new Vector<>(parameters.keySet()).elements();
	}

	@Override
	public String[] getParameterValues(String name) {
		return parameters.get(name);
	}

	@Override
	public String getRequestURI() {
		StringBuilder sb = new StringBuilder(wrapped.getContextPath());
		sb.append(getServletPath());
		if (getPathInfo() != null) {
			sb.append(getPathInfo());
		}
		return sb.toString();
	}

	@Override
	public StringBuffer getRequestURL() {
		StringBuilder sb = new StringBuilder(getScheme());
		sb.append("://").append(getServerName());
		sb.append(':').append(getServerPort());
		sb.append(getRequestURI());
		return new StringBuffer(sb);
	}
}
