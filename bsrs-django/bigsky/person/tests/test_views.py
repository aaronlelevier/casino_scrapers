"""
Created on Feb 17, 2015

@author: tkrier
"""
from django.test import TestCase
from django.contrib.auth.models import User, ContentType, Group, Permission

from model_mommy import mommy

from person.models import Person, Role
from person.tests.factory import PASSWORD, create_person


class PersonViewSetTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_access_user(self):
        """
        verify we can access user records correctly as a super user
        """
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get('/api/person/person/1/', format='json')
        self.assertEqual(response.status_code, 200)

    def test_noaccess_user(self):
        """
        verify we can't acccess users as a normal user
        """
        self.client.login(username='noaccess_user', password='noaccess_password')
        response = self.client.get('/api/person/person/1/', format='json')
        self.assertEqual(response.status_code, 403)
        

class RoleViewSetTests(TestCase):

    def setUp(self):
        self.role = mommy.make(Role)
        self.password = PASSWORD
        self.person = create_person()
        # perms
        ct = ContentType.objects.get(app_label='person', model='role')
        perms = Permission.objects.filter(content_type=ct)
        for p in perms:
            self.person.user_permissions.add(p)
        self.person.save()

    def test_access_user(self):
        """
        verify we can access user records correctly as a super user
        """
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get('/api/person/role/1/', format='json')
        self.assertEqual(response.status_code, 200)



