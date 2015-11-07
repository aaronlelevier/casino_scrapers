from rest_framework import serializers

from category.serializers import CategoryIDNameSerializer
from location.serializers import LocationSerializer
from person.models import Person
from person.serializers import PersonSimpleSerializer, PersonTicketSerializer
from ticket.models import Ticket, TicketActivity, TicketActivityType
from utils.serializers import BaseCreateSerializer


TICKET_FIELDS = ('id', 'location', 'status', 'priority', 'assignee',
    'requester', 'categories', 'attachments', 'request',)


class TicketBaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS


class TicketCreateSerializer(BaseCreateSerializer):
    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('cc',)


class TicketListSerializer(TicketBaseSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonTicketSerializer(required=False)
    location = LocationSerializer()

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number',)


class TicketSerializer(TicketBaseSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonTicketSerializer(required=False)
    location = LocationSerializer()
    requester = PersonTicketSerializer()
    cc = PersonTicketSerializer(many=True)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number', 'cc')


class TicketActivitySerializer(serializers.ModelSerializer):

    person = PersonSimpleSerializer()

    class Meta:
        model = TicketActivity
        fields = ('id', 'created', 'type', 'ticket', 'person', 'content',)

    def to_representation(self, obj):
        """
        Handle different data structures based on TicketActivityType. These will be
        loaded as fixtures, so all TicketActivityType will be present here.
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

        return data
