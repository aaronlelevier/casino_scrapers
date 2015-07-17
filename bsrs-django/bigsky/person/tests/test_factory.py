from django.test import TestCase

from person.models import Person
from person.tests import factory


class FactoryTests(TestCase):

    def test_create_person(self):
        person = factory.create_person()
        self.assertIsInstance(person, Person)

        # 2nd person
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