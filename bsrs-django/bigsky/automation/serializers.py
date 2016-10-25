import copy
from itertools import chain

from rest_framework import serializers

from category.models import Category
from contact.models import State, Country
from location.models import Location, LocationLevel
from person.models import Role, Person
from automation.models import (AutomationEvent, Automation, AutomationFilter, AutomationFilterType,
    AutomationAction, AutomationActionType)
from automation.validators import (AutomationFilterFieldValidator, UniqueByTenantValidator,
    AutomationFilterTypeValidator)
from tenant.mixins import RemoveTenantMixin
from ticket.models import TicketPriority, TicketStatus
from utils.create import update_model
from utils.helpers import get_person_and_role_ids
from utils.serializers import BaseCreateSerializer


class AutomationEventSerializer(serializers.ModelSerializer):

    class Meta:
        model = AutomationEvent
        fields = ('id', 'key')


class AutomationActionTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AutomationActionType
        fields = ('id', 'key')


class AutomationActionSerializer(BaseCreateSerializer):

    type = AutomationActionTypeSerializer()

    class Meta:
        model = AutomationAction
        fields = ('id', 'type', 'content')

    def to_representation(self, instance):
        init_data = super(AutomationActionSerializer, self).to_representation(instance)
        data = copy.copy(init_data)

        key = data['type']['key']
        if key == AutomationActionType.TICKET_ASSIGNEE:
            data['assignee'] = Person.objects.get(id=data['content']['assignee']).to_simple_fullname_dict()
        elif key == AutomationActionType.TICKET_PRIORITY:
            data['priority'] = TicketPriority.objects.get(id=data['content']['priority']).to_dict_id_name()
        elif key == AutomationActionType.TICKET_STATUS:
            data['status'] = TicketStatus.objects.get(id=data['content']['status']).to_dict_id_name()
        elif key == AutomationActionType.SEND_EMAIL:
            data.update(data['content'])
            data['recipients'] = self._get_recipients(data)
        elif key == AutomationActionType.SEND_SMS:
            data.update(data['content'])
            data['recipients'] = self._get_recipients(data)

        # this is a storage dict for the data to be decorated onto
        # the automation action, so remove before returning the data
        data.pop('content')

        return data

    @staticmethod
    def _get_recipients(data):
        person_ids, role_ids = get_person_and_role_ids(data)

        person_list = Person.objects.filter(id__in=person_ids)
        role_list = Role.objects.filter(id__in=role_ids)

        result_list = list(chain(person_list, role_list))

        return [{'id': str(x.id), 'fullname': x.fullname, 'type': x.__class__.__name__.lower()}
                for x in result_list]


class AutomationActionUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = AutomationAction
        fields = ('id', 'type', 'content')


class AutomationFilterTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AutomationFilterType
        fields = ('id', 'key', 'field', 'lookups',)


PROFILE_FILTER_FIELDS = ('id', 'lookups', 'criteria', 'source',)

class AutomationFilterUnnestedSerializer(BaseCreateSerializer):

    source = serializers.PrimaryKeyRelatedField(
        queryset=AutomationFilterType.objects.all(), required=False)

    class Meta:
        model = AutomationFilter
        validators = [AutomationFilterFieldValidator()]
        fields = PROFILE_FILTER_FIELDS


class AutomationFilterSerializer(BaseCreateSerializer):

    source = AutomationFilterTypeSerializer()

    class Meta:
        model = AutomationFilter
        fields = PROFILE_FILTER_FIELDS

    def to_representation(self, instance):
        init_data = super(AutomationFilterSerializer, self).to_representation(instance)
        data = copy.copy(init_data)
        source = data.pop('source', {})
        # remove 'lookups' from source b/c both the PF and AF have
        # this key, and don't want to override what's on the PF. PF
        # could be storing a dynamic `location_level.id` for the
        # dynamic AF that was used when creating it. If you don't pop
        # this off, PF's lookups will be overrided by AF's
        source.pop('lookups', {})
        # source_id is the AvalableFitler.id
        data['source_id'] = source.pop('id')
        data.update(source)

        return self._combined_data(data)

    def _combined_data(self, data):
        field = data['field']
        criteria = data['criteria']

        # NOTE: May need to be more precise in the future for State/Country
        # right now, will jump in this 'if' block if it is a dynamic filter
        # and the only dynamic filter we're handing is for locations filtered
        # by location_level
        if data['lookups']:
            location_level = LocationLevel.objects.get(id=data['lookups']['id'])
            data['lookups'] = {
                'id': location_level.id,
                'name': location_level.name
            }
            data['key'] = data['lookups']['name']

        if field == 'location':
            data['criteria'] = Location.objects.filter(id__in=criteria).values('id', 'name')

        elif field == 'priority':
            data['criteria'] = TicketPriority.objects.filter(id__in=criteria).values('id', 'name')

        elif field == 'state':
            data['criteria'] = State.objects.filter(id__in=criteria).values('id', 'name')

        elif field == 'categories':
            category_criteria = []
            for c in Category.objects.filter(id__in=criteria):
                category_criteria.append({'id': str(c.id), 'name': c.parents_and_self_as_string()})
            data['criteria'] = category_criteria

        elif field == 'country':
            country_criteria = []
            for c in Country.objects.filter(id__in=criteria):
                country_criteria.append({'id': str(c.id), 'name': c.common_name})
            data['criteria'] = country_criteria

        return data


AUTOMATION_FIELDS = ('id', 'tenant', 'description',)

class AutomationCreateUpdateSerializer(RemoveTenantMixin, BaseCreateSerializer):

    filters = AutomationFilterUnnestedSerializer(required=False, many=True)
    actions = AutomationActionUpdateSerializer(required=False, many=True)

    class Meta:
        model = Automation
        validators = [AutomationFilterTypeValidator(),
                      UniqueByTenantValidator('description')]
        fields = AUTOMATION_FIELDS + ('events', 'filters', 'actions',)

    def create(self, validated_data):
        filters = validated_data.pop('filters', [])
        actions = validated_data.pop('actions', [])

        instance = super(AutomationCreateUpdateSerializer, self).create(validated_data)

        for f in filters:
            AutomationFilter.objects.create(automation=instance, **f)
        for a in actions:
            AutomationAction.objects.create(automation=instance, **a)

        return instance

    def update(self, instance, validated_data):
        filters = validated_data.pop('filters', [])
        actions = validated_data.pop('actions', [])

        self._crud_related_filters(instance, filters)
        self._crud_related_actions(instance, actions)

        return super(AutomationCreateUpdateSerializer, self).update(instance, validated_data)

    def _crud_related_filters(self, instance, filters):
        filter_ids = set()

        for f in filters:
            try:
                pf = instance.filters.get(id=f['id'])
            except AutomationFilter.DoesNotExist:
                pf = AutomationFilter.objects.create(automation=instance, **f)
            else:
                pf.criteria = f.get('criteria', [])
                pf.lookups = f.get('lookups', {})
                pf.save()
            finally:
                filter_ids.update([pf.id])

        for x in instance.filters.exclude(id__in=filter_ids):
            x.delete(override=True)

    def _crud_related_actions(self, instance, actions):
        action_ids = set()

        for a in actions:
            try:
                action = instance.actions.get(id=a['id'])
            except AutomationAction.DoesNotExist:
                action = AutomationAction.objects.create(automation=instance, **a)
            else:
                update_model(action, a)
            finally:
                action_ids.update([action.id])

        for x in instance.actions.exclude(id__in=action_ids):
            x.delete(override=True)


class AutomationListSerializer(RemoveTenantMixin, BaseCreateSerializer):

    events = AutomationEventSerializer(required=False, many=True)

    class Meta:
        model = Automation
        fields = AUTOMATION_FIELDS + ('events', 'has_filters')

    @staticmethod
    def eager_load(queryset):
        return queryset.prefetch_related('events', 'filters')


class AutomationDetailSerializer(RemoveTenantMixin, BaseCreateSerializer):

    events = AutomationEventSerializer(required=False, many=True)
    actions = AutomationActionSerializer(required=False, many=True)
    filters = AutomationFilterSerializer(required=False, many=True)

    class Meta:
        model = Automation
        fields = AUTOMATION_FIELDS + ('events', 'actions', 'filters',)

    @staticmethod
    def eager_load(queryset):
        return queryset.prefetch_related('events', 'filters', 'filters__source')
