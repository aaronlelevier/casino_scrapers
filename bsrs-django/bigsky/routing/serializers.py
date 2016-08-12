import copy

from rest_framework import serializers

from category.models import Category
from location.models import Location, LocationLevel
from person.serializers_leaf import PersonSimpleSerializer
from routing.models import Assignment, ProfileFilter, AvailableFilter
from routing.validators import (ProfileFilterFieldValidator, UniqueByTenantValidator,
    AvailableFilterValidator)
from tenant.mixins import RemoveTenantMixin
from ticket.models import TicketPriority
from utils.serializers import BaseCreateSerializer


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
        data.update(source)

        # dynamic AF don't have 'key', so set it based on the dynamic 'name'
        if data['lookups']:
            data['key'] = data['lookups']['name']

        return self._combined_data(data)

    def _combined_data(self, data):
        field = data['field']
        criteria = data['criteria']

        # TODO: May need to be more precise in the future for State/Country
        # right now, will jump in this 'if' block if it is a dynamic filter
        # and the only dynamic filter we're handing is for locations filtered
        # by location_level
        if data['lookups']:
            location_level = LocationLevel.objects.get(id=data['lookups']['id'])
            data['lookups'] = {
                'id': location_level.id,
                'name': location_level.name
            }

        if field == 'priority':
            data['criteria'] = TicketPriority.objects.filter(id__in=criteria).values('id', 'name')

        if field == 'location':
            data['criteria'] = Location.objects.filter(id__in=criteria).values('id', 'name')

        if field == 'categories':
            category_criteria = []
            for c in Category.objects.filter(id__in=criteria):
                category_criteria.append({'id': str(c.id), 'name': c.parents_and_self_as_string()})
            data['criteria'] = category_criteria

        return data


ASSIGNMENT_FIELDS = ('id', 'tenant', 'order', 'description', 'assignee',)

class AssignmentCreateUpdateSerializer(RemoveTenantMixin, BaseCreateSerializer):

    filters = ProfileFilterUnnestedSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        validators = [AvailableFilterValidator(),
                      UniqueByTenantValidator('order'),
                      UniqueByTenantValidator('description')]
        fields = ASSIGNMENT_FIELDS + ('filters',)

    def create(self, validated_data):
        filters = validated_data.pop('filters')

        instance = super(AssignmentCreateUpdateSerializer, self).create(validated_data)

        if filters:
            for f in filters:
                pf = self._create_profile_filter(f)
                instance.filters.add(pf)

        return instance

    def update(self, instance, validated_data):
        filter_ids = []
        filters = validated_data.pop('filters')

        if filters:
            for f in filters:
                try:
                    pf = instance.filters.get(source__id=f['id'],
                                              lookups=f.get('lookups', {}))
                except ProfileFilter.DoesNotExist:
                    pf  = self._create_profile_filter(f)
                else:
                    pf.criteria = f.get('criteria', [])
                    pf.lookups = f.get('lookups', {})
                    pf.save()
                finally:
                    filter_ids.append(pf.id)
                    instance.filters.add(pf)

        # # hard delete if not sent
        for x in instance.filters.exclude(id__in=filter_ids):
            x.delete(override=True)

        return super(AssignmentCreateUpdateSerializer, self).update(instance, validated_data)

    @staticmethod
    def _create_profile_filter(f):
        af = AvailableFilter.objects.get(id=f['id'])
        return ProfileFilter.objects.create(
            source=af,
            criteria=f.get('criteria', []),
            lookups=f.get('lookups', {})
        )


class AssignmentListSerializer(RemoveTenantMixin, BaseCreateSerializer):

    assignee = PersonSimpleSerializer()

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee')


class AssignmentDetailSerializer(RemoveTenantMixin, BaseCreateSerializer):

    assignee = PersonSimpleSerializer()
    filters = ProfileFilterSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS + ('filters',)

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee').prefetch_related('filters', 'filters__source')
