import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faGaugeHigh,
  faUsers,
  faFileInvoiceDollar,
} from "@/lib/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconDefinition;
}

/**
 * Primary navigation. Each entry maps to a route (a future micro-frontend
 * boundary). Adding a module is as simple as appending an item here.
 */
export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: faGaugeHigh },
  { label: "Customers", href: "/customers", icon: faUsers },
  { label: "Invoices", href: "/invoices", icon: faFileInvoiceDollar },
];
