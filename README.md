# famous.land

Static landing page for `famous.land`, hosted with GitHub Pages.

## Local Preview

Open `index.html` in a browser.

## Deployment

GitHub Pages serves this repository from the `main` branch root. The `CNAME` file binds the Pages site to `famous.land`.

## Cloudflare DNS

Add these DNS-only records in Cloudflare for `famous.land`:

| Type | Name | Content |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `tlfamous.github.io` |

Keep these DNS records unproxied while GitHub provisions the certificate. After DNS propagates, enable **Enforce HTTPS** in the repository's GitHub Pages settings.
