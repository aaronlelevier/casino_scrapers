import os

from oauthlib.oauth2 import LegacyApplicationClient, TokenExpiredError
from requests_oauthlib import OAuth2Session


DEV_SC_USER_ID = os.environ['DEV_SC_USER_ID']
DEV_SC_USER_PASSWORD = os.environ['DEV_SC_USER_PASSWORD']
DEV_SC_CLIENT_ID = os.environ['DEV_SC_CLIENT_ID']
DEV_SC_CLIENT_SECRET = os.environ['DEV_SC_CLIENT_SECRET']

SC_GRANT_TYPE = 'password'

DEV_SC_BASE_URL = "https://dev1login.servicechannel.com"
DEV_SC_TOKEN_URL = DEV_SC_BASE_URL+"/oauth/token"

DEV_SC_API_URL = "https://dev1api.servicechannel.com:443"
DEV_SC_SUBSCRIBER_POST_URL = DEV_SC_API_URL+"/subscribers/v100/Subscriber"


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

    def __init__(self):
        self.client = LegacyApplicationClient(client_id=DEV_SC_CLIENT_ID)
        self.oauth = OAuth2Session(client=self.client)
        self._token = None

    @property
    def token(self):
        return self._token

    @token.setter
    def token(self, value):
        self._token = value

    def fetch_token(self):
        self.token = self.oauth.fetch_token(
            token_url=DEV_SC_TOKEN_URL,
            username=DEV_SC_USER_ID,
            password=DEV_SC_USER_PASSWORD,
            auth=(DEV_SC_CLIENT_ID, DEV_SC_CLIENT_SECRET)
        )
        return self.token

    def refresh_token(self):
        self.token = self.oauth.refresh_token(
            DEV_SC_TOKEN_URL,
            client_id=DEV_SC_CLIENT_ID,
            client_secret=DEV_SC_CLIENT_SECRET
        )
        return self.token

    def get_with_retry(self, url):
        try:
            return self.get(url)
        except TokenExpiredError:
            self.refresh_token()

    def get(self, url):
       return self.oauth.get(url)

    def post(self, url, data):
        return self.oauth.post(url, data=data)
