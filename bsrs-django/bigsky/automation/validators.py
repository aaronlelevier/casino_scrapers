from django.conf import settings
from django.contrib.auth.models import ContentType

from rest_framework.exceptions import ValidationError

from automation.models import Automation, AutomationActionType
from person.models import Person
from ticket.models import TicketPriority, TicketStatus


class AutomationActionValidator(object):
    """
    Validates the key,values in the "content" JSON field
    are consistent with the AutomationActionType.
    """
    def __call__(self, data):
        self.action_type = data.get('type')
        self.content = data.get('content')

        if self.action_type.key == AutomationActionType.TICKET_ASSIGNEE:
            self.related_model_is_valid('assignee', Person)
        elif self.action_type.key == AutomationActionType.TICKET_PRIORITY:
            self.related_model_is_valid('priority', TicketPriority)
        elif self.action_type.key == AutomationActionType.TICKET_STATUS:
            self.related_model_is_valid('status', TicketStatus)
        elif self.action_type.key == AutomationActionType.SEND_EMAIL:
            self.type_with_fields_is_valid(['recipients', 'subject', 'body'])
        elif self.action_type.key == AutomationActionType.SEND_SMS:
            self.type_with_fields_is_valid(['recipients', 'body'])
        elif self.action_type.key == AutomationActionType.TICKET_REQUEST:
            self.type_with_fields_is_valid(['request'])

    def related_model_is_valid(self, key, related_model_cls):
        error_msg = "For type: {} must provide a key of: {} which is a {}.id".format(
            self.action_type.key, key, related_model_cls.__class__.__name__)

        if key not in self.content or len(self.content) != 1:
            raise ValidationError(error_msg)
        else:
            id_ = self.content[key]
            try:
                assert related_model_cls.objects.filter(id=id_).exists()
            except (TypeError, AssertionError):
                raise ValidationError(error_msg)

    def type_with_fields_is_valid(self, fields):
        error_msg = "For type: {} must provide these keys: {}".format(
            self.action_type.key, ', '.join(fields))

        if set(fields) != set(self.content.keys()):
            raise ValidationError(error_msg)


class AutomationFilterFieldValidator(object):
    """Validate that the Model class returned by the 'context' has
    the 'field' and that the 'field' has valid 'criteria'."""

    def __call__(self, data):
        self.source = data.get('source', None)
        self.criteria = data.get('criteria', [])

        app_label, model = settings.DEFAULT_PROFILE_FILTER_CONTEXT.split('.')
        content_type = ContentType.objects.get(app_label=app_label, model=model)

        klass = content_type.model_class()
        self.is_valid_field_filter(klass)

    def is_valid_field_filter(self, klass):
        af = self.source

        if af.field in ('location', 'priority', 'categories'):
            rel_klass = klass._meta.get_field(af.field).rel.to
            try:
                if not rel_klass.objects.filter(id__in=self.criteria).exists():
                    raise ValidationError("'{}' is not a valid id for '{}'"
                                          .format(self.criteria, rel_klass.__name__))
            except ValueError:
                # raised if a NULL value or non-list type is passed to the try block
                raise ValidationError("'{}' not valid. Must be a list of UUIDs".format(self.criteria))


class AutomationFilterTypeValidator(object):
    """Each AutomationFilterType can only be used 1x. Get the AF from the 'id'
    attr for an Automation's related AutomationFilters in order to check it."""

    def __call__(self, data):
        filters = data.get('filters', [])

        unique_keys = set()
        dupe_keys = []
        for f in filters:
            af = f['source']
            field = af.field

            addit_model_id = ''
            if f.get('lookups', {}):
                addit_model_id = "-location_level-"+f['lookups']['id']

            key = "{}{}".format(field, addit_model_id)

            if key in unique_keys:
                dupe_keys.append(key)

            unique_keys.update([key])

        if dupe_keys:
            raise ValidationError("Duplicate filter(s): {}".format(' ,'.join(dupe_keys)))


class UniqueByTenantValidator(object):

    def __init__(self, field):
        self.field = field

    def __call__(self, data):
        field_value = data.get(self.field, None)
        tenant = data.get('tenant', None)
        kwargs = {
            self.field: field_value,
            'tenant': tenant
        }

        if self.instance:
            exists = Automation.objects.filter(**kwargs).exclude(id=self.instance.id).exists()
        else:
            exists = Automation.objects.filter(**kwargs).exists()

        if exists:
            raise ValidationError("{}: '{}' already exists for Tenant: '{}'"
                                  .format(self.field, field_value, tenant.id))

    def set_context(self, serializer=None):
        """Determine the existing instance, prior to the validation
        call being made."""
        self.instance = getattr(serializer, 'instance', None)
