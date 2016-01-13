from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.urlresolvers import reverse
from django.test import TestCase

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from category.tests.factory import create_single_category, create_categories
from location.models import Location, LocationLevel
from location.tests.factory import create_location, create_locations
from person.models import Person, Role
from person.tests import factory
from utils.helpers import generate_uuid


class DistrictManagerFactoryTests(TestCase):

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

    # create_role

    def test_create_role(self):
        init_count = Role.objects.count()
        role = factory.create_role()
        self.assertIsInstance(role, Role)
        self.assertIsInstance(role.default_auth_currency, Currency)
        self.assertEqual(init_count+1, Role.objects.count())
        self.assertEqual(role.location_level.name, factory.LOCATION_LEVEL)

    def test_create_role__with_name(self):
        name = "Admin"
        role = factory.create_role(name=name)
        self.assertIsInstance(role, Role)
        self.assertEqual(role.name, name)

    def test_create_role__with_location_level(self):
        location_level = mommy.make(LocationLevel)

        role = factory.create_role(location_level=location_level)

        self.assertEqual(role.location_level.name, location_level.name)

    def test_create_role__explicit_category(self):
        category = create_single_category('foo')
        role = factory.create_role(category=category)

        self.assertEqual(role.categories.count(), 1)
        self.assertEqual(role.categories.first().name, category.name)

    def test_create_role__default_category(self):
        role = factory.create_role()

        self.assertEqual(role.categories.count(), 1)

    # create_roles

    def test_create_roles(self):
        factory.create_roles()
        self.assertEqual(
            Role.objects.count(),
            LocationLevel.objects.count()
        )
        self.assertEqual(settings.DEFAULT_ROLE, Role.objects.get(name=settings.DEFAULT_ROLE).name)

    # create_single_person

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
        location = create_location(location_level=role.location_level)

        person = factory.create_single_person('bob', role, location)

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

    def test_create_single_person__validator_only_role(self):
        """
        ``role`` and ``location`` must both be passed in as "kwargs", or 
        not used. If one or the other is sent, it can lead to validation 
        errors and leaky state on Jenkins.
        """
        role = factory.create_role()

        with self.assertRaises(ValidationError):
            factory.create_single_person(role=role)

    def test_create_single_person__validator_only_location(self):
        """
        ``role`` and ``location`` must both be passed in as "kwargs", or 
        not used. If one or the other is sent, it can lead to validation 
        errors and leaky state on Jenkins.
        """
        location = create_location()

        with self.assertRaises(ValidationError):
            factory.create_single_person(location=location)

    # create_person

    def test_create_person(self):
        person = factory.create_person()
        self.assertIsInstance(person, Person)

    def test_create_person__with_username(self):
        new_person_name = 'new_person'
        person = factory.create_person(username=new_person_name)
        self.assertIsInstance(person, Person)
        self.assertEqual(person.username, new_person_name)

    def test_create_person__multiple(self):
        # Will `get_or_create` Person Obj, so confirm at least 2 exist
        factory.create_person(_many=5)
        self.assertTrue(Person.objects.count() >= 2)

    def test_create_person__username_with_many_raises_error(self):
        with self.assertRaises(Exception):
            factory.create_person(username='bob', _many=people)

    def test_create_person__related_obj_creates(self):
        person = factory.create_person()
        self.assertIsInstance(person.role, Role)


class UpdateAdminTests(TestCase):

    def setUp(self):
        create_locations()
        create_categories()

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

    def test_update_admin(self):
        person = factory.create_single_person()

        factory.update_admin(person)

        # Locations
        person_locations = person.locations.values_list('id', flat=True)
        for location in (Location.objects.filter(location_level=person.role.location_level)
                                         .values_list('id', flat=True)):
            self.assertIn(location, person_locations)
        # Categories
        person_role_categories = person.role.categories.values_list('id', flat=True)
        for category in Category.objects.filter(parent__isnull=True).values_list('id', flat=True):
            self.assertIn(category, person_role_categories)

    def test_update_admin_repair(self):
        person = factory.create_single_person()

        factory.update_admin_repair(person)

        # Locations check
        person_locations = person.locations.values_list('id', flat=True)
        for location in (Location.objects.filter(location_level=person.role.location_level)
                                         .values_list('id', flat=True)):
            self.assertIn(location, person_locations)
        # Category 'repair'
        person_role_categories = person.role.categories.values_list('id', flat=True)
        category = Category.objects.get(name='repair')
        self.assertIn(category.id, person_role_categories)

    def test_update_admin_location(self):
        person = factory.create_single_person()

        factory.update_admin_location(person)

        # Locations
        self.assertEqual(person.locations.count(), 1)
        self.assertEqual(person.locations.first().location_level, person.role.location_level)
        # Categories
        person_role_categories = person.role.categories.values_list('id', flat=True)
        for category in Category.objects.filter(parent__isnull=True).values_list('id', flat=True):
            self.assertIn(category, person_role_categories)


class CreateAllPeopleTests(TestCase):

    def test_create_all_people(self):
        # the ``create_all_people`` function should only create objects in the 
        # ``person`` app, not any extra Locations
        create_locations()
        init_location_count = Location.objects.count()

        factory.create_all_people()

        people = Person.objects.all()
        self.assertEqual(people.count(), 189)
        # Roles
        self.assertTrue(Role.objects.filter(name=settings.DEFAULT_ROLE).exists())
        # At least some people are assigned to Location(s)
        self.assertTrue(Person.objects.exclude(locations__isnull=True))
        # Locations
        post_location_count = Location.objects.count()
        self.assertEqual(init_location_count, post_location_count)
