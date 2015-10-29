# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import utils.fields
import uuid


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
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(help_text='US Dollar', max_length=50)),
                ('name_plural', models.CharField(help_text='US Dollars', blank=True, max_length=50)),
                ('code', utils.fields.UpperCaseCharField(help_text='i.e. USD, JPY, etc...', max_length=3, unique=True)),
                ('symbol', models.CharField(help_text='$', max_length=10)),
                ('symbol_native', models.CharField(help_text='$', blank=True, max_length=10)),
                ('decimal_digits', models.IntegerField(blank=True, default=0)),
                ('rounding', models.IntegerField(blank=True, default=0)),
            ],
            options={
                'verbose_name_plural': 'Currencies',
            },
        ),
    ]
