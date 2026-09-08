import type { DeliveryArea } from "@/lib/types";

// PHASE 2 INTEGRATION — not active in preview.
export const deliveryAreas: DeliveryArea[] = [
  { id: "area-south-ext", name: "South Extension", pincode: ["110049"], deliveryFee: 99, estimatedMinutes: 90, active: true },
  { id: "area-cp", name: "Connaught Place", pincode: ["110001"], deliveryFee: 99, estimatedMinutes: 75, active: true },
  { id: "area-vasant-kunj", name: "Vasant Kunj", pincode: ["110070"], deliveryFee: 129, estimatedMinutes: 100, active: true },
  { id: "area-gurgaon", name: "Gurgaon (DLF Phase 1–5)", pincode: ["122002", "122009"], deliveryFee: 149, estimatedMinutes: 120, active: true },
  { id: "area-noida", name: "Noida (Sector 15–62)", pincode: ["201301"], deliveryFee: 149, estimatedMinutes: 120, active: true },
  { id: "area-dwarka", name: "Dwarka", pincode: ["110075"], deliveryFee: 129, estimatedMinutes: 100, active: true },
  { id: "area-greater-noida", name: "Greater Noida", pincode: ["201310", "201306"], deliveryFee: 159, estimatedMinutes: 140, active: true },
  { id: "area-ghaziabad", name: "Ghaziabad", pincode: ["201001", "201010"], deliveryFee: 149, estimatedMinutes: 135, active: true },
  { id: "area-faridabad", name: "Faridabad", pincode: ["121001", "121003"], deliveryFee: 149, estimatedMinutes: 130, active: true },
];
