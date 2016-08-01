from mock import patch

from django.db.models import Q
from django.test import TestCase

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_single_category, REPAIR
from contact.tests.factory import add_office_to_location, create_contact_state, create_contact_country
from location.tests.factory import create_top_level_location
from person.models import Person
from person.tests.factory import create_single_person
from routing.models import (
    Assignment, AssignmentManager, AssignmentQuerySet, AvailableFilter,
    ProfileFilter, AUTO_ASSIGN)
from routing.tests.factory import (
    create_assignment, create_ticket_priority_filter, create_ticket_categories_filter,
    create_auto_assign_filter, create_auto_assign_filter, create_available_filters,
    create_ticket_location_state_filter, create_ticket_location_country_filter,
    create_available_filter_country)
from tenant.tests.factory import get_or_create_tenant
from ticket.models import Ticket, TicketPriority
from ticket.tests.factory import create_ticket
from ticket.tests.factory_related import create_ticket_statuses


class AssignmentManagerTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        create_ticket_statuses()

        self.ticket = create_ticket()
        self.ticket.assignee = None
        self.ticket.location = create_top_level_location()
        self.ticket.save()

        self.category = mommy.make(Category, name=REPAIR)
        self.ticket.categories.add(self.category)

        self.assignment = create_assignment('a')
        # non-maching
        self.assignment_two = create_assignment('b')
        self.filter_two = self.assignment_two.filters.first()
        self.filter_two.criteria = [str(mommy.make(TicketPriority).id)]
        self.filter_two.save()

    def test_setup(self):
        self.assertIsNone(self.ticket.assignee)

        # matching assignment
        self.assertEqual(self.assignment.tenant, self.tenant)

        # non-matching assignment
        self.assertEqual(self.assignment_two.tenant, self.tenant)

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

    # process_ticket - "on Ticket POST" tests

    def test_process_ticket__match(self):
        self.assertIsNone(self.ticket.assignee)
        self.assertTrue(self.assignment.is_match(self.ticket))
        self.assertFalse(self.assignment_two.is_match(self.ticket))

        Assignment.objects.process_ticket(self.tenant.id, self.ticket.id)

        ticket = Ticket.objects.get(id=self.ticket.id)
        self.assertEqual(ticket.assignee, self.assignment.assignee)
        self.assertNotEqual(ticket.assignee, self.assignment_two.assignee)

    def test_process_ticket__no_match(self):
        # filter_one make false
        filter_one = self.assignment.filters.filter(source__field='categories')[0]
        filter_one.criteria = [str(create_single_category().id)]
        filter_one.save()
        self.assertFalse(filter_one.is_match(self.ticket))
        self.assertFalse(self.assignment.is_match(self.ticket))
        # no assignee
        self.assertIsNone(self.ticket.assignee)
        # all assignment profiles false
        for assignment in Assignment.objects.filter(tenant__id=self.tenant.id):
            self.assertFalse(assignment.is_match(self.ticket))

        Assignment.objects.process_ticket(self.tenant.id, self.ticket.id)

        ticket = Ticket.objects.get(id=self.ticket.id)
        self.assertIsNone(ticket.assignee)

    def test_process_ticket__both_match_so_determined_by_order(self):
        # 1st matching
        assignment_three = create_assignment('c')
        assignment_three.order = 0
        assignment_three.save()
        self.assertEqual(assignment_three.order, 0)
        self.assertTrue(assignment_three.is_match(self.ticket))
        # 2nd matching
        self.assertEqual(self.assignment.order, 1)
        self.assertTrue(self.assignment.is_match(self.ticket))
        # processed Ticket should get the first matching AP assignee
        self.assertIsNone(self.ticket.assignee)

        Assignment.objects.process_ticket(self.ticket.location.location_level.tenant.id,
                                          self.ticket.id)

        ticket = Ticket.objects.get(id=self.ticket.id)
        self.assertEqual(ticket.assignee, assignment_three.assignee)

    def test_process_ticket__process_assign_attr_on_role_is_false(self):
        # the creator's role.process_assign == False, so assign the ticket
        # automatically to it's creator
        creator = create_single_person()
        creator.role.process_assign = False
        creator.role.save()
        self.ticket.creator = creator
        self.ticket.save()
        self.assertFalse(self.ticket.creator.role.process_assign)
        # auto-assign filter
        auto_assign_filter = create_auto_assign_filter()
        self.assignment.filters.add(auto_assign_filter)
        # person is different, so would expect the auto-assign filter to be
        # used, but if role.process_assign == False, that takes precedence
        self.assertNotEqual(self.assignment.assignee, creator)
        self.assertIsNone(self.ticket.assignee)

        Assignment.objects.process_ticket(self.assignment.tenant.id, self.ticket.id)

        ticket = Ticket.objects.get(id=self.ticket.id)
        self.assertEqual(ticket.assignee, creator)

    def test_auto_assign_filter_in_use(self):
        self.assertFalse(Assignment.objects.auto_assign_filter_in_use(self.tenant))

        auto_assign_filter = create_auto_assign_filter()
        self.assignment.filters.add(auto_assign_filter)
        self.assertTrue(Assignment.objects.filter(tenant=self.tenant, filters__source__field=AUTO_ASSIGN).exists())

        ret = Assignment.objects.auto_assign_filter_in_use(self.tenant)

        self.assertTrue(ret)


class AssignmentTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant()
        self.assignment = create_assignment()
        self.ticket = create_ticket()
        self.ticket.location = create_top_level_location()
        self.ticket.save()

    def test_meta__ordering(self):
        # order by ascending 'order' b/c this demostrates processing order
        self.assertEqual(Assignment._meta.ordering, ['order'])

    def test_fields(self):
        self.assertIsInstance(self.assignment.description, str)
        self.assertIsInstance(self.assignment.assignee, Person)

    def test_manager(self):
        self.assertIsInstance(Assignment.objects, AssignmentManager)

    def test_order_increments_by_tenant(self):
        self.assertEqual(self.assignment.order, 1)

        assignment2 = create_assignment()
        self.assertEqual(assignment2.order, 2)

        # tenant 2
        tenant_two = get_or_create_tenant('foo')
        assignment3 = create_assignment(tenant=tenant_two)
        self.assertEqual(assignment3.order, 1)
        assignment4 = create_assignment(tenant=tenant_two)
        self.assertEqual(assignment4.order, 2)

    def test_is_match__true(self):
        # raw logic test
        matches = []
        for f in self.assignment.filters.all():
            if f.is_match(self.ticket):
                matches.append(True)
            else:
                matches.append(False)
        self.assertTrue(all(matches))

        ret = self.assignment.is_match(self.ticket)

        self.assertTrue(ret)

    def test_is_match__false(self):
        self.assertEqual(self.assignment.filters.count(), 2)
        filter_one = self.assignment.filters.filter(source__field='categories')[0]
        filter_two = self.assignment.filters.exclude(id=filter_one.id)[0]
        filter_one.criteria = [str(create_single_category().id)]
        filter_one.save()
        self.assertFalse(filter_one.is_match(self.ticket))
        self.assertTrue(filter_two.is_match(self.ticket))

        ret = self.assignment.is_match(self.ticket)

        self.assertFalse(ret)

    def test_is_match__auto_assign(self):
        self.assertEqual(self.assignment.filters.count(), 2)
        filter_one = self.assignment.filters.filter(source__field='categories')[0]
        filter_two = self.assignment.filters.exclude(id=filter_one.id)[0]
        filter_one.criteria = [str(create_single_category().id)]
        filter_one.save()
        # the below line assertion of False, says that this Ticket
        # shouldn't match, but it has an "auto_assign" filter, so
        # it's an automatic match
        self.assertFalse(filter_one.is_match(self.ticket))
        self.assertTrue(filter_two.is_match(self.ticket))
        # add auto_assign filter
        auto_assign_filter = create_auto_assign_filter()
        self.assignment.filters.add(auto_assign_filter)

        ret = self.assignment.is_match(self.ticket)

        self.assertTrue(ret)

class AvailableFilterTests(TestCase):

    def setUp(self):
        create_available_filters()

    def test_is_state_filter(self):
        count = 0
        for af in AvailableFilter.objects.all():
            if af.is_state_filter:
                count += 1
        self.assertEqual(count, 1)

    def test_is_country_filter(self):
        ret = create_available_filter_country()
        self.assertTrue(ret.is_country_filter)


class ProfileFilterTests(TestCase):

    def setUp(self):
        self.pf = create_ticket_priority_filter()
        self.cf = create_ticket_categories_filter()
        create_single_person()
        self.ticket = create_ticket()
        # address setup
        add_office_to_location(self.ticket.location)
        self.office_address = self.ticket.location.addresses.first()
        self.state = create_contact_state()
        self.office_address.state = self.state
        self.country = create_contact_country()
        self.office_address.country = self.country
        self.office_address.save()

    def test_meta__ordering(self):
        # order by id, so that way are returned to User in the same order
        # each time if nested in the Assignment Detail view
        self.assertEqual(ProfileFilter._meta.ordering, ['id'])

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
        self.assertIn(str(self.office_address.state.id), state_filter.criteria)

        ret = state_filter.is_match(self.ticket)

        self.assertTrue(ret)

    @patch("routing.models.ProfileFilter._is_address_match")
    def test_is_match__location_state__false__no_a_state_filter(self, mock_func):
        self.assertFalse(self.pf.source.is_state_filter)
        self.assertTrue(self.ticket.location.is_office_or_store)

        self.assertFalse(mock_func.called)

    @patch("routing.models.ProfileFilter._is_address_match")
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

    @patch("routing.models.ProfileFilter._is_address_match")
    def test_is_match__location_country__false__no_a_country_filter(self, mock_func):
        self.assertFalse(self.pf.source.is_country_filter)
        self.assertTrue(self.ticket.location.is_office_or_store)

        self.assertFalse(mock_func.called)

    @patch("routing.models.ProfileFilter._is_address_match")
    def test_is_match__location_country__false__location_is_not_an_office(self, mock_func):
        country_filter = create_ticket_location_country_filter()
        self.ticket.location.addresses.remove(self.office_address)
        # pre-test
        self.assertTrue(country_filter.source.is_country_filter)
        self.assertFalse(self.ticket.location.is_office_or_store)

        self.assertFalse(mock_func.called)
