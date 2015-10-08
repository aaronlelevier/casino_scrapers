from django.test import TestCase

from ticket.tests import factory
from ticket.models import Ticket


class TicketTests(TestCase):

    def test_create_tickets(self):
        factory.create_tickets()
        contractor = Ticket.objects.filter(subject='Plumbing Fix')
        self.assertEqual(contractor.count(), 1)


