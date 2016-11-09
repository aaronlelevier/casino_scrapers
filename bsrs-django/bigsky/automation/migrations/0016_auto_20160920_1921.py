# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-20 19:21
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('automation', '0015_auto_20160920_1909'),
    ]

    operations = [
        migrations.CreateModel(
            name='AutomationEvent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('key', models.CharField(choices=[('automation.event.ticket_assignee_change', 'automation.event.ticket_assignee_change'), ('automation.event.ticket_attachment_add', 'automation.event.ticket_attachment_add'), ('automation.event.ticket_category_change', 'automation.event.ticket_category_change'), ('automation.event.ticket_cc_add', 'automation.event.ticket_cc_add'), ('automation.event.ticket_comment', 'automation.event.ticket_comment'), ('automation.event.ticket_location_change', 'automation.event.ticket_location_change'), ('automation.event.ticket_priority_change', 'automation.event.ticket_priority_change'), ('automation.event.ticket_status_cancelled', 'automation.event.ticket_status_cancelled'), ('automation.event.ticket_status_complete', 'automation.event.ticket_status_complete'), ('automation.event.ticket_status_deferred', 'automation.event.ticket_status_deferred'), ('automation.event.ticket_status_denied', 'automation.event.ticket_status_denied'), ('automation.event.ticket_status_in_progress', 'automation.event.ticket_status_in_progress'), ('automation.event.ticket_status_new', 'automation.event.ticket_status_new'), ('automation.event.ticket_status_pending', 'automation.event.ticket_status_pending'), ('automation.event.ticket_status_unsatisfactory', 'automation.event.ticket_status_unsatisfactory')], max_length=100, unique=True)),
            ],
            options={
                'ordering': ['key'],
            },
        ),
        migrations.AddField(
            model_name='automation',
            name='events',
            field=models.ManyToManyField(related_name='automations', to='automation.AutomationEvent'),
        ),
    ]