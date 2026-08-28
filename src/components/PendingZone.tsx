import React from 'react';

interface PendingZoneProps {
  children: React.ReactNode;
}

/**
 * Where a screen's "pending" sections go — anything telling the user something
 * of theirs is incomplete or needs acting on: the attention queue, the
 * organization profile notice, the personal profile reminder, and whatever comes
 * next.
 *
 * **The rule this component exists to hold:** a pending section is passed to
 * this zone, and the zone sits immediately after the view's `.page-head`, above
 * every list, table and informational block. It applies to every view and every
 * role.
 *
 * Be clear about what it does and does not do. It is a home and a written rule,
 * not an enforcement mechanism — nothing stops someone rendering a notice
 * further down the page. What it buys is that the correct place is the obvious
 * one, and that the rule is written where the next person will look.
 *
 * Two deliberate non-behaviours:
 *
 *  - **No wrapper.** It returns a fragment. The notices carry their own
 *    `margin-bottom`, so adding a styled node would change their spacing —
 *    this is a rule about position, and nothing else.
 *  - **No visibility logic.** Each section stays guarded by its own condition at
 *    the call site. The zone never decides what shows; it only decides where.
 *    A section that renders nothing must be guarded outside, or the zone cannot
 *    tell it apart from one that renders something.
 */
export const PendingZone: React.FC<PendingZoneProps> = ({ children }) => {
  // toArray drops null, undefined, false and true, so a screen where none of
  // the sections apply renders no zone at all — and therefore no stray gap
  // between the header and the content below it.
  const present = React.Children.toArray(children);
  if (present.length === 0) return null;

  return <>{present}</>;
};
