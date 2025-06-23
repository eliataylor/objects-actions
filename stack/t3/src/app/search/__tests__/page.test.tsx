import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPage from '../page';
import { type ModelName } from '~/types/types';
import ApiClient from '~/app/_components/ApiClient';

// Mock the API client
vi.mock('~/app/_components/ApiClient', () => ({
  default: {
    get: vi.fn()
  }
}));

// Mock the SelectionCount component
vi.mock('~/app/_components/SelectionCount', () => ({
  SelectionCount: ({ type }: { type: ModelName }) => <div data-testid={`selection-count-${type}`} />
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn(),
    toString: () => '',
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/search',
}));

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    vi.mocked(ApiClient.get).mockResolvedValue({
      success: true,
      data: {
        results: {
          Drugs: {
            items: [],
            count: 0
          }
        },
        query: '',
        selected_types: []
      }
    });
  });

  it('renders the search box with autocomplete and type selection', () => {
    render(<SearchPage />);
    
    // Check for search input
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    
    // Check for type selection autocomplete
    expect(screen.getByPlaceholderText('Select types...')).toBeInTheDocument();
  });

  it('allows selecting multiple types', async () => {
    render(<SearchPage />);
    
    // Open the type selection dropdown
    const typeSelect = screen.getByPlaceholderText('Select types...');
    fireEvent.click(typeSelect);
    
    // TODO: find simantics of clickable options
    
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    // Check that common types are available in the listbox
    const manufacturersOption = screen.getByRole('option', { name: 'Manufacturers' });
    const drugsOption = screen.getByRole('option', { name: 'Drugs' });
    expect(manufacturersOption).toBeInTheDocument();
    expect(drugsOption).toBeInTheDocument();
    
    // Select types from the listbox
    fireEvent.click(manufacturersOption);
    fireEvent.click(drugsOption);
    
    // Verify the chips are displayed
    expect(screen.getByRole('button', { name: /Manufacturers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Drugs/i })).toBeInTheDocument();

  });
  

  it('performs search when query is entered', async () => {
    render(<SearchPage />);
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'aspirin' } });
    
    // Wait for the debounced search to be called
    await waitFor(() => {
      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/search?query=aspirin')
      );
    });
  });

  /**  
   * TOOD: fix Search over HTTPS!

  it('shows loading state while searching', async () => {
    render(<SearchPage />);
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'aspirin' } });
    
    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for search to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('displays error message when search fails', async () => {
    // Mock API error
    vi.mocked(ApiClient.get).mockRejectedValue(new Error('Search failed'));
    
    render(<SearchPage />);
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'aspirin' } });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Search failed/i)).toBeInTheDocument();
    });
  });
*/


}); 