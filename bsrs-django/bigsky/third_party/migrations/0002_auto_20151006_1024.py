# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('third_party', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='thirdparty',
            name='deleted',
            field=models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True),
        ),
        migrations.AlterField(
            model_name='thirdpartystatus',
            name='deleted',
            field=models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True),
        ),
        migrations.AlterField(
            model_name='thirdpartystatus',
            name='description',
            field=models.CharField(max_length=100, default='active', choices=[('active', 'active'), ('two', 'two')]),
        ),
    ]
