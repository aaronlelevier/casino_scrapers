import uuid

from django.db import models
from django.db.models import Q, Max
from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import JSONField

from category.models import Category
from generic.models import Attachment
from location.models import Location
from person.models import Person
from utils.models import BaseModel, BaseQuerySet, BaseManager, BaseNameModel


TICKET_STATUSES = [
    'ticket.status.draft',
    'ticket.status.new',
    'ticket.status.deferred',
    'ticket.status.in_progress',
    'ticket.status.complete',
    'ticket.status.denied',
    'ticket.status.problem_solved',
    'ticket.status.unsatisfactory_completion',
    'ticket.status.canceled',
    'ticket.status.pending',
]


class DefaultToDictMixin(object):

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "default": True if self.name == self.default else False
        }


class TicketStatus(DefaultToDictMixin, BaseNameModel):

    default = TICKET_STATUSES[0]

    class Meta:
        verbose_name_plural = "Ticket statuses"
    

TICKET_PRIORITIES = [
    'ticket.priority.medium',
    'ticket.priority.low',
    'ticket.priority.high',
    'ticket.priority.emergency',
]


class TicketPriority(DefaultToDictMixin, BaseNameModel):

    default = TICKET_PRIORITIES[0]

    class Meta:
        verbose_name_plural = "Ticket priorities"


class TicketQuerySet(BaseQuerySet):

    def search_multi(self, keyword):
        return self.filter(
                Q(request__icontains=keyword) | \
                Q(location__name__icontains=keyword) | \
                Q(assignee__fullname__icontains=keyword) | \
                Q(priority__name__icontains=keyword) | \
                Q(status__name__icontains=keyword) | \
                Q(categories__name__in=[keyword])
            )

    def all_with_ordered_categories(self):
        return (self.all()
                    .prefetch_related('categories')
                    .exclude(categories__isnull=True))

    def filter_on_categories_and_location(self, person):
        return self.filter(
            Q(categories__id__in=person.role.categories.get_all_if_none(person.role)) &
            Q(location__id__in=person.locations.objects_and_their_children())
        ).distinct()

    def next_number(self):
        """Auto incrementing number field"""
        count = self.all().aggregate(Max('number'))['number__max']
        if not count:
            return 1
        else:
            return count + 1


class TicketManager(BaseManager):

    def get_queryset(self):
        return TicketQuerySet(self.model, using=self._db).filter(deleted__isnull=True)

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    def all_with_ordered_categories(self):
        return self.get_queryset().all_with_ordered_categories()

    def filter_on_categories_and_location(self, person):
        return self.get_queryset().filter_on_categories_and_location(person)

    def next_number(self):
        return self.get_queryset().next_number()


class Ticket(BaseModel):

    def next_number():
        return Ticket.objects.next_number()

    # Keys
    location = models.ForeignKey(Location)
    status = models.ForeignKey(TicketStatus)
    priority = models.ForeignKey(TicketPriority)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True,
        related_name="assignee_tickets")
    cc = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    requester = models.CharField(max_length=150, blank=True, null=True,
        help_text="The User or string inputted by User")
    categories = models.ManyToManyField(Category, blank=True)
    attachments = GenericRelation(Attachment)
    # Fields
    request = models.CharField(max_length=1000, blank=True, null=True)
    dt_path = JSONField(blank=True, default={})
    completion_date = models.DateTimeField(null=True)
    # Auto-fields
    number = models.IntegerField(blank=True, unique=True, default=next_number)
    creator = models.ForeignKey(Person, related_name='created_tickets', null=True, help_text="The logged in Person that \
created the Ticket. If NULL, it was system created.")
    legacy_ref_number = models.CharField(max_length=254, blank=True, null=True,
        help_text="Legacy ticket number from Domino")

    objects = TicketManager()


TICKET_ACTIVITY_TYPES = [
    'create',
    'assignee',
    'cc_add',
    'cc_remove',
    'status',
    'priority',
    'categories',
    'comment',
    'attachment_add',
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
    content = JSONField(blank=True, null=True)
    
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
