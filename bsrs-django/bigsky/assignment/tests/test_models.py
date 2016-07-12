from django.db.models import Q
from django.test import TestCase

from person.models import Person
from assignment.models import Profile, ProfileManager, ProfileQuerySet
from assignment.tests.factory import create_profile


class ProfileManagerTests(TestCase):

    def setUp(self):
        self.profile = create_profile('a')
        create_profile('b')

    def test_queryset_cls(self):
        self.assertEqual(ProfileManager.queryset_cls, ProfileQuerySet)

    def test_deleted_not_present(self):
        self.assertEqual(Profile.objects.count(), 2)
        self.assertEqual(Profile.objects_all.count(), 2)

        self.profile.delete()

        self.assertEqual(Profile.objects.count(), 1)
        self.assertEqual(Profile.objects_all.count(), 2)

    def test_search_multi(self):
        self.assertEqual(Profile.objects.count(), 2)
        keyword = self.profile.description

        raw_ret = Profile.objects.filter(
            Q(description=keyword) | \
            Q(assignee__username=keyword)
        )

        ret = Profile.objects.search_multi(keyword)

        self.assertEqual(ret.count(), 1)
        self.assertEqual(ret.count(), raw_ret.count())


class ProfileTests(TestCase):

    def setUp(self):
        self.profile = create_profile()

    def test_fields(self):
        self.assertIsInstance(self.profile.description, str)
        self.assertIsInstance(self.profile.assignee, Person)

    def test_manger(self):
        self.assertIsInstance(Profile.objects, ProfileManager)