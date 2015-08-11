import json

from rest_framework import status
from rest_framework.test import APITestCase
from model_mommy import mommy

from contact.models import PhoneNumber, Address, Email
from person.tests.factory import PASSWORD, create_person


class PhoneNumberViewSetTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.phone_number = mommy.make(PhoneNumber, person=self.person)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/phone_numbers/{}/'.format(self.phone_number.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['number'], self.phone_number.number)

    def test_list(self):
        # have 2 ph #'s total
        mommy.make(PhoneNumber, person=self.person)
        response = self.client.get('/api/admin/phone_numbers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        numbers = data['results']
        self.assertEqual(len(numbers), 2)


class PhoneNumberTypeViewSetTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.phone_number = mommy.make(PhoneNumber, person=self.person)
        self.type = self.phone_number.type
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/phone_numbers/{}/'.format(self.phone_number.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['type'], str(self.type.pk))

    def test_list(self):
        # have 2 ph #'s total
        ph2 = mommy.make(PhoneNumber, person=self.person)
        type2 = ph2.type

        response = self.client.get('/api/admin/phone_number_types/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        numbers = data['results']
        self.assertEqual(len(numbers), 2)


class AddressTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.address = mommy.make(Address, person=self.person)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/addresses/{}/'.format(self.address.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.address.pk))


class EmailTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.email = mommy.make(Email, person=self.person)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/emails/{}/'.format(self.email.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.email.pk))
