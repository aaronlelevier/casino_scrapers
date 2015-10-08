from django.test import TestCase

from ticket.models import Ticket
from ticket.tests import factory


class TicketTests(TestCase):

    def setUp(self):
        factory.create_tickets()

    def test_model(self):
        ticket = Ticket.objects.first()
        self.assertIsInstance(ticket, Ticket)

# class TicketStatusManagerTests(TestCase):

#     def test_default(self):
#         default = TicketStatus.objects.default()
#         self.assertIsInstance(default, TicketStatus)
#         self.assertIsNotNone(default.name)


