from django.conf import settings
from django.test import TestCase

from category.models import (Category, CategoryStatus, LABEL_TYPE, LABEL_TRADE,
    LABEL_ISSUE, LABEL_SUB_ISSUE)
from tenant.tests.factory import get_or_create_tenant
from utils.tests.test_helpers import create_default
from utils_transform.tcategory.management.commands._etl_utils import (
    resolve_cost_amount, create_type_from_domino,
    create_trade_from_domino, create_issue_from_domino,
    run_category_trade_migrations, run_category_issue_migrations,
    run_category_type_migrations, resolve_level)
from utils_transform.tcategory.tests.factory import (create_domino_category_type,
    create_domino_category_trade, create_domino_category_issue)


class EtlUtilTests(TestCase):

    def setUp(self):
        create_default(CategoryStatus)
        self.tenant = get_or_create_tenant()

    def test_resolve_cost_amount(self):
        cost_amount = ''

        ret = resolve_cost_amount(cost_amount)

        self.assertIsNone(ret)

    def test_create_category_and_resolve_cost_amount(self):
        domino_type = create_domino_category_type()
        domino_type.cost_amount = ''
        domino_type.save()

        type_ = create_type_from_domino(domino_type, self.tenant)

        self.assertIsInstance(type_, Category)
        self.assertIsNone(type_.cost_amount)
        self.assertEqual(type_.tenant, self.tenant)

    def test_create_category__distinct(self):
        """
        Categories must be distinct by: `name, label, level`
        """
        domino_type = create_domino_category_type()
        create_type_from_domino(domino_type, self.tenant)
        self.assertEqual(Category.objects.count(), 1)

        run_category_type_migrations(self.tenant)

        self.assertEqual(Category.objects.count(), 1)

    def test_resolve_level(self):
        self.assertEqual(resolve_level(LABEL_TYPE), 0)
        self.assertEqual(resolve_level(LABEL_TRADE), 1)
        self.assertEqual(resolve_level(LABEL_ISSUE), 2)

    # type

    def test_create_type_from_domino(self):
        domino_type = create_domino_category_type()

        type_ = create_type_from_domino(domino_type, self.tenant)

        self.assertIsInstance(type_, Category)
        self.assertEqual(type_.name, domino_type.name)
        self.assertEqual(type_.description, domino_type.description)
        self.assertEqual(type_.label, LABEL_TYPE)
        self.assertEqual(type_.subcategory_label, LABEL_TRADE)
        self.assertEqual(type_.cost_amount, domino_type.cost_amount)
        self.assertEqual(type_.cost_code, domino_type.cost_code)

    def test_run_category_type_migrations(self):
        domino_type = create_domino_category_type()

        run_category_type_migrations(self.tenant)

        category = Category.objects.get(name=domino_type.name)
        self.assertEqual(category.description, domino_type.description)

    # trade

    def test_create_trade_from_domino(self):
        domino_type = create_domino_category_type()
        domino_trade = create_domino_category_trade(domino_type)

        type_ = create_type_from_domino(domino_type, self.tenant)
        trade = create_trade_from_domino(domino_trade, self.tenant, parent=type_)

        self.assertIsInstance(trade, Category)
        self.assertEqual(trade.name, domino_trade.name)
        self.assertEqual(trade.description, domino_trade.description)
        self.assertEqual(trade.label, LABEL_TRADE)
        self.assertEqual(trade.subcategory_label, LABEL_ISSUE)
        self.assertEqual(trade.cost_amount, domino_trade.cost_amount)
        self.assertEqual(trade.cost_code, domino_trade.cost_code)
        self.assertEqual(trade.parent, type_)

    def test_run_category_trade_migrations(self):
        domino_type = create_domino_category_type()
        domino_trade = create_domino_category_trade(domino_type)
        type_ = create_type_from_domino(domino_type, self.tenant)
        self.assertEqual(type_.label, LABEL_TYPE)
        self.assertEqual(type_.name, domino_trade.type_name)

        run_category_trade_migrations(self.tenant)

        trade = Category.objects.get(label=LABEL_TRADE, name=domino_trade.name)
        self.assertEqual(trade.parent, type_)

    # issue

    def test_create_issue_from_domino(self):
        domino_trade = create_domino_category_trade()
        domino_issue = create_domino_category_issue()

        trade = create_trade_from_domino(domino_trade, self.tenant)
        issue = create_issue_from_domino(domino_issue, self.tenant, parent=trade)

        self.assertIsInstance(issue, Category)
        self.assertEqual(issue.name, domino_issue.name)
        self.assertEqual(issue.description, domino_issue.description)
        self.assertEqual(issue.label, LABEL_ISSUE)
        self.assertEqual(issue.subcategory_label, LABEL_SUB_ISSUE)
        self.assertEqual(issue.cost_amount, domino_issue.cost_amount)
        self.assertEqual(issue.cost_code, domino_issue.cost_code)
        self.assertEqual(issue.parent, trade)

    def test_run_category_issue_migrations(self):
        domino_trade = create_domino_category_trade()
        domino_issue = create_domino_category_issue(domino_trade)
        trade = create_trade_from_domino(domino_trade, self.tenant)
        self.assertEqual(trade.label, LABEL_TRADE)
        self.assertEqual(trade.name, domino_issue.trade_name)

        run_category_issue_migrations(self.tenant)

        issue = Category.objects.get(label=LABEL_ISSUE, name=domino_issue.name)
        self.assertEqual(issue.parent, trade)

    def test_run_category_migrations__log_parent_category_DoesNotExist(self):
        domino_trade = create_domino_category_trade()
        Category.objects.filter(name=domino_trade.type_name).delete()
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        run_category_trade_migrations(self.tenant)

        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("Name: {}; Label: {} Parent Category DoesNotExist"
                      .format(domino_trade.type_name, LABEL_TYPE), content)
