from category.tests.factory import create_repair_category, create_single_category
from contact.tests.factory import create_contact_state, create_contact_country
from location.tests.factory import create_top_level_location
from person.tests.factory import create_single_person
from automation.models import (AutomationEvent, Automation, AutomationFilter, AutomationFilterType,
    AutomationActionType, AutomationAction)
from tenant.tests.factory import get_or_create_tenant
from ticket.models import TicketPriority, TicketStatus
from utils.create import random_lorem
from utils.helpers import create_default


# AutomationEvents

def create_automation_event(key=AutomationEvent.STATUS_NEW):
    obj, _  = AutomationEvent.objects.get_or_create(key=key)
    return obj


def create_automation_event_two(key=AutomationEvent.STATUS_COMPLETE):
    obj, _  = AutomationEvent.objects.get_or_create(key=key)
    return obj


def create_automation_events():
    return [create_automation_event(key) for key in AutomationEvent.ALL]


# AutomationActionTypes

def create_automation_action_type(key=AutomationActionType.TICKET_ASSIGNEE):
    obj, _ = AutomationActionType.objects.get_or_create(key=key)
    return obj


def create_automation_action_types():
    return [create_automation_action_type(key) for key in AutomationActionType.ALL]


# AutomationActions

NO_RELATED_AUTOMATION_MODELS_KWARGS = {
    'with_actions': False,
    'with_filters': False
}

def _get_automation_and_action_type(automation, action_type_key):
    if not automation:
        automation = create_automation(**NO_RELATED_AUTOMATION_MODELS_KWARGS)
    action_type = create_automation_action_type(action_type_key)
    return (automation, action_type)


def create_automation_action_assignee(automation=None):
    automation, type = _get_automation_and_action_type(automation, AutomationActionType.TICKET_ASSIGNEE)
    person = create_single_person('admin')
    return AutomationAction.objects.create(type=type, automation=automation,
                                           content={'assignee': str(person.id)})


def create_automation_action_send_email(automation=None):
    automation, type = _get_automation_and_action_type(automation, AutomationActionType.SEND_EMAIL)
    person = create_single_person('admin')
    role = person.role
    return AutomationAction.objects.create(
        type=type, automation=automation,
        content={'recipients': [{'id': str(person.id), 'type': 'person'}, {'id': str(role.id), 'type': 'role'}], 'subject': 'foo', 'body': 'bar'})


def create_automation_action_send_sms(automation=None):
    automation, type = _get_automation_and_action_type(automation, AutomationActionType.SEND_SMS)
    person = create_single_person('admin')
    role = person.role
    return AutomationAction.objects.create(
        type=type, automation=automation,
        content={'recipients': [{'id': str(person.id), 'type': 'person'}, {'id': str(role.id), 'type': 'role'}], 'body': 'bar'})


def create_automation_action_priority(automation=None):
    automation, type = _get_automation_and_action_type(automation, AutomationActionType.TICKET_PRIORITY)
    priority = create_default(TicketPriority)
    return AutomationAction.objects.create(type=type, automation=automation,
                                           content={'priority': str(priority.id)})


def create_automation_action_status(automation=None):
    automation, type = _get_automation_and_action_type(automation, AutomationActionType.TICKET_STATUS)
    status = create_default(TicketStatus)
    return AutomationAction.objects.create(type=type, automation=automation,
                                           content={'status': str(status.id)})


def create_automation_action_request(automation=None):
    automation, type = _get_automation_and_action_type(automation, AutomationActionType.TICKET_REQUEST)
    return AutomationAction.objects.create(type=type, automation=automation,
                                           content={'request': 'foo'})


def create_automation_action_cc(automation=None):
    automation, type = _get_automation_and_action_type(automation, AutomationActionType.TICKET_CC)
    person = create_single_person()
    return AutomationAction.objects.create(type=type, automation=automation,
                                           content={'ccs': [str(person.id)]})


def create_automation_actions():
    create_automation_action_assignee()
    create_automation_action_send_email()
    create_automation_action_send_sms()
    create_automation_action_priority()
    create_automation_action_status()
    create_automation_action_request()
    create_automation_action_cc()


# AutomationFilterTypes

def create_automation_filter_type_priority():
    obj, _ = AutomationFilterType.objects.get_or_create(key=AutomationFilterType.PRIORITY,
                                                   field='priority')
    return obj


def create_automation_filter_type_categories():
    obj, _ = AutomationFilterType.objects.get_or_create(key=AutomationFilterType.CATEGORY,
                                                   field='categories')
    return obj


def create_automation_filter_type_location():
    obj, _ = AutomationFilterType.objects.get_or_create(field='location',
                                                   lookups={'filters': 'location_level'})
    return obj


def create_automation_filter_type_state():
    obj, _ = AutomationFilterType.objects.get_or_create(key=AutomationFilterType.STATE,
                                                   field='state')
    return obj

def create_automation_filter_type_country():
    obj, _ = AutomationFilterType.objects.get_or_create(key=AutomationFilterType.COUNTRY,
                                                   field='country')
    return obj


def create_automation_filter_types():
    create_automation_filter_type_priority()
    create_automation_filter_type_categories()
    create_automation_filter_type_location()
    create_automation_filter_type_state()
    create_automation_filter_type_country()


# AutomationFilters

def create_ticket_priority_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    priority = create_default(TicketPriority)
    source = create_automation_filter_type_priority()
    return AutomationFilter.objects.create(
        automation=automation, source=source, criteria=[str(priority.id)])


def create_ticket_categories_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    category = create_repair_category()
    source = create_automation_filter_type_categories()
    return AutomationFilter.objects.create(
        automation=automation, source=source, criteria=[str(category.id)])


def create_ticket_categories_mid_level_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    category = create_repair_category()
    child_category = create_single_category(parent=category)
    source = create_automation_filter_type_categories()
    return AutomationFilter.objects.create(
        automation=automation, source=source, criteria=[str(child_category.id)])


def create_ticket_location_filter(automation=None, location=None):
    if not automation:
        automation = create_automation(with_filters=False)

    if location:
        location_level = location.location_level
    else:
        location = create_top_level_location()
        location_level = location.location_level

    source = create_automation_filter_type_location()
    return AutomationFilter.objects.create(
        automation=automation, source=source, criteria=[str(location.id)],
        lookups={'filters': 'location_level',
                 'id': str(location_level.id),
                 'name': location_level.name})


def create_ticket_location_state_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    state = create_contact_state()
    source = create_automation_filter_type_state()
    return AutomationFilter.objects.create(
        automation=automation, source=source, criteria=[str(state.id)])


def create_ticket_location_country_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    country = create_contact_country()
    source = create_automation_filter_type_country()
    return AutomationFilter.objects.create(
        automation=automation, source=source, criteria=[str(country.id)])


def create_automation_filters():
    create_ticket_priority_filter()
    create_ticket_categories_filter()
    create_ticket_location_filter()
    create_ticket_location_state_filter()
    create_ticket_location_country_filter()


# Automations

def create_automation(description=None, tenant=None, with_actions=True, with_filters=True):
    kwargs = {
        'description': description or random_lorem(),
        'tenant': tenant or get_or_create_tenant()
    }

    try:
        automation = Automation.objects.get(**kwargs)
    except Automation.DoesNotExist:
        automation = Automation.objects.create(**kwargs)

        # events
        event = create_automation_event()
        automation.events.add(event)
        # actions
        if with_actions:
            create_automation_action_assignee(automation)
        # provile_filters
        if with_filters:
            create_ticket_priority_filter(automation)
            create_ticket_categories_filter(automation)

    return automation


def create_automations():
    for pf in AutomationFilter.objects.all():
        automation = pf.automation

        if pf.source.key:
            automation.description = pf.source.key
        else:
            automation.description = pf.source.field

        automation.save()


def upate_automation_names_for_fixtures():
    for automation in Automation.objects.all():
        action = automation.actions.first()
        action_name = action.type.key

        automation_filter = automation.filters.first()
        if automation_filter and automation_filter.source.key:
            filter_name = automation_filter.source.key
        else:
            filter_name = 'None'

        automation.description = "Filter: {} --- Action: {}".format(filter_name, action_name)
        automation.save()
