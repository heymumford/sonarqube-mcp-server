# Configuration Templates

This directory contains Claude Desktop configuration templates for different parallel development scenarios. These templates help teams set up multiple SonarQube MCP Server instances to work simultaneously without conflicts.

## Available Templates

### 1. Multi-Project Configuration
**File:** `multi-project-claude-config.json`  
**Use Case:** Different teams working on separate projects (frontend/backend)  
**Features:**
- Separate instances for frontend and backend projects
- Project-specific tokens and organizations
- Isolated logging for each project

### 2. Multi-Environment Configuration  
**File:** `multi-environment-claude-config.json`  
**Use Case:** Working with multiple environments (dev/staging/prod)  
**Features:**
- Environment-specific SonarQube instances
- Graduated logging levels (DEBUG → INFO → WARN)
- Different elicitation thresholds per environment

### 3. Individual Developer Configuration
**File:** `individual-developer-claude-config.json`  
**Use Case:** Personal developer setup  
**Features:**
- Personal token and project namespace
- Individual logging and settings
- Customizable elicitation preferences

### 4. Team Shared Configuration
**File:** `team-shared-claude-config.json`  
**Use Case:** Small team sharing a single SonarQube organization  
**Features:**
- Shared team token and organization
- Collaborative-friendly settings
- Conservative elicitation thresholds

## How to Use These Templates

### Step 1: Choose Your Template
Select the template that best matches your development scenario.

### Step 2: Customize the Configuration
Replace placeholder values in the template:
- `YOUR_*_TOKEN_HERE` → Your actual SonarQube tokens
- `your-*-org` → Your actual organization keys
- `company.com` → Your actual domain
- Developer names → Actual team member names

### Step 3: Apply to Claude Desktop
1. Open Claude Desktop
2. Go to **Settings** → **Developer** → **Edit Config**  
3. Copy the customized configuration
4. Paste and save in Claude Desktop
5. Restart Claude Desktop

### Step 4: Verify Setup
Test each configured instance by asking Claude:
```
"Use sonarqube-frontend to list my projects"
```

### Step 5: Validate Configuration (Optional)
Use the provided validation script to check your configuration:
```bash
node scripts/validate-config.cjs your-claude-config.json
```

This script validates:
- JSON syntax correctness
- Required environment variables
- Unique instance names and log files
- Security best practices

## Customization Options

### Log Levels
- `DEBUG`: Detailed logging for troubleshooting
- `INFO`: Standard operational logging  
- `WARN`: Only warnings and errors
- `ERROR`: Only critical errors

### Elicitation Settings
- `SONARQUBE_MCP_ELICITATION`: Enable/disable interactive prompts
- `SONARQUBE_MCP_BULK_THRESHOLD`: Number of items before confirmation
- `SONARQUBE_MCP_REQUIRE_COMMENTS`: Require comments for issue resolutions

### File Paths
Customize log file paths based on your system:
- **Unix/Linux/Mac:** `/tmp/sonarqube-mcp-{instance}.log`
- **Windows:** `C:\temp\sonarqube-mcp-{instance}.log`

## Security Best Practices

1. **Token Management**
   - Use project-specific tokens with minimal required permissions
   - Store tokens securely (not in version control)
   - Rotate tokens regularly

2. **Log File Security**
   - Set appropriate file permissions (600 on Unix)
   - Place log files in secure, temporary directories
   - Regularly clean up old log files

3. **Configuration Security**
   - Don't commit configurations with actual tokens to version control
   - Use environment-specific configuration files
   - Share templates, not actual configurations

## Troubleshooting

### Instance Not Appearing
- Check configuration JSON syntax
- Verify all required environment variables are set
- Restart Claude Desktop after configuration changes

### Token Authentication Failures
- Verify token validity in SonarQube/SonarCloud
- Check token permissions for required operations
- Ensure correct URL and organization settings

### Log File Conflicts
- Ensure each instance has a unique log file path
- Check file system permissions for log directories
- Avoid shared log files between instances

### Resource Issues
- Monitor system resources with multiple instances
- Reduce concurrent instances if experiencing performance issues
- Stagger instance startup for resource-intensive operations

## Advanced Configurations

### Custom Transport Settings
All templates use STDIO transport (default). Custom transport options can be added when available.

### Rate Limiting Management
For high-usage scenarios, consider:
- Implementing request throttling
- Using separate tokens for each instance
- Monitoring SonarQube API usage

### Docker Deployment
These templates can be adapted for Docker deployments by:
- Converting environment variables to Docker environment files
- Using Docker secrets for token management
- Mounting log directories as volumes

## Contributing

When contributing new templates:
1. Follow the naming convention: `{use-case}-claude-config.json`
2. Include comprehensive comments
3. Use placeholder values for sensitive information
4. Test templates with actual Claude Desktop
5. Update this README with the new template description

## See Also

- [Parallel Development Guide](../docs/parallel-development.md)
- [Main Configuration Documentation](../README.md#configuration)
- [Troubleshooting Guide](../docs/troubleshooting.md)
- [Security Guide](../docs/security.md)