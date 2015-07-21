import json

from django.test import TestCase
from django.http import JsonResponse
from django.contrib.auth.models import User, ContentType, Group, Permission

from rest_framework import status
from rest_framework.test import APITestCase
from model_mommy import mommy

from contact.models import Address, PhoneNumber, Email
from location.models import Location
from person.models import Person, Role, PersonStatus
from person.tests.factory import PASSWORD, create_person


class PhoneNumberViewSetTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.phone_number = mommy.make(PhoneNumber, person=self.person)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/contact/phone_numbers/{}/'.format(self.phone_number.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(data['number'], self.phone_number.number)

    def test_list(self):
        # have 2 ph #'s total
        mommy.make(PhoneNumber, person=self.person)

        response = self.client.get('/api/contact/phone_numbers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
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
        response = self.client.get('/api/contact/phone_numbers/{}/'.format(self.phone_number.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(data['type'], self.type.pk)

    def test_list(self):
        # have 2 ph #'s total
        ph2 = mommy.make(PhoneNumber, person=self.person)
        type2 = ph2.type

        response = self.client.get('/api/contact/phone_number_types/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        numbers = data['results']
        self.assertEqual(len(numbers), 2)
