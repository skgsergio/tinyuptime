# 🤏🔎🌐 (Tinyuptime)

Tinyuptime is a pet project that implements an uptime checker designed for
hundreds of checks.

The results are sent to [Tinybird](https://tinybird.co).

## Tinybird

### Overview

This project uses Tinybird to store and analyze uptime check results. It allows you to configure and monitor website/service status checks, providing summaries, status reports, and detailed check information.

### Data sources

#### `checks`
Stores the configuration for uptime checks.

```shell
curl -X POST "https://api.europe-west2.gcp.tinybird.co/v0/events?name=checks" \
    -H "Authorization: Bearer $TB_ADMIN_TOKEN" \
    -d '{"name":"Example Site","url":"https://example.com","host":"example.com","accepted_statuses":[200,201,202],"keyword":"Example Domain","verify_ssl":true,"timeout_seconds":10,"interval_seconds":60,"scope":"public"}'
```

#### `results_landing`
Landing data source for incoming check results.

```shell
curl -X POST "https://api.europe-west2.gcp.tinybird.co/v0/events?name=results_landing" \
    -H "Authorization: Bearer $TB_ADMIN_TOKEN" \
    -d '{"timestamp":"2023-06-01 12:00:00","check_name":"Example Site","success":true,"http_status":200,"duration_seconds":0.45,"error":null}'
```

#### `results`
Materialized check results with added scope information from the checks datasource.

### Endpoints

#### `checks_config`
Retrieves all check configurations.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/checks_config.json?token=$TB_ADMIN_TOKEN"
```

#### `summary`
Provides a summary of status checks grouped by check group for the last hour.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/summary.json?token=$TB_ADMIN_TOKEN"
```

#### `last_status`
Returns the latest status for all active checks in the last hour.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/last_status.json?token=$TB_ADMIN_TOKEN"
```

#### `last_hour`
Retrieves detailed check results for the last hour.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/last_hour.json?token=$TB_ADMIN_TOKEN"
```

#### `failing_checks`
Lists all checks that are currently failing.

```shell
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/failing_checks.json?token=$TB_ADMIN_TOKEN"
```
