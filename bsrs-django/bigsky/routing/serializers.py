from rest_framework import serializers

from routing.models import Assignment, ProfileFilter
from person.serializers_leaf import PersonIdUsernameSerializer
from utils.serializers import BaseCreateSerializer


ASSIGNMENT_FIELDS = ('id', 'description', 'assignee',)


class ProfileFilterSerializer(BaseCreateSerializer):

    class Meta:
        model = ProfileFilter
        fields = ('id', 'context', 'field', 'criteria')


class AssignmentCreateUpdateSerializer(BaseCreateSerializer):

    filters = ProfileFilterSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS + ('filters',)

    def create(self, validated_data):
        filters = validated_data.pop('filters')

        instance = super(AssignmentCreateUpdateSerializer, self).create(validated_data)

        if filters:
            for f in filters:
                filter_object = ProfileFilter.objects.create(**f)
                instance.filters.add(filter_object)

        return instance

    def update(self, instance, validated_data):
        validated_data.pop('filters')
        return super(AssignmentCreateUpdateSerializer, self).update(instance, validated_data)


class AssignmentListSerializer(BaseCreateSerializer):

    assignee = PersonIdUsernameSerializer()

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee')


class AssignmentDetailSerializer(BaseCreateSerializer):

    assignee = PersonIdUsernameSerializer()
    filters = ProfileFilterSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS + ('filters',)

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee').prefetch_related('filters')
