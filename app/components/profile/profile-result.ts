export interface ProfileActionResult {
  success: boolean;
  action: "savePublicData" | "uploadPhoto" | "removePhoto";
  message?: string;
  error?: string;
  fieldErrors?: { name?: string; username?: string };
}
