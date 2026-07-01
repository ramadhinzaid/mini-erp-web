/**
 * Public API of the Customers module.
 *
 * Hosts (the App Router today, a micro-frontend shell tomorrow) import only
 * from here. Internal files (`components/`, `services/`, `types/`) are
 * implementation details and must not be imported directly from outside.
 */
export { CustomersView } from "./components/CustomersView";
export { CustomersSkeleton } from "./components/CustomersSkeleton";
export { CustomerForm } from "./components/CustomerForm";
export {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./services/customers.service";
export type {
  Customer,
  CustomerInput,
  CustomerListParams,
  CustomerListResult,
} from "./types";
