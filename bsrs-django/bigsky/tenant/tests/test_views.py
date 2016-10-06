import json
from mock import patch
import uuid

from django.conf import settings

from model_mommy import mommy
from rest_framework.test import APITestCase

from accounting.models import Currency
from contact.models import Email, Address, PhoneNumber, Country
from contact.serializers import EmailSerializer, AddressSerializer, PhoneNumberSerializer
from contact.tests.factory import create_address
from dtd.models import TreeData, DTD_START_KEY
from person.tests.factory import PASSWORD, create_single_person
from tenant.oauth import BsOAuthSession, SANDBOX_SC_SUBSCRIBER_POST_URL
from tenant.models import Tenant
from tenant.serializers import TenantCreateSerializer


class TenantSetUpMixin(object):

    def setUp(self):
        mommy.make(TreeData, key=DTD_START_KEY)
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.tenant.implementation_contact = self.person
        self.tenant.save()

        self.person_two = create_single_person()
        self.tenant_two = mommy.make(Tenant)
        self.person_two.role.tenant = self.tenant_two
        self.person_two.role.save()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()


class TenantListTests(TenantSetUpMixin, APITestCase):

    def test_data(self):
        response = self.client.get('/api/admin/tenants/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        self.assertEqual(len(data['results'][0]), 4)
        tenant = Tenant.objects.get(id=data['results'][0]['id'])
        self.assertEqual(data['results'][0]['company_code'], tenant.company_code)
        self.assertEqual(data['results'][0]['company_name'], tenant.company_name)
        self.assertEqual(data['results'][0]['test_mode'], tenant.test_mode)


class TenantDetailTests(TenantSetUpMixin, APITestCase):

    def test_data(self):
        self.assertEqual(self.tenant.company_name, settings.DEFAULT_TENANT_COMPANY_NAME)

        response = self.client.get('/api/admin/tenants/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], self.tenant.company_code)
        self.assertEqual(data['company_name'], self.tenant.company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['default_currency']['id'], str(self.tenant.default_currency.id))
        self.assertEqual(data['default_currency']['name'], self.tenant.default_currency.name)
        # implementation
        self.assertEqual(data['implementation_contact_initial'], self.tenant.implementation_contact_initial)
        self.assertEqual(data['implementation_email']['id'], str(self.tenant.implementation_email.id))
        self.assertEqual(data['implementation_email']['type'], str(self.tenant.implementation_email.type.id))
        self.assertEqual(data['implementation_email']['email'], self.tenant.implementation_email.email)
        # billing
        self.assertEqual(data['billing_contact'], self.tenant.billing_contact)
        self.assertEqual(data['billing_email']['id'], str(self.tenant.billing_email.id))
        self.assertEqual(data['billing_email']['type'], str(self.tenant.billing_email.type.id))
        self.assertEqual(data['billing_email']['email'], self.tenant.billing_email.email)

        self.assertEqual(data['billing_phone_number']['id'], str(self.tenant.billing_phone_number.id))
        self.assertEqual(data['billing_phone_number']['type'], str(self.tenant.billing_phone_number.type.id))
        self.assertEqual(data['billing_phone_number']['number'], self.tenant.billing_phone_number.number)

        self.assertEqual(data['billing_address']['id'], str(self.tenant.billing_address.id))
        self.assertEqual(data['billing_address']['type'], str(self.tenant.billing_address.type.id))
        self.assertEqual(data['billing_address']['address'], self.tenant.billing_address.address)
        self.assertEqual(data['billing_address']['city'], self.tenant.billing_address.city)
        self.assertEqual(data['billing_address']['state']['id'], str(self.tenant.billing_address.state.id))
        self.assertEqual(data['billing_address']['state']['name'], self.tenant.billing_address.state.name)
        self.assertEqual(data['billing_address']['country']['id'], str(self.tenant.billing_address.country.id))
        self.assertEqual(data['billing_address']['country']['name'], self.tenant.billing_address.country.common_name)
        self.assertEqual(data['billing_address']['postal_code'], self.tenant.billing_address.postal_code)
        self.assertEqual(len(data['countries']), 1)
        self.assertEqual(data['countries'][0]['id'], str(self.tenant.countries.first().id))
        self.assertEqual(data['countries'][0]['name'], self.tenant.countries.first().common_name)


class TenantCreateTests(TenantSetUpMixin, APITestCase):

    def setUp(self):
        super(TenantCreateTests, self).setUp()
        # mockey patch, so SC POST isn't called
        def _sc_create(self, *args, **kwargs):
            pass
        TenantCreateSerializer._sc_create = _sc_create

    def test_data(self):
        new_id = str(uuid.uuid4())
        new_company_code = 'foo'
        serializer = TenantCreateSerializer(self.tenant)
        init_data = serializer.data
        init_data.update({
            'id': new_id,
            'company_code': new_company_code
        })
        self.assertTrue(init_data['implementation_email'])
        self.assertTrue(init_data['billing_email'])
        self.assertTrue(init_data['billing_address'])
        self.assertTrue(init_data['billing_phone_number'])

        response = self.client.post('/api/admin/tenants/', init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['id'], new_id)
        self.assertEqual(data['company_code'], new_company_code)
        self.assertEqual(data['company_name'], self.tenant.company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['default_currency'], str(self.tenant.default_currency.id))
        # countries
        self.assertEqual(len(data['countries']), 1)
        self.assertEqual(data['countries'][0], str(self.tenant.countries.first().id))
        # implementation
        self.assertEqual(data['implementation_contact_initial'], self.tenant.implementation_contact_initial)
        self.assertEqual(data['implementation_email']['id'], str(self.tenant.implementation_email.id))
        self.assertEqual(data['implementation_email']['type'], str(self.tenant.implementation_email.type.id))
        self.assertEqual(data['implementation_email']['email'], self.tenant.implementation_email.email)
        # billing
        self.assertEqual(data['billing_email']['id'], str(self.tenant.billing_email.id))
        self.assertEqual(data['billing_email']['type'], str(self.tenant.billing_email.type.id))
        self.assertEqual(data['billing_email']['email'], self.tenant.billing_email.email)

        self.assertEqual(data['billing_phone_number']['id'], str(self.tenant.billing_phone_number.id))
        self.assertEqual(data['billing_phone_number']['type'], str(self.tenant.billing_phone_number.type.id))
        self.assertEqual(data['billing_phone_number']['number'], self.tenant.billing_phone_number.number)

        self.assertEqual(data['billing_address']['id'], str(self.tenant.billing_address.id))
        self.assertEqual(data['billing_address']['type'], str(self.tenant.billing_address.type.id))
        self.assertEqual(data['billing_address']['address'], self.tenant.billing_address.address)
        self.assertEqual(data['billing_address']['city'], self.tenant.billing_address.city)
        self.assertEqual(data['billing_address']['state'], str(self.tenant.billing_address.state.id))
        self.assertEqual(data['billing_address']['country'], str(self.tenant.billing_address.country.id))
        self.assertEqual(data['billing_address']['postal_code'], self.tenant.billing_address.postal_code)

    def test_create_nested_contacts(self):
        new_id = str(uuid.uuid4())
        new_company_code = 'foo'
        serializer = TenantCreateSerializer(self.tenant)
        # contacts
        implementation_email = EmailSerializer(mommy.make(Email)).data
        billing_email = EmailSerializer(mommy.make(Email)).data
        billing_phone_number = PhoneNumberSerializer(mommy.make(PhoneNumber)).data
        billing_address = AddressSerializer(mommy.make(Address)).data
        # contacts - give new id
        implementation_email['id'] = str(uuid.uuid4())
        billing_email['id'] = str(uuid.uuid4())
        billing_address['id'] = str(uuid.uuid4())
        billing_phone_number['id'] = str(uuid.uuid4())
        # data
        init_data = serializer.data
        init_data.update({
            'id': new_id,
            'company_code': new_company_code,
            'implementation_email': implementation_email,
            'billing_email': billing_email,
            'billing_address': billing_address,
            'billing_phone_number': billing_phone_number
        })

        response = self.client.post('/api/admin/tenants/', init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['implementation_email']['id'], init_data['implementation_email']['id'])
        self.assertEqual(data['billing_email']['id'], init_data['billing_email']['id'])
        self.assertEqual(data['billing_address']['id'], init_data['billing_address']['id'])
        self.assertEqual(data['billing_phone_number']['id'], init_data['billing_phone_number']['id'])


class TenantCreateEmailAndRemoteCallsTests(TenantSetUpMixin, APITestCase):

    def setUp(self):
        super(TenantCreateEmailAndRemoteCallsTests, self).setUp()
        new_id = str(uuid.uuid4())
        new_company_code = 'foo'
        serializer = TenantCreateSerializer(self.tenant)
        self.init_data = serializer.data
        self.init_data.update({
            'id': new_id,
            'company_code': new_company_code,
        })

    @patch("tenant.serializers.BsOAuthSession.post")
    @patch("tenant.serializers.TenantCreateSerializer._send_mail")
    @patch("tenant.serializers.TenantCreateSerializer._sc_create")
    def test_send_email_and_sc_create(self, mock_sc_create, mock_send_mail, mock_post):
        sc_response = {
            'status_code': 201,
            'content': {'id': str(uuid.uuid4())}
        }
        mock_post.return_value = sc_response

        response = self.client.post('/api/admin/tenants/', self.init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        tenant = Tenant.objects.get(id=data['id'])
        # mocks
        self.assertEqual(mock_send_mail.call_args[0][0], tenant.implementation_email.email)
        self.assertIsInstance(mock_sc_create.call_args[0][0], Tenant)

    @patch("tenant.serializers.BsOAuthSession.post")
    def test_sc_to_post_api(self, mock_post):
        sc_response = {
            'status_code': 201,
            'content': {'id': str(uuid.uuid4())}
        }
        mock_post.return_value = sc_response

        response = self.client.post('/api/admin/tenants/', self.init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201, data)
        tenant = Tenant.objects.get(id=data['id'])
        # mocks
        self.assertEqual(mock_post.call_args[0][0], SANDBOX_SC_SUBSCRIBER_POST_URL)
        session = BsOAuthSession()
        post_data = tenant.sc_post_data
        post_data.update({
            "PrimaryUser": session.username,
            "Password": session.password,
            "ClientName": session.client_id,
            "IsActive": True
        })
        self.assertEqual(mock_post.call_args_list[0][1]['data'], post_data)

    @patch("tenant.serializers.BsOAuthSession.post")
    def test_sc_to_post_api__use_response_to_set_scid(self, mock_post):
        sc_response = {
            'status_code': 201,
            'content': {'id': str(uuid.uuid4())}
        }
        mock_post.return_value = sc_response

        response = self.client.post('/api/admin/tenants/', self.init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        tenant = Tenant.objects.get(id=data['id'])
        # mocks
        self.assertTrue(mock_post.called)
        self.assertEqual(str(tenant.scid), sc_response['content']['id'])

    @patch("tenant.serializers.BsOAuthSession.post")
    def test_sc_to_post_api__error_occurred(self, mock_post):
        mock_post.return_value = {'status_code': 400}

        response = self.client.post('/api/admin/tenants/', self.init_data, format='json')

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data, ["Error creating subscriber"])


class TenantUpdateTests(TenantSetUpMixin, APITestCase):

    def test_data(self):
        dtd = mommy.make(TreeData)
        currency = mommy.make(Currency, code='FOO')
        serializer = TenantCreateSerializer(self.tenant)
        country = mommy.make(Country, common_name='foo')
        updated_data = serializer.data
        updated_data.update({
            'company_code': 'foo',
            'company_name': 'bar',
            'dashboard_text': 'biz',
            'default_currency': str(currency.id),
            'countries': [str(country.id)]
        })

        response = self.client.put('/api/admin/tenants/{}/'.format(self.tenant.id), updated_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], updated_data['company_code'])
        self.assertEqual(data['company_name'], updated_data['company_name'])
        self.assertEqual(data['dashboard_text'], updated_data['dashboard_text'])
        self.assertEqual(data['default_currency'], updated_data['default_currency'])
        self.assertEqual(data['implementation_contact_initial'], self.tenant.implementation_contact_initial)
        self.assertEqual(len(data['countries']), 1)
        self.assertEqual(data['countries'][0]['id'], str(country.id))
        self.assertEqual(data['countries'][0]['name'], country.common_name)
        # implementation
        self.assertEqual(data['implementation_contact_initial'], self.tenant.implementation_contact_initial)
        self.assertEqual(data['implementation_email']['id'], str(self.tenant.implementation_email.id))
        self.assertEqual(data['implementation_email']['type'], str(self.tenant.implementation_email.type.id))
        self.assertEqual(data['implementation_email']['email'], self.tenant.implementation_email.email)
        # billing
        self.assertEqual(data['billing_email']['id'], str(self.tenant.billing_email.id))
        self.assertEqual(data['billing_email']['type'], str(self.tenant.billing_email.type.id))
        self.assertEqual(data['billing_email']['email'], self.tenant.billing_email.email)

        self.assertEqual(data['billing_phone_number']['id'], str(self.tenant.billing_phone_number.id))
        self.assertEqual(data['billing_phone_number']['type'], str(self.tenant.billing_phone_number.type.id))
        self.assertEqual(data['billing_phone_number']['number'], self.tenant.billing_phone_number.number)

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        # check on which response data is 'self.tenant' b/c 2 tenants required
        # for the test suite, but order isn't guaranteed
        if data['results'][0]['id'] == str(self.tenant.id):
            data = data['results'][0]
        else:
            data = data['results'][1]

        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], self.tenant.company_code)
        self.assertEqual(data['company_name'], self.tenant.company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['dt_start'], str(self.tenant.dt_start.id))
        self.assertEqual(data['default_currency'], str(self.tenant.default_currency.id))
        self.assertEqual(data['test_mode'], self.tenant.test_mode)
        self.assertEqual(data['billing_address']['id'], str(self.tenant.billing_address.id))
        self.assertEqual(data['billing_address']['type'], str(self.tenant.billing_address.type.id))
        self.assertEqual(data['billing_address']['address'], self.tenant.billing_address.address)
        self.assertEqual(data['billing_address']['city'], self.tenant.billing_address.city)
        self.assertEqual(data['billing_address']['state'], str(self.tenant.billing_address.state.id))
        self.assertEqual(data['billing_address']['country'], str(self.tenant.billing_address.country.id))
        self.assertEqual(data['billing_address']['postal_code'], self.tenant.billing_address.postal_code)

    def test_update_related_models(self):
        dtd = mommy.make(TreeData)
        serializer = TenantCreateSerializer(self.tenant)
        country = mommy.make(Country, common_name='foo')
        # contacts
        implementation_email = mommy.make(Email, _fill_optional=['type'])
        billing_email = mommy.make(Email, _fill_optional='type')
        billing_phone_number = mommy.make(PhoneNumber, _fill_optional=['type'])
        billing_address = mommy.make(Address, _fill_optional=['type', 'state', 'country'])
        # data
        updated_data = serializer.data
        updated_data.update({
            'countries': [str(country.id)],
            'implementation_email': {
                'id': str(implementation_email.id),
                'type': str(implementation_email.type.id),
                'email': implementation_email.email
            },
            'billing_email': {
                'id': str(billing_email.id),
                'type': str(billing_email.type.id),
                'email': billing_email.email
            },
            'billing_phone_number': {
                'id': str(billing_phone_number.id),
                'type': str(billing_phone_number.type.id),
                'number': billing_phone_number.number
            },
            'billing_address': {
                'id': str(billing_address.id),
                'type': str(billing_address.type.id),
                'address': billing_address.address,
                'city': billing_address.city,
                'state': str(billing_address.state.id),
                'country': str(billing_address.country.id),
                'postal_code': billing_address.postal_code
            }
        })

        response = self.client.put('/api/admin/tenants/{}/'.format(self.tenant.id), updated_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(self.tenant.id))
        # related models updated by id only
        self.assertEqual(len(data['countries']), 1)
        self.assertEqual(data['countries'][0], str(country.id))
        # contacts
        self.assertEqual(data['implementation_email'], updated_data['implementation_email'])
        self.assertEqual(data['billing_email'], updated_data['billing_email'])
        self.assertEqual(data['billing_phone_number'], updated_data['billing_phone_number'])
        self.assertEqual(data['billing_address'], updated_data['billing_address'])

    def test_update_existing_related_models_field(self):
        # contacts
        implementation_email = mommy.make(Email, _fill_optional=['type'])
        billing_email = mommy.make(Email, _fill_optional='type')
        billing_phone_number = mommy.make(PhoneNumber, _fill_optional=['type'])
        billing_address = create_address()
        # data
        serializer = TenantCreateSerializer(self.tenant)
        updated_data = serializer.data
        updated_data.update({
            'implementation_email': {
                'id': str(self.tenant.implementation_email.id),
                'type': str(implementation_email.type.id),
                'email': implementation_email.email
            },
            'billing_email': {
                'id': str(self.tenant.billing_email.id),
                'type': str(billing_email.type.id),
                'email': billing_email.email
            },
            'billing_phone_number': {
                'id': str(self.tenant.billing_phone_number.id),
                'type': str(billing_phone_number.type.id),
                'number': billing_phone_number.number
            },
            'billing_address': {
                'id': str(self.tenant.billing_address.id),
                'type': str(billing_address.type.id),
                'address': billing_address.address,
                'city': billing_address.city,
                'state': str(billing_address.state.id),
                'country': str(billing_address.country.id),
                'postal_code': billing_address.postal_code
            }
        })
        # pre-test
        self.assertNotEqual(updated_data['implementation_email']['email'], self.tenant.implementation_email.email)
        self.assertNotEqual(updated_data['billing_email']['email'], self.tenant.billing_email.email)
        self.assertNotEqual(updated_data['billing_phone_number']['number'], self.tenant.billing_phone_number.number)
        self.assertNotEqual(updated_data['billing_address']['address'], self.tenant.billing_address.address)

        response = self.client.put('/api/admin/tenants/{}/'.format(self.tenant.id), updated_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['implementation_email'], updated_data['implementation_email'])
        self.assertEqual(data['billing_email'], updated_data['billing_email'])
        self.assertEqual(data['billing_phone_number'], updated_data['billing_phone_number'])
        self.assertEqual(data['billing_address'], updated_data['billing_address'])

    def test_remove_related_models(self):
        serializer = TenantCreateSerializer(self.tenant)
        updated_data = serializer.data
        updated_data.update({
            'countries': []
        })
        self.assertTrue(self.tenant.countries.exists())

        response = self.client.put('/api/admin/tenants/{}/'.format(self.tenant.id), updated_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['countries'], [])


class TenantDeleteTests(TenantSetUpMixin, APITestCase):

    def test_delete(self):
        response = self.client.delete('/api/admin/tenants/{}/'.format(self.tenant.id))
        self.assertEqual(response.status_code, 204)


class TenantPermissionTests(TenantSetUpMixin, APITestCase):

    def test_permissions__if_diff_tenant(self):
        self.client.logout()
        self.client.login(username=self.person_two.username, password=PASSWORD)
        self.assertNotEqual(self.person.role.tenant, self.person_two.role.tenant)

        response = self.client.get('/api/admin/tenants/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 403)

    def test_permissions__diff_tenant_ok_if_staff(self):
        self.client.logout()
        self.person_two.is_staff = True
        self.person_two.save()
        self.client.login(username=self.person_two.username, password=PASSWORD)
        self.assertNotEqual(self.person.role.tenant, self.person_two.role.tenant)

        response = self.client.get('/api/admin/tenants/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 200)
