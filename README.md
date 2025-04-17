# 🤏🔎🌐 (Tinyuptime)

Tinyuptime is a pet project that implements an uptime checker designed for
hundreds of checks.

The results are sent to [Tinybird](https://tinybird.co).

## Tinybird

### Overview
TinyUptime is a simple uptime monitoring solution built with Tinybird. It allows you to configure website checks and store their results. The application monitors websites and provides information about their availability status.

### Data Sources

#### checks
Stores the configuration for website checks that will be monitored.

```bash
curl -X POST "https://api.europe-west2.gcp.tinybird.co/v0/events?name=checks" \
     -H "Authorization: Bearer $TB_ADMIN_TOKEN" \
     -d '{
       "name": "My Website",
       "url": "https://example.com",
       "host": "example.com",
       "accepted_statuses": [200, 201, 301],
       "keyword": "Example Domain",
       "verify_ssl": 1,
       "timeout_seconds": 30,
       "interval_seconds": 60
     }'
```

#### results
Stores the results of website check executions.

```bash
curl -X POST "https://api.europe-west2.gcp.tinybird.co/v0/events?name=results" \
     -H "Authorization: Bearer $TB_AGENT_TOKEN" \
     -d '{
       "timestamp": "2023-05-01 12:00:00",
       "check_name": "My Website",
       "success": true,
       "http_status": 200,
       "duration_seconds": 0.5,
       "error": null
     }'
```

### Endpoints

#### checks_config
Retrieves the configuration for all website checks.

```bash
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/checks_config.json?token=$TB_AGENT_TOKEN"
```

#### last_status
Retrieves the last status for all checks.

```bash
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/last_status.json?token=$TB_PUBLIC_READER_TOKEN&tz=Europe/Madrid"
```

#### failing_checks
Retrieves all checks that are currently failing (last result was not successful).

```bash
curl -X GET "https://api.europe-west2.gcp.tinybird.co/v0/pipes/failing_checks.json?token=$TB_PUBLIC_READER_TOKEN&tz=Europe/Madrid"
```
