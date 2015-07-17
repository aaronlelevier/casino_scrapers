# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0003_auto_20150717_1124'),
    ]

    operations = [
        migrations.AlterField(
            model_name='addresstype',
            name='order',
            field=models.IntegerField(default=0, blank=True),
        ),
        migrations.AlterField(
            model_name='emailtype',
            name='order',
            field=models.IntegerField(default=0, blank=True),
        ),
        migrations.AlterField(
            model_name='phonenumbertype',
            name='order',
            field=models.IntegerField(default=0, blank=True),
        ),
    ]
