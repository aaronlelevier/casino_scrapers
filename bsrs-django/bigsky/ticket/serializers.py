import copy

from rest_framework import serializers

from category.models import Category
from category.serializers import CategoryIDNameSerializer
from location.serializers import LocationSerializer
from person.models import Person
from person.serializers import PersonSimpleSerializer, PersonTicketSerializer
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivity,
    TicketActivityType)
from utils.serializers import BaseCreateSerializer


TICKET_FIELDS = ('id', 'location', 'status', 'priority', 'assignee', 'cc',
    'requester', 'categories', 'attachments', 'request',)


class TicketCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS


class TicketListSerializer(serializers.ModelSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonTicketSerializer(required=False)
    location = LocationSerializer()

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number',)


class TicketSerializer(serializers.ModelSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonTicketSerializer(required=False)
    location = LocationSerializer()
    requester = PersonTicketSerializer()
    cc = PersonTicketSerializer(many=True)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number',)


class TicketActivitySerializer(serializers.ModelSerializer):

    person = PersonSimpleSerializer()

    class Meta:
        model = TicketActivity
        fields = ('id', 'created', 'type', 'ticket', 'person', 'content',)

    def to_representation(self, obj):
        """
        Handle different data structures based on TicketActivityType. These will be
        loaded as fixtures, so all TicketActivityType will be present here.

        TODO
        ----
        Make ``data['content'] to_representation() into a class to simplify.
        """
        data = super(TicketActivitySerializer, self).to_representation(obj)

        if data['content']:
            person_ids = list(data['content'].values())
            people = Person.objects.filter(id__in=person_ids)
            types = TicketActivityType.objects.all()

            if data['type'] == types.get(name='assignee').id:
                for k,v in data['content'].items():
                    person = people.get(id=v)
                    data['content'][k] = person.to_simple_dict()

            elif data['type'] == types.get(name='cc_add').id:
                person_ids = list(data['content'].values())
                data['content'] = {'added': []}
                for id in person_ids:
                    person = Person.objects.get(id=id)
                    data['content']['added'].append(person.to_simple_dict())

            elif data['type'] == types.get(name='cc_remove').id:
                person_ids = list(data['content'].values())
                data['content'] = {'removed': []}
                for id in person_ids:
                    person = Person.objects.get(id=id)
                    data['content']['removed'].append(person.to_simple_dict())

            elif data['type'] == types.get(name='categories').id:
                # From
                from_categories = list(v for k,v in data['content'].items() if k.startswith('from_'))
                data['content'].update({'from': []})
                for id in from_categories:
                    category = Category.objects.get(id=id)
                    data['content']['from'].append(category.to_simple_dict())

                for i, _ in enumerate(data['content']['from']):
                    data['content'].pop('from_{}'.format(i))

                # To
                to_categories = list(v for k,v in data['content'].items() if k.startswith('to_'))
                data['content'].update({'to': []})
                for id in to_categories:
                    category = Category.objects.get(id=id)
                    data['content']['to'].append(category.to_simple_dict())

                for i, _ in enumerate(data['content']['from']):
                    data['content'].pop('to_{}'.format(i))

        return data
