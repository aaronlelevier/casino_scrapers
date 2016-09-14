import json
import uuid

from django.conf import settings

from model_mommy import mommy
from rest_framework.test import APITestCase

from accounting.models import Currency
from contact.models import Email, Address, PhoneNumber, Country
from contact.serializers import EmailSerializer, AddressSerializer, PhoneNumberSerializer
from dtd.models import TreeData, DTD_START_KEY
from person.models import Person
from person.tests.factory import PASSWORD, create_single_person
from tenant.models import Tenant
from tenant.serializers import TenantCreateSerializer, TenantDetailSerializer


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
        response = self.client.get('/api/admin/tenant/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        self.assertEqual(len(data['results'][0]), 3)
        tenant = Tenant.objects.get(id=data['results'][0]['id'])
        self.assertEqual(data['results'][0]['company_code'], tenant.company_code)
        self.assertEqual(data['results'][0]['company_name'], tenant.company_name)


class TenantDetailTests(TenantSetUpMixin, APITestCase):

    def test_data(self):
        self.assertEqual(self.tenant.company_name, settings.DEFAULT_TENANT_COMPANY_NAME)

        response = self.client.get('/api/admin/tenant/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], self.tenant.company_code)
        self.assertEqual(data['company_name'], self.tenant.company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['dt_start_id'], str(self.tenant.dt_start.id))
        self.assertEqual(data['dt_start']['id'], str(self.tenant.dt_start.id))
        self.assertEqual(data['dt_start']['key'], self.tenant.dt_start.key)
        self.assertEqual(data['default_currency_id'], str(self.tenant.default_currency.id))
        self.assertEqual(data['test_mode'], self.tenant.test_mode)
        # implementation
        self.assertEqual(data['implementation_contact_initial'], self.tenant.implementation_contact_initial)
        self.assertEqual(data['implementation_contact']['id'], str(self.tenant.implementation_contact.id))
        self.assertEqual(data['implementation_contact']['fullname'], self.tenant.implementation_contact.fullname)
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
        self.assertEqual(len(data['countries']), 1)
        self.assertEqual(data['countries'][0]['id'], str(self.tenant.countries.first().id))
        self.assertEqual(data['countries'][0]['name'], self.tenant.countries.first().common_name)


class TenantCreateTests(TenantSetUpMixin, APITestCase):

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

        response = self.client.post('/api/admin/tenant/', init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['id'], new_id)
        self.assertEqual(data['company_code'], new_company_code)
        self.assertEqual(data['company_name'], self.tenant.company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['default_currency_id'], str(self.tenant.default_currency.id))
        # update specific data, not to be included in create
        self.assertNotIn('dt_start_id', data)
        self.assertNotIn('dt_start', data)
        self.assertNotIn('test_mode', data)
        self.assertNotIn('implementation_contact', data)
        self.assertNotIn('countries', data)
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

        response = self.client.post('/api/admin/tenant/', init_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['implementation_email']['id'], init_data['implementation_email']['id'])
        self.assertEqual(data['billing_email']['id'], init_data['billing_email']['id'])
        self.assertEqual(data['billing_address']['id'], init_data['billing_address']['id'])
        self.assertEqual(data['billing_phone_number']['id'], init_data['billing_phone_number']['id'])


class TenantUpdateTests(TenantSetUpMixin, APITestCase):

    def test_data(self):
        dtd = mommy.make(TreeData)
        currency = mommy.make(Currency, code='FOO')
        serializer = TenantDetailSerializer(self.tenant)
        country = mommy.make(Country, common_name='foo')
        updated_data = serializer.data
        updated_data.update({
            'company_code': 'foo',
            'company_name': 'bar',
            'dashboard_text': 'biz',
            'dt_start': {
                'id': str(dtd.id),
                'key': dtd.key
            },
            'default_currency': str(currency.id),
            'test_mode': False,
            'implementation_contact': {
                'id': str(self.person.id),
                'fullname': self.person.fullname
            },
            'countries': [{
                'id': str(country.id),
                'name': country.common_name
            }]
        })

        response = self.client.put('/api/admin/tenant/{}/'.format(self.tenant.id), updated_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], updated_data['company_code'])
        self.assertEqual(data['company_name'], updated_data['company_name'])
        self.assertEqual(data['dashboard_text'], updated_data['dashboard_text'])
        self.assertEqual(data['default_currency_id'], updated_data['default_currency'])
        # specific data to update that's not in create
        self.assertEqual(data['dt_start_id'], updated_data['dt_start']['id'])
        self.assertEqual(data['dt_start']['id'], updated_data['dt_start']['id'])
        self.assertEqual(data['dt_start']['key'], updated_data['dt_start']['key'])
        self.assertFalse(data['test_mode'])
        self.assertEqual(data['implementation_contact']['id'], str(self.person.id))
        self.assertEqual(data['implementation_contact']['fullname'], self.person.fullname)
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

    def test_remove_related_models(self):
        serializer = TenantDetailSerializer(self.tenant)
        updated_data = serializer.data
        updated_data.update({
            'dt_start': {},
            'implementation_contact': {},
            'countries': []
        })
        self.assertIsInstance(self.tenant.dt_start, TreeData)
        self.assertIsInstance(self.tenant.implementation_contact, Person)
        self.assertTrue(self.tenant.countries.exists())

        response = self.client.put('/api/admin/tenant/{}/'.format(self.tenant.id), updated_data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['dt_start'], None)
        self.assertEqual(data['implementation_contact'], None)
        self.assertEqual(data['countries'], [])


class TenantDeleteTests(TenantSetUpMixin, APITestCase):

    def test_delete(self):
        response = self.client.delete('/api/admin/tenant/{}/'.format(self.tenant.id))
        self.assertEqual(response.status_code, 204)


class TenantPermissionTests(TenantSetUpMixin, APITestCase):

    def test_permissions__if_diff_tenant(self):
        self.client.logout()
        self.client.login(username=self.person_two.username, password=PASSWORD)
        self.assertNotEqual(self.person.role.tenant, self.person_two.role.tenant)

        response = self.client.get('/api/admin/tenant/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 403)

    def test_permissions__diff_tenant_ok_if_staff(self):
        self.client.logout()
        self.person_two.is_staff = True
        self.person_two.save()
        self.client.login(username=self.person_two.username, password=PASSWORD)
        self.assertNotEqual(self.person.role.tenant, self.person_two.role.tenant)

        response = self.client.get('/api/admin/tenant/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 200)
