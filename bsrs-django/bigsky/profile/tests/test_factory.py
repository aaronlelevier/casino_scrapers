from django.contrib.auth.models import ContentType
from django.test import TestCase

from profile.models import Assignment
from profile.tests import factory
from person.models import Person
from utils.create import LOREM_IPSUM_WORDS

class FactoryTests(TestCase):

    def test_create_assignment(self):
        assignment = factory.create_assignment()
        self.assertIsInstance(assignment, Assignment)
        self.assertIn(assignment.description, LOREM_IPSUM_WORDS.split())
        self.assertIsInstance(assignment.assignee, Person)

    def test_create_assignments(self):
        self.assertEqual(Assignment.objects.count(), 0)
        factory.create_assignments()
        # not an exact equal here b/c is created w/ a random desc
        # using a "get_or_create" so count might not be 10 ea. time
        self.assertTrue(Assignment.objects.count() > 5)

    def test_create_profile_filter(self):
        pf = factory.create_profile_filter()
        # context
        self.assertEqual(pf.context, "ticket.Ticket")
        app_label, model = pf.context.split('.')
        content_type = ContentType.objects.get(app_label=app_label, model=model)
        self.assertEqual(content_type, Ticket)
        # other fields
        self.assertIsInstance(pf.field, str)
        self.assertTrue(pf.criteria)
        self.assertIsInstance(pf.criteria, list)

        # test 1 Assignment, and that this ProfileFilter belongs to it
