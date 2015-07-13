import json

from django.test import TestCase
from django.contrib.auth.models import User, ContentType, Group, Permission

from model_mommy import mommy

from contact.models import PersonAddress, PersonPhoneNumber, PersonEmail
from person.models import Person, Role
from person.tests.factory import PASSWORD, create_person


class PersonViewSetTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.title = 'VP'
        self.person1 = create_person()
        self.person1.title = self.title
        self.person1.save()

        self.person2 = create_person()

        # Login
        self.client.login(username=self.person1.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        # setup
        response = self.client.get('/api/person/person/')
        people = json.loads(response.content)
        # list data
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(people), 2)
        # single person fields in list
        person = people[0]
        self.assertEqual(person['title'], self.title)
        # username is in the `retrieve()` view and not the `list()` view
        with self.assertRaises(KeyError):
            person['username']

    def test_retrieve(self):
        # setup
        response = self.client.get('/api/person/person/1/')
        person = json.loads(response.content)
        self.assertEqual(person['username'], self.person1.username)


class PersonContactViewSetTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

        # contact info
        self.address = mommy.make(Address, person=self.person)
        self.phone_number = mommy.make(PersonPhoneNumber)
        self.email = mommy.make(PersonEmail)

        # join to Person
        for m in [self.phone_number, self.email]:
            m.person = self.person
            m.save()

        # Login
        self.client.login(username=self.person.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.assertEqual(self.address.person, self.person)

    def test_list(self):
        # setup
        response = self.client.get('/api/person/person_contact/')
        people = json.loads(response.content)['results']
        print 'people', people
        # list data
        self.assertEqual(response.status_code, 200)
        # attr tests
        person = people[0]
        print 'person', person
        self.assertEqual(person['id'], self.person.id)
        self.assertEqual(person['emails'][0]['id'], self.email.person.id)
        self.assertEqual(person['addresses'][0]['id'], self.address.person.id)
        self.assertEqual(person['phone_numbers'][0]['id'], self.phone_number.person.id)


class PersonAccessTests(TestCase):

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
