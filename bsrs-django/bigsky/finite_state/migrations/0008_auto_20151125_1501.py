# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django_fsm


class Migration(migrations.Migration):

    dependencies = [
        ('finite_state', '0007_auto_20151125_1434'),
    ]

    operations = [
        migrations.RenameField(
            model_name='workrequeststatus',
            old_name='name',
            new_name='label',
        ),
        migrations.AlterField(
            model_name='workrequest',
            name='status',
            field=django_fsm.FSMKeyField(to='finite_state.WorkRequestStatus', protected=True, default='new'),
        ),
    ]
