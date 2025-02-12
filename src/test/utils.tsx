
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export const mockBidRequest = {
  year: "2024",
  make: "Toyota",
  model: "Camry",
  trim: "XSE",
  vin: "1HGCM82633A123456",
  mileage: "15000",
  exteriorColor: "Black",
  interiorColor: "Black",
  accessories: "Premium Package",
  windshield: "good",
  engineLights: "none",
  brakes: "excellent",
  tire: "good",
  maintenance: "upToDate",
  reconEstimate: "2500",
  reconDetails: "Minor paint correction needed",
};

export const mockBuyer = {
  id: "1",
  name: "John Smith",
  dealership: "Premium Motors",
  mobile: "(555) 123-4567",
  email: "john@example.com",
};
