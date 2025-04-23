# 🤏🔎🌐 (Tinyuptime)

Tinyuptime is a pet project that implements an uptime checker designed for
hundreds of checks.

The results are sent to [Tinybird](https://tinybird.co).

## Tinybird

### Overview

This project uses Tinybird to store and analyze uptime check results. It allows you to monitor website and service availability by configuring regular status checks, and provides data analysis endpoints to retrieve check summaries, status reports, and detailed check information.

### Data sources

#### `checks`
Stores the configuration for uptime checks including URLs, accepted status codes, and monitoring parameters.

```shell
curl -X POST "https://api.europe-west2.gcp.tinybird.co/v0/events?name=checks" \
    -H "Authorization: Bearer $TB_ADMIN_TOKEN" \
    -d '{"name":"Example Site","url":"https://example.com","host":"example.com","accepted_statuses":[200,201,202],"keyword":"Example Domain","verify_ssl":true,"timeout_seconds":10,"interval_seconds":60,"scope":"public"}'
```

#### `results_landing`
Landing data source for incoming check results before they are processed.

```shell
curl -X POST "https://api.europe-west2.gcp.tinybird.co/v0/events?name=results_landing" \
    -H "Authorization: Bearer $TB_ADMIN_TOKEN" \
    -d '{"timestamp":"2023-06-01 12:00:00","check_name":"Example Site","success":true,"http_status":200,"duration_seconds":0.45,"error":null}'
```

#### `results`
Materialized check results from results_landing with added scope information from the checks datasource.

#### `summary_timeseries`
Stores timeseries data of check summaries per check group, updated every 10 minutes.

```shell
curl -X POST "https://api.europe-west2.gcp.tinybird.co/v0/events?name=summary_timeseries" \
    -H "Authorization: Bearer $TB_ADMIN_TOKEN" \
    -d '{"timestamp":"2023-06-01 12:00:00","group_name":"API Services","successful_checks":10,"failing_checks":2,"total_checks":12}'
```

### Endpoints

#### `checks_config`
Retrieves all check configurations.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/checks_config.json?token=$TB_ADMIN_TOKEN"
```

#### `summary`
Provides a summary of check statuses grouped by check group for the last 30 minutes.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/summary.json?token=$TB_ADMIN_TOKEN"
```

#### `last_status`
Returns the latest status for all active checks in the last hour.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/last_status.json?token=$TB_ADMIN_TOKEN"
```

#### `last_hour`
Retrieves detailed check results for the last hour, including timestamps, success statuses, and durations.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/last_hour.json?token=$TB_ADMIN_TOKEN"
```

#### `failing_checks`
Lists all checks that are currently failing based on their most recent result.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/failing_checks.json?token=$TB_ADMIN_TOKEN"
```

#### `update_summary_timeseries`
Updates the summary_timeseries datasource with check summaries grouped by check group every 10 minutes.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/update_summary_timeseries.json?token=$TB_ADMIN_TOKEN&job_timestamp=2023-06-01 12:00:00"
```
