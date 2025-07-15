import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the initial prompt to speak', () => {
  render(<App />);
  const linkElement = screen.getByText(/Tap the light to speak/i);
  expect(linkElement).toBeInTheDocument();
});
