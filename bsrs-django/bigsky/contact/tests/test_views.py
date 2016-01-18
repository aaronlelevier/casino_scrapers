import json

from rest_framework.test import APITestCase

from model_mommy import mommy

from contact.models import PhoneNumber, Address, Email
from contact.tests.factory import create_contact
from person.tests.factory import PASSWORD, create_person


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
        self.address = create_contact(Address, self.person)
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
        self.assertEqual(data['state'], self.address.state)
        self.assertEqual(data['country'], self.address.country)
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
