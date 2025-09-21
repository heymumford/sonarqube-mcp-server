#!/usr/bin/env node

/**
 * Configuration Validator for SonarQube MCP Server Parallel Development
 * 
 * This script validates Claude Desktop configuration files for:
 * - JSON syntax correctness
 * - Required environment variables
 * - Unique instance names
 * - Unique log file paths
 * - Security best practices
 */

const fs = require('fs');
const path = require('path');

function validateConfiguration(configPath) {
  console.log(`\nValidating: ${configPath}`);
  console.log('='.repeat(50));
  
  let config;
  const errors = [];
  const warnings = [];
  
  // Check if file exists
  if (!fs.existsSync(configPath)) {
    errors.push(`File does not exist: ${configPath}`);
    return { errors, warnings };
  }
  
  // Validate JSON syntax
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
    console.log('✓ Valid JSON syntax');
  } catch (error) {
    errors.push(`Invalid JSON syntax: ${error.message}`);
    return { errors, warnings };
  }
  
  // Check for mcpServers section
  if (!config.mcpServers) {
    errors.push('Missing "mcpServers" section');
    return { errors, warnings };
  }
  
  const instances = Object.keys(config.mcpServers);
  const logFiles = new Set();
  const instanceNames = new Set();
  
  console.log(`✓ Found ${instances.length} MCP server instance(s)`);
  
  // Validate each instance
  for (const [instanceName, instanceConfig] of Object.entries(config.mcpServers)) {
    console.log(`\n  Validating instance: ${instanceName}`);
    
    // Check for duplicate instance names
    if (instanceNames.has(instanceName)) {
      errors.push(`Duplicate instance name: ${instanceName}`);
    } else {
      instanceNames.add(instanceName);
      console.log(`    ✓ Unique instance name`);
    }
    
    // Validate command and args
    if (!instanceConfig.command) {
      errors.push(`Instance "${instanceName}": Missing "command"`);
    } else if (!['npx', 'node', 'docker'].includes(instanceConfig.command)) {
      warnings.push(`Instance "${instanceName}": Unusual command "${instanceConfig.command}"`);
    } else {
      console.log(`    ✓ Valid command: ${instanceConfig.command}`);
    }
    
    if (!instanceConfig.args || !Array.isArray(instanceConfig.args)) {
      errors.push(`Instance "${instanceName}": Missing or invalid "args" array`);
    } else {
      console.log(`    ✓ Valid args array`);
    }
    
    // Validate environment variables
    const env = instanceConfig.env || {};
    
    // Check for authentication
    const hasToken = !!env.SONARQUBE_TOKEN;
    const hasBasicAuth = !!(env.SONARQUBE_USERNAME && env.SONARQUBE_PASSWORD);
    const hasPasscode = !!env.SONARQUBE_PASSCODE;
    
    if (!hasToken && !hasBasicAuth && !hasPasscode) {
      errors.push(`Instance "${instanceName}": Missing authentication (token, basic auth, or passcode)`);
    } else {
      console.log(`    ✓ Authentication configured`);
      
      // Check for placeholder values
      if (env.SONARQUBE_TOKEN && env.SONARQUBE_TOKEN.includes('YOUR_') || 
          env.SONARQUBE_TOKEN && env.SONARQUBE_TOKEN.includes('_HERE')) {
        warnings.push(`Instance "${instanceName}": Token appears to be a placeholder`);
      }
    }
    
    // Validate URL
    if (env.SONARQUBE_URL) {
      try {
        new URL(env.SONARQUBE_URL);
        console.log(`    ✓ Valid SonarQube URL`);
      } catch {
        errors.push(`Instance "${instanceName}": Invalid SONARQUBE_URL format`);
      }
    }
    
    // Check log file uniqueness
    if (env.LOG_FILE) {
      if (logFiles.has(env.LOG_FILE)) {
        errors.push(`Instance "${instanceName}": Duplicate log file path: ${env.LOG_FILE}`);
      } else {
        logFiles.add(env.LOG_FILE);
        console.log(`    ✓ Unique log file path`);
      }
    } else {
      warnings.push(`Instance "${instanceName}": No LOG_FILE specified (will use default stderr)`);
    }
    
    // Check for recommended settings
    if (!env.LOG_LEVEL) {
      warnings.push(`Instance "${instanceName}": No LOG_LEVEL specified (will use DEBUG)`);
    } else {
      const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
      if (!validLevels.includes(env.LOG_LEVEL)) {
        warnings.push(`Instance "${instanceName}": Invalid LOG_LEVEL "${env.LOG_LEVEL}" (should be: ${validLevels.join(', ')})`);
      } else {
        console.log(`    ✓ Valid log level: ${env.LOG_LEVEL}`);
      }
    }
    
    // Check elicitation settings
    if (env.SONARQUBE_MCP_ELICITATION === 'true') {
      console.log(`    ✓ Elicitation enabled`);
      
      if (env.SONARQUBE_MCP_BULK_THRESHOLD) {
        const threshold = parseInt(env.SONARQUBE_MCP_BULK_THRESHOLD, 10);
        if (isNaN(threshold) || threshold < 1) {
          warnings.push(`Instance "${instanceName}": Invalid SONARQUBE_MCP_BULK_THRESHOLD`);
        } else {
          console.log(`    ✓ Bulk threshold: ${threshold}`);
        }
      }
    }
  }
  
  return { errors, warnings };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node validate-config.js <config-file> [config-file2] ...');
    console.log('\nThis script validates Claude Desktop configuration files for SonarQube MCP Server parallel development.');
    console.log('\nExamples:');
    console.log('  node validate-config.js claude-config.json');
    console.log('  node validate-config.js config/*.json');
    process.exit(1);
  }
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const configPath of args) {
    const { errors, warnings } = validateConfiguration(configPath);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n✅ Configuration is valid!');
    }
    
    totalErrors += errors.length;
    totalWarnings += warnings.length;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Summary: ${totalErrors} error(s), ${totalWarnings} warning(s)`);
  
  if (totalErrors > 0) {
    console.log('\n❌ Some configurations have errors that must be fixed.');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Some configurations have warnings. Review for best practices.');
  } else {
    console.log('\n✅ All configurations are valid!');
  }
}

main();