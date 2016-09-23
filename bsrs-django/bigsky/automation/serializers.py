import copy

from rest_framework import serializers

from category.models import Category
from contact.models import State, Country
from location.models import Location, LocationLevel
from person.models import Person
from person.serializers_leaf import PersonSimpleSerializer
from automation.models import (AutomationEvent, Automation, ProfileFilter, AvailableFilter,
    AutomationAction, AutomationActionType)
from automation.validators import (ProfileFilterFieldValidator, UniqueByTenantValidator,
    AvailableFilterValidator)
from tenant.mixins import RemoveTenantMixin
from ticket.models import TicketPriority
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


class AvailableFilterSerializer(serializers.ModelSerializer):

    class Meta:
        model = AvailableFilter
        fields = ('id', 'key', 'field', 'lookups',)


PROFILE_FILTER_FIELDS = ('id', 'lookups', 'criteria', 'source',)

class ProfileFilterUnnestedSerializer(BaseCreateSerializer):

    source = serializers.PrimaryKeyRelatedField(
        queryset=AvailableFilter.objects.all(), required=False)

    class Meta:
        model = ProfileFilter
        validators = [ProfileFilterFieldValidator()]
        fields = PROFILE_FILTER_FIELDS


class ProfileFilterSerializer(BaseCreateSerializer):

    source = AvailableFilterSerializer()

    class Meta:
        model = ProfileFilter
        fields = PROFILE_FILTER_FIELDS

    def to_representation(self, instance):
        init_data = super(ProfileFilterSerializer, self).to_representation(instance)
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

    filters = ProfileFilterUnnestedSerializer(required=False, many=True)

    class Meta:
        model = Automation
        validators = [AvailableFilterValidator(),
                      UniqueByTenantValidator('description')]
        fields = AUTOMATION_FIELDS + ('events', 'filters',)

    def create(self, validated_data):
        filters = validated_data.pop('filters')

        instance = super(AutomationCreateUpdateSerializer, self).create(validated_data)

        if filters:
            for f in filters:
                pf = ProfileFilter.objects.create(automation=instance, **f)

        return instance

    def update(self, instance, validated_data):
        filter_ids = []
        filters = validated_data.pop('filters')

        if filters:
            for f in filters:
                try:
                    pf = instance.filters.get(id=f['id'])
                except ProfileFilter.DoesNotExist:

                    pf = ProfileFilter.objects.create(automation=instance, **f)
                else:
                    pf.criteria = f.get('criteria', [])
                    pf.lookups = f.get('lookups', {})
                    pf.save()
                finally:
                    filter_ids.append(pf.id)

        # # hard delete if not sent
        for x in instance.filters.exclude(id__in=filter_ids):
            x.delete(override=True)

        return super(AutomationCreateUpdateSerializer, self).update(instance, validated_data)


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
    filters = ProfileFilterSerializer(required=False, many=True)

    class Meta:
        model = Automation
        fields = AUTOMATION_FIELDS + ('events', 'actions', 'filters',)

    @staticmethod
    def eager_load(queryset):
        return queryset.prefetch_related('events', 'filters', 'filters__source')

    def to_representation(self, instance):
        init_data = super(AutomationDetailSerializer, self).to_representation(instance)
        data = copy.copy(init_data)

        for i, action in enumerate(init_data['actions']):
            if action['type']['key'] == 'automation.actions.ticket_assignee':
                data['actions'][i]['assignee'] = (Person.objects.get(id=action['content']['assignee'])
                                                                .to_simple_fullname_dict())

            # this is a storage dict for the data to be decorated onto
            # the automation action, so remove before returning the data
            data['actions'][i].pop('content')

        return data