from rest_framework import permissions

from assignment.models import Profile
from assignment.serializers import (ProfileCreateUpdateSerializer, ProfileDetailSerializer,
    ProfileListSerializer)
from utils.views import BaseModelViewSet


class ProfileViewSet(BaseModelViewSet):

    model = Profile
    queryset = Profile.objects.all()
    serializer_class = ProfileCreateUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProfileDetailSerializer
        elif self.action == 'list':
            return ProfileListSerializer
        else:
            return ProfileCreateUpdateSerializer
