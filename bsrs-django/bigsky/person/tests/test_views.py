import json
import uuid
import time
import sys
if sys.version_info > (2,7):
    str = unicode

from django.test import TestCase, TransactionTestCase
from django.http import JsonResponse
from django.contrib.auth.models import User, ContentType, Group, Permission
from django.forms.models import model_to_dict

from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase
from model_mommy import mommy

from contact.models import Address, PhoneNumber, Email, PhoneNumberType
from location.models import Location, LocationLevel
from person.models import Person, Role, PersonStatus
from person.tests.factory import PASSWORD, create_person, create_role
from person.serializers import PersonUpdateSerializer
from util import create, choices


### ROLE ###

class RoleViewSetTests(APITransactionTestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # LocationLevel
        self.location = mommy.make(Location)
        # Role
        self.role = self.person.role
        self.role.location_level = self.location.level
        self.role.save()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/roles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        roles = data['results']
        self.assertEqual(roles[0]['id'], str(self.role.pk))
        self.assertEqual(roles[0]['location_level']['id'], str(self.location.level.id))

    def test_detail(self):
        response = self.client.get('/api/admin/roles/{}/'.format(self.role.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(data['id'], str(self.role.pk))
        self.assertEqual(data['location_level']['id'], str(self.location.level.id))

    def test_create(self):
        role_data = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "role_type": choices.ROLE_TYPE_CHOICES[0][0],
            "location_level": self.location.level.id
        }
        response = self.client.post('/api/admin/roles/', role_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = json.loads(response.content)
        self.assertEqual(data['id'], role_data['id'])
        self.assertIsInstance(Role.objects.get(id=role_data['id']), Role)

    def test_update(self):
        role_data = {
            "id": self.role.id,
            "name": "New Role Name",
            "role_type": self.role.role_type,
            "location_level": self.role.location_level.id
        }
        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id), role_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        new_role_data = json.loads(response.content)
        self.assertNotEqual(self.role.name, new_role_data['name'])


### PERSON ###

class PersonAuthTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def test_login(self):
        self.assertIn('_auth_user_id', self.client.session)

    def tearDown(self):
        self.client.logout()


class PersonAccessTests(TestCase):

    def setUp(self):
        self.person = create_person()

    def test_access_user(self):
        """
        verify we can access user records correctly as a super user
        """
        self.client.login(username=self.person.username, password=PASSWORD)
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.session['_auth_user_id'], str(self.person.id))

    def test_noaccess_user(self):
        """
        verify we can't acccess users as a normal user
        """
        self.client.login(username='noaccess_user', password='noaccess_password')
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, 403)


class PersonCreateTests(APITestCase):
    # Test: create, update, partial_update

    def setUp(self):
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

        self.ph_num_type = mommy.make(PhoneNumberType)

        # update for mock data
        self.data = {
            "id": str(uuid.uuid4()),
            "username":"one",
            "password":"one",
            "role": self.person.role.pk
        }

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        # Accepts a pre-created UUID, which is what Ember will do
        self.assertEqual(Person.objects.count(), 1)
        # simulate posting a Json Dict to create a new Person
        response = self.client.post('/api/admin/people/', self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Person.objects.count(), 2)
        person = Person.objects.get(username=self.data["username"])
        self.assertEqual(self.data['id'], str(person.id))

    def test_create_login_with_new_user(self):
        # Original User is logged In
        self.assertEqual(self.client.session['_auth_user_id'], str(self.person.pk))
        # Create
        response = self.client.post('/api/admin/people/', self.data, format='json')
        # Confirm all Users Logged out
        self.client.logout()
        with self.assertRaises(KeyError):
            self.client.session['_auth_user_id']
        # login with New User
        self.client.login(username=self.data['username'], password=self.data['password'])
        self.assertEqual(
            self.client.session['_auth_user_id'],
            str(Person.objects.get(username=self.data['username']).pk)
        )

    def test_create_no_password_in_response(self):
        response = self.client.post('/api/admin/people/', self.data, format='json')
        self.assertNotIn('password', response)

    def test_role_and_group(self):
        response = self.client.post('/api/admin/people/', self.data, format='json')
        person = Person.objects.last()
        self.assertIsInstance(person.role, Role)
        group = Group.objects.get(name=person.role.name)
        person_groups = person.groups.all()
        time.sleep(2) # needs this in order to no "falsley-fail" here
        self.assertIn(group, person_groups)


class PersonListTests(TestCase):

    def setUp(self):
        self.people = 10
        self.person = create_person(_many=self.people)
        # Login
        self.person1 = Person.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/people/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], self.people)

    def test_auth_amount(self):
        # make sure the custom key in ``person.helpers.update_auth_amount``
        # shows in the list data
        response = self.client.get('/api/admin/people/')
        data = json.loads(response.content)
        # First Result
        results = data['results'][0]
        self.assertIsNotNone(results['auth_amount'])
        self.assertEqual(results['auth_amount']['amount'], "{0:.4f}".format(self.person.auth_amount))
        self.assertEqual(results['auth_amount']['currency'], str(self.person.auth_amount_currency.id))


class PersonDetailTests(TestCase):

    def setUp(self):
        self.person = create_person()
        # contact info
        self.phone_number = mommy.make(PhoneNumber, person=self.person)
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.assertEqual(self.phone_number.person, self.person)

    def test_retrieve(self):
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        person = json.loads(response.content)
        self.assertEqual(person['username'], self.person.username)
        self.assertIsNotNone(person['phone_numbers'])


class PersonPutTests(APITestCase):
    '''
    All required Model fields must be supplied in a PUT, so the PASSWORD is 
    required if doing a PUT.

    Resolution: For Password changes, PUT is ok, but for all other Person 
    changes, a PATCH should be used, because User won't need to send Password.

    Note: For tests, use empty fields if not required for simplicity.
    '''

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.client.login(username=self.person.username, password=self.password)

        # PhoneNumber: create a `phone_number` which can be joined on the person
        # for a test nested create Person w/ PhoneNumber
        self.phone_number = mommy.make(PhoneNumber)
        self.email = mommy.make(Email)
        self.address = mommy.make(Email)

        self.data = {
            "id": str(self.person.id),
            "username": self.person.username,
            "first_name": "",
            "middle_initial": "",
            "last_name": "",
            "title": "",
            "employee_id": "",
            "auth_amount": self.person.auth_amount,
            "auth_amount": str(self.person.auth_amount_currency.id),
            "role": str(self.person.role.id),
            "status": str(self.person.status.id),
            "location":"",
            "phone_numbers":[
                {
                "id": str(self.phone_number.id),
                "type": str(self.phone_number.type.id),
                "location": "",
                "person": str(self.person.id),
                "number": self.phone_number.number
                }
            ]
        }

    def tearDown(self):
        self.client.logout()

    # def test_no_change(self):
    #     response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')
    #     self.assertEqual(response.status_code, 200)

    # def test_update_person(self):
    #     response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')


class PersonDeleteTests(APITestCase):
    '''
    Tests:
    - DestroyModelMixin
    '''
    def setUp(self):
        self.person = create_person()
        self.person2 = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_delete(self):
        people_all = Person.objects_all.count()
        # Init Person2
        self.assertIsNone(self.person2.deleted)
        self.assertEqual(self.client.session['_auth_user_id'], str(self.person.id))
        response = self.client.delete('/api/admin/people/{}/'.format(self.person2.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # get the Person Back, and check their deleted flag
        self.assertEqual(Person.objects_all.count(), people_all)
        self.assertEqual(Person.objects.count(), people_all-1)

    def test_delete_override(self):
        people = Person.objects.count()
        response = self.client.delete('/api/admin/people/{}/'.format(self.person.pk),
            {'override':True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Person.objects.count(), people-1)


# Password Tests to use later

    # def test_put_password_change(self):
    #     # test the User is currently logged in
    #     self.assertIn('_auth_user_id', self.client.session)
    #     # update their PW and see if they are still logged in
    #     password = 'new-password'
    #     person = PersonUpdateSerializer(self.person).data # returns a python dict
    #                                                        # serialized object
    #     # change a field on the Person to see if the PUT works!
    #     person.update({'password':password})
    #     response = self.client.put('/api/admin/people/{}/'.format(self.person.pk), person, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     # still logged in after PW change test
    #     self.assertIn('_auth_user_id', self.client.session)

    # def test_put_password_change_and_login(self):
    #     password = 'new'
    #     person = PersonUpdateSerializer(self.person).data
    #     person.update({'password':password})
    #     response = self.client.put('/api/admin/people/{}/'.format(self.person.pk), person, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.client.logout()
    #     self.assertNotIn('_auth_user_id', self.client.session)
    #     # Updated password works for logging in
    #     self.client.login(username=self.person.username, password=password)
    #     p = Person.objects.get(pk=self.person.pk)
    #     self.assertEqual(int(self.client.session['_auth_user_id']), p.pk)