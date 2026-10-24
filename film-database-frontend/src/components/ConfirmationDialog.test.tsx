import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ConfirmationDialog from './ConfirmationDialog';

test('confirmation starts on Cancel and Escape cancels without confirming', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  render(<ConfirmationDialog isOpen message="Delete this record?" onCancel={onCancel} onConfirm={onConfirm} />);
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onConfirm).not.toHaveBeenCalled();
});

test('closing restores focus to the triggering control', () => {
  const trigger = document.createElement('button');
  document.body.appendChild(trigger);
  trigger.focus();
  const props = { message: 'Confirm?', onCancel: jest.fn(), onConfirm: jest.fn() };
  const { rerender } = render(<ConfirmationDialog {...props} isOpen />);
  rerender(<ConfirmationDialog {...props} isOpen={false} />);
  expect(trigger).toHaveFocus();
  trigger.remove();
});

test('only explicit confirmation invokes the confirm callback', () => {
  const onConfirm = jest.fn();
  render(<ConfirmationDialog isOpen message="Confirm?" onCancel={jest.fn()} onConfirm={onConfirm} />);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});
