# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ThirdParty',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('number', models.CharField(max_length=50, null=True, blank=True)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ThirdPartyStatus',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(default=b'active', max_length=100, choices=[(b'active', b'active'), (b'two', b'two')])),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='thirdparty',
            name='status',
            field=models.ForeignKey(blank=True, to='third_party.ThirdPartyStatus', null=True),
        ),
    ]
