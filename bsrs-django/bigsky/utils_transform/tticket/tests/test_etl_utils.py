from django.test import TestCase

from model_mommy import mommy

from location.models import Location, LocationLevel, LOCATION_STORE
from location.tests.factory import create_location_levels
from ticket.models import Ticket, TicketStatus, TicketPriority
from ticket.tests.factory import create_ticket_priorities, create_ticket_statuses
from utils_transform.tticket.management.commands import _etl_utils
from utils_transform.tticket.tests.factory import create_domino_ticket


class EtlUtilsTests(TestCase):

    def setUp(self):
        # Location
        create_location_levels()
        self.store_level = LocationLevel.objects.get(name=LOCATION_STORE)
        self.number = '1'
        self.location = mommy.make(Location, number=self.number,
            location_level=self.store_level)
        # Ticket
        create_ticket_priorities()
        create_ticket_statuses()
        self.priority = TicketPriority.objects.get(name=_etl_utils.priority_map['1'])
        self.status = TicketStatus.objects.get(name=_etl_utils.status_map['1'])

    def test_run_ticket_migrations(self):
        dt = create_domino_ticket()
        dt.status = dt.priority = dt.location_number = '1'
        dt.save()
        self.assertEqual(Ticket.objects.count(), 0)

        _etl_utils.run_ticket_migrations()

        self.assertEqual(Ticket.objects.count(), 1)
        ticket = Ticket.objects.first()
        self.assertEqual(ticket.location, self.location)
        self.assertEqual(ticket.priority, self.priority)
        self.assertEqual(ticket.status, self.status)

    # get_location

    def test_get_location(self):
        ret = _etl_utils.get_location(self.number)
        self.assertEqual(ret, self.location)

    # def test_get_location__DoesNotExist(self):
    #     number = 'foo'
    #     self.assertFalse(Location.objects.filter(number=number).exists())
    #     with open(settings.LOGGING_INFO_FILE, 'w'): pass

    #     with self.assertRaises(Location.DoesNotExist):
    #         _etl_utils.get_location(number)

    #         with open(settings.LOGGING_INFO_FILE, 'r') as f:
    #             content = f.read()
    #     self.assertIn("LocationLevel name:{} Not Found.".format(get_location_level(domino_role)), content)

    def test_get_status(self):
        ret = _etl_utils.get_status('1')
        self.assertIsInstance(ret, TicketStatus)

    def test_get_priority(self):
        ret = _etl_utils.get_priority('1')
        self.assertIsInstance(ret, TicketPriority)
