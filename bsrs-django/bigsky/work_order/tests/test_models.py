from django.conf import settings
from django.test import TestCase

from location.models import Location
from person.models import Person
from person.tests.factory import create_single_person
from utils.models import DefaultNameManager
from utils.tests.test_helpers import create_default
from work_order.models import WorkOrder, WorkOrderPriority, WorkOrderStatus
from work_order.tests.factory import TIME, create_work_orders


class WorkOrderStatusTests(TestCase):

    def setUp(self):
        self.default_status = create_default(WorkOrderStatus)

    def test_default(self):
        self.assertEqual(WorkOrderStatus.objects.default(), self.default_status)

    def test_default_name(self):
        self.assertEqual(WorkOrderStatus.default, WorkOrderStatus.NEW)

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
        self.assertEqual(WorkOrderPriority.default, WorkOrderPriority.EMERGENCY)

    def test_manager(self):
        self.assertIsInstance(WorkOrderPriority.objects, DefaultNameManager)

    def test_meta__verbose_name_plural(self):
        self.assertEqual(WorkOrderPriority._meta.verbose_name_plural, "Work order priorities")

    def test_simple_name(self):
        self.assertEqual(self.default.simple_name, WorkOrderPriority.default.split('.')[-1])


class WorkOrderTests(TestCase):

    def setUp(self):
        create_single_person()
        create_work_orders(_many=2)

    def test_data(self):
        work_order = WorkOrder.objects.first()
        self.assertIsInstance(work_order, WorkOrder)
        self.assertIsInstance(work_order.status, WorkOrderStatus)
        self.assertIsInstance(work_order.priority, WorkOrderPriority)
        self.assertIsInstance(work_order.requester, str)
        self.assertIsInstance(work_order.assignee, Person) 
        self.assertIsInstance(work_order.location, Location) 
        self.assertEqual(work_order.scheduled_date.strftime('%m/%d/%Y'), TIME.strftime('%m/%d/%Y')) 
