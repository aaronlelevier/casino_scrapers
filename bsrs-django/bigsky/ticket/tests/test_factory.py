from django.test import TestCase

from ticket.tests import factory
from ticket.models import Ticket


class TicketTests(TestCase):

    def test_create_tickets(self):
        factory.create_tickets()
        self.assertIsInstance(Ticket.objects.get(subject='Plumbing Fix'), Ticket)
        self.assertEqual(Ticket.objects.count(), 3)