import { config } from "@fortawesome/fontawesome-svg-core";

/**
 * Font Awesome setup for the Next.js App Router.
 *
 * Next.js inlines critical CSS, so we disable Font Awesome's automatic
 * `<style>` injection (which causes a flash of huge icons) and import the
 * stylesheet once in the root layout instead. See `src/app/layout.tsx`.
 */
config.autoAddCss = false;

// Curated, tree-shakeable icon set. Import icons here and re-export them so
// features share one source of truth and bundles stay small.
export {
  faGaugeHigh,
  faBoxesStacked,
  faUsers,
  faFileInvoiceDollar,
  faChartLine,
  faArrowUp,
  faArrowDown,
  faBars,
  faXmark,
  faSpinner,
  faTriangleExclamation,
  faMagnifyingGlass,
  faBell,
  faPlus,
  faPenToSquare,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faEnvelope,
  faLock,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export { faGithub } from "@fortawesome/free-brands-svg-icons";
