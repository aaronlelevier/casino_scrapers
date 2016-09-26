from django.conf import settings
from django.contrib.auth.models import ContentType
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.db.models import F, Q
from django.db.models.signals import post_save
from django.dispatch import receiver

from automation.choices import AUTOMATION_EVENTS, AUTOMATION_ACTION_TYPES
from tenant.models import Tenant
from utils import classproperty
from utils.fields import MyGenericForeignKey
from utils.models import BaseQuerySet, BaseManager, BaseModel


class AutomationEvent(BaseModel):

    key = models.CharField(max_length=100, unique=True,
                           choices=[(x,x) for x in AUTOMATION_EVENTS])

    class Meta:
        ordering = ['key']


class AutomationActionType(BaseModel):

    key = models.CharField(max_length=100, unique=True,
                           choices=[(x,x) for x in AUTOMATION_ACTION_TYPES])

    class Meta:
        ordering = ['key']


class AutomationAction(BaseModel):

    type = models.ForeignKey(AutomationActionType, related_name="actions")
    automation = models.ForeignKey("automation.Automation", related_name="actions")
    content = JSONField(null=True, default={})


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


class AutomationFilterType(BaseModel):
    """
    :lookups: (dict)
        if there's a lookup, use it to generate dynamic AutomationFilterTypes

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
    The first 4 fields are the same as the AutomationFilterType fields, but
    the "lookups" field is different. It will contain criteria for the
    dynamic AutomationFilterType that was selected.

    ex: AutomationFilterType.lookups: {'filters': 'location_level'}
        ProfileFilter.lookups: {'location_level': <location_level_id>}

    expl: Basically ProfileFilter has the serialized value returned by the
        list saved to it, indicating the dynamic filter selected.
    """
    automation = models.ForeignKey(Automation, related_name="filters")
    source = models.ForeignKey(AutomationFilterType,
        help_text="Use to get info on what type of filter, if this is a dynamic filter, use"
                  "the lookup field")
    lookups = JSONField(null=True, default={},
        help_text="if used, provide extra lookup information beyond the 'field'"
                  "this should be a string array")

    criteria = JSONField(default=[], help_text="Must be a list. Criteria to match on.")

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
