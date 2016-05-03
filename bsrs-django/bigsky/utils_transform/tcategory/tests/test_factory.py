from django.test import TestCase

from utils_transform.tcategory.models import CategoryType, CategoryTrade, CategoryIssue
from utils_transform.tcategory.tests import factory


class FactoryTests(TestCase):

    def test_get_random_data(self):
        fields = [f.name for f in CategoryType._meta.get_fields()
                 if f.name != 'id']

        ret = factory.get_random_data(fields)

        for f in fields:
            if f == 'cost_amount':
                self.assertIsInstance(float(ret[f]), float)
            else:
                self.assertIsInstance(ret[f], str)

    def test_create_domino_category_type(self):
        category_type = factory.create_domino_category_type()

        self.assertIsInstance(category_type, CategoryType)

    def test_create_domino_category_trade(self):
        category_type = factory.create_domino_category_type()

        category_trade = factory.create_domino_category_trade(type=category_type)

        self.assertIsInstance(category_trade, CategoryTrade)
        self.assertEqual(category_trade.type_name, category_type.name)

    def test_create_domino_category_issue(self):
        category_trade = factory.create_domino_category_trade()

        category_issue = factory.create_domino_category_issue(trade=category_trade)

        self.assertIsInstance(category_issue, CategoryIssue)
        self.assertEqual(category_issue.trade_name, category_trade.name)
