from django.conf import settings
from django.test import TestCase

from location.models import Location
from person.models import Person
from person.tests.factory import create_single_person
from work_order.models import (WorkOrder, WorkOrderPriority, WorkOrderStatus,
    WORKORDER_PRIORITIES)
from work_order.tests.factory import create_work_orders, TIME
from utils.models import DefaultNameManager
from utils.tests.test_helpers import create_default


class WorkOrderStatusTests(TestCase):

    def setUp(self):
        self.default_status = create_default(WorkOrderStatus)

    def test_default(self):
        self.assertEqual(WorkOrderStatus.objects.default(), self.default_status)

    def test_default_name(self):
        self.assertEqual(WorkOrderStatus.default, settings.DEFAULTS_WORKORDER_STATUS)

    def test_manager(self):
        self.assertIsInstance(WorkOrderStatus.objects, DefaultNameManager)

    def test_meta__verbose_name_plural(self):
        self.assertEqual(WorkOrderStatus._meta.verbose_name_plural,  "Work order statuses")


class WorkOrderPriorityTests(TestCase):

    def setUp(self):
        self.default = create_default(WorkOrderPriority)

    def test_default(self):
        self.assertEqual(WorkOrderPriority.objects.default(), self.default)

    def test_default_name(self):
        self.assertEqual(WorkOrderPriority.default, WORKORDER_PRIORITIES[0])

    def test_manager(self):
        self.assertIsInstance(WorkOrderPriority.objects, DefaultNameManager)

    def test_meta__verbose_name_plural(self):
        self.assertEqual(WorkOrderPriority._meta.verbose_name_plural, "Work order priorities")


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
        self.assertIsInstance(work_order.assignee, Person) 
        self.assertIsInstance(work_order.location, Location) 
        self.assertEqual(work_order.scheduled_date.strftime('%m/%d/%Y'), TIME.strftime('%m/%d/%Y')) 
