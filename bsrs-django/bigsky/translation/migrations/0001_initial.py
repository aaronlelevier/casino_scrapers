# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.postgres.fields.hstore
import uuid
import translation.models
from django.contrib.postgres.operations import HStoreExtension


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        HStoreExtension(),
        migrations.CreateModel(
            name='Locale',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('locale', models.SlugField(help_text='Example values: en, en-US, en-x-Sephora')),
                ('default', models.BooleanField(default=False)),
                ('name', models.CharField(help_text="Human readable name in forms. i.e. 'English'", max_length=50)),
                ('native_name', models.CharField(null=True, blank=True, max_length=50)),
                ('presentation_name', models.CharField(null=True, blank=True, max_length=50)),
                ('rtl', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Translation',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('values', django.contrib.postgres.fields.hstore.HStoreField(blank=True, default={})),
                ('context', django.contrib.postgres.fields.hstore.HStoreField(blank=True, default={})),
                ('csv', models.FileField(null=True, blank=True, upload_to=translation.models.translation_file)),
                ('locale', models.OneToOneField(to='translation.Locale', blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
