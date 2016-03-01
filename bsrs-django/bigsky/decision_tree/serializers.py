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

    class Meta:
        model = TreeLink
        fields = ('id', 'order', 'text', 'action_button', 'is_header', 'categories',
                  'request', 'priority', 'status', 'parent', 'destination',)


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

    def create(self, validated_data):
        return self.process_all(None, validated_data)

    def update(self, instance, validated_data):
        return self.process_all(instance, validated_data)

    def process_all(self, instance, validated_data):
        attachments = validated_data.pop('attachments', [])
        fields = validated_data.pop('fields', [])
        links = validated_data.pop('links', [])

        if instance:
            instance = create.update_model(instance, validated_data)
        else:
            instance = TreeData.objects.create(**validated_data)

        self.process_attachments(instance, attachments)
        self.process_fields(instance, fields)
        self.process_links(instance, links)

        return instance

    def process_removes(self, model, filter_kwargs, exclude_kwargs):
        model.objects.filter(**filter_kwargs).exclude(**exclude_kwargs).delete()

    def process_attachments(self, instance, attachments):
        # add/update
        for a in attachments:
            a = copy.copy(a)
            attachment = Attachment.objects.get(id=a.id)
            a.content_object = instance
            a.object_id = instance.id
            a.save()

        # remove
        filter_kwargs = {'object_id': instance.id}
        exclude_kwargs = {'id__in': [x.id for x in attachments]}
        self.process_removes(Attachment, filter_kwargs, exclude_kwargs)

    def process_fields(self, instance, fields):
        # add/update
        for f in fields:
            f = copy.copy(f)
            options = f.pop('options', [])

            try:
                field = TreeField.objects.get(id=f['id'])
                field = create.update_model(field, f)
            except TreeField.DoesNotExist:                
                f.update({'tree_data': instance})
                field = TreeField.objects.create(**f)
            finally:
                option_ids = self.process_options(field, options)
                TreeOption.objects.filter(id__in=option_ids).update(field=field)

        # remove
        filter_kwargs = {'tree_data': instance}
        exclude_kwargs = {'id__in': [f['id'] for f in fields]}
        self.process_removes(TreeField, filter_kwargs, exclude_kwargs)

    @staticmethod
    def process_options(field, options):
        # add/update
        option_ids = set()
        for o in options:
            try:
                option = TreeOption.objects.get(id=o['id'])
                create.update_model(option, o)
            except TreeOption.DoesNotExist:
                option = TreeOption.objects.create(**o)
            finally:
                option_ids.update([option.id])

        # remove
        field.options.exclude(id__in=option_ids).delete()

        return option_ids

    def process_links(self, instance, links):
        # add/update
        for x in links:
            x = copy.copy(x)
            categories = x.pop('categories', [])
            try:
                link = TreeLink.objects.get(id=x['id'])
                link = create.update_model(link, x)
            except TreeLink.DoesNotExist:
                link = TreeLink.objects.create(**x)
            finally:
                link.parent = instance
                link.save()
                # Category
                # add
                if categories:
                    link.categories.add(*categories)
                # remove
                category_ids = [x.id for x in categories]
                categories_to_remove = Category.objects.filter(links__id=x['id']).exclude(id__in=category_ids)
                for c in categories_to_remove:
                    link.categories.remove(c)

        # remove
        filter_kwargs = {'parent': instance}
        exclude_kwargs = {'id__in': [x['id'] for x in links]}
        self.process_removes(TreeLink, filter_kwargs, exclude_kwargs)
