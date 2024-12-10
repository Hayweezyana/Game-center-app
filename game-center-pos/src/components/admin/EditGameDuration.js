import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditGameDuration = () => {
    const [games, setGames] = useState([]);
    const [updatedDurations, setUpdatedDurations] = useState({});
    const [email, setEmail] = useState(''); // State to hold email
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch games from the backend
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/games`)
            .then((response) => setGames(response.data))
            .catch((error) => console.error('Error fetching games:', error));
    }, []);

    const handleDurationChange = (id, duration) => {
        setUpdatedDurations((prev) => ({ ...prev, [id]: duration }));
    };

    const handleUpdate = (id) => {
        const newDuration = updatedDurations[id];
        axios
            .put(`${process.env.REACT_APP_BACKEND_URL}/api/games/${id}`, { time_slot: newDuration })
            .then(() => {
                alert('Game duration updated successfully');
                setGames((prevGames) =>
                    prevGames.map((game) =>
                        game.id === id ? { ...game, time_slot: newDuration } : game
                    )
                );
            })
            .catch((error) => console.error('Error updating game duration:', error));
    };

    const handleBackToGameSelection = () => {
        navigate('/');
    };

    const handleReports = () => {
        navigate('/reports');
    };

    return (
        <div>
            <h1>Edit Game Durations</h1>
            <button onClick={handleReports} style={{ marginTop: '20px' }}>
                Reports
            </button>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Current Duration (Minutes)</th>
                        <th>New Duration</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game) => (
                        <tr key={game.id}>
                            <td>{game.title}</td>
                            <td>{game.time_slot}</td>
                            <td>
                                <input
                                    type="number"
                                    value={updatedDurations[game.id] || game.time_slot}
                                    onChange={(e) =>
                                        handleDurationChange(game.id, e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <button onClick={() => handleUpdate(game.id)}>Update</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Update Membership Section */}
            <div style={{ marginTop: '40px' }}>
                <h2>Update Membership</h2>
                <label>
                    Enter Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter customer email"
                        style={{ marginLeft: '10px', marginRight: '10px' }}
                    />
                </label>
                {email && <UpdateMembership email={email} />}
            </div>

            <button onClick={handleBackToGameSelection} style={{ marginTop: '20px' }}>
                Back to Game Selection
            </button>
        </div>
    );
};

// Update Membership Component
const UpdateMembership = ({ email }) => {
    const [membershipLevel, setMembershipLevel] = useState('bronze');
    const [loading, setLoading] = useState(false); // Loading state for the button

    const handleMembershipChange = async () => {
        if (!email) {
            alert('Email is required to update membership level.');
            return;
        }

        setLoading(true); // Start loading
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/customers/membership_level`,
                {
                    email, // Pass email instead of customer_id
                    membership_level: membershipLevel,
                }
            );
            alert('Membership updated successfully!');
            console.log('Membership updated:', response.data);
        } catch (error) {
            console.error('Error updating membership:', error);
            alert('Failed to update membership. Please try again.');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div>
            <label>
                Membership Level:
                <select
                    value={membershipLevel}
                    onChange={(e) => setMembershipLevel(e.target.value)}
                    style={{ marginLeft: '10px' }}
                    disabled={loading} // Disable input while loading
                >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                </select>
            </label>
            <button
                onClick={handleMembershipChange}
                style={{ marginLeft: '10px' }}
                disabled={loading} // Disable button while loading
            >
                {loading ? 'Updating...' : 'Update Membership'}
            </button>
        </div>
    );
};

export default EditGameDuration;
