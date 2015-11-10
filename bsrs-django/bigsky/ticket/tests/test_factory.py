from django.test import TestCase

from category.models import Category
from location.models import Location
from person.models import Person
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUSES, TICKET_PRIORITIES, TICKET_ACTIVITY_TYPES)
from ticket.tests import factory
from person.tests.factory import create_single_person


class CreateTicketTests(TestCase):

    def setUp(self):
        create_single_person()
        self.ticket = factory.create_ticket()

    def test_location(self):
        self.assertIsInstance(self.ticket.location, Location)

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

    def test_requester(self):
        self.assertIsInstance(self.ticket.requester, Person)

    # TODO: need to create a factory method to get this test to pass.
    # def test_attachments(self):
    #     self.assertIsInstance(self.ticket.attachments[0], Attachment)

    def test_request(self):
        self.assertIsInstance(self.ticket.request, str)

    def test_number(self):
        self.assertIsInstance(self.ticket.number, int)


class ConstructTreeTests(TestCase):

    def setUp(self):
        create_single_person()
        self.ticket = factory.create_ticket()

    def test_categories(self):
        top_level = Category.objects.filter(parent__isnull=True).first()
        self.categories = factory.construct_tree(top_level, [])
        self.assertTrue(len(self.categories) >= 2)


class CreateTicketsTests(TestCase):

    def test_default(self):
        create_single_person()
        tickets = factory.create_tickets()
        self.assertEqual(len(tickets), 1)
        self.assertIsInstance(tickets[0], Ticket)

    def test_many(self):
        create_single_person()
        tickets = factory.create_tickets(_many=2)
        self.assertEqual(len(tickets), 2)
        self.assertIsInstance(tickets[0], Ticket)


class CreateStatusTests(TestCase):

    def test_single(self):
        obj = factory.create_ticket_status()
        self.assertIsInstance(obj, TicketStatus)
        self.assertIn(obj.name, TICKET_STATUSES)

    def test_multiple(self):
        factory.create_ticket_statuses()
        self.assertTrue(TicketStatus.objects.count() > 1)


class CreatePriorityTests(TestCase):

    def test_single(self):
        obj = factory.create_ticket_priority()
        self.assertIsInstance(obj, TicketPriority)
        self.assertIn(obj.name, TICKET_PRIORITIES)

    def test_multiple(self):
        factory.create_ticket_priorites()
        self.assertTrue(TicketPriority.objects.all())


class CreateTicketActivityTests(TestCase):

    def test_create(self):
        create_single_person()
        obj = factory.create_ticket_activity()
        self.assertIsInstance(obj, TicketActivity)

    def test_create_for_ticket(self):
        create_single_person()
        ticket = factory.create_ticket()
        ticket_activity = factory.create_ticket_activity(ticket=ticket)
        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.ticket, ticket)


class CreateTicketsActivityTypesTests(TestCase):

    def test_create(self):
        obj = factory.create_ticket_activity_type()
        self.assertIsInstance(obj, TicketActivityType)
        self.assertIn(obj.name, TICKET_ACTIVITY_TYPES)
