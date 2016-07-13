from rest_framework import serializers

from profile.models import Assignment
from person.serializers_leaf import PersonIdUsernameSerializer
from utils.serializers import BaseCreateSerializer


ASSIGNMENT_FIELDS = ('id', 'description', 'assignee',)


class AssignmentCreateUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS


class AssignmentSerializer(serializers.ModelSerializer):

    assignee = PersonIdUsernameSerializer()

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee')
