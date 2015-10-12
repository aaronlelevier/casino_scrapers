# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(null=True, max_length=100, blank=True)),
                ('label', models.CharField(editable=False, null=True, max_length=100, help_text='This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', blank=True)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(max_digits=15, default=0, decimal_places=4, blank=True)),
                ('cost_code', models.CharField(null=True, max_length=100, blank=True)),
                ('status', models.BooleanField(default=True)),
                ('cost_currency', models.ForeignKey(to='accounting.Currency', blank=True, null=True)),
                ('parent', models.ForeignKey(to='category.Category', related_name='children', blank=True, null=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
    ]
