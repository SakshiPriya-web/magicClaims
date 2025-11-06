// src/lib/claimMediaService.js
import axios from "axios";

const BASE_URL = "https://magicclaim.up.railway.app";

/**
 * Upload multiple media files for a specific claim.
 * Each file will be linked to an existing claim record.
 *
 * @param {Object} params
 * @param {string|number} params.claim_id - Claim ID
 * @param {string} params.uploaded_by_user_id - ID of the user uploading
 * @param {File[]} params.files - Array of image/video File objects
 * @param {string[]} [params.descriptions] - Optional descriptions for each file
 *
 * @returns {Promise<Object>} Server response (usually an array or confirmation object)
 */
export async function uploadMultipleClaimMedia({
  claim_id,
  uploaded_by_user_id,
  files,
  descriptions = [],
}) {
  if (!claim_id || !uploaded_by_user_id) {
    throw new Error("Missing required parameters: claim_id or uploaded_by_user_id");
  }

  if (!files?.length) {
    throw new Error("No files provided for upload");
  }

  const formData = new FormData();
  formData.append("claim_id", claim_id);
  formData.append("uploaded_by_user_id", uploaded_by_user_id);

  // Append all files and (optionally) matching descriptions
  files.forEach((file) => formData.append("files", file));
  descriptions.forEach((desc) => formData.append("descriptions", desc));

  try {
    const response = await axios.post(`${BASE_URL}/claim_media/multiple`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
      timeout: 60000, // 60 seconds for large media
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error uploading claim media:", error.response || error.message);
    throw error;
  }
}
