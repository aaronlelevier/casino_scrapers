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
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(max_length=100, null=True, blank=True)),
                ('label', models.CharField(help_text=b'This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', max_length=100, null=True, editable=False, blank=True)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(default=0, max_digits=15, decimal_places=4, blank=True)),
                ('cost_code', models.CharField(max_length=100, null=True, blank=True)),
                ('cost_currency', models.ForeignKey(blank=True, to='accounting.Currency', null=True)),
                ('parent', models.ForeignKey(related_name='children', blank=True, to='category.Category', null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
