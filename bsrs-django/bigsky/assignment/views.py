from rest_framework import permissions

from assignment.models import Profile
from assignment.serializers import ProfileCreateUpdateSerializer, ProfileSerializer
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet


class ProfileViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):

    model = Profile
    queryset = Profile.objects.all()
    serializer_class = ProfileCreateUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action in ('retrieve', 'list'):
            return ProfileSerializer
        else:
            return ProfileCreateUpdateSerializer
