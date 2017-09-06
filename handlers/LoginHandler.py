'''
Created on May 2015

@author: Arthur Glowacki, Argonne National Laboratory

Copyright (c) 2013, Stefan Vogt, Argonne National Laboratory
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
    Redistributions in binary form must reproduce the above copyright notice, this
        list of conditions and the following disclaimer in the documentation and/or
        other materials provided with the distribution.
    Neither the name of the Argonne National Laboratory nor the names of its
    contributors may be used to endorse or promote products derived from this
    software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.
'''
import json
import ldap

import cherrypy
from cherrypy import HTTPError

from handlers.HandlerBase import HandlerBase
from model.route import Route

SESSION_USER_NAME_KEY = "user"

class LoginHandler(HandlerBase):

	_cp_config = {
		'tools.sessions.on': True,
		'tools.auth.on': True
	}

	def __init__(self, devMode, ldapServerUrl, ldapDnString):
		HandlerBase.__init__(self, devMode)
		self.ldapServerUrl = ldapServerUrl
		self.ldapDnString = ldapDnString

	def get_routes(self):
		routes = [];
		routes.extend(Route.createRoutes("get_authenticated_username", 'GET', self, includeOptionsHTTPMethodForPath=self.devMode))
		routes.extend(Route.createRoutes("authenticate_user", "POST", self, includeOptionsHTTPMethodForPath=self.devMode))
		routes.extend(Route.createRoutes("logout", "POST", self, includeOptionsHTTPMethodForPath=self.devMode))
		return routes;

	@cherrypy.expose
	@HandlerBase.execute
	def get_authenticated_username(self):
		return cherrypy.session.get(SESSION_USER_NAME_KEY, None)

	@cherrypy.expose
	@HandlerBase.execute
	def authenticate_user(self):
		cl = cherrypy.request.headers['Content-Length']
		rawbody = cherrypy.request.body.read(int(cl))
		credentials = json.loads(rawbody)

		username = credentials['username']
		password = credentials['password']

		ldapUsername = self.ldapDnString % username
		try:
			# build client
			ldap.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_NEVER)
			ldapClient = ldap.initialize(self.ldapServerUrl)
			ldapClient.set_option(ldap.OPT_REFERRALS, 0)
			ldapClient.set_option(ldap.OPT_PROTOCOL_VERSION, ldap.VERSION3)

			# perform a synchronous bind
			ldapClient.simple_bind_s(ldapUsername, password)
			cherrypy.session[SESSION_USER_NAME_KEY] = username
		# ldapClient.whoami_s()
		except ldap.INVALID_CREDENTIALS, ex:
			ldapClient.unbind()
			raise Exception('Invalid LDAP credentials for user %s' % username)
		except ldap.SERVER_DOWN, ex:
			raise Exception('Cannot reach LDAP server %s' % self.ldapServerUrl)
		except Exception, ex:
			raise Exception("An exception occured: %s" % ex)

		return self.get_authenticated_username()

	@cherrypy.expose
	@HandlerBase.execute
	def logout(self):
		cherrypy.session.clear()

	@staticmethod
	def checkAuthorization(*args, **kwargs):
		conditions = cherrypy.request.config.get('auth.require', None)
		if conditions is None:
			return

		if cherrypy.session.get(SESSION_USER_NAME_KEY, None) is None:
			# TODO figure out a way to check devmode
			cherrypy.response.headers['Access-Control-Allow-Credentials'] = 'true'
			raise HTTPError(401, 'User Not Authorized')

	@staticmethod
	def auth_required_logged_in(*args):
		def decorate(f):
			if not hasattr(f, '_cp_config'):
				f._cp_config = dict()
			if 'auth.require' not in f._cp_config:
				f._cp_config['auth.require'] = True
			return f
		return decorate