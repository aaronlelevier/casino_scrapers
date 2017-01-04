from datetime import timedelta
import json
from mock import patch

from django.core.urlresolvers import reverse
from django.test import TestCase
from django.utils import timezone

from oauthlib.oauth2 import LegacyApplicationClient, TokenExpiredError
from oauth2_provider.models import Application, AccessToken
from requests_oauthlib import OAuth2Session

from contact.tests.factory import create_address
from location.models import Location
from location.tests.factory import create_locations, SAN_DIEGO
from person.tests.factory import create_single_person, PASSWORD
from sc import oauth
from sc.etl import LocationEtlAdapter, TenantEtlAdapter
from tenant.tests.factory import get_or_create_tenant
from utils.create import _generate_chars, _generate_int


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


class BsOAuthSessionSetupMixin(object):

    def setUp(self):
        self.session = oauth.BsOAuthSession()
        self.token = self.session.token
        self.subscriber_post_url = oauth.DEV_SC_SUBSCRIBERS_URL


class BsOAuthSessionDev1Tests(BsOAuthSessionSetupMixin,
                              TestCase):

    @patch("sc.oauth.BsOAuthSession.fetch_token")
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

    @patch("sc.oauth.BsOAuthSession.get")
    def test_get_with_retry(self, mock_func):
        mock_func.side_effect = TokenExpiredError()
        self.session.get_with_retry(self.subscriber_post_url)
        self.assertNotEqual(self.token['access_token'], self.session.token['access_token'])

    @patch("sc.oauth.BsOAuthSession.retry_get")
    @patch("sc.oauth.BsOAuthSession.get")
    def test_get_with_retry__assert_retry_get_is_called(self, mock_get, mock_retry_get):
        mock_get.side_effect = TokenExpiredError()
        self.session.get_with_retry(self.subscriber_post_url)
        self.assertTrue(mock_retry_get.called)

    @patch("sc.oauth.OAuth2Session.get")
    def test_oauth_get(self, mock_func):
        self.session.get(self.subscriber_post_url)
        self.assertTrue(mock_func.called)


class BsOAuthSessionSubscriberTests(BsOAuthSessionSetupMixin,
                                    TestCase):

    def setUp(self):
        super(BsOAuthSessionSubscriberTests, self).setUp()
        name = _generate_chars()
        self.tenant = get_or_create_tenant(company_name=name, with_scid=False)

    def test_sc_crud__subscriber(self):
        # POST
        adapter = TenantEtlAdapter(self.tenant)
        # store, so only invoked 1x, and can use w/ GET comparison below
        post_data = adapter.data
        self.assertIsNone(self.tenant.scid)

        response = adapter.post()

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201,
            "Error: {}; Random name: {}".format(data, post_data['Name']))
        self.assertTrue(data['id'])
        self.assertIsNotNone(self.tenant.scid)

        # GET
        response = adapter.get()

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            sorted(data.keys()), sorted(post_data.keys())
        )

        # PUT
        new_name = _generate_chars()
        self.tenant.company_name = new_name

        response = adapter.put()

        self.assertEqual(response.status_code, 200)

        # 2nd GET - confirms resource was updated
        response = adapter.get()

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['Name'], new_name)

    def test_sc_crud__subscriber__duplicate_request(self):
        # 1st POST\
        adapter = TenantEtlAdapter(self.tenant)
        # store, so only invoked 1x, and can use w/ GET comparison below
        self.assertIsNone(self.tenant.scid)

        response = adapter.post()

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)

        # 2nd POST - is a duplicate
        response = adapter.post()
        self.assertEqual(response.status_code, 406)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['Reason'], "Duplicate request/request already processed")

    def test_sc_crud__subscriber__name_already_exists(self):
        # 'name' field is the same, but update 'billing address',
        # so wont raise a duplicate request error
        # 1st POST
        adapter = TenantEtlAdapter(self.tenant)
        # store, so only invoked 1x, and can use w/ GET comparison below
        self.assertIsNone(self.tenant.scid)

        response = adapter.post()

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)

        # 2nd POST - violates unique name constraint
        self.tenant.billing_address = create_address()
        self.tenant.save()
        adapter = TenantEtlAdapter(self.tenant)

        response = adapter.post()

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['ErrorMessage'], "Subscriber with such name already exists")


class BsOAuthSessionLocationTests(BsOAuthSessionSetupMixin,
                                  TestCase):

    def setUp(self):
        super(BsOAuthSessionLocationTests, self).setUp()

        create_locations()
        # Subscriber POST
        name = _generate_chars()
        tenant = get_or_create_tenant(company_name=name, with_scid=False)
        adapter = TenantEtlAdapter(tenant)

        response = adapter.post()

        self.assertEqual(response.status_code, 201)

    def test_sc_crud__location(self):
        # Location POST
        store = Location.objects.get(name=SAN_DIEGO)
        number = _generate_int()
        store.number = number
        store.save()
        self.assertIsNone(store.scid)
        adapter = LocationEtlAdapter(store)

        response = adapter.post()

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(store.scid, data)

        # Location GET
        response = adapter.get()

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            data,
            "SC response returns PUT'ed data above, plus related data"
            "i.e. work orders, etc, for the time being, just confirm"
            "that we're getting a return payload on GET")

        # Location PUT
        new_name = _generate_chars()
        store.name = new_name

        response = adapter.put()

        self.assertEqual(response.status_code, 200)

        # 2nd Location GET - confirms resource was updated
        response = adapter.get()

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['Name'], new_name)

    def test_sc_crud__location__duplicate_request(self):
        # Location POST
        store = Location.objects.get(name=SAN_DIEGO)
        store.number = _generate_int()
        store.save()
        self.assertIsNone(store.scid)
        adapter = LocationEtlAdapter(store)

        response = adapter.post()

        self.assertEqual(response.status_code, 201)

        # Location POST
        response = adapter.post()

        self.assertEqual(response.status_code, 406)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['Reason'], "Duplicate request/request already processed")

    def test_sc_crud__location__store_id_exists(self):
        # Location POST
        store = Location.objects.get(name=SAN_DIEGO)
        store.number = _generate_int()
        store.save()
        self.assertIsNone(store.scid)
        adapter = LocationEtlAdapter(store)

        response = adapter.post()

        self.assertEqual(response.status_code, 201)

        # Location POST
        store.name = _generate_chars()
        adapter = LocationEtlAdapter(store)

        response = adapter.post()

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content.decode('utf8'))
        self.assertIn('already exists', data['ErrorMessage'])


class BsOauthApplicationTests(TestCase):

    def setUp(self):
        self.person = create_single_person()

    def _create_authorization_header(self, token):
        return "Bearer {0}".format(token)

    def test_create_application(self):
        app = oauth.BsOauthApplication(user=self.person)

        ret = app.application

        self.assertIsInstance(ret, Application)
        self.assertTrue(ret.client_id)
        self.assertEqual(ret.user, self.person)
        self.assertEqual(ret.redirect_uris, oauth.DEFAULT_PROVIDER_URIS)
        self.assertEqual(ret.client_type, oauth.DEFAULT_CLIENT_TYPE)
        self.assertEqual(ret.authorization_grant_type, oauth.DEFAULT_AUTHORIZATION_GRANT_TYPE)
        self.assertTrue(ret.client_secret)
        self.assertTrue(ret.name)
        self.assertFalse(ret.skip_authorization)

    def test_client_post_returns_token(self):
        app = oauth.BsOauthApplication(user=self.person)
        data = {
            'grant_type': 'password',
            'username': self.person.username,
            'password': PASSWORD,
            'client_id': app.application.client_id,
            'client_secret': app.application.client_secret,
            'redirect_uri': app.application.redirect_uris
        }

        response = self.client.post(reverse('oauth2_provider:token'), data=data)

        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['access_token'])
        self.assertTrue(data['refresh_token'])
        self.assertEqual(data['token_type'], 'Bearer')
        self.assertIn('read', data['scope'])
        self.assertIn('write', data['scope'])
        self.assertTrue(data['expires_in'])

    def test_token_authenticated_request(self):
        app = oauth.BsOauthApplication(user=self.person)
        access_token = AccessToken.objects.create(
            user=self.person,
            scope='read write',
            expires=timezone.now() + timedelta(seconds=300),
            token='secret-access-token-key',
            application=app.application
        )
        auth = self._create_authorization_header(access_token.token)

        response = self.client.get("/api/admin/currencies/", HTTP_AUTHORIZATION=auth)

        self.assertEqual(response.status_code, 200)
