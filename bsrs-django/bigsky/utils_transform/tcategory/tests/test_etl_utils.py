from django.test import TestCase

from category.models import Category
from utils_transform.tcategory.models import CategoryType
from utils_transform.tcategory.management.commands._etl_utils import (
    resolve_cost_amount, create_category_from_category_type,
    create_category_from_category_trade, create_category_from_category_issue)
from utils_transform.tcategory.tests.factory import (create_category_type,
    create_category_trade, create_category_issue)


class EtlUtilTests(TestCase):

    def test_resolve_cost_amount(self):
        cost_amount = ''

        ret = resolve_cost_amount(cost_amount)

        self.assertEqual(ret, 0)

    def test_create_category_and_resolve_cost_amount(self):
        domino_type = create_category_type()
        domino_type.cost_amount = ''
        domino_type.save()

        type_ = create_category_from_category_type(domino_type)

        self.assertIsInstance(type_, Category)
        self.assertEqual(type_.cost_amount, 0)

    def test_create_category_from_category_type(self):
        domino_type = create_category_type()

        type_ = create_category_from_category_type(domino_type)

        self.assertIsInstance(type_, Category)
        self.assertEqual(type_.name, domino_type.name)
        self.assertEqual(type_.description, domino_type.description)
        self.assertEqual(type_.label, 'type')
        self.assertEqual(type_.subcategory_label, 'trade')
        self.assertEqual(type_.cost_amount, domino_type.cost_amount)
        self.assertEqual(type_.cost_code, domino_type.cost_code)

    def test_create_category_from_category_trade(self):
        domino_type = create_category_type()
        domino_trade = create_category_trade(domino_type)

        type_ = create_category_from_category_type(domino_type)
        trade = create_category_from_category_trade(domino_trade, parent=type_)

        self.assertIsInstance(trade, Category)
        self.assertEqual(trade.name, domino_trade.name)
        self.assertEqual(trade.description, domino_trade.description)
        self.assertEqual(trade.label, 'trade')
        self.assertEqual(trade.subcategory_label, 'issue')
        self.assertEqual(trade.cost_amount, domino_trade.cost_amount)
        self.assertEqual(trade.cost_code, domino_trade.cost_code)
        self.assertEqual(trade.parent, type_)

    def test_create_category_from_category_issue(self):
        domino_trade = create_category_trade()
        domino_issue = create_category_issue()

        trade = create_category_from_category_trade(domino_trade)
        issue = create_category_from_category_issue(domino_issue, parent=trade)

        self.assertIsInstance(issue, Category)
        self.assertEqual(issue.name, domino_issue.name)
        self.assertEqual(issue.description, domino_issue.description)
        self.assertEqual(issue.label, 'issue')
        self.assertEqual(issue.subcategory_label, 'sub-issue')
        self.assertEqual(issue.cost_amount, domino_issue.cost_amount)
        self.assertEqual(issue.cost_code, domino_issue.cost_code)
        self.assertEqual(issue.parent, trade)
