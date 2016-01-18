import uuid

from django.db import models
from django.db.models import Q
from django.conf import settings
from django.contrib.postgres.fields import HStoreField
from django.db.models.signals import m2m_changed

from category.models import Category
from location.models import Location
from person.models import Person
from utils.models import BaseModel, BaseQuerySet, BaseManager, BaseNameModel


TICKET_STATUSES = [
    'ticket.status.draft',
    'ticket.status.new',
    'ticket.status.in_progress',
    'ticket.status.deferred',
    'ticket.status.denied',
    'ticket.status.problem_solved',
    'ticket.status.complete',
    'ticket.status.closed',
    'ticket.status.unsatisfactory_completion'
]


class TicketStatusManager(BaseManager):

    def default(self):
        obj, _ = self.get_or_create(name=settings.DEFAULTS_TICKET_STATUS)
        return obj


class TicketStatus(BaseNameModel):

    objects = TicketStatusManager()

    class Meta:
        verbose_name_plural = "Ticket Statuses"

    def to_dict(self):
        return {
            "id": str(self.pk),
            "name": self.name,
            "default": True if self.name == settings.DEFAULTS_TICKET_STATUS else False
        }
    

TICKET_PRIORITIES = [
    'ticket.priority.emergency',
    'ticket.priority.high',
    'ticket.priority.medium',
    'ticket.priority.low',
]


class TicketPriorityManager(BaseManager):

    def default(self):
        obj, _ = self.get_or_create(name=TICKET_PRIORITIES[0])
        return obj


class TicketPriority(BaseNameModel):

    objects = TicketPriorityManager()

    class Meta:
        verbose_name_plural = "Ticket Priorities"


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
            Q(categories__id__in=person.role.categories.objects_and_their_children()) &
            Q(location__id__in=person.locations.objects_and_their_children())
        ).distinct()


class TicketManager(BaseManager):

    def get_queryset(self):
        return TicketQuerySet(self.model, using=self._db).filter(deleted__isnull=True)

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    def all_with_ordered_categories(self):
        return self.get_queryset().all_with_ordered_categories()

    def filter_on_categories_and_location(self, person):
        return self.get_queryset().filter_on_categories_and_location(person)


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
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True,
        related_name="assignee_tickets")
    cc = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True)
    requester = models.CharField(max_length=150, blank=True, null=True)
    categories = models.ManyToManyField(Category, blank=True)
    # Fields
    request = models.CharField(max_length=1000, blank=True, null=True)
    # Auto-fields
    number = models.IntegerField(blank=True, default=no_ticket_models)

    objects = TicketManager()

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
