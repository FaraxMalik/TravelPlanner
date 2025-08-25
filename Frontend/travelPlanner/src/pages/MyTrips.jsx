import React, { useEffect, useState } from 'react';
import { travelAPI } from '../services/api';
import './MyTrips.css';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await travelAPI.getItineraries();
        setTrips(res.data.itineraries || []);
      } catch (err) {
        setError('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-trips-page">
      <h2>My Trips</h2>
      {trips.length === 0 ? (
        <p>No trips found.</p>
      ) : (
        <div className="trips-grid">
          {trips.map(trip => (
            <div key={trip._id || trip.id} className="trip-card">
              <div className="trip-header">
                <span className="trip-destination">{trip.destination || trip.placeName || 'Adventure Destination'}</span>
                <span className={`trip-status ${trip.status || 'planned'}`}>{trip.status ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1) : 'Planned'}</span>
              </div>
              <div className="trip-details">
                <div><strong>Dates:</strong> {trip.startDate || 'TBD'} - {trip.endDate || 'TBD'}</div>
                <div><strong>Duration:</strong> {trip.numberOfDays || trip.duration || 'N/A'} days</div>
                <div><strong>Budget:</strong> €{trip.budget || 'N/A'}</div>
                <div><strong>Description:</strong> {trip.details || trip.description || 'No details available.'}</div>
                <div><strong>Travelers:</strong> {trip.travelers ? trip.travelers.join(', ') : 'N/A'}</div>
                <div><strong>Created:</strong> {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
              <button className="trip-view-btn">View Details</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
