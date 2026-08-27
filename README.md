# Aevon Marketplace v0.1

Initial foundation for a private Minecraft plugin marketplace.

## Included

- Next.js + TypeScript
- PostgreSQL + Prisma schema
- Registration API with Argon2 password hashing
- Login API with signed HttpOnly session cookie
- Logout API
- Protected customer dashboard
- Protected admin dashboard
- Plugin marketplace
- Product detail pages
- Database models for:
  - Users
  - Products
  - Purchases
  - Licenses
  - Activations
  - Releases
  - Download logs

## Local setup

1. Install Node.js 20+ and PostgreSQL.
2. Create a PostgreSQL database named `aevon_marketplace`.
3. Copy `.env.example` to `.env`.
4. Change `AUTH_SECRET`.
5. Run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Then open http://localhost:3000

## First admin account

Register normally, then update your user's role in PostgreSQL from `CUSTOMER` to `ADMIN`.

You can also run:

```bash
npx prisma studio
```

and update the role from the visual database editor.

## Planned next milestones

v0.2: payments and order processing  
v0.3: private JAR storage + protected downloads  
v0.4: license generation + activation API  
v0.5: ACore license integration  
v1.0: production hardening and deployment

## v0.2 Product Management

The Admin → Products module is now functional. Admins can create products, edit product information, publish/unpublish listings, and archive listings. The homepage and public plugin store now load published products directly from PostgreSQL/Neon.

## v0.3

- Functional Admin → Customers list
- Customer detail page
- Suspend/reactivate customer accounts
- Promote/demote other accounts
- Purchase/license summaries per customer
- Self-lockout protection for the active administrator


## v0.4 — PayMongo Test Checkout

- Logged-in customers can start PayMongo checkout from a plugin page
- Purchase records begin as PENDING
- PayMongo `payment.paid` webhook is re-verified against PayMongo's API
- Only verified paid transactions become PAID
- Paid transactions automatically create an AEVN license key
- Purchased plugins appear in Customer Dashboard → My Plugins
- Admin → Orders is functional

### Required Vercel environment variable

`PAYMONGO_SECRET_KEY`

### Webhook endpoint

After deploying v0.4, create one PayMongo test webhook for:

`https://YOUR-VERCEL-DOMAIN/api/paymongo/webhook`

Subscribe it to `payment.paid`.

Do not create a webhook per purchase. One endpoint is enough.

## v0.4.1

- Fix PayMongo paid-order reconciliation when payment webhook external reference is missing
- Success page verifies the stored Checkout Session directly with PayMongo
- Admin Orders can manually run secure PayMongo verification for a pending order
- Ownership/license is still granted only after a server-to-server paid verification


## v0.5.1
Corrected private Vercel Blob release upload/download implementation.

## v0.5.2
- Added required `access: "private"` to Vercel Blob signed upload/download URLs.
