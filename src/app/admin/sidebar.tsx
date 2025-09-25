import styles from "./admin.module.css";

export default function AdminSidebar({ section, setSection }: { section: string, setSection: (s: string) => void }) {
  return (
    <nav className={styles.sidebar}>
      <button className={section === "events" ? styles.activeNav : styles.nav} onClick={() => setSection("events")}>Events</button>
      <button className={section === "pending" ? styles.activeNav : styles.nav} onClick={() => setSection("pending")}>Pending Requests</button>
      <button className={section === "approved" ? styles.activeNav : styles.nav} onClick={() => setSection("approved")}>Approved Registrations</button>
      <button className={section === "pdf" ? styles.activeNav : styles.nav} onClick={() => setSection("pdf")}>PDF Downloads</button>
    </nav>
  );
}
