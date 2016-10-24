from django import template

from category.models import Category
from generic.models import Attachment
from person.models import Person
from ticket.models import TicketActivityType, TicketStatus, TicketPriority

register = template.Library()


@register.filter
def ticket_activity_description(activity):
    name = activity.type.name

    if name == TicketActivityType.CREATE:
        return 'ticket.activity_type.create'

    elif name == TicketActivityType.ASSIGNEE:
        from_person = Person.objects.get(id=activity.content['from'])
        to_person = Person.objects.get(id=activity.content['to'])
        return 'ticket.activity_type.assignee' + ' from: {} to {}'.format(
                from_person.fullname, to_person.fullname)

    elif name == TicketActivityType.CC_ADD:
        people = Person.objects.filter(id__in=activity.content.values())
        return 'ticket.activity_type.cc_add' + ' {}'.format(', '.join([p.fullname for p in people]))

    elif name == TicketActivityType.CC_REMOVE:
        people = Person.objects.filter(id__in=activity.content.values())
        return 'ticket.activity_type.cc_remove' + ' {}'.format(', '.join([p.fullname for p in people]))

    elif name == TicketActivityType.STATUS:
        from_status = TicketStatus.objects.get(id=activity.content['from'])
        to_status = TicketStatus.objects.get(id=activity.content['to'])
        return 'ticket.activity_type.status' + ' from: {} to {}'.format(
                from_status.name, to_status.name)

    elif name == TicketActivityType.PRIORITY:
        from_priority = TicketPriority.objects.get(id=activity.content['from'])
        to_priority = TicketPriority.objects.get(id=activity.content['to'])
        return 'ticket.activity_type.priority' + ' from: {} to {}'.format(
                from_priority.name, to_priority.name)

    elif name == TicketActivityType.CATEGORIES:
        from_categories = Category.objects.filter(id__in=[v for k,v in activity.content.items()
                                                       if k.startswith('from_')])
        to_categories = Category.objects.filter(id__in=[v for k,v in activity.content.items()
                                                       if k.startswith('to_')])
        return 'ticket.activity_type.categories' + ' from: {} to {}'.format(
                ', '.join([x.name for x in from_categories]),
                ', '.join([x.name for x in to_categories]))

    elif name == TicketActivityType.COMMENT:
        return 'ticket.activity_type.comment' + ' ' + activity.content.get('comment', '')

    elif name == TicketActivityType.ATTACHMENT_ADD:
        attachments = Attachment.objects.filter(id__in=activity.content.values())
        return 'ticket.activity_type.attachment_add' + ' {}'.format(', '.join([x.filename for x in attachments]))
