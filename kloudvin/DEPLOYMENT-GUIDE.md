# KloudVin — Azure Static Web Apps Deployment Guide

## Complete Setup: Azure DevOps Pipeline + Azure Static Web Apps

---

## Overview

This guide walks you through deploying the KloudVin blog to **Azure Static Web Apps** using **Azure DevOps Pipelines**. By the end, every push to your `main` branch will automatically build, validate, and deploy your site.

**Architecture:**

```
Git Push (main) → Azure DevOps Pipeline → Azure Static Web Apps → kloudvin.com
```

**What you'll set up:**

1. Azure Static Web App resource
2. Azure DevOps repository
3. Variable group with deployment secrets
4. Pipeline linked to the YAML file
5. Custom domain (kloudvin.com)

---

## Step 1: Create the Azure Static Web App Resource

### 1.1 — Go to Azure Portal

1. Open [https://portal.azure.com](https://portal.azure.com)
2. Click **"+ Create a resource"** in the top left
3. Search for **"Static Web App"** and click **Create**

### 1.2 — Fill in the Basics

| Field | Value |
|---|---|
| **Subscription** | Your Azure subscription |
| **Resource Group** | Create new → `rg-kloudvin` (or use existing) |
| **Name** | `kloudvin-site` |
| **Plan type** | **Free** (sufficient for blogs) |
| **Region** | Choose closest to your audience (e.g., `Central India`, `East US`) |
| **Source** | Select **"Other"** (we'll use Azure DevOps, not GitHub) |

### 1.3 — Click "Review + Create" → "Create"

### 1.4 — Get the Deployment Token

This is the **most critical step** — you need this token for the pipeline.

1. After deployment completes, click **"Go to resource"**
2. In the left sidebar, click **"Manage deployment token"** (under Overview)
3. Click **"Copy"** to copy the token
4. **Save this token securely** — you'll paste it into Azure DevOps in Step 3

> **⚠️ IMPORTANT:** Treat this token like a password. Anyone with this token can deploy to your site.

### 1.5 — Note Your Site URL

On the **Overview** page, you'll see your default URL:

```
https://kloudvin-site-xxxxxx.azurestaticapps.net
```

Copy this URL — you'll need it for the variable group.

---

## Step 2: Push Code to Azure DevOps Repository

### 2.1 — Create a New Project (if you don't have one)

1. Go to [https://dev.azure.com](https://dev.azure.com)
2. Click **"+ New project"**
3. Name: `KloudVin`
4. Visibility: **Private**
5. Click **Create**

### 2.2 — Create / Import the Repository

1. Go to **Repos** → **Files** in the left sidebar
2. If the repo is empty, you'll see setup instructions

### 2.3 — Push Your Code

Open a terminal in your project folder and run:

```bash
cd kloudvin

# Initialize git (skip if already a git repo)
git init
git branch -M main

# Add the Azure DevOps remote
git remote add origin https://dev.azure.com/YOUR_ORG/KloudVin/_git/KloudVin

# Push all files
git add -A
git commit -m "Initial commit — KloudVin blog"
git push -u origin main
```

### 2.4 — Verify File Structure in Repo

After pushing, your repo should look like this:

```
├── azure-pipelines.yml          ← Pipeline definition
├── staticwebapp.config.json     ← Routing & headers config
├── index.html                   ← Homepage
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── components.js
└── pages/
    ├── blog.html
    ├── about.html
    └── article.html
```

---

## Step 3: Create the Variable Group in Azure DevOps

This is where you store the deployment token and site URL securely.

### 3.1 — Navigate to Library

1. In Azure DevOps, go to **Pipelines** → **Library** (left sidebar)
2. Click **"+ Variable group"**

### 3.2 — Configure the Variable Group

| Field | Value |
|---|---|
| **Variable group name** | `kloudvin-deploy` |
| **Description** | Deployment variables for KloudVin Static Web App |

### 3.3 — Add Variables

Click **"+ Add"** for each variable:

| Variable Name | Value | Lock (Secret)? |
|---|---|---|
| `DEPLOYMENT_TOKEN` | *(paste the token from Step 1.4)* | **🔒 YES — Click the lock icon** |
| `SITE_URL` | `https://kloudvin-site-xxxxxx.azurestaticapps.net` | No |

### How to Add Each Variable:

**For DEPLOYMENT_TOKEN (Secret):**

1. Click **"+ Add"**
2. **Name:** Type `DEPLOYMENT_TOKEN`
3. **Value:** Paste the deployment token you copied from Azure Portal
4. **Click the 🔒 lock icon** on the right to mark it as secret
5. Once locked, the value shows as `••••••••` and cannot be viewed again

**For SITE_URL:**

1. Click **"+ Add"**
2. **Name:** Type `SITE_URL`
3. **Value:** Paste your site URL (e.g., `https://kloudvin-site-abc123.azurestaticapps.net`)
4. Leave unlocked (it's not sensitive)

### 3.4 — Save

Click **"Save"** at the top of the page.

### 3.5 — Set Pipeline Permissions

1. On the variable group page, click the **"Pipeline permissions"** tab
2. Click **"+"** and select your KloudVin pipeline (or click **"Open access"** to allow all pipelines)

> **📝 Note:** If you haven't created the pipeline yet (Step 4), come back to this step after creating it.

---

## Step 4: Create the Pipeline

### 4.1 — Go to Pipelines

1. Click **Pipelines** → **Pipelines** in the left sidebar
2. Click **"New pipeline"** (or "Create Pipeline")

### 4.2 — Connect to Your Repo

1. Select **"Azure Repos Git"**
2. Select your **KloudVin** repository
3. Select **"Existing Azure Pipelines YAML file"**
4. Branch: `main`
5. Path: `/azure-pipelines.yml`
6. Click **Continue**

### 4.3 — Review and Run

1. Review the YAML — it should show the pipeline you pushed
2. Click **"Run"** to trigger the first deployment

### 4.4 — Authorize Variable Group (First Run)

On the **first run**, you'll see a prompt:

```
This pipeline needs permission to access a resource before this run can continue.
```

1. Click **"View"**
2. Click **"Permit"** next to the `kloudvin-deploy` variable group
3. The pipeline will resume

### 4.5 — Authorize Environment (First Run)

You may also see a prompt to authorize the `production` environment:

1. Click **"View"** → **"Permit"**
2. Pipeline resumes

---

## Step 5: Verify Deployment

### 5.1 — Check Pipeline Status

After the pipeline completes all 3 stages:

| Stage | Status |
|---|---|
| 🔨 Build & Validate | ✅ Checks files exist, validates HTML |
| 🚀 Deploy to Azure | ✅ Pushes files to Static Web App |
| 🔍 Post-Deploy Verification | ✅ Pings your site URL |

### 5.2 — Visit Your Site

Open your browser and go to:

```
https://kloudvin-site-xxxxxx.azurestaticapps.net
```

You should see the KloudVin homepage!

---

## Step 6: Add Custom Domain (kloudvin.com)

### 6.1 — In Azure Portal

1. Go to your Static Web App resource
2. Click **"Custom domains"** in the left sidebar
3. Click **"+ Add"**
4. Enter: `kloudvin.com`
5. Click **"Next"**

### 6.2 — Configure DNS Records

Azure will show you the DNS records to add. Go to your domain registrar and add:

**For root domain (kloudvin.com):**

| Type | Name | Value |
|---|---|---|
| **ALIAS / ANAME** or **A** | `@` | *(Azure will provide the IP or alias)* |

**For www subdomain (optional):**

| Type | Name | Value |
|---|---|---|
| **CNAME** | `www` | `kloudvin-site-xxxxxx.azurestaticapps.net` |

### 6.3 — Validate Domain

1. Back in Azure Portal, click **"Validate"**
2. Once DNS propagates (up to 48 hours, usually 5-30 minutes), the domain will be verified
3. Azure automatically provisions a **free SSL certificate**

### 6.4 — Update SITE_URL Variable

Go back to **Pipelines → Library → kloudvin-deploy** and update:

| Variable | New Value |
|---|---|
| `SITE_URL` | `https://kloudvin.com` |

---

## Ongoing: How Deployments Work After Setup

Once everything is configured, the flow is automatic:

```
You push to main  →  Pipeline triggers  →  Site updates in ~2 minutes
```

### To Publish a New Article:

**Option A: Via the Web Editor (Admin)**

1. Visit your site → Click lock icon → Login
2. Click "New Article" → Write or Upload → Publish
3. Article appears immediately (stored in browser localStorage)

**Option B: Via Code Push (Permanent)**

1. Add article content to the `js/app.js` articles array
2. `git add . && git commit -m "New article: Title" && git push`
3. Pipeline deploys automatically

---

## Troubleshooting

### Pipeline fails at "Deploy to Azure Static Web Apps"

| Issue | Fix |
|---|---|
| `DEPLOYMENT_TOKEN` not found | Check variable group name is exactly `kloudvin-deploy` |
| Token is invalid | Get a fresh token from Azure Portal → Static Web App → Manage deployment token |
| Permission denied | Go to Library → kloudvin-deploy → Pipeline permissions → Add your pipeline |

### Site shows "404" after deployment

| Issue | Fix |
|---|---|
| Routing not working | Ensure `staticwebapp.config.json` is in the root of your repo |
| Files not deployed | Check Build stage logs to verify files were copied to staging |

### Custom domain not working

| Issue | Fix |
|---|---|
| DNS not propagating | Wait up to 48 hours; use `nslookup kloudvin.com` to check |
| SSL certificate pending | Azure auto-provisions this; it may take up to 24 hours |
| "Domain validation failed" | Double-check DNS records match exactly what Azure shows |

### Pipeline authorization keeps failing

1. Go to **Project Settings** → **Pipelines** → **Service connections**
2. Ensure the pipeline has the right permissions
3. For variable groups: **Library → kloudvin-deploy → Pipeline permissions → Open access**

---

## Variable Group Quick Reference

| Variable | Value | Secret? | Purpose |
|---|---|---|---|
| `DEPLOYMENT_TOKEN` | *(from Azure Portal)* | **Yes 🔒** | Authenticates pipeline to deploy |
| `SITE_URL` | `https://kloudvin.com` | No | Used for post-deployment health check |

---

## Cost Summary

| Service | Cost |
|---|---|
| Azure Static Web App (Free tier) | **$0/month** |
| Azure DevOps (free for 5 users) | **$0/month** |
| Custom domain (kloudvin.com) | **~$10/year** |
| SSL Certificate | **Free** (auto-provisioned) |
| **Total** | **~$10/year** |

---

## Files Reference

| File | Purpose |
|---|---|
| `azure-pipelines.yml` | 3-stage CI/CD pipeline (Build → Deploy → Verify) |
| `staticwebapp.config.json` | Routing rules, security headers, custom error pages |

---

*Guide prepared for KloudVin by Vinod — Cloud / DevOps Platform Architect*
