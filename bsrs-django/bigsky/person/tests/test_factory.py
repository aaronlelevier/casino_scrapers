from django.conf import settings
from django.core.urlresolvers import reverse
from django.test import TestCase

from model_mommy import mommy

from accounting.models import Currency
from category.tests.factory import create_single_category
from location.models import Location, LocationLevel
from location.tests.factory import create_location, create_locations
from person.models import Person, Role
from person.tests import factory
from utils.helpers import generate_uuid


class PreConfiguredPersonTests(TestCase):

    def setUp(self):
        self.dm = factory.DistrictManager()

    def test_person(self):
        self.assertEqual(self.dm.person.username, 'district-manager-1')
        self.assertEqual(self.dm.person.role.name, 'district-manager')
        self.assertEqual(self.dm.person.role, self.dm.role)

    def test_location_level(self):
        self.assertEqual(self.dm.role.location_level, self.dm.location_level)
        self.assertEqual(
            self.dm.location.location_level,
            self.dm.location_level
        )

    def test_location(self):
        self.assertIn(
            self.dm.location,
            self.dm.person.locations.all()
        )

    def test_categories(self):
        self.assertEqual(self.dm.role.categories.count(), 1)
        self.assertEqual(self.dm.role.categories.first().name, "Repair")


class FactoryTests(TestCase):

    def test_create_role(self):
        init_count = Role.objects.count()
        role = factory.create_role()
        self.assertIsInstance(role, Role)
        self.assertIsInstance(role.default_auth_currency, Currency)
        self.assertEqual(init_count+1, Role.objects.count())
        self.assertEqual(role.location_level.name, factory.LOCATION_LEVEL)

    def test_create_role_with_name(self):
        name = "Admin"
        role = factory.create_role(name=name)
        self.assertIsInstance(role, Role)
        self.assertEqual(role.name, name)

    def test_create_role_exists(self):
        factory.create_roles()
        self.assertEqual(
            Role.objects.count(),
            LocationLevel.objects.count()
        )
        self.assertEqual(settings.DEFAULT_ROLE, Role.objects.get(name=settings.DEFAULT_ROLE).name)

    def test_create_role_with_location_level(self):
        location_level = mommy.make(LocationLevel)

        role = factory.create_role(location_level=location_level)

        self.assertEqual(role.location_level.name, location_level.name)

    def test_create_role_explicit_category(self):
        category = create_single_category('foo')
        role = factory.create_role(category=category)

        self.assertEqual(role.categories.count(), 1)
        self.assertEqual(role.categories.first().name, category.name)

    def test_create_role_default_category(self):
        role = factory.create_role()

        self.assertEqual(role.categories.count(), 1)

    def test_create_single_person(self):
        person = factory.create_single_person()

        self.assertIsInstance(person, Person)
        self.assertIsInstance(person.role, Role)
        # person's location
        self.assertEqual(person.locations.count(), 1)
        location = person.locations.first()
        self.assertEqual(person.role.location_level, location.location_level)

    def test_create_single_person__with_role(self):
        username = 'bob'
        role = factory.create_role()

        person = factory.create_single_person('bob', role)

        self.assertIsInstance(person, Person)
        self.assertEqual(person.username, username)
        self.assertEqual(person.role, role)
        self.assertIsInstance(person.locations.first(), Location)

    def test_create_single_person__generate_uuid(self):
        incr = Person.objects.count()

        person = factory.create_single_person()

        self.assertIsInstance(person, Person)
        self.assertEqual(
            str(person.id),
            generate_uuid(factory.PERSON_BASE_ID, incr+1)
        )

    def test_create_single_person__with_location(self):
        location = create_location()

        person = factory.create_single_person(location=location)

        self.assertIn(
            location,
            person.locations.all()
        )

    def test_update_login_person(self):
        person = factory.create_person()
        new_password = 'tango'

        factory.update_login_person(person, new_password=new_password)

        self.assertTrue(person.is_superuser)
        self.assertTrue(person.is_staff)
        response = self.client.post(reverse('login'), {'username': person.username,
            'password': new_password})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.session['_auth_user_id'], person.pk)

    ### .create_person(): Start

    def test_create_person(self):
        person = factory.create_person()
        self.assertIsInstance(person, Person)

    def test_create_with_username(self):
        new_person_name = 'new_person'
        person = factory.create_person(username=new_person_name)
        self.assertIsInstance(person, Person)
        self.assertEqual(person.username, new_person_name)

    def test_multiple_person_create(self):
        # Will `get_or_create` Person Obj, so confirm at least 2 exist
        factory.create_person(_many=5)
        self.assertTrue(Person.objects.count() >= 2)

    def test_many_with_username(self):
        with self.assertRaises(Exception):
            factory.create_person(username='bob', _many=people)

    def test_related_obj_creates(self):
        person = factory.create_person()
        self.assertIsInstance(person.role, Role)

    ### .create_person(): End

    def test_create_all_people(self):
        # the ``create_all_people`` function should only create objects in the 
        # ``person`` app, not any extra Locations
        create_locations()
        init_location_count = Location.objects.count()

        factory.create_all_people()

        people = Person.objects.all()
        self.assertEqual(people.count(), 187)
        # Roles
        self.assertTrue(Role.objects.filter(name=settings.DEFAULT_ROLE).exists())
        # At least some people are assigned to Location(s)
        self.assertTrue(Person.objects.exclude(locations__isnull=True))
        # Locations
        post_location_count = Location.objects.count()
        self.assertEqual(init_location_count, post_location_count)
