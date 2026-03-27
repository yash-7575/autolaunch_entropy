'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import styles from './settings.module.scss';

const TABS = ['Profile', 'Brand DNA', 'Notifications', 'Team', 'API Keys', 'Danger Zone'];
const NOTIF_ITEMS = ['Post published', 'Post failed', 'Weekly digest', 'New team member', 'Billing alerts'];

export function SettingsComponent() {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState('Profile');

  // Profile — seeded from real session
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [saved, setSaved] = useState(false);

  // Seed profile fields from session once loaded
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setEmail(session.user.email ?? '');
    }
  }, [session]);

  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    'Post published': true, 'Post failed': true, 'Weekly digest': false, 'New team member': true, 'Billing alerts': true,
  });
  const [apiKey] = useState('al_prod_sk_9f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c');
  const [keyCopied, setKeyCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [members, setMembers] = useState<{ name: string; email: string; role: string }[]>([]);

  // Seed team with current user
  useEffect(() => {
    if (session?.user) {
      setMembers([{
        name: session.user.name ?? 'You',
        email: session.user.email ?? '',
        role: 'Admin',
      }]);
    }
  }, [session]);

  // Brand DNA state
  const [brandName, setBrandName] = useState('AutoLaunch');
  const [brandUrl, setBrandUrl] = useState('https://autolaunch.app');
  const [brandTagline, setBrandTagline] = useState('Schedule smarter, grow faster');
  const [brandColors, setBrandColors] = useState(['#612bd3', '#ffffff', '#0085ff', '#32d583', '#f97066']);
  const [brandValues, setBrandValues] = useState(['Innovation', 'Consistency', 'Growth', 'Authenticity']);
  const [brandAesthetic, setBrandAesthetic] = useState(['Modern Minimalism', 'Tech-Forward', 'Bold & Clean']);
  const [brandTone, setBrandTone] = useState(['Professional', 'Inspiring', 'Approachable']);
  const [brandFont, setBrandFont] = useState('Inter');
  const [brandImages, setBrandImages] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [newAesthetic, setNewAesthetic] = useState('');
  const [newTone, setNewTone] = useState('');
  const [brandSaved, setBrandSaved] = useState(false);

  const handleBrandSave = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBrandImages((prev) => [...prev, ev.target?.result as string].slice(0, 8));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    // Update the session display name if changed
    await update({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await new Promise((r) => setTimeout(r, 600));
    setMembers((prev) => [...prev, { name: inviteEmail.split('@')[0], email: inviteEmail, role: 'Viewer' }]);
    setInviteEmail('');
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2500);
  };

  const avatarSrc = session?.user?.image;
  const initials = (session?.user?.name ?? name ?? 'U')
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        {TABS.map((t) => (
          <button key={t} type="button"
            className={`${styles.tabBtn} ${tab === t ? styles.active : ''} ${t === 'Danger Zone' ? styles.danger : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.content}>

        {tab === 'Profile' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Profile Settings</h3>

            {/* Avatar */}
            <div className={styles.avatarRow}>
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt={name} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatar}>{initials}</div>
              )}
              <div className={styles.avatarMeta}>
                <span className={styles.avatarName}>{session?.user?.name ?? name}</span>
                <span className={styles.avatarProvider}>
                  {session ? `Signed in via OAuth` : 'Not signed in'}
                </span>
              </div>
            </div>

            <div className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="profile-name" className={styles.label}>Full Name</label>
                <input id="profile-name" className={styles.input} value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className={styles.field}>
                <label htmlFor="profile-email" className={styles.label}>Email Address</label>
                <input id="profile-email" className={styles.input} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  readOnly={!!session?.user?.email}
                  title={session?.user?.email ? 'Email is managed by your OAuth provider' : undefined}
                />
                {session?.user?.email && (
                  <span className={styles.fieldHint}>Managed by your sign-in provider</span>
                )}
              </div>
              <div className={styles.field}>
                <label htmlFor="profile-timezone" className={styles.label}>Timezone</label>
                <select id="profile-timezone" className={styles.select} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
              </div>
              <div className={styles.btnRow}>
                <button type="button" className={styles.saveBtn} onClick={handleSave}>
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
                <button type="button" className={styles.signOutBtn}
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'Brand DNA' && (
          <div className={styles.brandDna}>
            <div className={styles.dnaHero}>
              <span className={styles.dnaIcon}>🧬</span>
              <h2 className={styles.dnaTitle}>Your Business DNA</h2>
              <p className={styles.dnaSub}>A snapshot of your brand that AutoLaunch uses to create social media campaigns. Edit anytime.</p>
            </div>

            <div className={styles.dnaGrid}>
              <div className={styles.dnaCard}>
                <input className={styles.dnaNameInput} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Business name" />
                <div className={styles.dnaUrlRow}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  <input className={styles.dnaUrlInput} value={brandUrl} onChange={(e) => setBrandUrl(e.target.value)} placeholder="https://yoursite.com" />
                </div>
              </div>

              <div className={styles.dnaCard}>
                <p className={styles.dnaCardLabel}>Images</p>
                <div className={styles.dnaImgGrid}>
                  <label className={styles.dnaUploadBtn}>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Upload Images</span>
                  </label>
                  {brandImages.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div key={i} className={styles.dnaImgThumb}>
                      <img src={src} alt={`Brand ${i + 1}`} />
                      <button type="button" className={styles.dnaImgRemove} onClick={() => setBrandImages((p) => p.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.dnaCard}>
                <div className={styles.dnaLogoBox}>
                  <div className={styles.dnaLogoPlaceholder}>{brandName.slice(0, 2).toUpperCase()}</div>
                </div>
                <div className={styles.dnaFontBox}>
                  <p className={styles.dnaCardLabel}>Fonts</p>
                  <select aria-label="Brand font" className={styles.dnaFontSelect} value={brandFont} onChange={(e) => setBrandFont(e.target.value)}>
                    {['Inter', 'Playfair Display', 'Roboto', 'Montserrat', 'Poppins', 'Lora', 'Space Grotesk'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <span className={styles.dnaFontPreview} style={{ fontFamily: brandFont }}>Aa</span>
                </div>
              </div>

              <div className={styles.dnaCard}>
                <p className={styles.dnaCardLabel}>Colors</p>
                <div className={styles.dnaColors}>
                  {brandColors.map((color, i) => (
                    <div key={i} className={styles.dnaColorItem}>
                      <label className={styles.dnaColorSwatch} style={{ background: color }}>
                        <input aria-label={`Brand color ${color}`} type="color" value={color} onChange={(e) => setBrandColors((p) => p.map((c, j) => j === i ? e.target.value : c))} />
                      </label>
                      <span className={styles.dnaColorHex}>{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.dnaCard}>
                <p className={styles.dnaCardLabel}>Tagline</p>
                <textarea className={styles.dnaTagline} value={brandTagline} onChange={(e) => setBrandTagline(e.target.value)} rows={3} placeholder="Your brand tagline..." />
              </div>

              <div className={styles.dnaCard}>
                <p className={styles.dnaCardLabel}>Brand values</p>
                <div className={styles.dnaTags}>
                  {brandValues.map((v) => (
                    <span key={v} className={styles.dnaTag}>{v}<button type="button" onClick={() => setBrandValues((p) => p.filter((x) => x !== v))}>✕</button></span>
                  ))}
                </div>
                <div className={styles.dnaAddRow}>
                  <input className={styles.dnaAddInput} value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Add value..." onKeyDown={(e) => { if (e.key === 'Enter' && newValue.trim()) { setBrandValues((p) => [...p, newValue.trim()]); setNewValue(''); }}} />
                </div>
              </div>

              <div className={styles.dnaCard}>
                <p className={styles.dnaCardLabel}>Brand aesthetic</p>
                <div className={styles.dnaTags}>
                  {brandAesthetic.map((v) => (
                    <span key={v} className={styles.dnaTag}>{v}<button type="button" onClick={() => setBrandAesthetic((p) => p.filter((x) => x !== v))}>✕</button></span>
                  ))}
                </div>
                <div className={styles.dnaAddRow}>
                  <input className={styles.dnaAddInput} value={newAesthetic} onChange={(e) => setNewAesthetic(e.target.value)} placeholder="Add aesthetic..." onKeyDown={(e) => { if (e.key === 'Enter' && newAesthetic.trim()) { setBrandAesthetic((p) => [...p, newAesthetic.trim()]); setNewAesthetic(''); }}} />
                </div>
              </div>

              <div className={styles.dnaCard}>
                <p className={styles.dnaCardLabel}>Brand tone of voice</p>
                <div className={styles.dnaTags}>
                  {brandTone.map((v) => (
                    <span key={v} className={styles.dnaTag}>{v}<button type="button" onClick={() => setBrandTone((p) => p.filter((x) => x !== v))}>✕</button></span>
                  ))}
                </div>
                <div className={styles.dnaAddRow}>
                  <input className={styles.dnaAddInput} value={newTone} onChange={(e) => setNewTone(e.target.value)} placeholder="Add tone..." onKeyDown={(e) => { if (e.key === 'Enter' && newTone.trim()) { setBrandTone((p) => [...p, newTone.trim()]); setNewTone(''); }}} />
                </div>
              </div>
            </div>

            <div className={styles.dnaFooter}>
              <p className={styles.dnaFooterText}>Next we&apos;ll use your Business DNA to generate social media campaigns</p>
              <button type="button" className={styles.dnaLooksGood} onClick={handleBrandSave}>
                {brandSaved ? '✓ Saved!' : 'Looks good'}
              </button>
            </div>
          </div>
        )}

        {tab === 'Notifications' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notification Preferences</h3>
            <div className={styles.toggleList}>
              {NOTIF_ITEMS.map((item) => (
                <div key={item} className={styles.toggleItem}>
                  <span className={styles.toggleLabel}>{item}</span>
                  <button type="button" aria-pressed={!!notifs[item]} aria-label={`Toggle ${item} notifications`}
                    className={`${styles.toggle} ${notifs[item] ? styles.toggleOn : ''}`}
                    onClick={() => setNotifs((prev) => ({ ...prev, [item]: !prev[item] }))}>
                    <span className={styles.toggleThumb} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Team' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Team Members</h3>
            <div className={styles.teamList}>
              {members.map((m) => (
                <div key={m.email} className={styles.teamMember}>
                  <div className={styles.avatar}>{m.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>{m.name}</div>
                    <div className={styles.memberEmail}>{m.email}</div>
                  </div>
                  <span className={styles.roleBadge} data-role={m.role.toLowerCase()}>{m.role}</span>
                </div>
              ))}
            </div>
            <div className={styles.inviteRow}>
              <input type="email" className={styles.input} placeholder="colleague@company.com"
                value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()} />
              <button type="button" className={styles.inviteBtn} onClick={handleInvite}>
                {inviteSent ? '✓ Invited!' : '+ Invite'}
              </button>
            </div>
          </div>
        )}

        {tab === 'API Keys' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>API Keys</h3>
            <p className={styles.sectionDesc}>Use these keys to access the AutoLaunch API from your applications.</p>
            <div className={styles.apiKey}>
              <div className={styles.keyLabel}>Production Key</div>
              <div className={styles.keyRow}>
                <code className={styles.keyValue}>{apiKey.slice(0, 16)}••••••••••••••••</code>
                <button type="button" className={styles.copyBtn} onClick={handleCopy}>
                  {keyCopied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <button type="button" className={styles.generateBtn}>↻ Regenerate Key</button>
          </div>
        )}

        {tab === 'Danger Zone' && (
          <div className={styles.section}>
            <h3 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h3>
            <div className={styles.dangerCard}>
              <div>
                <div className={styles.dangerLabel}>Sign Out Everywhere</div>
                <div className={styles.dangerDesc}>Sign out of your account on all devices.</div>
              </div>
              <button type="button" className={styles.deleteBtn}
                onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                Sign Out
              </button>
            </div>
            <div className={styles.dangerCard} style={{ marginTop: 12 }}>
              <div>
                <div className={styles.dangerLabel}>Delete Account</div>
                <div className={styles.dangerDesc}>Permanently delete your account and all data. Cannot be undone.</div>
              </div>
              <button type="button" className={styles.deleteBtn}
                onClick={() => window.confirm('Are you sure? This cannot be undone.') && alert('Account deletion requested.')}>
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

