# KickSide SimpleFIN

Connection provider for [SimpleFIN Bridge](https://bridge.simplefin.org), the
read-only bank feed protocol. One connection covers every institution the user
links at the bridge; the provider turns it into KickSide sources and an agent
tool.

## Connecting

SimpleFIN hands the user a one-time **setup token**. The connect view posts it
as the connection's credential and the provider claims it on the server during
verification, replacing the token with the resulting **access URL** in the
connection's private context. The token is never stored after the claim and
the access URL never reaches the browser. A user who already holds an access
URL may paste it instead; the provider recognizes both forms.

Rotation goes through `PUT /api/v1/simplefin/connections/{id}` with a new
setup token. The new credential is verified against the bridge before the old
one is discarded; a failed probe restores the previous credential.

## Sources

Three `kickside.data:pullable` bindings, each published as an automation port:

- `transactions` walks the transaction history in 31-day windows from
  `config.backfill_since` (default 90 days), then follows live with a 7-day
  overlap so late-posting and pending-to-posted changes re-deliver under a
  changed `dedup_key`.
- `balances` snapshots every account's balance each tick.
- `holdings` snapshots every investment position each tick.

Snapshots ask the bridge for transactions from `now` rather than
`balances-only=1`: the bridge drops holdings from a balances-only answer.

Item keys are stable per account: `simplefin:tx:<account>:<id>`,
`simplefin:account:<id>`, `simplefin:holding:<account>:<id>`. Pages never
exceed the engine's `limit`: a window or snapshot is sorted by account, time
and id and served in `offset` slices. Balance and holding pages carry complete
coverage per tick, so a closed account or a sold position reconciles away
downstream.

Records use one provider-neutral vocabulary so a ledger sink can accept any
bank feed: `provider`, `account_id`, `institution`, RFC3339 `posted_at` /
`transacted_at` / `balance_at` / `as_of` with `_epoch` twins, decimal `amount`
with `amount_minor`, `quantity`, `cost_basis`, `category_code`.

## Agent tool

`SimpleFINRead` (`kickside.simplefin.traits:read_tool`) lists accounts,
transactions in a date range, a per-account cash-flow summary, and holdings
through the connection selected on the trait, or the single SimpleFIN
connection in scope. List results contain compact rows and `next_cursor`;
use `limit`, `cursor`, and `fields` to choose the page and row fields. The tool
returns the structured object directly.
