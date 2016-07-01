from rest_framework import serializers

from assignment.models import Profile
from person.models import Person
from person.serializers_leaf import PersonIdUsernameSerializer
from utils.serializers import BaseCreateSerializer


PROFILE_FIELDS = ('id', 'description', 'assignee',)


class ProfileCreateUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = Profile
        fields = PROFILE_FIELDS


class ProfileDetailSerializer(serializers.ModelSerializer):

    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=Person.objects.all(), many=False)

    class Meta:
        model = Profile
        fields = ('id', 'description', 'assignee_id',)


class ProfileListSerializer(serializers.ModelSerializer):

    assignee = PersonIdUsernameSerializer()

    class Meta:
        model = Profile
        fields = PROFILE_FIELDS
