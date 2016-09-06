import json
import uuid

from rest_framework.test import APITestCase
from model_mommy import mommy

from contact.models import (State, Country, Email, EmailType,
    PhoneNumber, PhoneNumberType, Address, AddressType)
from contact.tests.factory import create_contact
from person.tests.factory import PASSWORD, create_single_person
from third_party.models import ThirdParty
from third_party.serializers import ThirdPartyUpdateSerializer
from third_party.tests.factory import create_third_party
from utils import create


class ThirdPartyTests(APITestCase):

    def setUp(self):
        self.third_party = create_third_party()
        self.person = create_single_person()
        # Data
        serializer = ThirdPartyUpdateSerializer(self.third_party)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    ### LIST

    def test_list_response(self):
        response = self.client.get('/api/admin/third-parties/')
        self.assertEqual(response.status_code, 200)

    def test_list_data(self):
        response = self.client.get('/api/admin/third-parties/')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(self.third_party.id))
        self.assertEqual(data['results'][0]['name'], self.third_party.name)
        self.assertEqual(data['results'][0]['number'], self.third_party.number)
        self.assertEqual(data['results'][0]['status']['id'], str(self.third_party.status.id))
        self.assertEqual(data['results'][0]['status']['name'], self.third_party.status.name)

    ### DETAIL

    def test_data(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        
        self.assertEqual(data['id'], str(self.third_party.id))
        self.assertEqual(data['name'], self.third_party.name)
        self.assertEqual(data['number'], self.third_party.number)
        self.assertEqual(data['status_fk'], str(self.third_party.status.id))

    def test_detail_email(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))
        
        email = Email.objects.get(id=data['emails'][0]['id'])

        self.assertEqual(data['emails'][0]['id'], str(email.id))
        self.assertEqual(data['emails'][0]['type'], str(email.type.id))
        self.assertEqual(data['emails'][0]['email'], email.email)

    def test_data_phone_numbers(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))

        phone = PhoneNumber.objects.get(id=data['phone_numbers'][0]['id'])
        
        phone_data = data['phone_numbers'][0]
        self.assertEqual(phone_data['id'], str(phone.id))
        self.assertEqual(phone_data['type'], str(phone.type.id))
        self.assertEqual(phone_data['number'], phone.number)

    def test_data_addresses(self):
        self.third_party.addresses.clear()
        address = mommy.make(Address, object_id=self.third_party.id, content_object=self.third_party,
                             _fill_optional=['type', 'state', 'country'])
        self.third_party.addresses.add(address)

        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))

        data = json.loads(response.content.decode('utf8'))
        address = Address.objects.get(id=data['addresses'][0]['id'])
        address_data = data['addresses'][0]
        self.assertEqual(address_data['id'], str(address.id))
        self.assertEqual(address_data['type']['id'], str(address.type.id))
        self.assertEqual(address_data['type']['name'], address.type.name)
        self.assertEqual(address_data['address'], address.address)
        self.assertEqual(address_data['city'], address.city)
        self.assertEqual(address_data['state']['id'], str(address.state.id))
        self.assertEqual(address_data['state']['name'], address.state.name)
        self.assertEqual(address_data['country']['id'], str(address.country.id))
        self.assertEqual(address_data['country']['name'], address.country.common_name)
        self.assertEqual(address_data['postal_code'], address.postal_code)

    def test_detail_contact(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(
            Email.objects.get(id=data['emails'][0]['id']),
            Email
        )

    def test_detail_contact_type(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(
            EmailType.objects.get(id=data['emails'][0]['type']),
            EmailType
        )

    def test_nested_contact(self):
        email = create_contact(Email, self.third_party)
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['emails'][0]['id'])

    def test_nested_contact_type(self):
        email = create_contact(Email, self.third_party)
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['emails'][0]['type'])

    ### UPDATE

    def test_update_data(self):
        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.third_party.id))
        self.assertEqual(data['name'], self.third_party.name)
        self.assertEqual(data['number'], self.third_party.number)
        self.assertEqual(data['status'], str(self.third_party.status.id))
        self.assertIn('emails', data)
        self.assertIn('phone_numbers', data)
        self.assertIn('addresses', data)
        self.assertIn('categories', data)

    def test_update_number(self):
        init_number = self.data['number']
        post_number = '123-232-2322'
        self.data['number'] = post_number

        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['number'], post_number)

    # related model updates

    def test_update_create_email(self):
        id = str(uuid.uuid4())
        email_type = mommy.make(EmailType)
        self.data['emails'] = [{
            'id': id,
            'type': str(email_type.id),
            'email': 'mail@mail.com',
        }]

        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['emails'])
        self.assertEqual(data['emails'][0]['id'], self.data['emails'][0]['id'])
        self.assertEqual(data['emails'][0]['type'], self.data['emails'][0]['type'])
        self.assertEqual(data['emails'][0]['email'], self.data['emails'][0]['email'])

    def test_update_create_address(self):
        address_type = mommy.make(AddressType)
        id = str(uuid.uuid4())
        state = mommy.make(State)
        country = mommy.make(Country)
        self.data['addresses'] = [{
            'id': id,
            'type': str(address_type.id),
            'address': '123 My St.',
            'city': 'Omaha',
            'state': str(state.id),
            'postal_code': '92126',
            'country': str(country.id),
        }]

        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['addresses'])
        self.assertEqual(data['addresses'][0]['id'], self.data['addresses'][0]['id'])
        self.assertEqual(data['addresses'][0]['type'], self.data['addresses'][0]['type'])
        self.assertEqual(data['addresses'][0]['address'], self.data['addresses'][0]['address'])
        self.assertEqual(data['addresses'][0]['city'], self.data['addresses'][0]['city'])
        self.assertEqual(data['addresses'][0]['state'], self.data['addresses'][0]['state'])
        self.assertEqual(data['addresses'][0]['postal_code'], self.data['addresses'][0]['postal_code'])
        self.assertEqual(data['addresses'][0]['country'], self.data['addresses'][0]['country'])

    def test_update_create_phone_number(self):
        phone_number_type = mommy.make(PhoneNumberType)
        id = str(uuid.uuid4())
        self.data['phone_numbers'] = [{
            'id': id,
            'type': str(phone_number_type.id),
            'number': create._generate_ph(),
        }]

        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['phone_numbers'])
        self.assertEqual(data['phone_numbers'][0]['id'], self.data['phone_numbers'][0]['id'])
        self.assertEqual(data['phone_numbers'][0]['type'], self.data['phone_numbers'][0]['type'])
        self.assertEqual(data['phone_numbers'][0]['number'], self.data['phone_numbers'][0]['number'])


    ### CREATE

    def test_create(self):
        data = {
            'id': str(uuid.uuid4()),
            'name': 'scooter',
            'number': '123-123-1233',
        }

        response = self.client.post('/api/admin/third-parties/', data, format='json')
        self.assertEqual(response.status_code, 201)

        data = json.loads(response.content.decode('utf8'))
        third_party = ThirdParty.objects.get(id=data['id'])

        self.assertEqual(data['id'], str(third_party.id))
        self.assertEqual(data['name'], third_party.name)
        self.assertEqual(data['number'], third_party.number)
        self.assertEqual(data['status'], str(third_party.status.id))
        self.assertEqual(data['currency'], str(third_party.currency.id))
