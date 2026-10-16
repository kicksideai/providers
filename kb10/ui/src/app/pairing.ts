// Which controls may share a row in the create-config pane.
//
// A two-up row is as tall as its tallest cell, so a control whose label wraps or
// whose hint runs several lines lifts its own input out of line with its
// partner's and pushes everything below the row down. Pairing therefore follows
// what a control renders, never what its value is: a control shares a row only
// while its label fits one line and its hint two in the pane's half column, and
// anything longer takes the whole row.
//
// The budgets are that column measured in the browser at the narrowest width it
// is ever two columns wide — 190px, inside the contextual sub-block of a 465px
// pane — where ordinary prose sets about 28 characters to a line: 24 characters
// of the 12px semibold label, 60 of the 11.5px hint. Character count is a proxy
// for the wrap, so it holds for prose and not for a string of wide unbroken
// words; it is the budget the pane's own copy is written to, and it keeps a
// field whose words plainly overrun a half column out of a shared row.
export const PAIR_LABEL_MAX = 24
export const PAIR_HINT_MAX = 60

export function fitsHalfColumn(label: string, hint?: string | null): boolean {
  return label.trim().length <= PAIR_LABEL_MAX && (hint || '').trim().length <= PAIR_HINT_MAX
}
