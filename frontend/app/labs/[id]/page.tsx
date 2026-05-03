import { notFound } from "next/navigation";
import LabClient from "./LabClient";
import { LAB_DATA } from "@/lib/labData";

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lab = LAB_DATA[id];
  if (!lab) notFound();
  return <LabClient lab={lab} />;
}