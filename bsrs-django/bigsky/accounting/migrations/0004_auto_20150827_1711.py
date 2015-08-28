# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0003_auto_20150818_1436'),
    ]

    operations = [
        migrations.AlterField(
            model_name='currency',
            name='code',
            field=models.CharField(help_text='usd', max_length=3),
        ),
        migrations.AlterField(
            model_name='currency',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='currency',
            name='format',
            field=models.CharField(help_text="$00.00 for 'usd' for example", max_length=10),
        ),
        migrations.AlterField(
            model_name='currency',
            name='name',
            field=models.CharField(help_text='US Dollar', max_length=50),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol',
            field=models.CharField(help_text='$', max_length=1),
        ),
    ]
