import json
import uuid

from django.test import TestCase, TransactionTestCase
from django.http import JsonResponse
from django.contrib.auth.models import User, ContentType, Group, Permission
from django.forms.models import model_to_dict

from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase
from model_mommy import mommy

from contact.models import Address, PhoneNumber, Email, PhoneNumberType
from location.models import Location
from person.models import Person, Role, PersonStatus
from person.tests.factory import PASSWORD, create_person, create_role
from person.serializers import PersonUpdateSerializer
from util import create


class PersonAuthTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.client.login(username=self.person.username, password=self.password)

    def test_login(self):
        self.assertIn('_auth_user_id', self.client.session)

    def tearDown(self):
        self.client.logout()


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
        self.assertEqual(self.client.session['_auth_user_id'], str(self.person.id))

    def test_noaccess_user(self):
        """
        verify we can't acccess users as a normal user
        """
        self.client.login(username='noaccess_user', password='noaccess_password')
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, 403)


class PersonCreateTests(APITransactionTestCase):
    # Test: create, update, partial_update

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.client.login(username=self.person.username, password=self.password)

        self.ph_num_type = mommy.make(PhoneNumberType)

        # update for mock data
        self.data = {
            "id": uuid.uuid4(),
            "username":"one",
            "password":"one",
            "first_name":"foo",
            "last_name":"bar",
            "role": self.person.role.pk,
            "status":"",
            "location":"",
            "phone_numbers":[
                {
                "id": uuid.uuid4(),
                "type": self.ph_num_type.pk,
                "location": "",
                "person": "",
                "number": create._generate_ph()
                }
            ],
        }

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        # Accepts a pre-created UUID, which is what Ember will do
        self.assertEqual(PhoneNumber.objects.count(), 0)
        self.assertEqual(Person.objects.count(), 1)
        # simulate posting a Json Dict to create a new Person
        _uuid = uuid.uuid4()
        self.data['id'] = str(_uuid)
        response = self.client.post('/api/admin/people/', self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Person.objects.count(), 2)
        self.assertEqual(PhoneNumber.objects.count(), 1)
        person = Person.objects.get(username=self.data["username"])
        self.assertEqual(str(_uuid), str(person.id))

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
        self.role = create_role()
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
    '''
    All required Model fields must be supplied in a PUT, so the PASSWORD is 
    required if doing a PUT.

    Resolution: For Password changes, PUT is ok, but for all other Person 
    changes, a PATCH should be used, because User won't need to send Password.
    '''

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

        self.data = {
            "username":"one",
            "password":"one",
            "first_name":"foo",
            "last_name":"bar",
            "role": self.person.role.pk,
            "status":"",
            "location":"",
            "phone_numbers":[],
            'addresses': []
        }

    def tearDown(self):
        self.client.logout()

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

    # def test_two_related(self):
    #     # Test creating a single Person w/ PhoneNumber and Address
    #     # nested creates
    #     self.assertEqual(Person.objects.count(), 1)
    #     self.assertEqual(Address.objects.exclude(person__isnull=True).count(), 0)
    #     # simulate posting a Json Dict to create a new Person
    #     self.data.update({
    #         'phone_numbers': [
    #             model_to_dict(self.phone_number),
    #             model_to_dict(self.phone_number2)
    #             ],
    #         'addresses': [model_to_dict(self.address)]
    #         })
    #     print self.data
    #     response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #     self.assertEqual(Person.objects.count(), 2)
    #     # Last Person Created: check related objects
    #     last_person = Person.objects.last()
    #     self.assertEqual(PhoneNumber.objects.filter(person=last_person).count(), 2)
    #     self.assertEqual(Address.objects.filter(person=last_person).count(), 1)


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
        people = Person.objects_all.count()
        # Init Person2
        self.assertIsNone(self.person2.deleted)
        self.assertEqual(self.client.session['_auth_user_id'], str(self.person.id))
        response = self.client.delete('/api/admin/people/{}/'.format(self.person2.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # get the Person Back, and check their deleted flag
        self.assertEqual(Person.objects_all.count(), people)
        self.assertEqual(Person.objects.count(), people-1)

    def test_delete_override(self):
        init_count = Person.objects.count()
        response = self.client.delete('/api/admin/people/{}/'.format(self.person.pk),
            {'override':True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Person.objects.count(), init_count-1)
        

class RoleViewSetTests(TestCase):

    def setUp(self):
        self.role = create_role()
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
