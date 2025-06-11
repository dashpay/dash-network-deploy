# Dashmate Deployment Optimizations

## Project Context
Working on dash-network-deploy repository to optimize dashmate deployments on HP masternodes for testnet. The original deployment was extremely slow due to unnecessary operations running on every deployment.

## Problem Statement
- Dashmate deployments took "forever" due to redundant operations
- Every deployment would check/create users, groups, config files, logs, etc.
- No parallelism - nodes waited for each other
- Multiple nodes trying to coordinate restarts simultaneously
- Many "gathering facts" operations slowing startup

## Solution: Fast Mode Deployment

### Key Optimizations Implemented

1. **Fast Mode Flag (`--fast`)**
   - Sets `skip_dashmate_image_update=true`
   - Skips all non-essential operations
   - Usage: `./bin/deploy -p --fast --tags=dashmate_deploy testnet`

2. **Parallelism Improvements**
   - Added `strategy: free` - nodes don't wait for each other
   - Added `serial: 0` - all hosts run simultaneously  
   - Increased `forks = 50` in ansible.cfg (from 20)
   - Added `gather_facts: false` to skip slow fact gathering

3. **Operations Skipped in Fast Mode**
   - User/group existence checks and creation
   - dash.conf generation and writing
   - dash-cli user configuration
   - Log directory creation and logrotate config
   - Filebeat configuration and restart
   - System package installation checks
   - Rust/Node.js installation
   - SSL certificate generation
   - Docker image updates

4. **Conditional Restart Logic**
   - **Fast Mode**: Each node restarts itself independently (parallel execution)
   - **Regular Mode**: Coordinated chunked restarts to prevent network disruption
   - Fast mode uses `skip_dashmate_image_update` flag to determine restart method
   - Fixed undefined variable issues with proper conditionals

5. **Version-Based Deployment**
   - Checks current vs required dashmate version (from testnet.yml: `dashmate_version: 2.0.0-rc.16`)
   - Only installs/updates if versions differ
   - Restarts services after version changes

## Files Modified

### Core Deployment Files
- **`bin/deploy`**: Added `--fast` and `--skip-image-update` flags
- **`ansible/deploy.yml`**: Added `dashmate_deploy` tag, `gather_facts: false`, `strategy: free`
- **`ansible/ansible.cfg`**: Increased forks to 50, fixed Python interpreter warnings

### Dashmate Role Optimizations
- **`ansible/roles/dashmate/tasks/main.yml`**: Major optimizations with conditional execution
- **`ansible/roles/dashmate/tasks/build.yml`**: Added package/tool existence checks
- **`ansible/roles/dashmate/tasks/logs.yml`**: Added conditional log configuration
- **`ansible/roles/dashmate/defaults/main.yml`**: Added optimization flags documentation

### New Files Created
- **`ansible/roles/dashmate/tasks/quick_update.yml`**: Streamlined update-only task
- **`ansible/dashmate_quick_update.yml`**: Alternative playbook for quick updates

## Current State

### Working Commands
```bash
# Fast dashmate deployment (recommended)
./bin/deploy -p --fast --tags=dashmate_deploy testnet

# With single node testing
./bin/deploy -p --fast --tags=dashmate_deploy -a="--limit hp-masternode-1" testnet
```

### Branch Status
- Working on branch: `optimize_dashmate` (created from `v1.0-dev`)
- Changes not committed (keeping flexibility for dashmate project work)
- All optimizations tested and working

## Technical Details

### Undefined Variable Fixes Applied
- `dashmate_group_check`, `dashmate_user_check` - Added `is defined` checks
- `dash_conf_stat`, `dash_conf_changed` - Added conditional execution
- `logrotate_config_stat` - Added proper conditionals
- `dashmate_update` - Fixed JSON parsing with proper conditionals
- `dashmate_start_all`, `dashmate_restart_all` - Added `default(false)` fallbacks
- `dashmate_install_result`, `template_result` - Added safe evaluation

### Conditional Restart Logic
```yaml
# Fast mode: Individual restart (parallel)
when:
  - not (dashmate_start_all.changed | default(false))
  - is_dashmate_package_changed or is_dashmate_config_changed
  - skip_dashmate_image_update | default(false)

# Regular mode: Coordinated chunked restart
when:
  - not (dashmate_start_all.changed | default(false))
  - is_dashmate_package_changed or is_dashmate_config_changed
  - not (skip_dashmate_image_update | default(false))
  - inventory_hostname == play_hosts[0]  # Only first node coordinates
```

### Synchronization Points (Regular Mode Only)
- Added `meta: flush_handlers` before coordinated operations in regular mode
- Debug messages to ensure all nodes reach sync point
- Prevents premature restarts during individual node operations
- Fast mode bypasses synchronization for maximum speed

## Performance Impact
- **Before**: Deployment took "forever" with sequential operations
- **After**: Parallel execution, only essential operations, conditional restarts
- **Fast Mode**: Independent node restarts for maximum speed
- **Regular Mode**: Coordinated restarts to prevent network disruption
- **Result**: Dramatically faster deployments focusing only on dashmate version updates

## Next Context for Dashmate Project
Need to work on the dashmate project itself with understanding of:
- How dash-network-deploy calls dashmate
- Version management and updating processes
- Configuration rendering and service management
- Restart coordination requirements
- Integration points between the two projects

## Force Flags Available
For manual overrides when needed:
- `force_dashmate_rebuild=true` - Force rebuild from source
- `force_dashmate_reinstall=true` - Force package reinstall  
- `force_ssl_regenerate=true` - Force SSL cert regeneration
- `force_logs_config=true` - Force log reconfiguration
- `skip_dashmate_image_update=true` - Skip Docker image updates (auto-set by --fast)