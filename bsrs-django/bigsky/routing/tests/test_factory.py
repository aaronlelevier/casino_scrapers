from django.conf import settings
from django.contrib.auth.models import ContentType
from django.test import TestCase

from location.tests.factory import create_top_level_location
from person.models import Person
from routing.models import Assignment
from routing.tests import factory
from tenant.models import Tenant
from ticket.models import Ticket, TicketPriority
from utils.create import LOREM_IPSUM_WORDS
from utils.helpers import create_default


class FactoryTests(TestCase):

    def test_create_ticket_priority_filter(self):
        pf = factory.create_ticket_priority_filter()

        # context - populated by default
        self.assertEqual(pf.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        app_label, model = pf.context.split('.')
        content_type = ContentType.objects.get(app_label=app_label, model=model)
        self.assertEqual(content_type.model_class(), Ticket)
        # other fields
        self.assertEqual(pf.key, 'admin.placeholder.ticket_priority')
        self.assertEqual(pf.field, 'priority')
        self.assertEqual(pf.criteria, [str(create_default(TicketPriority).id)])

    def test_create_ticket_location_filter(self):
        # don't test 'context' b/c populated by default and tested above
        location = create_top_level_location()

        pf = factory.create_ticket_location_filter()

        self.assertEqual(pf.key, 'admin.placeholder.location_store')
        self.assertEqual(pf.field, 'location')
        self.assertEqual(pf.criteria, [str(location.id)])

    def test_create_assignment(self):
        assignment = factory.create_assignment()
        self.assertIsInstance(assignment, Assignment)
        self.assertIn(assignment.description, LOREM_IPSUM_WORDS.split())
        self.assertIsInstance(assignment.assignee, Person)
        self.assertIsInstance(assignment.tenant, Tenant)
        # profile_filters
        self.assertEqual(assignment.filters.count(), 2)
        self.assertEqual(assignment.filters.filter(field='priority').count(), 1)
        self.assertEqual(assignment.filters.filter(field='location').count(), 1)

    def test_create_assignments(self):
        self.assertEqual(Assignment.objects.count(), 0)
        factory.create_assignments()
        # not an exact equal here b/c is created w/ a random desc
        # using a "get_or_create" so count might not be 10 ea. time
        self.assertTrue(Assignment.objects.count() > 5)
