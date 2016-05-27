import copy

from rest_framework import serializers

from setting.models import Setting
from utils.serializers import BaseCreateSerializer
from utils.validators import SettingsValidator


class SettingListSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        fields = ('id', 'name',)


class SettingSerializer(BaseCreateSerializer):

    id = serializers.UUIDField(required=False)

    class Meta:
        model = Setting
        fields = ('id', 'name', 'title', 'settings',)


class SettingUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        validators = [SettingsValidator()]
        fields = ('id', 'name', 'settings',)

    def update(self, instance, validated_data):
        settings = validated_data.get('settings', {})
        current_settings = copy.copy(instance.settings)
        next_settings = copy.copy(settings)

        for k,v in next_settings.items():
            current_settings[k]['value'] = v

        validated_data['settings'] = current_settings
        return super(SettingUpdateSerializer, self).update(instance, validated_data)
