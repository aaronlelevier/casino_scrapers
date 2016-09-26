from category.tests.factory import create_repair_category, create_single_category
from contact.tests.factory import create_contact_state, create_contact_country
from location.tests.factory import create_top_level_location
from person.models import Person
from person.tests.factory import create_single_person
from automation.choices import AUTOMATION_EVENTS, AUTOMATION_ACTION_TYPES
from automation.models import (AutomationEvent, Automation, ProfileFilter, AutomationFilterType,
    AutomationActionType, AutomationAction)
from tenant.tests.factory import get_or_create_tenant
from ticket.models import TicketPriority
from utils.create import random_lorem
from utils.helpers import create_default


# AutomationEvents

DEFAULT_ROUTING_EVENT = 'automation.event.ticket_status_new'
DEFAULT_ROUTING_EVENT_TWO = 'automation.event.ticket_status_complete'

def create_automation_event(key=DEFAULT_ROUTING_EVENT):
    obj, _  = AutomationEvent.objects.get_or_create(key=key)
    return obj


def create_automation_event_two(key=DEFAULT_ROUTING_EVENT_TWO):
    obj, _  = AutomationEvent.objects.get_or_create(key=key)
    return obj


def create_automation_events():
    [create_automation_event(key) for key in AUTOMATION_EVENTS]


# AutomationActionTypes

DEFAULT_AUTOMATION_ACTION_TYPE = 'automation.actions.ticket_assignee'
DEFAULT_AUTOMATION_ACTION_TYPE_TWO = 'automation.actions.email'

def create_automation_action_type(key=DEFAULT_AUTOMATION_ACTION_TYPE):
    obj, _ = AutomationActionType.objects.get_or_create(key=key)
    return obj


def create_automation_action_types():
    [create_automation_action_type(key) for key in AUTOMATION_ACTION_TYPES]


# AutomationActions

def create_automation_action(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)

    type = create_automation_action_type()
    person = create_single_person()
    return AutomationAction.objects.create(type=type, automation=automation,
                                           content={'assignee': str(person.id)})


# AutomationFilterTypes

def create_automation_filter_type_priority():
    obj, _ = AutomationFilterType.objects.get_or_create(key='admin.placeholder.priority_filter_select',
                                                   field='priority')
    return obj


def create_automation_filter_type_categories():
    obj, _ = AutomationFilterType.objects.get_or_create(key='admin.placeholder.category_filter_select',
                                                   field='categories')
    return obj


def create_automation_filter_type_location():
    obj, _ = AutomationFilterType.objects.get_or_create(field='location',
                                                   lookups={'filters': 'location_level'})
    return obj


def create_automation_filter_type_state():
    obj, _ = AutomationFilterType.objects.get_or_create(key='admin.placeholder.state_filter_select',
                                                   field='state')
    return obj

def create_automation_filter_type_country():
    obj, _ = AutomationFilterType.objects.get_or_create(key='admin.placeholder.country_filter_select',
                                                   field='country')
    return obj


def create_automation_filter_types():
    create_automation_filter_type_priority()
    create_automation_filter_type_categories()
    create_automation_filter_type_location()
    create_automation_filter_type_state()
    create_automation_filter_type_country()


# ProfileFilters

def create_ticket_priority_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    priority = create_default(TicketPriority)
    source = create_automation_filter_type_priority()
    return ProfileFilter.objects.create(
        automation=automation, source=source, criteria=[str(priority.id)])


def create_ticket_categories_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    category = create_repair_category()
    source = create_automation_filter_type_categories()
    return ProfileFilter.objects.create(
        automation=automation, source=source, criteria=[str(category.id)])


def create_ticket_categories_mid_level_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    category = create_repair_category()
    child_category = create_single_category(parent=category)
    source = create_automation_filter_type_categories()
    return ProfileFilter.objects.create(
        automation=automation, source=source, criteria=[str(child_category.id)])


def create_ticket_location_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    location = create_top_level_location()
    location_level = location.location_level
    source = create_automation_filter_type_location()
    return ProfileFilter.objects.create(
        automation=automation, source=source, criteria=[str(location.id)],
        lookups={'filters': 'location_level',
                 'id': str(location_level.id),
                 'name': location_level.name})


def create_ticket_location_state_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    state = create_contact_state()
    source = create_automation_filter_type_state()
    return ProfileFilter.objects.create(
        automation=automation, source=source, criteria=[str(state.id)])


def create_ticket_location_country_filter(automation=None):
    if not automation:
        automation = create_automation(with_filters=False)
    country = create_contact_country()
    source = create_automation_filter_type_country()
    return ProfileFilter.objects.create(
        automation=automation, source=source, criteria=[str(country.id)])


def create_profile_filters():
    create_ticket_priority_filter()
    create_ticket_categories_filter()
    create_ticket_location_filter()
    create_ticket_location_state_filter()
    create_ticket_location_country_filter()


# Automations

def create_automation(description=None, tenant=None, with_filters=True):
    kwargs = {
        'description': description or random_lorem(1),
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
        create_automation_action(automation)
        # provile_filters
        if with_filters:
            create_ticket_priority_filter(automation)
            create_ticket_categories_filter(automation)

    return automation


def create_automations():
    for pf in ProfileFilter.objects.all():
        automation = pf.automation

        if pf.source.key:
            automation.description = pf.source.key
        else:
            automation.description = pf.source.field

        automation.save()
