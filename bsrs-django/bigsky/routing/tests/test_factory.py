from django.conf import settings
from django.contrib.auth.models import ContentType
from django.test import TestCase

from routing.models import Assignment
from routing.tests import factory
from person.models import Person
from ticket.models import Ticket, TicketPriority
from utils.create import LOREM_IPSUM_WORDS
from utils.helpers import create_default


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

    # create_profile_filter

    def test_create_profile_filter(self):
        pf = factory.create_profile_filter()
        # context
        self.assertEqual(pf.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        app_label, model = pf.context.split('.')
        content_type = ContentType.objects.get(app_label=app_label, model=model)
        self.assertEqual(content_type.model_class(), Ticket)
        # other fields
        self.assertIsInstance(pf.field, str)
        self.assertTrue(pf.criteria)
        self.assertIsInstance(pf.criteria, list)
        self.assertEqual(pf.criteria, [str(create_default(TicketPriority).id)])
        # assignment
        self.assertEqual(Assignment.objects.count(), 1)
        assignment = Assignment.objects.first()
        self.assertEqual(assignment.filters.count(), 1)
        self.assertEqual(assignment.filters.first(), pf)

    def test_create_profile_filter__assignment(self):
        assignment = factory.create_assignment()

        pf = factory.create_profile_filter(assignment)

        self.assertEqual(Assignment.objects.count(), 1)
        self.assertEqual(assignment.filters.count(), 1)
        self.assertEqual(assignment.filters.first(), pf)
