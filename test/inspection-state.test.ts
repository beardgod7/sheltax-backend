import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertStatusTransition,
  assertOutcome,
} from '../src/features/Inspection/state';

function codeOf(fn: () => void): string | null {
  try {
    fn();
  } catch (error: any) {
    return error.code;
  }
  return null;
}

test('an owner completes a confirmed inspection and it stamps completedAt', () => {
  const changes = assertStatusTransition({
    role: 'OWNER',
    from: 'CONFIRMED',
    to: 'COMPLETED',
  });
  assert.equal(changes.status, 'COMPLETED');
  assert.ok(changes.completedAt instanceof Date);
  assert.equal(changes.outcome, undefined, "the seeker's verdict is not assumed");
});

test('an inspection cannot be completed unless it was confirmed', () => {
  assert.equal(
    codeOf(() => assertStatusTransition({ role: 'OWNER', from: 'PENDING', to: 'COMPLETED' })),
    'TRANSITION_NOT_ALLOWED'
  );
  assert.equal(
    codeOf(() => assertStatusTransition({ role: 'OWNER', from: 'RESCHEDULED', to: 'COMPLETED' })),
    'TRANSITION_NOT_ALLOWED'
  );
});

test('terminal states cannot be reopened', () => {
  for (const from of ['CANCELLED', 'COMPLETED']) {
    assert.equal(
      codeOf(() => assertStatusTransition({ role: 'OWNER', from, to: 'CONFIRMED' })),
      'INSPECTION_TERMINAL',
      `${from} should be terminal`
    );
  }
});

test('a seeker may only cancel, never confirm or complete', () => {
  assert.deepEqual(
    assertStatusTransition({ role: 'SEEKER', from: 'CONFIRMED', to: 'CANCELLED' }).status,
    'CANCELLED'
  );
  assert.equal(
    codeOf(() => assertStatusTransition({ role: 'SEEKER', from: 'PENDING', to: 'CONFIRMED' })),
    'TRANSITION_NOT_ALLOWED'
  );
  assert.equal(
    codeOf(() => assertStatusTransition({ role: 'SEEKER', from: 'CONFIRMED', to: 'COMPLETED' })),
    'TRANSITION_NOT_ALLOWED'
  );
});

test('an owner may report NO_SHOW but cannot speak for the seeker\'s interest', () => {
  const changes = assertStatusTransition({
    role: 'OWNER',
    from: 'CONFIRMED',
    to: 'COMPLETED',
    outcome: 'NO_SHOW',
  });
  assert.equal(changes.outcome, 'NO_SHOW');
  assert.ok(changes.outcomeAt instanceof Date);

  for (const outcome of ['INTERESTED', 'NOT_INTERESTED']) {
    assert.equal(
      codeOf(() =>
        assertStatusTransition({ role: 'OWNER', from: 'CONFIRMED', to: 'COMPLETED', outcome })
      ),
      'OUTCOME_NOT_ALLOWED',
      `owner must not record ${outcome}`
    );
  }
});

test('an outcome cannot ride along with a non-completing status change', () => {
  assert.equal(
    codeOf(() =>
      assertStatusTransition({
        role: 'OWNER',
        from: 'PENDING',
        to: 'CONFIRMED',
        outcome: 'NO_SHOW',
      })
    ),
    'OUTCOME_NOT_APPLICABLE'
  );
});

test('the seeker records their verdict on a completed inspection', () => {
  const changes = assertOutcome({
    role: 'SEEKER',
    status: 'COMPLETED',
    currentOutcome: null,
    outcome: 'INTERESTED',
  });
  assert.equal(changes.outcome, 'INTERESTED');
  assert.ok(changes.outcomeAt instanceof Date);
});

test('a verdict is rejected before the inspection is completed', () => {
  assert.equal(
    codeOf(() =>
      assertOutcome({
        role: 'SEEKER',
        status: 'CONFIRMED',
        currentOutcome: null,
        outcome: 'INTERESTED',
      })
    ),
    'INSPECTION_NOT_COMPLETED'
  );
});

test('a verdict is recorded once and cannot be overwritten', () => {
  assert.equal(
    codeOf(() =>
      assertOutcome({
        role: 'SEEKER',
        status: 'COMPLETED',
        currentOutcome: 'NOT_INTERESTED',
        outcome: 'INTERESTED',
      })
    ),
    'OUTCOME_ALREADY_RECORDED'
  );
});

test('a no-show leaves no verdict for the seeker to give', () => {
  assert.equal(
    codeOf(() =>
      assertOutcome({
        role: 'SEEKER',
        status: 'COMPLETED',
        currentOutcome: 'NO_SHOW',
        outcome: 'INTERESTED',
      })
    ),
    'INSPECTION_NO_SHOW'
  );
});

test('an owner cannot record a verdict through the outcome endpoint', () => {
  assert.equal(
    codeOf(() =>
      assertOutcome({
        role: 'OWNER',
        status: 'COMPLETED',
        currentOutcome: null,
        outcome: 'INTERESTED',
      })
    ),
    'OUTCOME_NOT_ALLOWED'
  );
});
