# VolleyDefense Tactics — V2 Pro Tier Roadmap

> **Future Product & Monetization Roadmap**  
> *Target: Post-V1 Launch*  
> *Status: Planned / Future Sprint*  
> *Current Active Specifications: [docs/Requirements.md](../Requirements.md)*

---

## 1. Overview & Monetization Strategy

While **V1 is 100% free, local-first (`localStorage`), and account-free**, the **Pro Tier (V2)** introduces cloud infrastructure to monetize the product for club teams, high schools, colleges, and competitive adult leagues.

### Value Proposition for Coaches
- **Multi-Device Cloud Sync**: Seamlessly create and edit tactics on a laptop at home, then pull them up on an iPad courtside or on a smartphone on the bench.
- **Permanent Cloud Backup**: Playbooks and custom formations are permanently stored in the cloud—never lost if browser cache is cleared or devices are changed.
- **Team Playbook Collaboration**: Invite assistant coaches and players with team accounts to view tactics.
- **Unlimited Preset Sharing**: Share entire season playbooks (10+ schemes) in a single link.
- **Custom Branded Shortlinks**: Clean, professional links (e.g., `volleydefense.app/t/falcons-defense`) with view analytics.

---

## 2. V2 Feature Comparison

| Feature | V1 (Free Active Target) | V2 (Pro Tier Subscription) |
|---|:---:|:---:|
| **Account Required?** | **No (Zero friction)** | Yes (Email & Password) |
| **Local Custom Presets** | **Yes (`localStorage`)** | Yes |
| **Cloud-Synced Playbooks** | No | **Yes (Cross-device)** |
| **Share via Compressed URL** | **Yes (Up to 3+3 presets)** | Yes |
| **Unlimited Presets per Share** | No | **Yes (Full playbooks)** |
| **Custom Shortlinks (`/t/slug`)** | No | **Yes** |
| **Team Member Access** | No | **Yes** |
| **View Tracking & Analytics** | No | **Yes (See who reviewed plays)** |

---

## 3. Database Architecture (SQLite / Cloud DB)

### 3.1 `users` Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',        -- 'admin' | 'user'
  subscription_status TEXT DEFAULT 'free',  -- 'free' | 'pro' | 'team'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Cloud Preset Tables
```sql
-- Cloud Base Defense Schemes
CREATE TABLE IF NOT EXISTS user_defense_schemes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scheme_data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cloud Attack Scenarios
CREATE TABLE IF NOT EXISTS user_attack_scenarios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  attacker_x REAL,
  attacker_y REAL,
  setter_x REAL,
  setter_y REAL,
  target_x REAL,
  target_y REAL,
  movements_data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pro Team Shortlinks
CREATE TABLE IF NOT EXISTS pro_shortlinks (
  slug TEXT PRIMARY KEY,                    -- Custom short slug e.g. "falcons-line-d"
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tactics_bundle JSON NOT NULL,             -- Unlimited preset array
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. V1 to V2 Migration & Upsell Flow

When a free V1 user signs up for a V2 Pro account:
1. The client detects existing custom presets in `localStorage`.
2. A one-click onboarding prompt appears:
   > *"Import your existing local playbooks to your new cloud account?"*
3. Local presets are uploaded to the cloud database and synced across the user's devices without data loss.
