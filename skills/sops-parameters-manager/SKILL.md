---
name: sops-parameters-manager
description: Manage modo-landing environment configurations and SOPS-encrypted secrets. Use when adding, removing, or moving environment variables between configurations.yaml (plaintext) and secrets.yaml (encrypted with SOPS/KMS). Auto-invoke when editing files in parameters/ directory.
---

# SOPS Parameters Manager for modo-landing

## Directory Structure

```
parameters/
  develop/
    configurations.yaml   # Non-sensitive values (URLs, public IDs, feature flags)
    secrets.yaml          # Sensitive values encrypted with SOPS + AWS KMS
  qa/
    configurations.yaml
    secrets.yaml
  preprod/
    configurations.yaml
    secrets.yaml
  production/
    configurations.yaml
    secrets.yaml
```

## What Goes Where

### configurations.yaml (plaintext, committed to git)
- API base URLs and endpoints
- Firebase public config (auth domain, project ID, storage bucket, measurement ID)
- Storyblok version and revalidation settings
- Feature flags and public redirect URLs
- Service hostnames (e.g., `SALESFORCE_URL`)

### secrets.yaml (SOPS-encrypted, committed to git as ciphertext)
- API keys (Google, Firebase, Storyblok, Amplitude)
- OAuth client IDs and client secrets
- Any token, password, or credential

**Rule of thumb:** If leaking the value would be a security incident, it goes in `secrets.yaml`.

## AWS SSO Profiles

Each environment maps to an AWS account with SSO access:

| Environment | AWS Profile | AWS Account ID | SSO Role |
|---|---|---|---|
| develop | `modo-develop-account-developer` | 151605301785 | M-Engineering-NP |
| qa | `modo-develop-account-developer` | 151605301785 | M-Engineering-NP |
| preprod | `modo-preprod-account-developer` | 262134918714 | M-Engineering-P |
| production | `modo-production-account-developer` | 821600326346 | M-Engineering-P |

Note: develop and QA share the same AWS account/profile.

## SOPS Operations

### Prerequisites
- AWS CLI v2 with SSO configured
- SOPS installed (`brew install sops`)
- `.sops.yaml` in repo root defines KMS keys per environment

### Login to AWS SSO
```bash
aws sso login --profile <aws-profile>
```
This opens a browser for authentication. Only needed once per session per account.

### Read (decrypt) a secrets file
```bash
export AWS_PROFILE=<aws-profile>
sops -d parameters/<env>/secrets.yaml
```

### Add a new secret
```bash
export AWS_PROFILE=<aws-profile>
sops set parameters/<env>/secrets.yaml '["KEY_NAME"]' '"value"'
```
- The key path uses JSON array syntax: `'["KEY_NAME"]'`
- The value must be double-quoted inside single quotes: `'"value"'`
- SOPS automatically re-encrypts the entire file

### Remove a secret
```bash
export AWS_PROFILE=<aws-profile>
sops unset parameters/<env>/secrets.yaml '["KEY_NAME"]'
```

### Edit secrets interactively
```bash
export AWS_PROFILE=<aws-profile>
sops parameters/<env>/secrets.yaml
```
Opens the decrypted file in `$EDITOR`. On save, SOPS re-encrypts automatically.

## Common Mistakes to Avoid

1. **Never use `sops -e` on a file from a different path** - SOPS matches `.sops.yaml` creation rules by file path. Encrypting from `/tmp/` will fail with "no matching creation rules found".

2. **Never overwrite a secrets.yaml with plaintext** - If you accidentally do this, immediately `git checkout parameters/<env>/secrets.yaml` to restore the encrypted version, then use `sops set` to add keys.

3. **Never use `sops -e -i` on a file that lost its SOPS metadata** - It will fail with "sops metadata not found". Restore from git first.

4. **Always use `sops set`/`sops unset` for individual key changes** - This is the safest method. It decrypts, modifies, and re-encrypts in one atomic operation.

5. **Always use `export AWS_PROFILE=...`** - The `--aws-profile` flag does NOT work reliably with SOPS. Export the env var instead.

6. **Production access may be restricted** - The `M-Engineering-P` role on production may not have KMS decrypt permissions. If you get "ForbiddenException: No access", escalate to someone with the appropriate IAM role.

## Workflow: Moving a credential from configurations.yaml to secrets.yaml

1. Note the values for ALL 4 environments before editing
2. Remove the keys from `configurations.yaml` (use Edit tool)
3. Login to AWS SSO for the relevant account(s)
4. Add keys to `secrets.yaml` using `sops set` (one key at a time)
5. Verify with `sops -d` that the values are correct
6. Repeat for each environment
7. Commit all changes together

## CI/CD Integration

The GitHub Actions workflow `.github/workflows/ssm.yaml` automatically syncs parameter changes to AWS SSM Parameter Store on push to `main` (for files under `parameters/`). It uses the shared workflow `playsistemico/workflows/.github/workflows/ssm-sops.yaml@v1`.
