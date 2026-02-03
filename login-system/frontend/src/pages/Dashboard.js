import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function Dashboard() {
  const [noteJobId, setNoteJobId] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [editJobId, setEditJobId] = useState(null);
  const [editForm, setEditForm] = useState({
    company: "",
    position: "",
    status: "Applied",
    salary: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const handleDelete = async (id) => {
    setDeleteJobId(id);
  };

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    }
    getUser();
  }, []);

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
        setJobs(
          (data || []).map((app) => ({
            id: app.id,
            company: app.name,
            position: app.description || "",
            status: app.status || "Applied",
            date: app.created_at ? app.created_at.split("T")[0] : "",
            salary: app.salary || "",
            note: app.note || "",
          })),
        );
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

  const successPercentage = Math.round(
    ((stats.offer + stats.interview) / stats.total) * 100,
  );
  const rejectionRate = Math.round((stats.rejected / stats.total) * 100);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Your Applications</h1>
          <p style={styles.subtitle}>Track and manage your job opportunities</p>
        </div>
        <button
          style={styles.addButton}
          onClick={() => setShowAddForm(!showAddForm)}
          onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
        >
          + Add Application
        </button>
      </div>

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
            <div style={styles.insight}>
              <div style={styles.insightTitle}>Action</div>
              <div style={styles.insightValue}>→</div>
              <div style={styles.insightDesc}>Follow up on pending</div>
            </div>
          </div>
        </div>
      </div>

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
                      onClick={(e) => e.stopPropagation()}
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
  });
  const [submitting, setSubmitting] = useState(false);
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
    maxWidth: "500px",
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
};

export default Dashboard;
