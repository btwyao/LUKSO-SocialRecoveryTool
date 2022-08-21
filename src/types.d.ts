export interface Errors {
  search?: string;
  amount?: string;
}

export interface Notification {
  message?: string;
  type?: string;
}

export type NotificationType = "primary" | "danger" | "info" | "warning";

export type Channel = "browserExtension" | "walletConnect";

export type AddressType =
  | "externallyOwnedAccounts"
  | "universalProfile"
  | "otherContactAccount";
