from django.core.urlresolvers import reverse
from django.test import TestCase

from person.tests.factory import create_single_person
from ticket.tests.factory import TicketWithActivities


class DjViewsTest(TestCase):

    def setUp(self):
        self.person = create_single_person()
        twa = TicketWithActivities()
        twa.create()
        self.ticket = twa.ticket

    # def test_ticket_activities(self):
    #     response = self.client.get('/email/ticket-activities/{}/'.format(self.ticket.id))
    #     self.assertEqual(response.status_code, 200)
