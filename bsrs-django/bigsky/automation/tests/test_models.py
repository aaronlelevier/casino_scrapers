from mock import patch

from django.test import TestCase

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_single_category, REPAIR
from contact.models import Address, AddressType
from contact.tests.factory import (
    create_contact, add_office_to_location, create_contact_state, create_contact_country)
from location.tests.factory import create_top_level_location
from person.models import Person
from person.tests.factory import create_single_person
from automation.models import (
    AutomationEvent, Automation, AutomationManager, AutomationQuerySet,
    AutomationActionType, AutomationFilterType, AutomationFilter, AutomationAction)
from automation.tests.factory import (
    create_automation, create_ticket_priority_filter, create_ticket_categories_filter,
    create_automation_filter_types, create_ticket_location_state_filter,
    create_automation_filter_type_state, create_ticket_location_country_filter,
    create_automation_filter_type_country, create_automation_action_type,
    create_automation_action_send_email, create_automation_action_send_sms,
    create_automation_event)
from tenant.tests.factory import get_or_create_tenant
from ticket.models import TicketPriority, TicketStatus
from ticket.tests.factory import create_ticket
from ticket.tests.factory_related import create_ticket_statuses
from utils.helpers import create_default, clear_related


class SetupMixin(object):

    def setUp(self):
        self.person = create_single_person()
        self.ticket = create_ticket()
        self.ticket.status = create_default(TicketStatus)
        self.ticket.priority = create_default(TicketPriority)
        self.ticket.save()


class AutomationEventTests(TestCase):

    def test_key_choices(self):
        field = AutomationEvent._meta.get_field('key')
        self.assertEqual([(a) for a,b in field.choices], AutomationEvent.ALL)

    def test_meta(self):
        self.assertEqual(AutomationEvent._meta.ordering, ['key'])

    def test_str(self):
        event = create_automation_event()
        self.assertEqual(str(event), event.key)


class AutomationManagerTests(SetupMixin, TestCase):

    def setUp(self):
        super(AutomationManagerTests, self).setUp()

        self.tenant = self.person.role.tenant
        create_ticket_statuses()

        self.ticket.assignee = None
        self.ticket.location = create_top_level_location()
        self.ticket.save()

        self.category = mommy.make(Category, name=REPAIR)
        self.ticket.categories.add(self.category)

        self.automation = create_automation('a')
        self.event = self.automation.events.first()
        # non-maching
        self.automation_two = create_automation('b')
        self.event_two = self.automation.events.first()
        self.filter_two = self.automation_two.filters.first()
        self.filter_two.criteria = [str(mommy.make(TicketPriority).id)]
        self.filter_two.save()

    def test_setup(self):
        # matching automation
        self.assertEqual(self.automation.tenant, self.tenant)

        # non-matching automation
        self.assertEqual(self.automation_two.tenant, self.tenant)

    def test_queryset_cls(self):
        self.assertEqual(AutomationManager.queryset_cls, AutomationQuerySet)

    def test_deleted_not_present(self):
        self.assertEqual(Automation.objects.count(), 2)
        self.assertEqual(Automation.objects_all.count(), 2)

        self.automation.delete()

        self.assertEqual(Automation.objects.count(), 1)
        self.assertEqual(Automation.objects_all.count(), 2)

    def test_search_multi(self):
        self.assertEqual(Automation.objects.count(), 2)
        keyword = self.automation.description

        raw_ret = Automation.objects.filter(description=keyword)

        ret = Automation.objects.search_multi(keyword)

        self.assertEqual(ret.count(), raw_ret.count())

    # process_ticket - "on Ticket POST" tests

    @patch("automation.models.AutomationManager.process_actions")
    def test_process_ticket__calls_process_actions(self, mock_func):
        self.assertTrue(self.automation.is_match(self.ticket))
        self.assertFalse(self.automation_two.is_match(self.ticket))

        ret = Automation.objects.process_ticket(self.tenant.id, self.ticket, self.event.key)

        self.assertEqual(mock_func.call_args[0][0], self.automation)
        self.assertEqual(mock_func.call_args[0][1], self.ticket)
        self.assertEqual(mock_func.call_args[0][2], self.event.key)

    @patch("automation.models.AutomationManager.process_actions")
    def test_process_ticket__no_match(self, mock_func):
        # filter_one make false
        filter_one = self.automation.filters.filter(source__field='categories')[0]
        filter_one.criteria = [str(create_single_category().id)]
        filter_one.save()
        self.assertFalse(filter_one.is_match(self.ticket))
        self.assertFalse(self.automation.is_match(self.ticket))
        # no assignee
        self.assertIsNone(self.ticket.assignee)
        # all automation filters false
        for automation in Automation.objects.filter(tenant__id=self.tenant.id):
            self.assertFalse(automation.is_match(self.ticket))

        Automation.objects.process_ticket(self.tenant.id, self.ticket, self.event.key)

        self.assertFalse(mock_func.called)

    @patch("automation.models.AutomationManager.process_actions")
    def test_process_ticket__two_match_so_process_actions_called_twice(self, mock_func):
        automation_three = create_automation('AAAA')
        # both match
        self.assertTrue(automation_three.is_match(self.ticket))
        self.assertTrue(self.automation.is_match(self.ticket))

        Automation.objects.process_ticket(self.ticket.location.location_level.tenant.id,
                                          self.ticket, self.event.key)

        self.assertEqual(mock_func.call_count, 2)

    def test_process_ticket__process_assign_attr_on_role_is_false(self):
        # the creator's role.process_assign == False, so assign the ticket
        # automatically to it's creator
        creator = create_single_person()
        creator.role.process_assign = False
        creator.role.save()
        self.ticket.creator = creator
        self.ticket.save()
        self.assertFalse(self.ticket.creator.role.process_assign)
        # creator is not the assignee.If role.process_assign == False,
        # that takes precedence and the creator will be assigned
        self.ticket.assignee = None
        self.assertIsNone(self.ticket.assignee)

        ret = Automation.objects.process_ticket(self.automation.tenant.id, self.ticket, self.event.key)

        self.assertEqual(self.ticket.assignee, creator)
        self.assertEqual(self.ticket.status.name, TicketStatus.IN_PROGRESS)

    # process_actions

    def test_process_actions__assign_assignee_to_ticket(self):
        self.assertIsNone(self.ticket.assignee)
        self.assertEqual(self.automation.actions.count(), 1)
        action = self.automation.actions.first()
        self.assertEqual(action.type.key, AutomationActionType.TICKET_ASSIGNEE)
        action_assignee_id = action.content['assignee']
        action_assignee = Person.objects.get(id=action_assignee_id)

        Automation.objects.process_actions(self.automation, self.ticket, self.event.key)

        self.assertEqual(self.ticket.assignee, action_assignee)
        self.assertEqual(self.ticket.status.name, TicketStatus.IN_PROGRESS)

    def test_process_actions__ticket_priority(self):
        clear_related(self.automation, 'actions')
        ticket_priority = mommy.make(TicketPriority)
        priority_action_type = create_automation_action_type(AutomationActionType.TICKET_PRIORITY)
        action = mommy.make(AutomationAction, automation=self.automation,
                            type=priority_action_type, content={'priority': ticket_priority.id})
        # pre-test
        self.assertEqual(self.automation.actions.count(), 1)
        self.assertEqual(self.automation.actions.first(), action)
        self.assertTrue(self.automation.is_match(self.ticket))
        self.assertNotEqual(self.ticket.priority, ticket_priority)

        Automation.objects.process_actions(self.automation, self.ticket, self.event.key)

        self.assertEqual(self.ticket.priority, ticket_priority)

    def test_process_actions__ticket_status(self):
        clear_related(self.automation, 'actions')
        ticket_status = mommy.make(TicketStatus)
        status_action_type = create_automation_action_type(AutomationActionType.TICKET_STATUS)
        action = mommy.make(AutomationAction, automation=self.automation,
                            type=status_action_type, content={'status': ticket_status.id})
        # pre-test
        self.assertEqual(self.automation.actions.count(), 1)
        self.assertEqual(self.automation.actions.first(), action)
        self.assertTrue(self.automation.is_match(self.ticket))
        self.assertNotEqual(self.ticket.status, ticket_status)

        Automation.objects.process_actions(self.automation, self.ticket, self.event.key)

        self.assertEqual(self.ticket.status, ticket_status)

    @patch("contact.models.EmailManager.process_send_email")
    def test_process_actions__send_email(self, mock_func):
        clear_related(self.automation, 'actions')
        action = create_automation_action_send_email(self.automation)
        # pre-test
        self.assertEqual(self.automation.actions.count(), 1)
        self.assertEqual(self.automation.actions.first(), action)
        self.assertTrue(self.automation.is_match(self.ticket))

        Automation.objects.process_actions(self.automation, self.ticket, self.event.key)

        self.assertEqual(mock_func.call_args[0][0], self.ticket)
        self.assertEqual(mock_func.call_args[0][1], action)
        self.assertEqual(mock_func.call_args[0][2], self.event.key)

    @patch("contact.models.PhoneNumberManager.process_send_sms")
    def test_process_actions__send_sms(self, mock_func):
        clear_related(self.automation, 'actions')
        action = create_automation_action_send_sms(self.automation)
        # pre-test
        self.assertEqual(self.automation.actions.count(), 1)
        self.assertEqual(self.automation.actions.first(), action)
        self.assertTrue(self.automation.is_match(self.ticket))

        Automation.objects.process_actions(self.automation, self.ticket, self.event.key)

        self.assertEqual(mock_func.call_args[0][0], action)


class AutomationTests(SetupMixin, TestCase):

    def setUp(self):
        super(AutomationTests, self).setUp()

        self.tenant = get_or_create_tenant()
        self.automation = create_automation()

        self.ticket.location = create_top_level_location()
        self.ticket.save()

        self.ticket.categories.clear()
        category_filter = self.automation.filters.filter(source__field='categories')[0]
        category = Category.objects.get(id=category_filter.criteria[0])
        self.ticket.categories.add(category)

    def test_export_fields(self):
        export_fields = ['description']

        self.assertEqual(Automation.EXPORT_FIELDS, export_fields)

    def test_i18n_header_fields(self):
        raw_headers = [
            ('description', 'admin.automation.description'),
        ]

        ret = Automation.I18N_HEADER_FIELDS

        self.assertEqual(ret, [x[1] for x in raw_headers])

    def test_filter_export_data__queryset_matches_export_fields(self):
        automation = Automation.objects.filter_export_data().first()
        for f in Automation.EXPORT_FIELDS:
            self.assertTrue(hasattr(automation, f))

    def test_manager(self):
        self.assertIsInstance(Automation.objects, AutomationManager)

    def test_meta__ordering(self):
        # this demostrates processing order
        self.assertEqual(Automation._meta.ordering, ['description'])

    def test_has_filters(self):
        self.assertTrue(self.automation.filters.first())
        self.assertTrue(self.automation.has_filters)

        clear_related(self.automation, 'filters')

        self.assertFalse(self.automation.filters.first())
        self.assertFalse(self.automation.has_filters)

    def test_is_match__true(self):
        # raw logic test
        matches = []
        for f in self.automation.filters.all():
            if f.is_match(self.ticket):
                matches.append(True)
            else:
                matches.append(False)
        self.assertTrue(all(matches))

        ret = self.automation.is_match(self.ticket)

        self.assertTrue(ret)

    def test_is_match__false(self):
        self.assertEqual(self.automation.filters.count(), 2)
        filter_one = self.automation.filters.filter(source__field='categories')[0]
        filter_two = self.automation.filters.exclude(id=filter_one.id)[0]
        filter_one.criteria = [str(create_single_category().id)]
        filter_one.save()
        self.assertFalse(filter_one.is_match(self.ticket))
        self.assertTrue(filter_two.is_match(self.ticket))

        ret = self.automation.is_match(self.ticket)

        self.assertFalse(ret)


class AutomationFilterTypeTests(TestCase):

    def setUp(self):
        create_automation_filter_types()

    def test_is_state_filter(self):
        ret = create_automation_filter_type_state()
        self.assertIsInstance(ret, AutomationFilterType)
        self.assertTrue(ret.is_state_filter)

    def test_is_country_filter(self):
        ret = create_automation_filter_type_country()
        self.assertIsInstance(ret, AutomationFilterType)
        self.assertTrue(ret.is_country_filter)


class AutomationFilterTests(SetupMixin, TestCase):

    def setUp(self):
        super(AutomationFilterTests, self).setUp()

        self.pf = create_ticket_priority_filter()
        self.cf = create_ticket_categories_filter()
        # address setup
        add_office_to_location(self.ticket.location)
        self.office_address = self.ticket.location.addresses.first()
        self.state_ca = create_contact_state()
        self.office_address.state = self.state_ca
        self.country = create_contact_country()
        self.office_address.country = self.country
        self.office_address.save()

    def test_meta__ordering(self):
        # order by id, so that way are returned to User in the same order
        # each time if nested in the Automation Detail view
        self.assertEqual(AutomationFilter._meta.ordering, ['id'])

    def test_is_match__foreign_key__true(self):
        self.assertIn(str(self.ticket.priority.id), self.pf.criteria)
        self.assertTrue(self.pf.is_match(self.ticket))

    def test_is_match__foreign_key__false(self):
        self.ticket.priority = mommy.make(TicketPriority)
        self.ticket.save()
        self.assertNotIn(str(self.ticket.priority.id), self.pf.criteria)
        self.assertFalse(self.pf.is_match(self.ticket))

    def test_is_match__many_to_many__true(self):
        self.category = Category.objects.get(id=self.cf.criteria[0])
        self.ticket.categories.add(self.category)

        category_ids = (str(x) for x in self.ticket.categories.values_list('id', flat=True))
        self.assertTrue(set(category_ids).intersection(set(self.cf.criteria)))
        self.assertTrue(self.cf.is_match(self.ticket))

    def test_is_match__many_to_many__false(self):
        category_ids = (str(x) for x in self.ticket.categories.values_list('id', flat=True))
        self.assertFalse(set(category_ids).intersection(set(self.cf.criteria)))
        self.assertFalse(self.cf.is_match(self.ticket))

    def test_is_match__location_state__true(self):
        state_filter = create_ticket_location_state_filter()
        # pre-test
        self.assertTrue(state_filter.source.is_state_filter)
        self.assertTrue(self.ticket.location.is_office_or_store)
        self.assertIn(self.office_address, self.ticket.location.addresses.all())
        self.assertIn(str(self.office_address.state.id), state_filter.criteria)

        ret = state_filter.is_match(self.ticket)

        self.assertTrue(ret)

    def test_is_match__location_state__false(self):
        state_filter = create_ticket_location_state_filter()
        state_filter.criteria = []
        state_filter.save()
        # pre-test
        self.assertTrue(state_filter.source.is_state_filter)
        self.assertTrue(self.ticket.location.is_office_or_store)
        self.assertIn(self.office_address, self.ticket.location.addresses.all())
        self.assertNotIn(str(self.office_address.state.id), state_filter.criteria)

        ret = state_filter.is_match(self.ticket)

        self.assertFalse(ret)

    @patch("automation.models.AutomationFilter._is_address_match")
    def test_is_match__location_state__false__not_a_state_filter(self, mock_func):
        self.assertFalse(self.pf.source.is_state_filter)
        self.assertTrue(self.ticket.location.is_office_or_store)

        self.assertFalse(mock_func.called)

    @patch("automation.models.AutomationFilter._is_address_match")
    def test_is_match__location_state__false__location_is_not_an_office(self, mock_func):
        state_filter = create_ticket_location_state_filter()
        self.ticket.location.addresses.remove(self.office_address)
        # pre-test
        self.assertTrue(state_filter.source.is_state_filter)
        self.assertFalse(self.ticket.location.is_office_or_store)

        self.assertFalse(mock_func.called)

    def test_is_match__location_country__true(self):
        country_filter = create_ticket_location_country_filter()
        # pre-test
        self.assertTrue(country_filter.source.is_country_filter)
        self.assertTrue(self.ticket.location.is_office_or_store)
        self.assertIn(str(self.office_address.country.id), country_filter.criteria)

        ret = country_filter.is_match(self.ticket)

        self.assertTrue(ret)

    def test_is_match__location_country__false(self):
        country_filter = create_ticket_location_country_filter()
        country_filter.criteria = []
        country_filter.save()
        # pre-test
        self.assertTrue(country_filter.source.is_country_filter)
        self.assertTrue(self.ticket.location.is_office_or_store)
        self.assertNotIn(str(self.office_address.country.id), country_filter.criteria)

        ret = country_filter.is_match(self.ticket)

        self.assertFalse(ret)

    @patch("automation.models.AutomationFilter._is_address_match")
    def test_is_match__location_country__false__no_a_country_filter(self, mock_func):
        self.assertFalse(self.pf.source.is_country_filter)
        self.assertTrue(self.ticket.location.is_office_or_store)

        self.assertFalse(mock_func.called)

    @patch("automation.models.AutomationFilter._is_address_match")
    def test_is_match__location_country__false__location_is_not_an_office(self, mock_func):
        country_filter = create_ticket_location_country_filter()
        self.ticket.location.addresses.remove(self.office_address)
        # pre-test
        self.assertTrue(country_filter.source.is_country_filter)
        self.assertFalse(self.ticket.location.is_office_or_store)

        self.assertFalse(mock_func.called)

    def test_is_match__state_or_country_filter__and_not_office_or_store(self):
        # address
        self.assertEqual(self.ticket.location.addresses.count(), 1)
        address = self.ticket.location.addresses.first()
        address.type = mommy.make(AddressType, name='foo')
        address.save()
        self.assertFalse(self.ticket.location.is_office_or_store)
        # state filter
        state_filter = create_ticket_location_state_filter()
        self.assertEqual([str(self.state_ca.id)], state_filter.criteria)

        ret = state_filter.is_match(self.ticket)

        self.assertFalse(ret)

        # country filter
        country_filter = create_ticket_location_country_filter()
        self.assertEqual([str(self.country.id)], country_filter.criteria)

        ret = country_filter.is_match(self.ticket)

        self.assertFalse(ret)

    def test_is_match__location_address_should_only_check_offices_and_store_types(self):
        state_nv = create_contact_state("NV")
        self.office_address.state = state_nv
        self.office_address.save()
        self.assertIn(self.office_address, self.ticket.location.addresses.all())
        self.assertTrue(self.office_address.is_office_or_store)
        address_two = create_contact(Address, self.ticket.location)
        address_two.state = self.state_ca
        address_two.save()
        self.assertIn(address_two, self.ticket.location.addresses.all())
        # even though the "State" requirement is met, the address isn't
        # an office or store type, so it's ignored in the matching
        self.assertFalse(address_two.is_office_or_store)

        state_filter = create_ticket_location_state_filter()
        self.assertEqual([str(self.state_ca.id)], state_filter.criteria)

        ret = state_filter.is_match(self.ticket)

        self.assertFalse(ret)
