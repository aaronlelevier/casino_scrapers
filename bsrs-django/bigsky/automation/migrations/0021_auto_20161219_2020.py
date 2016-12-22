# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-19 20:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('automation', '0020_auto_20161004_1852'),
    ]

    operations = [
        migrations.AlterField(
            model_name='automationevent',
            name='key',
            field=models.CharField(choices=[('automation.event.ticket_assignee_change', 'automation.event.ticket_assignee_change'), ('automation.event.ticket_attachment_add', 'automation.event.ticket_attachment_add'), ('automation.event.ticket_category_change', 'automation.event.ticket_category_change'), ('automation.event.ticket_cc_add', 'automation.event.ticket_cc_add'), ('automation.event.ticket_comment', 'automation.event.ticket_comment'), ('automation.event.ticket_location_change', 'automation.event.ticket_location_change'), ('automation.event.ticket_priority_change', 'automation.event.ticket_priority_change'), ('automation.event.ticket_status_cancelled', 'automation.event.ticket_status_cancelled'), ('automation.event.ticket_status_complete', 'automation.event.ticket_status_complete'), ('automation.event.ticket_status_deferred', 'automation.event.ticket_status_deferred'), ('automation.event.ticket_status_denied', 'automation.event.ticket_status_denied'), ('automation.event.ticket_status_draft', 'automation.event.ticket_status_draft'), ('automation.event.ticket_status_in_progress', 'automation.event.ticket_status_in_progress'), ('automation.event.ticket_status_new', 'automation.event.ticket_status_new'), ('automation.event.ticket_status_pending', 'automation.event.ticket_status_pending'), ('automation.event.ticket_status_solved', 'automation.event.ticket_status_solved'), ('automation.event.ticket_status_unsatisfactory', 'automation.event.ticket_status_unsatisfactory')], max_length=100, unique=True),
        ),
    ]
