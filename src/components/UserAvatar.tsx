import React, { useState } from 'react';
import { getEmployeeProfile } from '../data/initialData';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  initials?: string;
  avatarBg?: string;
  size?: AvatarSize;
  showOnline?: boolean;
  className?: string;
  title?: string;
  border?: boolean;
  type?: 'rep' | 'ai' | 'sys';
  /**
   * Skips the stored-photo lookup by name, so the avatar shows exactly what it
   * was handed. Display sites want the lookup — it is how a name alone renders
   * the right face. A form preview does not: it has to mirror the field, or
   * clearing a photo would still show the stored one.
   */
  ignoreStoredPhoto?: boolean;
}

const SIZE_MAP: Record<AvatarSize, { width: number; height: number; fontSize: number }> = {
  xs: { width: 18, height: 18, fontSize: 8.5 },
  sm: { width: 22, height: 22, fontSize: 9.5 },
  md: { width: 26, height: 26, fontSize: 10.5 },
  lg: { width: 32, height: 32, fontSize: 12 },
  xl: { width: 38, height: 38, fontSize: 13.5 },
  '2xl': { width: 48, height: 48, fontSize: 16 },
  '3xl': { width: 64, height: 64, fontSize: 22 },
  '4xl': { width: 80, height: 80, fontSize: 28 }
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl: customAvatarUrl,
  initials: customInitials,
  avatarBg: customAvatarBg,
  size = 'md',
  showOnline = false,
  className = '',
  title,
  border = true,
  type = 'rep',
  ignoreStoredPhoto = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Special cases: AI and System
  if (type === 'ai' || name === 'IA' || name === 'WooX AI') {
    const dim = SIZE_MAP[size];
    return (
      <div
        className={`user-avatar-element avatar-ai ${className}`}
        title={title || 'WooX IA Asistente'}
        style={{
          width: `${dim.width}px`,
          height: `${dim.height}px`,
          borderRadius: '4px',
          background: 'var(--primary)',
          color: 'var(--on-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: `${dim.fontSize}px`,
          flexShrink: 0,
          boxShadow: 'var(--shadow-primary-glow)',
          border: border ? '1px solid rgba(255,255,255,0.9)' : 'none'
        }}
      >
        IA
      </div>
    );
  }

  if (type === 'sys' || name === 'Sistema' || name === 'System') {
    const dim = SIZE_MAP[size];
    return (
      <div
        className={`user-avatar-element avatar-sys ${className}`}
        title={title || 'Sistema'}
        style={{
          width: `${dim.width}px`,
          height: `${dim.height}px`,
          borderRadius: '4px',
          background: 'var(--steel)',
          color: 'var(--on-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: `${dim.fontSize}px`,
          flexShrink: 0,
          border: border ? '1px solid var(--paper)' : 'none'
        }}
      >
        <svg width={dim.fontSize + 2} height={dim.fontSize + 2} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>
    );
  }

  // Unassigned check
  const isUnassigned = !name || name === 'Unassigned' || name === 'Sin asignar';
  if (isUnassigned && !customAvatarUrl) {
    const dim = SIZE_MAP[size];
    return (
      <div
        className={`user-avatar-element avatar-unassigned ${className}`}
        title={title || 'Sin asignar'}
        style={{
          width: `${dim.width}px`,
          height: `${dim.height}px`,
          borderRadius: '50%',
          background: 'var(--fog)',
          color: 'var(--graphite)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: border ? '1px dashed var(--steel)' : 'none'
        }}
      >
        <svg width={dim.fontSize + 3} height={dim.fontSize + 3} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    );
  }

  const profile = ignoreStoredPhoto ? undefined : getEmployeeProfile(name);
  const avatarUrl = customAvatarUrl || profile?.avatarUrl;
  const initials =
    customInitials ||
    profile?.initials ||
    (name ? name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U');
  const avatarBg = customAvatarBg || profile?.avatarBg || 'var(--primary)';
  const dim = SIZE_MAP[size];
  const displayName = name || profile?.name || 'Empleado';

  return (
    <div
      className={`user-avatar-wrapper ${className}`}
      style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
      title={title || displayName}
    >
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={displayName}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          style={{
            width: `${dim.width}px`,
            height: `${dim.height}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            flexShrink: 0,
            border: border ? '1px solid rgba(255,255,255,0.9)' : 'none',
            boxShadow: '0 1px 2px rgba(26,26,26,0.08)'
          }}
        />
      ) : (
        <div
          style={{
            width: `${dim.width}px`,
            height: `${dim.height}px`,
            borderRadius: '50%',
            background: avatarBg,
            color: 'var(--on-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: `${dim.fontSize}px`,
            flexShrink: 0,
            border: border ? '1px solid rgba(255,255,255,0.9)' : 'none',
            boxShadow: '0 1px 2px rgba(26,26,26,0.08)'
          }}
        >
          {initials}
        </div>
      )}

      {showOnline && (
        <span
          className="online-indicator"
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: size === 'xs' || size === 'sm' ? '6px' : '8px',
            height: size === 'xs' || size === 'sm' ? '6px' : '8px',
            borderRadius: '50%',
            background: 'var(--good)',
            border: '1.5px solid var(--paper)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
          }}
        />
      )}
    </div>
  );
};
