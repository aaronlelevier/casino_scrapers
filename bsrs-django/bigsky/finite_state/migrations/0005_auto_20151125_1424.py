# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django_fsm


class Migration(migrations.Migration):

    dependencies = [
        ('finite_state', '0004_auto_20151125_1410'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workrequest',
            name='status',
            field=django_fsm.FSMKeyField(default='def11673-d4ab-41a6-a37f-0c6846b96001', to='finite_state.WorkRequestStatus'),
            preserve_default=False,
        ),
    ]
