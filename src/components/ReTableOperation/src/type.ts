import type { Component } from "vue";

export interface TableOperationButton {
  label: string;
  icon?: Component;
  type?: "primary" | "success" | "warning" | "danger" | "info";
  disabled?: boolean;
  onClick?: () => void;
}
