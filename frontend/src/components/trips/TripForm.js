import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import TripContext from '../../context/trip/TripContext';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  
  &:focus {
    border-color: #4a90e2;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    border-color: #4a90e2;
    outline: none;
  }
`;

const LocationGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  background: ${props => props.secondary ? 'white' : '#4a90e2'};
  color: ${props => props.secondary ? '#4a90e2' : 'white'};
  border: ${props => props.secondary ? '1px solid #4a90e2' : 'none'};
  padding: 12px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.secondary ? '#f0f7ff' : '#357abd'};
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const PhotosSection = styled.div`
  margin-top: 30px;
`;

const PhotosHeader = styled.h3`
  margin-bottom: 15px;
  color: #333;
`;

const PhotosList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const PhotoItem = styled.div`
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
`;

const PhotoOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  
  &:hover {
    color: #ff6b6b;
  }
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border: 2px dashed #ced4da;
  border-radius: 5px;
  height: 120px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #dee2e6;
  }
  
  input {
    display: none;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const PhotoInput = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const PhotoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 70px;
  gap: 10px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PhotoPreview = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 5px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TripForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alertState, setAlertState } = useContext(AlertContext);
  const { tripState, setTripState } = useContext(TripContext);
  const { authState } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainLocation: {
      lat: '',
      lng: '',
      address: ''
    },
    photos: []
  });
  
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const { title, description, mainLocation, photos } = formData;
  
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchTrip();
    }
    // eslint-disable-next-line
  }, [id]);
  
  const setAlert = (msg, type, timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlertState([...alertState, { id, msg, type }]);

    setTimeout(() => {
      setAlertState(alertState.filter(alert => alert.id !== id));
    }, timeout);
  };
  
  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/trips/${id}`);
      
      setFormData({
        title: res.data.title,
        description: res.data.description || '',
        mainLocation: res.data.mainLocation,
        photos: res.data.photos || []
      });
      
      setLoading(false);
    } catch (err) {
      setAlert(
        err.response?.data?.message || 'Error fetching trip', 
        'danger'
      );
      setLoading(false);
      navigate('/dashboard');
    }
  };
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onLocationChange = e => {
    setFormData({
      ...formData,
      mainLocation: {
        ...mainLocation,
        [e.target.name]: e.target.value
      }
    });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (!title || !mainLocation.lat || !mainLocation.lng) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }
    
    // Convert lat/lng to numbers
    const formattedData = {
      ...formData,
      mainLocation: {
        ...mainLocation,
        lat: parseFloat(mainLocation.lat),
        lng: parseFloat(mainLocation.lng)
      }
    };
    
    try {
      setLoading(true);
      
      let res;
      if (isEdit) {
        res = await axios.put(`/api/trips/${id}`, formattedData);
      } else {
        res = await axios.post('/api/trips', formattedData);
      }
      
      // Update trip state
      if (isEdit) {
        setTripState({
          ...tripState,
          trips: tripState.trips.map(trip => 
            trip._id === res.data._id ? res.data : trip
          ),
          currentTrip: res.data
        });
      } else {
        setTripState({
          ...tripState,
          trips: [res.data, ...tripState.trips]
        });
      }
      
      setAlert(
        `Trip ${isEdit ? 'updated' : 'created'} successfully`, 
        'success'
      );
      
      setLoading(false);
      navigate(`/trips/${res.data._id}`);
    } catch (err) {
      setAlert(
        err.response?.data?.message || `Error ${isEdit ? 'updating' : 'creating'} trip`, 
        'danger'
      );
      setLoading(false);
    }
  };
  
  const handlePhotoUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image') {
      setAlert('Please upload an image file', 'danger');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlert('File size should not exceed 5MB', 'danger');
      return;
    }
    
    // Check if already have 20 photos
    if (photos.length >= 20) {
      setAlert('Maximum 20 photos allowed per trip', 'danger');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const res = await axios.post('/api/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Create new photo object
      const newPhoto = {
        title: file.name,
        description: '',
        url: res.data.url,
        location: {
          lat: mainLocation.lat,
          lng: mainLocation.lng,
          address: mainLocation.address
        },
        order: photos.length
      };
      
      // Add to photos array
      setFormData({
        ...formData,
        photos: [...photos, newPhoto]
      });
      
      setAlert('Photo uploaded successfully', 'success');
    } catch (err) {
      setAlert(
        err.response?.data?.message || 'Error uploading photo', 
        'danger'
      );
    }
  };
  
  const removePhoto = index => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    
    // Update order for remaining photos
    const reorderedPhotos = updatedPhotos.map((photo, idx) => ({
      ...photo,
      order: idx
    }));
    
    setFormData({
      ...formData,
      photos: reorderedPhotos
    });
  };
  
  if (loading && isEdit) {
    return <div>Loading...</div>;
  }
  
  return (
    <FormContainer>
      <FormTitle>{isEdit ? 'Edit Trip' : 'Add New Trip'}</FormTitle>
      
      <Form onSubmit={onSubmit}>
        <FormGroup>
          <Label htmlFor="title">Trip Title *</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="Enter a title for your trip"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            placeholder="Share details about your trip"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Main Location *</Label>
          <LocationGroup>
            <Input
              type="number"
              step="any"
              name="lat"
              value={mainLocation.lat}
              onChange={onLocationChange}
              placeholder="Latitude"
              required
            />
            <Input
              type="number"
              step="any"
              name="lng"
              value={mainLocation.lng}
              onChange={onLocationChange}
              placeholder="Longitude"
              required
            />
          </LocationGroup>
          <Input
            type="text"
            name="address"
            value={mainLocation.address}
            onChange={onLocationChange}
            placeholder="Address (optional)"
            style={{ marginTop: '10px' }}
          />
        </FormGroup>
        
        <PhotosSection>
          <PhotosHeader>Photos ({photos.length}/20)</PhotosHeader>
          
          {photos.length > 0 && (
            <PhotosList>
              {photos.map((photo, index) => (
                <PhotoItem key={index}>
                  <PhotoImage src={photo.url} alt={photo.title} />
                  <PhotoOverlay>
                    <span>Photo {index + 1}</span>
                    <DeleteButton onClick={() => removePhoto(index)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                      </svg>
                    </DeleteButton>
                  </PhotoOverlay>
                </PhotoItem>
              ))}
              
              {photos.length < 20 && (
                <UploadButton>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                  />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#6c757d"/>
                  </svg>
                  Add Photo
                </UploadButton>
              )}
            </PhotosList>
          )}
          
          {photos.length === 0 && (
            <UploadButton>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM12 17L17 12H14V8H10V12H7L12 17Z" fill="#6c757d"/>
              </svg>
              Upload Photos
            </UploadButton>
          )}
        </PhotosSection>
        
        <ButtonGroup>
          <Button 
            type="button" 
            secondary 
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Trip' : 'Create Trip')}
          </Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default TripForm;