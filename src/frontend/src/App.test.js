import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renderiza a tela de login', () => {
  render(<App />);
  const loginText = screen.getByText(/login/i);
  expect(loginText).toBeInTheDocument();
});

