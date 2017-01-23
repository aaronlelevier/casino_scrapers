from django.conf import settings
from django.db import models

from accounting.models import Currency
from category.models import Category
from provider.models import Provider
from location.models import Location
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
    scid = models.IntegerField(null=True, unique=True,
        help_text="id of SC primary key record of the WorkOrder. Will be null on initial BS create")
    category = models.ForeignKey(Category, related_name='work_orders',
        help_text='SC field: Category, Required for SC API, broader than TradeName')
    provider = models.ForeignKey(Provider, related_name='work_orders',
        help_text='SC field: ContractInfo/ProviderId, Required for SC API')
    # can't be in the past
    scheduled_date = models.DateTimeField(
        help_text='Due Date, SC field: ScheduledDate')
    approved_amount = models.DecimalField(max_digits=9, decimal_places=4, null=True,
        help_text='May be the same as cost_estimate')
    ticket = models.ForeignKey("ticket.Ticket", related_name='work_orders', null=True,
        help_text='nullable because WorkOrders can exist without a Ticket')
    # TODO: not sure if these fields are required? Not being sent by Client POST currently
    location = models.ForeignKey(Location, related_name='work_orders', null=True,
        help_text='SC field: ContractInfo/LocationId, Required for SC API')
    cost_estimate = models.DecimalField(max_digits=9, decimal_places=4, null=True,
        help_text='SC field: Nte - will change based on the amount the Provider estimates for the work')
    # TODO: may end up being the "currency" for the whole work order
    cost_estimate_currency = models.ForeignKey(Currency, null=True)
    # optional field
    tracking_number = models.CharField(max_length=128, blank=True, null=True,
        help_text="SC field: work order number")
    instructions = models.TextField(blank=True, null=True,
        help_text='SC field: Description, Required for SC API')
    approval_date = models.DateTimeField(blank=True, null=True,
        help_text="date the work order is created, and gets updated if approval amount changes")
    completed_date = models.DateTimeField(blank=True, null=True,
        help_text="same as SC work_date, left blank until completed")
    expiration_date = models.DateTimeField(blank=True, null=True, help_text="original ETA")
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
        related_name='approver_work_orders', help_text="Person who creates the work order")
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
        related_name='assignee_work_orders')
    priority = models.ForeignKey(WorkOrderPriority, null=True,
        help_text='SC field: Priority, Required for SC API')
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
        related_name='requester_work_orders')
    status = models.ForeignKey(WorkOrderStatus, null=True,
        help_text='SC field: Status')
