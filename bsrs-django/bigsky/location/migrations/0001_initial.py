# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Countries',
            },
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(max_length=1000)),
                ('number', models.CharField(null=True, blank=True, max_length=1000)),
                ('children', models.ManyToManyField(blank=True, to='location.Location', related_name='parents')),
            ],
            options={
                'ordering': ('name', 'number'),
            },
        ),
        migrations.CreateModel(
            name='LocationLevel',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('contact', models.BooleanField(help_text='Defines whether locations in this type will have related Contact models.', default=True)),
                ('can_create_tickets', models.BooleanField(help_text='Can Tickets be assigned to this Location', default=True)),
                ('landlord', models.BooleanField(default=True)),
                ('warranty', models.BooleanField(default=True)),
                ('catalog_categories', models.BooleanField(default=True)),
                ('assets', models.BooleanField(default=True)),
                ('children', models.ManyToManyField(blank=True, to='location.LocationLevel', related_name='parents')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='LocationStatus',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='LocationType',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='State',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('abbr', models.CharField(max_length=2)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='location',
            name='location_level',
            field=models.ForeignKey(related_name='locations', to='location.LocationLevel'),
        ),
        migrations.AddField(
            model_name='location',
            name='status',
            field=models.ForeignKey(to='location.LocationStatus', related_name='locations', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='location',
            name='type',
            field=models.ForeignKey(to='location.LocationType', related_name='locations', blank=True, null=True),
        ),
    ]
