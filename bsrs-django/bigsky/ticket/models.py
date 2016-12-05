import uuid

from django.apps import apps
from django.db import models
from django.db.models import F, Q, Max
from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError

from automation import tasks
from category.models import Category
from generic.models import Attachment
from location.models import Location
from person.models import Person
from utils import classproperty
from utils.models import (BaseModel, BaseQuerySet, BaseManager, BaseNameModel,
    DefaultToDictMixin)


class TicketStatus(DefaultToDictMixin, BaseNameModel):
    NEW = 'ticket.status.new'
    DEFERRED = 'ticket.status.deferred'
    IN_PROGRESS = 'ticket.status.in_progress'
    COMPLETE = 'ticket.status.complete'
    DENIED = 'ticket.status.denied'
    PROBLEM_SOLVED = 'ticket.status.problem_solved'
    DRAFT = 'ticket.status.draft'
    UNSATISFACTORY_COMPLETION = 'ticket.status.unsatisfactory_completion'
    CANCELLED = 'ticket.status.cancelled'
    PENDING = 'ticket.status.pending'

    ALL = [
        NEW,
        DEFERRED,
        IN_PROGRESS,
        COMPLETE,
        DENIED,
        PROBLEM_SOLVED,
        DRAFT,
        UNSATISFACTORY_COMPLETION,
        CANCELLED,
        PENDING,
    ]

    default = NEW
    DEFAULT = NEW

    class Meta:
        verbose_name_plural = "Ticket statuses"


class TicketPriority(DefaultToDictMixin, BaseNameModel):
    EMERGENCY = 'ticket.priority.emergency'
    HIGH = 'ticket.priority.high'
    MEDIUM = 'ticket.priority.medium'
    LOW = 'ticket.priority.low'

    ALL = [
        EMERGENCY,
        HIGH,
        MEDIUM,
        LOW,
    ]

    default = MEDIUM
    DEFAULT = MEDIUM

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
                Q(categories__isnull=True, status__name=TicketStatus.DRAFT)
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

    I18N_FIELDS = ['priority_name', 'status_name']

    _RAW_EXPORT_FIELDS_AND_HEADERS = [
        ('priority_name', 'ticket.label.priority-name'),
        ('status_name', 'ticket.label.status-name'),
        ('number', 'ticket.label.numberSymbol'),
        ('created', 'ticket.label.created'),
        ('location_name', 'ticket.label.location-name'),
        ('assignee_name', 'ticket.label.assignee-fullname'),
        ('category', 'ticket.label.category-name'),
        ('request', 'ticket.label.request')
    ]

    @classproperty
    def EXPORT_FIELDS(cls):
        return [x[0] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    @classproperty
    def I18N_HEADER_FIELDS(cls):
        return [x[1] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

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

    def save(self, process_automations=True, *args, **kwargs):
        super(Ticket, self).save(*args, **kwargs)
        if process_automations:
            self._process_ticket_if_new()

    def _process_ticket_if_new(self):
        if not self.deleted and self.status.name == TicketStatus.NEW:
            AutomationEvent = apps.get_model("automation", "automationevent")
            tasks.process_ticket.delay(self.location.location_level.tenant.id,
                                       ticket_id=self.id, event_key=AutomationEvent.STATUS_NEW)

    @property
    def category(self):
        """
        Formated String of the Ticket's categories.
        ex: parent - child - grand_child
        """
        categories = (self.categories.prefetch_related('categories')
                                     .values('level', 'name'))
        return " - ".join(x['name'] for x in sorted(categories, key=lambda k: k['level']))


class TicketActivityType(BaseModel):
    CREATE = 'create'
    ASSIGNEE = 'assignee'
    CC_ADD = 'cc_add'
    CC_REMOVE = 'cc_remove'
    STATUS = 'status'
    PRIORITY = 'priority'
    CATEGORIES = 'categories'
    COMMENT = 'comment'
    ATTACHMENT_ADD = 'attachment_add'
    SEND_EMAIL = 'send_email'
    SEND_SMS = 'send_sms'
    REQUEST = 'request'

    ALL = [
        CREATE,
        ASSIGNEE,
        CC_ADD,
        CC_REMOVE,
        STATUS,
        PRIORITY,
        CATEGORIES,
        COMMENT,
        ATTACHMENT_ADD,
        SEND_EMAIL,
        SEND_SMS,
        REQUEST
    ]

    name = models.CharField(max_length=100, unique=True, choices=[(x,x) for x in ALL])
    weight = models.PositiveIntegerField(blank=True, default=1)


class TicketActivityQuerySet(BaseQuerySet):

    def filter_out_unsupported_types(self):
        return (self.exclude(type__name__in=[TicketActivityType.REQUEST, TicketActivityType.SEND_EMAIL,
                                             TicketActivityType.SEND_SMS])
                    .exclude(type__name=TicketActivityType.ASSIGNEE, content__contains={'from':None}))


class TicketActivityManager(BaseManager):

    queryset_cls = TicketActivityQuerySet

    def filter_out_unsupported_types(self):
        return self.get_queryset().filter_out_unsupported_types()


class TicketActivity(BaseModel):
    """
    Log table for all Activities related to the Ticket.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created = models.DateTimeField(auto_now_add=True, db_index=True)
    type = models.ForeignKey(TicketActivityType, blank=True, null=True)
    ticket = models.ForeignKey(Ticket, related_name="activities")
    person = models.ForeignKey(Person, null=True, related_name="ticket_activities",
        help_text="Person who did the TicketActivity. NULL would be an Automation generated Activity")
    automation = models.ForeignKey("automation.Automation", null=True, related_name="ticket_activities",
        help_text="Automation who did the TicketActivity. NULL would be a Person generated Activity")
    content = JSONField(blank=True, null=True)

    objects = TicketActivityManager()

    class Meta:
        ordering = ('-created',)

    def save(self, *args, **kwargs):
        if self.person and self.automation:
            raise ValidationError("Record can either have a Person FK or Automation FK, but not both")
        return super(TicketActivity, self).save(*args, **kwargs)

    def __str__(self):
        return "{}: {}".format(self.ticket.number, self.id)

    @property
    def weight(self):
        if not self.type:
            return settings.ACTIVITY_DEFAULT_WEIGHT
        else:
            return self.type.weight
