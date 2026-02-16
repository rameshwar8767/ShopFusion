import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiShield,
  FiEdit2,
  FiSave,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { updateProfile } from "../redux/slices/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "—";

  if (!user) return null;

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="card p-6 text-center">
            <div className="h-24 w-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-4xl">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600 text-sm mb-3">{user.email}</p>
            <span className="badge badge-info">{user.role}</span>

            <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <FiMail className="mr-2" /> Email verified
              </div>
              <div className="flex items-center justify-center">
                <FiShield className="mr-2" /> Account secured
              </div>
              <div className="flex items-center justify-center">
                <FiUser className="mr-2" /> Member since {memberSince}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-semibold">Account Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary btn-sm flex items-center"
                  >
                    <FiEdit2 className="mr-2" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${
                      !isEditing && "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field ${
                      !isEditing && "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                </div>

                <div>
                  <label className="label">Role</label>
                  <input
                    value={user.role}
                    disabled
                    className="input-field bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center"
                    >
                      <FiSave className="mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;