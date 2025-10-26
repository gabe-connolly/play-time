import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import PlayerForm from '../PlayerForm.svelte';

describe('PlayerForm Component', () => {
  it('should render form fields', () => {
    render(PlayerForm, {
      props: {
        onSubmit: vi.fn(),
        onCancel: vi.fn()
      }
    });

    expect(screen.getByPlaceholderText('First Name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nickname')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jersey #')).toBeInTheDocument();
  });

  it('should show "New Player" title when no initialData', () => {
    render(PlayerForm, {
      props: {
        onSubmit: vi.fn(),
        onCancel: vi.fn()
      }
    });

    expect(screen.getByText('New Player')).toBeInTheDocument();
  });

  it('should show "Edit Player" title with initialData', () => {
    render(PlayerForm, {
      props: {
        initialData: {
          firstName: 'John',
          lastName: 'Doe'
        },
        onSubmit: vi.fn(),
        onCancel: vi.fn()
      }
    });

    expect(screen.getByText('Edit Player')).toBeInTheDocument();
  });

  it('should call onSubmit with form data', async () => {
    const onSubmit = vi.fn();

    render(PlayerForm, {
      props: {
        onSubmit,
        onCancel: vi.fn()
      }
    });

    const firstNameInput = screen.getByPlaceholderText('First Name *');
    const lastNameInput = screen.getByPlaceholderText('Last Name *');
    const nicknameInput = screen.getByPlaceholderText('Nickname');
    const jerseyInput = screen.getByPlaceholderText('Jersey #');
    const submitButton = screen.getByText('Add');

    await fireEvent.input(firstNameInput, { target: { value: 'John' } });
    await fireEvent.input(lastNameInput, { target: { value: 'Doe' } });
    await fireEvent.input(nicknameInput, { target: { value: 'Johnny' } });
    await fireEvent.input(jerseyInput, { target: { value: '10' } });
    await fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'Johnny',
      jerseyNumber: '10'
    });
  });

  it('should call onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn();

    render(PlayerForm, {
      props: {
        onSubmit: vi.fn(),
        onCancel
      }
    });

    const cancelButton = screen.getByText('Cancel');
    await fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should disable submit button when required fields are empty', () => {
    render(PlayerForm, {
      props: {
        onSubmit: vi.fn(),
        onCancel: vi.fn()
      }
    });

    const submitButton = screen.getByText('Add');
    expect(submitButton).toBeDisabled();
  });
});
