from assignment.models import Profile
from utils.serializers import BaseCreateSerializer


PROFILE_FIELDS = ('id', 'description', 'order', 'assignee',)


class ProfileListSerializer(BaseCreateSerializer):

    class Meta:
        model = Profile
        fields = PROFILE_FIELDS
