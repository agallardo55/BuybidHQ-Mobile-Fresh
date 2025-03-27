import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import BidRequestDetail from './pages/BidRequestDetail';
import NewBidResponse from './pages/NewBidResponse';
import VehicleDetailsView from "./components/bid-request/VehicleDetailsView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bid-requests/:id" element={<BidRequestDetail />} />
        <Route path="/bid-requests/:id/respond" element={<NewBidResponse />} />
        <Route path="/vehicle-details" element={<VehicleDetailsView />} />
      </Routes>
    </Router>
  );
}

export default App;
