"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import type {
  AppData,
  Organization,
  OrganizationAssessment,
  ProductAssessment,
} from "@/lib/types";
import * as store from "@/lib/store";

type DataContextValue = {
  data: AppData;
  /** Set when refresh() fails (e.g. network or server error). 401 triggers redirect, so not included here. */
  organizationsLoadError: string | null;
  refresh: () => Promise<void>;
  createOrganization: (name: string) => Promise<Organization>;
  getOrganization: (id: string) => Promise<Organization | undefined>;
  getOrganizationAssessment: (orgId: string) => Promise<OrganizationAssessment | undefined>;
  saveOrganizationAssessment: (
    organizationId: string,
    partial: Parameters<typeof store.saveOrganizationAssessment>[1]
  ) => Promise<OrganizationAssessment>;
  createProductAssessment: (orgId: string, name: string) => Promise<ProductAssessment>;
  getProductAssessments: (orgId: string) => Promise<ProductAssessment[]>;
  getProductAssessment: (orgId: string, projectId: string) => Promise<ProductAssessment | undefined>;
  saveProductAssessment: (
    orgId: string,
    projectId: string,
    partial: Parameters<typeof store.saveProductAssessment>[2]
  ) => Promise<ProductAssessment | undefined>;
};

const DataContext = React.createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>({
    organizations: [],
    organizationAssessments: [],
    productAssessments: [],
  });
  const [organizationsLoadError, setOrganizationsLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setOrganizationsLoadError(null);
    try {
      const orgs = await store.listOrganizations();
      setData((prev) => ({
        ...prev,
        organizations: orgs,
      }));
    } catch (err) {
      setOrganizationsLoadError(err instanceof Error ? err.message : "Failed to load organizations");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createOrganization = useCallback(async (name: string) => {
    const org = await store.createOrganization(name);
    await refresh();
    return org;
  }, [refresh]);

  const getOrganization = useCallback((id: string) => store.getOrganization(id), []);

  const getOrganizationAssessment = useCallback(
    (orgId: string) => store.getOrganizationAssessment(orgId),
    []
  );

  const saveOrganizationAssessment = useCallback(
    (organizationId: string, partial: Parameters<typeof store.saveOrganizationAssessment>[1]) =>
      store.saveOrganizationAssessment(organizationId, partial),
    []
  );

  const createProductAssessment = useCallback(
    async (orgId: string, name: string) => store.createProductAssessment(orgId, name),
    []
  );

  const getProductAssessments = useCallback(
    (orgId: string) => store.getProductAssessments(orgId),
    []
  );

  const getProductAssessment = useCallback(
    (orgId: string, projectId: string) => store.getProductAssessment(orgId, projectId),
    []
  );

  const saveProductAssessment = useCallback(
    (
      orgId: string,
      projectId: string,
      partial: Parameters<typeof store.saveProductAssessment>[2]
    ) => store.saveProductAssessment(orgId, projectId, partial),
    []
  );

  const value: DataContextValue = {
    data,
    organizationsLoadError,
    refresh,
    createOrganization,
    getOrganization,
    getOrganizationAssessment,
    saveOrganizationAssessment,
    createProductAssessment,
    getProductAssessments,
    getProductAssessment,
    saveProductAssessment,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
