from django.test import TestCase

from location.models import Location
from person.models import Person
from person.tests.factory import create_single_person
from work_order.models import (WorkOrder, WorkOrderStatus, WorkOrderPriority,
    WORKORDER_STATUSES)
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
        self.assertIsInstance(wo.location, Location)
        self.assertIsInstance(wo.status, WorkOrderStatus)
        self.assertIsInstance(wo.priority, WorkOrderPriority)
        self.assertIsInstance(wo.assignee, Person)
        self.assertIsInstance(wo.requester, Person)
        self.assertEqual(wo.date_due, factory.TIME)

    def test_create_work_order_status(self):
        obj = factory.create_work_order_status()

        self.assertIsInstance(obj, WorkOrderStatus)
        self.assertIn(obj.name, WORKORDER_STATUSES)

    def test_create_work_order_statuses(self):
        ret = factory.create_work_order_statuses()

        self.assertIsInstance(ret[0], WorkOrderStatus)
        self.assertEqual(
            sorted(WORKORDER_STATUSES),
            sorted([x.name for x in ret])
        )
