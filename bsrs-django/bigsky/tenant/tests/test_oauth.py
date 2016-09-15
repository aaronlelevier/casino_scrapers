import json
from mock import patch

from django.test import TestCase

from oauthlib.oauth2 import LegacyApplicationClient, TokenExpiredError
from requests_oauthlib import OAuth2Session

from tenant import oauth


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


class BsOAuthSessionTests(TestCase):

    def setUp(self):
        self.session = oauth.BsOAuthSession()
        self.token = self.session.fetch_token()

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
        self.session.get_with_retry(oauth.DEV_SC_SUBSCRIBER_POST_URL)
        self.assertNotEqual(self.token['access_token'], self.session.token['access_token'])

    @patch("tenant.oauth.OAuth2Session.get")
    def test_oauth_get(self, mock_func):
        self.session.get(oauth.DEV_SC_SUBSCRIBER_POST_URL)
        self.assertTrue(mock_func.called)
