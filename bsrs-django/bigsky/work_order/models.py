from django.conf import settings
from django.db import models

from accounting.models import Currency
from category.models import Category
from provider.models import Provider
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
    approval_date = models.DateTimeField(blank=True, null=True)
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
        related_name='approver_work_orders')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
        related_name='assignee_work_orders')
    category = models.ForeignKey(Category, related_name='work_orders',
        help_text='SC field: Category, Required for SC API, broader than TradeName')
    completed_date = models.DateTimeField(blank=True, null=True)
    cost_estimate = models.DecimalField(max_digits=9, decimal_places=4,
        help_text='SC field: Nte')
    cost_estimate_currency = models.ForeignKey(Currency)
    expiration_date = models.DateTimeField(blank=True, null=True)
    instructions = models.TextField(
        help_text='SC field: Description, Required for SC API')
    location = models.ForeignKey(Location, related_name='work_orders',
        help_text='SC field: ContractInfo/LocationId, Required for SC API')
    priority = models.ForeignKey(WorkOrderPriority, null=True,
        help_text='SC field: Priority, Required for SC API')
    provider = models.ForeignKey(Provider, related_name='work_orders',
        help_text='SC field: ContractInfo/ProviderId, Required for SC API')
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
        related_name='requester_work_orders')
    status = models.ForeignKey(WorkOrderStatus, null=True,
        help_text='SC field: Status')
    scheduled_date = models.DateTimeField(
        help_text='Due Date, SC field: ScheduledDate')
