# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid
import utils.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Currency',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(max_length=50, help_text='US Dollar')),
                ('name_plural', models.CharField(max_length=50, help_text='US Dollars', blank=True)),
                ('code', utils.fields.UpperCaseCharField(unique=True, max_length=3, help_text='i.e. USD, JPY, etc...')),
                ('symbol', models.CharField(max_length=10, help_text='$')),
                ('symbol_native', models.CharField(max_length=10, help_text='$', blank=True)),
                ('decimal_digits', models.IntegerField(default=0, blank=True)),
                ('rounding', models.IntegerField(default=0, blank=True)),
            ],
            options={
                'verbose_name_plural': 'Currencies',
            },
        ),
    ]
