# Parallel Development Setup

This guide explains how to configure the SonarQube MCP Server to support multiple developers or agents working simultaneously without conflicts.

## Overview

The SonarQube MCP Server can be configured to run multiple instances in parallel, enabling:
- Multiple developers working with different SonarQube projects simultaneously
- Separate Claude Desktop instances for different team members
- Isolated environments for different development contexts
- Concurrent agent operations without interference

## Configuration Strategies

### 1. Project-Based Isolation

Configure separate instances for different projects or teams:

**Developer A - Frontend Project:**
```json
{
  "mcpServers": {
    "sonarqube-frontend": {
      "command": "npx",
      "args": ["-y", "sonarqube-mcp-server@latest"],
      "env": {
        "SONARQUBE_URL": "https://sonarcloud.io",
        "SONARQUBE_TOKEN": "frontend-project-token",
        "SONARQUBE_ORGANIZATION": "frontend-org",
        "LOG_FILE": "/tmp/sonarqube-mcp-frontend.log",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**Developer B - Backend Project:**
```json
{
  "mcpServers": {
    "sonarqube-backend": {
      "command": "npx",
      "args": ["-y", "sonarqube-mcp-server@latest"],
      "env": {
        "SONARQUBE_URL": "https://sonarcloud.io",
        "SONARQUBE_TOKEN": "backend-project-token",
        "SONARQUBE_ORGANIZATION": "backend-org",
        "LOG_FILE": "/tmp/sonarqube-mcp-backend.log",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### 2. Environment-Based Isolation

Separate instances for different environments:

**Development Environment:**
```json
{
  "mcpServers": {
    "sonarqube-dev": {
      "command": "npx",
      "args": ["-y", "sonarqube-mcp-server@latest"],
      "env": {
        "SONARQUBE_URL": "https://dev-sonarqube.company.com",
        "SONARQUBE_TOKEN": "dev-environment-token",
        "LOG_FILE": "/tmp/sonarqube-mcp-dev.log",
        "LOG_LEVEL": "DEBUG"
      }
    }
  }
}
```

**Production Environment:**
```json
{
  "mcpServers": {
    "sonarqube-prod": {
      "command": "npx",
      "args": ["-y", "sonarqube-mcp-server@latest"],
      "env": {
        "SONARQUBE_URL": "https://sonarqube.company.com",
        "SONARQUBE_TOKEN": "prod-environment-token",
        "LOG_FILE": "/tmp/sonarqube-mcp-prod.log",
        "LOG_LEVEL": "WARN"
      }
    }
  }
}
```

### 3. Multi-Instance Single Configuration

Run multiple instances in one configuration for comprehensive coverage:

```json
{
  "mcpServers": {
    "sonarqube-main": {
      "command": "npx",
      "args": ["-y", "sonarqube-mcp-server@latest"],
      "env": {
        "SONARQUBE_URL": "https://sonarcloud.io",
        "SONARQUBE_TOKEN": "main-token",
        "SONARQUBE_ORGANIZATION": "main-org",
        "LOG_FILE": "/tmp/sonarqube-mcp-main.log"
      }
    },
    "sonarqube-secondary": {
      "command": "npx",
      "args": ["-y", "sonarqube-mcp-server@latest"],
      "env": {
        "SONARQUBE_URL": "https://secondary-sonarqube.company.com",
        "SONARQUBE_TOKEN": "secondary-token",
        "LOG_FILE": "/tmp/sonarqube-mcp-secondary.log"
      }
    }
  }
}
```

## Best Practices for Parallel Development

### 1. Resource Isolation

**Separate Log Files:**
Always use different log file paths for each instance:
```json
"LOG_FILE": "/tmp/sonarqube-mcp-{instance-name}.log"
```

**Unique Instance Names:**
Use descriptive, unique names for each MCP server instance:
- `sonarqube-frontend`
- `sonarqube-backend` 
- `sonarqube-dev`
- `sonarqube-prod`

### 2. Authentication Management

**Separate Tokens:**
Use different authentication tokens for each instance to avoid rate limiting:
```json
"SONARQUBE_TOKEN": "project-specific-token"
```

**Environment-Specific Credentials:**
Configure appropriate credentials for each environment:
- Development tokens for dev instances
- Production tokens for prod instances
- Personal tokens for individual developer instances

### 3. Configuration Management

**Version-Specific Configuration:**
Pin to specific versions to ensure consistency:
```json
"args": ["-y", "sonarqube-mcp-server@1.7.5"]
```

**Environment Variables:**
Use consistent naming patterns:
```json
"env": {
  "SONARQUBE_URL": "environment-specific-url",
  "SONARQUBE_TOKEN": "environment-specific-token",
  "SONARQUBE_ORGANIZATION": "environment-specific-org",
  "LOG_FILE": "/tmp/sonarqube-mcp-{environment}.log",
  "LOG_LEVEL": "INFO"
}
```

## Team Configuration Examples

### Small Development Team (2-3 developers)

**Shared Configuration Template:**
```json
{
  "mcpServers": {
    "sonarqube-shared": {
      "command": "npx",
      "args": ["-y", "sonarqube-mcp-server@latest"],
      "env": {
        "SONARQUBE_URL": "https://sonarcloud.io",
        "SONARQUBE_TOKEN": "team-shared-token",
        "SONARQUBE_ORGANIZATION": "team-organization",
        "LOG_FILE": "/tmp/sonarqube-mcp-team.log",
        "SONARQUBE_MCP_ELICITATION": "true",
        "SONARQUBE_MCP_BULK_THRESHOLD": "5"
      }
    }
  }
}
```

### Large Development Team (4+ developers)

**Individual Developer Configuration:**
Each developer maintains their own configuration with:
- Personal tokens
- Individual log files  
- Project-specific organizations
- Customized elicitation settings

**Developer Configuration Template:**
```json
{
  "mcpServers": {
    "sonarqube-{developer-name}": {
      "command": "npx", 
      "args": ["-y", "sonarqube-mcp-server@latest"],
      "env": {
        "SONARQUBE_URL": "https://sonarcloud.io",
        "SONARQUBE_TOKEN": "{personal-token}",
        "SONARQUBE_ORGANIZATION": "{assigned-organization}",
        "LOG_FILE": "/tmp/sonarqube-mcp-{developer-name}.log",
        "SONARQUBE_MCP_ELICITATION": "true",
        "SONARQUBE_MCP_BULK_THRESHOLD": "10"
      }
    }
  }
}
```

## Troubleshooting Parallel Instances

### Log File Conflicts
**Issue:** Multiple instances trying to write to the same log file
**Solution:** Use unique log file paths for each instance

### Token Rate Limiting  
**Issue:** Shared tokens hitting SonarQube API rate limits
**Solution:** Use separate tokens for each instance or environment

### Configuration Confusion
**Issue:** Developers unsure which instance to use
**Solution:** Use descriptive instance names and maintain documentation

### Resource Contention
**Issue:** Multiple instances competing for system resources
**Solution:** Monitor system resources and consider reducing concurrent instances

## Performance Considerations

### Resource Usage
- Each instance consumes memory and CPU
- Monitor system resources when running multiple instances
- Consider staggering instance startup for resource-intensive operations

### API Rate Limits
- SonarQube/SonarCloud impose API rate limits
- Distribute load across multiple tokens when possible
- Implement backoff strategies for high-frequency operations

### Network Considerations
- Multiple instances increase network traffic
- Consider caching strategies for frequently accessed data
- Monitor SonarQube server performance under increased load

## Security Considerations

### Token Management
- Use least-privilege tokens for each instance
- Regularly rotate tokens
- Store tokens securely (avoid version control)

### Log File Security
- Secure log file permissions (600 on Unix systems)
- Regularly rotate log files
- Avoid logging sensitive information

### Environment Isolation
- Separate development and production configurations
- Use different credentials for different environments
- Implement proper access controls

## Migration from Single Instance

### Step 1: Backup Current Configuration
Save your existing Claude Desktop configuration before making changes.

### Step 2: Plan Instance Strategy
Decide on your parallel instance strategy (project-based, environment-based, etc.)

### Step 3: Create New Configurations
Use the templates above to create new instance configurations.

### Step 4: Test Each Instance
Verify each instance works correctly before deploying to the team.

### Step 5: Validate Configuration
Use the provided validation script to ensure your configuration follows best practices:
```bash
node scripts/validate-config.cjs your-claude-config.json
```

### Step 6: Document Team Setup
Create team-specific documentation for your chosen configuration strategy.

## See Also

- [Configuration Guide](../README.md#configuration)
- [Environment Variables](../README.md#environment-variables)  
- [Troubleshooting Guide](./troubleshooting.md)
- [Security Guide](./security.md)