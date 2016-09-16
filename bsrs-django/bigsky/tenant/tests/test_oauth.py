import json
from mock import patch

from django.test import TestCase

from oauthlib.oauth2 import LegacyApplicationClient, TokenExpiredError
from requests_oauthlib import OAuth2Session

from tenant import oauth
from tenant.tests.factory import SC_SUBSCRIBER_POST_DATA


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

    def test_post(self):
        ret = self.session.post(self.subscriber_post_url, data=SC_SUBSCRIBER_POST_DATA)
        self.assertEqual(ret.status_code, 201)


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
