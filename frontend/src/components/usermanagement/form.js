import React from "react";

export const UserForm = ({ user, onSubmit, onClose }) => {
    const [formData, setFormData] = React.useState(user || {
        name: '',
        email: '',
        role: '',
        status: ''
    });
    const roles = [
        "admin",
        "coach",
        "balagruha-in-charge",
        "student",
        "purchase-manager",
        "medical-incharge",
        "sports-coach",
        "music-coach",
        "amma"
    ];
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Role</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onClose} className="cancel-btn">
                    Cancel
                </button>
                <button type="submit" className="submit-btn">
                    {user ? 'Update' : 'Add'} User
                </button>
            </div>
        </form>
    );
};