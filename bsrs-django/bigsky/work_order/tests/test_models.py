from django.conf import settings
from django.test import TestCase

from person.tests.factory import create_single_person
from person.models import Person
from location.models import Location
from work_order.tests.factory import create_work_orders

from work_order.models import (WorkOrder, WorkOrderPriority, WorkOrderStatus,
        WORKORDER_STATUSES, WORKORDER_PRIORITIES
        )


class WorkOrderStatusManager(TestCase):

    def test_default(self):
        default = WorkOrderStatus.objects.default() 
        self.assertIsInstance(default, WorkOrderStatus)
        self.assertEqual(default.name, WORKORDER_STATUSES[1])


class WorkOrderPriorityManager(TestCase):

    def test_default(self):
        default = WorkOrderPriority.objects.default() 
        self.assertIsInstance(default, WorkOrderPriority)
        self.assertEqual(default.name, WORKORDER_PRIORITIES[0])


class TicketTests(TestCase):

    def setUp(self):
        create_single_person()
        create_work_orders(_many=2)

    def test_data(self):
        work_order = WorkOrder.objects.first()
        self.assertIsInstance(work_order, WorkOrder)
        self.assertIsInstance(work_order.status, WorkOrderStatus)
        self.assertIsInstance(work_order.priority, WorkOrderPriority)
        self.assertIsInstance(work_order.requester, Person)
        self.assertIsInstance(work_order.assignee, Person) self.assertIsInstance(work_order.location, Location) 
