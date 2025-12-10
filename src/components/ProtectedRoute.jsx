import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { isAdmin } from "../services/admin";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userIsAdmin = await isAdmin(currentUser.uid);
        setAdmin(userIsAdmin);
      } else {
        setAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

