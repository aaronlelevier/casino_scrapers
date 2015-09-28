# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('util', '0002_auto_20150923_1524'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customsetting',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='mainsetting',
            name='content_type',
        ),
        migrations.DeleteModel(
            name='CustomSetting',
        ),
        migrations.DeleteModel(
            name='MainSetting',
        ),
    ]
