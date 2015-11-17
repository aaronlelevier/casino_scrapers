from django.test import TestCase

from model_mommy import mommy

from accounting.models import Currency
from location.models import LocationLevel
from person.models import Person, Role
from person.tests import factory
from utils.helpers import generate_uuid


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

    def create_role_exists(self):
        factory.create_roles()
        self.assertEqual(
            Role.objects.count(),
            LocationLevel.objects.count()
        )

    def create_role_with_location_level(self):
        location_level = mommy.make(LocationLevel)
        role = create_role(location_level=location_level)
        self.assertEqual(role.location_level.name, location_level.name)

    def test_create_single_person(self):
        role = factory.create_role()
        person = factory.create_single_person('bob', role)
        self.assertIsInstance(person, Person)

    def test_create_single_person__generate_uuid(self):
        incr = Person.objects.count()

        person = factory.create_single_person()

        self.assertIsInstance(person, Person)
        self.assertEqual(
            str(person.id),
            generate_uuid(factory.PERSON_BASE_ID, incr+1)
        )

    def test_update_login_person(self):
        person = factory.create_person()
        factory.update_login_person(person)
        self.assertTrue(person.is_staff)

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
        # Make sure that there are 23 People, and that all People Roles
        # have a valid Location that uses that ``person.role.location_level``
        factory.create_all_people()
        people = Person.objects.all()
        self.assertEqual(people.count(), 187)
        # At least some people are assigned to Location(s)
        self.assertTrue(Person.objects.exclude(locations__isnull=True))
