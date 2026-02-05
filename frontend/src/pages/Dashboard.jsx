import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rooms } from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomList, setRoomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });

  useEffect(() => {
    rooms.list()
      .then(({ data }) => setRoomList(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const { data } = await rooms.create(newRoom);
      setRoomList((prev) => [data, ...prev]);
      setNewRoom({ name: '', description: '' });
      setShowCreate(false);
      navigate(`/room/${data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="logo-text">Trutim</h1>
        <div className="header-actions">
          <span className="user-badge">{user?.username} {user?.title && <small>({user.title})</small>}</span>
          <button onClick={logout} className="btn-outline">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="rooms-section">
          <div className="section-header">
            <h2>Rooms</h2>
            <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
              + New Room
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreateRoom} className="create-room-form">
              <input
                placeholder="Room name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                required
              />
              <input
                placeholder="Description (optional)"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
              />
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="loading-rooms">Loading rooms...</div>
          ) : roomList.length === 0 ? (
            <div className="empty-state">
              <p>No rooms yet. Create one to start collaborating!</p>
            </div>
          ) : (
            <ul className="room-list">
              {roomList.map((room) => (
                <li key={room.id} className="room-item" onClick={() => navigate(`/room/${room.id}`)}>
                  <div className="room-info">
                    <strong>{room.name}</strong>
                    {room.description && <span className="room-desc">{room.description}</span>}
                  </div>
                  <span className="room-meta">{room.member_count} members</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
