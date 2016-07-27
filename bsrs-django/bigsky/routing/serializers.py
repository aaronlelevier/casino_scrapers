import copy

from rest_framework import serializers

from location.models import LocationLevel
from person.serializers_leaf import PersonIdUsernameSerializer
from routing.models import Assignment, ProfileFilter, AvailableFilter
from routing.validators import ProfileFilterFieldValidator, UniqueByTenantValidator
from tenant.mixins import RemoveTenantMixin
from utils.create import update_model
from utils.serializers import BaseCreateSerializer


class AvailableFilterSerializer(serializers.ModelSerializer):

    class Meta:
        model = AvailableFilter
        fields = ('id', 'key', 'key_is_i18n', 'context', 'field', 'lookups',)


PROFILE_FILTER_FIELDS = ('id', 'lookups', 'criteria', 'source',)

class ProfileFilterUnnestedSerializer(BaseCreateSerializer):

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
        return self._combined_data(data)

    def _combined_data(self, data):
        if 'location_level' in data['lookups']:
            location_level = LocationLevel.objects.get(id=data['lookups']['location_level'])
            data['lookups']['location_level'] = {
                'id': location_level.id,
                'name': location_level.name
            }
        return data


ASSIGNMENT_FIELDS = ('id', 'tenant', 'order', 'description', 'assignee',)

class AssignmentCreateUpdateSerializer(RemoveTenantMixin, BaseCreateSerializer):

    filters = ProfileFilterUnnestedSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        validators = [UniqueByTenantValidator('order'),
                      UniqueByTenantValidator('description')]
        fields = ASSIGNMENT_FIELDS + ('filters',)

    def create(self, validated_data):
        filters = validated_data.pop('filters')

        instance = super(AssignmentCreateUpdateSerializer, self).create(validated_data)

        if filters:
            for f in filters:
                try:
                    filter_object = ProfileFilter.objects.get(id=f['id'])
                except ProfileFilter.DoesNotExist:
                    filter_object = ProfileFilter.objects.create(**f)
                finally:
                    instance.filters.add(filter_object)

        return instance

    def update(self, instance, validated_data):
        filter_ids = []

        # create/update nested ProfileFilters
        filters = validated_data.pop('filters')
        if filters:
            for f in filters:
                try:
                    pf = ProfileFilter.objects.get(id=f['id'])
                except ProfileFilter.DoesNotExist:
                    pf = ProfileFilter.objects.create(**f)
                else:
                    update_model(pf, f)
                finally:
                    filter_ids.append(pf.id)
                    instance.filters.add(pf)

        # # hard delete if not sent
        for x in instance.filters.exclude(id__in=filter_ids):
            x.delete(override=True)

        return super(AssignmentCreateUpdateSerializer, self).update(instance, validated_data)


class AssignmentListSerializer(RemoveTenantMixin, BaseCreateSerializer):

    assignee = PersonIdUsernameSerializer()

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee')


class AssignmentDetailSerializer(RemoveTenantMixin, BaseCreateSerializer):

    assignee = PersonIdUsernameSerializer()
    filters = ProfileFilterSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS + ('filters',)

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee').prefetch_related('filters')
