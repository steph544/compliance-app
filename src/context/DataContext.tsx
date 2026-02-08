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
  createOrganization: (name: string) => Organization;
  getOrganization: (id: string) => Organization | undefined;
  getOrganizationAssessment: (orgId: string) => OrganizationAssessment | undefined;
  saveOrganizationAssessment: typeof store.saveOrganizationAssessment;
  createProductAssessment: (orgId: string, name: string) => ProductAssessment;
  getProductAssessments: (orgId: string) => ProductAssessment[];
  getProductAssessment: (id: string) => ProductAssessment | undefined;
  saveProductAssessment: typeof store.saveProductAssessment;
  refresh: () => void;
};

const DataContext = React.createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>({
    organizations: [],
    organizationAssessments: [],
    productAssessments: [],
  });

  const refresh = useCallback(() => {
    setData(store.load());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createOrganization = useCallback((name: string) => {
    const org = store.createOrganization(name);
    setData(store.load());
    return org;
  }, []);

  const saveOrganizationAssessment = useCallback(
    (organizationId: string, partial: Parameters<typeof store.saveOrganizationAssessment>[1]) => {
      const result = store.saveOrganizationAssessment(organizationId, partial);
      setData(store.load());
      return result;
    },
    []
  );

  const createProductAssessment = useCallback((orgId: string, name: string) => {
    const assessment = store.createProductAssessment(orgId, name);
    setData(store.load());
    return assessment;
  }, []);

  const saveProductAssessment = useCallback(
    (assessmentId: string, partial: Parameters<typeof store.saveProductAssessment>[1]) => {
      const result = store.saveProductAssessment(assessmentId, partial);
      setData(store.load());
      return result;
    },
    []
  );

  const value: DataContextValue = {
    data,
    createOrganization,
    getOrganization: (id) => data.organizations.find((o) => o.id === id),
    getOrganizationAssessment: (orgId) =>
      data.organizationAssessments.find((a) => a.organizationId === orgId),
    saveOrganizationAssessment,
    createProductAssessment,
    getProductAssessments: (orgId) => data.productAssessments.filter((a) => a.organizationId === orgId),
    getProductAssessment: (id) => data.productAssessments.find((a) => a.id === id),
    saveProductAssessment,
    refresh,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
