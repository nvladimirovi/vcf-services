# Scheduled Behaviors

## Overview

Scheduled behaviors allow you to execute RDE behaviors periodically according to a cron schedule. This feature enables automated, recurring operations on defined entities without manual intervention.

The scheduled behaviors functionality provides a built-in mechanism for periodic behavior execution within VMware Cloud Foundation Automation.

## How Scheduled Behaviors Work

Scheduled behaviors use a dedicated RDE type (`vmware:ScheduledBehaviorType:1.0.0`) to persist scheduling state and configuration. When you schedule a behavior:

1. A ScheduledBehavior RDE instance is created to track the schedule
2. The behavior is registered with the VCF Automation Provider Management scheduler using the cron expression
3. At each scheduled time, the behavior is invoked automatically
4. Execution state and retry information are maintained in the RDE

## Scheduling Configuration

A scheduled behavior requires the following configuration:

### Cron Expression

The schedule is defined using standard cron expressions:

```text
# Format: second minute hour day month weekday
0 0 2 * * *     # Every day at 2:00 AM
0 */15 * * * *  # Every 15 minutes
0 0 9 * * MON   # Every Monday at 9:00 AM
```

### Behavior Reference

The behavior to execute, identified by its URN:

```text
urn:vcloud:behavior-interface:myBehavior:vendor:interface:1.0.0
```

### Entity Reference (Optional)

For dynamic behaviors, the entity on which to invoke the behavior:

```text
urn:vcloud:entity:vendor:type:entity-uuid
```

For static behaviors, this can be omitted.

## API Operations

### Schedule a Behavior

Create a new scheduled behavior execution:

```text
POST /cloudapi/1.0.0/scheduledBehaviors
```

Request body:

```json
{
  "configuration": {
    "config": {
      "cronExpression": "0 0 2 * * *",
      "behaviorId": "urn:vcloud:behavior-interface:cleanup:mycompany:maintenance:1.0.0",
      "entityId": "urn:vcloud:entity:mycompany:application:abc-123"
    }
  },
  "arguments": {
    "cleanupAge": 30,
    "dryRun": false
  }
}
```

Response:

```json
{
  "id": "urn:vcloud:entity:vmware:ScheduledBehaviorType:schedule-uuid",
  "entityType": "urn:vcloud:type:vmware:ScheduledBehaviorType:1.0.0",
  "name": "Scheduled cleanup behavior",
  "entity": {
    "configuration": {
      "config": {
        "cronExpression": "0 0 2 * * *",
        "behaviorId": "urn:vcloud:behavior-interface:cleanup:mycompany:maintenance:1.0.0",
        "entityId": "urn:vcloud:entity:mycompany:application:abc-123"
      }
    },
    "state": {
      "executionState": "ACTIVE",
      "retryCounter": 0,
      "lastExecutionTime": null,
      "nextExecutionTime": "2024-01-16T02:00:00.000Z"
    },
    "arguments": {
      "cleanupAge": 30,
      "dryRun": false
    }
  },
  "entityState": "RESOLVED"
}
```

### Unschedule a Behavior

Remove a scheduled behavior:

```text
DELETE /cloudapi/1.0.0/scheduledBehaviors/<schedule-id>
```

This permanently deletes the schedule and stops all future executions.

### Deactivate a Scheduled Behavior

Temporarily disable a schedule without deleting it:

```text
POST /cloudapi/1.0.0/scheduledBehaviors/<schedule-id>/deactivate
```

The schedule record is retained but executions are paused. Can be reactivated later.

### Query Scheduled Behaviors

List all scheduled behaviors:

```text
GET /cloudapi/1.0.0/entities/types/vmware/ScheduledBehaviorType/1.0.0
```

Filter by state:

```text
GET /cloudapi/1.0.0/entities/types/vmware/ScheduledBehaviorType/1.0.0?filter=(entity.state.executionState==ACTIVE)
```

## Scheduled Behavior States

### Execution States

- **ACTIVE**: Schedule is active and executions will occur as scheduled
- **DEACTIVATED**: Schedule is paused, no executions will occur
- **RETRY**: Schedule is in retry mode after a failed execution

### State Management

The scheduled behavior RDE maintains execution state including:

```json
{
  "state": {
    "executionState": "ACTIVE",
    "retryCounter": 0,
    "maxRetries": 3,
    "lastExecutionTime": "2024-01-15T02:00:00.000Z",
    "nextExecutionTime": "2024-01-16T02:00:00.000Z",
    "lastExecutionStatus": "SUCCESS"
  }
}
```

## Error Handling and Retry

### Automatic Retry

When a scheduled behavior execution fails:

1. The schedule enters RETRY mode
2. The retry counter is incremented
3. The behavior is retried immediately
4. If max retries is reached, the schedule may be deactivated

### Retry Configuration

Configure retry behavior in the schedule:

```json
{
  "configuration": {
    "retryConfig": {
      "maxRetries": 3,
      "retryDelay": 300
    }
  }
}
```

### Monitoring Failures

Query schedules in error state:

```text
GET /cloudapi/1.0.0/entities/types/vmware/ScheduledBehaviorType/1.0.0?filter=(entity.state.executionState==RETRY)
```

## Best Practices

### 1. Use Appropriate Cron Intervals

Avoid overly frequent schedules that could impact system performance:

```text
# Good: Every hour
0 0 * * * *

# Caution: Every minute (use sparingly)
0 * * * * *
```

### 2. Handle Concurrent Executions

Ensure your behavior logic handles cases where:
- Previous execution is still running
- Entity state may have changed since last execution
- Multiple instances might execute simultaneously

### 3. Include Idempotency

Design behaviors to be idempotent so re-execution doesn't cause issues:

```javascript
// Check if work already done
if (entity.lastProcessedDate > entity.lastModifiedDate) {
  return { status: "already_processed" };
}
// Perform work
```

### 4. Monitor Schedule Health

Regularly review:
- Failed schedules in RETRY mode
- Execution times and durations
- Resource consumption

### 5. Clean Up Unused Schedules

Delete schedules that are no longer needed to reduce system overhead.

## Use Cases

### Periodic Cleanup

Schedule regular cleanup of temporary resources:

```json
{
  "cronExpression": "0 0 3 * * *",
  "behaviorId": "urn:vcloud:behavior-interface:cleanup:app:maintenance:1.0.0"
}
```

### Status Polling

Poll external systems for status updates:

```json
{
  "cronExpression": "0 */10 * * * *",
  "behaviorId": "urn:vcloud:behavior-interface:pollStatus:app:monitor:1.0.0",
  "entityId": "urn:vcloud:entity:app:deployment:xyz-789"
}
```

### Report Generation

Generate periodic reports:

```json
{
  "cronExpression": "0 0 9 * * MON",
  "behaviorId": "urn:vcloud:behavior-interface:generateReport:app:reporting:1.0.0"
}
```

### Health Checks

Perform regular health checks on resources:

```json
{
  "cronExpression": "0 */5 * * * *",
  "behaviorId": "urn:vcloud:behavior-interface:healthCheck:app:monitor:1.0.0"
}
```

## Complete Example

This example shows scheduling a daily backup behavior:

### 1. Define the Backup Behavior

```text
POST /cloudapi/1.0.0/interfaces/urn:vcloud:interface:mycompany:backup:1.0.0/behaviors
```

```json
{
  "name": "dailyBackup",
  "execution": {
    "type": "WebHook",
    "id": "backupWebhook",
    "href": "https://backup-service.company.com/webhook",
    "_internal_key": "shared-secret"
  }
}
```

### 2. Create the Schedule

```text
POST /cloudapi/1.0.0/scheduledBehaviors
```

```json
{
  "configuration": {
    "config": {
      "cronExpression": "0 0 1 * * *",
      "behaviorId": "urn:vcloud:behavior-interface:dailyBackup:mycompany:backup:1.0.0",
      "entityId": "urn:vcloud:entity:mycompany:database:prod-db-1"
    },
    "retryConfig": {
      "maxRetries": 2
    }
  },
  "arguments": {
    "backupType": "full",
    "retention": 7
  }
}
```

### 3. Monitor Execution

Query execution history:

```text
GET /cloudapi/1.0.0/entities/<schedule-id>
```

Check the `state.lastExecutionTime` and `state.lastExecutionStatus` fields.

### 4. Update Schedule

Modify the cron expression or arguments:

```text
PUT /cloudapi/1.0.0/entities/<schedule-id>
```

```json
{
  "entity": {
    "configuration": {
      "config": {
        "cronExpression": "0 0 2 * * *"
      }
    }
  }
}
```

## Limitations

- **Minimum interval**: Avoid schedules more frequent than every minute
- **Execution duration**: Long-running behaviors should be designed to complete before the next scheduled execution
- **Timezone**: All cron expressions are evaluated in UTC
- **Precision**: Execution timing is approximate and may vary by a few seconds
- **Concurrency**: Multiple schedules can run concurrently, design accordingly

## Access Control

Scheduled behavior operations require appropriate permissions:

- **Create schedule**: Requires ability to invoke the target behavior
- **Delete schedule**: Requires FullControl on the schedule RDE
- **Deactivate schedule**: Requires ReadWrite access on the schedule RDE
- **Query schedules**: Follows standard RDE access control rules

## Failover and High Availability

Scheduled behaviors are designed for high availability:

- Schedules persist across cell restarts
- Upon cell startup, all active schedules are re-registered
- Failed executions can be retried automatically
- Schedule state is maintained in the database

## References

- [RDE Behaviors](behaviors-general-concepts.md)
- [RDE Lifecycle](defined-entities-lifecycle.md)
- [RDE Access Control](rde-access-control.md)

