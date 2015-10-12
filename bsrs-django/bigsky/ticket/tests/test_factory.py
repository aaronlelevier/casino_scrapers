from django.test import TestCase

from ticket.tests import factory
from ticket.models import Ticket


class TicketTests(TestCase):

    def test_create_tickets(self):
        number = 5
        factory.create_tickets(number)
        self.assertEqual(Ticket.objects.count(), number)