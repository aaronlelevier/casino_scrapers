# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django_fsm


class Migration(migrations.Migration):

    dependencies = [
        ('finite_state', '0005_auto_20151125_1424'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workrequest',
            name='status',
            field=django_fsm.FSMKeyField(null=True, to='finite_state.WorkRequestStatus', blank=True),
        ),
    ]
