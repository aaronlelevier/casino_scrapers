from django.db.models import Q
from django.test import TestCase

from person.models import Person
from profile.models import Assignment, AssignmentManager, AssignmentQuerySet
from profile.tests.factory import create_assignment


class AssignmentManagerTests(TestCase):

    def setUp(self):
        self.assignment = create_assignment('a')
        create_assignment('b')

    def test_queryset_cls(self):
        self.assertEqual(AssignmentManager.queryset_cls, AssignmentQuerySet)

    def test_deleted_not_present(self):
        self.assertEqual(Assignment.objects.count(), 2)
        self.assertEqual(Assignment.objects_all.count(), 2)

        self.assignment.delete()

        self.assertEqual(Assignment.objects.count(), 1)
        self.assertEqual(Assignment.objects_all.count(), 2)

    def test_search_multi(self):
        self.assertEqual(Assignment.objects.count(), 2)
        keyword = self.assignment.description

        raw_ret = Assignment.objects.filter(
            Q(description=keyword) | \
            Q(assignee__username=keyword)
        )

        ret = Assignment.objects.search_multi(keyword)

        self.assertEqual(ret.count(), 1)
        self.assertEqual(ret.count(), raw_ret.count())


class AssignmentTests(TestCase):

    def setUp(self):
        self.assignment = create_assignment()

    def test_fields(self):
        self.assertIsInstance(self.assignment.description, str)
        self.assertIsInstance(self.assignment.assignee, Person)

    def test_manger(self):
        self.assertIsInstance(Assignment.objects, AssignmentManager)


# class ProfilefilterTests(TestCase):

#     def test_properties(self):
#         pf = mommy.make(ProfileFilter)
#         self.assertIsInstance(pf.field, str)
#         self.assertTrue(pf.criteria)
#         self.assertIsInstance(pf.criteria, list)

