"""
Created on Feb 17, 2015

@author: tkrier
"""
from django.test import TestCase
from django.contrib.auth.models import User

from model_mommy import mommy

from person.models import Person, PersonStatus
from person.tests.factory import PASSWORD, create_person


class PersonTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_person_is_user_subclass(self):
        self.assertIsInstance(self.person, User)

    def test_person_defaults(self):
        self.assertFalse(self.person.accept_assign)

    def test_foreignkeys_not_required(self):
        self.assertIsNone(self.person.status)
        self.assertIsNone(self.person.role)


class PersonStatusTests(TestCase):

    def test_create(self):
        ps = mommy.make(PersonStatus)
        self.assertIsInstance(ps, PersonStatus)