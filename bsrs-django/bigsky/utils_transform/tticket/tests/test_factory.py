from django.test import TestCase

from category.models import Category
from location.models import LocationLevel
from utils_transform.tlocation.models import LOCATION_STORE
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

    # def test_create_domino_ticket__selection(self):
    #     selection = 'foo'
    #     ret = factory.create_domino_ticket(selection=selection)
    #     self.assertEqual(ret.selection, selection)

    # def test_create_domino_ticket_and_related(self):
    #     ret = factory.create_domino_ticket_and_related()

    #     self.assertIsInstance(ret, DominoTicket)
    #     self.assertEqual(ret.selection, factory.ROLE_SELECTION)
    #     self.assertTrue(DominoTicket.objects.count() > 0)
    #     self.assertIsInstance(LocationLevel.objects.get(name=factory.LOCATION_REGION), LocationLevel)
    #     self.assertIsInstance(Category.objects.get(name=factory.CATEGORY1), Category)
    #     self.assertIsInstance(Category.objects.get(name=factory.CATEGORY2), Category)

    # def test_create_domino_ticket_and_related__selection(self):
    #     selection = 'foo'
    #     ret = factory.create_domino_ticket_and_related(selection=selection)
    #     self.assertEqual(ret.selection, selection)
