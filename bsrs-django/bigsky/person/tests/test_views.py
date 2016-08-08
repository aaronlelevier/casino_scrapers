import copy
import json
import uuid

from django.conf import settings
from django.contrib.auth.models import ContentType
from django.test import TestCase

from model_mommy import mommy
from rest_framework.test import APITestCase, APITransactionTestCase

from accounting.models import Currency
from category.models import Category
from contact.models import (Address, AddressType, Email, EmailType,
    PhoneNumber, PhoneNumberType)
from contact.tests.factory import create_contact, create_contacts
from location.models import Location, LocationLevel
from location.tests.factory import create_location
from person import config as person_config
from person.models import Person, Role, PersonStatus
from person.serializers import PersonUpdateSerializer, RoleUpdateSerializer
from person.tests.factory import (PASSWORD, create_single_person, create_role, create_roles,
    create_all_people, create_person_statuses)
from person.tests.mixins import RoleSetupMixin
from translation.models import Locale
from translation.tests.factory import create_locale, create_locales
from utils import create
from utils.tests.test_helpers import create_default


### ROLE ###

class RoleListTests(RoleSetupMixin, APITestCase):

    def test_list(self):
        response = self.client.get('/api/admin/roles/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        role = data['results'][0]
        self.assertEqual(role['id'], str(self.role.pk))
        self.assertEqual(role['name'], self.role.name)
        self.assertEqual(role['role_type'], self.role.role_type)
        self.assertEqual(role['location_level'], str(self.location.location_level.id))

    def test_search(self):
        role = create_role()
        self.assertEqual(Role.objects.count(), 2)

        response = self.client.get('/api/admin/roles/?search={}'.format(role.name))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)


class RoleDetailTests(RoleSetupMixin, APITestCase):

    def test_detail(self):
        response = self.client.get('/api/admin/roles/{}/'.format(self.role.pk))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.role.pk))
        self.assertEqual(data['name'], self.role.name)
        self.assertEqual(data['role_type'], self.role.role_type)
        self.assertEqual(data['location_level'], str(self.location.location_level.id))
        self.assertEqual(data['auth_amount'], "{:.4f}".format(self.role.auth_amount))
        self.assertEqual(data['auth_currency'], None)
        self.assertNotIn('dashboard_text', data)
        self.assertNotIn('accept_assign', data)
        self.assertNotIn('accept_notify', data)
        self.assertIn(
            data['categories'][0]['id'],
            [str(c.id) for c in self.role.categories.all()]
        )
        self.assertIn('name', data['categories'][0])
        self.assertNotIn('status', data['categories'][0])
        self.assertNotIn('parent', data['categories'][0])

    def test_detail__inherited(self):
        self.role.dashboard_text = 'foo'
        self.role.auth_currency = mommy.make(Currency, code="FOO")
        self.role.save()
        response = self.client.get('/api/admin/roles/{}/'.format(self.role.pk))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        # dashboard_text
        self.assertEqual(data['inherited']['dashboard_text']['value'], self.role.dashboard_text)
        self.assertEqual(data['inherited']['dashboard_text']['inherited_value'], self.role.tenant.dashboard_text)
        self.assertEqual(data['inherited']['dashboard_text']['inherits_from'], 'tenant')
        self.assertEqual(data['inherited']['dashboard_text']['inherits_from_id'], str(self.role.tenant.id))
        # auth_currency
        self.assertEqual(data['inherited']['auth_currency']['value'], str(self.role.auth_currency.id))
        self.assertEqual(data['inherited']['auth_currency']['inherited_value'], str(self.role.tenant.default_currency.id))
        self.assertEqual(data['inherited']['auth_currency']['inherits_from'], 'tenant')
        self.assertEqual(data['inherited']['auth_currency']['inherits_from_id'], str(self.role.tenant.id))


class RoleCreateTests(RoleSetupMixin, APITestCase):

    def setUp(self):
        super(RoleCreateTests, self).setUp()

        currency = mommy.make(Currency, code='foo')
        self.role_data = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "role_type": person_config.ROLE_TYPES[0],
            "location_level": str(self.location.location_level.id),
            "categories": self.role.categories_ids,
            "auth_amount": 123,
            "auth_currency": str(currency.id),
            "dashboard_text": "foo"
        }

    def test_main(self):
        response = self.client.post('/api/admin/roles/', self.role_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.role_data['id'])
        self.assertEqual(data['name'], self.role_data['name'])
        self.assertEqual(data['role_type'], self.role_data['role_type'])
        self.assertEqual(data['location_level'], self.role_data['location_level'])
        self.assertEqual(data['auth_amount'], "{:.4f}".format(self.role_data['auth_amount']))
        self.assertEqual(data['auth_currency'], self.role_data['auth_currency'])
        self.assertEqual(data['dashboard_text'], self.role_data['dashboard_text'])
        self.assertFalse(data['accept_assign'])
        self.assertFalse(data['accept_notify'])
        self.assertEqual(sorted(data['categories']), sorted(self.role_data['categories']))

    def test_new_roles_tenant_set_to_logged_in_users_tenant(self):
        response = self.client.post('/api/admin/roles/', self.role_data, format='json')

        role = Role.objects.get(id=self.role_data['id'])
        self.assertEqual(role.tenant, self.person.role.tenant)


class RoleUpdateTests(RoleSetupMixin, APITestCase):

    def setUp(self):
        super(RoleUpdateTests, self).setUp()
        self.data = RoleUpdateSerializer(self.role).data

    def test_update(self):
        category = mommy.make(Category)
        role_data = self.data
        role_data['name'] = 'new name here'
        role_data['auth_currency'] = str(mommy.make(Currency, code='FOO').id)
        role_data['dashboard_text'] = 'foo'
        role_data['categories'].append(str(category.id))
        role_data['accept_assign'] = True
        role_data['accept_notify'] = True

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            role_data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.role.id))
        self.assertEqual(data['name'], role_data['name'])
        self.assertEqual(data['role_type'], self.role.role_type)
        self.assertEqual(data['location_level'], str(self.role.location_level.id))
        self.assertEqual(data['auth_amount'], "{:.4f}".format(self.role.auth_amount))
        self.assertEqual(data['auth_currency'], role_data['auth_currency'])
        self.assertEqual(data['dashboard_text'], role_data['dashboard_text'])
        self.assertTrue(data['accept_assign'])
        self.assertTrue(data['accept_notify'])
        self.assertIsInstance(data['categories'], list)

    def test_update__location_level(self):
        role_data = copy.copy(self.data)
        role_data['location_level'] = str(mommy.make(LocationLevel).id)
        self.assertNotEqual(
            self.data['location_level'],
            role_data['location_level']
        )

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            role_data, format='json')

        self.assertEqual(response.status_code, 200)
        new_role_data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            role_data['location_level'],
            str(Role.objects.get(id=self.data['id']).location_level.id)
        )


class RoleRouteDataTests(RoleSetupMixin, APITestCase):

    def test_settings_data(self):
        response = self.client.get('/api/admin/roles/route-data/new/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data), 1)
        self.assertEqual(
            data['settings'],
            {'dashboard_text': self.tenant.dashboard_text}
        )


### PERSON ###

class PersonAccessTests(TestCase):

    def setUp(self):
        create_person_statuses()
        self.person = create_single_person()

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
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        create_default(PersonStatus)
        self.ph_num_type = mommy.make(PhoneNumberType)
        self.locale = create_locale('foo')

        # update for mock data
        self.data = {
            "id": str(uuid.uuid4()),
            "username": "one",
            "first_name": "foo",
            "middle_initial": "a",
            "last_name": "bar",
            "password": PASSWORD,
            "role": self.person.role.pk,
            "locale": str(self.locale.id)
        }

    def tearDown(self):
        self.client.logout()

    def test_data(self):
        self.assertEqual(Person.objects.count(), 1)

        response = self.client.post('/api/admin/people/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        person = Person.objects.get(id=data['id'])
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Person.objects.count(), 2)
        self.assertEqual(data['id'], str(person.id))
        self.assertEqual(data['username'], person.username)
        self.assertEqual(data['first_name'], person.first_name)
        self.assertEqual(data['middle_initial'], person.middle_initial)
        self.assertEqual(data['last_name'], person.last_name)
        self.assertEqual(data['role'], str(person.role.id))
        self.assertEqual(data['locale'], str(self.locale.id))

    def test_password_not_in_response(self):
        response = self.client.post('/api/admin/people/', self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn('password', data)


class PersonListTests(TestCase):

    def setUp(self):
        for i in range(3):
            self.person = create_single_person()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)
        # List GET data
        self.response = self.client.get('/api/admin/people/')
        self.data = json.loads(self.response.content.decode('utf8'))

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        self.assertEqual(self.response.status_code, 200)

    def test_status(self):
        self.assertTrue(self.data['results'][0]['status'])

    def test_role(self):
        self.assertTrue(self.data['results'][0]['role'])
        self.assertIsInstance(Role.objects.get(id=self.data['results'][0]['role']), Role)

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

    def test_data(self):
        data = self.data['results'][0]
        person = Person.objects.get(id=data['id'])

        self.assertEqual(data['id'], str(person.id))
        self.assertEqual(data['username'], person.username)
        self.assertEqual(data['first_name'], person.first_name)
        self.assertEqual(data['middle_initial'], person.middle_initial)
        self.assertEqual(data['last_name'], person.last_name)
        self.assertEqual(data['fullname'], person.fullname)
        self.assertEqual(data['status']['id'], str(person.status.id))
        self.assertEqual(data['status']['name'], person.status.name)
        self.assertEqual(data['role'], str(person.role.id))
        self.assertEqual(data['title'], person.title)
        self.assertNotIn('employee_id', data)
        self.assertNotIn('auth_amount', data)
        self.assertNotIn('accept_assign', data)
        self.assertNotIn('accept_notify', data)

    ### CUSTOM LIST ROUTES

    def test_power_select_people_username(self):
        person1 = create_single_person(name='watter')
        person1.first_name = 'nothing'
        person1.last_name = 'nothing'
        person1.title = 'nothing'
        person1.save()

        response = self.client.get('/api/admin/people/person__icontains={}/'.format('watter'))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(person1.id))
        self.assertEqual(data['results'][0]['username'], 'watter')
        self.assertEqual(data['results'][0]['fullname'], 'nothing nothing')
        self.assertNotIn('title', data['results'][0])
        self.assertNotIn('role', data['results'][0])
        self.assertNotIn('status', data['results'][0])

    def test_power_select_people_fullname(self):
        person1 = create_single_person(name='wat')
        person1.first_name = 'foo'
        person1.save()

        response = self.client.get('/api/admin/people/person__icontains={}/'.format('foo'))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(person1.id))
        self.assertEqual(data['results'][0]['fullname'], 'foo wat')

    def test_power_select_people_email(self):
        # TODO: figure out email w/ @ in search
        person1 = create_single_person(name='wat')
        person1.email = 'foo-bar@gmail.com'
        person1.save()

        response = self.client.get('/api/admin/people/person__icontains={}/'.format('foo-bar@gmail.com'))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(person1.id))
        self.assertEqual(data['results'][0]['email'], 'foo-bar@gmail.com')

    def test_power_select_people__more_than_10_results(self):
        search_key = 'foo'
        for i in range(11):
            create_single_person(name=search_key + create._generate_chars())
        self.assertTrue(Person.objects.search_power_select(search_key).count() > 10)

        response = self.client.get('/api/admin/people/person__icontains={}/'.format(search_key))

        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['count'] > 10)
        self.assertEqual(len(data['results']), settings.PAGE_SIZE)


class PersonDetailTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
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
        # test
        response = self.client.get('/api/admin/people/{}/'.format(self.person.pk))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['locale'], str(self.person.locale.id))

    def test_data(self):
        self.assertEqual(self.data['id'], str(self.person.id))
        self.assertEqual(self.data['username'], self.person.username)
        self.assertEqual(self.data['first_name'], self.person.first_name)
        self.assertEqual(self.data['middle_initial'], self.person.middle_initial)
        self.assertEqual(self.data['last_name'], self.person.last_name)
        self.assertEqual(self.data['fullname'], self.person.fullname)
        self.assertEqual(self.data['role'], str(self.person.role.id))
        self.assertEqual(self.data['title'], self.person.title)
        self.assertEqual(self.data['employee_id'], self.person.employee_id)
        self.assertEqual(self.data['password_one_time'], self.person.password_one_time)
        self.assertIn('last_login', self.data)
        self.assertIn('date_joined', self.data)
        self.assertNotIn('auth_amount', self.data)
        self.assertNotIn('auth_currency', self.data)
        self.assertNotIn('accept_assign', self.data)
        self.assertNotIn('accept_notify', self.data)

    def test_data__inherited(self):
        # auth_amount
        self.assertNotIn('value', self.data['inherited']['auth_amount'])
        self.assertEqual(self.data['inherited']['auth_amount']['inherited_value'], self.person.role.auth_amount)
        self.assertEqual(self.data['inherited']['auth_amount']['inherits_from'], 'role')
        self.assertEqual(self.data['inherited']['auth_amount']['inherits_from_id'], str(self.person.role.id))
        # auth_currency
        self.assertNotIn('value', self.data['inherited']['auth_currency'])
        self.assertEqual(self.data['inherited']['auth_currency']['inherited_value'], str(self.person.role.tenant.default_currency.id))
        self.assertEqual(self.data['inherited']['auth_currency']['inherits_from'], 'role')
        self.assertEqual(self.data['inherited']['auth_currency']['inherits_from_id'], str(self.person.role.id))
        # accept_assign
        self.assertNotIn('value', self.data['inherited']['accept_assign'])
        self.assertEqual(self.data['inherited']['accept_assign']['inherited_value'], self.person.role.accept_assign)
        self.assertEqual(self.data['inherited']['accept_assign']['inherits_from'], 'role')
        self.assertEqual(self.data['inherited']['accept_assign']['inherits_from_id'], str(self.person.role.id))
        # accept_notify
        self.assertNotIn('value', self.data['inherited']['accept_notify'])
        self.assertEqual(self.data['inherited']['accept_notify']['inherited_value'], self.person.role.accept_notify)
        self.assertEqual(self.data['inherited']['accept_notify']['inherits_from'], 'role')
        self.assertEqual(self.data['inherited']['accept_notify']['inherits_from_id'], str(self.person.role.id))

    def test_data_status(self):
        self.assertEqual(self.data['status_fk'], str(self.person.status.id))

    def test_data_location(self):
        self.assertTrue(self.data['locations'])

        location = Location.objects.get(id=self.data['locations'][0]['id'])
        location_level = LocationLevel.objects.get(
            id=self.data['locations'][0]['location_level'])

        self.assertEqual(self.data['locations'][0]['id'], str(location.id))
        self.assertEqual(self.data['locations'][0]['name'], location.name)
        self.assertEqual(self.data['locations'][0]['number'], location.number)
        self.assertEqual(self.data['locations'][0]['status_fk'], str(location.status.id))
        self.assertEqual(self.data['locations'][0]['location_level'],
            str(location.location_level.id))

    def test_data_emails(self):
        self.assertTrue(self.data['emails'])
        email = Email.objects.get(id=self.data['emails'][0]['id'])

        self.assertEqual(self.data['emails'][0]['id'], str(email.id))
        self.assertEqual(self.data['emails'][0]['type'], str(email.type.id))
        self.assertEqual(self.data['emails'][0]['email'], email.email)

    def test_data_phone_numbers(self):
        self.assertTrue(self.data['phone_numbers'])
        phone = PhoneNumber.objects.get(id=self.data['phone_numbers'][0]['id'])

        phone_data = self.data['phone_numbers'][0]
        self.assertEqual(phone_data['id'], str(phone.id))
        self.assertEqual(phone_data['type'], str(phone.type.id))
        self.assertEqual(phone_data['number'], phone.number)

    def test_data_addresses(self):
        self.assertTrue(self.data['addresses'])
        address = Address.objects.get(id=self.data['addresses'][0]['id'])

        address_data = self.data['addresses'][0]
        self.assertEqual(address_data['id'], str(address.id))
        self.assertEqual(address_data['type'], str(address.type.id))
        self.assertEqual(address_data['address'], address.address)
        self.assertEqual(address_data['city'], address.city)
        self.assertEqual(address_data['state'], address.state)
        self.assertEqual(address_data['country'], address.country)
        self.assertEqual(address_data['postal_code'], address.postal_code)

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

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.person.id))

    def test_current__all_locations_and_children(self):
        child_location = mommy.make(Location)
        self.person.locations.first().children.add(child_location)

        response = self.client.get('/api/admin/people/current/'.format(self.person.id))
        data = json.loads(response.content.decode('utf8'))

        self.assertIn(
            str(child_location.id),
            [str(x['id']) for x in data['all_locations_and_children']]
        )

    def test_categories(self):
        parent_category = self.person.role.categories.first()

        response = self.client.get('/api/admin/people/current/'.format(self.person.id))
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(1, len(data['categories']))
        category_data = data['categories'][0]
        self.assertEqual(category_data['id'], str(parent_category.id))
        self.assertEqual(category_data['name'], parent_category.name)


class PersonUpdateTests(APITestCase):
    '''
    All required Model fields must be supplied in a PUT, so the PASSWORD is
    required if doing a PUT.

    Resolution: For Password changes, PUT is ok, but for all other Person
    changes, a PATCH should be used, because User won't need to send Password.

    Note: For tests, use empty fields if not required for simplicity.
    '''

    def setUp(self):
        self.password = PASSWORD
        self.role = create_role()
        self.location = create_location(location_level=self.role.location_level)
        self.person = create_single_person()
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
        self.person2 = create_single_person()
        create_contacts(self.person2)

        serializer = PersonUpdateSerializer(self.person)
        self.data = serializer.data

    def tearDown(self):
        self.client.logout()

    def test_auth_amount(self):
        new_auth_amount = '1234.1010'
        self.data['auth_amount'] = new_auth_amount
        self.data['accept_assign'] = True
        self.data['accept_notify'] = True
        self.data['password_one_time'] = True

        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(data['auth_amount'], new_auth_amount)
        self.assertEqual(data['id'], str(self.person.id))
        self.assertEqual(data['username'], self.person.username)
        self.assertEqual(data['first_name'], self.person.first_name)
        self.assertEqual(data['middle_initial'], self.person.middle_initial)
        self.assertEqual(data['last_name'], self.person.last_name)
        self.assertEqual(data['status'], str(self.person.status.id))
        self.assertEqual(data['role'], str(self.person.role.id))
        self.assertEqual(data['title'], self.person.title)
        self.assertEqual(data['employee_id'], self.person.employee_id)
        self.assertTrue(data['accept_assign'])
        self.assertTrue(data['accept_notify'])
        self.assertTrue(data['password_one_time'])

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
        self.data['locale'] = str(self.locale.id)
        # test
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['locale'], str(self.locale.id))

    # TODO: aaron
    # def test_locale__none_gets_set_as_default(self):
    #     # setup
    #     self.data['locale'] = None
    #     # test
    #     response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
    #         self.data, format='json')
    #     data = json.loads(response.content.decode('utf8'))
    #     self.assertEqual(data['locale'], str(Locale.objects.system_default().id))

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

        self.assertEqual(response.status_code, 200)
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

    def test_location_level_equal_new_role(self):
        # create separate LocationLevel
        location_level = mommy.make(LocationLevel)
        new_role = create_role(name='new', location_level=location_level)
        location = mommy.make(Location, location_level=location_level)
        self.assertNotEqual(self.person.role.location_level, location_level)
        # Adding a LocationLevel that matches the new Role's LocationLevel is fine
        self.data['role'] = str(new_role.id)
        self.data['locations'] = [location.id]
        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['locations'])
        self.assertIn(
            location.id,
            Person.objects.get(id=self.data['id']).locations.values_list('id', flat=True)
            )

    ### RELATED CONTACT MODELS

    # EMAILS

    def test_update_email_add_to_person(self):
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


class PersonSearchTests(APITransactionTestCase):

    def setUp(self):
        self.role = create_role()
        create_person_statuses()
        create_locales()
        create_all_people()
        # Login
        self.person = Person.objects.get(username='admin')
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()
        ContentType.objects.clear_cache()

    def test_search_username(self):
        keyword = self.person.username

        response = self.client.get('/api/admin/people/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Person.objects.search_multi(keyword).count())

    def test_search_fullname(self):
        keyword = self.person.fullname

        response = self.client.get('/api/admin/people/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Person.objects.search_multi(keyword).count())

    def test_search_title(self):
        keyword = self.person.title
        response = self.client.get('/api/admin/people/?search={}'.format(keyword))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Person.objects.search_multi(keyword).count())

    def test_search_employee_id(self):
        keyword = self.person.employee_id
        response = self.client.get('/api/admin/people/?search={}'.format(keyword))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Person.objects.search_multi(keyword).count())

    def test_search_role_name(self):
        keyword = self.person.role.name
        response = self.client.get('/api/admin/people/?search={}'.format(keyword))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Person.objects.search_multi(keyword).count())


class PasswordTests(APITestCase):

    def setUp(self):
        self.roles = create_roles()
        self.person = create_single_person()
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

    def test_validate_role_password_constraints(self):
        self.person.role.password_upper_char_required = True
        self.person.role.save()

        new_password = 'new_password'
        data = {
            'new_password1': new_password,
            'new_password2': new_password
        }
        response = self.client.post("/api/admin/people/reset-password/{}/"
            .format(self.person.id), data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_password_space_not_allowed(self):
        new_password = 'new password'
        data = {
            'new_password1': new_password,
            'new_password2': new_password
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
