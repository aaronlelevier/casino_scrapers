from django.test import TestCase

from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketCategory,
    TicketActivity)
from ticket.tests.factory import create_tickets
from utils import choices


class TicketStatusManagerTests(TestCase):

    def test_default(self):
        default = TicketStatus.objects.default()
        self.assertIsInstance(default, TicketStatus)
        self.assertEqual(default.name, choices.TICKET_STATUS_CHOICES[0][0])


class TicketPriorityTests(TestCase):

    def test_default(self):
        default = TicketPriority.objects.default()
        self.assertIsInstance(default, TicketPriority)
        self.assertEqual(default.name, choices.TICKET_PRIORITY_CHOICES[0][0])


class TicketTests(TestCase):

    def setUp(self):
        create_tickets(_many=2)

    def test_number(self):
        one = Ticket.objects.get(number=1)
        self.assertIsInstance(one, Ticket)

        two = Ticket.objects.get(number=2)
        self.assertIsInstance(two, Ticket)


class TicketCategory(TestCase):
    pass
