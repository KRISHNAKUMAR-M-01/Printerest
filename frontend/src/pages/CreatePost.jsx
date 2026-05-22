import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import api from '../utils/api';

const CATEGORIES = ['Design', 'Photography', 'Nature', 'Travel', 'Quotes', 'Tech', 'Art', 'Fashion'];

const CreatePost = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size cannot exceed 10MB.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedFile) {
      setErrorMsg('Please upload an image.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a title for your Pin.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('image', selectedFile);

      await api.upload('/posts', formData);
      navigate('/');
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'Failed to upload pin. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="create-container">
      {errorMsg && <div className="auth-error" style={{ marginBottom: '20px' }}>{errorMsg}</div>}

      <div className="create-card">
        {/* Left: Upload Section */}
        <div className="create-upload-section">
          {previewUrl ? (
            <div className="upload-preview-container">
              <img src={previewUrl} alt="Preview" className="upload-preview" />
              <button
                className="remove-upload-btn"
                onClick={removeFile}
                disabled={uploading}
                title="Remove image"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div
              className={`drag-drop-zone ${dragging ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <Upload className="upload-icon" size={40} />
              <h3 className="upload-title">Drag & drop or click to upload</h3>
              <p className="upload-desc">
                We recommend high-quality JPEG, PNG, WebP or GIF files under 10MB.
              </p>
              <span className="upload-limit">Max file size: 10MB</span>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInput}
                accept="image/*"
              />
            </div>
          )}
        </div>

        {/* Right: Info Section */}
        <form onSubmit={handleSubmit} className="create-form-section">
          <div>
            <div className="create-form-group">
              <input
                type="text"
                placeholder="Add your title"
                className="create-input-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                disabled={uploading}
                required
              />
            </div>

            <div className="create-form-group">
              <textarea
                placeholder="Tell everyone what your Pin is about (description)"
                className="create-input-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                disabled={uploading}
              />
            </div>

            <div className="create-form-group" style={{ marginTop: '32px' }}>
              <label className="create-select-label">Choose a Category</label>
              <select
                className="create-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="create-submit-btn" disabled={uploading}>
            {uploading ? 'Publishing Pin...' : 'Publish Pin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
