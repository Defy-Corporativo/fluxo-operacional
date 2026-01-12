import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Menu, ChevronLeft, HelpCircle } from 'lucide-react';
import styles from './Layout.module.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {!isCollapsed && <div className={styles.sidebarOverlay} onClick={onToggle} />}
            <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    {isCollapsed ? (
                        <button
                            className={styles.toggleBtn}
                            onClick={onToggle}
                            title="Abrir menu"
                        >
                            <Menu size={20} />
                        </button>
                    ) : (
                        <>
                            <div className={styles.appBrand}>
                                <div className={styles.appIcon}>
                                    <HelpCircle size={22} />
                                </div>
                                <div className={styles.appBrandText}>
                                    <span className={styles.appName}>Boilerplate</span>
                                    <span className={styles.appTagline}>Corporativo</span>
                                </div>
                            </div>
                            <button
                                className={styles.toggleBtnLight}
                                onClick={onToggle}
                                title="Recolher menu"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </>
                    )}
                </div>
                <nav className={styles.nav}>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        title="Configurações"
                        onClick={() => {
                            window.innerWidth < 768 && onToggle();
                        }}
                    >
                        <Settings size={20} />
                        {!isCollapsed && <span>Configurações</span>}
                    </NavLink>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
