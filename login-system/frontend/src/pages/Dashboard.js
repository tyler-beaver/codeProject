import React, { useState } from 'react';

function Dashboard() {
    // Mock job applications data
    const [jobs] = useState([
        { id: 1, company: 'Tech Corp', position: 'Frontend Developer', status: 'Applied', date: '2026-01-20' },
        { id: 2, company: 'StartupXYZ', position: 'Full Stack Engineer', status: 'Interview', date: '2026-01-18' },
        { id: 3, company: 'DataSystems', position: 'Backend Developer', status: 'Rejected', date: '2026-01-15' },
        { id: 4, company: 'WebWorks', position: 'React Developer', status: 'Offer', date: '2026-01-10' },
        { id: 5, company: 'CloudTech', position: 'DevOps Engineer', status: 'Applied', date: '2026-01-08' },
    ]);

    // Calculate statistics
    const stats = {
        applied: jobs.filter(j => j.status === 'Applied').length,
        interview: jobs.filter(j => j.status === 'Interview').length,
        offer: jobs.filter(j => j.status === 'Offer').length,
        rejected: jobs.filter(j => j.status === 'Rejected').length,
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Applied': return '#0a66c2';
            case 'Interview': return '#f5a623';
            case 'Offer': return '#27ae60';
            case 'Rejected': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const totalApplications = jobs.length;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Job Application Dashboard</h1>
                <p style={styles.subtitle}>Track your job applications and opportunities</p>
            </div>

            {/* Statistics Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{totalApplications}</div>
                    <div style={styles.statLabel}>Total Applications</div>
                </div>
                <div style={{...styles.statCard, borderLeftColor: '#0a66c2'}}>
                    <div style={styles.statNumber}>{stats.applied}</div>
                    <div style={styles.statLabel}>Applied</div>
                </div>
                <div style={{...styles.statCard, borderLeftColor: '#f5a623'}}>
                    <div style={styles.statNumber}>{stats.interview}</div>
                    <div style={styles.statLabel}>Interviews</div>
                </div>
                <div style={{...styles.statCard, borderLeftColor: '#27ae60'}}>
                    <div style={styles.statNumber}>{stats.offer}</div>
                    <div style={styles.statLabel}>Offers</div>
                </div>
            </div>

            {/* Charts and Applications */}
            <div style={styles.contentGrid}>
                {/* Pie Chart */}
                <div style={styles.chartCard}>
                    <h2 style={styles.cardTitle}>Application Status Overview</h2>
                    <div style={styles.pieChartContainer}>
                        <svg viewBox="0 0 200 200" style={styles.pieChart}>
                            {/* Applied Slice */}
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#0a66c2" strokeWidth="20" 
                                strokeDasharray={`${(stats.applied/totalApplications) * 502.65} 502.65`}
                                style={{transform: 'rotate(-90deg)', transformOrigin: '100px 100px'}} />
                            {/* Interview Slice */}
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#f5a623" strokeWidth="20"
                                strokeDasharray={`${(stats.interview/totalApplications) * 502.65} 502.65`}
                                strokeDashoffset={-((stats.applied/totalApplications) * 502.65)}
                                style={{transform: 'rotate(-90deg)', transformOrigin: '100px 100px'}} />
                            {/* Offer Slice */}
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#27ae60" strokeWidth="20"
                                strokeDasharray={`${(stats.offer/totalApplications) * 502.65} 502.65`}
                                strokeDashoffset={-(((stats.applied + stats.interview)/totalApplications) * 502.65)}
                                style={{transform: 'rotate(-90deg)', transformOrigin: '100px 100px'}} />
                            {/* Rejected Slice */}
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#e74c3c" strokeWidth="20"
                                strokeDasharray={`${(stats.rejected/totalApplications) * 502.65} 502.65`}
                                strokeDashoffset={-(((stats.applied + stats.interview + stats.offer)/totalApplications) * 502.65)}
                                style={{transform: 'rotate(-90deg)', transformOrigin: '100px 100px'}} />
                            <text x="100" y="100" textAnchor="middle" dy="0.3em" style={{fontSize: '24px', fontWeight: 'bold', fill: '#000'}}>
                                {totalApplications}
                            </text>
                        </svg>
                        <div style={styles.legendContainer}>
                            <div style={styles.legendItem}>
                                <div style={{...styles.legendColor, backgroundColor: '#0a66c2'}}></div>
                                <span>Applied ({stats.applied})</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={{...styles.legendColor, backgroundColor: '#f5a623'}}></div>
                                <span>Interview ({stats.interview})</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={{...styles.legendColor, backgroundColor: '#27ae60'}}></div>
                                <span>Offer ({stats.offer})</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={{...styles.legendColor, backgroundColor: '#e74c3c'}}></div>
                                <span>Rejected ({stats.rejected})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div style={styles.applicationsCard}>
                    <h2 style={styles.cardTitle}>Recent Applications</h2>
                    <div style={styles.applicationsList}>
                        {jobs.map((job) => (
                            <div key={job.id} style={styles.applicationItem}>
                                <div style={styles.jobInfo}>
                                    <h3 style={styles.jobPosition}>{job.position}</h3>
                                    <p style={styles.jobCompany}>{job.company}</p>
                                    <p style={styles.jobDate}>{new Date(job.date).toLocaleDateString()}</p>
                                </div>
                                <div style={{...styles.statusBadge, backgroundColor: getStatusColor(job.status)}}>
                                    {job.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: 'calc(100vh - 60px)',
        background: '#f0f2f5',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    },
    header: {
        maxWidth: '1400px',
        margin: '0 auto 40px',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#000000',
        margin: '0 0 8px 0',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#65676b',
        margin: 0,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto 40px',
    },
    statCard: {
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        borderLeft: '4px solid #e4e6eb',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#0a66c2',
        margin: '0 0 8px 0',
    },
    statLabel: {
        fontSize: '0.95rem',
        color: '#65676b',
        fontWeight: 500,
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    chartCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    applicationsCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    cardTitle: {
        fontSize: '1.3rem',
        fontWeight: 600,
        color: '#000000',
        marginBottom: '24px',
        margin: '0 0 24px 0',
    },
    pieChartContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px',
    },
    pieChart: {
        width: '200px',
        height: '200px',
        flexShrink: 0,
    },
    legendContainer: {
        flex: 1,
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
        fontSize: '0.95rem',
        color: '#000000',
    },
    legendColor: {
        width: '12px',
        height: '12px',
        borderRadius: '3px',
        flexShrink: 0,
    },
    applicationsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    applicationItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: '#f0f2f5',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    jobInfo: {
        flex: 1,
    },
    jobPosition: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#000000',
        margin: '0 0 4px 0',
    },
    jobCompany: {
        fontSize: '0.9rem',
        color: '#65676b',
        margin: '0 0 4px 0',
    },
    jobDate: {
        fontSize: '0.85rem',
        color: '#95a5a6',
        margin: 0,
    },
    statusBadge: {
        padding: '6px 14px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '0.85rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
    },
};

export default Dashboard;
