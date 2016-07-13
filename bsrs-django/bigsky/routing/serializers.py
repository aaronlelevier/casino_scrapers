from rest_framework import serializers

from routing.models import Assignment, ProfileFilter
from person.serializers_leaf import PersonIdUsernameSerializer
from utils.serializers import BaseCreateSerializer


ASSIGNMENT_FIELDS = ('id', 'description', 'assignee',)


class ProfileFilterSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfileFilter
        fields = ('id', 'context', 'field', 'criteria')


class AssignmentCreateUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS


class AssignmentListSerializer(serializers.ModelSerializer):

    assignee = PersonIdUsernameSerializer()

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee')


class AssignmentDetailSerializer(serializers.ModelSerializer):

    assignee = PersonIdUsernameSerializer()
    filters = ProfileFilterSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS + ('filters',)

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee').prefetch_related('filters')
