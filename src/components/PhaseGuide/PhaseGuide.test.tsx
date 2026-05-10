import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getPhaseById } from '../../lib/data';
import { PhaseGuide } from './PhaseGuide';

describe('PhaseGuide', () => {
  it('renders the phase description and cues', async () => {
    const phase = getPhaseById('pre-bosses');

    if (!phase) {
      throw new Error('Expected pre-bosses phase to exist');
    }

    render(<PhaseGuide phase={phase} />);

    expect(
      screen.getByText(/early exploration stretch where movement/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/you have not defeated any boss yet/i)).toBeInTheDocument();
  });

  it('can be collapsed and reopened', async () => {
    const user = userEvent.setup();
    const phase = getPhaseById('pre-bosses');

    if (!phase) {
      throw new Error('Expected pre-bosses phase to exist');
    }

    render(<PhaseGuide phase={phase} />);

    const summary = screen.getByText(/how do i know i'm here/i);
    const details = summary.closest('details');

    expect(details).toHaveAttribute('open');

    await user.click(summary);

    expect(details).not.toHaveAttribute('open');

    await user.click(summary);

    expect(details).toHaveAttribute('open');
  });
});
