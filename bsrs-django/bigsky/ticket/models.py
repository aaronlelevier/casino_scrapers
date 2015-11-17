import uuid

from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import HStoreField

from category.models import Category
from generic.models import Attachment
from location.models import Location
from person.models import Person
from utils.models import BaseModel, BaseManager, BaseNameModel


TICKET_STATUSES = [
    'ticket.status.draft',
    'ticket.status.denied',
    'ticket.status.problem_solved',
    'ticket.status.complete',
    'ticket.status.deferred',
    'ticket.status.new',
    'ticket.status.in_progress',
    'ticket.status.unsatisfactory_completion'
]


class TicketStatusManager(BaseManager):

    def default(self):
        obj, _ = self.get_or_create(name=TICKET_STATUSES[0])
        return obj


class TicketStatus(BaseNameModel):

    objects = TicketStatusManager()

    class Meta:
        verbose_name_plural = "Ticket Statuses"


TICKET_PRIORITIES = [
    'ticket.priority.medium',
    'ticket.priority.low',
    'ticket.priority.high',
    'ticket.priority.emergency'
]


class TicketPriorityManager(BaseManager):

    def default(self):
        obj, _ = self.get_or_create(name=TICKET_PRIORITIES[0])
        return obj


class TicketPriority(BaseNameModel):

    objects = TicketPriorityManager()

    class Meta:
        verbose_name_plural = "Ticket Priorities"


class Ticket(BaseModel):

    def no_ticket_models():
        """Auto incrementing number field"""
        count = Ticket.objects_all.count()
        if not count:
            return 1
        else:
            return count + 1

    # Keys
    location = models.ForeignKey(Location)
    status = models.ForeignKey(TicketStatus, blank=True, null=True)
    priority = models.ForeignKey(TicketPriority, blank=True, null=True)
    assignee = models.ForeignKey(Person, blank=True, null=True,
        related_name="assignee_tickets")
    cc = models.ManyToManyField(Person, blank=True)
    requester = models.ForeignKey(Person, blank=True, null=True,
        related_name="requester_tickets")
    categories = models.ManyToManyField(Category, blank=True)
    attachments = models.ManyToManyField(Attachment, related_name="tickets", blank=True)
    # Fields
    request = models.CharField(max_length=1000, blank=True, null=True)
    # Auto-fields
    number = models.IntegerField(blank=True, default=no_ticket_models)

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(Ticket, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.status:
            self.status = TicketStatus.objects.default()
        if not self.priority:
            self.priority = TicketPriority.objects.default()


TICKET_ACTIVITY_TYPES = [
    'create',
    'assignee',
    'cc_add',
    'cc_remove',
    'status',
    'priority',
    'categories',
    'comment'
]


class TicketActivityType(BaseNameModel):

    weight = models.PositiveIntegerField(blank=True, default=1)


class TicketActivity(models.Model):
    """
    Log table for all Activities related to the Ticket.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created = models.DateTimeField(auto_now_add=True)
    type = models.ForeignKey(TicketActivityType, blank=True, null=True)
    ticket = models.ForeignKey(Ticket, related_name="activities")
    person = models.ForeignKey(Person, related_name="ticket_activities",
        help_text="Person who did the TicketActivity")
    content = HStoreField(blank=True, null=True)
    
    class Meta:
        ordering = ('-created',)

    def __str__(self):
        return "{}: {}".format(self.ticket.number, self.id)

    @property
    def weight(self):
        if not self.type:
            return settings.ACTIVITY_DEFAULT_WEIGHT
        else:
            return self.type.weight
