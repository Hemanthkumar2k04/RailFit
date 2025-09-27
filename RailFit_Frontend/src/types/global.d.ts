declare module "*lib/utils" {
  import { type ClassValue } from "clsx";
  export function cn(...inputs: ClassValue[]): string;
  export default cn;
}

// fallback for absolute @/lib/utils
declare module "@/lib/utils" {
  import { type ClassValue } from "clsx";
  export function cn(...inputs: ClassValue[]): string;
  export default cn;
}

// fallback for relative imports
declare module "../../lib/utils" {
  import { type ClassValue } from "clsx";
  export function cn(...inputs: ClassValue[]): string;
  export default cn;
}
