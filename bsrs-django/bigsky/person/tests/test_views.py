import json

from django.test import TestCase, TransactionTestCase
from django.http import JsonResponse
from django.contrib.auth.models import User, ContentType, Group, Permission
from django.forms.models import model_to_dict

from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase
from model_mommy import mommy

from contact.models import Address, PhoneNumber, Email
from location.models import Location
from person.models import Person, Role, PersonStatus
from person.tests.factory import PASSWORD, create_person
from person.serializers import PersonUpdateSerializer


# Base fields: this will always be a Python Dict unless explicitly
# read in from a Serializer endpoint
PERSON_DATA = {
    "username":"one",
    "password":"one",
    "first_name":"foo",
    "last_name":"bar",
    "email":"",
    "role":"",
    "status":"",
    "location":"",
    "phone_numbers":[],
    'addresses': []
}


class PersonCreateTests(APITestCase):
    # Test: create, update, partial_update

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.client.login(username=self.person.username, password=self.password)

        # PhoneNumber: create a `phone_number` which can be joined on the person
        # for a test nested create Person w/ PhoneNumber
        self.location = mommy.make(Location)
        self.phone_number = mommy.make(PhoneNumber, location=self.location)
        self.phone_number2 = mommy.make(PhoneNumber, location=self.location)
        self.address = mommy.make(Address, location=self.location)
        
        # update for mock data
        self.data = PERSON_DATA
        self.data.update({
            'role': self.person.role.pk,
            'status': self.person.status.pk
            })

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.assertEqual(len(Person.objects.all()), 1)
        # simulate posting a Json Dict to create a new Person
        response = self.client.post('/api/admin/people/', self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(Person.objects.all()), 2)

    def test_create_with_phone_number(self):
        self.assertEqual(Person.objects.count(), 1)
        self.assertEqual(PhoneNumber.objects.exclude(person__isnull=True).count(), 0)
        # simulate posting a Json Dict to create a new Person
        self.data['phone_numbers'] = [model_to_dict(self.phone_number)]
        response = self.client.post('/api/admin/people/', self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Person.objects.count(), 2)
        self.assertEqual(PhoneNumber.objects.exclude(person__isnull=True).count(), 1)

    def test_create_with_phone_numbers(self):
        # Tests the creation of more than one related nested object
        self.assertEqual(Person.objects.count(), 1)
        self.assertEqual(PhoneNumber.objects.exclude(person__isnull=True).count(), 0)
        # simulate posting a Json Dict to create a new Person
        self.data['phone_numbers'] = [
            model_to_dict(self.phone_number),
            model_to_dict(self.phone_number2)
            ]
        response = self.client.post('/api/admin/people/', self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Person.objects.count(), 2)
        self.assertEqual(PhoneNumber.objects.exclude(person__isnull=True).count(), 2)

    def test_two_related(self):
        # Test creating a single Person w/ PhoneNumber and Address
        # nested creates
        self.assertEqual(Person.objects.count(), 1)
        self.assertEqual(Address.objects.exclude(person__isnull=True).count(), 0)
        # simulate posting a Json Dict to create a new Person
        self.data.update({
            'phone_numbers': [model_to_dict(self.phone_number)],
            'addresses': [model_to_dict(self.address)]
            })
        response = self.client.post('/api/admin/people/', self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Person.objects.count(), 2)
        self.assertEqual(PhoneNumber.objects.exclude(person__isnull=True).count(), 1)
        self.assertEqual(Address.objects.exclude(person__isnull=True).count(), 1)


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
        response = self.client.get('/api/admin/people/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], self.people)


class PersonDetailTests(TestCase):

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

    def test_retrieve(self):
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        person = json.loads(response.content)
        self.assertEqual(person['username'], self.person.username)
        self.assertIsNotNone(person['phone_numbers'])


class PersonPatchTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.client.login(username=self.person.username, password=self.password)
        # all required fields in order to create a person
        self.role = mommy.make(Role)
        self.person_status = mommy.make(PersonStatus)
        self.location = mommy.make(Location)

    def tearDown(self):
        self.client.logout()

    def test_patch(self):
        # email pre check before test
        title = 'manager'
        # get a person
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        person = json.loads(response.content)
        self.assertNotEqual(person['title'], title)
        # change email and send update
        person.update({'title': title})
        response = self.client.patch('/api/admin/people/{}/'.format(self.person.pk), person, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # get back the same person, and confirm that their email is changed in the DB
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        person = json.loads(response.content)
        self.assertEqual(person['title'], title)


class PersonPutTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.client.login(username=self.person.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_put(self):
        title = 'manager'
        person = PersonUpdateSerializer(self.person).data # returns a python dict
                                                           # serialized object
        self.assertNotEqual(person['title'], title)
        # change a field on the Person to see if the PUT works!
        person.update({'title':title})
        response = self.client.put('/api/admin/people/{}/'.format(self.person.pk), person, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # get back the same person, and confirm that their email is changed in the DB
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        person = json.loads(response.content)
        self.assertEqual(person['title'], title)

    def test_put_password_change(self):
        # test the User is currently logged in
        self.assertIn('_auth_user_id', self.client.session)
        # update their PW and see if they are still logged in
        password = 'new-password'
        person = PersonUpdateSerializer(self.person).data # returns a python dict
                                                           # serialized object
        # change a field on the Person to see if the PUT works!
        person.update({'password':password})
        response = self.client.put('/api/admin/people/{}/'.format(self.person.pk), person, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # still logged in after PW change test
        self.assertIn('_auth_user_id', self.client.session)


class PersonDeleteTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.client.login(username=self.person.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_delete(self):
        self.assertFalse(self.person.deleted)
        response = self.client.delete('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # get the Person Back, and check their deleted flag
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        person = json.loads(response.content)
        self.assertEqual(person['deleted'], True)

    def test_delete_override(self):
        self.assertEqual(Person.objects.count(), 1)
        response = self.client.delete('/api/admin/people/{}/'.format(self.person.pk),
            {'override':True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Person.objects.count(), 0)


class PersonAccessTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_access_user(self):
        """
        verify we can access user records correctly as a super user
        """
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(int(self.client.session['_auth_user_id']), self.person.pk)

    def test_noaccess_user(self):
        """
        verify we can't acccess users as a normal user
        """
        self.client.login(username='noaccess_user', password='noaccess_password')
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
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
        response = self.client.get('/api/admin/roles/{}/'.format(self.person.role.pk))
        self.assertEqual(response.status_code, 200)
