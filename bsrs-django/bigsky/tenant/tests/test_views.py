import json
from mock import patch
import random
import uuid

from django.conf import settings

from model_mommy import mommy
from pretend import stub
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from accounting.models import Currency
from contact.models import Email, Address, PhoneNumber, Country
from contact.serializers import EmailSerializer, AddressSerializer, PhoneNumberSerializer
from contact.tests.factory import create_address
from dtd.models import TreeData, DTD_START_KEY
from person.tests.factory import PASSWORD, create_single_person
from tenant.helpers import TenantFixtures
from tenant.models import Tenant
from tenant.serializers import TenantCreateSerializer, TenantUpdateSerializer


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
        self.assertEqual(data['scid'], self.tenant.scid)
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

        self.assertFalse(data['test_mode'])
        self.assertEqual(data['implementation_contact']['id'], str(self.tenant.implementation_contact.id))
        self.assertEqual(data['implementation_contact']['fullname'], self.tenant.implementation_contact.fullname)
        self.assertEqual(data['dtd_start']['id'], str(self.tenant.dtd_start.id))
        self.assertEqual(data['dtd_start']['key'], self.tenant.dtd_start.key)
        self.assertEqual(data['dtd_start']['description'], self.tenant.dtd_start.description)

    def test_optional_values(self):
        self.tenant.implementation_contact = None
        self.tenant.dtd_start = None
        self.tenant.save()

        response = self.client.get('/api/admin/tenants/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertIsNone(data['implementation_contact'])
        self.assertIsNone(data['dtd_start'])


class TenantCreateTests(TenantSetUpMixin, APITestCase):

    @patch("tenant.serializers.TenantFixtures.setUp")
    @patch("tenant.serializers.TenantEtlDataAdapter.post")
    def test_data(self, mock_adapter_post, mock_fixtures_setup):
        mock_adapter_post.return_value = random.randint(1,100)
        new_id = str(uuid.uuid4())
        new_company_code = 'foo'
        new_company_name = 'bar'
        implementation_email = EmailSerializer(mommy.make(Email)).data
        implementation_email['id'] = str(uuid.uuid4())
        serializer = TenantCreateSerializer(self.tenant)
        init_data = serializer.data
        init_data.update({
            'id': new_id,
            'company_code': new_company_code,
            'company_name': new_company_name,
            'implementation_email': implementation_email
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
        self.assertEqual(data['company_name'], new_company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['default_currency'], str(self.tenant.default_currency.id))
        # countries
        self.assertEqual(len(data['countries']), 1)
        self.assertEqual(data['countries'][0], str(self.tenant.countries.first().id))
        # implementation
        self.assertEqual(data['implementation_contact_initial'], self.tenant.implementation_contact_initial)
        self.assertEqual(data['implementation_email']['id'], implementation_email['id'])
        self.assertEqual(data['implementation_email']['type'], implementation_email['type'])
        self.assertEqual(data['implementation_email']['email'], implementation_email['email'])
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
        # mock post
        self.assertTrue(mock_adapter_post.called)
        self.assertTrue(mock_fixtures_setup.called)

    @patch("tenant.serializers.TenantFixtures.setUp")
    @patch("tenant.serializers.TenantEtlDataAdapter.post")
    def test_create_nested_contacts(self, mock_adapter_post, mock_fixtures_setup):
        mock_adapter_post.return_value = random.randint(1,100)
        new_id = str(uuid.uuid4())
        new_company_code = 'foo'
        new_company_name = 'bar'
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
            'company_name': new_company_name,
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
        # mock post
        self.assertTrue(mock_adapter_post.called)
        self.assertTrue(mock_fixtures_setup.called)


class TenantCreateEmailAndRemoteCallsTests(TenantSetUpMixin, APITestCase):

    def setUp(self):
        super(TenantCreateEmailAndRemoteCallsTests, self).setUp()
        new_id = str(uuid.uuid4())
        new_company_code = 'foo'
        new_company_name = 'bar'
        implementation_email = EmailSerializer(mommy.make(Email)).data
        implementation_email['id'] = str(uuid.uuid4())
        serializer = TenantCreateSerializer(self.tenant)
        self.init_data = serializer.data
        self.init_data.update({
            'id': new_id,
            'company_code': new_company_code,
            'company_name': new_company_name,
            'implementation_email': implementation_email
        })

    @patch("tenant.serializers.TenantFixtures.setUp")
    @patch("tenant.serializers.TenantEtlDataAdapter.post")
    def test_sc_post_and_fixtures_setup_called(self, mock_adapter_post, mock_fixtures_setup):
        mock_adapter_post.return_value = random.randint(1,100)

        response = self.client.post('/api/admin/tenants/', self.init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertTrue(mock_adapter_post.called)
        self.assertTrue(mock_fixtures_setup.called)

    @patch("tenant.serializers.TenantFixtures.setUp")
    @patch("tenant.serializers.TenantEtlDataAdapter.post")
    def test_sc_error(self, mock_adapter_post, mock_fixtures_setup):
        mock_adapter_post.side_effect = ValidationError("Subscriber with such name already exists")

        response = self.client.post('/api/admin/tenants/', self.init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            json.loads(response.content.decode('utf8'))[0],
            "Subscriber with such name already exists"
        )

    @patch("tenant.serializers.TenantFixtures.setUp")
    @patch("tenant.serializers.TenantEtlDataAdapter.post")
    def test_sc_scid(self, mock_adapter_post, mock_fixtures_setup):
        scid = random.randint(1,100)
        mock_adapter_post.return_value = scid

        response = self.client.post('/api/admin/tenants/', self.init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        tenant = Tenant.objects.get(id=data['id'])
        self.assertEqual(tenant.scid, scid)


class TenantUpdateTests(TenantSetUpMixin, APITestCase):

    @patch("tenant.serializers.TenantEtlAdapter.put")
    def test_data(self,mock_func):
        dtd = mommy.make(TreeData)
        currency = mommy.make(Currency, code='FOO')
        serializer = TenantUpdateSerializer(self.tenant)
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
        self.assertEqual(data['countries'][0], str(country.id))
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

        self.assertFalse(data['test_mode'])
        self.assertEqual(data['implementation_contact'], str(self.tenant.implementation_contact.id))
        self.assertEqual(data['dtd_start'], str(self.tenant.dtd_start.id))

    @patch("tenant.serializers.TenantEtlAdapter.put")
    def test_update_related_models(self, mock_func):
        dtd = mommy.make(TreeData)
        serializer = TenantUpdateSerializer(self.tenant)
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

    @patch("tenant.serializers.TenantEtlAdapter.put")
    def test_update_existing_related_models_field(self, mock_func):
        # contacts
        implementation_email = mommy.make(Email, _fill_optional=['type'])
        billing_email = mommy.make(Email, _fill_optional='type')
        billing_phone_number = mommy.make(PhoneNumber, _fill_optional=['type'])
        billing_address = create_address()
        # data
        serializer = TenantUpdateSerializer(self.tenant)
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

    @patch("tenant.serializers.TenantEtlAdapter.put")
    def test_remove_related_models(self, mock_func):
        serializer = TenantUpdateSerializer(self.tenant)
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

    @patch("tenant.serializers.TenantEtlAdapter.put")
    def test_sc_put_sent(self, mock_func):
        updated_data = TenantUpdateSerializer(self.tenant).data

        response = self.client.put('/api/admin/tenants/{}/'.format(self.tenant.id),
            updated_data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(mock_func.called)


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

        self.assertEqual(response.status_code, 404)

    def test_permissions__diff_tenant_ok_if_staff(self):
        self.client.logout()
        self.person_two.is_staff = True
        self.person_two.save()
        self.client.login(username=self.person_two.username, password=PASSWORD)
        self.assertNotEqual(self.person.role.tenant, self.person_two.role.tenant)

        response = self.client.get('/api/admin/tenants/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 200)
