import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function Dashboard() {

    const [showPendingModal, setShowPendingModal] = useState(false);
  const [noteJobId, setNoteJobId] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [userId, setUserId] = useState(null);
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [editJobId, setEditJobId] = useState(null);
  const [editForm, setEditForm] = useState({
    company: "",
    position: "",
    status: "Applied",
    salary: "",
    interview_date: "",
    interview_time: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobModalData, setJobModalData] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayISO, setSelectedDayISO] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const handleDelete = async (id) => {
    setDeleteJobId(id);
  };

  useEffect(() => {
    async function getUser() {
      if (data?.user) setUserId(data.user.id);
    }
    getUser();
  }, []);

  const syncEmails = async () => {
    if (!userId) return;
    try {
      setSyncing(true);
      const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
      const resp = await fetch(`${backend}/api/email/sync?userId=${encodeURIComponent(userId)}`, { method: "POST" });
      const data = await resp.json();
      setLastSync({
        processed: data.processed || 0,
        total: data.total || 0,
        created: data.created || 0,
        updated: data.updated || 0,
      });
      // Trigger a refresh of jobs
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
        setJobs(refreshed.map((app) => ({
          id: app.id,
          company: app.name,
          position: app.description || "",
          status: app.status || "Applied",
          date: app.created_at ? app.created_at.split("T")[0] : "",
          salary: app.salary || "",
          note: app.note || "",
          interview_date: app.interview_date || "",
          interview_time: app.interview_time || "",
        })));
      }
    } catch (e) {
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    async function fetchJobs() {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) setJobs([]);
      else
        setJobs((data || []).map((app) => ({
          id: app.id,
          company: app.name,
          position: app.description || "",
          status: app.status || "Applied",
          date: app.created_at ? app.created_at.split("T")[0] : "",
          salary: app.salary || "",
          note: app.note || "",
          interview_date: app.interview_date || "",
          interview_time: app.interview_time || "",
        })));
      setLoading(false);
    }
    fetchJobs();
  }, [showAddForm, userId]);

  // Calculate statistics
  const stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === "Applied").length,
    interview: jobs.filter((j) => j.status === "Interview").length,
    offer: jobs.filter((j) => j.status === "Offer").length,
    rejected: jobs.filter((j) => j.status === "Rejected").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "#3b82f6";
      case "Interview":
        return "#f59e0b";
      case "Offer":
        return "#10b981";
      case "Rejected":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "Applied":
        return "#dbeafe";
      case "Interview":
        return "#fef3c7";
      case "Offer":
        return "#d1fae5";
      case "Rejected":
        return "#fee2e2";
      default:
        return "#f1f5f9";
    }
  };

  const confirmDelete = async () => {
    if (!deleteJobId) return;
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", deleteJobId);
    if (!error) {
      setJobs((jobs) => jobs.filter((j) => j.id !== deleteJobId));
    } else {
      alert("Failed to delete application: " + error.message);
    }
    setDeleteJobId(null);
  };
  const cancelDelete = () => setDeleteJobId(null);

  const successPercentage = Math.round(((stats.offer + stats.interview) / stats.total) * 100);
  const rejectionRate = Math.round((stats.rejected / stats.total) * 100);

  // Interview events derived from jobs
  const interviewEvents = Array.isArray(jobs)
    ? jobs
        .filter((j) => j && j.interview_date)
        .map((j) => ({
          date: j.interview_date,
          time: j.interview_time,
          company: j.company,
          position: j.position,
        }))
    : [];

  // Calendar helpers for current month view
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const calFirstDayIdx = new Date(calYear, calMonth, 1).getDay();
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells = Array.from(
    { length: calFirstDayIdx + calDaysInMonth },
    (_, i) => (i < calFirstDayIdx ? null : i - calFirstDayIdx + 1)
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Your Applications</h1>
          <p style={styles.subtitle}>Track and manage your job opportunities</p>
          {lastSync && (
            <div style={{ marginTop: 8, color: lastSync.processed > 0 ? "#16a34a" : "#64748b", fontWeight: 600 }}>
              Synced {lastSync.total} emails — created {lastSync.created}, updated {lastSync.updated}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={styles.addButton}
            onClick={() => setShowAddForm(!showAddForm)}
            onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            + Add Application
          </button>
          <button
            style={styles.addButton}
            onClick={() => setShowCalendarModal(true)}
            onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            📅 Calendar
          </button>
          <button
            style={styles.addButton}
            onClick={syncEmails}
            disabled={syncing}
            onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
          >
            {syncing ? "Syncing..." : "Sync Job Emails"}
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div style={styles.formOverlay} onClick={() => { setShowCalendarModal(false); setSelectedDayISO(null); }}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.formHeader}>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>Interview Calendar</h2>
              <button style={styles.closeBtn} onClick={() => { setShowCalendarModal(false); setSelectedDayISO(null); }}>✕</button>
            </div>
            <div style={styles.form}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <button
                  type="button"
                  style={styles.calendarNavBtn}
                  onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))}
                >
                  ← Prev
                </button>
                <div style={styles.calendarMonthLabel}>
                  {calendarDate.toLocaleString("default", { month: "long" })} {calYear}
                </div>
                <button
                  type="button"
                  style={styles.calendarNavBtn}
                  onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))}
                >
                  Next →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {calCells.map((day, idx) => {
                  const cellDate = day ? new Date(calYear, calMonth, day) : null;
                  const iso = cellDate ? cellDate.toISOString().split("T")[0] : null;
                  const events = iso ? interviewEvents.filter((ev) => ev.date === iso) : [];
                  const cellStyle = {
                    ...styles.calendarDayCell,
                    ...(events.length ? styles.calendarDayCellHasInterview : {}),
                    cursor: cellDate ? "pointer" : "default",
                  };
                  return (
                    <div
                      key={idx}
                      style={cellStyle}
                      onClick={() => {
                        if (iso) setSelectedDayISO(iso);
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{day || ""}</div>
                      {events.slice(0, 2).map((ev, i) => (
                        <div key={i} style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>
                          {ev.time ? `${ev.time} ` : ""}{ev.company}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>+{events.length - 2} more</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedDayISO && (
                <div style={{ marginTop: 16 }}>
                  <strong>Interviews on {selectedDayISO}:</strong>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {interviewEvents.filter((ev) => ev.date === selectedDayISO).length === 0 && (
                      <li style={{ color: "#64748b", fontSize: "1.3rem" }}>No interviews scheduled.</li>
                    )}
                    {interviewEvents
                      .filter((ev) => ev.date === selectedDayISO)
                      .map((ev, idx) => (
                        <li key={idx} style={{ fontSize: "1.3rem", color: "#0f172a", marginTop: 2 }}>
                          {ev.time ? <span style={{ color: "#2563eb" }}>{ev.time}</span> : null} {ev.company} <span style={{ color: "#64748b" }}>{ev.position}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Add Form */}
      {showAddForm && (
        <JobForm
          onClose={() => setShowAddForm(false)}
          onAdd={(job) => setJobs((jobs) => [job, ...jobs])}
          userId={userId}
        />
      )}

      {/* Key Metrics Cards */}
      <div style={styles.metricsGrid}>
        <div
          style={styles.metricCard}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-4px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <div style={styles.metricIcon}>📋</div>
          <div>
            <div style={styles.metricValue}>{stats.total}</div>
            <div style={styles.metricLabel}>Total Applied</div>
          </div>
        </div>

        <div
          style={styles.metricCard}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-4px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <div style={styles.metricIcon}>🚀</div>
          <div>
            <div style={styles.metricValue}>{successPercentage}%</div>
            <div style={styles.metricLabel}>Success Rate</div>
          </div>
        </div>

        <div
          style={styles.metricCard}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-4px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <div style={styles.metricIcon}>💬</div>
          <div>
            <div style={styles.metricValue}>{stats.interview}</div>
            <div style={styles.metricLabel}>Interviews</div>
          </div>
        </div>

        <div
          style={styles.metricCard}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-4px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <div style={styles.metricIcon}>✨</div>
          <div>
            <div style={styles.metricValue}>{stats.offer}</div>
            <div style={styles.metricLabel}>Offers</div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div style={styles.analyticsGrid}>
        {/* Status Distribution Chart */}
        <div style={styles.chartCard}>
          <h2 style={styles.cardTitle}>Status Overview</h2>
          <div style={styles.distributionContainer}>
            <div style={styles.distributionBar}>
              <div
                style={{
                  ...styles.distributionSegment,
                  width: `${(stats.applied / stats.total) * 100}%`,
                  backgroundColor: "#3b82f6",
                }}
                title={`Applied: ${stats.applied}`}
              ></div>
              <div
                style={{
                  ...styles.distributionSegment,
                  width: `${(stats.interview / stats.total) * 100}%`,
                  backgroundColor: "#f59e0b",
                }}
                title={`Interview: ${stats.interview}`}
              ></div>
              <div
                style={{
                  ...styles.distributionSegment,
                  width: `${(stats.offer / stats.total) * 100}%`,
                  backgroundColor: "#10b981",
                }}
                title={`Offer: ${stats.offer}`}
              ></div>
              <div
                style={{
                  ...styles.distributionSegment,
                  width: `${(stats.rejected / stats.total) * 100}%`,
                  backgroundColor: "#ef4444",
                }}
                title={`Rejected: ${stats.rejected}`}
              ></div>
            </div>
            <div style={styles.legendGrid}>
              <div style={styles.legendItem}>
                <div
                  style={{ ...styles.legendDot, backgroundColor: "#3b82f6" }}
                ></div>
                <span>Applied ({stats.applied})</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{ ...styles.legendDot, backgroundColor: "#f59e0b" }}
                ></div>
                <span>Interview ({stats.interview})</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{ ...styles.legendDot, backgroundColor: "#10b981" }}
                ></div>
                <span>Offer ({stats.offer})</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{ ...styles.legendDot, backgroundColor: "#ef4444" }}
                ></div>
                <span>Rejected ({stats.rejected})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Card */}
        <div style={styles.chartCard}>
          <h2 style={styles.cardTitle}>Quick Stats</h2>
          <div style={styles.insightsContainer}>
            <div style={styles.insight}>
              <div style={styles.insightTitle}>Progress</div>
              <div style={styles.insightValue}>{successPercentage}%</div>
              <div style={styles.insightDesc}>In progress or accepted</div>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.insight}>
              <div style={styles.insightTitle}>Rejection</div>
              <div style={styles.insightValue}>{rejectionRate}%</div>
              <div style={styles.insightDesc}>Keep applying & learning</div>
            </div>
            <div style={styles.divider}></div>
            <div
              style={{
                ...styles.insight,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
              }}
              onClick={() => setShowPendingModal(true)}
              tabIndex={0}
              role="button"
              aria-label="Show pending applications"
            >
              <div style={styles.insightTitle}>Action</div>
              <div style={styles.insightValue}>→</div>
              <div style={styles.insightDesc}>Follow up on pending</div>
            </div>
                {showPendingModal && (
                  <div style={styles.formOverlay} onClick={e => e.stopPropagation()}>
                    <div style={styles.formContainer}>
                      <div style={styles.formHeader}>
                        <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a'}}>Pending Applications</h2>
                        <button style={styles.closeBtn} onClick={() => setShowPendingModal(false)}>✕</button>
                      </div>
                      <div style={styles.form}>
                        {jobs.filter(j => j.status === 'Applied').length === 0 ? (
                          <div style={{color: '#64748b', fontSize: '1rem', textAlign: 'center'}}>No pending applications to follow up!</div>
                        ) : (
                          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                            {jobs.filter(j => j.status === 'Applied').map(job => (
                              <li key={job.id} style={{marginBottom: 18, background: '#f1f5f9', borderRadius: 8, padding: '14px 18px', color: '#334155', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
                                <div style={{fontWeight: 700, fontSize: '1.08rem'}}>{job.company}</div>
                                <div style={{fontSize: '0.98rem', marginBottom: 6}}>{job.position}</div>
                                <div style={{fontSize: '0.92rem', color: '#64748b'}}>Applied: {job.date}</div>
                                {/* Future: Add a 'Send Follow-up' button here */}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
          </div>
        </div>
      </div>

      {/* View Job Modal */}
      {showJobModal && jobModalData && (
        <div style={styles.formOverlay} onClick={() => { setShowJobModal(false); setJobModalData(null); }}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.formHeader}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Job Posting</h2>
              <button style={styles.closeBtn} onClick={() => { setShowJobModal(false); setJobModalData(null); }}>✕</button>
            </div>
            <div style={styles.form}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{jobModalData.company}</div>
                <div style={{ fontSize: '0.95rem', color: '#64748b' }}>{jobModalData.position}</div>
              </div>
              <p style={{ margin: '0 0 8px 0' }}><strong>Status:</strong> {jobModalData.status}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>Applied:</strong> {jobModalData.date}</p>
              {jobModalData.interview_date && (
                <p style={{ margin: '0 0 8px 0' }}><strong>Interview Date:</strong> {jobModalData.interview_date}</p>
              )}
              {jobModalData.interview_time && (
                <p style={{ margin: '0 0 8px 0' }}><strong>Interview Time:</strong> {jobModalData.interview_time}</p>
              )}
              {jobModalData.salary && (
                <p style={{ margin: '0 0 8px 0' }}><strong>Salary:</strong> {jobModalData.salary}</p>
              )}
              <div style={{ marginTop: 12, color: '#64748b', fontStyle: 'italic' }}>Coming soon: Full job posting details and actions.</div>
              <div style={styles.formButtons}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => { setShowJobModal(false); setJobModalData(null); }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Jobs List */}
      <div style={styles.jobsSection}>
        <h2 style={styles.sectionTitle}>All Applications ({stats.total})</h2>
        <div style={styles.jobsList}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                ...styles.jobCard,
                borderLeftColor: getStatusColor(job.status),
              }}
              onClick={() => {
                if (expandedJob === job.id) {
                  setExpandedJob(null);
                  setNoteJobId(null);
                } else {
                  setExpandedJob(job.id);
                }
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(0, 0, 0, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.06)")
              }
            >
              <div style={styles.jobCardTop}>
                <div style={styles.jobInfo}>
                  <h3 style={styles.jobCompany}>{job.company}</h3>
                  <p style={styles.jobPosition}>{job.position}</p>
                  <p style={styles.jobDate}>Applied: {job.date}</p>
                </div>
                <div style={styles.jobMeta}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusBgColor(job.status),
                      color: getStatusColor(job.status),
                    }}
                  >
                    {job.status}
                  </span>
                  <span style={styles.salary}>{job.salary}</span>
                </div>
              </div>

              {expandedJob === job.id && (
                <div style={styles.jobCardExpanded}>
                  <div style={styles.actionButtons}>
                    <button
                      style={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditJobId(job.id);
                        setEditForm({
                          company: job.company,
                          position: job.position,
                          status: job.status,
                          salary: job.salary,
                          interview_date: job.interview_date || "",
                          interview_time: job.interview_time || "",
                        });
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (noteJobId !== job.id) {
                          setNoteJobId(job.id);
                          setNoteInput(job.note || "");
                        }
                      }}
                    >
                      💬 Add Note
                    </button>
                    <button
                      style={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setJobModalData(job);
                        setShowJobModal(true);
                      }}
                    >
                      🔗 View Job
                    </button>
                    <button
                      style={{ ...styles.actionBtn, color: "#ef4444" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(job.id);
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {/* --- Interview Date/Time --- */}
                  {(job.interview_date || job.interview_time) && (
                    <div
                      style={{
                        marginTop: 12,
                        background: "#f1f5f9",
                        borderRadius: 8,
                        padding: "10px 16px",
                        color: "#334155",
                        fontSize: "0.98rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {job.interview_date && (
                        <span><strong>Interview Date:</strong> {job.interview_date}</span>
                      )}
                      {job.interview_time && (
                        <span><strong>Interview Time:</strong> {job.interview_time}</span>
                      )}
                    </div>
                  )}
                  {/* --- Note displayed below buttons --- */}
                  {job.note && (
                    <div
                      style={{
                        marginTop: 12,
                        background: "#f1f5f9",
                        borderRadius: 8,
                        padding: "10px 16px",
                        color: "#334155",
                        fontSize: "0.98rem",
                      }}
                    >
                      <strong>Note:</strong> {job.note}
                    </div>
                  )}

                  {/* Add Note Form */}
                  {noteJobId && (
                    <div
                      style={styles.formOverlay}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={styles.formContainer}>
                        <div style={styles.formHeader}>
                          <h2
                            style={{
                              margin: 0,
                              fontSize: "1.5rem",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            Add Note
                          </h2>
                          <button
                            style={styles.closeBtn}
                            onClick={() => setNoteJobId(null)}
                          >
                            ✕
                          </button>
                        </div>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setNoteLoading(true);
                            const { error } = await supabase
                              .from("applications")
                              .update({ note: noteInput })
                              .eq("id", noteJobId);
                            setNoteLoading(false);
                            if (!error) {
                              setJobs((jobs) =>
                                jobs.map((j) =>
                                  j.id === noteJobId
                                    ? { ...j, note: noteInput }
                                    : j,
                                ),
                              );
                              setNoteJobId(null);
                            } else {
                              alert("Error saving note");
                            }
                          }}
                          style={styles.form}
                        >
                          <div style={styles.formGroup}>
                            <label
                              style={{ fontWeight: 700, color: "#0f172a" }}
                            >
                              Note
                            </label>
                            <textarea
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Type your note here..."
                              style={{
                                ...styles.input,
                                minHeight: 80,
                                resize: "vertical",
                              }}
                              disabled={noteLoading}
                            />
                          </div>
                          <div style={styles.formButtons}>
                            <button
                              type="submit"
                              style={styles.submitBtn}
                              disabled={noteLoading}
                            >
                              {noteLoading ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoteJobId(null)}
                              style={styles.cancelBtn}
                              disabled={noteLoading}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Edit Application Modal */}
        {editJobId && (
          <div style={styles.formOverlay}>
            <div style={styles.formContainer}>
              <div style={styles.formHeader}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Edit Application
                </h2>
                <button
                  style={styles.closeBtn}
                  onClick={() => setEditJobId(null)}
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditLoading(true);
                  const { error } = await supabase
                    .from("applications")
                    .update({
                      name: editForm.company,
                      description: editForm.position,
                      status: editForm.status,
                      salary: editForm.salary,
                      interview_date: editForm.interview_date || null,
                      interview_time: editForm.interview_time || null,
                    })
                    .eq("id", editJobId);
                  setEditLoading(false);
                  if (!error) {
                    setJobs((jobs) =>
                      jobs.map((j) =>
                        j.id === editJobId
                          ? {
                              ...j,
                              company: editForm.company,
                              position: editForm.position,
                              status: editForm.status,
                              salary: editForm.salary,
                              interview_date: editForm.interview_date,
                              interview_time: editForm.interview_time,
                            }
                          : j,
                      ),
                    );
                    setEditJobId(null);
                  } else {
                    alert("Error updating application");
                  }
                }}
                style={styles.form}
              >
                <div style={styles.formGroup}>
                  <label style={{ fontWeight: 700, color: "#0f172a" }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, company: e.target.value }))
                    }
                    placeholder="Company Name"
                    style={styles.input}
                    required
                    disabled={editLoading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={{ fontWeight: 700, color: "#0f172a" }}>
                    Position *
                  </label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, position: e.target.value }))
                    }
                    placeholder="Position"
                    style={styles.input}
                    required
                    disabled={editLoading}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={{ fontWeight: 700, color: "#0f172a" }}>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, status: e.target.value }))
                    }
                    style={styles.input}
                    disabled={editLoading}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={{ fontWeight: 700, color: "#0f172a" }}>
                    Salary
                  </label>
                  <input
                    type="text"
                    value={editForm.salary}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, salary: e.target.value }))
                    }
                    placeholder="Salary"
                    style={styles.input}
                    disabled={editLoading}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={{ fontWeight: 700, color: "#0f172a" }}>
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={editForm.interview_date}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, interview_date: e.target.value }))
                    }
                    style={styles.input}
                    disabled={editLoading}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={{ fontWeight: 700, color: "#0f172a" }}>
                    Interview Time
                  </label>
                  <input
                    type="time"
                    value={editForm.interview_time}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, interview_time: e.target.value }))
                    }
                    style={styles.input}
                    disabled={editLoading}
                  />
                </div>
                <div style={styles.formButtons}>
                  <button
                    type="submit"
                    style={styles.submitBtn}
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditJobId(null)}
                    style={styles.cancelBtn}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {deleteJobId && (
          <div style={styles.formOverlay}>
            <div style={styles.formContainer}>
              <div style={styles.formHeader}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#ef4444",
                  }}
                >
                  Delete Application
                </h2>
                <button style={styles.closeBtn} onClick={cancelDelete}>
                  ✕
                </button>
              </div>
              <div style={styles.form}>
                <p style={{ color: "#475569", marginBottom: 24 }}>
                  Are you sure you want to delete this application? This action
                  cannot be undone.
                </p>
                <div style={styles.formButtons}>
                  <button
                    onClick={confirmDelete}
                    style={{
                      ...styles.submitBtn,
                      background:
                        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    }}
                  >
                    Delete
                  </button>
                  <button onClick={cancelDelete} style={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JobForm({ onClose, onAdd, userId }) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "Applied",
    salary: "",
    interview_date: "",
    interview_time: "",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (!userId) {
      alert("User not found. Please log in.");
      setSubmitting(false);
      return;
    }
    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          user_id: userId,
          name: formData.company,
          description: formData.position,
          status: formData.status,
          salary: formData.salary,
          interview_date: formData.interview_date || null,
          interview_time: formData.interview_time || null,
        },
      ])
      .select();
    if (error) {
      alert("Failed to add application: " + error.message);
    } else if (data && data[0]) {
      onAdd({
        id: data[0].id,
        company: data[0].name,
        position: data[0].description || "",
        status: data[0].status || "Applied",
        date: data[0].created_at ? data[0].created_at.split("T")[0] : "",
        salary: data[0].salary || "",
        interview_date: data[0].interview_date || "",
        interview_time: data[0].interview_time || "",
      });
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div style={styles.formOverlay}>
      <div style={styles.formContainer}>
        <div style={styles.formHeader}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Add New Application
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., Tech Corp"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>
              Position *
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Senior Frontend Developer"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>
              Salary Range
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $120k-140k"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>
              Interview Date
            </label>
            <input
              type="date"
              name="interview_date"
              value={formData.interview_date}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>
              Interview Time
            </label>
            <input
              type="time"
              name="interview_time"
              value={formData.interview_time}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formButtons}>
            <button
              type="submit"
              style={styles.submitBtn}
              onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
              onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
            >
              Create Application
            </button>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={onClose}
              onMouseEnter={(e) => (e.target.style.background = "#e2e8f0")}
              onMouseLeave={(e) => (e.target.style.background = "#f1f5f9")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f8fafc",
    minHeight: "calc(100vh - 64px)",
    padding: "40px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: 0,
  },
  subtitle: {
    fontSize: "1rem",
    color: "#64748b",
    margin: "8px 0 0 0",
  },
  addButton: {
    padding: "12px 28px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  metricCard: {
    background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
    padding: "24px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  metricIcon: {
    fontSize: "2.5rem",
  },
  metricValue: {
    fontSize: "2rem",
    fontWeight: 900,
    background: "linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  metricLabel: {
    fontSize: "0.9rem",
    color: "#64748b",
    marginTop: "4px",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  chartCard: {
    background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    marginBottom: "24px",
    color: "#0f172a",
  },
  distributionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  distributionBar: {
    display: "flex",
    height: "24px",
    borderRadius: "8px",
    overflow: "hidden",
    gap: "2px",
  },
  distributionSegment: {
    height: "100%",
    transition: "all 0.3s ease",
  },
  legendGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
    color: "#475569",
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  insightsContainer: {
    display: "flex",
    justifyContent: "space-around",
    gap: "20px",
  },
  insight: {
    flex: 1,
    textAlign: "center",
  },
  insightTitle: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: "8px",
    letterSpacing: "0.5px",
  },
  insightValue: {
    fontSize: "2.2rem",
    fontWeight: 900,
    background: "linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },
  insightDesc: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  divider: {
    width: "1px",
    backgroundColor: "#e2e8f0",
  },
  jobsSection: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: "20px",
    color: "#0f172a",
  },
  jobsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  jobCard: {
    background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
    borderLeftWidth: "4px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  jobCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jobInfo: {
    flex: 1,
  },
  jobCompany: {
    fontSize: "1.2rem",
    fontWeight: 700,
    margin: 0,
    color: "#0f172a",
  },
  jobPosition: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: "4px 0",
  },
  jobDate: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  jobMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 700,
    border: "1px solid currentColor",
  },
  salary: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#10b981",
  },
  jobCardExpanded: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  actionBtn: {
    padding: "8px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: "#475569",
  },
  formOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  formContainer: {
    background: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "720px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e2e8f0",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#64748b",
    fontWeight: 700,
  },
  form: {
    padding: "24px",
  },
  formGroup: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.95rem",
    marginTop: "8px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.3s ease",
  },
  formButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },
  submitBtn: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  calendarNavBtn: {
    padding: "6px 10px",
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  calendarMonthLabel: {
    fontWeight: 700,
    color: "#0f172a",
    padding: "4px 12px",
    margin: "0 8px",
    borderRadius: "6px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  calendarDayCell: {
    minHeight: 80,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 8,
  },
  calendarDayCellHasInterview: {
    background: "#f0f9ff",
    borderColor: "#93c5fd",
    boxShadow: "0 0 0 2px rgba(59,130,246,0.25)",
  },
};

export default Dashboard;
