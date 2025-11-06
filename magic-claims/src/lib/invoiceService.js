import axios from "axios";
import { api } from "./api";

// ✅ Base URL constant
const BASE_URL = "https://invoice-parser-production-4123.up.railway.app";

// -------------------- GET CUSTOMER --------------------
export async function getCustomer(customer_id) {
  const { data } = await api.get(`/api/customer/${customer_id}`);
  return data;
}

// -------------------- GET REPAIR SHOP --------------------
export async function getRepairShop(repair_shop_id) {
  const { data } = await api.get(`/api/repair-shop/${repair_shop_id}`);
  return data;
}

// -------------------- UPLOAD INVOICE PDF --------------------
// ✅ Corrected endpoint with query params for claim_id & customer_id
export async function uploadInvoicePdf({ repair_shop_id, customer_id, claim_id, file }) {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${BASE_URL}/api/repair-shop/${repair_shop_id}/invoice/upload?claim_id=${claim_id}&customer_id=${customer_id}`;

  const response = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
  });

  return response.data;
}

// -------------------- DELETE INVOICE --------------------
export async function deleteInvoiceForShop({ repair_shop_id, invoice_id }) {
  const { data } = await api.delete(`/api/invoice/${repair_shop_id}/${invoice_id}`);
  return data;
}

// -------------------- GET CLAIMS FOR REPAIR SHOP --------------------
export async function getClaimsForRepairShop(repair_shop_id) {
  const { data } = await api.get(
    `/api/repair-shops/${repair_shop_id}/claimuploadstobedone`
  );
  return data;
}
