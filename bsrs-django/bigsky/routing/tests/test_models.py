from django.db import models
from django.db.models import Q
from django.test import TestCase

from model_mommy import mommy

from location.tests.factory import create_location, create_top_level_location
from person.models import Person
from person.tests.factory import create_single_person
from routing.models import Assignment, AssignmentManager, AssignmentQuerySet, ProfileFilter
from routing.tests.factory import create_assignment, create_ticket_priority_filter
from tenant.tests.factory import get_or_create_tenant
from ticket.models import Ticket, TicketPriority, TICKET_PRIORITY_DEFAULT
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
        filter_one = self.assignment.filters.filter(field='location')[0]
        filter_one.criteria = [str(create_location().id)]
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

    def test_is_match_false(self):
        self.assertEqual(self.assignment.filters.count(), 2)
        filter_one = self.assignment.filters.filter(field='location')[0]
        filter_two = self.assignment.filters.exclude(id=filter_one.id)[0]
        filter_one.criteria = [str(create_location().id)]
        filter_one.save()
        self.assertFalse(filter_one.is_match(self.ticket))
        self.assertTrue(filter_two.is_match(self.ticket))

        ret = self.assignment.is_match(self.ticket)

        self.assertFalse(ret)


class ProfilefilterTests(TestCase):

    def setUp(self):
        self.pf = create_ticket_priority_filter()
        create_single_person()
        self.ticket = create_ticket()

    def test_meta__ordering(self):
        # order by id, so that way are returned to User in the same order
        # each time if nested in the Assignment Detail view
        self.assertEqual(ProfileFilter._meta.ordering, ['id'])

    def test_is_match__true(self):
        self.assertIn(str(self.ticket.priority.id), self.pf.criteria)
        self.assertTrue(self.pf.is_match(self.ticket))

    def test_is_match__false(self):
        self.ticket.priority = mommy.make(TicketPriority)
        self.ticket.save()
        self.assertNotIn(str(self.ticket.priority.id), self.pf.criteria)
        self.assertFalse(self.pf.is_match(self.ticket))

    def test_get_filter_criteria(self):
        ret = self.pf.filter_criteria

        self.assertIsInstance(ret, models.query.QuerySet)
        self.assertEqual(ret.count(), 1)
        self.assertIsInstance(ret.first(), TicketPriority)
        priority = TicketPriority.objects.get(name=TICKET_PRIORITY_DEFAULT)
        self.assertEqual(ret.first().id, priority.id)
