
# PolarDB Setup Guide for GoodyMorgan

This guide walks through setting up PolarDB in Alibaba Cloud for the GoodyMorgan application.

## Prerequisites

1. An Alibaba Cloud account with billing enabled
2. Access Key ID and Secret with permissions to:
   - Create and manage PolarDB clusters
   - Create VPC resources
   - Manage security groups

## Step 1: Create a PolarDB Cluster

### Option A: Via Alibaba Cloud Console

1. Log in to the [Alibaba Cloud Console](https://account.alibabacloud.com/login/login.htm)
2. Navigate to **PolarDB** in the database services
3. Click **Create Cluster**
4. Configure the cluster with the following settings:
   - **Region**: Singapore (ap-southeast-1)
   - **Database Type**: PostgreSQL
   - **Version**: 14 (required for TDE support)
   - **Edition**: Enterprise Edition
   - **Specification**: Dedicated, polar.pg.x4.medium (2 Cores, 8GB) 
   - **Nodes**: 2 (1 primary + 1 read-only)
   - **Storage Type**: PLS5 (higher performance)
   - **VPC**: Create new or select existing
   - **Payment Type**: Subscription (for production) or Pay-As-You-Go (for testing)
   - **Advanced Options**:
     - **TDE**: Enable (required for data protection)
     - **Dedicated Host**: Enable for stable performance

5. Complete the creation process and wait for the cluster to be provisioned (5-10 minutes)

### Option B: Via GoodyMorgan Admin Dashboard

1. Configure the environment variables:
   ```
   ALICLOUD_ACCESS_KEY_ID=your-access-key-id
   ALICLOUD_ACCESS_KEY_SECRET=your-access-key-secret
   ALICLOUD_REGION_ID=ap-southeast-1
   ```

2. Navigate to the PolarDB Cluster Manager in the admin dashboard
3. Fill in the required details using the recommended settings:
   - Dedicated Specification: polar.pg.x4.medium
   - 2 Cores, 8 GB memory
   - PLS5 storage type
   - Enterprise Edition
   - TDE Enabled

4. The system will set up the cluster automatically

## Step 2: Configure Security

1. In the PolarDB cluster details page, navigate to **Security Settings**
2. Add your application server's IP to the whitelist
3. Create a strong password for the default `postgres` user
4. For production, configure SSL connections:
   - Download the CA certificate
   - Enable SSL connections in your application
5. Verify that **Transparent Data Encryption (TDE)** is enabled:
   - This provides encryption at rest for your data
   - TDE in PolarDB (PostgreSQL 14) is fully managed by Alibaba Cloud
   - Key rotation is handled automatically (default 90 days)

## Step 3: Create Application Database

1. Connect to the PolarDB cluster using a PostgreSQL client:
   ```bash
   psql -h <cluster-endpoint> -U postgres -W
   ```

2. Create a database for your application:
   ```sql
   CREATE DATABASE goodymorgan;
   ```

3. Create a dedicated user for your application:
   ```sql
   CREATE USER goodymorgan WITH PASSWORD 'strong-password';
   GRANT ALL PRIVILEGES ON DATABASE goodymorgan TO goodymorgan;
   ```

## Step 4: Run Schema Migration

1. Set the following environment variables in your application:
   ```
   POLARDB_HOST=your-cluster-endpoint
   POLARDB_PORT=5432
   POLARDB_DATABASE=goodymorgan
   POLARDB_USER=goodymorgan
   POLARDB_PASSWORD=strong-password
   POLARDB_SSL=true
   POLARDB_CLUSTER_TYPE=writer
   POLARDB_REGION=your-region
   ```

2. Deploy your application, which will run the schema migration on startup

## Step 5: Understanding PolarDB Architecture

PolarDB uses a "shared storage" architecture with:

- **Primary Node**: Handles all write operations
- **Read-only Nodes**: Handle read operations (auto-scaled)
- **Shared Distributed Storage**: Provides high performance and reliability

Unlike traditional PostgreSQL, PolarDB automatically manages:
- Connection pooling
- Read/write splitting
- High availability and failover
- Storage scaling

## Step 6: Dedicated Host vs. Shared Tenancy

PolarDB offers two deployment models:

1. **Shared Tenancy**:
   - Multiple customer databases on shared infrastructure
   - Lower cost, managed by Alibaba Cloud
   - Good for most applications

2. **Dedicated Host** (Recommended for GoodyMorgan):
   - Exclusive physical servers for your PolarDB clusters
   - Better performance consistency
   - Enhanced security isolation
   - Required for regulated workloads

For GoodyMorgan, we're using a dedicated host with:
- Specification: polar.pg.x4.medium
- 2 Cores, 8GB RAM
- Enterprise Edition
- PLS5 storage for higher performance
- TDE enabled for data security

## Step 7: Transparent Data Encryption (TDE)

PolarDB with PostgreSQL 14 supports TDE for encryption at rest:

- **What TDE Protects**: Data files, WAL files, temporary files, backup files
- **Key Management**: Handled by Alibaba Cloud KMS (Key Management Service)
- **Performance Impact**: Minimal (2-5% overhead)
- **Key Rotation**: Automatic every 90 days by default (configured in settings)

To use TDE:
- Select PostgreSQL 14 when creating your cluster
- Enable TDE during cluster creation
- No application code changes required

## Step 8: Configure Multi-Region Setup (Advanced)

For global deployments, consider setting up:

1. PolarDB clusters in multiple regions (e.g., Singapore, Mumbai)
2. Global Database Network for cross-region replication
3. Update your application's region management to distribute requests appropriately

## Monitoring & Maintenance

- Enable **CloudMonitor** for performance metrics
- Set up **Alert Rules** for critical thresholds
- Schedule regular **Automated Backups**
- Consider setting up **Data Guard** for disaster recovery

## Cost Optimization

- Our chosen specification (polar.pg.x4.medium) provides good value for enterprise workloads
- Consider reserved instances for long-term use
- Monitor and adjust read-only nodes as needed
- Set up node auto-scaling for cost-efficient operations

## Useful Resources

- [PolarDB for PostgreSQL Documentation](https://www.alibabacloud.com/help/product/58609.htm)
- [PolarDB Performance Optimization Guide](https://www.alibabacloud.com/help/doc-detail/118207.htm)
- [Alibaba Cloud Database Best Practices](https://www.alibabacloud.com/help/doc-detail/144156.htm)
- [PolarDB TDE Documentation](https://www.alibabacloud.com/help/doc-detail/135361.htm)
