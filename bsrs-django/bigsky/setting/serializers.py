from setting.models import Setting
from utils.serializers import BaseCreateSerializer, SettingSerializerMixin
from utils.validators import SettingsValidator


class SettingListSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        fields = ('id', 'name',)


class SettingSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        fields = ('id', 'name', 'settings',)


class SettingUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        validators = [SettingsValidator()]
        fields = ('id', 'name', 'settings',)
