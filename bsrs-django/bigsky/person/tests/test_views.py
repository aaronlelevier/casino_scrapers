import json
import uuid
import copy
import random

from django.test import TestCase
from django.db.models.functions import Lower

from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase
from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from contact.models import (Address, AddressType, Email, EmailType,
    PhoneNumber, PhoneNumberType)
from contact.tests.factory import create_contact, create_contacts
from location.models import Location, LocationLevel
from person.models import Person, Role
from person.serializers import (PersonUpdateSerializer, RoleSerializer,
    RoleUpdateSerializer)
from person.tests.factory import (
    PASSWORD, create_person, create_role, create_roles, create_single_person,
    create_all_people)
from translation.models import Locale
from translation.tests.factory import create_locales
from utils import create, choices


### ROLE ###

class RoleViewSetTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # LocationLevel
        self.location = mommy.make(Location)
        # Category
        self.categories = mommy.make(Category, _quantity=2)
        # Currency
        self.currency = Currency.objects.default()
        # Role
        self.role = self.person.role
        self.role.location_level = self.location.location_level
        self.role.categories = self.categories
        self.role.save()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)
        # data
        serializer = RoleSerializer(self.role)
        self.data = serializer.data

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/roles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        roles = data['results']
        self.assertEqual(roles[0]['id'], str(self.role.pk))
        self.assertEqual(roles[0]['location_level'], str(self.location.location_level.id))

    def test_detail(self):
        response = self.client.get('/api/admin/roles/{}/'.format(self.role.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.role.pk))
        self.assertEqual(data['location_level'], str(self.location.location_level.id))
        self.assertIn(data['categories'][0]['id'], [str(c.id) for c in self.categories])

    def test_create(self):
        role_data = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "role_type": choices.ROLE_TYPE_CHOICES[0][0],
            "location_level": str(self.location.location_level.id)
        }
        response = self.client.post('/api/admin/roles/', role_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], role_data['id'])
        self.assertIsInstance(Role.objects.get(id=role_data['id']), Role)

    def test_update(self):
        category = mommy.make(Category)
        serializer = RoleUpdateSerializer(self.role)
        self.data = serializer.data
        role_data = self.data
        role_data['name'] = 'new name here'
        role_data['categories'].append(str(category.id))
        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            role_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        new_role_data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.role.name, new_role_data['name'])
        self.assertIn(
            category.id,
            Role.objects.get(id=self.data['id']).categories.values_list('id', flat=True)
            )

    def test_update_location_level(self):
        role_data = copy.copy(self.data)
        role_data['location_level'] = str(mommy.make(LocationLevel).id)
        self.assertNotEqual(
            self.data['location_level'],
            role_data['location_level']
        )
        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            role_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        new_role_data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            role_data['location_level'],
            str(Role.objects.get(id=self.data['id']).location_level.id)
        )


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
        # verify we can access user records correctly as a super user
        self.client.login(username=self.person.username, password=PASSWORD)
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.session['_auth_user_id'], str(self.person.id))

    def test_noaccess_user(self):
        # verify we can't acccess users as a normal user
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

    def test_password_not_in_response(self):
        response = self.client.post('/api/admin/people/', self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn('password', data)


class PersonListTests(TestCase):

    def setUp(self):
        self.people = 10
        self.person = create_person(_many=self.people)
        # Login
        self.person1 = Person.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)
        # List GET data
        self.response = self.client.get('/api/admin/people/')
        self.data = json.loads(self.response.content.decode('utf8'))

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        self.assertEqual(self.response.status_code, 200)

    def test_status(self):
        self.assertTrue(self.data['results'][0]['status']['id'])

    def test_role(self):
        self.assertTrue(self.data['results'][0]['role'])
        self.assertIsInstance(Role.objects.get(id=self.data['results'][0]['role']), Role)

    def test_auth_amount(self):
        results = self.data['results'][0]
        self.assertEqual(results['auth_amount'], "{0:.4f}".format(self.person.auth_amount))
        self.assertEqual(results['auth_currency'], str(self.person.auth_currency.id))

    def test_max_paginate_by_default(self):
        response = self.client.get('/api/admin/people/')
        data = json.loads(self.response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.count())

    def test_max_paginate_by_page_size(self):
        number = 1
        response = self.client.get('/api/admin/people/?page_size={}'.format(number))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['results']), number)

    def test_password_not_in_response(self):
        self.assertNotIn('password', self.data)


class PersonDetailTests(TestCase):

    def setUp(self):
        self.person = create_person()
        # Contact info
        create_contacts(self.person)
        # Location
        self.location = mommy.make(Location, location_level=self.person.role.location_level)
        self.person.locations.add(self.location)
        # Locale
        create_locales()
        self.locale = Locale.objects.first()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)
        # GET data
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        self.data = json.loads(response.content.decode('utf8'))

    def tearDown(self):
        self.client.logout()

    def test_retrieve(self):
        self.assertEqual(self.data['username'], self.person.username)

    def test_role(self):
        self.assertIsInstance(Role.objects.get(id=self.data['role']), Role)

    def test_locale(self):
        # setup
        self.assertFalse(self.data['locale'])
        self.person.locale = self.locale
        self.person.save()
        # test
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['locale'], str(self.person.locale.id))

    def test_location(self):
        self.assertTrue(self.data['locations'])
        location = Location.objects.get(id=self.data['locations'][0]['id'])
        location_level = LocationLevel.objects.get(id=self.data['locations'][0]['location_level']['id'])
        self.assertIsInstance(location, Location)
        self.assertIsInstance(location_level, LocationLevel)

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
        self.assertEqual(self.data['auth_amount'], "{0:.4f}".format(self.person.auth_amount))
        self.assertEqual(self.data['auth_currency'], str(self.person.auth_currency.id))

    def test_person_fk(self):
        self.assertIn(
            self.data['phone_numbers'][0]['id'],
            [str(x) for x in self.person.phone_numbers.values_list('id', flat=True)]
        )

    def test_password_not_in_response(self):
        self.assertNotIn('password', self.data)
    
    ### DETAIL ROUTES

    def test_current(self):
        # 'self.person' is the currently logged in 'Person'
        response = self.client.get('/api/admin/people/current/'.format(self.person.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.person.id))


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
        self.person = create_single_person(name="aaron")
        self.client.login(username=self.person.username, password=self.password)
        # Create ``contact.Model`` Objects not yet JOINed to a ``Person`` or ``Location``
        self.email_type = mommy.make(EmailType)
        self.address_type = mommy.make(AddressType)
        self.phone_number_type = mommy.make(PhoneNumberType)
        # Locale
        create_locales()
        self.locale = Locale.objects.first()

        # Person2 w/ some contact info doesn't affect Person1's Contact
        # counts / updates / deletes
        self.person2 = create_person()
        create_contacts(self.person2)

        serializer = PersonUpdateSerializer(self.person)
        self.data = serializer.data

    def tearDown(self):
        self.client.logout()

    def test_auth_amount(self):
        new_auth_amount = '1234.1010'
        self.data['auth_amount'] = new_auth_amount
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(new_auth_amount, data['auth_amount'])

    def test_no_change(self):
        # Confirm the ``self.data`` structure is correct
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_update_person(self):
        new_title = "new_title"
        self.assertNotEqual(new_title, self.data['title'])
        self.data['title'] = new_title
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(new_title, data['title'])

    def test_update_middle_initial(self):
        self.assertFalse(self.data['middle_initial'])
        self.data['middle_initial'] = 'Y'
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(self.data['middle_initial'], data['middle_initial'])

    def test_locale(self):
        # setup
        self.assertFalse(self.data['locale'])
        self.data['locale'] = str(self.locale.id)
        # test
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['locale'], str(self.locale.id))

    def test_password_not_in_response(self):
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn('password', data)

    def test_change_password(self):
        new_password = 'new_password'
        self.data['password'] = new_password
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        self.client.logout()
        with self.assertRaises(KeyError):
            self.client.session['_auth_user_id']
        # login with 'new_password"'
        self.client.login(username=self.data['username'], password=new_password)
        self.assertEqual(
            self.client.session['_auth_user_id'],
            str(Person.objects.get(username=self.data['username']).pk)
        )

    def test_change_password_other_persons_password(self):
        
        serializer = PersonUpdateSerializer(self.person2)
        self.data = serializer.data

        new_password = 'new_password'
        self.data['password'] = new_password
        response = self.client.put('/api/admin/people/{}/'.format(self.person2.id),
            self.data, format='json')
        self.client.logout()
        with self.assertRaises(KeyError):
            self.client.session['_auth_user_id']
        # login with 'new_password"'
        self.client.login(username=self.data['username'], password=new_password)
        self.assertEqual(
            self.client.session['_auth_user_id'],
            str(Person.objects.get(username=self.data['username']).pk)
        )

    ### LOCATIONS

    def test_location_level_equal_init_role(self):
        location = mommy.make(Location, location_level=self.person.role.location_level)
        self.data['locations'].append(str(location.id))
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(str(location.id), [l for l in data['locations']])

    def test_location_level_not_equal_init_role(self):
        # create separate LocationLevel
        location_level = mommy.make(LocationLevel)
        location = mommy.make(Location, location_level=location_level)
        self.assertNotEqual(self.person.role.location_level, location_level)
        # Adding a non authorized LocationLevel Location raises an error
        self.data['locations'].append(str(location.id))
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertNotIn(
            location.id,
            Person.objects.get(id=self.data['id']).locations.values_list('id', flat=True)
            )

    def test_location_level_equal_new_role(self):
        # create separate LocationLevel
        location_level = mommy.make(LocationLevel)
        new_role = mommy.make(Role, name='new', location_level=location_level)
        location = mommy.make(Location, location_level=location_level)
        self.assertNotEqual(self.person.role.location_level, location_level)
        # Adding a LocationLevel that matches the new Role's LocationLevel is fine
        self.data['role'] = str(new_role.id)
        self.data['locations'].append(str(location.id))
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['locations'])
        self.assertIn(
            location.id,
            Person.objects.get(id=self.data['id']).locations.values_list('id', flat=True)
            )

    def test_location_level_not_equal_new_role(self):
        location = mommy.make(Location, location_level=self.person.role.location_level)
        self.data['locations'].append(str(location.id))
        # Assign new Role w/ a different LocationLevel
        location_level = mommy.make(LocationLevel)
        new_role = mommy.make(Role, name='new', location_level=location_level)
        self.data['role'] = str(new_role.id)
        # Adding a non authorized LocationLevel Location raises an error
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertNotIn(
            location.id,
            Person.objects.get(id=self.data['id']).locations.values_list('id', flat=True)
            )


    ### RELATED CONTACT MODELS

    # EMAILS

    def test_update_email_add_to_person(self):
        [e.delete(override=True) for e in self.person.emails.all()]
        self.assertFalse(self.data['emails'])
        self.data['emails'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.email_type.id),
            'email': 'mail@mail.com',
        }]
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['emails'])
        self.assertIn(
            data['emails'][0]['id'],
            [str(x) for x in self.person.emails.values_list('id', flat=True)]            
        )

    def test_update_email_type(self):
        email = create_contact(Email, self.person)
        email_type_two = mommy.make(EmailType)
        self.assertNotEqual(email.type.id, email_type_two.id)
        self.data['emails'] = [{
            'id': str(email.id),
            'type': str(email_type_two.id),
            'email': email.email,
        }]
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['emails'])
        self.assertEqual(data['emails'][0]['type'], str(email_type_two.id))

    # ADDRESSES

    def test_update_person_and_create_address(self):
        address_id = str(uuid.uuid4())
        self.data['addresses'] = [{
            'id': address_id,
            'type': str(self.address_type.id),
            'address': '123 My St.',
        }]
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['addresses'])
        self.assertIn(
            data['addresses'][0]['id'],
            [str(x) for x in self.person.addresses.values_list('id', flat=True)]
        )

    # PHONE NUMBERS

    def test_update_person_and_create_phone_number(self):
        self.assertFalse(self.data['phone_numbers'])
        self.data['phone_numbers'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.phone_number_type.id),
            'number': create._generate_ph(),
        }]
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['phone_numbers'])
        self.assertIn(
            data['phone_numbers'][0]['id'],
            [str(x) for x in self.person.phone_numbers.values_list('id', flat=True)]
        )

    def test_missing_contact_models(self):
        # If a nested Contact Model is no longer present, then delete 
        # Person FK on Contact Nested Model
        create_contacts(self.person)
        # Post standard data w/o contacts
        self.data["emails"] = []
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        # Nested Contacts should be empty!
        self.assertFalse(self.person.emails.all())

    def test_missing_contact_models_partial(self):
        # Test delete only one
        self.data['phone_numbers'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.phone_number_type.id),
            'number': create._generate_ph(),
        }]
        self.data["emails"] = []
        # Post standard data w/o contacts
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['phone_numbers'])
        # Nested Contacts should be empty!
        self.assertTrue(self.person.phone_numbers.all())
        self.assertFalse(self.person.emails.all())

    def test_update_middle_initial(self):
        self.assertFalse(self.data['middle_initial'])
        self.data['middle_initial'] = 'Y'
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(self.data['middle_initial'], data['middle_initial'])


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
        # initial
        people = Person.objects_all.count()
        self.assertIsInstance(Person.objects_all.get(id=self.person2.id), Person)
        # delete
        response = self.client.delete('/api/admin/people/{}/'.format(self.person2.pk),
            {'override':True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Person.objects_all.count(), people-1)
        # DB Fails
        with self.assertRaises(Person.DoesNotExist):
            Person.objects_all.get(id=self.person2.id)


class PersonSearchTests(APITransactionTestCase):

    def setUp(self):
        self.role = create_role()
        create_all_people()
        # Login
        self.person = None
        while not self.person:
            try:
                self.person = Person.objects.get(username='aaron')
            except Person.DoesNotExist:
                pass
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_search(self):
        letters = "aa"
        users_count = Person.objects.filter(username__icontains=letters).count()
        self.assertEqual(users_count, 1)
        response = self.client.get('/api/admin/people/?search={}'.format(letters))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], users_count)

    def test_search_multiple(self):
        mommy.make(Person, username="Bob", role=self.role)
        mommy.make(Person, username="Bobby", role=self.role)
        letters = "bob"
        users_count = Person.objects.filter(username__icontains=letters).count()
        self.assertEqual(users_count, 2)
        response = self.client.get('/api/admin/people/?search={}'.format(letters))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], users_count)


class PersonSearchOrderingTests(APITransactionTestCase):

    def setUp(self):
        # Role
        self.role = create_role()
        # Person Records w/ specific Username
        for i in range(15):
            name = self._get_name(i)
            Person.objects.create_user(name, 'myemail@mail.com', PASSWORD,
                first_name=name, role=self.role)
            
        self.people = Person.objects.count()
        # Login
        self.person = Person.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    @staticmethod
    def _get_name(record):
        # Generate regarless of letter case name/username function 
        # for "ordering" tests
        if record % 2 == 0:
            return "wat{}".format(chr(65+record))
        else:
            return "Wat{}".format(chr(65+record))

    def test_default_ordering(self):
        # Should start with ID Ascending order
        response = self.client.get('/api/admin/people/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['id'],
            str(Person.objects.first().id)
            )

    def test_ordering_first_name_data(self):
        response = self.client.get('/api/admin/people/?ordering=first_name')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        record = 0
        self.assertEqual(data['results'][record]['first_name'], self._get_name(record))

    def test_ordering_first_name_data_reverse(self):
        response = self.client.get('/api/admin/people/?ordering=-first_name')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['first_name'],
            Person.objects.order_by(Lower('first_name')).reverse().first().first_name
            )

    def test_second_page(self):
        response = self.client.get('/api/admin/people/?page=2')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['results']), 5)

    def test_ordering_second_page_ordering(self):
        # 11th Person, should be the 1st Person on Page=2
        response = self.client.get('/api/admin/people/?page=2&ordering=first_name')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['results'][0]['first_name'], self._get_name(10))

    def test_ordering_first_page_ordering_reverse(self):
        # The last name on the last page in descending order should
        # be the first record in normal ascending order
        response = self.client.get('/api/admin/people/?ordering=-first_name&page=2')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['results'][-1]['first_name'], self._get_name(0))

    def test_ordering_first_name_page_search(self):
        response = self.client.get('/api/admin/people/?page=2&ordering=first_name&search=wat')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['results'][0]['first_name'], self._get_name(10))


class FilterByFieldTests(APITransactionTestCase):

    def setUp(self):
        self.roles = create_roles()
        self.role = self.roles[0]
        for role in self.roles:
            create_single_person(
                name=random.choice(create.LOREM_IPSUM_WORDS.split()),
                role=role
            )
        # Login User
        self.person = create_single_person(name="aaron", role=self.role)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    # FIELDS

    def test_field(self):
        username = self.person.username
        response = self.client.get('/api/admin/people/?username={}'.format(username))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(username=username).count())

    def test_field_with_arg(self):
        letter = 'T'
        response = self.client.get('/api/admin/people/?fullname__contains={}'
            .format(letter))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Person.objects.filter(fullname__contains=letter).count()
        )

    # RELATED

    def test_related_field(self):
        response = self.client.get('/api/admin/people/?role__name={}'.format(self.role.name))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(role__name=self.role.name).count())

    def test_related_field_with_arg(self):
        response = self.client.get('/api/admin/people/?role__name__icontains={}'
            .format(self.role.name[0]))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Person.objects.filter(role__name__icontains=self.role.name[0]).count()
        )

    def test_related_id_in(self):
        response = self.client.get('/api/admin/people/?role__id__in={}'.format(self.role.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Person.objects.filter(role__id__in=[self.role.id]).count()
        )

    def test_related_id_in_multiple(self):
        response = self.client.get('/api/admin/people/?role__id__in={},{}'
            .format(self.roles[0].id, self.roles[1].id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Person.objects.filter(role__id__in=[self.roles[0].id, self.roles[1].id]).count()
        )

    # IN

    def test_in_single(self):
        letter = self.person.username[0]
        response = self.client.get('/api/admin/people/?username__in={}'.format(letter))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(username__in=[letter]).count())

    def test_in_multiple(self):
        # Setup
        people = Person.objects.all()
        a = people[0].username
        b = people[1].username
        usernames = "{},{}".format(a,b)
        # Test
        response = self.client.get('/api/admin/people/?username__in={}'.format(usernames))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(username__in=[a,b]).count())

    def test_in_single_uuid(self):
        response = self.client.get('/api/admin/people/?id__in={}'.format(self.person.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(id__in=[self.person.id]).count())

    def test_in_multiple_uuid(self):
        people = Person.objects.all()
        a = people[0]
        b = people[1]
        response = self.client.get('/api/admin/people/?id__in={},{}'.format(a.id, b.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(id__in=[a.id, b.id]).count())



class PasswordTests(APITestCase):

    def setUp(self):
        self.roles = create_roles()
        self.role = self.roles[0]
        self.person = create_single_person(name="aaron", role=self.role)
        self.person2 = create_single_person()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    ### ``reset_password``

    def test_get_object_or_404(self):
        data = {
            'new_password1': 'foo',
            'new_password2': 'bar'
        }
        response = self.client.post("/api/admin/people/reset-password/{}/"
            .format(uuid.uuid4()), data, format='json')
        self.assertEqual(response.status_code, 404)

    def test_validate_passwords_match(self):
        data = {
            'new_password1': 'foo',
            'new_password2': 'bar'
        }
        response = self.client.post("/api/admin/people/reset-password/{}/"
            .format(self.person.id), data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_reset_password(self):
        new_password = 'new_password'
        data = {
            'new_password1': new_password,
            'new_password2': new_password
        }
        response = self.client.post("/api/admin/people/reset-password/{}/".format(self.person.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)

        # # login under new password
        self.client.logout()
        self.client.login(username=self.person.username, password=new_password)
        self.assertIn('_auth_user_id', self.client.session)

    def test_reset_password_other_persons(self):
        new_password = 'new_password'
        data = {
            'new_password1': new_password,
            'new_password2': new_password
        }
        response = self.client.post("/api/admin/people/reset-password/{}/".format(self.person2.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)

        # # login under new password
        self.client.logout()
        self.client.login(username=self.person2.username, password=new_password)
        self.assertIn('_auth_user_id', self.client.session)
