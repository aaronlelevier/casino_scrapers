import copy

from rest_framework import serializers

from category.models import Category
from decision_tree.models import TreeField, TreeOption, TreeLink, TreeData
from generic.models import Attachment
from utils import create
from utils.serializers import BaseCreateSerializer


class TreeOptionSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeOption
        fields = ('id', 'text', 'order',)


class TreeFieldSerializer(BaseCreateSerializer):

    options = TreeOptionSerializer(many=True, required=False)

    class Meta:
        model = TreeField
        fields = ('id', 'label', 'type', 'options', 'required',)


class TreeLinkLeafSerializer(serializers.ModelSerializer):

    class Meta:
        model = TreeLink
        fields = ('id', 'order', 'text',)


class TreeLinkSerializer(BaseCreateSerializer):

    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, required=False)
    parents = serializers.PrimaryKeyRelatedField(
        queryset=TreeData.objects.all(), many=True, required=False)

    class Meta:
        model = TreeLink
        fields = ('id', 'order', 'text', 'action_button', 'is_header', 'categories',
                  'request', 'priority', 'status', 'parents', 'destination',)


class TreeDataListSerializer(BaseCreateSerializer):

    links = TreeLinkLeafSerializer(many=True, read_only=True)

    class Meta:
        model = TreeData
        fields = ('id', 'key', 'description', 'links',)


class TreeDataSerializer(BaseCreateSerializer):

    attachments = serializers.PrimaryKeyRelatedField(
        queryset=Attachment.objects.all(), many=True, required=False)
    fields = TreeFieldSerializer(many=True, required=False)
    links = TreeLinkSerializer(many=True, required=False)

    class Meta:
        model = TreeData
        fields = ('id', 'key', 'description', 'note', 'note_type',
                  'attachments', 'fields', 'prompt', 'link_type',
                  'links',)

    #  TODO: Implement custom for: create, update (nested)

    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])
        fields = validated_data.pop('fields', [])
        links = validated_data.pop('links', [])

        instance = TreeData.objects.create(**validated_data)

        self.process_attachments(instance, attachments)
        self.process_fields(instance, fields)
        self.process_links(instance, links)

        return instance

    @staticmethod
    def process_attachments(instance, attachments):
        for a in attachments:
            a = copy.copy(a)
            attachment = Attachment.objects.get(id=a.id)
            a.content_object = instance
            a.object_id = instance.id
            a.save()

    def process_fields(self, instance, fields):
        # Fields
        for f in fields:
            f = copy.copy(f)
            try:
                field = TreeField.objects.get(id=f['id'])
            except TreeField.DoesNotExist:
                # Options
                options = f.pop('options', [])
                option_ids = self.process_options(options)

                f.update({'tree_data': instance})
                field = TreeField.objects.create(**f)
                TreeOption.objects.filter(id__in=option_ids).update(field=field)

    @staticmethod
    def process_options(options):
        option_ids = set()
        for o in options:
            option = TreeOption.objects.create(**o)
            option_ids.update([option.id])
        return option_ids

    @staticmethod
    def process_links(instance, links):
        for x in links:
            x = copy.copy(x)
            categories = x.pop('categories', [])
            try:
                link = TreeLink.objects.get(id=x['id'])
            except TreeLink.DoesNotExist:
                link = TreeLink.objects.create(**x)
            finally:
                link.parents.add(instance)
                if categories:
                    link.categories.add(*categories)


    # TODO
    # def update(self, instance, validated_data):
    #     pass
