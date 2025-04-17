import React, { useState } from 'react';
import './CheckInModal.css';

const CheckInModal = ({ isOpen, onClose, onSubmit, students }) => {
    const [formData, setFormData] = useState({
        studentId: '',
        studentName: '',
        temperature: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        healthStatus: 'Normal',
        notes: '',
        uploadedImages: [],
        uploadedPdfs: []
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();

        // Reset form
        setFormData({
            studentId: '',
            studentName: '',
            temperature: '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            healthStatus: 'Normal',
            notes: '',
            uploadedImages: [],
            uploadedPdfs: []
        });
    };

    const handleStudentChange = (e) => {
        const student = students.find(s => s.id === e.target.value);
        setFormData({
            ...formData,
            studentId: student?.id || '',
            studentName: student?.name || ''
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB limit
            if (!isValid) {
                alert(`File ${file.name} is either not an image or exceeds 5MB limit`);
            }
            return isValid;
        });
        setFormData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, ...validFiles] }));
    };

    const handlePdfUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isValid = file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024; // 10MB limit
            if (!isValid) {
                alert(`File ${file.name} is either not a PDF or exceeds 10MB limit`);
            }
            return isValid;
        });
        setFormData(prev => ({ ...prev, uploadedPdfs: [...prev.uploadedPdfs, ...validFiles] }));
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
        }));
    };

    const handleRemovePdf = (index) => {
        setFormData(prev => ({
            ...prev,
            uploadedPdfs: prev.uploadedPdfs.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>New Health Check-in</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Student</label>
                        <select value={formData.studentId} onChange={handleStudentChange} required>
                            <option value="">Select Student</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Temperature (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.temperature}
                            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Time</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Health Status</label>
                        <select
                            value={formData.healthStatus}
                            onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                            required
                        >
                            <option value="Normal">Normal</option>
                            <option value="Warning">Warning</option>
                            <option value="Alert">Alert</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                        ></textarea>
                    </div>

                    {/* File Upload Section */}
                    <div className="form-group">
                        <label>Upload Images (Max 5MB each)</label>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                        <div className="uploaded-files">
                            {formData.uploadedImages.map((file, index) => (
                                <div key={index} className="uploaded-item">
                                    <img src={URL.createObjectURL(file)} alt="Uploaded" width="50" height="50" />
                                    <button onClick={() => handleRemoveImage(index)}>❌</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Upload PDFs (Max 10MB each)</label>
                        <input type="file" accept="application/pdf" multiple onChange={handlePdfUpload} />
                        <div className="uploaded-files">
                            {formData.uploadedPdfs.map((file, index) => (
                                <div key={index} className="uploaded-item">
                                    <span>{file.name}</span>
                                    <button onClick={() => handleRemovePdf(index)}>❌</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-button">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckInModal;
