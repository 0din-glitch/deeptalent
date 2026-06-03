"use client";

import useSWR from "swr";

export type AdminMe = {
  id: string;
  email: string;
  role: "admin";
  is_super_admin: boolean;
  permissions: {
    view: boolean;
    edit: boolean;
    schedule_meetings: boolean;
    decide_applications: boolean;
    delete_directly: boolean;
    suspend_users: boolean;
    restore_users: boolean;
    approve_deletion_requests: boolean;
    view_audit_log: boolean;
  };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAdminMe() {
  const { data, error, isLoading, mutate } = useSWR<AdminMe>("/api/admin/me", fetcher, {
    revalidateOnFocus: false,
  });
  return { me: data, error, isLoading, mutate };
}
