from django.conf import settings
from django.contrib.auth.models import ContentType
from django.test import TestCase

from automation.models import (
    AutomationEvent, Automation, AutomationFilter, AutomationFilterType,
    AutomationActionType, AutomationAction)
from automation.tests import factory
from category.models import Category
from category.tests.factory import create_repair_category
from contact.tests.factory import create_contact_state, create_contact_country
from location.models import LOCATION_REGION
from location.tests.factory import create_top_level_location, create_location, create_location_level
from person.models import Role, Person
from tenant.models import Tenant
from tenant.tests.factory import get_or_create_tenant
from ticket.models import Ticket, TicketPriority, TicketStatus
from utils.create import LOREM_IPSUM_WORDS
from utils.helpers import create_default


class AutomationEventTests(TestCase):

    def test_create_automation_event(self):
        ret = factory.create_automation_event()

        self.assertIsInstance(ret, AutomationEvent)
        self.assertEqual(ret.key, AutomationEvent.STATUS_NEW)

    def test_create_automation_event__key(self):
        key = 'automation.event.ticket_status_unsatisfactory'

        ret = factory.create_automation_event(key)

        self.assertIsInstance(ret, AutomationEvent)
        self.assertEqual(ret.key, key)

    def test_create_automation_event_two(self):
        ret = factory.create_automation_event_two()

        self.assertIsInstance(ret, AutomationEvent)
        self.assertEqual(ret.key, AutomationEvent.STATUS_COMPLETE)

    def test_create_automation_events(self):
        self.assertEqual(AutomationEvent.objects.count(), 0)

        ret = factory.create_automation_events()

        self.assertEqual(AutomationEvent.objects.count(), len(AutomationEvent.ALL))
        self.assertIsInstance(ret, list)
        self.assertIsInstance(ret[0], AutomationEvent)


class AutomationActionTypeTests(TestCase):

    def test_create_automation_action_type(self):
        ret = factory.create_automation_action_type()

        self.assertIsInstance(ret, AutomationActionType)
        self.assertEqual(ret.key, AutomationActionType.TICKET_ASSIGNEE)

    def test_create_automation_action_types(self):
        self.assertEqual(AutomationActionType.objects.count(), 0)

        ret = factory.create_automation_action_types()

        self.assertEqual(AutomationActionType.objects.count(), len(AutomationActionType.ALL))
        self.assertIsInstance(ret, list)
        self.assertIsInstance(ret[0], AutomationActionType)


class AutomationActionTests(TestCase):

    def test_create_automation_action_assignee(self):
        ret = factory.create_automation_action_assignee()

        self.assertIsInstance(ret, AutomationAction)
        self.assertEqual(ret.type.key, AutomationActionType.TICKET_ASSIGNEE)
        self.assertIsInstance(
            Person.objects.get(id=ret.content['assignee']), Person)

    def test_create_automation_action_send_email(self):
        ret = factory.create_automation_action_send_email()

        self.assertIsInstance(ret, AutomationAction)
        self.assertEqual(ret.type.key, AutomationActionType.SEND_EMAIL)
        # content
        self.assertEqual(len(ret.content), 3)
        self.assertEqual(len(ret.content['recipients']), 2)
        # person recipient
        self.assertEqual(ret.content['recipients'][0]['type'], 'person')
        self.assertIsInstance(Person.objects.get(id=ret.content['recipients'][0]['id']), Person)
        # role recipient
        self.assertEqual(ret.content['recipients'][1]['type'], 'role')
        self.assertIsInstance(Role.objects.get(id=ret.content['recipients'][1]['id']), Role)
        # other fields
        self.assertIsInstance(ret.content['subject'], str)
        self.assertIsInstance(ret.content['body'], str)

    def test_create_automation_action_send_sms(self):
        ret = factory.create_automation_action_send_sms()

        self.assertIsInstance(ret, AutomationAction)
        self.assertEqual(ret.type.key, AutomationActionType.SEND_SMS)
        # content
        self.assertEqual(len(ret.content), 2)
        self.assertEqual(len(ret.content['recipients']), 2)
        # person recipient
        self.assertEqual(ret.content['recipients'][0]['type'], 'person')
        self.assertIsInstance(Person.objects.get(id=ret.content['recipients'][0]['id']), Person)
        # role recipient
        self.assertEqual(ret.content['recipients'][1]['type'], 'role')
        self.assertIsInstance(Role.objects.get(id=ret.content['recipients'][1]['id']), Role)
        # other fields
        self.assertIsInstance(ret.content['body'], str)

    def test_create_automation_action_priority(self):
        ret = factory.create_automation_action_priority()
        self.assertEqual(ret.type.key, AutomationActionType.TICKET_PRIORITY)
        self.assertIsInstance(
            TicketPriority.objects.get(id=ret.content['priority']), TicketPriority)

    def test_create_automation_action_status(self):
        ret = factory.create_automation_action_status()
        self.assertEqual(ret.type.key, AutomationActionType.TICKET_STATUS)
        self.assertIsInstance(
            TicketStatus.objects.get(id=ret.content['status']), TicketStatus)

    def test_create_automation_action_request(self):
        ret = factory.create_automation_action_request()
        self.assertEqual(ret.type.key, AutomationActionType.TICKET_REQUEST)
        self.assertIsInstance(ret.content['request'], str)

    def test_create_automation_action_cc(self):
        ret = factory.create_automation_action_cc()
        self.assertEqual(ret.type.key, AutomationActionType.TICKET_CC)
        self.assertEqual(len(ret.content['ccs']), 1)
        self.assertIsInstance(
            Person.objects.get(id=ret.content['ccs'][0]), Person)

    def test_create_automation_actions(self):
        factory.create_automation_actions()

        actions = AutomationAction.objects.all()
        self.assertEqual(actions.count(), len(AutomationActionType.ALL))
        for a in actions:
            self.assertIn(a.type.key, AutomationActionType.ALL,
                "{} not in {}".format(a.type.key, AutomationActionType.ALL))


class AutomationFilterTypeTests(TestCase):

    def test_default_context(self):
        ret = factory.create_automation_filter_type_priority()

        # context - populated by default
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        app_label, model = ret.context.split('.')
        content_type = ContentType.objects.get(app_label=app_label, model=model)
        self.assertEqual(content_type.model_class(), Ticket)

    def test_create_automation_filter_type_priority(self):
        ret = factory.create_automation_filter_type_priority()
        ret_two = factory.create_automation_filter_type_priority()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, AutomationFilterType.PRIORITY)
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'priority')
        self.assertEqual(ret.lookups, {})

    def test_create_automation_filter_type_categories(self):
        ret = factory.create_automation_filter_type_categories()
        ret_two = factory.create_automation_filter_type_categories()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, AutomationFilterType.CATEGORY)
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'categories')
        self.assertEqual(ret.lookups, {})

    def test_create_automation_filter_type_location(self):
        ret = factory.create_automation_filter_type_location()
        ret_two = factory.create_automation_filter_type_location()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, '')
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'location')
        self.assertEqual(ret.lookups, {'filters': 'location_level'})

    def test_create_automation_filter_type_state(self):
        ret = factory.create_automation_filter_type_state()
        ret_two = factory.create_automation_filter_type_state()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, AutomationFilterType.STATE)
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'state')
        self.assertEqual(ret.lookups, {})

    def test_create_automation_filter_type_country(self):
        ret = factory.create_automation_filter_type_country()
        ret_two = factory.create_automation_filter_type_country()
        # indempotent
        self.assertEqual(ret, ret_two)
        # attrs
        self.assertEqual(ret.key, AutomationFilterType.COUNTRY)
        self.assertEqual(ret.context, settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(ret.field, 'country')
        self.assertEqual(ret.lookups, {})

    def test_create_automation_filter_types(self):
        self.assertEqual(AutomationFilterType.objects.count(), 0)
        factory.create_automation_filter_types()
        self.assertEqual(AutomationFilterType.objects.count(), 5)

        fields = ['priority', 'categories', 'location', 'state', 'country']
        ret_fields = AutomationFilterType.objects.values_list('field', flat=True)
        self.assertEqual(sorted(fields), sorted(ret_fields))
        self.assertEqual(len(set(ret_fields)), 5)


class PriorityFilterTests(TestCase):

    def setUp(self):
        self.automation = factory.create_automation(with_filters=False)

    def test_create_ticket_priority_filter(self):
        priority = create_default(TicketPriority)
        source = factory.create_automation_filter_type_priority()

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
        source = factory.create_automation_filter_type_categories()

        pf = factory.create_ticket_categories_filter()

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(category.id)])

    def test_create_ticket_categories_mid_level_filter(self):
        category = create_repair_category()
        source = factory.create_automation_filter_type_categories()

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
        source = factory.create_automation_filter_type_location()

        pf = factory.create_ticket_location_filter()

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {'filters': 'location_level', 'id': str(location_level.id), 'name': location_level.name})
        self.assertEqual(pf.criteria, [str(location.id)])

    def test_create_ticket_location_filter__with_automation_arg(self):
        location = create_top_level_location()
        location_level = location.location_level
        automation = factory.create_automation()

        pf = factory.create_ticket_location_filter(automation)

        self.assertEqual(pf.automation, automation)

    def test_create_ticket_location_filter__with_location_arg(self):
        location_level = create_location_level(LOCATION_REGION)
        location = create_location(location_level)

        pf = factory.create_ticket_location_filter(location=location)

        self.assertEqual(pf.criteria, [str(location.id)])
        self.assertEqual(pf.lookups, {'filters': 'location_level', 'id': str(location_level.id), 'name': location_level.name})

    def test_create_ticket_location_state_filter(self):
        state = create_contact_state()
        source = factory.create_automation_filter_type_state()

        pf = factory.create_ticket_location_state_filter()

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(state.id)])

    def test_create_ticket_location_state_filter(self):
        country = create_contact_country()
        source = factory.create_automation_filter_type_country()

        pf = factory.create_ticket_location_country_filter()

        self.assertIsInstance(pf.automation, Automation)
        self.assertEqual(pf.source, source)
        self.assertEqual(pf.lookups, {})
        self.assertEqual(pf.criteria, [str(country.id)])

    def test_create_automation_filters(self):
        self.assertEqual(AutomationFilter.objects.count(), 0)
        factory.create_automation_filters()
        self.assertEqual(AutomationFilter.objects.count(), 5)


class AutomationTests(TestCase):

    def test_create_automation(self):
        automation = factory.create_automation()
        self.assertIsInstance(automation, Automation)
        self.assertTrue(automation.description)
        self.assertIsInstance(automation.tenant, Tenant)
        # events
        self.assertEqual(automation.events.count(), 1)
        # actions
        self.assertEqual(automation.actions.count(), 1)
        # automation_filters
        self.assertEqual(automation.filters.count(), 2)
        self.assertEqual(automation.filters.filter(source__field='priority').count(), 1)
        self.assertEqual(automation.filters.filter(source__field='categories').count(), 1)

    def test_create_automation__args(self):
        description = 'foo'
        tenant = get_or_create_tenant('bar')
        with_filters = False
        with_actions = False

        ret = factory.create_automation(description=description, tenant=tenant,
                                        with_actions=with_actions, with_filters=with_filters)

        self.assertEqual(ret.description, description)
        self.assertEqual(ret.tenant, tenant)
        self.assertEqual(ret.actions.count(), 0)
        self.assertEqual(ret.filters.count(), 0)

    def test_create_automations(self):
        self.assertEqual(Automation.objects.count(), 0)
        factory.create_automation_filters()

        factory.create_automations()

        self.assertEqual(Automation.objects.count(), 5)
        # Automations w/ static AutomationFilter.source
        self.assertEqual(Automation.objects.exclude(filters__lookups__filters='location_level').count(), 4)
        # priority
        key = AutomationFilterType.PRIORITY
        x = Automation.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # location
        x = Automation.objects.get(filters__lookups__filters='location_level')
        self.assertIsInstance(x, Automation)
        self.assertEqual(x.description, 'location')
        # category
        key = AutomationFilterType.CATEGORY
        x = Automation.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # state
        key = AutomationFilterType.STATE
        x = Automation.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)
        # country
        key = AutomationFilterType.COUNTRY
        x = Automation.objects.get(filters__source__key=key)
        self.assertEqual(x.description, key)

    def test_upate_automation_names_for_fixtures(self):
        action = factory.create_automation_action_assignee()
        automation = action.automation
        automation.description = 'foo'
        automation.save()
        # filter_name
        automation_filter = automation.filters.first()
        if automation_filter:
            filter_name = automation_filter.source.key
        else:
            filter_name = 'None'
        # action_name
        action_name = action.type.key
        # pre-test
        self.assertNotEqual(automation.description, action_name)

        factory.upate_automation_names_for_fixtures()

        self.assertEqual(
            Automation.objects.get(id=automation.id).description,
            "Filter: {} --- Action: {}".format(filter_name, action_name)
        )
