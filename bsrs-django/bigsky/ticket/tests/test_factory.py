import sys

from django.test import TestCase

from category.models import Category
from category.tests.factory import create_categories
from location.models import Location
from location.tests.factory import create_location
from person.models import Person
from person.tests.factory import create_single_person, DistrictManager
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUSES, TICKET_PRIORITIES, TICKET_ACTIVITY_TYPES)
from ticket.tests import factory
from utils.helpers import generate_uuid


class CreateTicketTests(TestCase):

    def setUp(self):
        create_categories()
        self.person = create_single_person()
        self.ticket = factory.create_ticket()

    def test_location(self):
        self.assertIsInstance(self.ticket.location, Location)
        self.assertIn(
            self.ticket.location,
            self.person.locations.all()
        )

    def test_status(self):
        self.assertIsInstance(self.ticket.status, TicketStatus)

    def test_priority(self):
        self.assertIsInstance(self.ticket.priority, TicketPriority)

    def test_assignee(self):
        self.assertIsInstance(self.ticket.assignee, Person)

    def test_cc(self):
        self.assertIsInstance(self.ticket.cc.all()[0], Person)

    def test_category(self):
        self.assertIsInstance(self.ticket.categories.all()[0], Category)

    # TODO: need to create a factory method to get this test to pass.
    # def test_attachments(self):
    #     self.assertIsInstance(self.ticket.attachments[0], Attachment)

    def test_request(self):
        self.assertIsInstance(self.ticket.request, str)

    def test_number(self):
        self.assertIsInstance(self.ticket.number, int)


class CreateTicketKwargTests(TestCase):

    def test_ticket_request_and_requester(self):
        person = create_single_person()
        request = 'foo'
        ticket = factory.create_ticket(request=request)
        self.assertEqual(ticket.request, request)
        self.assertIsNotNone(ticket.requester)

    def test_ticket_assignee(self):
        person = create_single_person()
        ticket = factory.create_ticket(assignee=person)
        self.assertEqual(ticket.assignee, person)


class CreateTicketWithSingleCategoryKwargTests(TestCase):

    def setUp(self):
        self.dm = DistrictManager()

    def test_defualts(self):
        ticket = factory.create_ticket_with_single_category()

        self.assertIsInstance(ticket.assignee, Person)
        self.assertIn(
            ticket.location,
            ticket.assignee.locations.all()
        )
        self.assertIn(
            ticket.categories.first(),
            ticket.assignee.role.categories.all()
        )

    def test_explicit(self):
        request = 'foo'
        assignee = create_single_person()
        ticket = factory.create_ticket_with_single_category(
            request=request, assignee=self.dm.person)

        self.assertEqual(ticket.request, request)
        self.assertEqual(ticket.assignee, self.dm.person)
        self.assertIn(ticket.location, self.dm.person.locations.all())
        self.assertIn(
            self.dm.role.categories.first(),
            ticket.categories.all()
        )



class CreateExtraTicketWithCategoriesTests(TestCase):

    def setUp(self):
        factory.create_extra_ticket_with_categories()
        self.ticket = Ticket.objects.get(request="seven")

    def test_ticket(self):
        self.assertIsInstance(self.ticket, Ticket)

    def test_categories(self):
        loss_prevention, _ = Category.objects.get_or_create(name="Loss Prevention", subcategory_label="trade")
        locks, _ = Category.objects.get_or_create(name="Locks", parent=loss_prevention, subcategory_label="issue")
        a_locks, _ = Category.objects.get_or_create(name="A Lock", parent=locks)

        self.assertIn(loss_prevention, self.ticket.categories.all())
        self.assertIn(locks, self.ticket.categories.all())
        self.assertIn(a_locks, self.ticket.categories.all())


class ConstructTreeTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()
        self.ticket = factory.create_ticket()

    def test_categories(self):
        top_level = Category.objects.filter(parent__isnull=True).first()
        # add child Category(s)
        categories = Category.objects.exclude(parent__isnull=True)
        top_level.children.add(categories[0])

        self.categories = factory.construct_tree(top_level, [])

        self.assertTrue(len(self.categories) >= 2)


class CreateTicketsTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()

    def test_default(self):
        tickets = factory.create_tickets()
        self.assertEqual(len(tickets), 1)
        self.assertIsInstance(tickets[0], Ticket)

    def test_many(self):
        tickets = factory.create_tickets(_many=2)
        self.assertEqual(len(tickets), 2)
        self.assertIsInstance(tickets[0], Ticket)

    def test_generate_uuid(self):
        """
        'test' is removed from ``sys.argv`` in order to trigger the static
        generator for UUIDs.
        """
        global sys
        sys.argv = ''
        incr = Ticket.objects.count()

        ret = factory.create_ticket()

        self.assertEqual(
            str(ret.id),
            generate_uuid(factory.TICKET_BASE_ID, incr+1)
        )

class CreateTicketsWithSingleCategory(TestCase):

    def setUp(self):
        self.dm = DistrictManager()
        self.person = self.dm.person

    def test_create(self):
        tickets = factory.create_tickets_with_single_category(assignee=self.person, _many=3)

        self.assertEqual(len(tickets), 3)
        for t in tickets:
            self.assertIsInstance(t, Ticket)
            self.assertEqual(t.categories.count(), 1)
            self.assertEqual(t.categories.first(), self.person.role.categories.first())
            self.assertIn(t.location, self.person.locations.all())


class CreateStatusTests(TestCase):

    def test_single(self):
        obj = factory.create_ticket_status()
        self.assertIsInstance(obj, TicketStatus)
        self.assertIn(obj.name, TICKET_STATUSES)

    def test_multiple(self):
        factory.create_ticket_statuses()
        self.assertTrue(TicketStatus.objects.count() > 1)
        self.assertEqual(TicketStatus.objects.first().name, 'ticket.status.draft')
        self.assertEqual(TicketStatus.objects.all()[1].name, 'ticket.status.new')
        self.assertEqual(TicketStatus.objects.all()[2].name, 'ticket.status.in_progress')
        self.assertEqual(TicketStatus.objects.all()[3].name, 'ticket.status.deferred')
        self.assertEqual(TicketStatus.objects.all()[4].name, 'ticket.status.denied')
        self.assertEqual(TicketStatus.objects.all()[5].name, 'ticket.status.problem_solved')
        self.assertEqual(TicketStatus.objects.all()[6].name, 'ticket.status.completed')
        self.assertEqual(TicketStatus.objects.all()[7].name, 'ticket.status.closed')
        self.assertEqual(TicketStatus.objects.last().name, 'ticket.status.unsatisfactory_completion')

    def test_generate_uuid(self):
        """
        'test' is removed from ``sys.argv`` in order to trigger the static
        generator for UUIDs.
        """
        global sys
        sys.argv = ''
        incr = TicketStatus.objects.count()

        ret = factory.create_ticket_status()

        self.assertEqual(
            str(ret.id),
            generate_uuid(factory.TICKET_STATUS_BASE_ID, incr+1)
        )


class CreatePriorityTests(TestCase):

    def test_single(self):
        obj = factory.create_ticket_priority()
        self.assertIsInstance(obj, TicketPriority)
        self.assertIn(obj.name, TICKET_PRIORITIES)

    def test_multiple(self):
        factory.create_ticket_priorites()
        self.assertTrue(TicketPriority.objects.all())
        self.assertEqual(TicketPriority.objects.first().name, 'ticket.priority.emergency')
        self.assertEqual(TicketPriority.objects.all()[1].name, 'ticket.priority.high')
        self.assertEqual(TicketPriority.objects.all()[2].name, 'ticket.priority.medium')
        self.assertEqual(TicketPriority.objects.last().name, 'ticket.priority.low')

    def test_generate_uuid(self):
        """
        'test' is removed from ``sys.argv`` in order to trigger the static
        generator for UUIDs.
        """
        global sys
        sys.argv = ''
        incr = TicketPriority.objects.count()

        ret = factory.create_ticket_priority()

        self.assertEqual(
            str(ret.id),
            generate_uuid(factory.TICKET_PRIORITY_BASE_ID, incr+1)
        )


class CreateTicketActivityTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()

    def test_create(self):
        obj = factory.create_ticket_activity()
        self.assertIsInstance(obj, TicketActivity)

    def test_create_for_ticket(self):
        ticket = factory.create_ticket()
        ticket_activity = factory.create_ticket_activity(ticket=ticket)
        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.ticket, ticket)


class CreateTicketsActivityTypesTests(TestCase):

    def test_create(self):
        obj = factory.create_ticket_activity_type()
        self.assertIsInstance(obj, TicketActivityType)
        self.assertIn(obj.name, TICKET_ACTIVITY_TYPES)
