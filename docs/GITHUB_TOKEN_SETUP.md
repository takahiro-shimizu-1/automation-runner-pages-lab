# GitHub Token Setup

## まず分けて考える

shared runner では token の役割が 2 つあります。

- GitHub API 用
  - issue / PR / Actions / contents を触る token
  - local `.env` の `GITHUB_TOKEN` や、GitHub Actions の `github.token`
- package install 用
  - GitHub Packages から `@.../automation-runner` を取る token
  - repo secret `AUTOMATION_RUNNER_PACKAGE_TOKEN` または local 環境変数で渡す

## GitHub Actions で package を取るとき

generated workflow は次を前提にしています。

- `actions/setup-node` で package scope と registry を設定する
- `permissions: packages: read` を宣言する
- `NODE_AUTH_TOKEN=${{ secrets.AUTOMATION_RUNNER_PACKAGE_TOKEN || github.token }}` を使う
- `wait-for-check` を使う PR workflow では `permissions: actions: read` も宣言する
- `pr-review-gate` / `pr-auto-merge` を使う workflow では `permissions: checks: read` も宣言する

つまり通常は app repo の `GITHUB_TOKEN` を先に使い、それで package を読めないときだけ `AUTOMATION_RUNNER_PACKAGE_TOKEN` を追加します。

### `AUTOMATION_RUNNER_PACKAGE_TOKEN` が必要なケース

- package repo と app repo の owner が違う
- private package への read access を app repo の `GITHUB_TOKEN` が持っていない
- GitHub Packages の granular permission を明示的に分けている

この token は **classic PAT** を使い、最低でも `read:packages` を付けます。

## ローカルで package を取るとき

GitHub Packages install には scope mapping が必要です。

`config/shared-runner-profile-manifest.json` の `runnerPackage.scope` と `runnerPackage.registry` を見て、`~/.npmrc` か repo-local `.npmrc` に次を置きます。

```ini
@YOUR_RUNNER_SCOPE:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${AUTOMATION_RUNNER_PACKAGE_TOKEN}
```

そのうえで shell に token を入れます。

```bash
export AUTOMATION_RUNNER_PACKAGE_TOKEN=ghp_replace_me
```

registry を GitHub Packages 以外へ変える場合は、`config/shared-runner-profile-manifest.json` の `runnerPackage.registry` に合わせます。

## ローカル runtime 用 `GITHUB_TOKEN`

package install token と、runtime が GitHub API を叩く token は別物として扱います。

`GITHUB_TOKEN` は local `.env` に入れます。

```bash
GITHUB_TOKEN=ghp_replace_me
```

こちらは fine-grained token でも classic token でもよいですが、profile に応じて必要権限を満たしてください。

profile に応じて必要権限は変わります。

### `planning-only`

- Issues: read / write
- Pull requests: read / write
- Actions: read / write
- Contents: read

### `review-and-pr`

- `planning-only` に加えて
- Contents: write

### `deploy-enabled`

- `review-and-pr` に加えて
- Pages: write
- ID token: write
- provider 固有の権限

## ローカル `.env`

`.env` は commit しません。

## 補足

- Project 連携が必要なら `GH_PROJECT_TOKEN` を別で持つ
- local package install は `AUTOMATION_RUNNER_PACKAGE_TOKEN`、local GitHub API 実行は `.env` の `GITHUB_TOKEN` を使い分ける
- GitHub Actions ではまず `github.token`、足りないときだけ `AUTOMATION_RUNNER_PACKAGE_TOKEN` を足す
- custom workflow で shared runner package を直接呼ぶ場合も、同じく `permissions: packages: read` を付ける
