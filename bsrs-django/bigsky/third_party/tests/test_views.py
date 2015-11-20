import json
import uuid

from rest_framework.test import APITestCase

from category.models import Category
from category.tests.factory import create_categories
from contact.models import Email, EmailType, PhoneNumber, Address
from contact.serializers import EmailFlatSerializer
from contact.tests.factory import create_contact, create_contacts
from person.tests.factory import PASSWORD, create_person
from third_party.models import ThirdParty
from third_party.serializers import ThirdPartyCreateUpdateSerializer
from third_party.tests.factory import create_third_party


class ThirdPartyTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # ThirdParty
        self.third_party = create_third_party()
        # Data
        serializer = ThirdPartyCreateUpdateSerializer(self.third_party)
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
        self.assertEqual(data['results'][0]['status'], str(self.third_party.status.id))

    ### DETAIL

    def test_data(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        
        self.assertEqual(data['id'], str(self.third_party.id))
        self.assertEqual(data['name'], self.third_party.name)
        self.assertEqual(data['number'], self.third_party.number)
        self.assertEqual(data['status'], str(self.third_party.status.id))

    def test_detail_email(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))
        
        email = Email.objects.get(id=data['emails'][0]['id'])

        self.assertEqual(data['emails'][0]['id'], str(email.id))
        self.assertEqual(data['emails'][0]['type']['id'], str(email.type.id))
        self.assertEqual(data['emails'][0]['type']['name'], email.type.name)
        self.assertEqual(data['emails'][0]['email'], email.email)

    def test_data_phone_numbers(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))

        phone = PhoneNumber.objects.get(id=data['phone_numbers'][0]['id'])
        
        phone_data = data['phone_numbers'][0]
        self.assertEqual(phone_data['id'], str(phone.id))
        self.assertEqual(phone_data['type']['id'], str(phone.type.id))
        self.assertEqual(phone_data['type']['name'], phone.type.name)
        self.assertEqual(phone_data['number'], phone.number)

    def test_data_addresses(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))

        address = Address.objects.get(id=data['addresses'][0]['id'])

        address_data = data['addresses'][0]
        self.assertEqual(address_data['id'], str(address.id))
        self.assertEqual(address_data['type']['id'], str(address.type.id))
        self.assertEqual(address_data['type']['name'], address.type.name)
        self.assertEqual(address_data['address'], address.address)
        self.assertEqual(address_data['city'], address.city)
        self.assertEqual(address_data['state'], address.state)
        self.assertEqual(address_data['country'], address.country)
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
            EmailType.objects.get(id=data['emails'][0]['type']['id']),
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
        self.assertTrue(data['emails'][0]['type']['id'])

    ### UPDATE

    def test_update_no_change(self):
        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_update_number(self):
        init_number = self.data['number']
        post_number = '123-232-2322'
        self.data['number'] = post_number

        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['number'], post_number)

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
