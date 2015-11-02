from django.test import TestCase

from category.models import Category
from generic.models import Attachment
from location.models import Location
from person.models import Person
from person.tests.factory import create_person
from ticket.models import Ticket, TicketStatus, TicketPriority, TicketCategory
from ticket.tests.factory import (create_ticket, create_tickets, create_ticket_category,
    create_ticket_statuses, create_ticket_priorites)


class CreateTicketTests(TestCase):

    def setUp(self):
        self.ticket = create_ticket()

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

    def test_requester(self):
        self.assertIsInstance(self.ticket.requester, Person)

    def test_categories(self):
        self.assertIsInstance(self.ticket.categories.all()[0], Category)

    # TODO: need to create a factory method to get this test to pass.
    # def test_attachments(self):
    #     self.assertIsInstance(self.ticket.attachments[0], Attachment)

    def test_request(self):
        self.assertIsInstance(self.ticket.request, str)

    def test_number(self):
        self.assertIsInstance(self.ticket.number, int)


class CreateTicketsTests(TestCase):

    def test_default(self):
        tickets = create_tickets()
        self.assertEqual(len(tickets), 1)
        self.assertIsInstance(tickets[0], Ticket)

    def test_many(self):
        tickets = create_tickets(_many=2)
        self.assertEqual(len(tickets), 2)
        self.assertIsInstance(tickets[0], Ticket)


class CreateStatusTests(TestCase):

    def setUp(self):
        create_ticket_statuses()

    def test_create(self):
        self.assertTrue(TicketStatus.objects.all())


class CreatePriorityTests(TestCase):

    def setUp(self):
        create_ticket_priorites()

    def test_create(self):
        self.assertTrue(TicketPriority.objects.all())


class CreateTicketsCategory(TestCase):

    def test_create(self):
        category = create_ticket_category()
        self.assertIsInstance(category, TicketCategory)
