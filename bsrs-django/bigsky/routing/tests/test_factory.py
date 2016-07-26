from django.conf import settings
from django.contrib.auth.models import ContentType
from django.test import TestCase

from model_mommy import mommy

from category.models import Category
from location.tests.factory import create_top_level_location
from person.models import Person
from routing.models import Assignment, AvailableFilter
from routing.tests import factory
from tenant.models import Tenant
from ticket.models import Ticket, TicketPriority
from utils.create import LOREM_IPSUM_WORDS
from utils.helpers import create_default


class PriorityFilterTests(TestCase):

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

    def test_create_ticket_categories_filter(self):
        category = mommy.make(Category, name=factory.REPAIR)

        pf = factory.create_ticket_categories_filter()

        self.assertEqual(pf.key, 'admin.placeholder.category_filter')
        self.assertEqual(pf.field, 'categories')
        self.assertEqual(pf.criteria, [str(category.id)])


class AssignmentTests(TestCase):

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


class AvailableFilterTests(TestCase):

    def test_create_available_filter(self):
        ret = factory.create_available_filter()
        ret_two = factory.create_available_filter()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.type, 'assignment')
        self.assertEqual(ret.key, 'admin.placeholder.ticket_priority')
        self.assertEqual(ret.key_is_i18n, True)
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'priority')
        self.assertEqual(ret.lookups, {})

    def test_create_available_filters(self):
        self.assertEqual(AvailableFilter.objects.count(), 0)

        factory.create_available_filters()

        self.assertEqual(AvailableFilter.objects.count(), 3)
        fields = ['priority', 'categories', 'location']
        for af in AvailableFilter.objects.all():
            self.assertIn(af.field, fields)
