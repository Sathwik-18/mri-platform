'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/lib/hooks/useApi';
import styles from './Navbar.module.css';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export const Navbar = () => {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifications, refetch: refetchNotifs } = useNotifications(10);
  const { data: unreadCount, refetch: refetchCount } = useUnreadNotificationCount();
  const { markAsRead } = useMarkNotificationRead();
  const { markAllAsRead } = useMarkAllNotificationsRead();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    setDropdownOpen(false);
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const toggleNotif = () => setNotifOpen((prev) => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNotifClick = async (notif: any) => {
    if (!notif.read) {
      await markAsRead(notif.id);
      refetchNotifs();
      refetchCount();
    }
    setNotifOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetchNotifs();
    refetchCount();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = userProfile?.full_name || user?.email || 'User';
  const initials = getInitials(displayName);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link href={user && userProfile ? "/home" : "/landing"}>NeuroXiva</Link>
      </div>

      <button
        className={styles.mobileMenuToggle}
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        ☰
      </button>

      <ul className={`${styles.navbarLinks} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        {user && userProfile ? (
          <>
            <li>
              <Link href="/home" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            {userProfile.role && userProfile.account_status === 'active' && (
              <li>
                <Link href={`/${userProfile.role}/dashboard`} onClick={closeMobileMenu}>
                  Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link href="/about" onClick={closeMobileMenu}>
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={closeMobileMenu}>
                Contact
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/landing" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={closeMobileMenu}>
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={closeMobileMenu}>
                Contact
              </Link>
            </li>
          </>
        )}
      </ul>

      <div className={styles.rightSection}>
        {/* Notification Bell */}
        {user && userProfile && (
          <div className={styles.notifContainer} ref={notifRef}>
            <button className={styles.notifBell} onClick={toggleNotif} aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {(unreadCount ?? 0) > 0 && (
                <span className={styles.notifBadge}>
                  {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className={`${styles.notifDropdown} ${notifOpen ? styles.open : ''}`}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                {(unreadCount ?? 0) > 0 && (
                  <button className={styles.notifMarkAll} onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className={styles.notifList}>
                {(!notifications || notifications.length === 0) ? (
                  <div className={styles.notifEmpty}>No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div className={styles.notifItemTitle}>{n.title}</div>
                      <div className={styles.notifItemMsg}>{n.message}</div>
                      <div className={styles.notifItemTime}>{timeAgo(n.created_at)}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {user && userProfile ? (
          <div className={styles.profileContainer} ref={dropdownRef}>
            <div className={styles.profilePicture} onClick={toggleDropdown}>
              {initials}
            </div>
            <div className={`${styles.dropdown} ${dropdownOpen ? styles.open : ''}`}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>{userProfile.role}</span>
              </div>
              <Link href="/profile" className={styles.dropdownLink}>
                Profile
              </Link>
              <Link href="/change-password" className={styles.dropdownLink}>
                Change Password
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className={styles.loginBtn}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};
