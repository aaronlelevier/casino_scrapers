from django.test import TestCase

from utils_transform.tticket.models import DominoTicket
from utils_transform.tticket.tests import factory


class FactoryTests(TestCase):

    def test_get_ticket_none_id_fields(self):
        raw_ret = [f.name for f in DominoTicket._meta.get_fields()
                   if f.name not in ('id', 'create_date', 'complete_date')]

        ret = factory.get_ticket_none_id_and_date_fields()

        self.assertEqual(raw_ret, ret)

    def test_get_random_data(self):
        fields = factory.get_ticket_none_id_and_date_fields()

        ret = factory.get_random_data(fields)

        for f in fields:
            self.assertIsInstance(ret[f], str)
            self.assertTrue(ret[f])

    def test_create_domino_ticket(self):
        ret = factory.create_domino_ticket()

        self.assertIsInstance(ret, DominoTicket)
