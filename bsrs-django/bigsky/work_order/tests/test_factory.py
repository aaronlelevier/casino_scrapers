from django.test import TestCase
from datetime import datetime

from person.tests.factory import create_single_person
from work_order.tests import factory
from work_order.models import (WORKORDER_STATUSES, WorkOrderStatus,)


class WorkOrderFactory(TestCase):
    
    def test_factory(self):
        create_single_person()
        wo = factory.create_work_orders()
        self.assertIsNotNone(wo[0].id)
        self.assertIsNotNone(wo[0].assignee)
        self.assertIsNotNone(wo[0].requester)
        self.assertIsNotNone(wo[0].location)
        self.assertIsNotNone(wo[0].status.id)
        self.assertIsNotNone(wo[0].priority.id)
        self.assertEqual(wo[0].date_due, factory.TIME)


class CreateStatusTests(TestCase):

    def test_single(self):
        obj = factory.create_work_order_status()
        self.assertIsInstance(obj, WorkOrderStatus)
        self.assertIn(obj.name, WORKORDER_STATUSES)


