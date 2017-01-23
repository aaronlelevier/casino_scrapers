import os

from oauth2_provider.models import Application
from oauthlib.oauth2 import LegacyApplicationClient, TokenExpiredError
from requests_oauthlib import OAuth2Session

from utils.create import _generate_chars

SC_GRANT_TYPE = 'password'

# DEV1
DEV_SC_USER_ID = os.environ['DEV_SC_USER_ID']
DEV_SC_USER_PASSWORD = os.environ['DEV_SC_USER_PASSWORD']
DEV_SC_CLIENT_ID = os.environ['DEV_SC_CLIENT_ID']
DEV_SC_CLIENT_SECRET = os.environ['DEV_SC_CLIENT_SECRET']
# auth
DEV_SC_BASE_URL = "https://dev1login.servicechannel.com"
DEV_SC_TOKEN_URL = DEV_SC_BASE_URL+"/oauth/token"
# api
DEV_SC_API_URL = "https://dev1api.servicechannel.com:443"
DEV_SC_SUBSCRIBERS_URL = DEV_SC_API_URL+"/subscribers"
DEV_SC_LOCATIONS_URL = DEV_SC_API_URL+"/locations"
DEV_SC_WORKORDERS_URL = DEV_SC_API_URL+"/workorders"


def request_token():
    import requests
    params = {
        'grant_type': SC_GRANT_TYPE,
        'username': DEV_SC_USER_ID,
        'password': DEV_SC_USER_PASSWORD
    }
    return requests.post(DEV_SC_TOKEN_URL, data=params,
                         auth=(DEV_SC_CLIENT_ID, DEV_SC_CLIENT_SECRET))


class BsOAuthSession(object):

    def __init__(self, token_url=DEV_SC_TOKEN_URL, client_id=DEV_SC_CLIENT_ID,
                 client_secret=DEV_SC_CLIENT_SECRET, username=DEV_SC_USER_ID,
                 password=DEV_SC_USER_PASSWORD):

        self.token_url = token_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.username = username
        self.password = password

        self.client = LegacyApplicationClient(client_id=self.client_id)
        self.oauth = OAuth2Session(client=self.client)
        self._token = None

        self.fetch_token()

    @property
    def token(self):
        return self._token

    @token.setter
    def token(self, value):
        self._token = value

    def fetch_token(self):
        self.token = self.oauth.fetch_token(
            token_url=self.token_url,
            username=self.username,
            password=self.password,
            auth=(self.client_id, self.client_secret)
        )
        return self.token

    def refresh_token(self):
        self.token = self.oauth.refresh_token(
            self.token_url,
            client_id=self.client_id,
            client_secret=self.client_secret
        )
        return self.token

    def get_with_retry(self, url):
        try:
            return self.get(url)
        except TokenExpiredError:
            self.refresh_token()
            self.retry_get(url)

    def get(self, url):
       return self.oauth.get(url)

    def retry_get(self, url):
       return self.oauth.get(url)

    def post(self, url, data):
        return self.oauth.post(url, data=data)

    def put(self, url, data):
        return self.oauth.put(url, data=data)


DEFAULT_PROVIDER_URIS = "http://localhost:8000/"
DEFAULT_CLIENT_TYPE = "public"
DEFAULT_AUTHORIZATION_GRANT_TYPE = "password"

class BsOauthApplication(object):

    def __init__(self, user, redirect_uris=DEFAULT_PROVIDER_URIS, client_type=DEFAULT_CLIENT_TYPE,
        authorization_grant_type=DEFAULT_AUTHORIZATION_GRANT_TYPE, name=None,
        skip_authorization=False):

        name = name or _generate_chars()

        self._application = Application.objects.create(
            user=user, redirect_uris=redirect_uris, client_type=client_type,
            authorization_grant_type=authorization_grant_type, name=name,
            skip_authorization=skip_authorization
        )

    @property
    def application(self):
        return self._application
