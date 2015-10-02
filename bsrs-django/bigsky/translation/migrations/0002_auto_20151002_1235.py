# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locale',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='locale',
            name='locale',
            field=models.SlugField(help_text='Example values: en, en-US, en-x-Sephora'),
        ),
        migrations.AlterField(
            model_name='locale',
            name='name',
            field=models.CharField(max_length=50, help_text="Human readable name in forms. i.e. 'English'"),
        ),
        migrations.AlterField(
            model_name='translation',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
    ]
