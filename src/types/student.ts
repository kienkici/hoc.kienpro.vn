export interface ProvisionStudentItem {
  email: string;
  fullName?: string;
  phone?: string;
}

export interface ProvisionResultItem {
  email: string;
  fullName?: string;
  status: "success" | "already_enrolled" | "error";
  message: string;
  isNewAccount: boolean;
  activationLink?: string;
}

export interface ProvisionBatchResult {
  success: boolean;
  total: number;
  successCount: number;
  errorCount: number;
  results: ProvisionResultItem[];
  error?: string;
}
