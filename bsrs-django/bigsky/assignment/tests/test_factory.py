from django.test import TestCase

from assignment.models import Profile
from assignment.tests import factory
from person.models import Person
from utils.create import LOREM_IPSUM_WORDS

class FactoryTests(TestCase):

    def test_create_profile(self):
        profile = factory.create_profile()
        self.assertIsInstance(profile, Profile)
        self.assertIn(profile.description, LOREM_IPSUM_WORDS.split())
        self.assertIsInstance(profile.assignee, Person)

    def test_create_profiles(self):
        self.assertEqual(Profile.objects.count(), 0)
        factory.create_profiles()
        # not an exact equal here b/c is created w/ a random desc
        # using a "get_or_create" so count might not be 10 ea. time
        self.assertTrue(Profile.objects.count() > 5)
