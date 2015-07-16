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
        # all required fields in order to create a person
        self.role = mommy.make(Role)
        self.person_status = mommy.make(PersonStatus)
        self.location = mommy.make(Location)

    def test_create(self):
        with self.assertRaises(excp.PersonFLNameRequired):
            Person.objects.create(
                username='foo',
                password='bar',
                role=self.role,
                status=self.person_status,
                location=self.location,
                authorized_amount=204,
                authorized_amount_currency="usd"
                )


class PersonStatusTests(TestCase):

    def test_create(self):
        ps = mommy.make(PersonStatus)
        self.assertIsInstance(ps, PersonStatus)





