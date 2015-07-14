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
