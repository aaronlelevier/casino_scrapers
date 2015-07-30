from django.test import TestCase

from location.models import Location
from person.models import Person, Role, PersonStatus
from person.tests import factory


class FactoryTests(TestCase):

    def test_create_role(self):
        role = factory.create_role()
        self.assertIsInstance(role, Role)

    def test_create_person(self):
        person = factory.create_person()
        self.assertIsInstance(person, Person)

    def test_create_with_username(self):
        new_person_name = 'new_person'
        person = factory.create_person(username=new_person_name)
        self.assertIsInstance(person, Person)
        self.assertEqual(person.username, new_person_name)

    def test_multiple_person_create(self):
        people = 10
        factory.create_person(_many=people)
        self.assertEqual(Person.objects.count(), people)

    def test_many_with_username(self):
        with self.assertRaises(Exception):
            factory.create_person(username='bob', _many=people)

    def test_related_obj_creates(self):
        person = factory.create_person()
        self.assertIsInstance(person.role, Role)
