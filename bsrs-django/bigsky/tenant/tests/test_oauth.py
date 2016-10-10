import copy
import json
from mock import patch

from django.test import TestCase

from oauthlib.oauth2 import LegacyApplicationClient, TokenExpiredError
from requests_oauthlib import OAuth2Session

from tenant import oauth
from tenant.tests.factory import SC_SUBSCRIBER_POST_DATA
from utils.create import _generate_chars
from utils.tests.helpers import empty_str_if_none


class RequestsOAuthTests(TestCase):

    def test_request_token(self):
        ret = oauth.request_token()

        self.assertEqual(ret.status_code, 200)
        data = json.loads(ret.content.decode('utf8'))
        self.assertEqual(data['token_type'], 'bearer')
        self.assertEqual(data['expires_in'], 600)
        self.assertIn('access_token', data)
        self.assertIn('refresh_token', data)
        self.assertIn('scope', data)


class BsOAuthSessionDev1Tests(TestCase):

    def setUp(self):
        self.session = oauth.BsOAuthSession()
        self.token = self.session.token
        self.subscriber_post_url = oauth.DEV_SC_SUBSCRIBER_POST_URL

    @patch("tenant.oauth.BsOAuthSession.fetch_token")
    def test_session_init__fetch_token(self, mock_func):
        oauth.BsOAuthSession()
        self.assertTrue(mock_func.called)

    def test_session_init__token_stored(self):
        session = oauth.BsOAuthSession()
        self.assertTrue(session.token)

    def test_client(self):
        self.assertIsInstance(self.session.client, LegacyApplicationClient)

    def test_oauth(self):
        self.assertIsInstance(self.session.oauth, OAuth2Session)

    def test_fetch_token(self):
        self.assertEqual(self.token['token_type'], 'bearer')
        self.assertEqual(self.token['expires_in'], 600)
        self.assertIn('access_token', self.token)
        self.assertIn('refresh_token', self.token)
        self.assertIn('scope', self.token)
        self.assertEqual(self.token, self.session.token)

    def test_refresh_token(self):
        token = self.session.refresh_token()

        self.assertEqual(token['token_type'], 'bearer')
        self.assertEqual(token['expires_in'], 600)
        self.assertIn('access_token', token)
        self.assertIn('refresh_token', token)
        self.assertIn('scope', token)
        # new token stored replaces previous token
        self.assertEqual(token, self.session.token)

    @patch("tenant.oauth.BsOAuthSession.get")
    def test_get_with_retry(self, mock_func):
        mock_func.side_effect = TokenExpiredError()
        self.session.get_with_retry(self.subscriber_post_url)
        self.assertNotEqual(self.token['access_token'], self.session.token['access_token'])

    @patch("tenant.oauth.BsOAuthSession.retry_get")
    @patch("tenant.oauth.BsOAuthSession.get")
    def test_get_with_retry__assert_retry_get_is_called(self, mock_get, mock_retry_get):
        mock_get.side_effect = TokenExpiredError()
        self.session.get_with_retry(self.subscriber_post_url)
        self.assertTrue(mock_retry_get.called)

    @patch("tenant.oauth.OAuth2Session.get")
    def test_oauth_get(self, mock_func):
        self.session.get(self.subscriber_post_url)
        self.assertTrue(mock_func.called)

    def test_sc_crud(self):
        """All live CRUD to SC is currently in this test. Maybe it makes
        sense to break it out into separate tests, but need to do the initial
        POST before can check GET/PUT"""

        # POST
        SC_SUBSCRIBER_POST_DATA['Name'] = _generate_chars()

        response = self.session.post(self.subscriber_post_url, data=SC_SUBSCRIBER_POST_DATA)

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201,
            "Error: {}; Random name: {}".format(data, SC_SUBSCRIBER_POST_DATA['Name']))
        self.assertTrue(data['id'])

        # store 'scid' for later use with PUT
        scid = data['id']

        # GET
        response = self.session.get("{}/{}/".format(self.subscriber_post_url, scid))

        data = json.loads(response.content.decode('utf8'))
        for k,v in SC_SUBSCRIBER_POST_DATA.items():
            self.assertEqual(empty_str_if_none(data[k]), SC_SUBSCRIBER_POST_DATA[k])

        # PUT
        PUT_DATA = copy.copy(SC_SUBSCRIBER_POST_DATA)
        for k,v in PUT_DATA.items():
            if k != 'Name':
                PUT_DATA[k] = v+'123'
        # state - thinking that there's somve validation on 'State', or just
        # can't append '123' to it, b/c explicitly need to set it here for PUT
        new_state = 'Nevada'
        PUT_DATA['State'] = new_state

        response = self.session.put("{}/{}/".format(self.subscriber_post_url, scid),
                                    data=PUT_DATA)

        self.assertEqual(response.status_code, 200)

        # 2nd GET - confirms resource was updated
        response = self.session.get("{}/{}/".format(self.subscriber_post_url, scid))

        data = json.loads(response.content.decode('utf8'))
        for k,v in PUT_DATA.items():
            if k != 'State':
                self.assertEqual(empty_str_if_none(data[k]), PUT_DATA[k])
        # state
        self.assertEqual(data['State'], new_state)


class BsOAuthSessionSandbox2Tests(TestCase):
    # Only testing fetching of a token from Sandbox2. The endpoint methods
    # for Subscriber are different. No POST method.

    def setUp(self):
        self.session = oauth.BsOAuthSession(
            token_url=oauth.SANDBOX_SC_TOKEN_URL, client_id=oauth.SANDBOX_SC_CLIENT_ID,
            client_secret=oauth.SANDBOX_SC_CLIENT_SECRET, username=oauth.SANDBOX_SC_USER_ID,
            password=oauth.SANDBOX_SC_USER_PASSWORD)
        self.token = self.session.fetch_token()
        self.subscriber_post_url = oauth.SANDBOX_SC_SUBSCRIBER_POST_URL

    def test_client(self):
        self.assertIsInstance(self.session.client, LegacyApplicationClient)

    def test_oauth(self):
        self.assertIsInstance(self.session.oauth, OAuth2Session)

    def test_fetch_token(self):
        self.assertEqual(self.token['token_type'], 'bearer')
        self.assertEqual(self.token['expires_in'], 600)
        self.assertIn('access_token', self.token)
        self.assertIn('refresh_token', self.token)
        self.assertIn('scope', self.token)
        self.assertEqual(self.token, self.session.token)
