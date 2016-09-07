import uuid

from django.apps import apps
from django.dispatch import receiver
from django.db import models
from django.db.models import F, Q, Max
from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import JSONField

from category.models import Category
from generic.models import Attachment
from location.models import Location
from person.models import Person
# from routing.tasks import process_ticket
from utils.models import (BaseModel, BaseQuerySet, BaseManager, BaseNameModel,
    DefaultToDictMixin)


TICKET_STATUS_MAP = {
    '1': 'ticket.status.new',
    '2': 'ticket.status.deferred',
    '3': 'ticket.status.in_progress',
    '4': 'ticket.status.complete',
    '5': 'ticket.status.denied',
    '6': 'ticket.status.problem_solved',
    '7': 'ticket.status.draft',
    '8': 'ticket.status.unsatisfactory_completion',
    '9': 'ticket.status.cancelled',
    '10': 'ticket.status.pending'
}

TICKET_STATUSES = [v for k,v in TICKET_STATUS_MAP.items()]

TICKET_STATUS_DEFAULT = TICKET_STATUS_MAP['1']

TICKET_STATUS_NEW = TICKET_STATUS_MAP['1']
TICKET_STATUS_DEFERRED = TICKET_STATUS_MAP['2']
TICKET_STATUS_IN_PROGRESS = TICKET_STATUS_MAP['3']
TICKET_STATUS_COMPLETE = TICKET_STATUS_MAP['4']
TICKET_STATUS_DENIED = TICKET_STATUS_MAP['5']
TICKET_STATUS_PROBLEM_SOLVED = TICKET_STATUS_MAP['6']
TICKET_STATUS_DRAFT = TICKET_STATUS_MAP['7']
TICKET_STATUS_UNSATISFACTORY_COMPLETION = TICKET_STATUS_MAP['8']
TICKET_STATUS_CANCELLED = TICKET_STATUS_MAP['9']
TICKET_STATUS_PENDING = TICKET_STATUS_MAP['10']


TICKET_PRIORITY_MAP = {
    '1': 'ticket.priority.emergency',
    '2': 'ticket.priority.high',
    '3': 'ticket.priority.medium',
    '4': 'ticket.priority.low',
}

TICKET_PRIORITIES = [v for k,v in TICKET_PRIORITY_MAP.items()]

TICKET_PRIORITY_DEFAULT = TICKET_PRIORITY_MAP['3']


class TicketStatus(DefaultToDictMixin, BaseNameModel):

    default = TICKET_STATUS_DEFAULT

    class Meta:
        verbose_name_plural = "Ticket statuses"


class TicketPriority(DefaultToDictMixin, BaseNameModel):

    default = TICKET_PRIORITY_DEFAULT

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

    def next_number(self):
        """Auto incrementing number field"""
        count = self.all().aggregate(Max('number'))['number__max']
        if not count:
            return 1
        else:
            return count + 1

    def filter_on_categories_and_location(self, person):
        q = Q()

        if not person.has_top_level_location:
            q &= Q(location__id__in=person.locations.objects_and_their_children())

        if person.role.categories.first():
            q &= Q(
                Q(categories__id__in=person.role.categories.filter(parent__isnull=True)
                                                           .values_list('id', flat=True)) | \
                Q(categories__isnull=True, status__name=TICKET_STATUS_DRAFT)
            )

        return self.filter(q).distinct()

    def filter_export_data(self, query_params):
        qs = super(TicketQuerySet, self).filter_export_data(query_params)
        return qs.annotate(priority_name=F('priority__name'),
                           status_name=F('status__name'),
                           location_name=F('location__name'),
                           assignee_name=F('assignee__fullname'))


class TicketManager(BaseManager):

    queryset_cls = TicketQuerySet

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    def next_number(self):
        return self.get_queryset().next_number()

    def filter_on_categories_and_location(self, person):
        return self.get_queryset().filter_on_categories_and_location(person)


class Ticket(BaseModel):

    EXPORT_FIELDS = ['priority_name', 'status_name', 'number', 'created',
                     'location_name', 'assignee_name', 'request', 'category']

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
    request = models.TextField(blank=True, null=True)
    dt_path = JSONField(blank=True, default=[])
    completion_date = models.DateTimeField(null=True)
    # Auto-fields
    number = models.IntegerField(blank=True, unique=True, default=next_number)
    creator = models.ForeignKey(Person, related_name='created_tickets', null=True,
        help_text="The logged in Person that created the Ticket. If NULL, it was system created.")
    legacy_ref_number = models.CharField(max_length=254, blank=True, null=True,
        help_text="Legacy ticket number from Domino")

    objects = TicketManager()

    class Meta:
        ordering = ('-created',)

    def save(self, *args, **kwargs):
        super(Ticket, self).save(*args, **kwargs)
        self._process_ticket_if_no_assignee()

    def _process_ticket_if_no_assignee(self):
        if not self.deleted and self.status.name == TICKET_STATUS_NEW and not self.assignee:
            self._process_ticket(self.location.location_level.tenant.id,
                                 ticket=self)

    def _process_ticket(self, tenant_id, ticket):
        model = apps.get_model("routing", "assignment")
        model.objects.process_ticket(tenant_id, ticket)

    @property
    def category(self):
        """
        Formated String of the Ticket's categories.
        ex: parent - child - grand_child
        """
        categories = (self.categories.prefetch_related('categories')
                                     .values('level', 'name'))
        return " - ".join(x['name'] for x in sorted(categories, key=lambda k: k['level']))


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
