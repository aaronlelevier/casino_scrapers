from django.conf import settings
from django.db import models

from utils.models import BaseModel, BaseQuerySet, BaseManager, BaseNameModel
from location.models import Location
from third_party.models import ThirdParty


WORKORDER_STATUSES = [
    'work_order.status.draft',
    'work_order.status.new',
    'work_order.status.in_progress',
    'work_order.status.deferred',
    'work_order.status.denied',
    'work_order.status.problem_solved',
    'work_order.status.completed',
    'work_order.status.closed',
    'work_order.status.unsatisfactory_completion'
]


class WorkOrderStatusManager(BaseManager):

    def default(self):
        obj, _ = self.get_or_create(name=settings.DEFAULTS_WORKORDER_STATUS)
        return obj


class WorkOrderStatus(BaseNameModel):

    objects = WorkOrderStatusManager()

    class Meta:
        verbose_name_plural = "Work Order Statuses"

    def to_dict(self):
        return {
            "id": str(self.pk),
            "name": self.name,
            "default": True if self.name == settings.DEFAULTS_WORKORDER_STATUS else False
        }
    

WORKORDER_PRIORITIES = [
    'work_order.priority.emergency',
    'work_order.priority.high',
    'work_order.priority.medium',
    'work_order.priority.low',
]


class WorkOrderPriorityManager(BaseManager):

    def default(self):
        obj, _ = self.get_or_create(name=WORKORDER_PRIORITIES[0])
        return obj


class WorkOrderPriority(BaseNameModel):

    objects = WorkOrderPriorityManager()

    class Meta:
        verbose_name_plural = "Work Order Priorities"


class WorkOrder(BaseModel):
    location = models.ForeignKey(Location)
    status = models.ForeignKey(WorkOrderStatus, blank=True, null=True)
    priority = models.ForeignKey(WorkOrderPriority, blank=True, null=True)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True,
        related_name="assignee_work_order")
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True,
        related_name="requester_work_order")
    third_party = models.ForeignKey(ThirdParty, blank=True, null=True)
    date_due = models.DateTimeField(blank=True, null=True)
