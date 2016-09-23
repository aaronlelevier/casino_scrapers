from django.conf import settings
from django.contrib.auth.models import ContentType
from django.test import TestCase

from category.models import Category
from category.tests.factory import create_repair_category
from contact.tests.factory import create_contact_state, create_contact_country
from location.tests.factory import create_top_level_location
from person.models import Person
from person.tests.factory import create_single_person
from automation.choices import AUTOMATION_EVENTS, AUTOMATION_ACTION_TYPES
from automation.models import (AutomationEvent, Automation, ProfileFilter, AvailableFilter,
    AutomationActionType, AutomationAction)
from automation.tests import factory
from tenant.models import Tenant
from tenant.tests.factory import get_or_create_tenant
from ticket.models import Ticket, TicketPriority
from utils.create import LOREM_IPSUM_WORDS
from utils.helpers import create_default


class AutomationEventTests(TestCase):

    def test_create_automation_event(self):
        ret = factory.create_automation_event()

        self.assertIsInstance(ret, AutomationEvent)
        self.assertEqual(ret.key, factory.DEFAULT_ROUTING_EVENT)

    def test_create_automation_event__key(self):
        key = 'automation.event.ticket_status_unsatisfactory'

        ret = factory.create_automation_event(key)

        self.assertIsInstance(ret, AutomationEvent)
        self.assertEqual(ret.key, key)

    def test_create_automation_event_two(self):
        ret = factory.create_automation_event_two()

        self.assertIsInstance(ret, AutomationEvent)
        self.assertEqual(ret.key, factory.DEFAULT_ROUTING_EVENT_TWO)

    def test_create_automation_events(self):
        self.assertEqual(AutomationEvent.objects.count(), 0)

        factory.create_automation_events()

        self.assertEqual(AutomationEvent.objects.count(), len(AUTOMATION_EVENTS))


class AutomationActionTypeTests(TestCase):

    def test_create_automation_action_type(self):
        ret = factory.create_automation_action_type()

        self.assertIsInstance(ret, AutomationActionType)
        self.assertEqual(ret.key, factory.DEFAULT_AUTOMATION_ACTION_TYPE)

    def test_create_automation_action_types(self):
        self.assertEqual(AutomationActionType.objects.count(), 0)

        factory.create_automation_action_types()

        self.assertEqual(AutomationActionType.objects.count(), len(AUTOMATION_ACTION_TYPES))


class AutomationActionTests(TestCase):

    def test_create_automation_action(self):
        ret = factory.create_automation_action()

        self.assertIsInstance(ret, AutomationAction)
        self.assertIsInstance(ret.type, AutomationActionType)
        self.assertIsInstance(ret.automation, Automation)


class AvailableFilterTests(TestCase):

    def test_default_context(self):
        ret = factory.create_available_filter_priority()

        # context - populated by default
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        app_label, model = ret.context.split('.')
        content_type = ContentType.objects.get(app_label=app_label, model=model)
        self.assertEqual(content_type.model_class(), Ticket)

    def test_create_available_filter_priority(self):
        ret = factory.create_available_filter_priority()
        ret_two = factory.create_available_filter_priority()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, 'admin.placeholder.priority_filter_select')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'priority')
        self.assertEqual(ret.lookups, {})

    def test_create_available_filter_categories(self):
        ret = factory.create_available_filter_categories()
        ret_two = factory.create_available_filter_categories()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, 'admin.placeholder.category_filter_select')
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
        self.assertEqual(ret.key, 'admin.placeholder.state_filter_select')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'state')
        self.assertEqual(ret.lookups, {})

    def test_create_available_filter_country(self):
        ret = factory.create_available_filter_country()
        ret_two = factory.create_available_filter_country()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, 'admin.placeholder.country_filter_select')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'country')
        self.assertEqual(ret.lookups, {})

    def test_create_available_filters(self):
        self.assertEqual(AvailableFilter.objects.count(), 0)
        factory.create_available_filters()
        self.assertEqual(AvailableFilter.objects.count(), 5)

        fields = ['priority', 'categories', 'location', 'state', 'country']
        ret_fields = AvailableFilter.objects.values_list('field', flat=True)
        self.assertEqual(sorted(fields), sorted(ret_fields))
        self.assertEqual(len(set(ret_fields)), 5)


class PriorityFilterTests(TestCase):

    def setUp(self):
        self.automation = factory.create_automation(with_filters=False)

    def test_create_ticket_priority_filter(self):
        priority = create_default(TicketPriority)
        source = factory.create_available_filter_priority()

        pf = factory.create_ticket_priority_filter()

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(priority.id)])

    def test_create_ticket_priority_filter__explicit_automation(self):
        pf = factory.create_ticket_priority_filter(self.automation)

        self.assertEqual(pf.automation, self.automation)

    def test_create_ticket_categories_filter(self):
        category = create_repair_category()
        source = factory.create_available_filter_categories()

        pf = factory.create_ticket_categories_filter()

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(category.id)])

    def test_create_ticket_categories_mid_level_filter(self):
        category = create_repair_category()
        source = factory.create_available_filter_categories()

        pf = factory.create_ticket_categories_mid_level_filter()

        self.assertIsInstance(pf.automation, Automation)
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

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {'filters': 'location_level', 'id': str(location_level.id), 'name': location_level.name})
        self.assertEqual(pf.criteria, [str(location.id)])

    def test_create_ticket_location_state_filter(self):
        state = create_contact_state()
        source = factory.create_available_filter_state()

        pf = factory.create_ticket_location_state_filter()

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(state.id)])

    def test_create_ticket_location_state_filter(self):
        country = create_contact_country()
        source = factory.create_available_filter_country()

        pf = factory.create_ticket_location_country_filter()

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(country.id)])

    def test_create_profile_filters(self):
        self.assertEqual(ProfileFilter.objects.count(), 0)
        factory.create_profile_filters()
        self.assertEqual(ProfileFilter.objects.count(), 5)


class AutomationTests(TestCase):

    def test_create_automation(self):
        automation = factory.create_automation()
        self.assertIsInstance(automation, Automation)
        self.assertIn(automation.description, LOREM_IPSUM_WORDS.split())
        self.assertIsInstance(automation.tenant, Tenant)
        # events
        self.assertEqual(automation.events.count(), 1)
        # actions
        self.assertEqual(automation.actions.count(), 1)
        # profile_filters
        self.assertEqual(automation.filters.count(), 2)
        self.assertEqual(automation.filters.filter(source__field='priority').count(), 1)
        self.assertEqual(automation.filters.filter(source__field='categories').count(), 1)

    def test_create_automation__args(self):
        description = 'foo'
        tenant = get_or_create_tenant('bar')
        with_filters = False

        ret = factory.create_automation(description=description, tenant=tenant,
                                        with_filters=with_filters)

        self.assertEqual(ret.description, description)
        self.assertEqual(ret.tenant, tenant)
        self.assertEqual(ret.filters.count(), 0)

    def test_create_automations(self):
        self.assertEqual(Automation.objects.count(), 0)
        factory.create_profile_filters()

        factory.create_automations()

        self.assertEqual(Automation.objects.count(), 5)
        # Automations w/ static ProfileFilter.source
        self.assertEqual(Automation.objects.exclude(filters__lookups__filters='location_level').count(), 4)
        # priority
        key = 'admin.placeholder.priority_filter_select'
        x = Automation.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # location
        x = Automation.objects.get(filters__lookups__filters='location_level')
        self.assertIsInstance(x, Automation)
        self.assertEqual(x.description, 'location')
        # category
        key = 'admin.placeholder.category_filter_select'
        x = Automation.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # state
        key = 'admin.placeholder.state_filter_select'
        x = Automation.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # country
        key = 'admin.placeholder.country_filter_select'
        x = Automation.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
