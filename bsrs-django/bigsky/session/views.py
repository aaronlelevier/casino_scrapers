"""
Created on Jan 10, 2014

@author: tkrier

Session Manager

used to login, logout and check current session

    Includes token authentication and a session manager
    
    Could use the auth from DRF for the browsable API, and if so, the session manager can be ditched

"""
from __future__ import unicode_literals

from django.contrib.auth import authenticate, login, logout

from rest_framework import status, parsers, renderers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer


@api_view(['GET', 'POST', 'DELETE'])
def session_manage(request):
    """
    check for existing session, create a new session or delete an existing session
    to login post {"username": "uname", "password": "pw"}
    
    TK - 2015-03-24 - this will probably not get used, but if it does it should
    be refactored to use class views if not view sets
    """
    session = {}
    respObj = {}

    if request.method == 'GET':
        if request.user.is_authenticated():
            session['id'] = request.user.id
            session['first_name'] = request.user.first_name
            session['last_name'] = request.user.last_name
            session['username'] = request.user.username
            session['status'] = 'valid'
        else:
            session['status'] = 'invalid'
        return Response(session)

    elif request.method == 'POST':

        username = request.DATA['username']
        password = request.DATA['password']
        
        if username == '' or password == '':
            respObj['code'] = 400
            respObj['message'] = 'Error: username or password is blank'
            return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                session['id'] = request.user.id
                session['first_name'] = request.user.first_name
                session['last_name'] = request.user.last_name
                session['username'] = request.user.username
#                 session['email'] = request.user.email
                session['status'] = 'valid'
                return Response(session, status=status.HTTP_201_CREATED)
            else:
                message = "Error: user not active"
        else:
            message = "Error: user not valid"

        respObj['code'] = 400
        respObj['message'] = message
        return Response(respObj, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        logout(request)
        respObj['code'] = 200
        respObj['message'] = "user logged out"
        return Response(respObj)

"""
Used to format the JWT auth login response
"""
def jwt_response_payload_handler(token, user=None, request=None):

    session = {}
    session['id'] = user.id
    session['first_name'] = user.first_name
    session['last_name'] = user.last_name
    session['username'] = user.username
    session['status'] = 'valid'
    
    return {
        'token': token,
        'session': session,
    }

"""
Older way to get a token. To be removed when we determine authentication options.
"""
class ObtainAuthToken(APIView):
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = AuthTokenSerializer
    model = Token

    def post(self, request):
        serializer = self.serializer_class(data=request.DATA)
        if serializer.is_valid():
            resp = {}
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            
            resp['id'] = user.id
            resp['first_name'] = user.first_name
            resp['last_name'] = user.last_name
            resp['username'] = user.username
            resp['email'] = user.email
            resp['status'] = 'valid'
            resp['token'] = token.key
            
            return Response(resp)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        
        resp = {}
        if request.user.is_authenticated():
            resp['id'] = request.user.id
            resp['first_name'] = request.user.first_name
            resp['last_name'] = request.user.last_name
            resp['username'] = request.user.username
            resp['email'] = request.user.email
            resp['token'] = request.user.auth_token.key
            resp['status'] = 'valid'
            stat = status.HTTP_200_OK
        else:
            resp['status'] = 'invalid'
            stat = status.HTTP_400_BAD_REQUEST

        return Response(resp, stat)
    
    def delete(self, request):

        resp = {}
        logout(request)
        resp['message'] = 'user logged out'
        return Response(resp)


obtain_auth_token = ObtainAuthToken.as_view()