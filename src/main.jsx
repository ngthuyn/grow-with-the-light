import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { supabase } from './lib/supabase';

/* =========================================================
   MISSIONS
   ========================================================= */

const MISSIONS = [
  {
    id: 'itunes',
    name: 'iTUNES',
    action: 'GIEO MẦM',
    target: 3,
    points: 10,
    logo: '/assets/itunes.png',
    color: '#b98cfc',
    rule: '3 lượt redeem · lấy code từ web hoặc tự mua',
    hint: 'Mỗi lượt cần ảnh minh chứng rõ ràng. Lấy code từ web hoặc chụp màn hình giao dịch mua có Account ID.',
    resourceUrl: 'https://light-itunes-code.vercel.app/',
    proofNote: 'Không cần nhập email. Nếu tự mua, chỉ cần Account ID hiển thị trên ảnh.'
  },
  {
    id: 'youtube',
    name: 'YOUTUBE',
    action: 'TƯỚI MÁT',
    target: 3,
    points: 10,
    logo: '/assets/youtube.png',
    color: '#ff5757',
    rule: 'Mỗi tài khoản cần: 1 ảnh đã subscribe kênh lighT_, 1 ảnh Like và 1 ảnh Comment.',
    hint: 'Mỗi tài khoản cần 3 ảnh: đã subscribe kênh lighT_, Like và Comment.'
  },
  {
    id: 'facebook',
    name: 'FACEBOOK',
    action: 'ĐÓN NẮNG',
    target: 3,
    points: 10,
    logo: '/assets/facebook.png',
    color: '#4f8df7',
    rule: '3 post · đủ Hashtag',
    hint: 'Dọn sạch những chú sâu để cây khỏe mạnh.'
  },
  {
    id: 'tiktok',
    name: 'TIKTOK',
    action: 'ĐÂM CHỒI',
    target: 3,
    points: 10,
    logo: '/assets/tiktok.png',
    color: '#141414',
    rule: '3 video · Sound Official + Hashtag',
    hint: 'Thêm dinh dưỡng để cây vươn cao và nhiều lá hơn.'
  },
  {
    id: 'spotify',
    name: 'SPOTIFY',
    action: 'KHOE SẮC',
    target: 15,
    points: 10,
    logo: '/assets/spotify.png',
    color: '#55e36b',
    rule: '15 streams / ngày / account',
    hint: 'Hoàn thành chặng cuối để đánh thức bông hướng dương.'
  }
];

const BONUS_MISSIONS = [
  {
    id: 'tiktok_extra',
    name: 'TIKTOK EXTRA',
    action: 'THÊM VIDEO',
    target: 5,
    points: 2,
    points_per_unit: 2,
    unit_quantity: 1,
    max_points: 10,
    logo: '/assets/tiktok.png',
    color: '#141414',
    rule: '1 video = +2 điểm · tối đa 10 điểm',
    hint: 'Thêm 1 video hợp lệ = +2 điểm.',
    mission_type: 'bonus'
  },
  {
    id: 'social_extra',
    name: 'SOCIAL EXTRA',
    action: 'THÊM BÀI ĐĂNG',
    target: 15,
    points: 1,
    points_per_unit: 1,
    unit_quantity: 3,
    max_points: 5,
    logo: '/assets/facebook.png',
    color: '#4f8df7',
    rule: '3 post = +1 điểm · tối đa 5 điểm',
    hint: 'Mỗi 3 bài đăng hợp lệ = +1 điểm.',
    mission_type: 'bonus'
  },
  {
    id: 'spotify_extra',
    name: 'SPOTIFY EXTRA',
    action: 'STREAM THÊM',
    target: 45,
    points: 5,
    points_per_unit: 5,
    unit_quantity: 15,
    max_points: 15,
    logo: '/assets/spotify.png',
    color: '#55e36b',
    rule: '15 streams = +5 điểm · tối đa 15 điểm',
    hint: '15 / 30 / 45 streams tương ứng +5 / +10 / +15 điểm.',
    mission_type: 'bonus'
  },
  {
    id: 'itunes_extra',
    name: 'iTUNES EXTRA',
    action: 'REDEEM THÊM',
    target: 10,
    points: 1,
    points_per_unit: 1,
    unit_quantity: 2,
    max_points: 5,
    logo: '/assets/itunes.png',
    color: '#b98cfc',
    rule: '2 redeem = +1 điểm · tối đa 5 điểm',
    hint: '2 / 4 / 6 / 8 / 10 redeem tương ứng +1 / +2 / +3 / +4 / +5 điểm.',
    mission_type: 'bonus'
  },
  {
    id: 'youtube_extra',
    name: 'YOUTUBE EXTRA',
    action: 'TƯƠNG TÁC THÊM',
    target: 5,
    points: 2,
    points_per_unit: 2,
    unit_quantity: 1,
    max_points: 10,
    logo: '/assets/youtube.png',
    color: '#ff5757',
    rule: '1 Subcribe + 1 Like + 1 Comment = +2 điểm · tối đa 10 điểm',
    hint: 'Mỗi gói Like + Comment hợp lệ = +2 điểm.',
    mission_type: 'bonus'
  }
];

const ALL_MISSIONS = [...MISSIONS, ...BONUS_MISSIONS];


const initialCounts = Object.fromEntries(
  MISSIONS.map(m => [m.id, 0])
);

const initialStatuses = Object.fromEntries(
  MISSIONS.map((m, i) => [
    m.id,
    i === 0 ? 'in_progress' : 'locked'
  ])
);

const EVIDENCE_TYPES = [
  ['post_screenshot', 'Ảnh bài post/video'],
  ['stream_screenshot', 'Ảnh stream'],
  ['redeem_screenshot', 'Ảnh redeem code'],
  ['digital_purchase_screenshot', 'Ảnh mua nhạc số'],
  ['other_screenshot', 'Ảnh minh chứng khác']
];

/* =========================================================
   HELPERS
   ========================================================= */

function logoFallback(name) {
  return name === 'iTUNES'
    ? '♪'
    : name.slice(0, 1);
}

function nextFrame() {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function makeDraftId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to the compatible random-id implementation.
  }

  return 'draft-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

function friendlyAuthError(error) {
  const message = error?.message || '';

  if (/invalid login credentials/i.test(message)) {
    return 'Email hoặc mật khẩu chưa đúng.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'Email chưa được xác nhận. Hãy kiểm tra hộp thư.';
  }

  if (/user already registered/i.test(message)) {
    return 'Email này đã được đăng ký.';
  }

  if (/password should be at least/i.test(message)) {
    return 'Mật khẩu cần ít nhất 6 ký tự.';
  }

  if (/rate limit/i.test(message)) {
    return 'Bạn thao tác hơi nhanh. Vui lòng thử lại sau một lúc.';
  }

  if (/redirect/i.test(message)) {
    return 'Đường dẫn chuyển hướng đăng nhập chưa được cấu hình.';
  }

  return message || 'Có lỗi xảy ra. Vui lòng thử lại.';
}

/* =========================================================
   GOOGLE ICON
   ========================================================= */

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="googleIcon"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.4-.18-2.06H12v3.9h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
      />

      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.52A9.75 9.75 0 0 0 12 21.75Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.64H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.36l3.25-2.52Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.39l3.25 2.52C7.31 7.85 9.46 6.13 12 6.13Z"
      />
    </svg>
  );
}

/* =========================================================
   AUTH CONFIG
   ========================================================= */

const ADMIN_USERNAME = (import.meta.env.VITE_ADMIN_USERNAME || 'TINcredible').trim();
// The admin types only this username in the UI.
// The matching Supabase Auth email is resolved server-side by the database RPC,
// so changing the technical email later does not require changing frontend code/env.

/* =========================================================
   AUTH SCREEN
   ========================================================= */

function AuthScreen() {
  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [name, setName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const switchMode = nextMode => {
    clearMessages();

    setMode(nextMode);

    setPassword('');
    setConfirmPassword('');
  };

  const loginAsAdmin = async event => {
    event.preventDefault();
    clearMessages();

    const username = (document.getElementById('admin-login-username')?.value || '').trim();

    if (!username) {
      setError('Vui lòng nhập username admin.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (username.toLowerCase() !== String(ADMIN_USERNAME).toLowerCase()) {
      setError('Username admin không đúng.');
      return;
    }

    setSubmitting(true);

    // Resolve the technical Auth identity from the admin username.
    // The frontend never stores the admin email.
    const {
      data: identity,
      error: identityError
    } = await supabase.rpc('get_admin_login_identity', {
      p_username: username
    });

    if (identityError) {
      setSubmitting(false);
      setError(identityError.message || 'Không thể xác định tài khoản admin.');
      return;
    }

    const adminEmail = identity?.email;

    if (!adminEmail) {
      setSubmitting(false);
      setError('Không tìm thấy tài khoản admin hoặc tài khoản chưa được cấp quyền.');
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password
    });

    if (loginError) {
      setSubmitting(false);
      setError(friendlyAuthError(loginError));
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, username')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setSubmitting(false);
      setError('Tài khoản này chưa được cấp quyền admin.');
      return;
    }

    setSubmitting(false);
    setMessage('Đăng nhập admin thành công. Đang mở bảng quản trị...');
  };

  const loginWithGoogle = async () => {
    clearMessages();
    setSubmitting(true);

    const {
      error: oauthError
    } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (oauthError) {
      setError(
        friendlyAuthError(oauthError)
      );
      setSubmitting(false);
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }

    /* ================= FORGOT PASSWORD ================= */

    if (mode === 'forgot') {
      setSubmitting(true);

      const {
        error: resetError
      } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: window.location.origin
        }
      );

      setSubmitting(false);

      if (resetError) {
        setError(
          friendlyAuthError(resetError)
        );
        return;
      }

      setMessage(
        'Đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư.'
      );

      return;
    }

    /* ================= UPDATE PASSWORD ================= */

    if (mode === 'update-password') {
      if (password.length < 6) {
        setError(
          'Mật khẩu mới cần ít nhất 6 ký tự.'
        );
        return;
      }

      if (password !== confirmPassword) {
        setError(
          'Mật khẩu nhập lại chưa khớp.'
        );
        return;
      }

      setSubmitting(true);

      const {
        error: updateError
      } = await supabase.auth.updateUser({
        password
      });

      setSubmitting(false);

      if (updateError) {
        setError(
          friendlyAuthError(updateError)
        );
        return;
      }

      setPassword('');
      setConfirmPassword('');

      setMessage(
        'Đổi mật khẩu thành công.'
      );

      return;
    }

    /* ================= PASSWORD VALIDATION ================= */

    if (password.length < 6) {
      setError(
        'Mật khẩu cần ít nhất 6 ký tự.'
      );
      return;
    }

    /* ================= SIGN UP ================= */

    if (mode === 'signup') {
      if (!name.trim()) {
        setError(
          'Vui lòng nhập tên hiển thị.'
        );
        return;
      }

      if (password !== confirmPassword) {
        setError(
          'Mật khẩu nhập lại chưa khớp.'
        );
        return;
      }

      setSubmitting(true);

      const {
        data,
        error: signupError
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            user_name: name.trim()
          },
          emailRedirectTo:
            window.location.origin
        }
      });

      setSubmitting(false);

      if (signupError) {
        setError(
          friendlyAuthError(signupError)
        );
        return;
      }

      if (data?.session) {
        setMessage(
          'Đăng ký thành công. Đang vào game...'
        );
      } else {
        setMessage(
          'Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản.'
        );

        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }

      return;
    }

    /* ================= LOGIN ================= */

    setSubmitting(true);

    const {
      error: loginError
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setSubmitting(false);

    if (loginError) {
      setError(
        friendlyAuthError(loginError)
      );
      return;
    }

    setMessage(
      'Đăng nhập thành công. Đang mở khu vườn...'
    );
  };

  const title =
    mode === 'signup'
      ? 'TẠO TÀI KHOẢN'
      : mode === 'forgot'
        ? 'LẤY LẠI MẬT KHẨU'
        : mode === 'update-password'
          ? 'ĐỔI MẬT KHẨU'
          : mode === 'admin-login'
            ? 'ADMIN LOGIN'
            : 'CHÀO MỪNG BẠN';

  const subtitle =
    mode === 'signup'
      ? 'Tạo tài khoản để bắt đầu chăm bông hướng dương.'
      : mode === 'forgot'
        ? 'Nhập email để nhận liên kết đặt lại mật khẩu.'
        : mode === 'update-password'
          ? 'Đặt mật khẩu mới cho tài khoản của bạn.'
          : mode === 'admin-login'
            ? 'Khu vực quản trị · chỉ dành cho admin.'
            : 'Đăng nhập để tiếp tục hành trình cùng tinie.';

  return (
    <div className="authPage">

      <div className="authSky">
        <span className="authSun" />

        <span className="authCloud authCloud1" />
        <span className="authCloud authCloud2" />
        <span className="authCloud authCloud3" />

        <span className="authHill authHill1" />
        <span className="authHill authHill2" />
      </div>

      <div className="authDecor authFlower authFlower1">
        ✿
      </div>

      <div className="authDecor authFlower authFlower2">
        ✿
      </div>

      <div className="authDecor authStar authStar1">
        ✦
      </div>

      <div className="authDecor authStar authStar2">
        ✧
      </div>

      <main className="authShell">

        <section className="authBrandBlock">

          <div className="authMiniLogo">
            MINI<span>GAME</span>
          </div>

          <div className="authWorld">
            WORLD 01
          </div>

          <h1>
            GROW
            <em>WITH THE lighT</em>
          </h1>

          <p>
            Chăm một bông hoa · Gieo điều tốt đẹp ·
            Cùng nhau tỏa sáng
          </p>

        </section>

        <section className="authCard">

          <div className="authCardHeader">

            <div className="authSeed">
              🌱
            </div>

            <div>
              <span className="authEyebrow">
                YOUR JOURNEY
              </span>

              <h2>
                {title}
              </h2>

              <p>
                {subtitle}
              </p>
            </div>

          </div>

          {mode === 'admin-login' ? (
            <form className="authForm" onSubmit={loginAsAdmin}>
              <label>
                <span>ADMIN USERNAME</span>
                <input
                  id="admin-login-username"
                  type="text"
                  placeholder="TINcredible"
                  autoComplete="username"
                  disabled={submitting}
                />
              </label>

              <label>
                <span>MẬT KHẨU ADMIN</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={submitting}
                />
              </label>

              {error && <div className="authMessage error">{error}</div>}
              {message && <div className="authMessage success">{message}</div>}

              <button className="authSubmit" type="submit" disabled={submitting}>
                {submitting ? 'ĐANG XỬ LÝ...' : '🔐 VÀO ADMIN'}
              </button>
            </form>
          ) : (
            <>
              {mode !== 'forgot' && mode !== 'update-password' && (
                <>
                  <button
                    type="button"
                    className="googleButton"
                    onClick={loginWithGoogle}
                    disabled={submitting}
                  >
                    <GoogleIcon />
                    <span>{submitting ? 'ĐANG KẾT NỐI...' : 'Tiếp tục với Google'}</span>
                  </button>
                  <div className="authDivider"><span>HOẶC</span></div>
                </>
              )}

              <form className="authForm" onSubmit={handleSubmit}>

            {mode === 'login' && (
              <>
                <span>·</span>
                <button type="button" onClick={() => switchMode('admin-login')}>
                  Admin
                </button>
              </>
            )}

            {mode === 'admin-login' && (
              <button type="button" onClick={() => switchMode('login')}>
                ← Quay lại đăng nhập user
              </button>
            )}

            {mode === 'signup' && (
              <label>
                <span>TÊN HIỂN THỊ</span>

                <input
                  value={name}
                  onChange={e =>
                    setName(e.target.value)
                  }
                  placeholder="tinie fan"
                  autoComplete="name"
                  disabled={submitting}
                />
              </label>
            )}

            <label>
              <span>EMAIL</span>

              <input
                type="email"
                value={email}
                onChange={e =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={
                  submitting ||
                  mode === 'update-password'
                }
              />
            </label>

            {mode !== 'forgot' && (
              <label>
                <span>
                  {mode === 'update-password'
                    ? 'MẬT KHẨU MỚI'
                    : 'MẬT KHẨU'}
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={e =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  autoComplete={
                    mode === 'update-password'
                      ? 'new-password'
                      : mode === 'signup'
                        ? 'new-password'
                        : 'current-password'
                  }
                  disabled={submitting}
                />
              </label>
            )}

            {(mode === 'signup' ||
              mode === 'update-password') && (
              <label>
                <span>
                  NHẬP LẠI MẬT KHẨU
                </span>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={submitting}
                />
              </label>
            )}

            {error && (
              <div className="authMessage error">
                {error}
              </div>
            )}

            {message && (
              <div className="authMessage success">
                {message}
              </div>
            )}

            <button
              className="authSubmit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'ĐANG XỬ LÝ...'
                : mode === 'signup'
                  ? '🌱 TẠO TÀI KHOẢN'
                  : mode === 'forgot'
                    ? '📨 GỬI EMAIL ĐẶT LẠI'
                    : mode === 'update-password'
                      ? '🔐 LƯU MẬT KHẨU MỚI'
                      : '🌻 VÀO GAME'}
            </button>

              </form>
            </>
          )}

          <div className="authLinks">

            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    switchMode('forgot')
                  }
                >
                  Quên mật khẩu?
                </button>

                <span>·</span>

                <button
                  type="button"
                  onClick={() =>
                    switchMode('signup')
                  }
                >
                  Tạo tài khoản
                </button>
              </>
            )}

            {mode === 'signup' && (
              <>
                <span>
                  Đã có tài khoản?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    switchMode('login')
                  }
                >
                  Đăng nhập
                </button>
              </>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() =>
                  switchMode('login')
                }
              >
                ← Quay lại đăng nhập
              </button>
            )}

            {mode === 'update-password' && (
              <button
                type="button"
                onClick={() =>
                  switchMode('login')
                }
              >
                ← Quay lại đăng nhập
              </button>
            )}

          </div>

          <div className="authFooter">
            BẰNG VIỆC ĐĂNG NHẬP, BẠN ĐỒNG Ý THAM GIA
            GROW WITH THE lighT
          </div>

        </section>
      </main>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */


function App() {
  const [counts, setCounts] = useState(initialCounts);
  const [statuses, setStatuses] = useState(initialStatuses);
  const [submissions, setSubmissions] = useState({});
  const [score, setScore] = useState(0);
  const [sunflowerCount, setSunflowerCount] = useState(0);
  const [dayNumber, setDayNumber] = useState(1);
  const [advancingDay, setAdvancingDay] = useState(false);
  const [profile, setProfile] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const authEventRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [menu, setMenu] = useState(false);
  const [sound, setSound] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bonusStates, setBonusStates] = useState({});
  const [bonusFlow, setBonusFlow] = useState(null);
  const [bonusStarting, setBonusStarting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const NOTIFICATION_READ_KEY = 'grow-with-the-light-read-notifications';
  const [adminOpen, setAdminOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const [audio] = useState(() => {
    const a = new Audio('/assets/DLMT.mp3');
    a.loop = true;
    a.volume = 0.35;
    return a;
  });

  const cleared = MISSIONS.filter(m => statuses[m.id] === 'completed').length;
  const finished = cleared === MISSIONS.length;

  useEffect(() => {
    if (!finished || !authUser?.id) return;
    setBonusFlow('congrats');
  }, [finished, authUser?.id]);

  const rememberBonusIntro = () => {
    if (!authUser?.id) return;
    const key = `grow-with-the-light-bonus-intro-${authUser.id}-${new Date().toISOString().slice(0, 10)}`;
    try {
      window.localStorage.setItem(key, 'seen');
    } catch {
      // Ignore localStorage failures.
    }
  };

  const openBonusInvite = () => {
    rememberBonusIntro();
    setBonusFlow('invite');
  };

  const returnToMainMission = () => {
    setBonusFlow(null);
    setSelected(null);
    requestAnimationFrame(() => {
      document.querySelector('.missionRoad')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  };

  const startBonusChallenge = async () => {
    if (bonusStarting) return;
    setBonusStarting(true);

    const { error } = await supabase.rpc('start_bonus_challenge');

    setBonusStarting(false);

    if (error) {
      console.error('start_bonus_challenge:', error);
      notify(error.message || 'Không thể mở thử thách nhỏ.');
      return;
    }

    setBonusFlow('active');
    await loadGame(true);
    requestAnimationFrame(() => {
      document.querySelector('.bonusArea')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  };

  const declineBonusChallenge = () => {
    rememberBonusIntro();
    setBonusFlow('declined');
  };

  const requestFinishBonus = () => {
    setBonusFlow('finish-confirm');
  };

  const finishBonusChallenge = () => {
    rememberBonusIntro();
    setBonusFlow('declined');
  };

  const notify = msg => {
    setToast(msg);
    window.clearTimeout(window.__toast);
    window.__toast = window.setTimeout(() => setToast(''), 2600);
  };

  const toggleMusic = async () => {
    try {
      if (sound) {
        audio.pause();
        setSound(false);
      } else {
        await audio.play();
        setSound(true);
      }
    } catch (error) {
      console.error('Music error:', error);
      notify('Không thể phát nhạc. Hãy bấm lại.');
    }
  };

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) console.error('getSession error:', error);
      const nextUser = data?.session?.user || null;
      authEventRef.current = nextUser?.id || null;
      setProfile(null);
      setSelected(null);
      setAdminOpen(false);
      setLoading(Boolean(nextUser));
      setAuthUser(nextUser);
      setAuthReady(true);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;

        const nextUser = session?.user || null;
        const nextId = nextUser?.id || null;
        const changedUser = authEventRef.current !== nextId;
        authEventRef.current = nextId;

        if (changedUser || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          // Clear the previous user's profile immediately.
          // App stays in its loading gate until the new profile/role is loaded.
          setProfile(null);
          setSelected(null);
          setAdminOpen(false);
          setLeaderboardOpen(false);
          setMenu(false);
          setLoading(Boolean(nextUser));
        }

        setAuthUser(nextUser);
      }
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const loadGame = async (showLoading = false) => {
    if (showLoading) setRefreshing(true);

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setAuthUser(null);
        return;
      }

      // Resolve the role before running normal player initialization.
      // Admin sessions must stay inside the Admin dashboard.
      const { data: roleProfile, error: roleProfileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_points, role, score_reached_at, sunflower_count, day_number')
        .eq('id', user.id)
        .single();

      if (roleProfileError) {
        console.error('role profile:', roleProfileError);
      }

      if (roleProfile?.role === 'admin') {
        setProfile(roleProfile);
        setScore(roleProfile.total_points ?? 0);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { error: ensureError } =
        await supabase.rpc('ensure_game_state');

      if (ensureError) {
        console.error('ensure_game_state:', ensureError);
        notify('Không thể khởi tạo dữ liệu game.');
      }

      const [
        profileRes,
        missionsRes,
        submissionsRes,
        notificationsRes
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, avatar_url, total_points, role, score_reached_at, sunflower_count, day_number')
          .eq('id', user.id)
          .single(),

        supabase
          .from('user_missions')
          .select(`
            mission_id,
            progress,
            status,
            completed_at,
            missions(
              slug,
              name,
              action,
              target,
              points,
              mission_type,
              unit_quantity,
              points_per_unit,
              max_points,
              is_repeatable,
              logo_url
            )
          `)
          .eq('user_id', user.id),

        supabase
          .from('mission_submissions')
          .select(`
            id,
            mission_id,
            attempt_no,
            post_url,
            content_url,
            platform,
            account_id,
            redeem_code,
            external_action_id,
            quantity,
            activity_date,
            points_awarded,
            note,
            status,
            admin_comment,
            submitted_at,
            reviewed_at,
            verified_at
          `)
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false }),

        supabase
          .from('user_notifications')
          .select('id, type, title, message, submission_id, mission_id, read_at, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30)
      ]);

      if (profileRes.error) console.error('profiles:', profileRes.error);
      if (missionsRes.error) console.error('user_missions:', missionsRes.error);
      if (submissionsRes.error) console.error('mission_submissions:', submissionsRes.error);
      if (notificationsRes.error) console.error('notifications:', notificationsRes.error);

      const nextCounts = { ...initialCounts };
      const nextStatuses = { ...initialStatuses };
      const nextBonuses = {};

      for (const row of missionsRes.data || []) {
        const mission = row.missions;
        const slug = mission?.slug;
        if (!slug) continue;

        if (mission.mission_type === 'bonus') {
          nextBonuses[slug] = {
            ...mission,
            progress: row.progress ?? 0,
            status: row.status ?? 'locked',
            completed_at: row.completed_at
          };
        } else if (Object.prototype.hasOwnProperty.call(nextCounts, slug)) {
          nextCounts[slug] = row.progress ?? 0;
          nextStatuses[slug] = row.status ?? 'locked';
        }
      }

      const latestSubmissions = {};
      for (const sub of submissionsRes.data || []) {
        const mission = ALL_MISSIONS.find(
          m => m.id === (sub.mission?.slug || sub.mission_id)
        );
        const slug = mission?.id || sub.mission?.slug;
        if (slug && !latestSubmissions[slug]) {
          latestSubmissions[slug] = sub;
        } else if (!slug) {
          const matched = (missionsRes.data || []).find(
            row => row.mission_id === sub.mission_id
          );
          const matchedSlug = matched?.missions?.slug;
          if (matchedSlug && !latestSubmissions[matchedSlug]) {
            latestSubmissions[matchedSlug] = sub;
          }
        }
      }

      const mappedSubmissions = {};
      for (const sub of submissionsRes.data || []) {
        const matched = (missionsRes.data || []).find(
          row => row.mission_id === sub.mission_id
        );
        const slug = matched?.missions?.slug;
        if (slug && !mappedSubmissions[slug]) {
          mappedSubmissions[slug] = sub;
        }
      }

      setCounts(nextCounts);
      setStatuses(nextStatuses);
      setBonusStates(nextBonuses);
      setSubmissions(mappedSubmissions);
      setProfile(profileRes.data || null);
      setScore(profileRes.data?.total_points ?? 0);
      setSunflowerCount(profileRes.data?.sunflower_count ?? 0);
      setDayNumber(profileRes.data?.day_number ?? 1);

      const notificationReadKey = `${NOTIFICATION_READ_KEY}-${user.id}`;

      let locallyRead = [];
      try {
        locallyRead = JSON.parse(
          window.localStorage.getItem(notificationReadKey) || '[]'
        );
      } catch {
        locallyRead = [];
      }

      const locallyReadSet = new Set(
        Array.isArray(locallyRead) ? locallyRead : []
      );

      const mergedNotifications = (notificationsRes.data || []).map(n => ({
        ...n,
        read_at: n.read_at || (
          locallyReadSet.has(n.id)
            ? new Date().toISOString()
            : null
        )
      }));

      // Keep local read markers only for notifications we still know about.
      try {
        const existingIds = new Set(
          (notificationsRes.data || []).map(n => n.id)
        );
        const pruned = (Array.isArray(locallyRead) ? locallyRead : [])
          .filter(id => existingIds.has(id))
          .slice(-100);

        window.localStorage.setItem(
          notificationReadKey,
          JSON.stringify(pruned)
        );
      } catch {
        // Ignore localStorage failures; server data remains usable.
      }

      setNotifications(mergedNotifications);
    } catch (error) {
      console.error('loadGame error:', error);
      notify('Không thể tải dữ liệu game.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;

    if (!authUser) {
      setLoading(false);
      setCounts({ ...initialCounts });
      setStatuses({ ...initialStatuses });
      setSubmissions({});
      setBonusStates({});
      setProfile(null);
      setScore(0);
      setSunflowerCount(0);
      setDayNumber(1);
      setNotifications([]);
      return;
    }

    loadGame();
  }, [authReady, authUser?.id]);

  useEffect(() => {
    if (!authUser?.id || profile?.role === 'admin') return undefined;

    const interval = window.setInterval(() => {
      loadGame(false);
    }, 15000);

    return () => window.clearInterval(interval);
  }, [authUser?.id, profile?.role]);

  const exportMyExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      const { data: mySubmissionIds, error: submissionIdsError } =
        await supabase
          .from('mission_submissions')
          .select('id')
          .eq('user_id', authUser.id);

      if (submissionIdsError) throw submissionIdsError;

      const submissionIds = (mySubmissionIds || []).map(row => row.id);
      const safeSubmissionIds = submissionIds.length
        ? submissionIds
        : ['00000000-0000-0000-0000-000000000000'];

      const [
        profileRes,
        missionsRes,
        submissionsRes,
        itemsRes,
        evidenceRes,
        ledgerRes
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, avatar_url, total_points, role, created_at')
          .eq('id', authUser.id)
          .single(),

        supabase
          .from('user_missions')
          .select(`
            mission_id,
            progress,
            status,
            completed_at,
            missions(
              slug,
              name,
              action,
              mission_type,
              target,
              points,
              unit_quantity,
              points_per_unit,
              max_points
            )
          `)
          .eq('user_id', authUser.id),

        supabase
          .from('mission_submissions')
          .select(`
            id,
            mission_id,
            attempt_no,
            platform,
            content_url,
            post_url,
            account_id,
            redeem_code,
            external_action_id,
            quantity,
            activity_date,
            points_awarded,
            note,
            status,
            admin_comment,
            submitted_at,
            reviewed_at,
            verified_at,
            missions(slug, name, action, mission_type)
          `)
          .eq('user_id', authUser.id)
          .order('submitted_at', { ascending: false }),

        supabase
          .from('mission_submission_items')
          .select('*')
          .in('submission_id', safeSubmissionIds),

        supabase
          .from('submission_evidence')
          .select(
            'id, submission_id, item_no, evidence_type, original_filename, storage_bucket, storage_path, mime_type, file_size, created_at'
          )
          .in('submission_id', safeSubmissionIds),

        supabase
          .from('point_ledger')
          .select(
            'id, user_id, points, source_type, source_id, mission_id, submission_id, reason, created_at'
          )
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
      ]);

      const results = [
        profileRes,
        missionsRes,
        submissionsRes,
        itemsRes,
        evidenceRes,
        ledgerRes
      ];

      const failed = results.find(r => r.error);
      if (failed?.error) throw failed.error;

      const wb = XLSX.utils.book_new();

      const append = (name, rows) => {
        const ws = XLSX.utils.json_to_sheet(rows || []);
        XLSX.utils.book_append_sheet(wb, ws, name);
      };

      append('My Profile', [profileRes.data]);
      append(
        'My Missions',
        (missionsRes.data || []).map(row => ({
          mission: row.missions?.name || row.mission_id,
          action: row.missions?.action || '',
          type: row.missions?.mission_type || '',
          progress: row.progress ?? 0,
          target: row.missions?.target ?? '',
          status: row.status || '',
          completed_at: row.completed_at || ''
        }))
      );
      append('My Submissions', submissionsRes.data || []);
      append('Submission Items', itemsRes.data || []);
      append('Evidence', evidenceRes.data || []);
      append('Point History', ledgerRes.data || []);

      XLSX.writeFile(
        wb,
        `grow-with-the-light-${(
          profileRes.data?.username || 'player'
        ).replace(/[^a-zA-Z0-9_-]/g, '_')}-${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`
      );

      notify('Đã xuất Excel dữ liệu của bạn.');
    } catch (error) {
      console.error('export my excel:', error);
      notify(
        error?.message ||
          'Không thể xuất Excel. Hãy thử lại hoặc kiểm tra package xlsx.'
      );
    }
  };

  const signOut = async () => {
    audio.pause();
    audio.currentTime = 0;
    setSound(false);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('signOut:', error);
      notify('Không thể đăng xuất.');
      return;
    }

    setAuthUser(null);
    setSelected(null);
    setMenu(false);
    setAdminOpen(false);
  };

  const advanceToNextDay = async () => {
    if (!finished || advancingDay) return;

    setAdvancingDay(true);

    try {
      const { data, error } = await supabase.rpc('advance_to_next_day');

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      setSunflowerCount(Number(result?.sunflower_count ?? sunflowerCount + 1));
      setDayNumber(Number(result?.day_number ?? dayNumber + 1));
      setBonusFlow(null);
      setSelected(null);

      await loadGame(true);
      notify(`🌻 Sang ngày ${Number(result?.day_number ?? dayNumber + 1)}! Chúc bạn tiếp tục chăm hoa thật vui.`);
    } catch (error) {
      console.error('advance_to_next_day:', error);
      notify(error?.message || 'Không thể chuyển sang ngày tiếp theo.');
    } finally {
      setAdvancingDay(false);
    }
  };

  const reset = async () => {
    const { error } = await supabase.rpc('reset_my_game');

    if (error) {
      console.error('reset_my_game:', error);
      notify('Không thể reset game.');
      return;
    }

    setSelected(null);
    await loadGame(true);
    notify('Đã bắt đầu lại hành trình 🌱');
  };

  const markNotificationRead = async id => {
    const now = new Date().toISOString();

    // 1) Update the UI immediately. The notification is now considered read,
    // so the badge decreases instantly and it disappears from the unread list.
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, read_at: n.read_at || now }
          : n
      )
    );

    // 2) Keep a local fallback so the 15s auto-refresh cannot make a
    // notification that was just read appear again if the DB request is slow.
    try {
      const key = authUser?.id
        ? `${NOTIFICATION_READ_KEY}-${authUser.id}`
        : NOTIFICATION_READ_KEY;
      const current = JSON.parse(
        window.localStorage.getItem(key) || '[]'
      );
      const ids = Array.isArray(current) ? current : [];

      if (!ids.includes(id)) ids.push(id);

      window.localStorage.setItem(
        key,
        JSON.stringify(ids.slice(-100))
      );
    } catch (error) {
      console.warn('local notification read state:', error);
    }

    // 3) Persist permanently in Supabase. This is what makes the read state
    // survive logout/login and page reloads.
    if (!authUser?.id) return;

    const { error } = await supabase
      .from('user_notifications')
      .update({ read_at: now })
      .eq('id', id)
      .eq('user_id', authUser.id);

    if (error) {
      console.error('mark notification read:', error);
    }
  };

  // Only unread notifications are shown in the dropdown.
  // Read notifications stay out of the user-facing notification list.
  const unreadNotifications = notifications.filter(n => !n.read_at);
  const unreadCount = unreadNotifications.length;

  const firstIncompleteIndex = MISSIONS.findIndex(
    m => statuses[m.id] !== 'completed'
  );

  const currentIndex = Math.min(
    firstIncompleteIndex === -1
      ? MISSIONS.length - 1
      : firstIncompleteIndex,
    MISSIONS.length - 1
  );

  const currentMission = MISSIONS[currentIndex];

  const canOpenMission = mission => {
    const index = MISSIONS.findIndex(m => m.id === mission.id);
    if (index < 0) return true;

    // Only the current mandatory mission may be submitted.
    // A later mission stays locked until every earlier mission is APPROVED.
    if (finished) return true;
    return index === currentIndex;
  };

  const openMission = mission => {
    if (!canOpenMission(mission)) {
      const current = MISSIONS[currentIndex];
      const currentStatus = statuses[current?.id];

      notify(
        currentStatus === 'pending_review'
          ? `Nhiệm vụ ${currentIndex + 1} đang chờ Admin duyệt.`
          : `Hãy hoàn thành và chờ Admin duyệt nhiệm vụ ${currentIndex}.`
      );
      return;
    }

    setSelected(mission);
  };

  if (!authReady) {
    return (
      <div className="app">
        <div className="loadingScreen">
          <b>GROW WITH THE lighT</b>
          <span>Đang mở cánh cửa khu vườn...</span>
        </div>
      </div>
    );
  }

  if (!authUser) return <AuthScreen />;

  if (loading) {
    return (
      <div className="app">
        <div className="loadingScreen">
          <b>GROW WITH THE lighT</b>
          <span>Đang tải hành trình...</span>
        </div>
      </div>
    );
  }

  /* =======================================================
     ROLE ROUTING
     Admin does NOT enter the user game.
     The database/RLS remains the source of truth for permissions.
     ======================================================= */

  if (profile?.role === 'admin') {
    return (
      <AdminDashboard
        fullScreen
        onClose={signOut}
        notify={notify}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setMenu(false)}>
          MINI<span>GAME</span>
        </button>

        <div className="topTitle">
          <small>OUR WORLD</small>
          <b>🌻 GROW WITH THE lighT</b>
        </div>

        <div className="topActions">
          <span className="score">
            <i>●</i>
            {score}
            <small>PTS</small>
          </span>

          <span
            className="score"
            title="Số hoa hướng dương đã thu hoạch"
            style={{ whiteSpace: 'nowrap' }}
          >
            🌻 {sunflowerCount}
            <small>HOA</small>
          </span>

          <span
            className="score"
            title="Ngày hiện tại"
            style={{ whiteSpace: 'nowrap' }}
          >
            NGÀY {dayNumber}
          </span>

          <div style={{ position: 'relative' }}>
            <button
              className="musicButton"
              onClick={() => setShowNotifications(v => !v)}
              aria-label="Thông báo"
              title="Thông báo"
              style={{ position: 'relative' }}
            >
              <span>🔔</span>
              <b>
                {unreadCount > 0 ? unreadCount : 'NOTI'}
              </b>
            </button>

            {showNotifications && (
              <div
                style={{
                  position: 'fixed',
                  top: 'calc(52px + 8px)',
                  right: 'max(10px, env(safe-area-inset-right))',
                  width: 'min(400px, calc(100vw - 20px))',
                 height: 'auto',
maxHeight: 'min(430px, calc(100dvh - 72px))',
                  boxSizing: 'border-box',
                  background: '#fffdf6',
                  color: '#18372a',
                  border: '2px solid #2c4738',
                  borderRadius: 18,
                  padding: 12,
                  zIndex: 1000,
                  boxShadow: '0 18px 50px rgba(0,0,0,.22)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    flexShrink: 0,
                    marginBottom: 10
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <b
                      style={{
                        display: 'block',
                        color: '#18372a',
                        fontSize: 15,
                        lineHeight: 1.2,
                        letterSpacing: '.04em'
                      }}
                    >
                      THÔNG BÁO
                    </b>
                    <small
                      style={{
                        display: 'block',
                        marginTop: 3,
                        color: '#64746a',
                        fontSize: 10
                      }}
                    >
                      Nhấn vào thông báo để xem đầy đủ
                    </small>
                  </div>

                  <button
                    type="button"
                    aria-label="Đóng thông báo"
                    onClick={() => setShowNotifications(false)}
                    style={{
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      flexShrink: 0,
                      padding: 0,
                      margin: 0,
                      borderRadius: 10,
                      border: '2px solid #2c4738',
                      background: '#17382a',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: 16,
                      lineHeight: 1,
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>

                {unreadNotifications.length === 0 ? (
                  <div
                    style={{
                      padding: '28px 14px',
                      textAlign: 'center',
                      color: '#64746a'
                    }}
                  >
                    Chưa có thông báo nào.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      flex: '1 1 auto',
                      minHeight: 0,
                      minWidth: 0,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      paddingRight: 4,
                      paddingBottom: 2,
                      scrollbarGutter: 'stable'
                    }}
                  >
                    {unreadNotifications.map(n => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          const opened = {
                            ...n,
                            read_at: n.read_at || new Date().toISOString()
                          };

                          // One click: mark read, close list, open detail.
                          setSelectedNotification(opened);
                          setShowNotifications(false);
                          markNotificationRead(n.id);
                        }}
                        style={{
                          width: '100%',
                          minWidth: 0,
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          flex: '0 0 auto',
                          textAlign: 'left',
                          padding: '9px 10px',
                          margin: 0,
                          borderRadius: 13,
                          overflow: 'hidden',
                          border: n.read_at
                            ? '1px solid #d6ddd5'
                            : '2px solid #efc74d',
                          background: n.read_at ? '#ffffff' : '#fff8d8',
                          color: '#18372a',
                          cursor: 'pointer',
                          display: 'grid',
                          gridTemplateColumns: '28px minmax(0, 1fr)',
                          gap: 8,
                          alignItems: 'start'
                        }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                            borderRadius: 9,
                            display: 'grid',
                            placeItems: 'center',
                            background: n.read_at ? '#edf2ec' : '#fff1bc',
                            border: n.read_at
                              ? '1px solid #d6ddd5'
                              : '1px solid #efc74d',
                            fontSize: 14
                          }}
                        >
                          🔔
                        </span>

                        <span
                          style={{
                            minWidth: 0,
                            width: '100%',
                            display: 'block'
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 6
                            }}
                          >
                            <b
                              style={{
                                flex: '1 1 auto',
                                minWidth: 0,
                                maxWidth: '100%',
                                color: '#18372a',
                                fontSize: 13,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {n.title}
                            </b>

                            {!n.read_at && (
                              <span
                                style={{
                                  flexShrink: 0,
                                  fontSize: 9,
                                  fontWeight: 900,
                                  color: '#725700',
                                  background: '#f9df6a',
                                  borderRadius: 99,
                                  padding: '3px 6px',
                                  lineHeight: 1
                                }}
                              >
                                MỚI
                              </span>
                            )}
                          </span>

                          <span
                            style={{
                              display: '-webkit-box',
                              minWidth: 0,
                              maxWidth: '100%',
                              color: '#3f5648',
                              fontSize: 11.5,
                              marginTop: 4,
                              lineHeight: 1.4,
                              whiteSpace: 'normal',
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {n.message}
                          </span>

                          <span
                            style={{
                              display: 'block',
                              minWidth: 0,
                              maxWidth: '100%',
                              color: '#7a867f',
                              fontSize: 10,
                              marginTop: 6,
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {new Date(n.created_at).toLocaleString('vi-VN')}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedNotification && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Chi tiết thông báo"
                onClick={() => setSelectedNotification(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 1100,
                  background: 'rgba(20,31,26,.56)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 16,
                  boxSizing: 'border-box'
                }}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: 'min(520px, calc(100vw - 28px))',
                    maxHeight: 'min(520px, calc(100dvh - 32px))',
                    boxSizing: 'border-box',
                    overflowY: 'auto',
                    background: '#fffdf6',
                    color: '#18372a',
                    border: '3px solid #2c4738',
                    borderRadius: 18,
                    padding: 18,
                    boxShadow: '0 20px 70px rgba(0,0,0,.3)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <small style={{ color: '#7a867f' }}>
                        THÔNG BÁO
                      </small>
                      <h3
                        style={{
                          margin: '3px 0 0',
                          color: '#18372a',
                          fontSize: 20,
                          lineHeight: 1.25,
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {selectedNotification.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      aria-label="Đóng chi tiết thông báo"
                      onClick={() => setSelectedNotification(null)}
                      style={{
                        width: 36,
                        height: 36,
                        minWidth: 36,
                        flexShrink: 0,
                        padding: 0,
                        margin: 0,
                        borderRadius: 10,
                        border: '2px solid #2c4738',
                        background: '#17382a',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: 18,
                        lineHeight: 1,
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: 12,
                      background: '#f5f1df',
                      color: '#314b3d',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedNotification.message}
                  </div>

                  <small
                    style={{
                      display: 'block',
                      marginTop: 10,
                      color: '#7a867f'
                    }}
                  >
                    {new Date(
                      selectedNotification.created_at
                    ).toLocaleString('vi-VN')}
                  </small>
                </div>
              </div>
            )}

          </div>

          <button
            className="musicButton"
            onClick={toggleMusic}
            aria-label={sound ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            title={sound ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
          >
            <span>{sound ? '🎵' : '🔇'}</span>
            <b>BGM</b>
          </button>

          <button
            onClick={() => setMenu(true)}
            aria-label="menu"
          >
            ☰
          </button>
        </div>
      </header>

      <main className="garden"> 
        <div className="sky">
          <span className="sun" />
          <span className="cloud cloud1" />
          <span className="cloud cloud2" />
          <span className="cloud cloud3" />
          <span className="hill hill1" />
          <span className="hill hill2" />
        </div>

        {bonusFlow !== 'active' && (
          <>
            <section className="hero">
              <div className="eyebrow">
                OUR WORLD · GROW WITH EVERY ACTION
              </div>

              <h1>
                GROW
                <em>WITH THE lighT</em>
              </h1>

              <p>
                Grow a little · Shine a little · Grow with the lighT
              </p>
            </section>

            <section
              className="missionRoad"
              aria-label="5 nhiệm vụ"
            >
          <div className="roadLine" />

          {MISSIONS.map((m, i) => {
            const done = statuses[m.id] === 'completed';
            const pending = statuses[m.id] === 'pending_review';
            const rejected = submissions[m.id]?.status === 'rejected';
            const active = i === currentIndex && !finished;
            const lockedBySequence = !finished && i !== currentIndex;
            const growthStage = i + 1;

            let label = 'CHƯA MỞ';

            if (done) label = '✓ HOÀN THÀNH';
            else if (pending) label = '⏳ CHỜ DUYỆT';
            else if (rejected) label = '↻ SUBMIT LẠI';
            else if (active) label = 'ĐANG CHĂM';

            return (
              <article
                key={m.id}
                className={[
                  'mission',
                  done ? 'done' : '',
                  active ? 'active' : '',
                  pending ? 'pending' : '',
                  rejected ? 'rejected' : '',
                  lockedBySequence ? 'locked-sequence' : '',
                  `stage${i + 1}`
                ].join(' ')}
                onClick={() => openMission(m)}
              >
                <div className="plantSpot">
                  <Plant
                    growthStage={growthStage}
                    done={done}
                    active={active}
                  />

                  <div className="missionBubble">
                    <Logo mission={m} />
                  </div>
                </div>

                <div
                  className="missionCard"
                  style={{
                    '--missionColor': m.color,
                    opacity: lockedBySequence ? 0.72 : 1,
                    cursor: lockedBySequence ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="missionNo">{i + 1}</div>
                  <div className="missionAction">{m.action}</div>

                  <h2>{m.name}</h2>
                  <p>{m.rule}</p>

                  <div className="progress">
                    <span
                      style={{
                        width: `${Math.min(
                          100,
                          (counts[m.id] / m.target) * 100
                        )}%`
                      }}
                    />
                  </div>

                  <div className="cardBottom">
                    <b>
                      {counts[m.id]}/{m.target}
                    </b>
                    <small>{label}</small>
                  </div>
                </div>
              </article>
            );
          })}
            </section>
          </>
        )}

        {false && finished && bonusFlow === 'active' && (
          <section className="bonusArea bonusAreaWide bonusStandalonePage" aria-label="5 thử thách thưởng">
            <div className="bonusHeaderRow">
              <div className="bonusHeaderCopy">
                <div className="eyebrow">BONUS AREA</div>
                <h2>🌻 HOA ĐÃ NỞ — KIẾM THÊM ĐIỂM</h2>
                <p>Chọn thử thách nhỏ bạn muốn tham gia nhé!</p>
              </div>

              <div className="bonusSign" aria-hidden="true">
                <span>Cùng tinie</span>
                <b>lan tỏa thêm
                nhiều ánh sáng
                nhé! 💛</b>
              </div>
            </div>

            <div className="bonusInteractionRow">
              <div className="bonusMascotSide">
                <img
                  src="/assets/tinie.png"
                  alt="Tinie ôm giỏ hoa hướng dương"
                  className="bonusMascot"
                />
              </div>

              <div className="bonusCardsGrid">
                {BONUS_MISSIONS.filter(m => m.id !== 'spotify_extra').map(m => {
                  const state = bonusStates[m.id] || { progress: 0, status: 'locked' };
                  const latest = submissions[m.id];
                  const pending = state.status === 'pending_review';
                  const rejected = latest?.status === 'rejected';
                  const completed = Number(state.progress || 0) >= Number(m.target || 0);

                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`bonusMissionCard ${completed ? 'is-completed' : ''} ${pending ? 'is-pending' : ''}`}
                      onClick={() => setSelected(m)}
                    >
                      <div className="bonusCardLogo">
                        <img src={m.logo} alt="" />
                      </div>

                      <div className="bonusCardAction">{m.action}</div>
                      <h3>{m.name}</h3>
                      <p>{m.rule}</p>

                      <div className="bonusCardProgress">
                        <div className="progressTrack">
                          <span
                            style={{
                              width: `${Math.min(100, (Number(state.progress || 0) / Number(m.target || 1)) * 100)}%`
                            }}
                          />
                        </div>
                        <div className="bonusCardBottom">
                          <b>{Number(state.progress || 0)}/{m.target}</b>
                          <small>
                            {completed
                              ? '✓ MAX'
                              : pending
                                ? '⏳ CHỜ DUYỆT'
                                : rejected
                                  ? '↻ SUBMIT LẠI'
                                  : 'ĐANG MỞ'}
                          </small>
                        </div>
                      </div>

                      <span className="bonusStartButton">
                        {completed ? 'XEM' : pending ? 'CHỜ DUYỆT' : 'BẮT ĐẦU'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="bonusFinishButton"
              onClick={requestFinishBonus}
            >
              🏁 KẾT THÚC THỬ THÁCH
            </button>
          </section>
        )}

        <div className="ground">
          <div className="fence" />
          <div className="grassBits">✿　✿　✿　✿　✿</div>
          <div className="tools">
            <span>♢</span>
            <span>♧</span>
            <span>⌁</span>
          </div>
        </div>

        <section className="bottomPanel">
          <button
            className="backButton"
            onClick={finished ? advanceToNextDay : reset}
            disabled={finished && advancingDay}
          >
            {finished ? '→' : '↶'}
            <span>{finished ? 'NGÀY TIẾP THEO' : 'CHƠI LẠI'}</span>
          </button>

          <div className="currentBox">
            <small>
              {finished ? '🌻 HOA ĐÃ NỞ!' : '🌱 BẠN ĐANG Ở NHIỆM VỤ'}
            </small>

            <strong>
              {finished ? 'HOÀN THÀNH TẤT CẢ' : currentMission.action}
            </strong>

            <span>
              {finished
                ? 'Cảm ơn bạn đã cùng chăm sóc bông hoa!'
                : currentMission.name}
            </span>
          </div>

          <div className="mascotBox">
            <img
              src="/assets/tinie.png"
              alt="Tinie"
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="totalBox">
            <small>TỔNG ĐIỂM</small>
            <b>
              ● {score}
              <i> PTS</i>
            </b>
          </div>
        </section>

        <style>{`
          .tinieMissionWrapper {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            overflow: visible;
          }

          .tinieActionAsset,
          .tinieLockedAsset {
            display: block;
            width: auto;
            height: 142px;
            max-width: 170px;
            object-fit: contain;
            object-position: bottom center;
          }

          .tinieActionAsset {
            animation: tinieMissionBob 1.8s ease-in-out infinite;
            transform-origin: bottom center;
          }

          .tinieLockedAsset {
            height: 118px;
            opacity: .88;
          }

          @keyframes tinieMissionBob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @media (max-width: 700px) {
            .tinieActionAsset { height: 112px; }
            .tinieLockedAsset { height: 94px; }
          }
        `}</style>


      <style>{`
        .bonusFlowOverlay {
          position: fixed;
          inset: 0;
          z-index: 1600;
          display: grid;
          place-items: center;
          padding: 16px;
          box-sizing: border-box;
          background: rgba(20, 31, 26, .55);
          backdrop-filter: blur(4px);
        }

        .bonusFlowModal {
          position: relative;
          width: min(520px, calc(100vw - 28px));
          max-height: min(720px, calc(100dvh - 30px));
          overflow: auto;
          box-sizing: border-box;
          padding: 22px;
          border-radius: 24px;
          border: 2px solid #2c4738;
          background: #fffdf6;
          color: #18372a;
          box-shadow: 0 24px 80px rgba(0, 0, 0, .28);
          text-align: center;
        }

        .bonusFlowModal.compact {
          width: min(470px, calc(100vw - 28px));
          padding: 18px 20px;
        }

        .bonusFlowClose {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 2px solid #2c4738;
          background: #17382a;
          color: #fff;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
        }

        .bonusFlowEyebrow {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .14em;
          opacity: .62;
          margin-top: 2px;
        }

        .bonusFlowModal h2 {
          margin: 6px 30px 10px;
          line-height: 1.15;
          font-size: clamp(22px, 5vw, 30px);
        }

        .bonusFlowTinie {
          display: block;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          margin: 6px auto 10px;
        }

        .bonusFlowTinie.small { height: 92px; }
        .bonusFlowTinie.tiny { height: 72px; }

        .bonusFlowLead,
        .bonusFlowText {
          margin: 8px auto;
          max-width: 420px;
          line-height: 1.55;
          color: #314b3d;
        }

        .bonusFlowLead {
          font-size: 17px;
        }

        .bonusFlowRules {
          display: grid;
          gap: 7px;
          margin: 14px 0;
          padding: 12px 14px;
          border-radius: 14px;
          background: #edf8e6;
          text-align: left;
          font-size: 13px;
          color: #31573c;
        }

        .bonusFlowActions {
          display: grid;
          gap: 9px;
          margin-top: 14px;
        }

        .bonusFlowPrimary,
        .bonusFlowSecondary {
          width: 100%;
          min-height: 44px;
          border-radius: 13px;
          padding: 10px 14px;
          font-weight: 900;
          cursor: pointer;
          font-size: 13px;
        }

        .bonusFlowPrimary {
          border: 2px solid #2c4738;
          background: #2f7d4f;
          color: #fff;
        }

        .bonusFlowSecondary {
          border: 2px solid #9cb39d;
          background: #fffdf6;
          color: #294536;
        }

        .bonusFlowPrimary:disabled,
        .bonusFlowSecondary:disabled {
          opacity: .62;
          cursor: not-allowed;
        }

        .bonusStandalonePage {
          width: min(100%, 1220px);
          min-height: calc(100dvh - 118px);
          margin: 22px auto 0;
          align-self: stretch;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .garden.bonusOnlyMode > .sky,
        .garden.bonusOnlyMode > .ground {
          display: none !important;
        }

        .garden.bonusOnlyMode .sky {
          min-height: 100%;
        }

        @media (max-width: 720px) {
          .bonusStandalonePage {
            min-height: calc(100dvh - 92px);
            margin-top: 10px;
          }
        }

        .bonusAreaWide {
          width: min(100%, 1220px);
          margin: 30px auto 0;
          padding: 22px 24px 20px;
          box-sizing: border-box;
          border-radius: 24px;
          background: linear-gradient(180deg, #eef8d7 0%, #d9edbe 100%);
          border: 1px solid rgba(61, 111, 70, .18);
          box-shadow: 0 18px 48px rgba(58, 90, 52, .12);
        }

        .bonusHeaderRow {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 16px;
        }

        .bonusHeaderCopy h2 {
          margin: 4px 0 4px;
          color: #194e2f;
          font-size: clamp(22px, 3vw, 34px);
          line-height: 1.08;
        }

        .bonusHeaderCopy p {
          margin: 0;
          color: #49614b;
          font-size: 14px;
        }

        .bonusSign {
          flex: 0 0 175px;
          position: relative;
          padding: 14px 12px 12px;
          text-align: center;
          color: #5b4e2d;
          background: #f2d78c;
          border: 2px solid #b89042;
          border-radius: 10px;
          box-shadow: 0 8px 0 rgba(112, 82, 31, .10);
          transform: rotate(2deg);
          font-size: 12px;
        }

        .bonusSign::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -34px;
          width: 10px;
          height: 36px;
          transform: translateX(-50%);
          background: #9a6f37;
          border-radius: 0 0 6px 6px;
        }

        .bonusSign span {
          display: block;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .bonusSign b {
          display: block;
          line-height: 1.35;
        }

        .bonusInteractionRow {
          display: grid;
          grid-template-columns: minmax(150px, 205px) 1fr;
          gap: 18px;
          align-items: center;
        }

        .bonusMascotSide {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          min-height: 250px;
        }

        .bonusMascot {
          display: block;
          width: min(100%, 190px);
          max-height: 245px;
          object-fit: contain;
          filter: drop-shadow(0 10px 15px rgba(46, 78, 42, .13));
        }

        .bonusCardsGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(120px, 1fr));
          gap: 12px;
          align-items: stretch;
        }

        .bonusMissionCard {
          appearance: none;
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 13px 12px 12px;
          border: 2px solid #5f9465;
          border-radius: 16px;
          background: rgba(255, 255, 251, .95);
          color: #214531;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(60, 93, 52, .08);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }

        .bonusMissionCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(60, 93, 52, .12);
          border-color: #3f7b4c;
        }

        .bonusMissionCard.is-completed {
          border-color: #2f7d4f;
          background: #f5fbe9;
        }

        .bonusMissionCard.is-pending {
          opacity: .86;
        }

        .bonusCardLogo {
          width: 36px;
          height: 36px;
          margin-bottom: 7px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #fff;
          border: 1px solid #dfe8d7;
        }

        .bonusCardLogo img {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }

        .bonusCardAction {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .09em;
          color: #63806a;
        }

        .bonusMissionCard h3 {
          margin: 2px 0 5px;
          font-size: 14px;
          line-height: 1.1;
          color: #214c30;
        }

        .bonusMissionCard p {
          flex: 1;
          min-height: 48px;
          margin: 0 0 9px;
          font-size: 10px;
          line-height: 1.35;
          color: #526457;
        }

        .bonusCardProgress {
          margin-top: auto;
        }

        .progressTrack {
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: #e5e8df;
        }

        .progressTrack span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #d4b63d;
        }

        .bonusCardBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          margin-top: 6px;
        }

        .bonusCardBottom b {
          font-size: 11px;
        }

        .bonusCardBottom small {
          font-size: 8px;
          font-weight: 900;
          color: #6f7c6e;
          text-align: right;
        }

        .bonusStartButton {
          display: grid;
          place-items: center;
          min-height: 31px;
          margin-top: 9px;
          border-radius: 9px;
          background: #4a9a61;
          color: white;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .06em;
        }

        .bonusFinishButton {
          display: block;
          width: min(100%, 390px);
          margin: 16px auto 0;
          padding: 11px 18px;
          border: 2px solid #c99f37;
          border-radius: 12px;
          background: #ffe49a;
          color: #3e4b31;
          font-weight: 900;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 4px 0 rgba(127, 96, 31, .10);
        }

        @media (max-width: 1050px) {
          .bonusInteractionRow {
            grid-template-columns: 1fr;
          }

          .bonusMascotSide {
            min-height: 0;
          }

          .bonusMascot {
            max-height: 155px;
          }

          .bonusCardsGrid {
            grid-template-columns: repeat(3, minmax(150px, 1fr));
          }
        }

        @media (max-width: 720px) {
          .bonusAreaWide {
            padding: 16px 12px 16px;
            border-radius: 18px;
          }

          .bonusHeaderRow {
            flex-direction: column;
          }

          .bonusSign {
            align-self: center;
          }

          .bonusCardsGrid {
            grid-template-columns: repeat(2, minmax(130px, 1fr));
          }
        }

        @media (max-width: 470px) {
          .bonusCardsGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

        {bonusFlow !== 'active' && (
          <div className="finishBanner" data-open={finished}>
            {finished
              ? '🌻 SUNFLOWER BLOOMED · MISSION COMPLETE'
              : 'HOÀN THÀNH 5 NHIỆM VỤ ĐỂ NHẬN QUÀ 🌻'}
          </div>
        )}
      </main>

      {finished && bonusFlow === 'congrats' && (
        <div
          className="bonusFlowOverlay"
          onClick={e => e.target === e.currentTarget && setBonusFlow(null)}
        >
          <div className="bonusFlowModal compact">
            <div className="bonusFlowEyebrow">SUNFLOWER HARVEST 🌻</div>
            <h2>Chúc mừng bạn! 🌻</h2>
            <img
              className="bonusFlowTinie small"
              src="/assets/tinie.png"
              alt="Tinie ôm giỏ hoa hướng dương"
            />
            <p className="bonusFlowLead">
              Bạn đã hoàn thành đủ <b>5 nhiệm vụ hôm nay</b> và
              <br />
              <b>thu hoạch được 1 bông hướng dương!</b> 🌻
            </p>
            <div
              style={{
                margin: '12px 0',
                padding: '10px 14px',
                borderRadius: 12,
                background: '#fff7cf',
                border: '1px solid #e5bd41',
                fontWeight: 900
              }}
            >
              🌻 TỔNG HOA ĐÃ THU HOẠCH: {sunflowerCount + 1}
            </div>
            <p className="bonusFlowText">
              Điểm của bạn vẫn được giữ nguyên. Sẵn sàng chăm 5 nhiệm vụ mới
              cho ngày tiếp theo nhé! 💛
            </p>
            <button
              className="bonusFlowPrimary"
              onClick={advanceToNextDay}
              disabled={advancingDay}
            >
              {advancingDay
                ? 'ĐANG MỞ NGÀY MỚI...'
                : `🌱 CHUYỂN SANG NGÀY ${dayNumber + 1}`}
            </button>
          </div>
        </div>
      )}
      {false && finished && bonusFlow === 'invite' && (
        <div
          className="bonusFlowOverlay"
          onClick={e => e.target === e.currentTarget && setBonusFlow(null)}
        >
          <div className="bonusFlowModal compact">
            <button className="bonusFlowClose" onClick={() => setBonusFlow(null)}>×</button>
            <div className="bonusFlowEyebrow">EXTRA CHALLENGE</div>
            <h2>THỬ THÁCH NHỎ — NHẬN THÊM ĐIỂM! 🌻</h2>
            <p className="bonusFlowText">
              Nếu muốn đạt thêm điểm, hãy tham gia 4 thử thách nhỏ của chúng mình nhé!
            </p>
            <div className="bonusFlowRules">
              <span>🌱 Bạn có thể chọn bất kỳ thử thách nào.</span>
              <span>💚 Mỗi thử thách có điều kiện và số điểm riêng.</span>
              <span>⏸ Bạn có thể dừng lại bất cứ lúc nào.</span>
              <span>🎁 Điểm chỉ được cộng sau khi admin duyệt thành công.</span>
            </div>
            <div className="bonusFlowActions">
              <button className="bonusFlowPrimary" onClick={startBonusChallenge} disabled={bonusStarting}>
                {bonusStarting ? 'ĐANG MỞ...' : 'THAM GIA THỬ THÁCH NHỎ'}
              </button>
              <button className="bonusFlowSecondary" onClick={declineBonusChallenge} disabled={bonusStarting}>
                ĐỂ NGÀY SAU NHÉ
              </button>
            </div>
          </div>
        </div>
      )}

      {false && finished && bonusFlow === 'declined' && (
        <div className="bonusFlowOverlay">
          <div className="bonusFlowModal compact">
            <button className="bonusFlowClose" onClick={returnToMainMission}>×</button>
            <div className="bonusFlowEyebrow">HẸN LẠI NHA 🌻</div>
            <h2>Hẹn tinie vào ngày tiếp theo nhé!</h2>
            <img
              className="bonusFlowTinie small"
              src="/assets/tinie.png"
              alt="Tinie ôm hoa"
            />
            <p className="bonusFlowText">
              Hãy giữ chuỗi và thu hoạch được nhiều hướng dương tặng lighT nha! 💛
            </p>
            <button className="bonusFlowPrimary" onClick={returnToMainMission}>
              VỀ 5 CHẶNG CHÍNH
            </button>
          </div>
        </div>
      )}

      {false && finished && bonusFlow === 'finish-confirm' && (
        <div
          className="bonusFlowOverlay"
          onClick={e => e.target === e.currentTarget && setBonusFlow('active')}
        >
          <div className="bonusFlowModal compact">
            <button className="bonusFlowClose" onClick={() => setBonusFlow('active')}>×</button>
            <div className="bonusFlowEyebrow">BONUS CHALLENGE</div>
            <h2>KẾT THÚC THỬ THÁCH NHỎ?</h2>
            <img
              className="bonusFlowTinie tiny"
              src="/assets/tinie.png"
              alt="Tinie"
            />
            <p className="bonusFlowText">
              Bạn có chắc muốn dừng các thử thách nhỏ? Bạn vẫn có thể tham gia lại vào ngày mai.
            </p>
            <div className="bonusFlowActions">
              <button className="bonusFlowPrimary" onClick={finishBonusChallenge}>
                ĐỒNG Ý, KẾT THÚC
              </button>
              <button className="bonusFlowSecondary" onClick={() => setBonusFlow('active')}>
                TIẾP TỤC LÀM THÊM
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <MissionModal
          mission={selected}
          count={
            selected.mission_type === 'bonus'
              ? bonusStates[selected.id]?.progress ?? 0
              : counts[selected.id]
          }
          status={
            selected.mission_type === 'bonus'
              ? bonusStates[selected.id]?.status ?? 'locked'
              : statuses[selected.id]
          }
          latestSubmission={submissions[selected.id] || null}
          close={() => setSelected(null)}
          onSubmitted={async () => {
            setSelected(null);
            await loadGame(true);
          }}
          notify={notify}
        />
      )}

      {adminOpen && profile?.role === 'admin' && (
        <AdminDashboard
          onClose={() => setAdminOpen(false)}
          notify={notify}
        />
      )}

      {leaderboardOpen && (
        <LeaderboardModal
          onClose={() => setLeaderboardOpen(false)}
        />
      )}

      {menu && (
        <>
          <aside className="menuPanel">
            <button className="close" onClick={() => setMenu(false)}>
              ×
            </button>

            <h2>PAUSE MENU</h2>

            <button onClick={() => setMenu(false)}>
              🌻 GROW WITH THE lighT
            </button>

            <button
              onClick={() => {
                setMenu(false);
                setLeaderboardOpen(true);
              }}
            >
              🏆 LEADERBOARD
            </button>

            {profile?.role === 'admin' && (
              <button
                onClick={() => {
                  setMenu(false);
                  setAdminOpen(true);
                }}
              >
                🔔 ADMIN DASHBOARD
              </button>
            )}

            <button onClick={exportMyExcel}>📊 XUẤT EXCEL</button>
            <button onClick={reset}>↻ RESET JOURNEY</button>
            <button onClick={signOut}>🚪 ĐĂNG XUẤT</button>

            <div>
              {profile?.username || 'PLAYER 001'}
              <br />
              <b>{score} PTS</b>
            </div>
          </aside>

          <div
            className="overlay"
            onClick={() => setMenu(false)}
          />
        </>
      )}

      {toast && <div className="toast">{toast}</div>}

      {refreshing && (
        <div className="syncIndicator">Đang đồng bộ...</div>
      )}
    </div>
  );
}

function LeaderboardModal({ onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('user_id, username, avatar_url, total_points, score_reached_at, rank')
        .order('rank', { ascending: true })
        .limit(50);

      if (!active) return;

      if (error) console.error('leaderboard:', error);
      setRows(data || []);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="modalOverlay"
      onClick={onClose}
      style={{ zIndex: 1200 }}
    >
      <section
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 760,
          width: 'min(760px, calc(100vw - 28px))'
        }}
      >
        <button className="modalClose" onClick={onClose}>
          ×
        </button>

        <small>WORLD RANKING</small>
        <h2>🏆 LEADERBOARD</h2>
        <p>Xếp hạng theo điểm; cùng điểm thì ai đạt mốc điểm đó sớm hơn sẽ đứng trước.</p>

        {loading ? (
          <p>Đang tải...</p>
        ) : rows.length === 0 ? (
          <p>Chưa có dữ liệu.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
            {rows.map(row => (
              <div
                key={row.user_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 14,
                  border: row.rank <= 3 ? '2px solid #efc84f' : '1px solid #d7ddd3',
                  background: row.rank <= 3 ? '#fff7cf' : '#fff'
                }}
              >
                <b>#{row.rank}</b>
                <div>
                  <b>{row.username || 'PLAYER'}</b>
                  {row.score_reached_at && (
                    <small style={{ display: 'block', opacity: .55 }}>
                      {new Date(row.score_reached_at).toLocaleString('vi-VN')}
                    </small>
                  )}
                </div>
                <strong>{row.total_points} PTS</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AdminDashboard({ onClose, notify, fullScreen = false }) {
  const [tab, setTab] = useState('pending-main');
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [userEmails, setUserEmails] = useState({});
  const [ledger, setLedger] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [details, setDetails] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewingDecision, setReviewingDecision] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [bonusAwardPoints, setBonusAwardPoints] = useState('');
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);

  const loadAdmin = async () => {
    setLoading(true);

    try {
      const { data: { user: currentAdmin } } = await supabase.auth.getUser();
      if (!currentAdmin?.id) throw new Error('Phiên admin đã hết.');

      const [
        submissionsRes,
        profilesRes,
        ledgerRes,
        leaderboardRes,
        emailsRes,
        adminNotiRes
      ] = await Promise.all([
        supabase
          .from('mission_submissions')
          .select(`
            id,
            user_id,
            mission_id,
            parent_submission_id,
            attempt_no,
            post_url,
            content_url,
            platform,
            account_id,
            redeem_code,
            external_action_id,
            quantity,
            activity_date,
            points_awarded,
            note,
            status,
            admin_comment,
            submitted_at,
            reviewed_at,
            missions(slug, name, action, mission_type, target, points, unit_quantity, points_per_unit, max_points)
          `)
          .eq('status', 'pending')
          .order('submitted_at', { ascending: false }),

        supabase
          .from('profiles')
          .select('id, username, avatar_url, role, total_points, created_at, updated_at')
          .order('created_at', { ascending: true }),

        supabase
          .from('point_ledger')
          .select('id, user_id, points, source_type, source_id, mission_id, submission_id, reason, admin_id, created_at')
          .order('created_at', { ascending: false })
          .limit(300),

        supabase
          .from('leaderboard')
          .select('user_id, username, avatar_url, total_points, score_reached_at, rank')
          .order('rank', { ascending: true })
          .limit(100),

        supabase.rpc('get_admin_user_emails'),

        supabase
          .from('admin_notifications')
          .select('id, admin_id, type, title, message, submission_id, read_at, created_at')
          .eq('admin_id', currentAdmin.id)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      /*
       * The pending-submission list is the critical part of the admin screen.
       * Do not let an unrelated error in leaderboard/emails/notifications make
       * the whole admin load fail and leave the pending list stale/empty.
       */
      if (submissionsRes.error) {
        throw submissionsRes.error;
      }

      if (profilesRes.error) console.error('admin profiles:', profilesRes.error);
      if (ledgerRes.error) console.error('admin ledger:', ledgerRes.error);
      if (leaderboardRes.error) console.error('admin leaderboard:', leaderboardRes.error);
      if (emailsRes.error) console.error('admin emails:', emailsRes.error);
      if (adminNotiRes.error) console.error('admin notifications:', adminNotiRes.error);

      // Always update the pending queue when its own query succeeded.
      setPending(submissionsRes.data || []);
      setUsers(profilesRes.data || []);
      setUserEmails(
        Object.fromEntries(
          (emailsRes.data || []).map(row => [row.user_id, row.email])
        )
      );
      setLedger(ledgerRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
      setAdminNotifications(adminNotiRes.data || []);
      setUnreadAdminCount(
        (adminNotiRes.data || []).filter(n => !n.read_at).length
      );
    } catch (error) {
      console.error('admin load:', error);
      notify(error?.message || 'Không tải được dữ liệu admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();

    const timer = window.setInterval(loadAdmin, 12000);
    return () => window.clearInterval(timer);
  }, []);

  const openSubmission = async submission => {
    setSelectedSubmission(submission);
    setRejectReason('');
    setReviewError('');
    setBonusAwardPoints('');
    setDetails(null);
    setSelectedEvidence(null);

    const [evidenceRpc, itemsRpc] = await Promise.all([
      supabase.rpc('get_admin_submission_evidence', {
        p_submission_id: submission.id
      }),
      supabase.rpc('get_admin_submission_items', {
        p_submission_id: submission.id
      })
    ]);

    let evidenceRows = evidenceRpc.data || [];
    let evidenceError = evidenceRpc.error || null;

    if (evidenceError) {
      const direct = await supabase
        .from('submission_evidence')
        .select('*')
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: true });

      evidenceRows = direct.data || [];
      evidenceError = direct.error || null;
    }

    let itemRows = itemsRpc.data || [];
    let itemError = itemsRpc.error || null;

    if (itemError) {
      const direct = await supabase
        .from('mission_submission_items')
        .select('*')
        .eq('submission_id', submission.id)
        .order('item_no', { ascending: true });

      itemRows = direct.data || [];
      itemError = direct.error || null;
    }

    if (evidenceError) {
      console.error('admin evidence:', evidenceError);
    }

    if (itemError) {
      console.error('admin items:', itemError);
    }

    const evidence = [];

    for (const item of evidenceRows || []) {
      const bucket =
        item.storage_bucket ||
        item.bucket_id ||
        'mission-evidence';

      const storagePath =
        item.storage_path ||
        item.path ||
        item.file_path ||
        '';

      let signedUrl = null;
      let signedUrlError = null;

      if (storagePath) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(storagePath, 60 * 60);

        if (!error) {
          signedUrl = data?.signedUrl || null;
        } else {
          signedUrlError = error.message;
        }
      } else {
        signedUrlError = 'Evidence record không có storage path.';
      }

      evidence.push({
        ...item,
        storage_path: storagePath,
        storage_bucket: bucket,
        signedUrl,
        signedUrlError
      });
    }

    setDetails({
      evidence,
      items: itemRows || []
    });
  };

  const adminUser = userId => {
    const user = users.find(u => u.id === userId);
    return {
      username: user?.username || 'PLAYER',
      email: userEmails[userId] || ''
    };
  };

  const review = async decision => {
    if (!selectedSubmission || reviewingDecision) return;

    if (
      selectedSubmission?.missions?.mission_type === 'bonus' &&
      selectedSubmission?.missions?.slug !== 'spotify_extra' &&
      decision === 'approved'
    ) {
      const pts = Number(bonusAwardPoints);
      if (!Number.isInteger(pts) || pts < 0) {
        setReviewError('Hãy nhập số điểm bonus hợp lệ.');
        return;
      }
    }

    if (decision === 'rejected' && !rejectReason.trim()) {
      setReviewError('Vui lòng nhập lý do từ chối trước khi REJECT.');
      return;
    }

    setReviewError('');
    setReviewingDecision(decision);

    try {
      const isBonusSubmission = selectedSubmission?.missions?.mission_type === 'bonus';
      const { data, error } = isBonusSubmission
        ? await supabase.rpc('review_bonus_mission_submission', {
            p_submission_id: selectedSubmission.id,
            p_decision: decision,
            // Spotify Extra points are calculated securely by the database.
            p_points:
              selectedSubmission?.missions?.slug === 'spotify_extra'
                ? 0
                : decision === 'approved'
                  ? Number(bonusAwardPoints || 0)
                  : 0,
            p_comment: decision === 'rejected' ? rejectReason.trim() : null
          })
        : await supabase.rpc('review_mission_submission', {
            p_submission_id: selectedSubmission.id,
            p_decision: decision,
            p_comment: decision === 'rejected' ? rejectReason.trim() : null
          });

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      const awarded = result?.points_awarded ?? 0;

      notify(
        decision === 'approved'
          ? `Đã duyệt · +${awarded} điểm`
          : 'Đã từ chối submission.'
      );

      setSelectedEvidence(null);
      setSelectedSubmission(null);
      setDetails(null);
      setRejectReason('');
      setReviewError('');
      setBonusAwardPoints('');

      await loadAdmin();
    } catch (error) {
      console.error('review:', error);
      setReviewError(error?.message || 'Không thể review submission.');
      notify(error?.message || 'Không thể review submission.');
    } finally {
      setReviewingDecision(null);
    }
  };

  const markAdminNotificationRead = async id => {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error(error);
      return;
    }

    await loadAdmin();
  };

  const exportExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      const [
        profilesRes,
        missionsRes,
        submissionsRes,
        itemsRes,
        evidenceRes,
        ledgerRes
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, avatar_url, role, total_points, created_at'),

        supabase
          .from('missions')
          .select(`
            id,
            slug,
            name,
            action,
            description,
            hint,
            target,
            points,
            logo_url,
            sort_order,
            is_active,
            mission_type,
            unlock_rule,
            unit_quantity,
            points_per_unit,
            max_points,
            is_repeatable,
            resource_url,
            proof_note
          `)
          .order('sort_order', { ascending: true }),

        supabase
          .from('mission_submissions')
          .select(`
            id,
            user_id,
            mission_id,
            attempt_no,
            post_url,
            note,
            status,
            admin_comment,
            reviewed_by,
            submitted_at,
            reviewed_at,
            platform,
            content_url,
            account_id,
            redeem_code,
            external_action_id,
            quantity,
            points_awarded,
            verified_at,
            activity_date
          `)
          .eq('status', 'approved')
          .order('submitted_at', { ascending: false }),

        supabase
          .from('mission_submission_items')
          .select(`
            id,
            submission_id,
            item_no,
            platform,
            content_url,
            account_id,
            redeem_code,
            external_action_id,
            quantity,
            metadata,
            created_at,
            counted_at,
            proof_source
          `)
          .order('item_no', { ascending: true }),

        supabase
          .from('submission_evidence')
          .select(`
            id,
            submission_id,
            evidence_type,
            storage_bucket,
            storage_path,
            original_filename,
            mime_type,
            file_size,
            created_at,
            item_no
          `)
          .order('item_no', { ascending: true })
          .order('created_at', { ascending: true }),

        supabase
          .from('point_ledger')
          .select(`
            id,
            user_id,
            points,
            source_type,
            source_id,
            mission_id,
            submission_id,
            reason,
            admin_id,
            created_at
          `)
          .order('created_at', { ascending: false })
      ]);

      const results = [
        profilesRes,
        missionsRes,
        submissionsRes,
        itemsRes,
        evidenceRes,
        ledgerRes
      ];

      const failed = results.find(r => r.error);
      if (failed?.error) throw failed.error;

      const profiles = profilesRes.data || [];
      const missions = missionsRes.data || [];
      const approvedSubmissions = submissionsRes.data || [];
      const allItems = itemsRes.data || [];
      const allEvidence = evidenceRes.data || [];
      const ledger = ledgerRes.data || [];

      const profileMap = Object.fromEntries(
        profiles.map(p => [
          p.id,
          {
            username: p.username || 'PLAYER',
            role: p.role || 'user'
          }
        ])
      );

      const missionMap = Object.fromEntries(
        missions.map(m => [m.id, m])
      );

      const approvedIds = new Set(
        approvedSubmissions.map(s => s.id)
      );

      const approvedItems = allItems.filter(item =>
        approvedIds.has(item.submission_id)
      );

      const approvedEvidence = allEvidence.filter(e =>
        approvedIds.has(e.submission_id)
      );

      /*
       * Create signed URLs for every approved proof image/file.
       * Excel contains the direct clickable URL where possible.
       */
      const evidenceWithUrls = [];

      for (const evidence of approvedEvidence) {
        const bucket =
          evidence.storage_bucket || 'mission-evidence';

        let signedUrl = '';

        if (evidence.storage_path) {
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(
              evidence.storage_path,
              60 * 60 * 24 * 7
            );

          if (!error) {
            signedUrl = data?.signedUrl || '';
          }
        }

        evidenceWithUrls.push({
          ...evidence,
          signed_url: signedUrl
        });
      }

      const evidenceBySubmission = {};
      for (const e of evidenceWithUrls) {
        if (!evidenceBySubmission[e.submission_id]) {
          evidenceBySubmission[e.submission_id] = [];
        }
        evidenceBySubmission[e.submission_id].push(e);
      }

      const itemsBySubmission = {};
      for (const item of approvedItems) {
        if (!itemsBySubmission[item.submission_id]) {
          itemsBySubmission[item.submission_id] = [];
        }
        itemsBySubmission[item.submission_id].push(item);
      }

      /*
       * MAIN CHECKING SHEET:
       * exactly one row per APPROVED submission, containing everything
       * needed to audit what the user submitted and what Admin approved.
       */
      const approvedRows = approvedSubmissions.map(s => {
        const profile = profileMap[s.user_id] || {};
        const mission = missionMap[s.mission_id] || {};
        const items = itemsBySubmission[s.id] || [];
        const evidence = evidenceBySubmission[s.id] || [];

        const itemText = items
          .map(item => {
            const parts = [
              `#${item.item_no}`,
              item.platform || '',
              item.account_id
                ? `Account: ${item.account_id}`
                : '',
              item.content_url
                ? `Link: ${item.content_url}`
                : '',
              item.redeem_code
                ? `Redeem: ${item.redeem_code}`
                : '',
              item.quantity != null
                ? `Qty: ${item.quantity}`
                : '',
              item.proof_source
                ? `Proof source: ${item.proof_source}`
                : '',
              item.metadata &&
              Object.keys(item.metadata || {}).length
                ? `Metadata: ${JSON.stringify(item.metadata)}`
                : ''
            ].filter(Boolean);

            return parts.join(' | ');
          })
          .join('\n');

        const evidenceText = evidence
          .map(e => {
            const label =
              e.original_filename ||
              `${e.evidence_type || 'proof'}${e.item_no ? ` · item ${e.item_no}` : ''}`;

            return e.signed_url
              ? `${label} — ${e.signed_url}`
              : `${label} — ${e.storage_path || ''}`;
          })
          .join('\n');

        return {
          'Submission ID': s.id,
          'User ID': s.user_id,
          'Username': profile.username || 'PLAYER',
          'Mission': mission.name || '',
          'Mission Slug': mission.slug || '',
          'Mission Type': mission.mission_type || '',
          'Action': mission.action || '',
          'Attempt': s.attempt_no,
          'Status': s.status,
          'Platform': s.platform || '',
          'Post URL': s.post_url || '',
          'Content URL': s.content_url || '',
          'Account ID': s.account_id || '',
          'Redeem Code': s.redeem_code || '',
          'External Action ID': s.external_action_id || '',
          'Quantity': s.quantity,
          'Activity Date': s.activity_date || '',
          'User Note': s.note || '',
          'Submitted At': s.submitted_at
            ? new Date(s.submitted_at).toLocaleString('vi-VN')
            : '',
          'Approved At': s.reviewed_at
            ? new Date(s.reviewed_at).toLocaleString('vi-VN')
            : '',
          'Verified At': s.verified_at
            ? new Date(s.verified_at).toLocaleString('vi-VN')
            : '',
          'Points Awarded': s.points_awarded || 0,
          'Admin Comment': s.admin_comment || '',
          'Submitted Items': itemText,
          'Proof / Evidence': evidenceText
        };
      });

      const approvedItemRows = approvedItems.map(item => {
        const submission =
          approvedSubmissions.find(
            s => s.id === item.submission_id
          ) || {};

        const profile = profileMap[submission.user_id] || {};
        const mission =
          missionMap[submission.mission_id] || {};

        return {
          'Submission ID': item.submission_id,
          'User ID': submission.user_id || '',
          'Username': profile.username || 'PLAYER',
          'Mission': mission.name || '',
          'Mission Slug': mission.slug || '',
          'Submission Status': submission.status || '',
          'Item No': item.item_no,
          'Platform': item.platform || '',
          'Account ID': item.account_id || '',
          'Content URL': item.content_url || '',
          'Redeem Code': item.redeem_code || '',
          'External Action ID': item.external_action_id || '',
          'Quantity': item.quantity,
          'Proof Source': item.proof_source || '',
          'Metadata': item.metadata
            ? JSON.stringify(item.metadata)
            : '',
          'Created At': item.created_at || ''
        };
      });

      const approvedEvidenceRows = evidenceWithUrls.map(e => {
        const submission =
          approvedSubmissions.find(
            s => s.id === e.submission_id
          ) || {};

        const profile = profileMap[submission.user_id] || {};
        const mission =
          missionMap[submission.mission_id] || {};

        return {
          'Submission ID': e.submission_id,
          'User ID': submission.user_id || '',
          'Username': profile.username || 'PLAYER',
          'Mission': mission.name || '',
          'Mission Slug': mission.slug || '',
          'Submission Status': submission.status || '',
          'Item No': e.item_no || '',
          'Evidence Type': e.evidence_type || '',
          'Original Filename': e.original_filename || '',
          'Storage Bucket': e.storage_bucket || '',
          'Storage Path': e.storage_path || '',
          'Proof URL': e.signed_url || '',
          'Mime Type': e.mime_type || '',
          'File Size (bytes)': e.file_size || '',
          'Created At': e.created_at || ''
        };
      });

      const approvedLedgerRows = ledger
        .filter(row =>
          row.submission_id &&
          approvedIds.has(row.submission_id)
        )
        .map(row => {
          const profile = profileMap[row.user_id] || {};
          const mission = missionMap[row.mission_id] || {};

          return {
            'Ledger ID': row.id,
            'Submission ID': row.submission_id,
            'User ID': row.user_id,
            'Username': profile.username || 'PLAYER',
            'Mission': mission.name || '',
            'Points': row.points,
            'Source Type': row.source_type,
            'Reason': row.reason,
            'Admin ID': row.admin_id || '',
            'Created At': row.created_at
              ? new Date(row.created_at).toLocaleString('vi-VN')
              : ''
          };
        });

      /*
       * Keep general reference sheets too.
       */
      const userRows = profiles.map(p => ({
        'User ID': p.id,
        Username: p.username || 'PLAYER',
        Role: p.role,
        'Total Points': p.total_points,
        'Created At': p.created_at
          ? new Date(p.created_at).toLocaleString('vi-VN')
          : ''
      }));

      const missionRows = missions.map(m => ({
        'Mission ID': m.id,
        Slug: m.slug,
        Name: m.name,
        Action: m.action,
        Type: m.mission_type,
        Target: m.target,
        Points: m.points,
        'Unit Quantity': m.unit_quantity,
        'Points / Unit': m.points_per_unit,
        'Max Points': m.max_points,
        'Sort Order': m.sort_order,
        Active: m.is_active
      }));

      const wb = XLSX.utils.book_new();

      const append = (name, rows, hyperlinkColumns = []) => {
        const ws = XLSX.utils.json_to_sheet(rows || []);

        /*
         * Make columns readable in Excel.
         */
        const keys = rows?.length
          ? Object.keys(rows[0])
          : [];

        ws['!cols'] = keys.map(key => ({
          wch: Math.min(
            55,
            Math.max(
              12,
              key.length + 2
            )
          )
        }));

        /*
         * Turn URL cells into real Excel hyperlinks.
         * Clicking the cell opens the submitted post/evidence directly.
         */
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
        const keyToColumn = Object.fromEntries(
          keys.map((key, index) => [key, index])
        );

        for (const columnName of hyperlinkColumns) {
          const columnIndex = keyToColumn[columnName];

          if (columnIndex == null) continue;

          for (
            let rowIndex = range.s.r + 1;
            rowIndex <= range.e.r;
            rowIndex += 1
          ) {
            const address = XLSX.utils.encode_cell({
              r: rowIndex,
              c: columnIndex
            });

            const cell = ws[address];
            const value = String(cell?.v || '').trim();

            if (!cell || !/^https?:\/\//i.test(value)) continue;

            cell.l = {
              Target: value,
              Tooltip: 'Nhấn để mở'
            };
          }
        }

        XLSX.utils.book_append_sheet(wb, ws, name);
      };

      append(
        'Approved Submissions',
        approvedRows,
        ['Post URL', 'Content URL']
      );

      append(
        'Approved Items',
        approvedItemRows,
        ['Content URL']
      );

      append(
        'Approved Evidence',
        approvedEvidenceRows,
        ['Proof URL']
      );

      append(
        'Approved Points',
        approvedLedgerRows
      );

      append(
        'Users',
        userRows
      );

      append(
        'Missions',
        missionRows
      );

      XLSX.writeFile(
        wb,
        `grow-with-the-light-approved-${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`
      );

      notify(
        `Đã xuất ${approvedRows.length} submission APPROVE · link bài đăng và proof có thể bấm mở trong Excel.`
      );
    } catch (error) {
      console.error('export excel:', error);
      notify(
        error?.message ||
          'Không export được file Excel.'
      );
    }
  };

  const shellStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 1100,
    background: 'rgba(20, 31, 26, .58)',
    display: 'grid',
    placeItems: 'center',
    padding: 14
  };

  const panelStyle = {
    width: 'min(1220px, 100%)',
    height: 'min(92vh, 920px)',
    background: '#f7f2df',
    border: '3px solid #20352b',
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow: '0 25px 90px rgba(0,0,0,.32)',
    display: 'flex',
    flexDirection: 'column'
  };

  const tabButton = active => ({
    border: `2px solid ${active ? '#20352b' : '#d5d9cf'}`,
    background: active ? '#f2ca4d' : '#fffdf7',
    borderRadius: 999,
    padding: '8px 13px',
    fontWeight: 800,
    cursor: 'pointer'
  });

  return (
    <div
      style={shellStyle}
      onClick={e => {
        // In full-screen Admin mode, the surrounding overlay must not log out.
        if (!fullScreen && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        style={panelStyle}
        onClick={e => e.stopPropagation()}
      >
        <header
          style={{
            padding: '16px 18px',
            borderBottom: '2px solid #d4d6c9',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <small style={{ letterSpacing: '.08em' }}>ADMIN AREA</small>
            <h2 style={{ margin: 0 }}>
              🔔 ADMIN DASHBOARD
            </h2>
            {fullScreen && (
              <small style={{ display: 'block', marginTop: 4, opacity: .65 }}>
                Quyền quản trị · khu vực riêng
              </small>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={loadAdmin}>
              ↻ REFRESH
            </button>
            <button type="button" onClick={exportExcel}>
              📊 EXPORT EXCEL
            </button>
            {!fullScreen && (
              <button
                type="button"
                onClick={onClose}
                title="Đóng"
              >
                ×
              </button>
            )}
          </div>
        </header>

        <div
          style={{
            padding: 14,
            borderBottom: '1px solid #ddd',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            style={tabButton(tab === 'pending-main')}
            onClick={() => setTab('pending-main')}
          >
            🔔 MISSION ({pending.filter(s => s.missions?.mission_type !== 'bonus').length})
          </button>

          <button
            type="button"
            style={tabButton(tab === 'pending-bonus')}
            onClick={() => setTab('pending-bonus')}
          >
            🌻 BONUS ({pending.filter(s => s.missions?.mission_type === 'bonus').length})
          </button>

          <button
            type="button"
            style={tabButton(tab === 'users')}
            onClick={() => setTab('users')}
          >
            👥 USERS ({users.length})
          </button>

          <button
            type="button"
            style={tabButton(tab === 'points')}
            onClick={() => setTab('points')}
          >
            ● POINT HISTORY
          </button>

          <button
            type="button"
            style={tabButton(tab === 'leaderboard')}
            onClick={() => setTab('leaderboard')}
          >
            🏆 LEADERBOARD
          </button>

          <button
            type="button"
            style={tabButton(tab === 'notifications')}
            onClick={() => setTab('notifications')}
          >
            🔔 NOTIFICATIONS
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            padding: 16
          }}
        >
          {loading ? (
            <div style={{ padding: 30, textAlign: 'center' }}>
              Đang tải dữ liệu...
            </div>
          ) : tab === 'pending-main' || tab === 'pending-bonus' ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {pending.filter(s => tab === 'pending-bonus' ? s.missions?.mission_type === 'bonus' : s.missions?.mission_type !== 'bonus').length === 0 ? (
                <div
                  style={{
                    padding: 30,
                    borderRadius: 16,
                    background: '#fffdf8',
                    textAlign: 'center'
                  }}
                >
                  🎉 Không có submission nào đang chờ duyệt.
                </div>
              ) : (
                pending.filter(s => tab === 'pending-bonus' ? s.missions?.mission_type === 'bonus' : s.missions?.mission_type !== 'bonus').map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openSubmission(s)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 12,
                      padding: 14,
                      background: '#fffdf7',
                      border: '2px solid #d5d9cf',
                      borderRadius: 16,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>

                      <b>

                        {s.missions?.name || 'MISSION'} · #{s.attempt_no}

                      </b>

                      <div style={{ marginTop: 5, fontWeight: 800 }}>

                        {adminUser(s.user_id).username}

                      </div>

                      {adminUser(s.user_id).email && (

                        <small

                          style={{

                            display: 'block',

                            marginTop: 2,

                            opacity: .65,

                            overflowWrap: 'anywhere'

                          }}

                        >

                          {adminUser(s.user_id).email}

                        </small>

                      )}

                      <small style={{ display: 'block', marginTop: 4, opacity: .6 }}>

                        {new Date(s.submitted_at).toLocaleString('vi-VN')}

                      </small>

                    </div>
                  </button>
                ))
              )}
            </div>
          ) : tab === 'users' ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {users.map(user => (
                <div
                  key={user.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 14,
                    background: '#fffdf7',
                    border: '1px solid #d5d9cf'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <b>{user.username || 'PLAYER'}</b>
                    {userEmails[user.id] && (
                      <small
                        style={{
                          display: 'block',
                          marginTop: 2,
                          opacity: .65,
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {userEmails[user.id]}
                      </small>
                    )}
                  </div>
                  <strong>{user.total_points || 0} PTS</strong>
                </div>
              ))}
            </div>
          ) : tab === 'points' ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {ledger.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: 10,
                    borderRadius: 12,
                    background: '#fffdf7',
                    border: '1px solid #d5d9cf'
                  }}
                >
                  <strong
                    style={{
                      color: item.points >= 0 ? '#34764d' : '#b84036'
                    }}
                  >
                    {item.points >= 0 ? '+' : ''}
                    {item.points} PTS
                  </strong>
                  <div>
                    <b>{item.source_type}</b>
                    <div>{item.reason}</div>
                    <small
                      style={{
                        display: 'block',
                        marginTop: 3,
                        opacity: .6,
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {adminUser(item.user_id).username}
                      {adminUser(item.user_id).email
                        ? ` · ${adminUser(item.user_id).email}`
                        : ''}
                    </small>
                  </div>
                  <small style={{ opacity: .55 }}>
                    {new Date(item.created_at).toLocaleString('vi-VN')}
                  </small>
                </div>
              ))}
            </div>
          ) : tab === 'leaderboard' ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {leaderboard.map(row => (
                <div
                  key={row.user_id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr auto',
                    gap: 10,
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 14,
                    background: row.rank <= 3 ? '#fff8d8' : '#fffdf7',
                    border: row.rank <= 3
                      ? '2px solid #ecc64b'
                      : '1px solid #d5d9cf'
                  }}
                >
                  <b>#{row.rank}</b>
                  <b>{row.username || 'PLAYER'}</b>
                  <strong>{row.total_points} PTS</strong>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {adminNotifications.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={async () => {
                    await markAdminNotificationRead(n.id);
                    const target = pending.find(
                      s => s.id === n.submission_id
                    );
                    if (target) {
                      setTab(target.missions?.mission_type === 'bonus' ? 'pending-bonus' : 'pending-main');
                      await openSubmission(target);
                    }
                  }}
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    borderRadius: 14,
                    border: n.read_at
                      ? '1px solid #d5d9cf'
                      : '2px solid #ecc64b',
                    background: n.read_at ? '#fffdf7' : '#fff8d8'
                  }}
                >
                  <b>{n.title}</b>
                  <div>{n.message}</div>
                  <small style={{ opacity: .5 }}>
                    {new Date(n.created_at).toLocaleString('vi-VN')}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>

        {fullScreen && (
          <footer
            className="adminLogoutFooter"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '14px 16px'
            }}
          >
            <button
              type="button"
              className="adminLogoutButton"
              onClick={onClose}
              aria-label="Đăng xuất tài khoản admin"
            >
              ↪ ĐĂNG XUẤT ADMIN
            </button>
          </footer>
        )}

        {selectedSubmission && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(20,31,26,.55)',
              display: 'grid',
              placeItems: 'center',
              padding: 18,
              zIndex: 10
            }}
          >
            <div
              style={{
                width: 'min(900px, 100%)',
                maxHeight: '88vh',
                overflow: 'auto',
                background: '#fffdf7',
                borderRadius: 20,
                border: '3px solid #20352b',
                padding: 18
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <small>SUBMISSION REVIEW</small>
                  <h2 style={{ margin: 0 }}>
                    {selectedSubmission.missions?.action} ·{' '}
                    {selectedSubmission.missions?.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubmission(null);
                    setDetails(null);
                    setSelectedEvidence(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 8,
                  marginTop: 14
                }}
              >
                <Info
                  label="USER"
                  value={`${adminUser(selectedSubmission.user_id).username}${
                    adminUser(selectedSubmission.user_id).email
                      ? ` · ${adminUser(selectedSubmission.user_id).email}`
                      : ''
                  }`}
                />

                {selectedSubmission.platform && (
                  <Info
                    label="PLATFORM"
                    value={selectedSubmission.platform}
                  />
                )}

                {selectedSubmission.account_id && (
                  <Info
                    label="ACCOUNT"
                    value={selectedSubmission.account_id}
                  />
                )}

                {selectedSubmission.redeem_code && (
                  <Info
                    label="REDEEM CODE"
                    value={selectedSubmission.redeem_code}
                  />
                )}

                {selectedSubmission.content_url && (
                  <Info
                    label="CONTENT URL"
                    value={selectedSubmission.content_url}
                  />
                )}

                {selectedSubmission.post_url &&
                  !selectedSubmission.content_url && (
                    <Info
                      label="POST / VIDEO"
                      value={selectedSubmission.post_url}
                    />
                  )}

                {selectedSubmission.activity_date &&
                  /^spotify/i.test(selectedSubmission.missions?.slug || '') && (
                    <Info
                      label="ACTIVITY DATE"
                      value={selectedSubmission.activity_date}
                    />
                  )}
              </div>

              {/* =====================================================
                  REVIEW DETAILS
                  - Gom nội dung + minh chứng theo từng item/account.
                  - Bonus points + user note nằm trong cùng khối review.
                  - Không còn một gallery proof chung khiến ảnh/text
                    bị tách khỏi tài khoản tương ứng.
                  ===================================================== */}

              <section
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 14,
                  border: '1px solid #d5d9cf',
                  background: '#fffdf7'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 10
                  }}
                >
                  <div>
                    <small
                      style={{
                        display: 'block',
                        color: '#718078',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '.04em'
                      }}
                    >
                      REVIEW DETAILS
                    </small>
                    <b style={{ fontSize: 14 }}>
                      {selectedSubmission?.missions?.mission_type === 'bonus'
                        ? '🌻 BONUS SUBMISSION'
                        : '📋 NỘI DUNG SUBMISSION'}
                    </b>
                  </div>

                  {details?.items?.length ? (
                    <small style={{ opacity: .55 }}>
                      {details.items.length} mục
                    </small>
                  ) : null}
                </div>

                {selectedSubmission?.missions?.mission_type === 'bonus' &&
                  selectedSubmission?.missions?.slug === 'spotify_extra' && (
                    <div
                      style={{
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 11,
                        background: '#eef8df',
                        border: '1px solid #b8d68d'
                      }}
                    >
                      <b style={{ display: 'block' }}>🌻 SPOTIFY EXTRA — ĐIỂM TỰ ĐỘNG</b>
                      <small
                        style={{
                          display: 'block',
                          marginTop: 5,
                          lineHeight: 1.4,
                          opacity: .75
                        }}
                      >
                        Hệ thống tự tính điểm theo số stream: mỗi đủ 15 stream thêm = +5 điểm,
                        tối đa +15 điểm. Admin chỉ cần kiểm tra minh chứng rồi APPROVE hoặc REJECT.
                      </small>
                      <b style={{ display: 'block', marginTop: 7 }}>
                        Dự kiến: +{Math.min(
                          15,
                          Math.floor(
                            Number(selectedSubmission?.quantity || 0) / 15
                          ) * 5
                        )} điểm
                      </b>
                    </div>
                  )}

                {selectedSubmission?.missions?.mission_type === 'bonus' &&
                  selectedSubmission?.missions?.slug !== 'spotify_extra' && (
                    <div
                      style={{
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 11,
                        background: '#fff7cf',
                        border: '1px solid #e6c65a'
                      }}
                    >
                      <b style={{ display: 'block' }}>🌻 ĐIỂM BONUS ADMIN DUYỆT</b>
                      <input
                        type="number"
                        min={0}
                        max={selectedSubmission?.missions?.max_points ?? undefined}
                        step={1}
                        value={bonusAwardPoints}
                        onChange={e => {
                          const max = Number(
                            selectedSubmission?.missions?.max_points ?? Infinity
                          );
                          const value = e.target.value;
                          if (value === '') {
                            setBonusAwardPoints('');
                            return;
                          }
                          const number = Number(value);
                          setBonusAwardPoints(
                            Number.isFinite(number)
                              ? String(Math.min(Math.max(0, number), max))
                              : ''
                          );
                        }}
                        placeholder="Nhập số điểm"
                        style={{
                          width: '100%',
                          marginTop: 7,
                          boxSizing: 'border-box'
                        }}
                      />
                      <small
                        style={{
                          display: 'block',
                          marginTop: 5,
                          opacity: .65,
                          lineHeight: 1.35
                        }}
                      >
                        {selectedSubmission?.missions?.slug === 'social_extra'
                          ? '3 post = +1 điểm (max +5 điểm)'
                          : selectedSubmission?.missions?.slug === 'tiktok_extra'
                            ? '1 video = +2 điểm (max +10 điểm)'
                            : selectedSubmission?.missions?.slug === 'itunes_extra'
                              ? '2 redeem = +1 điểm (max +5 điểm)'
                              : selectedSubmission?.missions?.slug === 'youtube_extra'
                                ? '1 Subscribe + 1 Like + 1 Comment = +2 điểm (max +10 điểm)'
                                : ''}
                      </small>
                    </div>
                  )}

                {/*{selectedSubmission.note && (
                  <div
                    style={{
                      marginBottom: 10,
                      padding: 10,
                      background: '#f4f0df',
                      borderRadius: 11
                    }}
                  >
                    <small
                      style={{
                        display: 'block',
                        marginBottom: 4,
                        opacity: .55,
                        fontWeight: 800
                      }}
                    >
                      USER NOTE
                    </small>
                    <div
                      style={{
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        lineHeight: 1.45
                      }}
                    >
                      {selectedSubmission.note}
                    </div>
                  </div>
                )}*/}

                {details?.items?.length ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {details.items.map(item => {
                      const slug = selectedSubmission?.missions?.slug;
                      const itemEvidence = (details.evidence || []).filter(
                        evidence =>
                          Number(evidence.item_no) === Number(item.item_no)
                      );

                      const title =
                        slug === 'facebook'
                          ? `BÀI ĐĂNG ${item.item_no}`
                          : slug === 'tiktok'
                            ? `VIDEO ${item.item_no}`
                            : slug === 'youtube'
                              ? `TÀI KHOẢN YOUTUBE ${item.item_no}`
                              : slug === 'youtube_extra'
                                ? `TÀI KHOẢN YOUTUBE ${item.item_no}`
                                : slug === 'spotify'
                                  ? `ACCOUNT SPOTIFY`
                                  : slug === 'spotify_extra'
                                    ? `ACCOUNT SPOTIFY`
                                    : slug === 'itunes' || slug === 'itunes_extra'
                                      ? `REDEEM ${item.item_no}`
                                      : `MỤC ${item.item_no}`;

                      return (
                        <article
                          key={item.id}
                          style={{
                            padding: 10,
                            borderRadius: 12,
                            background: '#fff',
                            border: '1px solid #dfe3d9',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              marginBottom: 8
                            }}
                          >
                            <b>{title}</b>

                            {itemEvidence.length > 0 && (
                              <small
                                style={{
                                  flexShrink: 0,
                                  padding: '3px 6px',
                                  borderRadius: 99,
                                  background: '#eef6ed',
                                  color: '#356640',
                                  fontWeight: 800
                                }}
                              >
                                {itemEvidence.length} minh chứng
                              </small>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gap: 6,
                              minWidth: 0
                            }}
                          >
                            {item.account_id ? (
                              <div
                                style={{
                                  minWidth: 0,
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word'
                                }}
                              >
                                <small style={{ opacity: .55 }}>
                                  TÀI KHOẢN
                                </small>
                                <div>{item.account_id}</div>
                              </div>
                            ) : null}

                            {item.content_url ? (
                              <a
                                href={item.content_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'block',
                                  color: '#176b45',
                                  fontWeight: 800,
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word'
                                }}
                              >
                                🔗 MỞ LINK
                              </a>
                            ) : null}

                            {item.redeem_code ? (
                              <div
                                style={{
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word'
                                }}
                              >
                                <small style={{ opacity: .55 }}>
                                  REDEEM CODE
                                </small>
                                <div>{item.redeem_code}</div>
                              </div>
                            ) : null}

                            {item.activity_date ? (
                              <div>
                                <small style={{ opacity: .55 }}>
                                  NGÀY
                                </small>
                                <div>{item.activity_date}</div>
                              </div>
                            ) : null}
                          </div>

                          {itemEvidence.length > 0 && (
                            <div
                              style={{
                                marginTop: 10,
                                paddingTop: 10,
                                borderTop: '1px dashed #d7ddd3'
                              }}
                            >
                              <small
                                style={{
                                  display: 'block',
                                  marginBottom: 7,
                                  color: '#64746a',
                                  fontWeight: 800
                                }}
                              >
                                MINH CHỨNG CỦA {title}
                              </small>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                    'repeat(auto-fit, minmax(120px, 1fr))',
                                  gap: 8
                                }}
                              >
                                {itemEvidence.map(evidence => (
                                  <button
                                    key={evidence.id}
                                    type="button"
                                    onClick={() =>
                                      evidence.signedUrl &&
                                      setSelectedEvidence(evidence)
                                    }
                                    disabled={!evidence.signedUrl}
                                    style={{
                                      minWidth: 0,
                                      padding: 0,
                                      border: '1px solid #d5d9cf',
                                      borderRadius: 10,
                                      overflow: 'hidden',
                                      background: '#fff',
                                      textAlign: 'left',
                                      cursor: evidence.signedUrl
                                        ? 'zoom-in'
                                        : 'default'
                                    }}
                                  >
                                    {evidence.signedUrl ? (
                                      <img
                                        src={evidence.signedUrl}
                                        alt={
                                          evidence.original_filename ||
                                          'proof'
                                        }
                                        style={{
                                          display: 'block',
                                          width: '100%',
                                          aspectRatio: '1',
                                          objectFit: 'cover'
                                        }}
                                      />
                                    ) : (
                                      <div
                                        style={{
                                          minHeight: 100,
                                          display: 'grid',
                                          placeItems: 'center',
                                          padding: 8,
                                          fontSize: 11,
                                          textAlign: 'center',
                                          overflowWrap: 'anywhere'
                                        }}
                                      >
                                        {evidence.signedUrlError ||
                                          'Không mở được ảnh minh chứng'}
                                      </div>
                                    )}

                                    <div
                                      style={{
                                        padding: 7,
                                        minWidth: 0
                                      }}
                                    >
                                      <b
                                        style={{
                                          display: 'block',
                                          fontSize: 11,
                                          lineHeight: 1.25,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                        title={
                                          evidence.original_filename ||
                                          'Minh chứng'
                                        }
                                      >
                                        {evidence.original_filename ||
                                          'Minh chứng'}
                                      </b>

                                      <small
                                        style={{
                                          display: 'block',
                                          marginTop: 3,
                                          opacity: .55,
                                          fontSize: 9,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {evidence.evidence_type ||
                                          'MINH CHỨNG'}
                                      </small>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : null}

                {/* Evidence without item_no: keep it visible, but clearly separate
                    instead of making it look like it belongs to a random account. */}
                {(() => {
                  const unassignedEvidence = (details?.evidence || []).filter(
                    evidence =>
                      evidence.item_no == null ||
                      evidence.item_no === '' ||
                      !details?.items?.some(
                        item =>
                          Number(item.item_no) === Number(evidence.item_no)
                      )
                  );

                  if (!unassignedEvidence.length) return null;

                  return (
                    <div
                      style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px dashed #d7ddd3'
                      }}
                    >
                      <small
                        style={{
                          display: 'block',
                          marginBottom: 7,
                          color: '#64746a',
                          fontWeight: 800
                        }}
                      >
                        MINH CHỨNG CHUNG
                      </small>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: 8
                        }}
                      >
                        {unassignedEvidence.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              item.signedUrl && setSelectedEvidence(item)
                            }
                            disabled={!item.signedUrl}
                            style={{
                              minWidth: 0,
                              padding: 0,
                              border: '1px solid #d5d9cf',
                              borderRadius: 10,
                              overflow: 'hidden',
                              background: '#fff',
                              textAlign: 'left',
                              cursor: item.signedUrl ? 'zoom-in' : 'default'
                            }}
                          >
                            {item.signedUrl ? (
                              <img
                                src={item.signedUrl}
                                alt={item.original_filename || 'proof'}
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  aspectRatio: '1',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  minHeight: 100,
                                  display: 'grid',
                                  placeItems: 'center',
                                  padding: 8,
                                  fontSize: 11,
                                  textAlign: 'center'
                                }}
                              >
                                {item.signedUrlError ||
                                  'Không mở được ảnh minh chứng'}
                              </div>
                            )}
                            <div style={{ padding: 7, minWidth: 0 }}>
                              <b
                                style={{
                                  display: 'block',
                                  fontSize: 11,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={item.original_filename || 'Minh chứng'}
                              >
                                {item.original_filename || 'Minh chứng'}
                              </b>
                              <small
                                style={{
                                  display: 'block',
                                  marginTop: 3,
                                  opacity: .55,
                                  fontSize: 9
                                }}
                              >
                                {item.evidence_type || 'MINH CHỨNG'}
                              </small>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </section>

              {reviewError && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '9px 11px',
                    borderRadius: 10,
                    background: '#fff0ed',
                    border: '1px solid #d36a5a',
                    color: '#8d3023',
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  {reviewError}
                </div>
              )}

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gap: 8
                }}
              >
                <button
                  type="button"
                  onClick={() => review('approved')}
                  disabled={reviewingDecision === 'approved'}
                  style={{
                    padding: 13,
                    borderRadius: 12,
                    border: '2px solid #36714a',
                    background: '#d9f0dd',
                    fontWeight: 900
                  }}
                >
                  {reviewingDecision === 'approved'
                    ? 'ĐANG XỬ LÝ...'
                    : '✓ APPROVE'}
                </button>

                <textarea
                  value={rejectReason}
                  onChange={e => {
                    setRejectReason(e.target.value);
                    if (e.target.value.trim()) setReviewError('');
                  }}
                  placeholder="Lý do reject — bắt buộc"
                  rows={4}
                />

                <button
                  type="button"
                  onClick={() => review('rejected')}
                  disabled={reviewingDecision === 'rejected'}
                  style={{
                    padding: 13,
                    borderRadius: 12,
                    border: '2px solid #a74439',
                    background: '#f6d7d2',
                    fontWeight: 900
                  }}
                >
                  {reviewingDecision === 'rejected'
                    ? 'ĐANG XỬ LÝ...'
                    : '✕ REJECT'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedEvidence?.signedUrl && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh minh chứng"
            onClick={() => setSelectedEvidence(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1200,
              background: 'rgba(0,0,0,.78)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 14,
              boxSizing: 'border-box'
            }}
          >
            <button
              type="button"
              aria-label="Đóng ảnh"
              onClick={e => {
                e.stopPropagation();
                setSelectedEvidence(null);
              }}
              style={{
                position: 'fixed',
                top: 18,
                right: 18,
                width: 44,
                height: 44,
                padding: 0,
                borderRadius: 12,
                border: '2px solid #fff',
                background: '#17382a',
                color: '#fff',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              ×
            </button>

            <img
              src={selectedEvidence.signedUrl}
              alt={selectedEvidence.original_filename || 'proof'}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '96vw',
                maxHeight: '92vh',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 20px 80px rgba(0,0,0,.5)'
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return null;
  }

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        background: '#f5f1e4'
      }}
    >
      <small style={{ display: 'block', opacity: .55 }}>{label}</small>
      <b style={{ wordBreak: 'break-word' }}>{value}</b>
    </div>
  );
}

/* =========================================================
   LOGO
   ========================================================= */

function Logo({ mission }) {
  const [failed, setFailed] =
    useState(false);

  if (failed) {
    return (
      <div
        className="logoFallback"
        style={{
          '--missionColor':
            mission.color
        }}
      >
        {logoFallback(
          mission.name
        )}
      </div>
    );
  }

  return (
    <img
      className="missionLogo"
      src={mission.logo}
      alt={mission.name}
      onError={() =>
        setFailed(true)
      }
    />
  );
}

/* =========================================================
   SUNFLOWER GROWTH
   ========================================================= */

function Plant({
  growthStage,
  done,
  active
}) {
  const stageNames = {
    1: 'seed',
    2: 'sprout',
    3: 'leaves',
    4: 'bud',
    5: 'bloom'
  };

  // Current mission: show Tinie doing that mission.
  // Completed mission: show the normal sunflower stage.
  // Locked/unopened mission: show the neutral Tinie_1 image.
  const tinieActionImages = {
    1: '/assets/tinie-seed.png',
    2: '/assets/tinie-water.png',
    3: '/assets/tinie-sun.png',
    4: '/assets/tinie-bud.png',
    5: '/assets/tinie-spotify.png'
  };

  const stageName = stageNames[growthStage] || 'seed';

  if (done) {
    return (
      <div className="plantAssetWrapper is-done">
        <img
          className={`plantAsset plantAsset-${growthStage}`}
          src={`/assets/sunflower-stage-${growthStage}-${stageName}.png`}
          alt={`Giai đoạn ${growthStage}`}
          onError={e => {
            e.currentTarget.style.opacity = '0';
          }}
        />
        <div className="growthSparkles" aria-hidden="true">
          ✦　✧　✦
        </div>
      </div>
    );
  }

  const imageSrc = active
    ? tinieActionImages[growthStage]
    : '/assets/tinie_1.png';

  return (
    <div
      className={[
        'plantAssetWrapper',
        active ? 'is-active' : '',
        'tinieMissionWrapper'
      ].join(' ')}
    >
      <img
        className={active ? 'tinieActionAsset' : 'tinieLockedAsset'}
        src={imageSrc}
        alt={active ? `tinie đang thực hiện nhiệm vụ ${growthStage}` : 'tinie'}
        onError={e => {
          e.currentTarget.style.opacity = '0';
        }}
      />
    </div>
  );
}

/* =========================================================
   MISSION MODAL / SUBMISSION
   ========================================================= */


function MissionModal({
  mission,
  count,
  status,
  latestSubmission,
  close,
  onSubmitted,
  notify
}) {
  const isBonus = mission.mission_type === 'bonus' || BONUS_MISSIONS.some(m => m.id === mission.id);

  const localMission =
    [...MISSIONS, ...BONUS_MISSIONS].find(m => m.id === mission.id) ||
    mission;

  const bonusMissionMap = {
    itunes: 'itunes_extra',
    youtube: 'youtube_extra',
    facebook: 'social_extra',
    tiktok: 'tiktok_extra',
    spotify: 'spotify_extra',
  };

  const bonusMission = bonusMissionMap[mission.id]
    ? BONUS_MISSIONS.find(m => m.id === bonusMissionMap[mission.id])
    : null;

  const [submissionStep, setSubmissionStep] = useState(
    isBonus ? 'main-submit' : 'main'
  );
  const [includeBonus, setIncludeBonus] = useState(false);
  const [bonusItems, setBonusItems] = useState(() => {
    if (!bonusMission) return [];
    if (bonusMission.id === 'itunes_extra') {
      return [{
        contentUrl: '', platform: 'itunes', metadata: {}
      }];
    }
    if (bonusMission.id === 'youtube_extra') {
      return [{ accountId: '', contentUrl: '', platform: 'youtube', metadata: { liked: false, commented: false } }];
    }
    if (bonusMission.id === 'social_extra') {
      return [{ accountId: '', redeemCode: '', contentUrl: '', platform: 'facebook', metadata: {} }];
    }
    if (bonusMission.id === 'tiktok_extra') {
      return [{ accountId: '', redeemCode: '', contentUrl: '', platform: 'tiktok', metadata: {} }];
    }
    if (bonusMission.id === 'spotify_extra') {
      return [{
        accountId: '',
        activityDate: new Date().toISOString().slice(0, 10),
        quantity: 15,
        contentUrl: '',
        platform: 'spotify',
        metadata: { activity_date: new Date().toISOString().slice(0, 10), quantity: 15 }
      }];
    }
    return [];
  });
  const [bonusFiles, setBonusFiles] = useState([]);
  const [bonusSpotifyProofFiles, setBonusSpotifyProofFiles] = useState({});
  const [bonusItunesProofFiles, setBonusItunesProofFiles] = useState({});
  const [bonusYoutubeProofFiles, setBonusYoutubeProofFiles] = useState({});

  const [postUrl, setPostUrl] = useState(
    latestSubmission?.content_url ||
      latestSubmission?.post_url ||
      ''
  );
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [itunesProofFiles, setItunesProofFiles] = useState({});
  const [youtubeProofFiles, setYoutubeProofFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [accountId, setAccountId] = useState(
    latestSubmission?.account_id || ''
  );
  const [redeemCode, setRedeemCode] = useState(
    latestSubmission?.redeem_code || ''
  );
  const [externalActionId, setExternalActionId] = useState(
    latestSubmission?.external_action_id || ''
  );
  const [quantity, setQuantity] = useState(
    latestSubmission?.quantity ||
      (localMission.unit_quantity || localMission.target || 1)
  );
  const [activityDate, setActivityDate] = useState(
    latestSubmission?.activity_date ||
      new Date().toISOString().slice(0, 10)
  );

  const getInitialItems = () => {
    if (mission.id === 'itunes') {
      return Array.from({ length: 3 }, () => ({
        accountId: '',
        redeemCode: '',
        contentUrl: '',
        platform: 'itunes',
        metadata: { proof_source: 'web_code' }
      }));
    }

    if (mission.id === 'youtube') {
      return Array.from({ length: 3 }, () => ({
        accountId: '',
        contentUrl: '',
        platform: 'youtube',
        metadata: {
          liked: false,
          commented: false,
          subscribed: false
        }
      }));
    }

    if (mission.id === 'facebook') {
      return Array.from({ length: 3 }, () => ({
        accountId: '',
        contentUrl: '',
        platform: 'facebook',
        metadata: {}
      }));
    }

    if (mission.id === 'tiktok') {
      return Array.from({ length: 3 }, () => ({
        accountId: '',
        contentUrl: '',
        platform: 'tiktok',
        metadata: {}
      }));
    }

    if (mission.id === 'social_extra') {
      return Array.from({ length: 3 }, () => ({
        accountId: '',
        contentUrl: '',
        platform: 'facebook',
        metadata: {}
      }));
    }

    if (mission.id === 'spotify' || mission.id === 'spotify_extra') {
      return [{
        accountId: '',
        contentUrl: '',
        platform: 'spotify',
        metadata: {
          activity_date: activityDate,
          quantity
        }
      }];
    }

    return [{
      accountId: '',
      contentUrl: '',
      platform: mission.id,
      metadata: {}
    }];
  };

  const [items, setItems] = useState(() => getInitialItems());
  const mountedRef = React.useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isLocked = status === 'locked';
  const isPending = status === 'pending_review';
  const isCompleted = status === 'completed' && !isBonus;
  const isBonusMaxed =
    isBonus && Number(count || 0) >= Number(localMission.target || 0);
  const isRejected = latestSubmission?.status === 'rejected';

  useEffect(() => {
    if (mission.id === 'spotify' || mission.id === 'spotify_extra') {
      setItems(prev =>
        prev.map(item => ({
          ...item,
          metadata: {
            ...(item.metadata || {}),
            activity_date: activityDate,
            quantity
          },
          accountId
        }))
      );
    }
  }, [activityDate, quantity, accountId]);

  const handleFiles = event => {
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;

    const next = incoming.map(file => ({
      file,
      type:
        mission.id === 'spotify' || mission.id === 'spotify_extra'
          ? 'stream_screenshot'
          : mission.id === 'itunes' || mission.id === 'itunes_extra'
            ? 'redeem_screenshot'
            : 'post_screenshot'
    }));

    if (
      next.some(
        item => !item.file.type.startsWith('image/')
      )
    ) {
      notify('Chỉ nhận file ảnh minh chứng.');
      event.currentTarget.value = '';
      return;
    }

    if (
      next.some(
        item => item.file.size > 10 * 1024 * 1024
      )
    ) {
      notify('Mỗi ảnh tối đa 10MB.');
      event.currentTarget.value = '';
      return;
    }

    setFiles(prev => [...prev, ...next].slice(0, 15));
    event.currentTarget.value = '';
  };

  const updateType = (index, type) => {
    setFiles(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, type } : item
      )
    );
  };

  const removeFile = index => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleItunesProofFile = (index, event) => {
    const file = event.target.files?.[0] || null;
    event.currentTarget.value = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('iTunes: chỉ nhận file ảnh minh chứng.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notify('iTunes: mỗi ảnh tối đa 10MB.');
      return;
    }

    setItunesProofFiles(prev => ({
      ...prev,
      [index]: file
    }));
  };

  const removeItunesProofFile = index => {
    setItunesProofFiles(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleYoutubeProofFile = (index, proofType, event) => {
    const file = event.target.files?.[0] || null;
    event.currentTarget.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('YouTube: chỉ nhận file ảnh minh chứng.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify('YouTube: mỗi ảnh tối đa 10MB.');
      return;
    }

    setYoutubeProofFiles(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        [proofType]: file
      }
    }));
  };

  const removeYoutubeProofFile = (index, proofType) => {
    setYoutubeProofFiles(prev => {
      const next = { ...prev };
      if (!next[index]) return prev;

      const item = { ...next[index] };
      delete item[proofType];

      if (Object.keys(item).length) {
        next[index] = item;
      } else {
        delete next[index];
      }

      return next;
    });
  };

  const updateItem = (index, field, value) => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const updateItemMetadata = (index, field, value) => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              metadata: {
                ...(item.metadata || {}),
                [field]: value
              }
            }
          : item
      )
    );
  };

  const addItem = () => {
    if (mission.id === 'tiktok_extra' && items.length >= 5) return;
    if (mission.id === 'youtube_extra' && items.length >= 5) return;
    if (mission.id === 'social_extra' && items.length >= 15) return;

    const platform =
      mission.id === 'social_extra'
        ? 'facebook'
        : mission.id.includes('tiktok')
          ? 'tiktok'
          : mission.id.includes('youtube')
            ? 'youtube'
            : 'itunes';

    setItems(prev => [
      ...prev,
      {
        accountId: '',
        redeemCode: '',
        contentUrl: '',
        platform,
        metadata:
          platform === 'youtube'
            ? { liked: true, commented: true }
            : {}
      }
    ]);
  };

  const removeItem = index => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const mainMissionValidation = () => {
    if (
      isLocked ||
      isPending ||
      isCompleted ||
      isBonusMaxed ||
      latestSubmission?.status === 'pending'
    ) {
      if (latestSubmission?.status === 'pending') {
        notify('Nhiệm vụ này đang chờ Admin duyệt.');
      }
      return false;
    }

    if (mission.id === 'itunes') {
      if (items.length !== 3) { notify('iTunes cần đúng 3 minh chứng.'); return false; }
      for (let i = 0; i < 3; i++) {
        if (!itunesProofFiles[i]) { notify(`iTunes lượt ${i + 1}: cần upload ảnh minh chứng.`); return false; }
      }
    }
    if (mission.id === 'youtube') {
      if (items.length !== 3) { notify('YouTube cần đúng 3 tài khoản.'); return false; }
      for (let i = 0; i < 3; i++) {
        const proofs = youtubeProofFiles[i] || {};
        if (!proofs.subscribe || !proofs.like || !proofs.comment) {
          notify(`YouTube tài khoản #${i + 1}: cần đủ 3 ảnh Subscribe, Like và Comment.`); return false;
        }
      }
    }
    if (mission.id === 'facebook' && (items.length !== 3 || items.some(item => !item.contentUrl.trim()))) {
      notify('Hãy nhập đủ 3 link bài đăng Facebook.'); return false;
    }
    if (mission.id === 'tiktok' && (items.length !== 3 || items.some(item => !item.contentUrl.trim()))) {
      notify('Hãy nhập đủ 3 link video.'); return false;
    }
    if (mission.id === 'spotify') {
      if (!accountId.trim()) { notify('Hãy nhập account Spotify.'); return false; }
      if (Number(quantity) !== 15) { notify('Spotify nhiệm vụ chính cần đúng 15 streams.'); return false; }
      if (!activityDate) { notify('Hãy chọn ngày stream.'); return false; }
    }
    return true;
  };

  const updateBonusItem = (index, field, value) => {
    setBonusItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const updateBonusMetadata = (index, field, value) => {
    setBonusItems(prev => prev.map((item, i) => i === index ? { ...item, metadata: { ...(item.metadata || {}), [field]: value } } : item));
  };

  const addBonusItem = () => {
    if (!bonusMission) return;

    const max =
      bonusMission.id === 'spotify_extra'
        ? 3
        : bonusMission.id === 'social_extra'
          ? 15
          : bonusMission.id === 'itunes_extra'
            ? 10
            : 5;

    if (bonusItems.length >= max) return;

    if (bonusMission.id === 'spotify_extra') {
      const today = new Date().toISOString().slice(0, 10);
      setBonusItems(prev => [
        ...prev,
        {
          accountId: '',
          activityDate: today,
          quantity: 15,
          contentUrl: '',
          platform: 'spotify',
          metadata: { activity_date: today, quantity: 15 }
        }
      ]);
      return;
    }

    const platform =
      bonusMission.id === 'youtube_extra'
        ? 'youtube'
        : bonusMission.id === 'tiktok_extra'
          ? 'tiktok'
          : bonusMission.id === 'social_extra'
            ? 'facebook'
            : 'itunes';

    setBonusItems(prev => [
      ...prev,
      {
        contentUrl: '',
        platform,
        metadata:
          platform === 'youtube'
            ? { liked: false, commented: false }
            : {}
      }
    ]);
  };

  const removeBonusItem = index => {
    if (bonusItems.length <= 1) return;
    setBonusItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleBonusSpotifyProofFile = (index, event) => {
    const file = event.target.files?.[0] || null;
    event.currentTarget.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Spotify Extra: chỉ nhận file ảnh minh chứng.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notify('Spotify Extra: mỗi ảnh tối đa 10MB.');
      return;
    }
    setBonusSpotifyProofFiles(prev => ({ ...prev, [index]: file }));
  };

  const removeBonusSpotifyProofFile = index => {
    setBonusSpotifyProofFiles(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleBonusFile = event => {
    const incoming = Array.from(event.target.files || []);
    event.currentTarget.value = '';
    if (!incoming.length) return;
    if (incoming.some(f => !f.type.startsWith('image/'))) { notify('Chỉ nhận file ảnh minh chứng.'); return; }
    if (incoming.some(f => f.size > 10 * 1024 * 1024)) { notify('Mỗi ảnh tối đa 10MB.'); return; }
    setBonusFiles(prev => [...prev, ...incoming].slice(0, 15));
  };

  const handleBonusYoutubeProofFile = (index, proofType, event) => {
    const file = event.target.files?.[0] || null;
    event.currentTarget.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { notify('YouTube: chỉ nhận file ảnh minh chứng.'); return; }
    if (file.size > 10 * 1024 * 1024) { notify('YouTube: mỗi ảnh tối đa 10MB.'); return; }
    setBonusYoutubeProofFiles(prev => ({
      ...prev,
      [index]: { ...(prev[index] || {}), [proofType]: file }
    }));
  };

  const removeBonusYoutubeProof = (index, proofType) => {
    setBonusYoutubeProofFiles(prev => {
      const next = { ...prev };
      if (!next[index]) return prev;
      const item = { ...next[index] };
      delete item[proofType];
      if (Object.keys(item).length) next[index] = item;
      else delete next[index];
      return next;
    });
  };

  const validateBonus = () => {
    if (!includeBonus || !bonusMission) return true;

    if (bonusMission.id === 'itunes_extra') {
      if (bonusItems.length < 1 || bonusItems.length > 10) { notify('iTunes Extra: bạn có thể gửi từ 1 đến 10 CODE.'); return false; }
      for (let i = 0; i < bonusItems.length; i++) {
        if (!bonusItunesProofFiles[i]) { notify(`iTunes Extra CODE ${i + 1}: cần ảnh minh chứng.`); return false; }
      }
    }

    if (bonusMission.id === 'youtube_extra') {
      if (!bonusItems.length || bonusItems.length > 5) { notify('YouTube Extra: mỗi gói Like + Comment = +2 điểm, tối đa 10 điểm.'); return false; }
      for (let i = 0; i < bonusItems.length; i++) {
        const proofs = bonusYoutubeProofFiles[i] || {};
        if (!proofs.subscribe || !proofs.like || !proofs.comment) { notify(`YouTube Extra tài khoản #${i + 1}: cần đủ 3 ảnh Subscribe, Like và Comment.`); return false; }
      }
    }

    if (bonusMission.id === 'social_extra') {
      if (bonusItems.length < 1 || bonusItems.length > 15) { notify('Social Extra: bạn có thể gửi từ 1 đến 15 bài. Chỉ các nhóm đủ 3 bài mới được tính điểm.'); return false; }
      if (bonusItems.some(item => !item.contentUrl.trim())) { notify('Hãy nhập đủ link cho Social Extra.'); return false; }
    }

    if (bonusMission.id === 'tiktok_extra') {
      if (bonusItems.length < 1 || bonusItems.length > 5 || bonusItems.some(item => !item.contentUrl.trim())) { notify('TikTok Extra: mỗi video hợp lệ = +2 điểm, tối đa 10 điểm.'); return false; }
    }

    if (bonusMission.id === 'spotify_extra') {
      if (bonusItems.length < 1 || bonusItems.length > 3) {
        notify('Spotify Extra: thêm từ 1 đến 3 tài khoản. Mỗi tài khoản cần stream đủ 15 lần.');
        return false;
      }

      const mainAccount = accountId.trim().toLowerCase();
      const seen = new Set();

      for (let i = 0; i < bonusItems.length; i++) {
        const item = bonusItems[i];
        const acc = (item.accountId || '').trim();

        if (!acc) {
          notify(`Spotify Extra tài khoản #${i + 1}: hãy nhập account Spotify.`);
          return false;
        }

        const key = acc.toLowerCase();
        if (key === mainAccount) {
          notify(`Spotify Extra tài khoản #${i + 1}: phải dùng account khác tài khoản Spotify ở nhiệm vụ chính.`);
          return false;
        }
        if (seen.has(key)) {
          notify(`Spotify Extra tài khoản #${i + 1}: account bị trùng.`);
          return false;
        }
        seen.add(key);

        if (Number(item.quantity || 15) !== 15) {
          notify(`Spotify Extra tài khoản #${i + 1}: số stream phải đúng 15.`);
          return false;
        }
        if (!item.activityDate) {
          notify(`Spotify Extra tài khoản #${i + 1}: hãy chọn ngày stream.`);
          return false;
        }
        if (!bonusSpotifyProofFiles[i]) {
          notify(`Spotify Extra tài khoản #${i + 1}: cần ảnh minh chứng stats.fm.`);
          return false;
        }
      }
    }

    return true;
  };

  const validate = () => {
    return isBonus ? validateBonus() : mainMissionValidation();
  };

  const submit = async () => {
    if (!mainMissionValidation()) return;
    if (!validateBonus()) return;
    if (submitting) return;

    setSubmitting(true);
    const uploaded = [];
    const bonusUploaded = [];
    let createdSubmissionId = null;
    let createdBonusSubmissionId = null;
    let submissionCommitted = false;

    const cleanupStorage = async () => {
      const paths = [...uploaded, ...bonusUploaded].map(item => item.path);
      if (!paths.length) return;
      const { error } = await supabase.storage
        .from('mission-evidence')
        .remove(paths);

      if (error) {
        console.warn('evidence cleanup:', error);
      }
    };

    const rollbackSubmission = async () => {
      for (const id of [createdBonusSubmissionId, createdSubmissionId]) {
        if (!id) continue;
        const { error } = await supabase.rpc('rollback_pending_submission', { p_submission_id: id });
        if (error) console.error('rollback pending submission:', error);
      }
      createdSubmissionId = null;
      createdBonusSubmissionId = null;
    };

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        notify('Phiên đăng nhập đã hết.');
        return;
      }

      const draftId = makeDraftId();

      /*
       * IMPORTANT:
       * Upload every proof first. For YouTube this must be exactly 9 images.
       * If any upload fails, no mission_submission is created.
       */
      for (const item of files) {
        const safeName = item.file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        );

        const storagePath =
          `${user.id}/${mission.id}/${draftId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('mission-evidence')
          .upload(storagePath, item.file, {
            contentType: item.file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        uploaded.push({
          path: storagePath,
          type: item.type,
          file: item.file
        });
      }

      if (mission.id === 'itunes') {
        for (let i = 0; i < items.length; i++) {
          const file = itunesProofFiles[i];
          if (!file) {
            throw new Error(
              `iTunes lượt ${i + 1}: thiếu ảnh minh chứng.`
            );
          }

          const safeName = file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            '_'
          );

          const storagePath =
            `${user.id}/${mission.id}/${draftId}/item-${i + 1}-${Date.now()}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from('mission-evidence')
            .upload(storagePath, file, {
              contentType: file.type,
              upsert: false
            });

          if (uploadError) throw uploadError;

          uploaded.push({
            path: storagePath,
            type: 'itunes_web_code_screenshot',
            file,
            itemNo: i + 1
          });
        }
      }

      if (mission.id === 'youtube') {
        const proofTypes = [
          ['subscribe', 'youtube_subscribe_screenshot'],
          ['like', 'youtube_like_screenshot'],
          ['comment', 'youtube_comment_screenshot']
        ];

        for (let i = 0; i < 3; i++) {
          const proofs = youtubeProofFiles[i] || {};

          for (const [proofType, evidenceType] of proofTypes) {
            const file = proofs[proofType];

            if (!file) {
              throw new Error(
                `YouTube tài khoản ${i + 1}: thiếu ảnh ${proofType}.`
              );
            }

            const safeName = file.name.replace(
              /[^a-zA-Z0-9._-]/g,
              '_'
            );

            const storagePath =
              `${user.id}/${mission.id}/${draftId}/account-${i + 1}-${proofType}-${Date.now()}-${safeName}`;

            const { error: uploadError } = await supabase.storage
              .from('mission-evidence')
              .upload(storagePath, file, {
                contentType: file.type,
                upsert: false
              });

            if (uploadError) throw uploadError;

            uploaded.push({
              path: storagePath,
              type: evidenceType,
              file,
              itemNo: i + 1
            });
          }
        }

        // Safety check: YouTube must always have exactly 9 uploaded proof images.
        const youtubeUploads = uploaded.filter(
          item => item.itemNo
        );

        if (youtubeUploads.length !== 9) {
          throw new Error(
            'YouTube phải có đúng 9 ảnh minh chứng.'
          );
        }
      }

      if (includeBonus && bonusMission) {
        const bonusDraftId = makeDraftId();

        if (bonusMission.id === 'itunes_extra') {
          for (let i = 0; i < bonusItems.length; i++) {
            const file = bonusItunesProofFiles[i];
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `${user.id}/${bonusMission.id}/${bonusDraftId}/item-${i + 1}-${Date.now()}-${safeName}`;
            const { error: uploadError } = await supabase.storage.from('mission-evidence').upload(path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;
            bonusUploaded.push({ path, type: 'itunes_web_code_screenshot', file, itemNo: i + 1 });
          }
        }

        if (bonusMission.id === 'youtube_extra') {
          const proofTypes = [['subscribe','youtube_subscribe_screenshot'],['like','youtube_like_screenshot'],['comment','youtube_comment_screenshot']];
          for (let i = 0; i < bonusItems.length; i++) {
            const proofs = bonusYoutubeProofFiles[i] || {};
            for (const [proofType, evidenceType] of proofTypes) {
              const file = proofs[proofType];
              const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
              const path = `${user.id}/${bonusMission.id}/${bonusDraftId}/account-${i + 1}-${proofType}-${Date.now()}-${safeName}`;
              const { error: uploadError } = await supabase.storage.from('mission-evidence').upload(path, file, { contentType: file.type, upsert: false });
              if (uploadError) throw uploadError;
              bonusUploaded.push({ path, type: evidenceType, file, itemNo: i + 1 });
            }
          }
        }

        if (bonusMission.id === 'spotify_extra') {
          for (let i = 0; i < bonusItems.length; i++) {
            const file = bonusSpotifyProofFiles[i];
            if (!file) throw new Error(`Spotify Extra tài khoản ${i + 1}: thiếu ảnh minh chứng stats.fm.`);

            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `${user.id}/${bonusMission.id}/${bonusDraftId}/account-${i + 1}-${Date.now()}-${safeName}`;
            const { error: uploadError } = await supabase.storage
              .from('mission-evidence')
              .upload(path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;

            bonusUploaded.push({
              path,
              type: 'stream_screenshot',
              file,
              itemNo: i + 1
            });
          }
        } else {
          for (const file of bonusFiles) {
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `${user.id}/${bonusMission.id}/${bonusDraftId}/${Date.now()}-${safeName}`;
            const { error: uploadError } = await supabase.storage.from('mission-evidence').upload(path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;
            bonusUploaded.push({ path, type: 'stream_screenshot', file });
          }
        }
      }

      const topQuantity = isBonus
        ? Number(
            mission.id === 'social_extra'
              ? items.length
              : mission.id === 'tiktok_extra'
                ? items.length
                : mission.id === 'youtube_extra'
                  ? items.length
                  : mission.id === 'itunes_extra'
                    ? 3
                    : quantity
          )
        : mission.id === 'spotify'
          ? Number(quantity)
          : (mission.target || items.length || 1);

      /*
       * Keep the existing submission RPC for all missions.
       * For YouTube, if anything below fails, rollback_pending_submission()
       * removes the just-created pending submission before we clean Storage.
       */
      const { data: submission, error: submitError } =
        await supabase.rpc('submit_mission_v4', {
          p_mission_slug: mission.id,
          p_content_url: postUrl.trim() || null,
          p_note: note.trim() || null,
          p_platform:
            mission.id === 'social_extra'
              ? 'social'
              : mission.id,
          p_account_id: accountId.trim() || null,
          p_redeem_code: redeemCode.trim() || null,
          p_external_action_id:
            externalActionId.trim() || null,
          p_quantity: topQuantity
        });

      if (submitError) throw submitError;

      const submissionRow = Array.isArray(submission)
        ? submission[0]
        : submission;

      // Supabase RPC can return:
      // - { submission_id: '...' }
      // - { id: '...' }
      // - [{ submission_id: '...' }]
      // - a raw UUID string
      createdSubmissionId =
        submissionRow?.submission_id ||
        submissionRow?.id ||
        submissionRow?.submissionId ||
        (typeof submissionRow === 'string'
          ? submissionRow
          : null);

      if (
        typeof createdSubmissionId !== 'string' ||
        !createdSubmissionId.trim()
      ) {
        console.error('submit_mission_v4 raw result:', submission);
        throw new Error(
          'Database đã nhận lệnh nhưng không trả về Submission ID. Kiểm tra RPC submit_mission_v4.'
        );
      }

      /*
       * Add structured items.
       * For YouTube the user no longer enters username/link, so these
       * items intentionally remain minimal and carry the proof metadata.
       */
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const itemQuantity =
          mission.id === 'spotify' || mission.id === 'spotify_extra'
            ? Number(quantity)
            : item.quantity || 1;

        const metadata = {
          ...(item.metadata || {}),
          activity_date:
            mission.id === 'spotify' || mission.id === 'spotify_extra'
              ? activityDate
              : item.metadata?.activity_date
        };

        const { error: itemError } = await supabase.rpc(
          'add_submission_item',
          {
            p_submission_id: createdSubmissionId,
            p_item_no: i + 1,
            p_platform: item.platform || mission.id,
            p_content_url: item.contentUrl?.trim() || null,
            p_account_id:
              mission.id === 'spotify' || mission.id === 'spotify_extra'
                ? accountId.trim() || null
                : item.accountId?.trim() || null,
            p_redeem_code: item.redeemCode?.trim() || null,
            p_external_action_id:
              item.externalActionId?.trim() || null,
            p_quantity: itemQuantity,
            p_metadata: metadata,
            p_proof_source:
              mission.id === 'itunes'
                ? 'web_code'
                : null
          }
        );

        if (itemError) throw itemError;
      }

      /*
       * Write every uploaded file into submission_evidence.
       * For YouTube, use the dedicated RPC so the 3 proof types are accepted.
       */
      for (const item of uploaded) {
        const evidenceArgs = {
          p_submission_id: createdSubmissionId,
          p_evidence_type: item.type,
          p_storage_path: item.path,
          p_original_filename: item.file.name,
          p_mime_type: item.file.type,
          p_file_size: item.file.size
        };

        const { error: evidenceError } =
          item.itemNo
            ? await supabase.rpc(
                'add_submission_evidence',
                {
                  ...evidenceArgs,
                  p_item_no: item.itemNo
                }
              )
            : await supabase.rpc(
                'add_submission_evidence',
                evidenceArgs
              );

        if (evidenceError) throw evidenceError;
      }

      /*
       * Final safety check for YouTube.
       * The RPC below verifies that exactly 9 evidence rows exist before
       * allowing this submission to remain pending.
       */
      if (mission.id === 'youtube') {
        const {
          data: evidenceCount,
          error: evidenceCheckError
        } = await supabase.rpc(
          'count_youtube_submission_evidence',
          {
            p_submission_id: createdSubmissionId
          }
        );

        if (evidenceCheckError) throw evidenceCheckError;

        if (Number(evidenceCount || 0) !== 9) {
          throw new Error(
            `Không lưu đủ 9 ảnh minh chứng YouTube (đã lưu ${evidenceCount || 0}/9).`
          );
        }
      }

      if (includeBonus && bonusMission) {
        const bonusTopQuantity =
          bonusMission.id === 'spotify_extra'
            ? bonusItems.length * 15
            : bonusMission.id === 'social_extra' || bonusMission.id === 'tiktok_extra' || bonusMission.id === 'youtube_extra'
              ? bonusItems.length
              : bonusMission.id === 'itunes_extra'
                ? bonusItems.length
                : 1;

        const { data: bonusSubmission, error: bonusSubmitError } = await supabase.rpc('submit_bonus_mission_submission', {
          p_mission_slug: bonusMission.id,
          p_parent_submission_id: createdSubmissionId,
          p_content_url: null,
          p_note: 'Bonus được chọn cùng lúc với mission chính.',
          p_platform: bonusMission.id === 'social_extra' ? 'social' : bonusMission.id.replace('_extra',''),
          p_account_id:
            bonusMission.id === 'spotify_extra'
              ? bonusItems[0]?.accountId?.trim() || null
              : null,
          p_redeem_code: null,
          p_external_action_id: null,
          p_quantity: bonusTopQuantity
        });
        if (bonusSubmitError) throw bonusSubmitError;
        const bonusRow = Array.isArray(bonusSubmission) ? bonusSubmission[0] : bonusSubmission;
        createdBonusSubmissionId = bonusRow?.submission_id || bonusRow?.id || (typeof bonusRow === 'string' ? bonusRow : null);
        if (!createdBonusSubmissionId) throw new Error('Không tạo được bonus submission.');

        for (let i = 0; i < bonusItems.length; i++) {
          const item = bonusItems[i];
          const { error: itemError } = await supabase.rpc('add_submission_item', {
            p_submission_id: createdBonusSubmissionId,
            p_item_no: i + 1,
            p_platform: item.platform || bonusMission.id.replace('_extra',''),
            p_content_url: item.contentUrl?.trim() || null,
            p_account_id:
              bonusMission.id === 'spotify_extra'
                ? item.accountId?.trim() || null
                : null,
            p_redeem_code: null,
            p_external_action_id: null,
            p_quantity:
              bonusMission.id === 'spotify_extra'
                ? 15
                : 1,
            p_metadata: {
              ...(item.metadata || {}),
              activity_date:
                bonusMission.id === 'spotify_extra'
                  ? item.activityDate
                  : null,
              quantity:
                bonusMission.id === 'spotify_extra'
                  ? 15
                  : item.metadata?.quantity
            },
            p_proof_source: bonusMission.id === 'itunes_extra' ? 'web_code' : null
          });
          if (itemError) throw itemError;
        }

        for (const item of bonusUploaded) {
          const args = {
            p_submission_id: createdBonusSubmissionId,
            p_evidence_type: item.type,
            p_storage_path: item.path,
            p_original_filename: item.file.name,
            p_mime_type: item.file.type,
            p_file_size: item.file.size
          };
          const { error: evError } = item.itemNo
            ? await supabase.rpc('add_submission_evidence', { ...args, p_item_no: item.itemNo })
            : await supabase.rpc('add_submission_evidence', args);
          if (evError) throw evError;
        }
      }

      /*
       * IMPORTANT: verify the row before telling the player that the submit
       * succeeded. This catches cases where the RPC returned successfully but
       * a later item/evidence step failed or the row is not actually pending.
       */
      const { data: verifiedSubmission, error: verifyError } = await supabase
        .from('mission_submissions')
        .select('id, status, attempt_no')
        .eq('id', createdSubmissionId)
        .maybeSingle();

      if (verifyError) throw verifyError;

      if (!verifiedSubmission) {
        throw new Error('Không tìm thấy submission vừa tạo trong database.');
      }

      if (verifiedSubmission.status !== 'pending') {
        throw new Error(
          `Submission #${verifiedSubmission.attempt_no || '?'} không ở trạng thái pending (hiện tại: ${verifiedSubmission.status}).`
        );
      }

      // From this point on the database submission is committed. Never roll
      // it back because a UI refresh/modal callback fails afterwards.
      submissionCommitted = true;
      createdBonusSubmissionId = null;
      createdSubmissionId = null;

      notify(
        mission.id === 'youtube'
          ? 'Đã submit và lưu đủ 9 ảnh minh chứng! Bài đang chờ admin duyệt.'
          : 'Đã submit và lưu minh chứng! Bài đang chờ admin duyệt.'
      );

      // Let the native file-input event finish before unmounting this modal.
      // This prevents Chromium/React DOM "removeChild" errors when the modal
      // contains multiple <input type="file"> elements.
      await nextFrame();
      await nextFrame();
      try {
        await onSubmitted();
      } catch (uiError) {
        // The database submit is already committed. Do not show a false
        // submit failure and do not rollback the valid submission.
        console.warn('post-submit UI refresh:', uiError);
      }
    } catch (error) {
      console.error('submit mission:', error);

      // Only rollback when the database operation did NOT reach the committed
      // state. A UI error after commit must never delete the valid submission.
      if (!submissionCommitted) {
        await rollbackSubmission();
        await cleanupStorage();
      }

      console.error('FULL SUBMIT ERROR:', error);
      notify(
        error?.message ||
          error?.details ||
          error?.hint ||
          'Submit thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const canEdit =
    !isLocked &&
    !isPending &&
    !isCompleted &&
    !isBonusMaxed &&
    latestSubmission?.status !== 'pending';

  return (
    <div className="modalOverlay" onClick={close}>
      <section
        className="modal submissionModal"
        data-step={submissionStep}
        onClick={e => e.stopPropagation()}
      >
        <button className="modalClose" onClick={close}>
          ×
        </button>

        <Logo mission={localMission} />

        <h2>{localMission.action}</h2>
        <h3>{localMission.name}</h3>
        {mission.id !== 'youtube' && <p>{localMission.hint}</p>}

        <div className="modalRule">
          {localMission.rule || localMission.description}
        </div>

        {isCompleted && (
          <div className="submissionState success">
            ✓ NHIỆM VỤ ĐÃ ĐƯỢC ADMIN DUYỆT
          </div>
        )}

        {isPending && (
          <div className="submissionState pending">
            ⏳ ĐÃ SUBMIT — ĐANG CHỜ ADMIN DUYỆT
          </div>
        )}

        {isRejected && (
          <div className="submissionState rejected">
            <b>✕ ADMIN TỪ CHỐI</b>
            <p>
              {latestSubmission.admin_comment ||
                'Admin chưa để lại nhận xét.'}
            </p>
            <small>
              Bạn có thể sửa minh chứng và submit lại.
            </small>
          </div>
        )}

        {isBonus && finished && (
          <div
            style={{
              padding: 10,
              marginBottom: 12,
              borderRadius: 12,
              background: '#fff7cf',
              border: '1px solid #e5bd41'
            }}
          >
            <b>
              +{localMission.points_per_unit || localMission.points}{' '}
              PTS / {localMission.unit_quantity || 1} đơn vị
            </b>
            <div style={{ opacity: .7 }}>
              Đã đạt {count}/{localMission.target}. Tối đa{' '}
              {localMission.max_points || 0} điểm.
            </div>
          </div>
        )}

        {mission.id === 'spotify' && (
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              borderRadius: 14,
              background: '#fffdf7',
              border: '1px solid #d8ddcf'
            }}
          >
            <img
              src="/assets/statsfm.png"
              alt="Hướng dẫn minh chứng lượt nghe bằng stats.fm"
              style={{
                display: 'block',
                width: '100%',
                maxHeight: 230,
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: 10,
                border: '1px solid #e1e3d9'
              }}
            />

            <div
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                background: '#eef5d8',
                lineHeight: 1.5
              }}
            >
              <b style={{ display: 'block', marginBottom: 4 }}>
                📊 TỔNG HỢP LƯỢT STREAM
              </b>

              <div style={{ fontSize: 14 }}>
                Bạn có thể dùng <b>stats.fm</b> để tổng hợp lịch sử nghe nhạc
                và kiểm tra số lượt stream trong ngày.
              </div>

              <a
                href="https://stats.fm/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '8px 12px',
                  borderRadius: 9,
                  background: '#fff',
                  border: '1px solid #56734a',
                  color: '#315b3e',
                  fontWeight: 900,
                  textDecoration: 'none'
                }}
              >
                🔗 MỞ STATS.FM
              </a>

              <small
                style={{
                  display: 'block',
                  marginTop: 7,
                  opacity: .72,
                  lineHeight: 1.45
                }}
              >
                Sau khi tổng hợp, chụp ảnh màn hình phần thống kê lượt nghe của ngày đó
                rồi tải ảnh chụp đó ở bên dưới. Ảnh minh họa phía trên không phải minh chứng.
              </small>
            </div>
          </div>
        )}

        {canEdit && (
          <div className="submissionForm">
            {(mission.id === 'spotify' ||
              mission.id === 'spotify_extra') && (
              <>
                <label>
                  <span>ACCOUNT SPOTIFY</span>
                  <input
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    placeholder="Account / username"
                    disabled={submitting}
                  />
                </label>

                <label>
                  <span>NGÀY STREAM</span>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={e => setActivityDate(e.target.value)}
                    disabled={submitting}
                  />
                </label>

                <label>
                  <span>
                    SỐ STREAM (tổng số stream trong ngày)
                  </span>
                  <input
                    type="number"
                    min={15}
                    max={15}
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    disabled={submitting}
                  />
                </label>
              </>
            )}

            {mission.id !== 'spotify' &&
              mission.id !== 'spotify_extra' &&
              mission.id !== 'itunes' &&
              mission.id !== 'youtube' &&
              mission.id !== 'facebook' &&
              mission.id !== 'tiktok' && (
                <label>
                  <span>ACCOUNT / USERNAME</span>
                  <input
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    placeholder="Account"
                    disabled={submitting}
                  />
                </label>
              )}

            {(mission.id === 'tiktok_extra' ||
              mission.id === 'youtube_extra') && (
              <label>
                <span>ACCOUNT / USERNAME</span>
                <input
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  placeholder="Account khác tài khoản mandatory"
                  disabled={submitting}
                />
              </label>
            )}

            {mission.id === 'itunes_extra' && (
              <p style={{ marginTop: -6, opacity: .7 }}>
                2 redeem = +1 điểm · tối đa 5 điểm. Mỗi CODE cần ảnh minh chứng.
              </p>
            )}

            {mission.id === 'social_extra' && (
              <p style={{ marginTop: -6, opacity: .7 }}>
                Mỗi nhóm 3 post = +1 điểm, tối đa 5 điểm.
              </p>
            )}

            {(mission.id !== 'itunes' &&
              mission.id !== 'youtube' &&
              mission.id !== 'facebook' &&
              mission.id !== 'tiktok' &&
              mission.id !== 'spotify' &&
              mission.id !== 'spotify_extra' &&
              mission.id !== 'tiktok_extra' &&
              mission.id !== 'youtube_extra' &&
              mission.id !== 'itunes_extra' &&
              mission.id !== 'social_extra') && (
                <label>
                  <span>
                    LINK BÀI POST / VIDEO{' '}
                    <em>(nếu có)</em>
                  </span>
                  <input
                    type="url"
                    value={postUrl}
                    onChange={e => setPostUrl(e.target.value)}
                    placeholder="https://..."
                    disabled={submitting}
                  />
                </label>
              )}

            {(mission.id === 'itunes' ||
              mission.id === 'youtube' ||
              mission.id === 'facebook' ||
              mission.id === 'tiktok' ||
              mission.id === 'tiktok_extra' ||
              mission.id === 'youtube_extra' ||
              mission.id === 'itunes_extra' ||
              mission.id === 'social_extra') && (
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  padding: 12,
                  border: '1px solid #d8ddcf',
                  borderRadius: 14,
                  background: '#fffdf7'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}
                >
                  <b>
                    {mission.id === 'itunes'
                      ? '3 MINH CHỨNG iTUNES'
                      : mission.id === 'youtube'
                        ? ''
                        : mission.id === 'facebook'
                          ? '3 BÀI ĐĂNG'
                          : mission.id === 'tiktok'
                            ? '3 VIDEO'
                          : 'SUBMISSION ITEMS'}
                  </b>

                  {mission.id === 'itunes' && (
                    <div
                      style={{
                        display: 'grid',
                        gap: 8,
                        width: '100%',
                        padding: 12,
                        borderRadius: 14,
                        background: '#fff7cf',
                        border: '1px solid #e6c65a',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <b style={{ display: 'block', fontSize: 14 }}>
                            LẤY CODE REDEEM
                          </b>
                          <small style={{ display: 'block', marginTop: 3, opacity: 0.72 }}>
                            Nhấn nút để mở website, lấy 3 code rồi chụp ảnh màn hình phần code đã nhận.
                          </small>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              localMission.resourceUrl,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                          disabled={submitting}
                          style={{
                            flexShrink: 0,
                            border: '2px solid #2c4738',
                            borderRadius: 10,
                            padding: '9px 13px',
                            background: '#2f7d3d',
                            color: '#fff',
                            fontWeight: 900,
                            cursor: submitting ? 'default' : 'pointer'
                          }}
                        >
                          🔗 LẤY CODE REDEEM
                        </button>
                      </div>
                    </div>
                  )}

                  {(mission.id === 'tiktok_extra' ||
                    mission.id === 'youtube_extra' ||
                    mission.id === 'social_extra') && (
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={submitting}
                    >
                      ＋ THÊM
                    </button>
                  )}
                </div>

                {items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: '1px solid #e1e3d9',
                      background: '#fff'
                    }}
                  >
                    <b style={{ display: 'block', marginBottom: 8 }}>
                      {mission.id === 'itunes'
                        ? `LƯỢT ${index + 1} · ẢNH CODE REDEEM`
                        : mission.id === 'youtube'
                          ? `TÀI KHOẢN ${index + 1}`
                          : mission.id === 'facebook'
                            ? `BÀI ĐĂNG ${index + 1}`
                            : mission.id === 'tiktok'
                              ? `VIDEO ${index + 1}`
                              : `ITEM #${index + 1}`}
                    </b>

                    {mission.id === 'itunes' && (
                      <div style={{ display: 'grid', gap: 8 }}>
                        <small
                          style={{
                            color: '#657368',
                            lineHeight: 1.4
                          }}
                        >
                          Tải lên ảnh chụp rõ code redeem của lượt này.
                        </small>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleItunesProofFile(index, e)}
                          disabled={submitting}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />

                        {itunesProofFiles[index] && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              padding: 8,
                              borderRadius: 10,
                              background: '#fff8d9',
                              border: '1px solid #ead67a'
                            }}
                          >
                            <small
                              style={{
                                minWidth: 0,
                                wordBreak: 'break-word'
                              }}
                            >
                              ✓ {itunesProofFiles[index].name}
                            </small>

                            <button
                              type="button"
                              onClick={() => removeItunesProofFile(index)}
                              disabled={submitting}
                              style={{
                                flexShrink: 0,
                                width: 30,
                                height: 30,
                                padding: 0
                              }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {(mission.id === 'social_extra') && (
                      <select
                        value={item.platform}
                        onChange={e =>
                          updateItem(
                            index,
                            'platform',
                            e.target.value
                          )
                        }
                        disabled={submitting}
                      >
                        <option value="facebook">FACEBOOK</option>
                        <option value="tiktok">TIKTOK</option>
                      </select>
                    )}

                    {(mission.id === 'tiktok_extra' ||
                      mission.id === 'youtube_extra' ||
                      mission.id === 'itunes_extra' ||
                      mission.id === 'social_extra') && (
                      <input
                        value={item.accountId}
                        onChange={e =>
                          updateItem(
                            index,
                            'accountId',
                            e.target.value
                          )
                        }
                        placeholder="Account / username"
                        disabled={submitting}
                      />
                    )}

                    {mission.id === 'itunes_extra' && (
                      <input
                        value={item.redeemCode}
                        onChange={e =>
                          updateItem(
                            index,
                            'redeemCode',
                            e.target.value
                          )
                        }
                        placeholder="Redeem code"
                        disabled={submitting}
                      />
                    )}

                    {(mission.id !== 'youtube' &&
                      (mission.id === 'facebook' ||
                        mission.id === 'tiktok' ||
                        mission.id === 'tiktok_extra' ||
                        mission.id === 'youtube_extra' ||
                        mission.id === 'social_extra')) && (
                      <input
                        type="url"
                        value={item.contentUrl}
                        onChange={e =>
                          updateItem(
                            index,
                            'contentUrl',
                            e.target.value
                          )
                        }
                        placeholder={
                          mission.id === 'facebook'
                            ? `Link bài đăng Facebook ${index + 1}`
                            : mission.id === 'tiktok'
                              ? `Link video TikTok ${index + 1}`
                              : 'Link video / bài đăng cần kiểm chứng'
                        }
                        disabled={submitting}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}

                    {mission.id === 'youtube' && (
                      <div
                        style={{
                          display: 'grid',
                          gap: 8,
                          marginTop: 8,
                          padding: 10,
                          borderRadius: 12,
                          background: '#f7f8f2',
                          border: '1px solid #dfe4d8'
                        }}
                      >
                        <small
                          style={{
                            fontWeight: 800,
                            color: '#496353'
                          }}
                        >
                        </small>

                        {[
                          ['subscribe', 'Ảnh tài khoản đã SUBSCRIBE kênh lighT_'],
                          ['like', 'Ảnh đã LIKE video'],
                          ['comment', 'Ảnh đã COMMENT video']
                        ].map(([proofType, label]) => {
                          const proof = youtubeProofFiles[index]?.[proofType];

                          return (
                            <div
                              key={proofType}
                              style={{
                                display: 'grid',
                                gap: 5
                              }}
                            >
                              <small style={{ fontWeight: 700 }}>
                                {label}
                              </small>

                              {proof ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 8,
                                    padding: 8,
                                    borderRadius: 9,
                                    background: '#fff8d9',
                                    border: '1px solid #ead67a'
                                  }}
                                >
                                  <small
                                    style={{
                                      minWidth: 0,
                                      overflowWrap: 'anywhere'
                                    }}
                                  >
                                    ✓ {proof.name}
                                  </small>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeYoutubeProofFile(
                                        index,
                                        proofType
                                      )
                                    }
                                    disabled={submitting}
                                    style={{
                                      width: 30,
                                      height: 30,
                                      flexShrink: 0,
                                      padding: 0
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e =>
                                    handleYoutubeProofFile(
                                      index,
                                      proofType,
                                      e
                                    )
                                  }
                                  disabled={submitting}
                                  style={{
                                    width: '100%',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {mission.id === 'youtube_extra' && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(2, minmax(0, 1fr))',
                          gap: 6,
                          marginTop: 6
                        }}
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={!!item.metadata?.liked}
                            onChange={e =>
                              updateItemMetadata(
                                index,
                                'liked',
                                e.target.checked
                              )
                            }
                            disabled={submitting}
                          />
                          Like
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={!!item.metadata?.commented}
                            onChange={e =>
                              updateItemMetadata(
                                index,
                                'commented',
                                e.target.checked
                              )
                            }
                            disabled={submitting}
                          />
                          Comment
                        </label>
                      </div>
                    )}

                    {(mission.id === 'tiktok_extra' ||
                      mission.id === 'youtube_extra' ||
                      mission.id === 'social_extra') &&
                      items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={submitting}
                          style={{
                            marginTop: 6,
                            color: '#a74439'
                          }}
                        >
                          × REMOVE
                        </button>
                      )}
                  </div>
                ))}
              </div>
            )}

            {mission.id !== 'itunes' &&
              mission.id !== 'youtube' &&
              mission.id !== 'facebook' &&
              mission.id !== 'tiktok' && (
                <label>
                  <span>ẢNH MINH CHỨNG STATS.FM</span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    disabled={submitting}
                  />
                </label>
              )}

            {mission.id !== 'facebook' && files.length > 0 && (
              <div className="evidenceList">
                {files.map((item, index) => (
                  <div
                    className="evidenceRow"
                    key={`${item.file.name}-${index}`}
                  >
                    <div className="evidenceName">
                      <b>{item.file.name}</b>
                      <small>
                        {(
                          item.file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{' '}
                        MB
                      </small>
                    </div>

                    {mission.id !== 'spotify' && (
                      <select
                        value={item.type}
                        onChange={e =>
                          updateType(index, e.target.value)
                        }
                        disabled={submitting}
                      >
                        {EVIDENCE_TYPES.map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={submitting}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {mission.id !== 'facebook' &&
              mission.id !== 'tiktok' && (
              <label>
                <span>
                  GHI CHÚ CHO ADMIN{' '}
                  <em>(không bắt buộc)</em>
                </span>

                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ví dụ: Đây là ảnh stream của ngày hôm nay..."
                  rows={3}
                  disabled={submitting}
                />
              </label>
            )}

            {!isBonus && submissionStep === 'main' && (
              <button
                className="playButton submitButton"
                disabled={submitting}
                onClick={() => {
                  if (!mainMissionValidation()) return;
                  setSubmissionStep('bonus-choice');
                }}
              >
                TIẾP THEO →
              </button>
            )}

            {!isBonus && submissionStep === 'bonus-choice' && (
              <div className="bonusChoicePanel">
                <div className="bonusChoiceMessage">
                  <b>🌻 Bạn có muốn tham gia thêm {bonusMission?.name} không?</b>
                  <small style={{ display: 'block', marginTop: 5, opacity: .7 }}>{bonusMission?.id === 'spotify_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. Spotify Extra cho phép thêm các account khác, mỗi account stream 15 lần.' : bonusMission?.id === 'youtube_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. YouTube Extra cho phép thêm các account khác, mỗi account cần đủ Subscribe + Like + Comment.' : bonusMission?.id === 'tiktok_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. TikTok Extra cho phép gửi thêm các video hợp lệ.' : bonusMission?.id === 'social_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. Social Extra cho phép gửi thêm các bài đăng hợp lệ.' : bonusMission?.id === 'itunes_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. iTunes Extra cho phép gửi thêm các CODE hợp lệ.' : 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo.'}</small>
                </div>
                <div className="bonusChoiceActions">
                  <button className="bonusChoiceYes" type="button" onClick={() => { setIncludeBonus(true); setSubmissionStep('bonus-form'); }}>
                    + THAM GIA THÊM
                  </button>
                  <button className="bonusChoiceNo" type="button" onClick={() => { setIncludeBonus(false); setSubmissionStep('main-submit'); }}>
                    KHÔNG, SUBMIT
                  </button>
                </div>
              </div>
            )}

            {!isBonus && submissionStep === 'bonus-form' && bonusMission && (
              <div className="bonusFormPanel">
                <div className="bonusFormHeader">
                  <div className="bonusFormIcon">🌻</div>
                  <div>
                    <span className="bonusFormKicker">PHẦN THAM GIA THÊM</span>
                    <h3>{bonusMission.name}</h3>
                    <p>{bonusMission.rule}</p>
                    <span className="bonusRuleHint">Điểm được Admin duyệt theo đúng quy luật Extra.</span>
                  </div>
                </div>

                {bonusMission.id === 'spotify_extra' && (
                  <div className="bonusSection">
                    <div className="bonusItemsHeader">
                      <div>
                        <b>MINH CHỨNG SPOTIFY EXTRA</b>
                        <small>Mỗi account khác account ở nhiệm vụ chính · mỗi account stream đúng 15 lần.</small>
                      </div>
                      {bonusItems.length < 3 && (
                        <button
                          type="button"
                          className="addEvidenceButton"
                          onClick={addBonusItem}
                          disabled={submitting}
                        >
                          ＋ THÊM ACCOUNT
                        </button>
                      )}
                    </div>

                    <div
                      style={{
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 12,
                        background: '#eef5d8',
                        border: '1px solid #d8dfb9',
                        lineHeight: 1.45
                      }}
                    >
                      <b>🌻 15 streams / account = +5 PTS</b>
                      <small style={{ display: 'block', marginTop: 3, opacity: .72 }}>
                        Có thể thêm tối đa 3 account → tối đa 45 streams / +15 PTS. Admin sẽ duyệt theo từng submission.
                      </small>
                    </div>

                    <div className="bonusItemList">
                      {bonusItems.map((item, index) => (
                        <div className="bonusEvidenceCard" key={index}>
                          <div className="bonusEvidenceTitleRow">
                            <b>ACCOUNT SPOTIFY {index + 1}</b>
                            {index > 0 && (
                              <button
                                type="button"
                                className="removeEvidenceButton"
                                onClick={() => removeBonusItem(index)}
                                disabled={submitting}
                              >
                                × XÓA
                              </button>
                            )}
                          </div>

                          <label style={{ display: 'grid', gap: 5, marginBottom: 8 }}>
                            <span>ACCOUNT SPOTIFY</span>
                            <input
                              value={item.accountId || ''}
                              onChange={e => updateBonusItem(index, 'accountId', e.target.value)}
                              placeholder="Account / username khác tài khoản chính"
                              disabled={submitting}
                            />
                          </label>

                          <label style={{ display: 'grid', gap: 5, marginBottom: 8 }}>
                            <span>NGÀY STREAM</span>
                            <input
                              type="date"
                              value={item.activityDate || ''}
                              onChange={e => {
                                const value = e.target.value;
                                setBonusItems(prev => prev.map((row, i) =>
                                  i === index
                                    ? {
                                        ...row,
                                        activityDate: value,
                                        metadata: { ...(row.metadata || {}), activity_date: value, quantity: 15 }
                                      }
                                    : row
                                ));
                              }}
                              disabled={submitting}
                            />
                          </label>

                          <label style={{ display: 'grid', gap: 5, marginBottom: 8 }}>
                            <span>SỐ STREAM</span>
                            <input
                              type="number"
                              value={15}
                              readOnly
                              disabled={submitting}
                            />
                          </label>

                          <div className="proofUploadBox">
                            <span>📸 ẢNH MINH CHỨNG STATS.FM</span>
                            <small>Chụp phần thống kê cho đúng account và đúng ngày stream.</small>
                            {bonusSpotifyProofFiles[index] ? (
                              <div className="selectedProofFile">
                                <span>✓ {bonusSpotifyProofFiles[index].name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeBonusSpotifyProofFile(index)}
                                  disabled={submitting}
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleBonusSpotifyProofFile(index, e)}
                                disabled={submitting}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bonusMission.id === 'itunes_extra' && (
                  <div className="bonusSection bonusQuestSection bonusItunesSection">
                    <div className="bonusSectionTop bonusQuestTop">
                      <div className="bonusQuestLead">
                        <span className="bonusQuestBadge">🌱 BONUS QUEST</span>
                        <b>MINH CHỨNG iTUNES</b>
                        <small>2 redeem = +1 điểm · tối đa 5 điểm · mỗi CODE tương ứng 1 ảnh minh chứng.</small>
                      </div>
                      <button
                        type="button"
                        className="softActionButton bonusQuestAction"
                        onClick={() => window.open('https://light-itunes-code.vercel.app/', '_blank', 'noopener,noreferrer')}
                        disabled={submitting}
                      >
                        🔗 MỞ TRANG LẤY CODE
                      </button>
                    </div>

                    <div className="bonusItemsHeader bonusItemsHeaderGame">
                      <div>
                        <b>ẢNH MINH CHỨNG</b>
                        <small> Mỗi CODE = 1 minh chứng · thêm CODE tùy số lượng bạn muốn gửi.</small>
                      </div>
                      {bonusItems.length < 10 && (
                        <button
                          type="button"
                          className="addEvidenceButton addEvidenceButtonGame"
                          onClick={addBonusItem}
                          disabled={submitting}
                        >
                          ＋ THÊM CODE
                        </button>
                      )}
                    </div>

                    <div className="bonusItemList bonusQuestList">
                      {bonusItems.map((item, index) => (
                        <div className="bonusEvidenceCard bonusEvidenceCardGame" key={index}>
                          <div className="bonusEvidenceTitleRow bonusEvidenceTitleRowGame">
                            <div>
                              <span className="bonusStepNo">{String(index + 1).padStart(2, '0')}</span>
                              <b>CODE {index + 1}</b>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                className="removeEvidenceButton"
                                onClick={() => removeBonusItem(index)}
                                disabled={submitting}
                              >
                                × XÓA
                              </button>
                            )}
                          </div>

                          <div className="proofUploadBox bonusProofUploadGame">
                            <div className="proofUploadTitle">
                              <span>📸 ẢNH MINH CHỨNG CODE</span>
                              <small>Chụp rõ phần code redeem đã nhận.</small>
                            </div>

                            {bonusItunesProofFiles[index] ? (
                              <div className="selectedProofFile selectedProofFileGame">
                                <span>✓ {bonusItunesProofFiles[index].name}</span>
                                <button
                                  type="button"
                                  aria-label={`Xóa ảnh CODE ${index + 1}`}
                                  onClick={() =>
                                    setBonusItunesProofFiles(prev => {
                                      const next = { ...prev };
                                      delete next[index];
                                      return next;
                                    })
                                  }
                                  disabled={submitting}
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <label className="gameFilePicker">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => {
                                    const f = e.target.files?.[0] || null;
                                    e.currentTarget.value = '';
                                    if (!f) return;
                                    if (!f.type.startsWith('image/')) {
                                      notify('Chỉ nhận file ảnh minh chứng.');
                                      return;
                                    }
                                    if (f.size > 10 * 1024 * 1024) {
                                      notify('Mỗi ảnh tối đa 10MB.');
                                      return;
                                    }
                                    setBonusItunesProofFiles(prev => ({ ...prev, [index]: f }));
                                  }}
                                  disabled={submitting}
                                />
                                <span className="gameFilePickerButton">CHỌN ẢNH</span>
                                <span className="gameFilePickerHint">JPG · PNG · WEBP · tối đa 10MB</span>
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bonusMission.id === 'youtube_extra' && (
                  <div className="bonusSection">
                    <div className="bonusItemsHeader">
                      <div>
                        <b>MINH CHỨNG YOUTUBE</b>
                      </div>
                      <div>                         <small>Mỗi tài khoản phải khác ở nhiệm vụ chính.</small>
</div>
                      {bonusItems.length < 5 && (
                        <button type="button" className="addEvidenceButton" onClick={addBonusItem} disabled={submitting}>
                          ＋ THÊM TÀI KHOẢN
                        </button>
                      )}
                    </div>

                    <div className="bonusItemList">
                      {bonusItems.map((item, index) => (
                        <div className="bonusEvidenceCard" key={index}>
                          <div className="bonusEvidenceTitleRow">
                            <b>TÀI KHOẢN {index + 1}</b>
                            {index > 0 && (
                              <button type="button" className="removeEvidenceButton" onClick={() => removeBonusItem(index)} disabled={submitting}>XÓA</button>
                            )}
                          </div>
                          {[
                            ['subscribe', 'ẢNH TÀI KHOẢN ĐÃ SUBSCRIBE KÊNH lighT_'],
                            ['like', 'ẢNH ĐÃ LIKE VIDEO'],
                            ['comment', 'ẢNH ĐÃ COMMENT VIDEO']
                          ].map(([type, label]) => {
                            const proof = bonusYoutubeProofFiles[index]?.[type];
                            return (
                              <div className="proofUploadBox" key={type}>
                                <span>{label}</span>
                                {proof ? (
                                  <div className="selectedProofFile">
                                    <span>✓ {proof.name}</span>
                                    <button type="button" onClick={() => removeBonusYoutubeProof(index, type)} disabled={submitting}>×</button>
                                  </div>
                                ) : (
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleBonusYoutubeProofFile(index, type, e)}
                                    disabled={submitting}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(bonusMission.id === 'facebook' || bonusMission.id === 'social_extra') && (
                  <div className="bonusSection">
                    <div className="bonusItemsHeader">
                      <div>
                        <b>LINK BÀI ĐĂNG</b>
                        <small>Giống phần chính: mỗi bài chỉ cần link bài đăng.</small>
                      </div>
                      {bonusItems.length < 15 && (
                        <button type="button" className="addEvidenceButton" onClick={addBonusItem} disabled={submitting}>
                          ＋ THÊM BÀI
                        </button>
                      )}
                    </div>
                    <div className="bonusItemList">
                      {bonusItems.map((item, index) => (
                        <div className="bonusEvidenceCard" key={index}>
                          <div className="bonusEvidenceTitleRow">
                            <b>BÀI ĐĂNG {index + 1}</b>
                            {index > 0 && (
                              <button type="button" className="removeEvidenceButton" onClick={() => removeBonusItem(index)} disabled={submitting}>XÓA</button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={item.contentUrl}
                            onChange={e => updateBonusItem(index, 'contentUrl', e.target.value)}
                            placeholder={`Link bài đăng ${index + 1}`}
                            disabled={submitting}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bonusMission.id === 'tiktok_extra' && (
                  <div className="bonusSection">
                    <div className="bonusItemsHeader">
                      <div>
                        <b>LINK VIDEO TIKTOK</b>
                        <small>Giống phần chính: mỗi video chỉ cần link video.</small>
                      </div>
                      {bonusItems.length < 5 && (
                        <button type="button" className="addEvidenceButton" onClick={addBonusItem} disabled={submitting}>
                          ＋ THÊM VIDEO
                        </button>
                      )}
                    </div>
                    <div className="bonusItemList">
                      {bonusItems.map((item, index) => (
                        <div className="bonusEvidenceCard" key={index}>
                          <div className="bonusEvidenceTitleRow">
                            <b>VIDEO {index + 1}</b>
                            {index > 0 && (
                              <button type="button" className="removeEvidenceButton" onClick={() => removeBonusItem(index)} disabled={submitting}>XÓA</button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={item.contentUrl}
                            onChange={e => updateBonusItem(index, 'contentUrl', e.target.value)}
                            placeholder={`Link video TikTok ${index + 1}`}
                            disabled={submitting}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                <div className="bonusFormActions">
                  <button type="button" className="softBackButton" onClick={() => setSubmissionStep('bonus-choice')} disabled={submitting}>← QUAY LẠI</button>
                  <button className="playButton submitButton" type="button" disabled={submitting} onClick={submit}>
                    {submitting ? 'ĐANG SUBMIT...' : '↑ SUBMIT'}
                  </button>
                </div>
              </div>
            )}
            {!isBonus && submissionStep === 'main-submit' && (
              <button
                className="playButton submitButton"
                disabled={submitting}
                onClick={submit}
              >
                {submitting ? 'ĐANG SUBMIT...' : (isRejected ? '↻ SUBMIT LẠI' : '↑ SUBMIT')}
              </button>
            )}
          </div>
        )}

        {isLocked && (
          <div className="submissionState locked">
            🔒 Hoàn thành nhiệm vụ trước để mở chặng này.
          </div>
        )}

        {isBonusMaxed && (
          <div className="submissionState success">
            ✓ BONUS ĐÃ ĐẠT MỨC TỐI ĐA
          </div>
        )}

        <div className="modalProgress">
          <b>{count}</b>
          <span>/{localMission.target}</span>

          <i>
            <u
              style={{
                width: `${Math.min(
                  100,
                  (Number(count || 0) /
                    Number(localMission.target || 1)) *
                    100
                )}%`
              }}
            />
          </i>
        </div>

        {latestSubmission && (
          <div className="latestSubmission">
            <small>
              LẦN SUBMIT GẦN NHẤT · #
              {latestSubmission.attempt_no}
            </small>

            <span>
              {latestSubmission.status.toUpperCase()}
            </span>

            {latestSubmission.points_awarded > 0 && (
              <em>
                +{latestSubmission.points_awarded} điểm
              </em>
            )}

            {latestSubmission.reviewed_at && (
              <em>
                Đã review:{' '}
                {new Date(
                  latestSubmission.reviewed_at
                ).toLocaleString('vi-VN')}
              </em>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App runtime error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            boxSizing: 'border-box',
            background: '#b9e990',
            color: '#17382a',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <div
            style={{
              width: 'min(620px, 100%)',
              padding: 24,
              borderRadius: 20,
              background: '#fff9df',
              border: '3px solid #6c4d2a',
              boxSizing: 'border-box'
            }}
          >
            <h2 style={{ marginTop: 0 }}>Có lỗi khi xử lý submission</h2>
            <p style={{ lineHeight: 1.5 }}>
              Trang không bị mất dữ liệu. Hãy xem lỗi bên dưới để xác định
              chính xác bước nào đang hỏng.
            </p>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: 12,
                borderRadius: 10,
                background: '#f3eee0',
                overflow: 'auto'
              }}
            >
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                fontWeight: 900
              }}
            >
              ↻ TẢI LẠI TRANG
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* =========================================================
   ROOT
   ========================================================= */

createRoot(
  document.getElementById('root')
).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);