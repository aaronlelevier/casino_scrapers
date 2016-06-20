import copy

from rest_framework import serializers

from dtd.models import TreeData
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


class SettingDetailSerializer(SettingSerializer):

    def to_representation(self, instance):
        init_data = super(SettingDetailSerializer, self).to_representation(instance)
        data = copy.copy(init_data)
        dt_start_id = data['settings']['dt_start_id']['value']
        data['settings'].update({
            'dt_start': self.get_dt_start_values(dt_start_id)
        })
        return data

    def get_dt_start_values(self, id):
        dtd = TreeData.objects.get(id=id)
        return {
            'value': {
                'id': str(dtd.id),
                'key': dtd.key
            }
        }
