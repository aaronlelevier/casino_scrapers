import json
import uuid
import sys
if sys.version_info > (2,7):
    str = unicode

from django.conf import settings
from django.test import TestCase, TransactionTestCase
from django.http import JsonResponse
from django.contrib.auth.models import User, ContentType, Group, Permission
from django.forms.models import model_to_dict

from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase
from model_mommy import mommy

from accounting.models import Currency, AuthAmount
from contact.models import Address, PhoneNumber, Email, PhoneNumberType
from contact.tests.factory import create_person_and_contacts
from location.models import Location, LocationLevel
from person.models import Person, Role, PersonStatus
from person.tests.factory import PASSWORD, create_person, create_role
from person.serializers import PersonUpdateSerializer
from util import create, choices


### ROLE ###

class RoleViewSetTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # LocationLevel
        self.location = mommy.make(Location)
        # Currency
        self.currency = Currency.objects.default()
        # Role
        self.role = self.person.role
        self.role.location_level = self.location.location_level
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
        self.assertEqual(roles[0]['location_level']['id'], str(self.location.location_level.id))

    def test_detail(self):
        response = self.client.get('/api/admin/roles/{}/'.format(self.role.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(data['id'], str(self.role.pk))
        self.assertEqual(data['location_level']['id'], str(self.location.location_level.id))

    def test_create(self):
        role_data = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "role_type": choices.ROLE_TYPE_CHOICES[0][0],
            "location_level": str(self.location.location_level.id)
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


class PersonListTests(TestCase):

    def setUp(self):
        self.people = 10
        self.person = create_person(_many=self.people)
        # Login
        self.person1 = Person.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)
        # List GET data
        self.response = self.client.get('/api/admin/people/')
        self.data = json.loads(self.response.content)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        self.assertEqual(self.response.status_code, 200)

    def test_count(self):
        self.assertEqual(self.data['count'], self.people)

    def test_status(self):
        self.assertTrue(self.data['results'][0]['status']['id'])

    def test_role(self):
        self.assertTrue(self.data['results'][0]['role']['id'])

    def test_auth_amount(self):
        results = self.data['results'][0]
        self.assertEqual(results['auth_amount']['amount'], "{0:.4f}".format(self.person.auth_amount.amount))
        self.assertEqual(results['auth_amount']['currency'], str(self.person.auth_amount.currency.id))


class PersonDetailTests(TestCase):

    def setUp(self):
        self.person = create_person()
        # Contact info
        create_person_and_contacts(self.person)
        # Location
        self.location = mommy.make(Location)
        self.person.location = self.location
        self.person.save()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)
        # GET data
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.data = json.loads(response.content)

    def tearDown(self):
        self.client.logout()

    def test_retrieve(self):
        self.assertEqual(self.data['username'], self.person.username)

    def test_location(self):
        self.assertTrue(self.data['location'])
        location = Location.objects.get(id=self.data['location']['id'])
        self.assertIsInstance(location, Location)

    def test_emails(self):
        self.assertTrue(self.data['emails'])
        email = Email.objects.get(id=self.data['emails'][0]['id'])
        self.assertIsInstance(email, Email)

    def test_phone_numbers(self):
        self.assertTrue(self.data['phone_numbers'])
        ph = PhoneNumber.objects.get(id=self.data['phone_numbers'][0]['id'])
        self.assertIsInstance(ph, PhoneNumber)

    def test_addresses(self):
        self.assertTrue(self.data['addresses'])
        address = Address.objects.get(id=self.data['addresses'][0]['id'])
        self.assertIsInstance(address, Address)

    def test_auth_amount(self):
        self.assertEqual(self.data['auth_amount']['amount'], "{0:.4f}".format(self.person.auth_amount.amount))
        self.assertEqual(self.data['auth_amount']['currency'], str(self.person.auth_amount.currency.id))

    def test_person_fk(self):
        # Person FK should be in the nested contact records, so
        # Ember can more easily push it into the Ember Store
        person = Person.objects.get(id=self.data['phone_numbers'][0]['person'])
        self.assertIsInstance(person, Person)


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
        # AuthAmount
        self.auth_amount = AuthAmount.objects.default()
        # Create ``contact.Model`` Objects not yet JOINed to a ``Person`` or ``Location``
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
            "auth_amount": {
                "id": str(self.auth_amount.id),
                "amount": "{0:.4f}".format(self.person.auth_amount.amount),
                "currency": str(self.person.auth_amount.currency.id)
            },
            "role": str(self.person.role.id),
            "status": str(self.person.status.id),
            "location":"",
            "emails":[],
            "phone_numbers":[],
            "addresses":[]
        }

    def tearDown(self):
        self.client.logout()

    def test_auth_amount(self):
        new_auth_amount = '1234.1010'
        self.data['auth_amount']['amount'] = new_auth_amount
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')
        data = json.loads(response.content)
        self.assertEqual(new_auth_amount, data['auth_amount']['amount'])

    def test_no_change(self):
        # Confirm the ``self.data`` structure is correct
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_update_person(self):
        new_title = "new_title"
        self.assertNotEqual(new_title, self.data['title'])
        self.data['title'] = new_title
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')
        data = json.loads(response.content)
        self.assertEqual(new_title, data['title'])

    def test_location(self):
        location = mommy.make(Location)
        self.data['location'] = str(location.id)
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')
        data = json.loads(response.content)
        self.assertTrue(data['location'])
        self.assertEqual(Person.objects.get(id=self.data['id']).location, location)

    def test_update_email_add_to_person(self):
        self.assertFalse(self.data['emails'])
        self.data['emails'] = [{
            'id': str(self.email.id),
            'type': str(self.email.type.id),
            'email': self.email.email
        }]
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')
        data = json.loads(response.content)
        self.assertTrue(data['emails'])
        self.assertEqual(
            self.person,
            Email.objects.get(id=data['emails'][0]['id']).person
        )

    def test_update_person_and_create_phone_number(self):
        self.assertFalse(self.data['phone_numbers'])
        self.data['phone_numbers'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.phone_number.type.id),
            'number': create._generate_ph()
        }]
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id), self.data, format='json')
        data = json.loads(response.content)
        self.assertTrue(data['phone_numbers'])
        self.assertEqual(
            self.person,
            PhoneNumber.objects.get(id=data['phone_numbers'][0]['id']).person
        )


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


class PersonsearchTests(TestCase):

    def setUp(self):
        # Role
        self.role = create_role()
        self.person = create_person()
        # Person Records w/ specific Username
        for i in range(15):
            name = "wat"+create._generate_chars()
            Person.objects.create_user(name, 'myemail@mail.com', PASSWORD,
                first_name=name, role=self.role)
            
        self.people = Person.objects.count()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_ordering_first_name(self):
        response = self.client.get('/api/admin/people/?ordering=first_name')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(
            data['results'][0]['first_name'],
            Person.objects.order_by('first_name').first().first_name
            )
        # Reverse Order: ``-first_name``('/api/admin/people/?ordering=-first_name')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['first_name'],
            Person.objects.order_by('-first_name').first().first_name
            )

    def test_ordering_first_name_page(self):
        response = self.client.get('/api/admin/people/?page=2&ordering=first_name')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        paginate_by = settings.REST_FRAMEWORK['PAGINATE_BY']
        self.assertEqual(len(data['results']), self.people - paginate_by)

    def test_ordering_first_name_page_search(self):
        # setup
        auth_amount = AuthAmount.objects.first()
        role = mommy.make(Role, default_auth_amount=auth_amount, name='toran')
        people = 15
        for i in range(people):
            Person.objects.create_user(create._generate_chars(), 'myemail@mail.com',
                PASSWORD, first_name=create._generate_chars(), role=role)
        # Test
        response = self.client.get('/api/admin/people/?page=2&ordering=first_name&search=toran')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            len(data['results']),
            people - settings.REST_FRAMEWORK['PAGINATE_BY']
            )




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