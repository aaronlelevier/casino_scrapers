from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.db import models

from contact import tasks as contact_tasks
from location.models import Location
from person.models import Person
from tenant.models import Tenant
from ticket.models import TicketPriority, TicketStatus, TicketActivity, TicketActivityType
from utils import classproperty
from utils.models import BaseQuerySet, BaseManager, BaseModel


class AutomationEvent(BaseModel):
    ASSIGNEE_CHANGE = 'automation.event.ticket_assignee_change'
    ATTACHMENT_ADD = 'automation.event.ticket_attachment_add'
    CATEGORY_CHANGE = 'automation.event.ticket_category_change'
    CC_ADD = 'automation.event.ticket_cc_add'
    COMMENT = 'automation.event.ticket_comment'
    LOCATION_CHANGE = 'automation.event.ticket_location_change'
    PRIORITY_CHANGE = 'automation.event.ticket_priority_change'
    STATUS_CANCELLED = 'automation.event.ticket_status_cancelled'
    STATUS_COMPLETE = 'automation.event.ticket_status_complete'
    STATUS_DEFERRED = 'automation.event.ticket_status_deferred'
    STATUS_DENIED = 'automation.event.ticket_status_denied'
    STATUS_DRAFT = 'automation.event.ticket_status_draft'
    STATUS_IN_PROGRESS = 'automation.event.ticket_status_in_progress'
    STATUS_NEW = 'automation.event.ticket_status_new'
    STATUS_PENDING = 'automation.event.ticket_status_pending'
    STATUS_SOLVED = 'automation.event.ticket_status_solved'
    STATUS_UNSATISFACTORY = 'automation.event.ticket_status_unsatisfactory'

    ALL = [
        ASSIGNEE_CHANGE,
        ATTACHMENT_ADD,
        CATEGORY_CHANGE,
        CC_ADD,
        COMMENT,
        LOCATION_CHANGE,
        PRIORITY_CHANGE,
        STATUS_CANCELLED,
        STATUS_COMPLETE,
        STATUS_DEFERRED,
        STATUS_DENIED,
        STATUS_DRAFT,
        STATUS_IN_PROGRESS,
        STATUS_NEW,
        STATUS_PENDING,
        STATUS_SOLVED,
        STATUS_UNSATISFACTORY
    ]

    key = models.CharField(max_length=100, unique=True, choices=[(x,x) for x in ALL])

    class Meta:
        ordering = ['key']

    def __str__(self):
        return self.key


class AutomationActionType(BaseModel):
    TICKET_ASSIGNEE = 'automation.actions.ticket_assignee'
    SEND_EMAIL = 'automation.actions.send_email'
    SEND_SMS = 'automation.actions.send_sms'
    TICKET_CC = 'automation.actions.ticket_cc'
    TICKET_PRIORITY = 'automation.actions.ticket_priority'
    TICKET_REQUEST = 'automation.actions.ticket_request'
    TICKET_STATUS = 'automation.actions.ticket_status'

    ALL = [
        TICKET_ASSIGNEE,
        SEND_EMAIL,
        SEND_SMS,
        TICKET_CC,
        TICKET_PRIORITY,
        TICKET_REQUEST,
        TICKET_STATUS
    ]

    key = models.CharField(max_length=100, unique=True, choices=[(x,x) for x in ALL])

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

    def process_ticket(self, tenant_id, ticket, event):
        """
        for each automation-filter in this Tenant's Automation Filters
          does it match?
            match logic:
              for each profile filter in this Assingment Profile:
                do all filters's match? if so, it's an match for this
                automation profile

          if match:
            "return True" or "automation" is a placeholder return

            TODO: should trigger running all Actions associated
                  with this Automation

        :param tenant_id: related tenant.id to the automations
        :param ticket: Ticket instance to process
        :param event: string name of the AutomationEvent that triggered this
        """
        if ticket.creator and not ticket.creator.role.process_assign:
            ticket.assignee = ticket.creator
            return True

        for automation in (self.filter(events__key=event, tenant__id=tenant_id)
                               .order_by('description')):
            match = automation.is_match(ticket)
            if match:
                self.process_actions(automation, ticket, event)

        ticket.save()

    def process_actions(self, automation, ticket, event):
        for action in automation.actions.all():
            key = action.type.key

            if key == AutomationActionType.TICKET_ASSIGNEE:
                init_assignee = ticket.assignee
                new_assignee = Person.objects.get(id=action.content['assignee'])
                ticket.assignee = new_assignee
                kwargs = {'from': init_assignee, 'to': new_assignee}
                self._log_from_to_activity(TicketActivityType.ASSIGNEE, ticket, automation, **kwargs)
            elif key == AutomationActionType.TICKET_PRIORITY:
                init_priority = ticket.priority
                new_priority = TicketPriority.objects.get(id=action.content['priority'])
                ticket.priority = new_priority
                kwargs = {'from': init_priority, 'to': new_priority}
                self._log_from_to_activity(TicketActivityType.PRIORITY, ticket, automation, **kwargs)
            elif key == AutomationActionType.TICKET_STATUS:
                init_status = ticket.status
                new_status = TicketStatus.objects.get(id=action.content['status'])
                ticket.status = new_status
                kwargs = {'from': init_status, 'to': new_status}
                self._log_from_to_activity(TicketActivityType.STATUS, ticket, automation, **kwargs)
            elif key == AutomationActionType.SEND_EMAIL:
                contact_tasks.process_send_email.apply_async(
                    (ticket.id, action.id, event), queue=settings.CELERY_DEFAULT_QUEUE)
            elif key == AutomationActionType.SEND_SMS:
                contact_tasks.process_send_sms.apply_async(
                    (ticket.id, action.id, event), queue=settings.CELERY_DEFAULT_QUEUE)
            elif key == AutomationActionType.TICKET_REQUEST:
                request = action.content['request']
                ticket.request = '{}\n{}'.format(ticket.request, request)
                self._log_ticket_request_activity(ticket, automation, request)
            elif key == AutomationActionType.TICKET_CC:
                # Only process on existing tickets. If a ticket is created for the first time,
                # don't need to diff the ccs. If proccessed before initial save, trying to
                # add ccs to a ticket that isn't in the db yet will cause an IntegrityError
                if ticket.created:
                    existing_ccs = set([str(x['id']) for x in ticket.cc.values('id')])
                    action_ccs = set([str(x) for x in action.content['ccs']])
                    new_ccs = action_ccs - existing_ccs
                    if new_ccs:
                        people = Person.objects.filter(id__in=list(new_ccs))
                        ticket.cc.set([p for p in people])
                        self._log_ticket_cc_add_activity(ticket, automation, new_ccs)

    def _log_from_to_activity(self, type_name, ticket, automation, **kwargs):
        from_obj = kwargs.get('from', None)
        to_obj = kwargs.get('to', None)
        activity_type = TicketActivityType.objects.get(name=type_name)
        TicketActivity.objects.create(type=activity_type, ticket=ticket, automation=automation,
                                      content={'from': str(from_obj.id) if from_obj else None,
                                               'to': str(to_obj.id) if to_obj else None})

    def _log_ticket_request_activity(self, ticket, automation, request):
        activity_type = TicketActivityType.objects.get(name=TicketActivityType.REQUEST)
        TicketActivity.objects.create(type=activity_type, ticket=ticket, automation=automation,
                                      content={'added': request})

    def _log_ticket_cc_add_activity(self, ticket, automation, new_ccs):
        activity_type = TicketActivityType.objects.get(name=TicketActivityType.CC_ADD)
        new_ccs_dict = {str(i): cc for i,cc in enumerate(new_ccs)}
        TicketActivity.objects.create(type=activity_type, ticket=ticket, automation=automation,
                                      content=new_ccs_dict)


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
    PRIORITY = "admin.placeholder.priority_filter_select"
    CATEGORY = "admin.placeholder.category_filter_select"
    STATE = "admin.placeholder.state_filter_select"
    COUNTRY = "admin.placeholder.country_filter_select"

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


class AutomationFilter(BaseModel):
    """
    The first 4 fields are the same as the AutomationFilterType fields, but
    the "lookups" field is different. It will contain criteria for the
    dynamic AutomationFilterType that was selected.

    ex: AutomationFilterType.lookups: {'filters': 'location_level'}
        AutomationFilter.lookups: {'location_level': <location_level_id>}

    expl: Basically AutomationFilter has the serialized value returned by the
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
            related_model = getattr(ticket, self.source.field)

            if isinstance(related_model, Location):
                # first check if contained in `criteria` b/c this
                # is the cheaper check
                in_criteria = str(related_model.id) in self.criteria
                if in_criteria:
                    return True
                else:
                    parent_locations = Location.objects.get_all_parents(related_model).values_list('id', flat=True)
                    return set((str(x) for x in parent_locations)).intersection(set(self.criteria))
            else:
                return str(related_model.id) in self.criteria

        # categories
        elif isinstance(field_type, models.ManyToManyField):
            category_ids = {str(x) for x in ticket.categories.values_list('id', flat=True)}
            return set(category_ids).intersection(set(self.criteria))

    def _is_address_match(self, ticket, related__id):
        related_ids = ((str(x) for x in ticket.location.addresses
                                              .office_and_stores()
                                              .values_list(related__id, flat=True)))
        return set(related_ids).intersection(set(self.criteria))
