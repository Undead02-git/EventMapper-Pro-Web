"use client";

import { MainLayout } from '@/components/main-layout';
import { floors as initialFloors, tags as initialTags } from "@/lib/initial-data";

export function ClientOnlyMainLayout() {
  return <MainLayout initialFloors={initialFloors} initialTags={initialTags} />;
}
