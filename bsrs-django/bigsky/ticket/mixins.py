import copy

from django.forms.models import model_to_dict

from rest_framework import status
from rest_framework.response import Response
from rest_framework.settings import api_settings

from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUSES, TICKET_PRIORITIES, TICKET_ACTIVITY_TYPES)


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

    def _create_activity_type(self, ticket, person):
        type, _ = TicketActivityType.objects.get_or_create(name='create')
        TicketActivity.objects.create(type=type, ticket=ticket, person=person)


class TicketUpdateLogger(object):
    """
    Log specific changes to the ``Ticket`` as ``TicketActivity` records
    when the ``Ticket`` is updated.
    """

    def __init__(self, instance, person, init_ticket, post_ticket):
        self.instance = instance
        self.person = person
        self.init_ticket = init_ticket
        self.post_ticket = post_ticket

    def run_check_ticket_changes(self):
        "Run all log checks for the Ticket."
        self.check_assignee_change()

    def check_assignee_change(self):
        init_assignee = self.init_ticket.get('assignee', None)
        post_assignee = self.post_ticket.get('assignee', None)

        if init_assignee != post_assignee:
            type, _ = TicketActivityType.objects.get_or_create(name='assignee')
            TicketActivity.objects.create(
                type=type,
                person=self.person,
                ticket=self.instance,
                content={
                    'from': str(init_assignee),
                    'to': str(post_assignee)
                }
            )


class UpdateTicketModelMixin(object):
    """
    Add ``TicketActivityLogger`` to standard DRF ``UpdateModelMixin``
    """
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
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
