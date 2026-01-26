import React, { useState } from 'react';

function Home() {
    const [hoveredCard, setHoveredCard] = useState(null);

    const features = [
        { id: 1, icon: '🔐', title: 'Secure', description: 'Enterprise-grade security for your data' },
        { id: 2, icon: '⚡', title: 'Fast', description: 'Lightning-quick performance and response times' },
        { id: 3, icon: '🌍', title: 'Global', description: 'Connect with users worldwide instantly' },
        { id: 4, icon: '📊', title: 'Analytics', description: 'Real-time insights and detailed reporting' },
    ];

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroContent}>
                    <h1 style={styles.mainTitle}>Welcome to Your Platform</h1>
                    <p style={styles.heroSubtitle}>
                        Connect, create, and collaborate with a modern platform built for the future
                    </p>
                    <button style={styles.primaryButton}>Explore Dashboard</button>
                </div>
            </section>

            {/* Features Section */}
            <section style={styles.featuresSection}>
                <h2 style={styles.sectionTitle}>Why Choose Us</h2>
                <div style={styles.featuresGrid}>
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            style={{
                                ...styles.featureCard,
                                ...(hoveredCard === feature.id ? styles.featureCardHover : {}),
                            }}
                            onMouseEnter={() => setHoveredCard(feature.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div style={styles.iconContainer}>{feature.icon}</div>
                            <h3 style={styles.featureTitle}>{feature.title}</h3>
                            <p style={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
                    <p style={styles.ctaSubtitle}>Join thousands of users already using our platform</p>
                    <button style={styles.secondaryButton}>Create Your First Project</button>
                </div>
            </section>
        </div>
    );
}

const styles = {
    container: {
        width: '100%',
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    },
    heroSection: {
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a66c2 0%, #0052cc 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '60px 20px',
    },
    heroContent: {
        maxWidth: '800px',
        animation: 'fadeIn 0.8s ease-in',
    },
    mainTitle: {
        fontSize: '4rem',
        fontWeight: 700,
        marginBottom: '24px',
        lineHeight: 1.2,
        letterSpacing: '-0.5px',
    },
    heroSubtitle: {
        fontSize: '1.3rem',
        marginBottom: '40px',
        opacity: 0.95,
        lineHeight: 1.6,
        fontWeight: 400,
    },
    primaryButton: {
        padding: '14px 40px',
        fontSize: '1rem',
        fontWeight: 600,
        background: 'white',
        color: '#0a66c2',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    featuresSection: {
        padding: '80px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '60px',
        color: '#000000',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
    },
    featureCard: {
        padding: '40px 30px',
        background: '#f0f2f5',
        borderRadius: '12px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '1px solid #e4e6eb',
    },
    featureCardHover: {
        background: '#ffffff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        transform: 'translateY(-8px)',
        borderColor: '#0a66c2',
    },
    iconContainer: {
        fontSize: '3rem',
        marginBottom: '20px',
    },
    featureTitle: {
        fontSize: '1.3rem',
        fontWeight: 600,
        marginBottom: '12px',
        color: '#000000',
    },
    featureDescription: {
        fontSize: '0.95rem',
        color: '#65676b',
        lineHeight: 1.6,
    },
    ctaSection: {
        background: '#f0f2f5',
        padding: '80px 40px',
        textAlign: 'center',
    },
    ctaContent: {
        maxWidth: '700px',
        margin: '0 auto',
    },
    ctaTitle: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '20px',
        color: '#000000',
    },
    ctaSubtitle: {
        fontSize: '1.1rem',
        color: '#65676b',
        marginBottom: '40px',
        lineHeight: 1.6,
    },
    secondaryButton: {
        padding: '14px 40px',
        fontSize: '1rem',
        fontWeight: 600,
        background: '#0a66c2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
};

export default Home;
