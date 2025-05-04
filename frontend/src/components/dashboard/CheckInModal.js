import React, { useState } from "react";
import "./CheckInModal.css";
import { getAnyUserBasedonRoleandBalagruha } from "../../api";

const CheckInModal = ({ isOpen, onClose, onSubmit, balagruhas }) => {
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    temperature: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    healthStatus: "normal",
    notes: "",
    uploadedImages: [],
    uploadedPdfs: [],
  });
  const [selectedBalagruha, setSelectedBalagruha] = useState();
  const [selectedStudent, setSelectedStudent] = useState();
  const [students, setStudents] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();

    // Reset form
    setSelectedBalagruha();
    setSelectedStudent();
    setFormData({
      studentId: "",
      studentName: "",
      temperature: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      healthStatus: "normal",
      notes: "",
      uploadedImages: [],
      uploadedPdfs: [],
    });
  };

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
    const student = students.find((s) => s._id === e.target.value);
    setFormData({
      ...formData,
      studentId: e.target.value,
      studentName: student?.name || "",
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValid =
        file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValid) {
        alert(`File ${file.name} is either not an image or exceeds 5MB limit`);
      }
      return isValid;
    });
    setFormData((prev) => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...validFiles],
    }));
  };

  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValid =
        file.type === "application/pdf" && file.size <= 10 * 1024 * 1024; // 10MB limit
      if (!isValid) {
        alert(`File ${file.name} is either not a PDF or exceeds 10MB limit`);
      }
      return isValid;
    });
    setFormData((prev) => ({
      ...prev,
      uploadedPdfs: [...prev.uploadedPdfs, ...validFiles],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
    }));
  };

  const handleRemovePdf = (index) => {
    setFormData((prev) => ({
      ...prev,
      uploadedPdfs: prev.uploadedPdfs.filter((_, i) => i !== index),
    }));
  };

  const fetchStudents = async (balId) => {
    setSelectedBalagruha(balId);
    const response = await getAnyUserBasedonRoleandBalagruha("student", balId);
    if (response.success) {
      const filteredStudents = response?.data?.users.filter((student) =>
        student.balagruhaIds.includes(balId)
      );

      setStudents(filteredStudents);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>New Health Check-in</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Balagruha</label>
            <select
              value={selectedBalagruha}
              onChange={(e) => fetchStudents(e.target.value)}
              required
            >
              <option value="">Select Balagruha</option>
              {balagruhas.map((bal) => (
                <option key={bal.id} value={bal._id}>
                  {bal.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Student</label>
            <select
              value={selectedStudent}
              onChange={handleStudentChange}
              required
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
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
              onChange={(e) =>
                setFormData({ ...formData, temperature: e.target.value })
              }
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Health Status</label>
            <select
              value={formData.healthStatus}
              onChange={(e) =>
                setFormData({ ...formData, healthStatus: e.target.value })
              }
              required
            >
              <option value="normal">Normal</option>
              <option value="warning">Warning</option>
              <option value="alert">Alert</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="3"
            ></textarea>
          </div>

          <input type="file" placeholder="hello hi" />

          {/* File Upload Section */}
          <div className="form-group">
            {/* <label>Upload Images (Max 5MB each)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <div className="uploaded-files">
              {formData.uploadedImages.map((file, index) => (
                <div key={index} className="uploaded-item">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Uploaded"
                    width="50"
                    height="50"
                  />
                  <button onClick={() => handleRemoveImage(index)}>❌</button>
                </div>
              ))}
            </div> */}

            <label className="upload-button">
              Upload Images (Max 5MB each)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                hidden
              />
            </label>

            <div className="uploaded-files">
              {formData.uploadedImages.map((file, index) => (
                <div key={index} className="uploaded-item">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Uploaded"
                    width="50"
                    height="50"
                  />
                  <button onClick={() => handleRemoveImage(index)}>❌</button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            {/* <label>Upload PDFs (Max 10MB each)</label>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handlePdfUpload}
            />
            <div className="uploaded-files">
              {formData.uploadedPdfs.map((file, index) => (
                <div key={index} className="uploaded-item">
                  <span>{file.name}</span>
                  <button onClick={() => handleRemovePdf(index)}>❌</button>
                </div>
              ))}
            </div> */}

            <label className="upload-button">
            Upload PDFs (Max 10MB each)
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handlePdfUpload}
                hidden
              />
            </label>
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
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;
