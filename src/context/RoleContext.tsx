"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: "ROLE_SUPERADMIN" | "ROLE_MANAGER" | "ROLE_STAFF" | "ROLE_CLIENT";
  department: string;
  position: string;
}

export const PRESET_USERS: DemoUser[] = [
  {
    id: "u-admin-01",
    name: "Alexander Hartono (Owner)",
    email: "alexander.owner@teamos.internal",
    role: "ROLE_SUPERADMIN",
    department: "Executive Management",
    position: "Chief Executive Officer / Business Owner",
  },
  {
    id: "u-mgr-01",
    name: "Sarah Wijaya (Engineering Lead)",
    email: "sarah.lead@teamos.internal",
    role: "ROLE_MANAGER",
    department: "Engineering",
    position: "VP of Engineering",
  },
  {
    id: "u-staff-01",
    name: "Budi Pratama (Senior Backend)",
    email: "budi.pratama@teamos.internal",
    role: "ROLE_STAFF",
    department: "Engineering",
    position: "Senior Backend Specialist",
  },
  {
    id: "u-staff-02",
    name: "Siti Aminah (Frontend Engineer)",
    email: "siti.aminah@teamos.internal",
    role: "ROLE_STAFF",
    department: "Engineering",
    position: "Frontend Engineer",
  },
  {
    id: "u-staff-05",
    name: "Hendra Wijaya (Resigning Staff)",
    email: "hendra.wijaya@teamos.internal",
    role: "ROLE_STAFF",
    department: "Operations",
    position: "Lead Cloud Infrastructure Engineer",
  },
  {
    id: "u-client-01",
    name: "Bambang Sudiro (Enterprise Client)",
    email: "bambang.klien@mitra-korporat.com",
    role: "ROLE_CLIENT",
    department: "External",
    position: "Enterprise Client Representative",
  },
];

interface RoleContextType {
  currentUser: DemoUser;
  setCurrentUser: (user: DemoUser) => void;
  users: DemoUser[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<DemoUser>(PRESET_USERS[0]);

  useEffect(() => {
    const saved = localStorage.getItem("teamos_current_user_id");
    if (saved) {
      const found = PRESET_USERS.find((u) => u.id === saved);
      if (found) setCurrentUserState(found);
    }
  }, []);

  const setCurrentUser = (user: DemoUser) => {
    setCurrentUserState(user);
    localStorage.setItem("teamos_current_user_id", user.id);
  };

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser, users: PRESET_USERS }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
