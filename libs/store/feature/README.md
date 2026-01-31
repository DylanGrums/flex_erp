# Store Feature

## Promotions & Campaigns (Store Domain)

### Routes
- `/promotions` – list promotions
- `/promotions/new` – create promotion (sheet)
- `/promotions/:id` – promotion detail
  - `/promotions/:id/edit` – edit details + application method
  - `/promotions/:id/rules/edit` – edit rules
- `/campaigns` – list campaigns
- `/campaigns/:id` – campaign detail

### API Endpoints (Store API)
All endpoints require `X-Tenant-Id` + `X-Store-Id` headers.

Promotions
- `GET /api/store/promotions?limit&offset&q&status&isActive&campaignId`
- `GET /api/store/promotions/:id`
- `POST /api/store/promotions`
- `PATCH /api/store/promotions/:id`
- `PATCH /api/store/promotions/:id/status`
- `PUT /api/store/promotions/:id/rules`
- `DELETE /api/store/promotions/:id`

Campaigns
- `GET /api/store/campaigns?limit&offset&q&isActive`
- `GET /api/store/campaigns/:id`
- `POST /api/store/campaigns`
- `PATCH /api/store/campaigns/:id`
- `POST /api/store/campaigns/:id/promotions/:promotionId`
- `DELETE /api/store/campaigns/:id/promotions/:promotionId`

### State (NGXS)
- `PromotionsState` – list + detail + mutations
  - actions: load/list/create/update/status/replaceRules/delete
- `CampaignsState` – list + detail + attach/detach promotion

### Extension Notes
- All money is stored in minor units and percentages in basis points (bps) on the backend.
- Application method conversion happens server-side. Keep `value` in major units/percent on the client.
- Rule values are stored as JSON; extend `extractItemAttribute` / `extractCartAttribute` in
  `PromotionsService` when adding new rule attributes.
- For new target types (e.g., shipping), add enum values + update evaluation logic.
