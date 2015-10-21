from django.test import TestCase

from ticket.tests import factory
from ticket.models import Ticket
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
