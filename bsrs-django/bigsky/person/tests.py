"""
Created on Feb 17, 2015

@author: tkrier
"""
from django.test import TestCase
from django.contrib.auth.models import AbstractUser

from rest_framework.test import APIClient
from rest_framework import status
from model_mommy import mommy

from person.models import Person


USER_DICT = {
    'username': 'testuser',
    'password': 'torment',
    'first_name': 'Test',
    'last_name': 'User',
    'email': 'tuser@bigskytech.com'
    }


class PersonTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.person = mommy.make(Person)
        self.password = '1234'
        self.person.set_password(self.password)
        self.person.save()

    def tearDown(self):
        self.client.logout()

    def test_person_is_user_subclass(self):
        self.assertIsInstance(self.person, AbstractUser)

    def test_access_user(self):
        """
        verify we can access user records correctly as a super user
        """
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get('/api/person/person/1/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_noaccess_user(self):
        """
        verify we can't acccess users as a normal user
        """
        self.client.login(username='superuser', password='torment')
        response = self.client.get('/api/person/person/1/', format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        