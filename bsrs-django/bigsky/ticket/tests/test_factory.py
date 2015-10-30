from django.test import TestCase

from category.models import Category
from location.models import Location
from person.tests.factory import create_person
from ticket.models import Ticket, TicketCategory
from ticket.tests.factory import create_tickets, create_ticket_category


class CreateTicketsTests(TestCase):

    def test_assignee(self):
        create_tickets()
        ticket = Ticket.objects.all()
        self.assertEqual(ticket.count(), 1)
        self.assertTrue(ticket[0].assignee)

    def test_with_optional_assignee(self):
        person = create_person()
        create_tickets(assignee=person)
        ticket = Ticket.objects.all()
        self.assertEqual(ticket[0].assignee.id, person.id)

    def test_with_optional_requester(self):
        person = create_person()
        create_tickets(requester=person)
        ticket = Ticket.objects.all()
        self.assertEqual(ticket[0].requester.id, person.id)

    def test_with_optional_cc(self):
        person = create_person()
        create_tickets(cc=person)
        ticket = Ticket.objects.all()
        self.assertEqual(ticket[0].cc.first().id, person.id)

    def test_categories(self):
        create_tickets()
        ticket = Ticket.objects.all()
        categories = Category.objects.values_list('id', flat=True)
        self.assertIn(ticket[0].categories.first().id, categories)

    def test_location(self):
        create_tickets()
        ticket = Ticket.objects.all()
        location = Location.objects.first()
        self.assertEqual(ticket[0].location.id, location.id)


class CreateTicketsCategory(TestCase):

    def test_create(self):
        category = create_ticket_category()
        self.assertIsInstance(category, TicketCategory)
