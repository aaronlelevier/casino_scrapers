from django.conf import settings
from django.db import models

from location.models import Location
from third_party.models import ThirdParty
from utils.models import BaseModel, BaseNameModel, DefaultToDictMixin, DefaultNameManager


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


class WorkOrderStatus(DefaultToDictMixin, BaseNameModel):

    default = settings.DEFAULTS_WORKORDER_STATUS

    objects = DefaultNameManager()

    class Meta:
        verbose_name_plural = "Work order statuses"


WORKORDER_PRIORITIES = [
    'work_order.priority.emergency',
    'work_order.priority.high',
    'work_order.priority.medium',
    'work_order.priority.low',
]


class WorkOrderPriority(BaseNameModel):

    default = WORKORDER_PRIORITIES[0]

    objects = DefaultNameManager()

    class Meta:
        verbose_name_plural = "Work order priorities"


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
