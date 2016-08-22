from django.conf import settings
from django.contrib.auth.models import ContentType
from django.test import TestCase

from category.models import Category
from category.tests.factory import create_repair_category
from contact.tests.factory import create_contact_state, create_contact_country
from location.tests.factory import create_top_level_location
from person.models import Person
from person.tests.factory import create_single_person
from routing.models import Assignment, ProfileFilter, AvailableFilter, AUTO_ASSIGN
from routing.tests import factory
from tenant.models import Tenant
from ticket.models import Ticket, TicketPriority
from utils.create import LOREM_IPSUM_WORDS
from utils.helpers import create_default


class AvailableFilterTests(TestCase):

    def test_default_context(self):
        ret = factory.create_available_filter_priority()

        # context - populated by default
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        app_label, model = ret.context.split('.')
        content_type = ContentType.objects.get(app_label=app_label, model=model)
        self.assertEqual(content_type.model_class(), Ticket)

    def test_create_available_filter_auto_assign(self):
        ret = factory.create_available_filter_auto_assign()
        ret_two = factory.create_available_filter_auto_assign()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, 'admin.placeholder.auto_assign')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, AUTO_ASSIGN)
        self.assertEqual(ret.lookups, {})

    def test_create_available_filter_priority(self):
        ret = factory.create_available_filter_priority()
        ret_two = factory.create_available_filter_priority()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, 'admin.placeholder.ticket_priority')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'priority')
        self.assertEqual(ret.lookups, {})

    def test_create_available_filter_categories(self):
        ret = factory.create_available_filter_categories()
        ret_two = factory.create_available_filter_categories()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, 'admin.placeholder.category_filter')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'categories')
        self.assertEqual(ret.lookups, {})

    def test_create_available_filter_location(self):
        ret = factory.create_available_filter_location()
        ret_two = factory.create_available_filter_location()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, '')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'location')
        self.assertEqual(ret.lookups, {'filters': 'location_level'})

    def test_create_available_filter_state(self):
        ret = factory.create_available_filter_state()
        ret_two = factory.create_available_filter_state()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, 'admin.placeholder.state_filter')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'state')
        self.assertEqual(ret.lookups, {})

    def test_create_available_filter_country(self):
        ret = factory.create_available_filter_country()
        ret_two = factory.create_available_filter_country()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, 'admin.placeholder.country_filter')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'country')
        self.assertEqual(ret.lookups, {})

    def test_create_available_filters(self):
        self.assertEqual(AvailableFilter.objects.count(), 0)
        factory.create_available_filters()
        self.assertEqual(AvailableFilter.objects.count(), 6)

        fields = [AUTO_ASSIGN, 'priority', 'categories', 'location', 'state', 'country']
        ret_fields = AvailableFilter.objects.values_list('field', flat=True)
        self.assertEqual(sorted(fields), sorted(ret_fields))
        self.assertEqual(len(set(ret_fields)), 6)


class PriorityFilterTests(TestCase):

    def test_create_auto_assign_filter(self):
        source = factory.create_available_filter_auto_assign()

        pf = factory.create_auto_assign_filter()

        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [])

    def test_create_ticket_priority_filter(self):
        priority = create_default(TicketPriority)
        source = factory.create_available_filter_priority()

        pf = factory.create_ticket_priority_filter()

        # other fields
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(priority.id)])

    def test_create_ticket_categories_filter(self):
        category = create_repair_category()
        source = factory.create_available_filter_categories()

        pf = factory.create_ticket_categories_filter()

        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(category.id)])

    def test_create_ticket_categories_mid_level_filter(self):
        category = create_repair_category()
        source = factory.create_available_filter_categories()

        pf = factory.create_ticket_categories_mid_level_filter()

        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(len(pf.criteria), 1)
        child_category = Category.objects.get(id=pf.criteria[0])
        self.assertEqual(child_category.parent, category)

    def test_create_ticket_location_filter(self):
        location = create_top_level_location()
        location_level = location.location_level
        source = factory.create_available_filter_location()

        pf = factory.create_ticket_location_filter()

        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {'filters': 'location_level', 'id': str(location_level.id), 'name': location_level.name})
        self.assertEqual(pf.criteria, [str(location.id)])

    def test_create_ticket_location_state_filter(self):
        state = create_contact_state()
        source = factory.create_available_filter_state()

        pf = factory.create_ticket_location_state_filter()

        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(state.id)])

    def test_create_ticket_location_state_filter(self):
        country = create_contact_country()
        source = factory.create_available_filter_country()

        pf = factory.create_ticket_location_country_filter()

        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(country.id)])

    def test_create_profile_filters(self):
        self.assertEqual(ProfileFilter.objects.count(), 0)
        factory.create_profile_filters()
        self.assertEqual(ProfileFilter.objects.count(), 6)


class AssignmentTests(TestCase):

    def test_create_assignment(self):
        assignment = factory.create_assignment()
        self.assertIsInstance(assignment, Assignment)
        self.assertIn(assignment.description, LOREM_IPSUM_WORDS.split())
        self.assertIsInstance(assignment.assignee, Person)
        self.assertIsInstance(assignment.tenant, Tenant)
        # profile_filters
        self.assertEqual(assignment.filters.count(), 2)
        self.assertEqual(assignment.filters.filter(source__field='priority').count(), 1)
        self.assertEqual(assignment.filters.filter(source__field='categories').count(), 1)

    def test_create_assignment__arbitrary_assignee(self):
        assignee = create_single_person()
        a = factory.create_assignment()
        b = factory.create_assignment(assignee=assignee)
        self.assertNotEqual(a.assignee, b.assignee)
        self.assertEqual(b.assignee, assignee)

    def test_create_assignments(self):
        self.assertEqual(Assignment.objects.count(), 0)
        factory.create_profile_filters()

        factory.create_assignments()

        self.assertEqual(Assignment.objects.count(), 6)
        # Assignments w/ static ProfileFilter.source
        self.assertEqual(Assignment.objects.exclude(filters__lookups__filters='location_level').count(), 5)
        # auto_assign
        key = 'admin.placeholder.auto_assign'
        x = Assignment.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # priority
        key = 'admin.placeholder.ticket_priority'
        x = Assignment.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # location
        x = Assignment.objects.get(filters__lookups__filters='location_level')
        self.assertIsInstance(x, Assignment)
        self.assertEqual(x.description, 'location')
        # category
        key = 'admin.placeholder.category_filter'
        x = Assignment.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # state
        key = 'admin.placeholder.state_filter'
        x = Assignment.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # country
        key = 'admin.placeholder.country_filter'
        x = Assignment.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
