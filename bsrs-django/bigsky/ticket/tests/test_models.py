from django.test import TestCase

from ticket.models import Ticket, TicketStatus, TicketPriority
from ticket.tests import factory


class TicketTests(TestCase):

    def setUp(self):
        factory.create_tickets()

    def test_model(self):
        ticket = Ticket.objects.first()
        self.assertIsInstance(ticket, Ticket)
        self.assertTrue(hasattr(ticket, 'subject'))


class TicketStatusManagerTests(TestCase):

    def test_default(self):
        default = TicketStatus.objects.default()
        default_priority = TicketPriority.objects.default()
        self.assertIsInstance(default, TicketStatus)
        self.assertIsInstance(default_priority, TicketPriority)
        self.assertIsNotNone(default.name)
