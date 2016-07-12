from rest_framework import serializers

from assignment.models import Profile
from person.serializers_leaf import PersonIdUsernameSerializer
from utils.serializers import BaseCreateSerializer


PROFILE_FIELDS = ('id', 'description', 'assignee',)


class ProfileCreateUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = Profile
        fields = PROFILE_FIELDS


class ProfileSerializer(serializers.ModelSerializer):

    assignee = PersonIdUsernameSerializer()

    class Meta:
        model = Profile
        fields = PROFILE_FIELDS
