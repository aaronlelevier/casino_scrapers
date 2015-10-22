from django.test import TestCase

from ticket.tests import factory
from ticket.models import Ticket
from category.models import Category
from location.models import Location
from person.tests.factory import create_person


class TicketTests(TestCase):

    def test_create_tickets(self):
        factory.create_tickets()
        ticket = Ticket.objects.all()
        self.assertEqual(ticket.count(), 1)
        self.assertTrue(ticket[0].assignee)

    def test_create_tickets_with_optional_assignee(self):
        person = create_person()
        factory.create_tickets(assignee=person)
        ticket = Ticket.objects.all()
        self.assertEqual(ticket[0].assignee.id, person.id)

    def test_categories(self):
        factory.create_tickets()
        ticket = Ticket.objects.all()
        categories = Category.objects.values_list('id', flat=True)
        self.assertIn(ticket[0].categories.first().id, categories)

    def test_location(self):
        factory.create_tickets()
        ticket = Ticket.objects.all()
        location = Location.objects.first()
        self.assertEqual(ticket[0].location.id, location.id)
