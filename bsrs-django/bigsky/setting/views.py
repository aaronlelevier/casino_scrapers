from rest_framework.permissions import IsAuthenticated

from setting.models import Setting
from setting.serializers import (
    SettingSerializer, SettingListSerializer, SettingUpdateSerializer)
from utils.views import BaseModelViewSet


class SettingViewSet(BaseModelViewSet):

    model = Setting
    permission_classes = (IsAuthenticated,)
    queryset = Setting.objects.all()

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return SettingListSerializer
        elif self.action == 'update':
            return SettingUpdateSerializer
        else:
            return SettingSerializer
