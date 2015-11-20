import copy

from django.forms.models import model_to_dict

from rest_framework import status
from rest_framework.response import Response
from rest_framework.settings import api_settings

from ticket.models import TicketActivityType, TicketActivity


class CreateTicketModelMixin(object):
    """
    Create a model instance.
    """
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        # custom: start
        self._create_activity_type(ticket, request.user)
        # custom: end
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        return serializer.save()

    def get_success_headers(self, data):
        try:
            return {'Location': data[api_settings.URL_FIELD_NAME]}
        except (TypeError, KeyError):
            return {}

    # custom methods not in DRF

    @staticmethod
    def _create_activity_type(ticket, person):
        type, _ = TicketActivityType.objects.get_or_create(name='create')
        TicketActivity.objects.create(type=type, ticket=ticket, person=person)


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

    def run_check_attachment_change(self):
        "Run all log checks for the Ticket."
        self.check_attachment_change()

    def check_attachment_change(self):
        self.log_list_change('attachment_add', self.content)
        # if self.type == 'attachment_remove':
        #     self.log_list_change('attachment_remove', self.content)

    def check_cc_add_or_remove(self):
        init_cc = set(self.init_ticket.get('cc', set()))
        post_cc = set(self.post_ticket.get('cc', set()))

        new_cc = post_cc - init_cc
        if new_cc:
            self.log_list_change('cc_add', new_cc)

        removed_cc = init_cc - post_cc
        if removed_cc:
            self.log_list_change('cc_remove', removed_cc)

    def log_list_change(self, name, changed):
        type, _ = TicketActivityType.objects.get_or_create(name=name)
        content = {str(i): str(id) for i, id in enumerate(changed)}
        self.log_ticket_activity(type, content)

    def check_from_to_changes(self):
        fields = ['assignee', 'status', 'priority']
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
            type, _ = TicketActivityType.objects.get_or_create(name='categories')

            content = {}

            for i, id in enumerate(init_categories):
                content.update({'from_{}'.format(i): str(id)})

            for i, id in enumerate(post_categories):
                content.update({'to_{}'.format(i): str(id)})

            self.log_ticket_activity(type, content)

    def log_ticket_activity(self, type, content):
        TicketActivity.objects.create(
            type=type,
            person=self.person,
            ticket=self.instance,
            content=content
        )


class UpdateTicketModelMixin(object):
    """
    Add ``TicketActivityLogger`` to standard DRF ``UpdateModelMixin``
    """

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if 'comment' in request.data:
            comment = request.data.pop('comment', [])
            type_of, _ = TicketActivityType.objects.get_or_create(name='comment')
            TicketActivity.objects.create(type=type_of, person=request.user, ticket=instance, content={'comment': comment})
        if request.data['attachments'] != []:
            attachment_add = set(request.data.pop('attachments', set()))
            log = TicketUpdateLogger(instance, request.user, content=attachment_add)
            log.run_check_attachment_change()
        # store initial instance data before it gets updated
        init_ticket = copy.copy(model_to_dict(instance))
        # perform update
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # set other required instance variables, and run 'TicketActivity' log checks
        post_ticket = copy.copy(serializer.data)

        log = TicketUpdateLogger(instance, request.user, init_ticket, post_ticket)
        log.run_check_ticket_changes()

        return Response(serializer.data)
