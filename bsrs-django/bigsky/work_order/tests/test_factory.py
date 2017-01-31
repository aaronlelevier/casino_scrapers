from decimal import Decimal

from django.test import TestCase

from accounting.models import Currency
from category.models import Category
from location.models import Location
from person.models import Person
from person.tests.factory import create_single_person
from ticket.models import Ticket
from work_order.models import WorkOrder, WorkOrderPriority, WorkOrderStatus
from work_order.tests import factory


class FactoryTests(TestCase):
    
    def setUp(self):
        create_single_person()

    def test_create_work_orders(self):
        number = 2
        work_orders = factory.create_work_orders(number)

        self.assertEqual(len(work_orders), number)
        self.assertIsInstance(work_orders[0], WorkOrder)

    def test_create_work_order(self):
        wo = factory.create_work_order()

        self.assertIsInstance(wo, WorkOrder)
        self.assertIsInstance(wo.ticket, Ticket)
        self.assertIsInstance(wo.assignee, Person)
        self.assertIsInstance(wo.category, Category)
        self.assertIsInstance(wo.cost_estimate, Decimal)
        self.assertIsInstance(wo.cost_estimate_currency, Currency)
        self.assertIsInstance(wo.instructions, str)
        self.assertIsInstance(wo.location, Location)
        self.assertIsInstance(wo.priority, WorkOrderPriority)
        self.assertIsInstance(wo.requester, Person)
        self.assertEqual(wo.scheduled_date, factory.TIME)
        self.assertIsInstance(wo.status, WorkOrderStatus)

    def test_create_work_order_status(self):
        obj = factory.create_work_order_status()

        self.assertIsInstance(obj, WorkOrderStatus)
        self.assertIn(obj.name, WorkOrderStatus.ALL)

    def test_create_work_order_statuses(self):
        ret = factory.create_work_order_statuses()

        self.assertIsInstance(ret[0], WorkOrderStatus)
        self.assertEqual(
            sorted(WorkOrderStatus.ALL),
            sorted([x.name for x in ret])
        )

    def test_create_work_order_priority(self):
        obj = factory.create_work_order_priority()

        self.assertIsInstance(obj, WorkOrderPriority)
        self.assertIn(obj.name, WorkOrderPriority.ALL)

    def test_create_work_order_priorities(self):
        ret = factory.create_work_order_priorities()

        self.assertIsInstance(ret[0], WorkOrderPriority)
        self.assertEqual(
            sorted(WorkOrderPriority.ALL),
            sorted([x.name for x in ret])
        )
