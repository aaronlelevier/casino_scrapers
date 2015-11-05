# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(blank=True, max_length=100, null=True)),
                ('label', models.CharField(help_text='This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', blank=True, max_length=100, null=True, editable=False)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(blank=True, decimal_places=4, default=0, max_digits=15)),
                ('cost_code', models.CharField(blank=True, max_length=100, null=True)),
                ('status', models.BooleanField(default=True)),
                ('cost_currency', models.ForeignKey(blank=True, to='accounting.Currency', null=True)),
                ('parent', models.ForeignKey(related_name='children', blank=True, to='category.Category', null=True)),
            ],
            options={
                'ordering': ('label', 'name'),
            },
        ),
    ]
