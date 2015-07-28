"""
Created on Feb 17, 2015

@author: tkrier
"""
from django.test import TestCase
from django.contrib.auth.models import User

from model_mommy import mommy

from location.models import Location
from person.models import Person, PersonStatus, Role
from person.tests.factory import PASSWORD, create_person
from util import exceptions as excp


class RoleTests(TestCase):
    pass


class PersonTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_person_is_user_subclass(self):
        self.assertIsInstance(self.person, User)

    def test_person_defaults(self):
        self.assertTrue(self.person.accept_assign)

    def test_foreignkeys(self):
        self.assertIsInstance(self.person.status, PersonStatus)
        self.assertIsInstance(self.person.role, Role)


class PersonCreateTests(TestCase):

    def setUp(self):
        self.person = create_person()

    def test_create(self):
        self.assertIsInstance(self.person, Person)

    def test_no_first_or_last_names(self):
        # We're not going to require `first_name` or `last_name` and that's fine.
        self.person.first_name = '' 
        self.person.last_name = ''
        self.person.save()
        self.person = Person.objects.get(pk=self.person.pk)
        self.assertIsInstance(self.person, Person)
        self.assertEqual(self.person.first_name, '')

    def test_delete(self):
        self.assertFalse(self.person.deleted)
        self.person.delete()
        self.assertTrue(self.person.deleted)

    def test_delete_override(self):
        self.person.delete(override=True)
        self.assertEqual(Person.objects.count(), 0)

    def test_status(self):
        # should create a PersonStatus and default it
        self.assertEqual(self.person.status, PersonStatus.objects.default())


class PersonStatusTests(TestCase):

    def test_create(self):
        ps = mommy.make(PersonStatus)
        self.assertIsInstance(ps, PersonStatus)
