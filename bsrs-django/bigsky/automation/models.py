from django.conf import settings
from django.contrib.auth.models import ContentType
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.db.models import F, Q
from django.db.models.signals import post_save
from django.dispatch import receiver

from tenant.models import Tenant
from utils import classproperty
from utils.fields import MyGenericForeignKey
from utils.models import BaseQuerySet, BaseManager, BaseModel


ROUTING_EVENTS = [
    'automation.event.ticket_assignee_change',
    'automation.event.ticket_attachment_add',
    'automation.event.ticket_category_change',
    'automation.event.ticket_cc_add',
    'automation.event.ticket_comment',
    'automation.event.ticket_location_change',
    'automation.event.ticket_priority_change',
    'automation.event.ticket_status_cancelled',
    'automation.event.ticket_status_complete',
    'automation.event.ticket_status_deferred',
    'automation.event.ticket_status_denied',
    'automation.event.ticket_status_in_progress',
    'automation.event.ticket_status_new',
    'automation.event.ticket_status_pending',
    'automation.event.ticket_status_unsatisfactory'
]

class AutomationEvent(BaseModel):

    key = models.CharField(max_length=100, unique=True,
                           choices=[(x,x) for x in ROUTING_EVENTS])

    class Meta:
        ordering = ['key']


class AutomationQuerySet(BaseQuerySet):

    def search_multi(self, keyword):
        return self.filter(description=keyword)


class AutomationManager(BaseManager):

    queryset_cls = AutomationQuerySet

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    def process_ticket(self, tenant_id, ticket):
        """
        for each automation-profile in this Tenant's Automation Profiles
          does it match?
            match logic:
              for each profile filter in this Assingment Profile:
                do all filters's match? if so, it's an match for this
                automation profile

          if match:
            "return True" or "automation" is a placeholder return

            TODO: should trigger running all Actions associated
                  with this Automation

        """
        if ticket.creator and not ticket.creator.role.process_assign:
            return True

        for automation in self.filter(tenant__id=tenant_id).order_by('description'):
            match = automation.is_match(ticket)
            if match:
                return automation


class Automation(BaseModel):

    _RAW_EXPORT_FIELDS_AND_HEADERS = [
        ('description', 'admin.automation.description'),
    ]

    @classproperty
    def EXPORT_FIELDS(cls):
        return [x[0] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    @classproperty
    def I18N_HEADER_FIELDS(cls):
        return [x[1] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    # keys
    tenant = models.ForeignKey(Tenant, null=True)
    description = models.CharField(max_length=500)
    filters = GenericRelation("automation.ProfileFilter")
    events = models.ManyToManyField(AutomationEvent, related_name="automations")

    objects = AutomationManager()

    class Meta:
        ordering = ['description']

    @property
    def has_filters(self):
        return bool(self.filters.first())

    def is_match(self, ticket):
        matches = []
        for f in self.filters.all().select_related('source'):
            if f.is_match(ticket):
                matches.append(True)
            else:
                matches.append(False)

        return all(matches)


class AvailableFilter(BaseModel):
    """
    :lookups: (dict)
        if there's a lookup, use it to generate dynamic AvailableFilters

        Idea for structure:
            {
                filters: if dynamic filters need to be generated of the base fields
                    ex - location_level,  on serialization generate an
                         available filter for each location_level
            }
    """
    key = models.CharField(max_length=100, blank=True,
                           help_text="To use for i18n UI key, and also for mapping component based on selected filter")
    context = models.CharField(max_length=100, blank=True, default=settings.DEFAULT_PROFILE_FILTER_CONTEXT,
                               help_text="The namespace of the model to look the field up on. ex: 'app_name.model_name'")
    field = models.CharField(max_length=100,
                             help_text="Model field to look up from the Model class specified in the 'context'"
                                       "with the exception of State/Country. This field should also ben unique"
                                       "because Ember case/switches on this field to generate the power-select")
    lookups = JSONField(null=True, default={},
        help_text="if used, provide extra lookup information beyond the 'field'"
                  "this should be a string array")

    @property
    def is_state_filter(self):
        return self.field == 'state'

    @property
    def is_country_filter(self):
        return self.field == 'country'


class ProfileFilter(BaseModel):
    """
    The first 4 fields are the same as the AvailableFilter fields, but
    the "lookups" field is different. It will contain criteria for the
    dynamic AvailableFilter that was selected.

    ex: AvailableFilter.lookups: {'filters': 'location_level'}
        ProfileFilter.lookups: {'location_level': <location_level_id>}

    expl: Basically ProfileFilter has the serialized value returned by the
        list saved to it, indicating the dynamic filter selected.
    """
    source = models.ForeignKey(AvailableFilter,
        help_text="Use to get info on what type of filter, if this is a dynamic filter, use"
                  "the lookup field")
    lookups = JSONField(null=True, default={},
        help_text="if used, provide extra lookup information beyond the 'field'"
                  "this should be a string array")

    criteria = JSONField(default=[], help_text="Must be a list. Criteria to match on.")
    # GenericForeignKey
    content_type = models.ForeignKey(ContentType, null=True)
    object_id = models.UUIDField(null=True)
    content_object = MyGenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['id']

    def is_match(self, ticket):
        # State filter
        if (self.source.is_state_filter or self.source.is_country_filter) \
            and not ticket.location.is_office_or_store:
            return False
        elif self.source.is_state_filter and ticket.location.is_office_or_store:
            return self._is_address_match(ticket, 'state__id')
        # Country filter
        elif self.source.is_country_filter and ticket.location.is_office_or_store:
            return self._is_address_match(ticket, 'country__id')

        # Checking the criteria will be different based on the "type"
        # of ticket, which is really an 'object' of diff types, i.e. 'work_order'
        field_type = ticket._meta.get_field(self.source.field)
        # location, priority, etc..
        if isinstance(field_type, models.ForeignKey):
            return str(getattr(ticket, self.source.field).id) in self.criteria
        # categories
        elif isinstance(field_type, models.ManyToManyField):
            category_ids = (str(x) for x in ticket.categories.values_list('id', flat=True))
            return set(category_ids).intersection(set(self.criteria))

    def _is_address_match(self, ticket, related__id):
        related_ids = ((str(x) for x in ticket.location.addresses
                                              .office_and_stores()
                                              .values_list(related__id, flat=True)))
        return set(related_ids).intersection(set(self.criteria))
