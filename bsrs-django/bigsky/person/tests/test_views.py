import json

from django.test import TestCase, TransactionTestCase
from django.http import JsonResponse
from django.contrib.auth.models import User, ContentType, Group, Permission

from rest_framework import status
from rest_framework.test import APITestCase
from model_mommy import mommy

from contact.models import Address, PhoneNumber, Email
from location.models import Location
from person.models import Person, Role, PersonStatus
from person.tests.factory import PASSWORD, create_person
from person.serializers import PersonUpdateSerializer


class PersonViewSetDataChangeTests(APITestCase):
    # Test: create, update, partial_update

    def setUp(self):
        self.password = PASSWORD
        self.person1 = create_person()
        self.client.login(username=self.person1.username, password=self.password)
        # all required fields in order to create a person
        self.role = mommy.make(Role)
        self.person_status = mommy.make(PersonStatus)
        self.location = mommy.make(Location)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.assertEqual(len(Person.objects.all()), 1)
        # simulate posting a Json Dict to create a new Person
        data = {"username":"one","password":"one","first_name":"foo",
        "last_name":"bar","email":"","role":1,"status":1}
        response = self.client.post('/api/admin/people/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(Person.objects.all()), 2)

    def test_patch(self):
        # email pre check before test
        title = 'manager'
        # get a person
        response = self.client.get('/api/admin/people/1/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        person = json.loads(response.content)
        self.assertNotEqual(person['title'], title)
        # change email and send update
        person.update({'title': title})
        response = self.client.patch('/api/admin/people/1/', person, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # get back the same person, and confirm that their email is changed in the DB
        response = self.client.get('/api/admin/people/1/')
        person = json.loads(response.content)
        self.assertEqual(person['title'], title)

    def test_put(self):
        title = 'manager'
        person = PersonUpdateSerializer(self.person1).data # returns a python dict
                                                           # serialized object
        self.assertNotEqual(person['title'], title)
        # change a field on the Person to see if the PUT works!
        person.update({'title':title})
        response = self.client.put('/api/admin/people/1/', person, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # get back the same person, and confirm that their email is changed in the DB
        response = self.client.get('/api/admin/people/1/')
        person = json.loads(response.content)
        self.assertEqual(person['title'], title)

    def test_put_password_change(self):
        # test the User is currently logged in
        self.assertIn('_auth_user_id', self.client.session)
        # update their PW and see if they are still logged in
        password = 'new-password'
        person = PersonUpdateSerializer(self.person1).data # returns a python dict
                                                           # serialized object
        # change a field on the Person to see if the PUT works!
        person.update({'password':password})
        response = self.client.put('/api/admin/people/1/', person, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # still logged in after PW change test
        self.assertIn('_auth_user_id', self.client.session)


### PersonViewSetTests ###

class PersonListTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.people = 10
        create_person(_many=self.people)
        # Login
        self.person1 = Person.objects.first()
        self.client.login(username=self.person1.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        # setup
        response = self.client.get('/api/admin/people/')
        self.assertEqual(response.status_code, 200)
        # list data        
        data = json.loads(response.content)
        people = data['results']
        self.assertEqual(len(people), self.people)
        # single person fields in list
        person = people[0]
        self.assertEqual(person['username'], self.person1.username)


class PersonViewSetTests(TestCase):
    
    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

        # Login
        self.client.login(username=self.person.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_retrieve(self):
        response = self.client.get('/api/admin/people/1/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        person = json.loads(response.content)
        self.assertEqual(person['username'], self.person.username)


class PersonContactViewSetTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

        # contact info
        self.address = mommy.make(Address, person=self.person)
        self.phone_number = mommy.make(PhoneNumber, person=self.person)
        self.email = mommy.make(Email, person=self.person)

        # Login
        self.client.login(username=self.person.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.assertEqual(self.address.person, self.person)


class PersonAccessTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_access_user(self):
        """
        verify we can access user records correctly as a super user
        """
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get('/api/admin/people/1/', format='json')
        self.assertEqual(response.status_code, 200)

    def test_noaccess_user(self):
        """
        verify we can't acccess users as a normal user
        """
        self.client.login(username='noaccess_user', password='noaccess_password')
        response = self.client.get('/api/admin/people/1/', format='json')
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
        response = self.client.get('/api/admin/roles/1/', format='json')
        self.assertEqual(response.status_code, 200)