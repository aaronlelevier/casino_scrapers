import copy
import itertools

from rest_framework import status
from rest_framework.response import Response
from rest_framework.settings import api_settings

from ticket.models import TicketActivityType, TicketActivity, TicketStatus
from utils.helpers import model_to_dict


class TicketUpdateLogger(object):
    """
    Log specific changes to the ``Ticket`` as ``TicketActivity` records
    when the ``Ticket`` is updated.
    """

    def __init__(self, instance, person, init_ticket=None, post_ticket=None, content=None):
        self.instance = instance
        self.person = person
        self.init_ticket = init_ticket
        self.post_ticket = post_ticket
        self.content = content

    def run_check_ticket_changes(self):
        "Run all log checks for the Ticket."
        self.check_cc_add_or_remove()
        self.check_from_to_changes()
        self.check_category_change()
        self.check_comment_added()
        self.check_attachments_added()

    def check_cc_add_or_remove(self):
        init_cc = set(self.init_ticket.get('cc', set()))
        post_cc = set(self.post_ticket.get('cc', set()))

        new_cc = post_cc - init_cc
        if new_cc:
            self.log_list_change(TicketActivityType.CC_ADD, new_cc)

        removed_cc = init_cc - post_cc
        if removed_cc:
            self.log_list_change(TicketActivityType.CC_REMOVE, removed_cc)

    def log_list_change(self, name, changed):
        type, _ = TicketActivityType.objects.get_or_create(name=name)
        content = {str(i): str(id) for i, id in enumerate(changed)}
        self.log_ticket_activity(type, content)

    def check_from_to_changes(self):
        fields = [
            TicketActivityType.ASSIGNEE,
            TicketActivityType.STATUS,
            TicketActivityType.PRIORITY
        ]
        for field in fields:
            self.check_from_to_change(field)

    def check_from_to_change(self, field):
        init_field = self.init_ticket.get(field, None)
        post_field = self.post_ticket.get(field, None)

        if init_field != post_field:
            type, _ = TicketActivityType.objects.get_or_create(name=field)
            content = {
                'from': str(init_field),
                'to': str(post_field)
            }
            self.log_ticket_activity(type, content)

    def check_category_change(self):
        init_categories = set(self.init_ticket.get('categories', set()))
        post_categories = set(self.post_ticket.get('categories', set()))

        changed_categories = init_categories ^ post_categories
        if changed_categories:
            type, _ = TicketActivityType.objects.get_or_create(name=TicketActivityType.CATEGORIES)

            content = {}

            for i, id in enumerate(init_categories):
                content.update({'from_{}'.format(i): str(id)})

            for i, id in enumerate(post_categories):
                content.update({'to_{}'.format(i): str(id)})

            self.log_ticket_activity(type, content)

    def check_comment_added(self):
        comment = self.init_ticket.pop("comment", None)
        if comment:
            type, _ = TicketActivityType.objects.get_or_create(name=TicketActivityType.COMMENT)
            content = {'comment': comment}
            self.log_ticket_activity(type, content)

    def check_attachments_added(self):
        attachment_ids = [str(id) for id in self.instance.attachments.values_list('id', flat=True)]

        current = set(attachment_ids)
        previous = set(self.previous_attachments(attachment_ids))

        attachments = current - previous
        if attachments:
            self.log_list_change(TicketActivityType.ATTACHMENT_ADD, attachments)

    def previous_attachments(self, attachment_ids):
        """
        Returns a list() of previously logged attachments ids.
        """
        activities = (self.instance.activities.filter(type__name=TicketActivityType.ATTACHMENT_ADD)
                                              .values_list('content', flat=True))

        return itertools.chain(*[x.values() for x in activities])

    def log_ticket_activity(self, type, content):
        TicketActivity.objects.create(
            type=type,
            person=self.person,
            ticket=self.instance,
            content=content
        )


class UpdateTicketModelMixin(object):
    """
    Add ``TicketUpdateLogger`` to standard DRF ``UpdateModelMixin``
    """
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        # store initial instance data before it gets updated
        init_ticket = copy.copy(model_to_dict(instance))
        # Comment, Attachment, etc...
        init_ticket = self.add_other_info_data(init_ticket, request.data)
        # perform update
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # set other required instance variables, and run 'TicketActivity' log checks
        post_ticket = copy.copy(serializer.data)

        log = TicketUpdateLogger(instance, request.user, init_ticket, post_ticket)
        log.run_check_ticket_changes()

        # Process Automation
        if init_ticket.get('status') != post_ticket.get('status'):
            new_status = TicketStatus.objects.get(id=post_ticket.get('status')).name
            instance.process_ticket_automations(new_status)

        # call `get_serializer` again because the instance may have
        # been modified by the automation processing, so we return
        # the most current representation of the record.
        return Response(self.get_serializer(instance).data)

    def add_other_info_data(self, init_ticket, request_data):
        for field in self.other_info_fields:
            data = request_data.get(field, None)
            if data:
                init_ticket.update({field: data})
        return init_ticket

    @property
    def other_info_fields(self):
        return [TicketActivityType.COMMENT]
