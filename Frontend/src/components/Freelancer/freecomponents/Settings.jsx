import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileExists, setProfileExists] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    hourlyRate: 0,
    skills: [],
    location: '',
    profilePicture: null,
    profilePicturePreview: null,
    phoneNumber: '',
    website: '',
    github: '',
    linkedin: ''
  });

  // Check if profile exists
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/profile/check', {
          headers: {
            'x-auth-token': token
          }
        });

        setProfileExists(response.data.success);

        if (response.data.success) {
          fetchProfileData();
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };

    checkProfile();
  }, [navigate]);

  // Fetch profile data if it exists
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('/api/profile', {
        headers: {
          'x-auth-token': token
        }
      });

      const profile = response.data;

      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        title: profile.title || '',
        bio: profile.bio || '',
        hourlyRate: profile.hourlyRate || 0,
        skills: profile.skills || [],
        location: profile.location || '',
        profilePicture: null,
        profilePicturePreview: profile.profilePicture ? `${profile.profilePicture}` : null,
        phoneNumber: profile.phoneNumber || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrorMessage('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      // Create a preview URL for the file
      const file = files[0];
      if (file) {
        setProfileData({
          ...profileData,
          profilePicture: file,
          profilePicturePreview: URL.createObjectURL(file)
        });
      }
    } else {
      setProfileData({
        ...profileData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newSkill = e.target.value.trim();
      if (!profileData.skills.includes(newSkill)) {
        setProfileData({
          ...profileData,
          skills: [...profileData.skills, newSkill]
        });
      }
      e.target.value = '';
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();

      // Add text fields to FormData
      Object.keys(profileData).forEach(key => {
        if (key === 'skills') {
          formData.append(key, profileData[key].join(','));
        } else if (key === 'profilePicture' && profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        } else if (key !== 'profilePicturePreview') {
          formData.append(key, profileData[key]);
        }
      });

      // Make the API call
      const response = await axios.post('/api/profile', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');

        // Redirect to profile page after a brief delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clean up any created object URLs when the component unmounts
    return () => {
      if (profileData.profilePicturePreview && !profileData.profilePicturePreview.startsWith('/uploads')) {
        URL.revokeObjectURL(profileData.profilePicturePreview);
      }
    };
  }, [profileData.profilePicturePreview]);

  return (
    <div className="w-full min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleProfileSubmit}>
            {/* Profile Picture */}
            <div className="mb-8">
              <label className="block mb-2 text-sm font-medium text-gray-700">Profile Picture</label>
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profileData.profilePicturePreview ? (
                      <img
                        src={profileData.profilePicturePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    name="profilePicture"
                    id="profilePicture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileChange}
                  />
                  <label
                    htmlFor="profilePicture"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                  >
                    Upload New Photo
                  </label>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF, max 5MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Professional Title</label>
                <input
                  type="text"
                  name="title"
                  value={profileData.title}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g. Full Stack Developer"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={profileData.hourlyRate}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="City, Country"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">Professional Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Tell clients about your experience, skills, and expertise"
                ></textarea>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleProfileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">GitHub Username</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                    github.com/
                  </span>
                  <input
                    type="text"
                    name="github"
                    value={profileData.github}
                    onChange={handleProfileChange}
                    className="w-full p-3 border border-gray-300 rounded-r-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">LinkedIn Username</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                    linkedin.com/in/
                  </span>
                  <input
                    type="text"
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleProfileChange}
                    className="w-full p-3 border border-gray-300 rounded-r-lg"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">Skills</label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  onKeyDown={handleSkillAdd}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Type a skill and press Enter"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 ${isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-lg font-medium flex items-center`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;