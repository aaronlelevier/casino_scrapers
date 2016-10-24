import json

from rest_framework.test import APITestCase

from model_mommy import mommy

from contact.models import Country, State, PhoneNumber, Address, Email
from contact.tests.factory import create_contact, create_contact_country, create_contact_state
from person.tests.factory import PASSWORD, create_person


class StateCountryViewTestSetupMixin(object):

    def setUp(self):
        self.country = create_contact_country()
        self.country_two = create_contact_country('foo')
        self.state = self.country.states.first()
        self.person = create_person()
        self.tenant = self.person.role.tenant
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()


class CountryViewSetTests(StateCountryViewTestSetupMixin, APITestCase):

    def test_list(self):
        response = self.client.get('/api/countries/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        country_data = data['results'][0]
        self.assertIn('id', country_data)
        self.assertIn('common_name', country_data)
        self.assertIn('three_letter_code', country_data)

    def test_get(self):
        response = self.client.get('/api/countries/{}/'.format(self.country.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertIn('id', data)
        self.assertIn('common_name', data)
        self.assertIn('three_letter_code', data)
        self.assertEqual(len(data['states']), 2)
        self.assertIn('id', data['states'][0])
        self.assertIn('name', data['states'][0])

    def test_create(self):
        response = self.client.post('/api/countries/', {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_update(self):
        response = self.client.post('/api/countries/{}/'.format(self.country.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/countries/{}/'.format(self.country.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_tenant(self):
        self.assertEqual(self.tenant.countries.first(), self.country)

        response = self.client.get('/api/countries/tenant/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(len(data['results'][0]), 2)
        self.assertIn('id', data['results'][0])
        self.assertIn('name', data['results'][0])
        self.assertEqual(data['results'][0]['id'], str(self.tenant.countries.first().id))

    def test_tenant_countries__filter_by_search(self):
        tenant = self.person.role.tenant
        keyword = tenant.countries.first().common_name
        country = create_contact_country(keyword+'foo')
        self.assertEqual(Country.objects.filter(common_name__icontains=keyword).count(), 2)
        self.assertEqual(tenant.countries.filter(common_name__icontains=keyword).count(), 1)

        response = self.client.get('/api/countries/tenant/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)

    def test_tenant_ordering(self):
        keyword = 'aa'
        b = create_contact_country('aab')
        a = create_contact_country('aaa')
        self.person.role.tenant.countries.add(a,b)
        countries = Country.objects.filter(common_name__icontains=keyword)
        self.assertEqual(countries[0], b)
        self.assertEqual(countries[1], a)

        response = self.client.get('/api/countries/tenant/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        self.assertEqual(data['results'][0]['name'], 'aaa')
        self.assertEqual(data['results'][1]['name'], 'aab')


class StateViewSetTests(StateCountryViewTestSetupMixin, APITestCase):

    def test_list(self):
        response = self.client.get('/api/states/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        state_data = data['results'][0]
        self.assertIn('id', state_data)
        self.assertIn('state_code', state_data)
        self.assertIn('name', state_data)
        self.assertIn('classification', state_data)

    def test_get(self):
        response = self.client.get('/api/states/{}/'.format(self.state.id))
        self.assertEqual(response.status_code, 405)

    def test_create(self):
        response = self.client.post('/api/states/', {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_update(self):
        response = self.client.post('/api/states/{}/'.format(self.state.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/states/{}/'.format(self.state.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_tenant(self):
        tenant_states = self.tenant.countries.first().states.all()
        self.assertEqual(tenant_states.count(), 2)

        response = self.client.get('/api/states/tenant/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        self.assertEqual(len(data['results'][0]), 2)
        self.assertIn('id', data['results'][0])
        self.assertIn('name', data['results'][0])
        self.assertIn(str(tenant_states[0].id), (x['id'] for x in data['results']))
        self.assertIn(str(tenant_states[1].id), (x['id'] for x in data['results']))

    def test_tenant_states__filter_by_search(self):
        keyword = 'foo'
        self.state.name = keyword
        self.state.save()
        mommy.make(State, name=keyword+'bar')
        self.assertEqual(State.objects.filter(name__icontains=keyword).count(), 2)
        tenant_countries_ids = self.person.role.tenant.countries.values_list('id', flat=True)
        self.assertEqual(State.objects.filter(country__id__in=tenant_countries_ids,
                                              name__icontains=keyword).count(), 1)

        response = self.client.get('/api/states/tenant/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)

    def test_tenant_ordering(self):
        keyword = 'aa'
        country = self.person.role.tenant.countries.first()
        b = create_contact_state('aab', country=country)
        a = create_contact_state('aaa', country=country)
        states = State.objects.filter(name__icontains=keyword)
        self.assertEqual(states[0], b)
        self.assertEqual(states[1], a)

        response = self.client.get('/api/states/tenant/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        self.assertEqual(data['results'][0]['name'], 'aaa')
        self.assertEqual(data['results'][1]['name'], 'aab')


class PhoneNumberTypeViewSetTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.phone_number = create_contact(PhoneNumber, self.person)
        self.type = self.phone_number.type
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/phone-number-types/{}/'.format(self.type.pk))
        
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/phone-number-types/{}/'.format(self.type.pk))
        
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.type.id))
        self.assertEqual(data['name'], self.type.name)
        

class PhoneNumberViewSetTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.phone_number = mommy.make(PhoneNumber, content_object=self.person,
            object_id=self.person.id, _fill_optional=['type', 'number'])
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/phone-numbers/{}/'.format(self.phone_number.pk))
        
        self.assertEqual(response.status_code, 200)
        
    def test_data(self):
        response = self.client.get('/api/admin/phone-numbers/{}/'.format(self.phone_number.pk))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.phone_number.id))
        self.assertEqual(data['type'], str(self.phone_number.type.id))
        self.assertEqual(data['number'], str(self.phone_number.number))


class AddressTypeTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.address = create_contact(Address, self.person)
        self.type = self.address.type
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/address-types/{}/'.format(
            self.address.type.id))

        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/address-types/{}/'.format(
            self.address.type.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.type.id))
        self.assertEqual(data['name'], self.type.name)


class AddressTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.address = mommy.make(Address, object_id=self.person.id, content_object=self.person,
                             _fill_optional=['type', 'state', 'country'])
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/addresses/{}/'.format(self.address.pk))
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/addresses/{}/'.format(self.address.pk))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.address.id))
        self.assertEqual(data['type'], str(self.address.type.id))
        self.assertEqual(data['address'], self.address.address)
        self.assertEqual(data['city'], self.address.city)
        self.assertEqual(data['state']['id'], str(self.address.state.id))
        self.assertEqual(data['state']['name'], self.address.state.name)
        self.assertEqual(data['country']['id'], str(self.address.country.id))
        self.assertEqual(data['country']['name'], self.address.country.common_name)
        self.assertEqual(data['postal_code'], self.address.postal_code)


class EmailTypeTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.email = create_contact(Email, self.person)
        self.type = self.email.type
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/email-types/{}/'.format(
            self.email.type.id))

        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/email-types/{}/'.format(
            self.email.type.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.type.id))
        self.assertEqual(data['name'], self.type.name)


class EmailTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.email = mommy.make(Email, content_object=self.person,
            object_id=self.person.id, _fill_optional=['type', 'email'])
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/emails/{}/'.format(self.email.pk))

        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/emails/{}/'.format(self.email.pk))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.email.id))
        self.assertEqual(data['type'], str(self.email.type.id))
        self.assertEqual(data['email'], str(self.email.email))
