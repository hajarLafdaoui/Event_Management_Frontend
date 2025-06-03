import React from 'react';

const UserShow = ({ user, onBack }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">User Details</h2>
        <button 
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          Back to List
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Profile Image */}
        <div className="flex flex-col items-center md:items-start">
          {user.profile_picture ? (
            <div className="mb-4">
              <img
                src={user.profile_picture}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-32 h-32 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  e.target.className = 'hidden';
                }}
              />
              <div className="mt-2 text-center">
                <a 
                  href={user.profile_picture} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  View Full Image
                </a>
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 mb-4">
              <span className="text-2xl font-medium text-gray-600">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">{user.first_name} {user.last_name}</h3>
            <p className="text-gray-600 capitalize">{user.role}</p>
            <p className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${
              user.deleted_at ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {user.deleted_at ? 'Inactive' : 'Active'}
            </p>
          </div>
        </div>

        {/* Right Column - User Details */}
        <div className="flex-1 space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><span className="font-medium">ID:</span> {user.id}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Email Verified:</span> 
                <span className={user.is_email_verified ? 'text-green-500' : 'text-red-500'}>
                  {user.is_email_verified ? ' Yes' : ' No'}
                </span>
              </p>
              <p><span className="font-medium">Last Login:</span> 
                {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><span className="font-medium">Phone:</span> {user.phone || 'N/A'}</p>
              <p><span className="font-medium">Gender:</span> {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}</p>
              <p className="md:col-span-2"><span className="font-medium">Address:</span> {user.address || 'N/A'}</p>
              <p><span className="font-medium">City:</span> {user.city || 'N/A'}</p>
              <p><span className="font-medium">Country:</span> {user.country || 'N/A'}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Social Links</h3>
            <div className="space-y-1">
              {user.facebook_url && (
                <p>
                  <span className="font-medium">Facebook:</span>{' '}
                  <a href={user.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                    {user.facebook_url}
                  </a>
                </p>
              )}
              {user.instagram_url && (
                <p>
                  <span className="font-medium">Instagram:</span>{' '}
                  <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                    {user.instagram_url}
                  </a>
                </p>
              )}
              {user.tiktok_url && (
                <p>
                  <span className="font-medium">TikTok:</span>{' '}
                  <a href={user.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                    {user.tiktok_url}
                  </a>
                </p>
              )}
              {!user.facebook_url && !user.instagram_url && !user.tiktok_url && (
                <p className="text-gray-500">No social links available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserShow;