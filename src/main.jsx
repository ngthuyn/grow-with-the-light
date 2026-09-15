import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { supabase } from './lib/supabase';

/* =========================================================
   MISSIONS
   ========================================================= */

const MISSIONS = [
  {
    id: 'youtube',
    name: 'YOUTUBE',
    action: "GIEO MẦM",
    target: 3,
    points: 10,
    logo: '/assets/youtube.png',
    color: '#ff5757',
    rule: 'Mỗi tài khoản cần: 1 ảnh đã subscribe kênh lighT_, 1 ảnh Like và 1 ảnh Comment.',
    hint: 'Mỗi tài khoản cần 3 ảnh: đã subscribe kênh lighT_, Like và Comment.'
  },
  {
    id: 'itunes',
    name: 'iTUNES',
    action: 'TƯỚI MÁT',
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
    rule: '1 Subscribe + 1 Like + 1 Comment = +2 điểm · tối đa 10 điểm',
    hint: 'Mỗi gói Like + Comment hợp lệ = +2 điểm.',
    mission_type: 'bonus'
  }
];

const ALL_MISSIONS = [...MISSIONS, ...BONUS_MISSIONS];

/* =========================================================
   IMAGE ASSETS — thay ảnh tại /public/assets/ theo đúng tên này
   ========================================================= */
const GROWTH_IMAGE_ASSETS = {
  1: '/assets/plant-seed.png',        // hạt
  2: '/assets/plant-sprout.png',      // mầm
  3: '/assets/plant-young.png',       // chồi + lá
  4: '/assets/plant-bud.png',         // cây cao + nụ
  5: '/assets/plant-bloom.png',       // hoa hướng dương nở
};

const SKY_IMAGE_ASSETS = {
  sun: '/assets/sun.png',
  cloud1: '/assets/cloud-1.png',
  cloud2: '/assets/cloud-2.png',
};

const TINIE_IMAGE_ASSET = '/assets/tinie.png';


// Round 2 là round BONUS riêng. Progress/target của bonus KHÔNG cộng với Round 1.

const initialCounts = Object.fromEntries(
  MISSIONS.map(m => [m.id, 0])
);

const initialStatuses = Object.fromEntries(
  MISSIONS.map(m => [m.id, 'in_progress'])
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
            : 'CHÀO MỪNG tinie iu';

  const subtitle =
    mode === 'signup'
      ? 'Tạo tài khoản để bắt đầu hành trình.'
      : mode === 'forgot'
        ? 'Nhập email để nhận liên kết đặt lại mật khẩu.'
        : mode === 'update-password'
          ? 'Đặt mật khẩu mới cho tài khoản của bạn.'
          : mode === 'admin-login'
            ? 'Khu vực chỉ dành cho admin.'
            : 'Đăng nhập để tiếp tục hành trình nhé.';

  return (
    <div className="authPage">

      <div className="authSky">
        <img className="authImage authSunImage" src="/assets/sun.png" alt="" aria-hidden="true" draggable="false" />
        <img className="authImage authCloudImage authCloudImage1" src="/assets/cloud-1.png" alt="" aria-hidden="true" draggable="false" />
        <img className="authImage authCloudImage authCloudImage2" src="/assets/cloud-2.png" alt="" aria-hidden="true" draggable="false" />
       { /*<img className="authImage authCloudImage authCloudImage3" src="/assets/cloud-3.png" alt="" aria-hidden="true" draggable="false" />*/}
        <span className="authHill authHill1" />
        <span className="authHill authHill2" />
      </div>

      <div className="authDecor authFlower authFlower1">
        ✿
      </div>

      <div className="authDecor authFlower authFlower2">
        ✿
      </div>

     

      <main className="authShell">

        <section className="authBrandBlock">

          <div className="authMiniLogo">
            MINI<span>GAME</span>
          </div>

          <div className="authWorld">
            OUR WORLD
          </div>

          <h1>
            GROW
            <em>WITH THE lighT</em>
          </h1>

          <p>
            Grow a little · Shine a little · Grow with the lighT
          </p>

        </section>

        <section className="authCard">

          <div className="authCardHeader">

            <div className="authSeed">
              <img src="/assets/icon_huongduong.png" alt="" aria-hidden="true" draggable="false" />
            </div>

            <div>
              <span className="authEyebrow">
                YOUR JOURNEY
              </span>

              <div className="authTitleRow">
                <h2>{title}</h2>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="authAdminButton"
                    onClick={() => switchMode('admin-login')}
                    disabled={submitting}
                  >
                    ADMIN
                  </button>
                )}
                {mode === 'admin-login' && (
                  <button
                    type="button"
                    className="authAdminButton"
                    onClick={() => switchMode('login')}
                    disabled={submitting}
                  >
                    ← USER
                  </button>
                )}
              </div>
              <p>{subtitle}</p>
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
                {submitting ? 'ĐANG XỬ LÝ...' : '🔐 ĐĂNG NHẬP'}
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
                      : '🌻 ĐĂNG NHẬP'}
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



/* =========================================================
   PIXEL LOADING SCREEN
   ========================================================= */
function PixelLoadingScreen({ message = 'Đang mở khu vườn...' }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Loading animation is intentionally slower and steady.
    // The App also keeps the loading screen visible for at least 3 seconds.
    const startedAt = performance.now();
    const MIN_LOADING_MS = 3000;

    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const nextProgress = Math.min(
        96,
        Math.round((elapsed / MIN_LOADING_MS) * 96)
      );
      setProgress(nextProgress);
    }, 40);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="pixelLoadingScreen">
      <div className="pixelLoadingSky">
        <img src="/assets/login-sun.png" alt="" aria-hidden="true" className="pixelLoadingSun" draggable="false" />
        <img src="/assets/login-cloud-1.png" alt="" aria-hidden="true" className="pixelLoadingCloud pixelLoadingCloud1" draggable="false" />
        <img src="/assets/login-cloud-3.png" alt="" aria-hidden="true" className="pixelLoadingCloud pixelLoadingCloud2" draggable="false" />
      </div>

      <div className="pixelLoadingContent">
        <div
          className="pixelLoadingTitle"
          style={{
            textShadow: 'none',
            filter: 'none',
            WebkitFilter: 'none'
          }}
        >
          <span style={{ textShadow: 'none', filter: 'none' }}>GROW</span>
          <strong style={{ textShadow: 'none', filter: 'none' }}>WITH THE lighT</strong>
        </div>

        <img
          src="/assets/light-sunflower.png"
          alt="lighT cầm bó hoa hướng dương"
          className="pixelLoadingLight"
          draggable="false"
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />

        <div className="pixelLoadingMessage">{message}</div>

        <div
          className="pixelProgress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress}
        >
          <div
            className="pixelProgressFill"
            style={{ width: `${progress}%` }}
          />
          <span className="pixelProgressFlower">🌻</span>
        </div>

        <div className="pixelProgressText">{progress}%</div>
        <div className="pixelLoadingHint">
          “Cùng nhau gieo những điều tốt đẹp”
        </div>

        <div
          className="pixelLoadingCredit"
          style={{
            position: 'fixed',
            left: '0',
            right: '0',
            bottom: '18px',
            width: '100%',
            textAlign: 'center',
            margin: '0',
            padding: '0 12px',
            boxSizing: 'border-box',
            fontSize: '12px',
            lineHeight: 1.4,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#24552b',
            zIndex: 20
          }}
        >
          A project by TINcredible - All for lighT
        </div>
      </div>
    </div>
  );
}

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
  const loadingStartedAtRef = useRef(performance.now());
  const [refreshing, setRefreshing] = useState(false);
  const [bonusStates, setBonusStates] = useState({});
  const [bonusFlow, setBonusFlow] = useState(null);
  const [bonusStarting, setBonusStarting] = useState(false);
  const [round2Ready, setRound2Ready] = useState(false);
  const [mandatorySubmittedToday, setMandatorySubmittedToday] = useState({});
  // Round 1 first-completion celebration:
  // 1 = congratulate +1 sunflower, 2 = explain/open Round 2.
  const [round1CelebrationStep, setRound1CelebrationStep] = useState(0);
  // Chuyển qua lại giữa 2 round bằng nút; hoàn thành Round 1 KHÔNG tự nhảy sang Round 2.
  const [activeRound, setActiveRound] = useState('round1');
  const harvestedDayRef = useRef(null);
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

  // Submit = đã làm. Admin approve/reject chỉ quyết định điểm.
  // IMPORTANT: statuses/submissions below are already scoped to the current
  // game day, so yesterday's completed state cannot make today full.
  const hasWorkedMission = missionId => {
    const missionStatus = statuses[missionId];
    if (['pending_review', 'completed', 'rejected'].includes(missionStatus)) {
      return true;
    }

    // Rejected submissions may leave user_missions in an old status.
    // Only count the latest submission if it belongs to the current game day.
    const latest = submissions[missionId];
    if (!latest || !['pending', 'pending_review', 'completed', 'rejected'].includes(latest.status)) {
      return false;
    }

    const todayKst = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const sameGameDay = latest.game_day != null && Number(latest.game_day) === Number(dayNumber);
    const sameActivityDate = latest.activity_date === todayKst;
    const sameSubmittedDate = latest.submitted_at
      ? new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(latest.submitted_at)) === todayKst
      : false;

    return sameGameDay || sameActivityDate || sameSubmittedDate;
  };

  // Round 1 is finished as soon as EACH mandatory mission has been
  // submitted at least once. Approval/rejection does not matter.
  // Use BOTH sources because old/current DB rows can be represented in
  // user_missions before mission_submissions is refreshed (and vice versa).
  // ROUND 1 unlock source of truth:
  // ONLY submissions belonging to the CURRENT game day count.
  // Do not use user_missions/status here because that table can retain
  // yesterday's state and would incorrectly unlock Round 2.
  const isMandatorySubmitted = missionId =>
    Boolean(mandatorySubmittedToday[missionId]);

  const cleared = MISSIONS.filter(m => isMandatorySubmitted(m.id)).length;
  const finished = cleared === MISSIONS.length;

  // Round 2 must never be visible/active before all 5 Round-1 missions
  // are submitted for the current game day.
  useEffect(() => {
    if (!finished || !round2Ready) {
      setActiveRound('round1');
    }
  }, [finished, round2Ready]);

  // Round 2 is never a valid visible state unless Round 1 is complete.
  const canShowRound2 = finished && activeRound === 'round2';

  // ROUND 1 -> ROUND 2:
  // Khi đủ 5 nhiệm vụ đã submit, server tự cộng đúng 1 bông cho ngày đó
  // và mở toàn bộ nhiệm vụ bonus. Không cần Admin duyệt trước.
  useEffect(() => {
    if (!finished || !authUser?.id) {
      setRound2Ready(false);
      return;
    }

    // IMPORTANT: Round 2 must unlock in the UI immediately after the 5th
    // mandatory submission. The +1 flower RPC is separate and must NEVER
    // be able to keep the Round 2 tab disabled when the RPC has an error.
    setRound2Ready(true);

    if (harvestedDayRef.current === dayNumber) {
      return;
    }

    let cancelled = false;

    const unlockRound2 = async () => {
      const { data, error } = await supabase.rpc('harvest_round1_if_ready');

      if (cancelled) return;

      if (error) {
        // Round 2 is already unlocked locally from `finished`.
        // This error only means the server-side +1 flower could not be
        // recorded yet; do not lock the Bonus tab because of it.
        console.error('harvest_round1_if_ready:', error);
        notify(`Round 2 đã mở. Chưa ghi được +1 🌻: ${error.message || 'lỗi server'}`);
        return;
      }

      const result = Array.isArray(data) ? data[0] : data;
      const returnedDay = Number(result?.day_number ?? result?.result_day_number ?? dayNumber);
      const returnedFlowers = Number(result?.sunflower_count ?? result?.result_sunflower_count ?? sunflowerCount);

      harvestedDayRef.current = returnedDay;
      setSunflowerCount(returnedFlowers);
      setRound2Ready(true);
      // Giữ người chơi ở round hiện tại; chỉ mở khóa nút Round 2.
      setActiveRound(prev => prev === 'round2' ? 'round2' : 'round1');
      setBonusFlow(null);

      await loadGame(true);

      if (result?.harvested_now) {
        // This is the first Round-1 completion/harvest for this game day.
        // Show the two-step congratulations flow only here, not on every refresh.
        setRound1CelebrationStep(1);
      }
    };

    unlockRound2();

    return () => {
      cancelled = true;
    };
  }, [finished, authUser?.id, dayNumber]);

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

    setBonusFlow(null);
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
      if (nextUser) {
        loadingStartedAtRef.current = performance.now();
      }
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
          if (nextUser) {
            loadingStartedAtRef.current = performance.now();
          }
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

  const syncProfileUsername = async user => {
    if (!user?.id) return;

    // Email/Password signup stores the name entered by the user in
    // `user_name` + `full_name`. Google OAuth normally provides `full_name`
    // and/or `name`. Never derive the display name from the email address.
    const displayName =
      user.user_metadata?.user_name?.trim() ||
      user.user_metadata?.full_name?.trim() ||
      user.user_metadata?.name?.trim() ||
      '';

    if (!displayName) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username: displayName })
      .eq('id', user.id);

    if (error) {
      console.error('sync profile username:', error);
    }
  };

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

      // Keep the in-game display name synchronized with Supabase Auth metadata.
      // Email/Password -> the name entered at signup.
      // Google -> the Google account name.
      await syncProfileUsername(user);

      const { error: ensureError } =
        await supabase.rpc('ensure_game_state');

      if (ensureError) {
        console.error('ensure_game_state:', ensureError);
        notify('Không thể khởi tạo dữ liệu game.');
      }

      const currentProfileDay = Number(roleProfile?.day_number ?? 1);

      const [
        profileRes,
        missionsRes,
        submissionsRes,
        notificationsRes,
        harvestRes
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
            game_day,
            points_awarded,
            note,
            status,
            admin_comment,
            submitted_at,
            reviewed_at,
            verified_at,
            round2_harvest_id,
            mission:missions(slug, mission_type)
          `)
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false }),

        supabase
          .from('user_notifications')
          .select('id, type, title, message, submission_id, mission_id, read_at, created_at, mission:missions(name, action, mission_type)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),

        supabase
          .from('user_round1_harvests')
          .select('id, day_number, harvested_at')
          .eq('user_id', user.id)
          .eq('day_number', currentProfileDay)
          .order('harvested_at', { ascending: false })
          .limit(1)
      ]);

      if (profileRes.error) console.error('profiles:', profileRes.error);
      if (missionsRes.error) console.error('user_missions:', missionsRes.error);
      if (submissionsRes.error) console.error('mission_submissions:', submissionsRes.error);
      if (notificationsRes.error) console.error('notifications:', notificationsRes.error);
      if (harvestRes.error) console.error('round1 harvest:', harvestRes.error);

      const nextCounts = { ...initialCounts };
      const nextStatuses = { ...initialStatuses };
      const nextBonuses = {};

      // Round 2 is COMPLETELY independent from Round 1.
      // Never read a bonus card's progress from the mandatory mission progress.
      // Bonus progress is reconstructed only from submissions whose mission itself
      // is a bonus mission, for the current game day. This also repairs old rows
      // where bonus user_missions accidentally inherited Round 1 progress.
      const todayKst = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());

      const bonusSubmissionTotals = {};
      const bonusPending = {};
      const currentGameDay = Number(profileRes.data?.day_number ?? 1);
      const round1HarvestId = harvestRes.data?.[0]?.id || null;
      const round1HarvestAt = harvestRes.data?.[0]?.harvested_at || null;

      // ROUND 1 unlock condition — STRICT:
      // Only a mission_submission whose game_day exactly equals the user's
      // CURRENT profile day can count. Do NOT use user_missions, activity_date,
      // submitted_at date, or any legacy fallback here. user_missions has no
      // game_day column in the current schema, so using it can carry yesterday's
      // completed state into a new day and incorrectly unlock Round 2.
      const submittedMandatoryToday = {};
      for (const mission of MISSIONS) submittedMandatoryToday[mission.id] = false;

      for (const sub of submissionsRes.data || []) {
        const slug = sub.mission?.slug;
        if (!slug || !MISSIONS.some(m => m.id === slug)) continue;

        const sameGameDay =
          sub.game_day != null &&
          Number(sub.game_day) === Number(currentGameDay);

        if (sameGameDay) {
          submittedMandatoryToday[slug] = true;
        }
      }

      setMandatorySubmittedToday(submittedMandatoryToday);

      /*
       * IMPORTANT — PER-DAY ROUND 1 STATE
       * Do NOT use user_missions.progress/status for mandatory cards here.
       * That table is persistent per user/mission in the current schema and
       * can contain the previous day's completed state. The source of truth
       * for a new day is mission_submissions.game_day (with a date fallback
       * only for legacy rows).
       */
      const currentMandatorySubmissions = {};
      for (const mission of MISSIONS) {
        currentMandatorySubmissions[mission.id] = null;
      }

      for (const sub of submissionsRes.data || []) {
        const slug = sub.mission?.slug;
        if (!slug || !MISSIONS.some(m => m.id === slug)) continue;

        const submissionDateKst = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(sub.submitted_at));

        const sameGameDay =
          sub.game_day != null && Number(sub.game_day) === currentGameDay;
        const sameLegacyDate =
          sub.game_day == null &&
          (sub.activity_date === todayKst || submissionDateKst === todayKst);

        if (!sameGameDay && !sameLegacyDate) continue;

        const existing = currentMandatorySubmissions[slug];
        if (
          !existing ||
          new Date(sub.submitted_at).getTime() >
            new Date(existing.submitted_at).getTime()
        ) {
          currentMandatorySubmissions[slug] = sub;
        }
      }

      // Build a clean Round-1 state for THIS game day only.
      for (const mission of MISSIONS) {
        const sub = currentMandatorySubmissions[mission.id];

        if (!sub) {
          nextCounts[mission.id] = 0;
          nextStatuses[mission.id] = 'in_progress';
          continue;
        }

        // A valid Round-1 submission represents completion of that mission's
        // required quantity for the current day. Approval only controls points.
        nextCounts[mission.id] = Number(mission.target || sub.quantity || 1);
        nextStatuses[mission.id] =
          sub.status === 'approved'
            ? 'completed'
            : sub.status === 'rejected'
              ? 'rejected'
              : 'pending_review';
      }

      for (const sub of submissionsRes.data || []) {
        const slug = sub.mission?.slug;

        // ONLY an exact BONUS mission slug can contribute to Round 2.
        // Mandatory mission progress can never leak into Bonus progress.
        const isBonusSubmission = BONUS_MISSIONS.some(m => m.id === slug);
        if (!isBonusSubmission || !slug) continue;

        // A Bonus submission belongs to exactly one Round-2 instance: the
        // current Round-1 harvest that opened Bonus. Old test submissions and
        // old rounds have no matching round2_harvest_id and are ignored.
        if (!round1HarvestId || sub.round2_harvest_id !== round1HarvestId) continue;

        // Prefer the DB game_day. Fall back to date only for legacy rows.
        if (sub.game_day != null) {
          if (Number(sub.game_day) !== currentGameDay) continue;
        } else {
          const submissionDay = sub.activity_date ||
            new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Asia/Seoul',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).format(new Date(sub.submitted_at));

          if (submissionDay !== todayKst) continue;
        }

        // game_day alone cannot separate Round 1 and Round 2 because both
        // happen on the same game day. A Bonus submission is valid for this
        // Round 2 only if it was submitted AFTER Round 1 was harvested.
        // This prevents old/corrupted Bonus rows from inheriting Round 1 data.
        if (round1HarvestAt && new Date(sub.submitted_at).getTime() < new Date(round1HarvestAt).getTime()) {
          continue;
        }

        if (sub.status === 'rejected') continue;

        // A Bonus card represents the latest approved standalone Round-2
        // submission for this day. Never accumulate Round-1/old-day/old-attempt data.
        if (sub.parent_submission_id) continue;
        if (sub.status === 'pending') bonusPending[slug] = true;
        if (sub.status === 'approved') {
          const existing = bonusSubmissionTotals[slug];
          if (!existing || new Date(sub.submitted_at).getTime() > existing.submittedAt) {
            bonusSubmissionTotals[slug] = {
              quantity: Number(sub.quantity || 0),
              submittedAt: new Date(sub.submitted_at).getTime()
            };
          }
        }
      }

      for (const row of missionsRes.data || []) {
        const mission = row.missions;
        const slug = mission?.slug;
        if (!slug) continue;

        if (mission.mission_type === 'bonus') {
          const target = Number(mission.target || 1);
          const submissionProgress = Math.min(
            target,
            Number(bonusSubmissionTotals[slug]?.quantity || 0)
          );
          const progress = submissionProgress;
          // IMPORTANT:
          // A Bonus is a one-submission-per-day mission. Once Admin approves
          // that Bonus today, the Bonus is LOCKED for the rest of today,
          // even if the approved quantity is below the nominal target.
          const approvedToday = Boolean(bonusSubmissionTotals[slug]);
          const status = approvedToday
            ? 'approved_locked'
            : progress >= target
              ? 'completed'
              : bonusPending[slug]
                ? 'pending_review'
                : 'in_progress';

          nextBonuses[slug] = {
            ...mission,
            progress,
            status,
            completed_at:
              approvedToday || progress >= target
                ? (row.completed_at || new Date().toISOString())
                : null
          };
        }
        // Mandatory missions intentionally do NOT read row.progress/status
        // from user_missions. That would carry yesterday's full progress into
        // the new game day.
      }

      // Ensure every configured bonus appears as a separate zero-based state.
      for (const bonus of BONUS_MISSIONS) {
        if (!nextBonuses[bonus.id]) {
          nextBonuses[bonus.id] = {
            ...bonus,
            progress: 0,
            status: 'in_progress',
            completed_at: null
          };
        }
      }

      /*
       * Latest submission must be scoped to the CURRENT game round.
       * A rejected Bonus submission from an older round/day must never make
       * today's Bonus modal look rejected or consume today's retry.
       */
      const latestSubmissions = {};
      for (const sub of submissionsRes.data || []) {
        const mission = ALL_MISSIONS.find(
          m => m.id === (sub.mission?.slug || sub.mission_id)
        );
        const slug = mission?.id || sub.mission?.slug;
        if (!slug) continue;

        let belongsToCurrentRound = false;

        if (mission?.mission_type === 'bonus') {
          belongsToCurrentRound = Boolean(
            round1HarvestId &&
            sub.round2_harvest_id === round1HarvestId &&
            sub.game_day != null &&
            Number(sub.game_day) === currentGameDay &&
            round1HarvestAt &&
            new Date(sub.submitted_at).getTime() >= new Date(round1HarvestAt).getTime()
          );
        } else {
          belongsToCurrentRound =
            sub.game_day != null &&
            Number(sub.game_day) === currentGameDay;
        }

        if (!belongsToCurrentRound) continue;

        const existing = latestSubmissions[slug];
        if (
          !existing ||
          new Date(sub.submitted_at).getTime() >
            new Date(existing.submitted_at).getTime()
        ) {
          latestSubmissions[slug] = sub;
        }
      }

      const mappedSubmissions = {};
      for (const sub of submissionsRes.data || []) {
        const subSlug = sub.mission?.slug;

        if (BONUS_MISSIONS.some(m => m.id === subSlug)) {
          if (sub.round2_harvest_id !== round1HarvestId) continue;
        } else if (MISSIONS.some(m => m.id === subSlug)) {
          // Mandatory submission shown in the UI must also belong to THIS day.
          const submissionDateKst = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(new Date(sub.submitted_at));

          const sameGameDay =
            sub.game_day != null && Number(sub.game_day) === currentGameDay;
          const sameLegacyDate =
            sub.game_day == null &&
            (sub.activity_date === todayKst || submissionDateKst === todayKst);

          if (!sameGameDay && !sameLegacyDate) continue;
        } else {
          continue;
        }

        const matched = (missionsRes.data || []).find(
          row => row.mission_id === sub.mission_id
        );
        const slug = matched?.missions?.slug || subSlug;

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
        read_at: n.read_at || null
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
      // Do not let a fast Supabase response make the loading screen
      // disappear at 10–20%. Keep the initial loading screen for at
      // least 3 seconds, then reveal the game.
      const MIN_LOADING_MS = 3000;
      const elapsed = performance.now() - loadingStartedAtRef.current;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

      if (remaining > 0) {
        await new Promise(resolve => window.setTimeout(resolve, remaining));
      }

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

    // Logout xong thì quay về URL sạch, xoá toàn bộ OAuth error/state
    // còn sót trên address bar và tránh render trung gian với session cũ.
    window.location.replace(window.location.origin);
  };

  const advanceToNextDay = async () => {
    if (advancingDay) return;

    setAdvancingDay(true);

    try {
      const { data, error } = await supabase.rpc('advance_to_next_day');

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      setSunflowerCount(Number(result?.sunflower_count ?? result?.result_sunflower_count ?? sunflowerCount));
      setDayNumber(Number(result?.day_number ?? result?.result_day_number ?? dayNumber + 1));
      setBonusFlow(null);
      setSelected(null);
      setRound2Ready(false);
      setActiveRound('round1');
      harvestedDayRef.current = null;
      setRound1CelebrationStep(0);

      await loadGame(true);
      notify(`🌻 Sang ngày ${Number(result?.day_number ?? result?.result_day_number ?? dayNumber + 1)}! Chúc bạn tiếp tục chăm hoa thật vui.`);
    } catch (error) {
      console.error('advance_to_next_day:', error);
      const message = error?.message || error?.details || error?.hint || 'Không thể chuyển sang ngày tiếp theo.';
      notify(`❌ ${message}`);
      window.alert(`Không thể chuyển ngày.\n\n${message}`);
    } finally {
      setAdvancingDay(false);
    }
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

    // 3) Persist the read state on the server.
    // Do not rely on localStorage for cross-device state.
    if (!authUser?.id) return;

    const { error } = await supabase.rpc('mark_user_notification_read_v2', {
      p_notification_id: id
    });

    if (error) {
      console.error('mark notification read:', error);
    }
  };

  // Only unread notifications are shown in the dropdown.
  // Read notifications stay out of the user-facing notification list.
  const unreadNotifications = notifications.filter(n => !n.read_at);
  const unreadCount = unreadNotifications.length;

  const firstIncompleteIndex = MISSIONS.findIndex(
    m => !hasWorkedMission(m.id)
  );

  const currentIndex = Math.min(
    firstIncompleteIndex === -1
      ? MISSIONS.length - 1
      : firstIncompleteIndex,
    MISSIONS.length - 1
  );

  const currentMission = MISSIONS[currentIndex];

  // Cả 5 nhiệm vụ chính luôn mở, không phụ thuộc thứ tự hay duyệt.
  const canOpenMission = mission =>
    MISSIONS.some(m => m.id === mission.id);

  const openMission = mission => {
    if (!canOpenMission(mission)) return;
    setSelected(mission);
  };

  if (!authReady) {
    return <PixelLoadingScreen message="Đang mở cánh cửa khu vườn..." />;
  }

  if (!authUser) return <AuthScreen />;

  if (loading) {
    return <PixelLoadingScreen message="Đang gieo ánh sáng vào khu vườn..." />;
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
                        {selectedNotification.mission?.mission_type === 'bonus' ? 'BONUS' : 'NHIỆM VỤ'}
                        {' · '}
                        {selectedNotification.mission?.name || 'Submission'}
                        {' · '}
                        {selectedNotification.type === 'mission_approved'
                          ? 'ĐÃ ĐƯỢC DUYỆT'
                          : selectedNotification.type === 'mission_rejected'
                            ? 'ĐÃ BỊ TỪ CHỐI'
                            : selectedNotification.title}
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
                    {selectedNotification.type === 'mission_approved'
                      ? `${selectedNotification.mission?.mission_type === 'bonus' ? 'Bonus' : 'Nhiệm vụ'} ${selectedNotification.mission?.name || 'này'} đã được Admin duyệt.${/\+\d+(?:\.\d+)?/.test(selectedNotification.message || '')
  ? ` ${selectedNotification.message.match(/\+\d+(?:\.\d+)?[^.]*\.?/)?.[0] || ''}`
  : ''}`.trim()
                      : selectedNotification.type === 'mission_rejected'
                        ? `${selectedNotification.mission?.mission_type === 'bonus' ? 'Bonus' : 'Nhiệm vụ'} ${selectedNotification.mission?.name || 'này'} đã bị Admin từ chối.\n\n${selectedNotification.message || 'Vui lòng kiểm tra lại minh chứng và submit lại 1 lần duy nhất.'}`
                        : selectedNotification.message}
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
          <img
            className="skyImage skySunImage"
            src={SKY_IMAGE_ASSETS.sun}
            alt=""
            aria-hidden="true"
            draggable="false"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <img
            className="skyImage skyCloudImage skyCloudImage1"
            src={SKY_IMAGE_ASSETS.cloud1}
            alt=""
            aria-hidden="true"
            draggable="false"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <img
            className="skyImage skyCloudImage skyCloudImage2"
            src={SKY_IMAGE_ASSETS.cloud2}
            alt=""
            aria-hidden="true"
            draggable="false"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="sunflowerField" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} className={`fieldSunflower fieldSunflower${(i % 6) + 1}`}>
                <i className="fieldStem" />
                <b className="fieldBloom">✿</b>
              </span>
            ))}
          </div>
        </div>

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

            <div className="roundTabs" role="tablist" aria-label="Chuyển round">
              <button
                type="button"
                className={`roundTab ${activeRound === 'round1' ? 'active' : ''}`}
                onClick={() => setActiveRound('round1')}
              >
                <span>ROUND 1</span>
                <b>NHIỆM VỤ CHÍNH</b>
              </button>
              <span className="roundTabArrow" aria-hidden="true">→</span>
              <button
                type="button"
                className={`roundTab ${activeRound === 'round2' ? 'active' : ''} ${!finished ? 'disabled' : ''}`}
                onClick={() => finished && setActiveRound('round2')}
                disabled={!finished}
                title={finished ? 'Mở Round 2' : 'Hoàn thành đủ 5 nhiệm vụ Round 1 để mở'}
              >
                <span>ROUND 2</span>
                <b>BONUS</b>
              </button>
            </div>

            <div className={`currentRoundLabel ${activeRound === 'round2' ? 'is-round2' : 'is-round1'}`}>
              <span>{activeRound === 'round2' ? 'ROUND 2' : 'ROUND 1'}</span>
              <b>{activeRound === 'round2' ? 'BONUS' : 'NHIỆM VỤ CHÍNH'}</b>
              <small>
                {activeRound === 'round2'
                  ? '🌻tinie ơiii, góp thêm thật nhiều tia nắng và kiếm thêm điểm nhé!'

                  : finished
                    ? 'Round 1 đã hoàn thành · Bạn có thể xem lại Round 1 hoặc bấm ROUND 2 để làm Bonus'
                    : 'Hoàn thành 5 nhiệm vụ chính theo thứ tự bất kỳ để nhận về một bông hoa hướng dương'}
              </small>
            </div>

            <section
              className={`missionRoad ${activeRound === 'round2' ? 'is-round2' : 'is-round1'}`}
              aria-label={activeRound === 'round2' ? 'Round 2 - nhiệm vụ bonus' : 'Round 1 - nhiệm vụ chính'}
            >
              <div className="roadLine" />

               {!canShowRound2 ? (
                MISSIONS.map((m, i) => {
                  const approved = statuses[m.id] === 'completed';
                  const pending = statuses[m.id] === 'pending_review';
                  const rejected =
                    statuses[m.id] === 'rejected' ||
                    submissions[m.id]?.status === 'rejected';
                  const done = hasWorkedMission(m.id);
                  const active = !done && !finished;
                  const growthStage = i + 1;

                  let label = 'ĐANG MỞ';
                  if (approved) label = '✓ ĐÃ DUYỆT · CÓ ĐIỂM';
                  else if (pending) label = '⏳ ĐÃ LÀM · CHỜ DUYỆT';
                  else if (rejected) label = '↻ ĐÃ LÀM · SUBMIT LẠI';
                  else if (active) label = 'CHƯA LÀM';

                  return (
                    <article
                      key={m.id}
                      className={[
                        'mission',
                        done ? 'done' : '',
                        active ? 'active' : '',
                        pending ? 'pending' : '',
                        rejected ? 'rejected' : '',
                        `stage${i + 1}`
                      ].join(' ')}
                      onClick={() => openMission(m)}
                    >
                      <div className="plantSpot">
                        <Plant growthStage={growthStage} done={done} active={active} />
                      </div>

                      <div
                        className="missionCard"
                        style={{ '--missionColor': m.color, cursor: 'pointer' }}
                      >
                        <div className="missionNo">{i + 1}</div>
                        <div className="missionAction">{m.action}</div>
                        <h2>{m.name}</h2>
                        <p>{m.rule}</p>
                        <div className="progress">
                          <span
                            style={{
                              width: `${Math.min(100, ((done ? m.target : counts[m.id]) / m.target) * 100)}%`
                            }}
                          />
                        </div>
                        <div className="cardBottom">
                          <b>{done ? m.target : counts[m.id]}/{m.target}</b>
                          <small>{label}</small>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <>
                  <div className="bonusTinieHero">
                    <img
                      src="/assets/tinie_sunflower.png"
                      alt="Tinie cầm hoa hướng dương"
                      draggable="false"
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                   {/* <div>
                      <strong>ROUND 2 · BONUS TỰ 🌻</strong>
                      <span>🌻tinie ơiii, góp thêm thật nhiều tia nắng và kiếm thêm điểm nhé!</span>
                    </div>
                    */}
                  </div>

                  {BONUS_MISSIONS.map((m, i) => {
                  const state = bonusStates[m.id] || { progress: 0, status: 'in_progress' };
                  const latest = submissions[m.id];
                  const bonusProgress = Number(state.progress || 0);
                  // Round 2 hiển thị hoàn toàn độc lập với Round 1.
                  // Round 1 đã hoàn thành chỉ là điều kiện mở khóa Bonus, không cộng progress.
                  const progress = bonusProgress;
                  const target = Number(m.target || 1);
                  const maxed = progress >= target;
                  const approvedToday = state.status === 'approved_locked' || latest?.status === 'approved';
                  const pending = !approvedToday && (state.status === 'pending_review' || latest?.status === 'pending');
                  const rejected = !approvedToday && (state.status === 'rejected' || latest?.status === 'rejected');
                  const label = approvedToday
                    ? '✓ ĐÃ ĐƯỢC DUYỆT · KHÓA HÔM NAY'
                    : maxed
                      ? '✓ ĐÃ ĐỦ · CHỜ DUYỆT'
                      : pending
                        ? '⏳ ĐÃ SUBMIT · CHỜ DUYỆT'
                        : rejected
                          ? '↻ SUBMIT LẠI'
                          : 'BONUS';

                  return (
                    <article
                      key={m.id}
                      className={`mission bonusRoundMission ${maxed ? 'done' : ''} ${approvedToday ? 'approvedLocked' : ''} ${pending ? 'pending' : ''} ${rejected ? 'rejected' : ''}`}
                      onClick={() => setSelected(m)}
                    >
                      <div
                        className="missionCard"
                        style={{ '--missionColor': m.color, cursor: 'pointer' }}
                      >
                        <div className="missionNo">{i + 1}</div>
                        <div className="missionAction">{m.action}</div>
                        <h2>{m.name}</h2>
                        <p>{m.rule}</p>
                        <div className="progress">
                          <span style={{ width: `${Math.min(100, (progress / target) * 100)}%` }} />
                        </div>
                        <div className="cardBottom">
                          <b>{Math.min(progress, target)}/{target}</b>
                          <small>{label}</small>
                        </div>
                      </div>
                    </article>
                  );
                  })}
                </>
              )}
            </section>
          </>

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
          {finished && (
            <button
              className="backButton"
              onClick={advanceToNextDay}
              disabled={advancingDay}
            >
              →
              <span>NGÀY TIẾP THEO</span>
            </button>
          )}

          <div className="currentBox">
            <small>
              {activeRound === 'round2'
                ? (
                    <>
                      <img
                        src="/assets/icon_huongduong.png"
                        alt=""
                        aria-hidden="true"
                        draggable="false"
                        style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle', marginRight: 5 }}
                      />
                      ROUND 2 · HOA ĐÃ NỞ!
                    </>
                  )
                : '🌱 ROUND 1 · NHIỆM VỤ CHÍNH'}
            </small>

            <strong>
              {activeRound === 'round2' ? 'BONUS · TỰ CHỌN' : currentMission.action}
            </strong>

            <span>
              {activeRound === 'round2'
                ? 'Thêm một tia nắng nhỏ, để bông hoa thêm khoe sắc!'
                : currentMission.name}
            </span>
          </div>

          <div className="mascotBox">
            <img
              className="tinieImageAsset"
              src={TINIE_IMAGE_ASSET}
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
          .tinieImageAsset {
            display: block;
            width: auto;
            height: 112px;
            max-width: 150px;
            object-fit: contain;
            object-position: bottom center;
          }

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
        /* =====================================================
           CUSTOM IMAGE ASSETS
           Các ảnh đều nằm trong /public/assets/
           ===================================================== */

        /* Remove old CSS decorations: PNGs are the only plant artwork. */
        .mission .growthSoil,
        .mission .sunflowerFlower,
        .mission .fieldSunflower,
        .mission .soil,
        .mission .seedStage,
        .mission .sproutStage,
        .mission .youngStage,
        .mission .budStage,
        .mission .bloomStage {
          display: none !important;
        }

        .growthPlantImage {
          transition: transform .18s ease;
          user-select: none;
        
          /* Keep the original pixel artwork, but do not enlarge each source
             pixel into a visible checkerboard block. */
          image-rendering: auto;
          image-rendering: smooth;
        }

        .plantActive .growthPlantImage {
          animation: plantAssetBob 1.8s ease-in-out infinite;
          transform: translateX(-50%) translateY(-3px);
        }

        @keyframes plantAssetBob {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -3px; }
        }

        .skyImage {
          position: absolute;
          display: block;
          width: auto;
          height: auto;
          max-width: none;
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }

        .skySunImage {
          top: 18px;
          right: 5.5%;
          width: 118px;
        }

        .skyCloudImage1 {
          top: 14%;
          left: 7%;
          width: 150px;
        }

        .skyCloudImage2 {
          top: 9%;
          left: 45%;
          width: 125px;
        }

        @media (max-width: 760px) {
          .skySunImage {
            top: 12px;
            right: 3%;
            width: 88px;
          }

          .skyCloudImage1 {
            top: 14%;
            left: 7%;
            width: 110px;
          }

          .skyCloudImage2 {
            top: 9%;
            left: 45%;
            width: 92px;
          }
        }

        @media (max-width: 430px) {
          .skySunImage {
            width: 40px !important;
            right: 3% !important;
            top: 34px !important;
          }

          .skyCloudImage1 {
            width: 66px !important;
            left: 5% !important;
            top: 90px !important;
          }

          .skyCloudImage2 {
            width: 54px !important;
            right: 1% !important;
            left: auto !important;
            top: 275px !important;
          }
        }

        .currentRoundLabel {
          width: min(100%, 620px);
          margin: 8px auto 18px;
          padding: 9px 16px 10px;
          border: 2px solid #c7d7a8;
          border-radius: 14px;
          background: rgba(255, 255, 245, .92);
          box-shadow: 0 4px 0 rgba(74, 105, 55, .10);
          text-align: center;
          display: grid;
          grid-template-columns: auto auto;
          justify-content: center;
          align-items: baseline;
          column-gap: 8px;
          row-gap: 2px;
          color: #31533b;
        }

        .currentRoundLabel span {
          font-size: 13px;
          font-weight: 1000;
          letter-spacing: .08em;
        }

        .currentRoundLabel b {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .04em;
        }

        .currentRoundLabel small {
          grid-column: 1 / -1;
          font-size: 10px;
          line-height: 1.35;
          color: #637660;
          font-weight: 700;
        }

        .currentRoundLabel.is-round2 {
          border-color: #d8b83d;
          background: #fff7cf;
        }

        @media (max-width: 600px) {
          .currentRoundLabel {
            width: calc(100% - 24px);
            margin-bottom: 12px;
            padding: 8px 10px;
          }

          .currentRoundLabel span { font-size: 11px; }
          .currentRoundLabel b { font-size: 10px; }
          .currentRoundLabel small { font-size: 9px; }
        }

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

        .bonusTinieHero {
          width: min(100%, 760px);
          margin: 0 auto 16px;
          padding: 10px 18px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          border: 2px solid #d6b84b;
          border-radius: 16px;
          background: #fff8d7;
          color: #31533b;
          text-align: left;
        }

        .bonusTinieHero img {
          display: block;
          width: auto;
          height: 88px;
          max-width: 120px;
          object-fit: contain;
          flex: 0 0 auto;
        }

        .bonusTinieHero strong,
        .bonusTinieHero span {
          display: block;
        }

        .bonusTinieHero strong {
          font-size: 14px;
          line-height: 1.25;
          color: #315f3d;
        }

        .bonusTinieHero span {
          margin-top: 4px;
          font-size: 11px;
          line-height: 1.4;
          color: #61715f;
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
          .bonusTinieHero {
            padding: 8px 12px;
            gap: 9px;
          }

          .bonusTinieHero img {
            height: 70px;
            max-width: 92px;
          }

          .bonusTinieHero strong {
            font-size: 12px;
          }

          .bonusTinieHero span {
            font-size: 9px;
          }

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
        .round1CelebrationOverlay {
          position: fixed;
          inset: 0;
          z-index: 1900;
          display: grid;
          place-items: center;
          padding: 18px;
          box-sizing: border-box;
          background: rgba(20, 31, 26, .58);
          backdrop-filter: blur(5px);
        }

        .round1CelebrationModal {
          position: relative;
          width: min(500px, calc(100vw - 28px));
          box-sizing: border-box;
          padding: 26px 24px 22px;
          border: 3px solid #2c4738;
          border-radius: 24px;
          background: #fffdf4;
          color: #18372a;
          text-align: center;
          box-shadow: 0 18px 0 rgba(44, 71, 56, .14), 0 28px 70px rgba(0, 0, 0, .28);
        }

        .round1CelebrationClose {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border: 2px solid #2c4738;
          border-radius: 10px;
          background: #17382a;
          color: #fff;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
        }

        .round1CelebrationEyebrow {
          margin: 2px 28px 7px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .12em;
          color: #5b7b5d;
        }

        .round1CelebrationModal h2 {
          margin: 4px 26px 10px;
          font-size: clamp(22px, 5vw, 30px);
          line-height: 1.15;
          color: #285536;
        }

        .round1CelebrationFlower {
          display: block;
          width: 118px;
          height: 118px;
          margin: 4px auto 8px;
          object-fit: contain;
        }

        .round1CelebrationFlower.small {
          width: 92px;
          height: 92px;
        }

        .round1CelebrationLead {
          margin: 8px auto;
          font-size: 17px;
          line-height: 1.45;
          color: #31583b;
        }

        .round1CelebrationText {
          max-width: 410px;
          margin: 8px auto 14px;
          font-size: 13px;
          line-height: 1.55;
          color: #536658;
        }

        .round1CelebrationActions {
          display: grid;
          gap: 9px;
        }

        .round1CelebrationPrimary,
        .round1CelebrationSecondary {
          width: 100%;
          min-height: 44px;
          padding: 10px 14px;
          border-radius: 13px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .round1CelebrationPrimary {
          border: 2px solid #2c4738;
          background: #2f7d4f;
          color: #fff;
        }

        .round1CelebrationSecondary {
          border: 2px solid #9cb39d;
          background: #fffdf6;
          color: #294536;
        }

        @media (max-width: 470px) {
          .round1CelebrationModal {
            padding: 22px 16px 18px;
          }

          .round1CelebrationFlower {
            width: 94px;
            height: 94px;
          }

          .round1CelebrationLead {
            font-size: 15px;
          }
        }
      `}</style>

        {bonusFlow !== 'active' && (
          <div className="finishBanner" data-open={finished}>
  <img
    src="/assets/icon_huongduong.png"
    alt=""
    aria-hidden="true"
    draggable="false"
    style={{
      width: 20,
      height: 20,
      objectFit: 'contain',
      verticalAlign: 'middle',
      marginRight: 6
    }}
  />

  {finished
    ? 'ROUND 2 · BONUS'
    : 'ROUND 1 · HOÀN THÀNH 5 NHIỆM VỤ ĐỂ NHẬN 1 BÔNG HOA VÀ MỞ KHÓA NHIỆM VỤ BONUS'}
</div>
        )}
      </main>

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
              ? (round2Ready ? (bonusStates[selected.id]?.status ?? 'in_progress') : (bonusStates[selected.id]?.status ?? 'locked'))
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

      {round1CelebrationStep > 0 && (
        <div
          className="round1CelebrationOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Chúc mừng hoàn thành Round 1"
        >
          <div className="round1CelebrationModal">
            <button
              type="button"
              className="round1CelebrationClose"
              onClick={() => setRound1CelebrationStep(0)}
              aria-label="Đóng"
            >
              ×
            </button>

            {round1CelebrationStep === 1 ? (
              <>
                <div className="round1CelebrationEyebrow">🌻 CHÚC MỪNG!</div>
                <h2>Bạn đã hoàn thành Round 1!</h2>

                <img
                  src="/assets/tinie_sunflower.png"
                  alt="Hoa hướng dương"
                  className="round1CelebrationFlower"
                  draggable="false"
                />

                <p className="round1CelebrationLead">
                  Bạn nhận được <b>+1 bông hoa hướng dương</b> cho ngày hôm nay.
                </p>

                <p className="round1CelebrationText">
                  Năm nhiệm vụ chính đã hoàn thành. Một bông hoa mới đã được gieo vào khu vườn của bạn!
                </p>

                <button
                  type="button"
                  className="round1CelebrationPrimary"
                  onClick={() => setRound1CelebrationStep(2)}
                >
                  TIẾP TỤC →
                </button>
              </>
            ) : (
              <>
                <div className="round1CelebrationEyebrow">
                  <img
                    src="/assets/icon_huongduong.png"
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    style={{ width: 20, height: 20, objectFit: 'contain', verticalAlign: 'middle', marginRight: 5 }}
                  />
                  ROUND 2
                </div>
                <h2>Bonus đã được mở!</h2>

                <img
                  src="/assets/icon_huongduong.png"
                  alt="Hoa hướng dương"
                  className="round1CelebrationFlower small"
                  draggable="false"
                />

                <p className="round1CelebrationLead">
                  <b>Round 2 · BONUS TỰ CHỌN</b>
                </p>

                <p className="round1CelebrationText">
                  Bạn có thể chọn những nhiệm vụ Bonus để tiếp tục nhận thêm điểm.
                  Bonus là một chặng riêng và không cộng dồn tiến độ với Round 1.
                </p>

                <div className="round1CelebrationActions">
                  <button
                    type="button"
                    className="round1CelebrationPrimary"
                    onClick={() => {
                      setRound1CelebrationStep(0);
                      setActiveRound('round2');
                      setBonusFlow(null);
                      requestAnimationFrame(() => {
                        document.querySelector('.bonusArea')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      });
                    }}
                  >
                    XEM ROUND 2 BONUS
                  </button>

                  <button
                    type="button"
                    className="round1CelebrationSecondary"
                    onClick={() => setRound1CelebrationStep(0)}
                  >
                    ĐỂ SAU
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
                  border: '1px solid #d5d9cf',
                  background: '#fffdf7'
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
  // Rejected submissions are loaded separately so retry/50% is determined
  // by the CURRENT game day/round, never by the lifetime attempt_no.
  const [rejectedSubmissions, setRejectedSubmissions] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);

  const loadAdmin = async () => {
    setLoading(true);

    try {
      const { data: { user: currentAdmin } } = await supabase.auth.getUser();
      if (!currentAdmin?.id) throw new Error('Phiên admin đã hết.');

      const [
        submissionsRes,
        rejectedRes,
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
            game_day,
            round2_harvest_id,
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

        // Used ONLY to determine whether a pending submission is a retry.
        // A rejection from a previous game day/round must never consume
        // today's first-submit (100%) allowance.
        supabase
          .from('mission_submissions')
          .select(`
            id,
            user_id,
            mission_id,
            parent_submission_id,
            attempt_no,
            activity_date,
            game_day,
            round2_harvest_id,
            submitted_at,
            reviewed_at,
            status,
            missions(slug, mission_type)
          `)
          .eq('status', 'rejected')
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

      if (rejectedRes.error) console.error('admin rejected submissions:', rejectedRes.error);
      if (profilesRes.error) console.error('admin profiles:', profilesRes.error);
      if (ledgerRes.error) console.error('admin ledger:', ledgerRes.error);
      if (leaderboardRes.error) console.error('admin leaderboard:', leaderboardRes.error);
      if (emailsRes.error) console.error('admin emails:', emailsRes.error);
      if (adminNotiRes.error) console.error('admin notifications:', adminNotiRes.error);

      // Always update the pending queue when its own query succeeded.
      setPending(submissionsRes.data || []);
      setRejectedSubmissions(rejectedRes.data || []);
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
    // Load once when Admin opens.
    // Do NOT poll automatically: automatic reloads make the dashboard
    // jump/scroll unexpectedly while the admin is reviewing submissions.
    loadAdmin();
  }, []);

  /*
   * Retry is DAY/ROUND scoped.
   *
   * IMPORTANT:
   * `attempt_no` is a database history counter and may continue across days
   * on older deployments. It must NOT decide whether today's submission gets
   * the 50% retry cap.
   *
   * A submission is a retry only when there is an earlier REJECTED submission
   * for the same user + mission + current game_day. For Round 2, the rejected
   * row must also belong to the same round2_harvest_id.
   */
  const isSubmissionRetry = submission => {
    if (!submission) return false;

    const missionType = submission.missions?.mission_type;
    const isBonus = missionType === 'bonus';

    const currentGameDay =
      submission.game_day != null ? Number(submission.game_day) : null;

    return rejectedSubmissions.some(rejected => {
      if (rejected.id === submission.id) return false;
      if (rejected.user_id !== submission.user_id) return false;
      if (rejected.mission_id !== submission.mission_id) return false;

      const rejectedGameDay =
        rejected.game_day != null ? Number(rejected.game_day) : null;

      // New submissions should carry game_day. Keep a date fallback only for
      // legacy rejected rows that predate the game_day column.
      const sameDay =
        currentGameDay != null && rejectedGameDay != null
          ? rejectedGameDay === currentGameDay
          : rejected.activity_date &&
            submission.activity_date &&
            rejected.activity_date === submission.activity_date;

      if (!sameDay) return false;

      // Bonus retries belong to the exact Round-2 harvest/instance.
      if (isBonus) {
        return (
          rejected.round2_harvest_id != null &&
          submission.round2_harvest_id != null &&
          rejected.round2_harvest_id === submission.round2_harvest_id
        );
      }

      return true;
    });
  };

  const openSubmission = async submission => {
    setSelectedSubmission(submission);
    setRejectReason('');
    setReviewError('');
    setBonusAwardPoints('');
    setDetails(null);
    setSelectedEvidence(null);

    const [evidenceRpc, itemsRpc] = await Promise.all([
      supabase.rpc('get_admin_submission_evidence_v3', {
        p_submission_id: submission.id
      }),
      supabase.rpc('get_admin_submission_items_v3', {
        p_submission_id: submission.id
      })
    ]);

    // IMPORTANT: do not trust an empty RPC result. Older deployments can
    // have a stale/incorrect admin RPC while the evidence rows themselves
    // are already present. Fetch the base tables too and merge by id.
    const directEvidence = await supabase
      .from('submission_evidence')
      .select('*')
      .eq('submission_id', submission.id)
      .order('item_no', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: true });

    const rpcEvidenceRows = evidenceRpc.data || [];
    const directEvidenceRows = directEvidence.data || [];
    const evidenceMap = new Map();

    for (const row of [...rpcEvidenceRows, ...directEvidenceRows]) {
      const key = row?.id || `${row?.storage_path || row?.path || ''}|${row?.item_no ?? ''}|${row?.evidence_type || ''}`;
      if (!evidenceMap.has(key)) evidenceMap.set(key, row);
    }

    let evidenceRows = Array.from(evidenceMap.values()).sort((a, b) => {
      const ai = a?.item_no == null ? Number.MAX_SAFE_INTEGER : Number(a.item_no);
      const bi = b?.item_no == null ? Number.MAX_SAFE_INTEGER : Number(b.item_no);
      if (ai !== bi) return ai - bi;
      return String(a?.created_at || '').localeCompare(String(b?.created_at || ''));
    });
    let evidenceError = evidenceRpc.error || directEvidence.error || null;

    // Same approach for structured items.
    const directItems = await supabase
      .from('mission_submission_items')
      .select('*')
      .eq('submission_id', submission.id)
      .order('item_no', { ascending: true })
      .order('created_at', { ascending: true });

    const rpcItemRows = itemsRpc.data || [];
    const directItemRows = directItems.data || [];
    const itemMap = new Map();
    for (const row of [...rpcItemRows, ...directItemRows]) {
      const key = row?.id || `${row?.item_no ?? ''}|${row?.account_id || ''}|${row?.redeem_code || ''}`;
      if (!itemMap.has(key)) itemMap.set(key, row);
    }

    let itemRows = Array.from(itemMap.values()).sort((a, b) =>
      Number(a?.item_no || 0) - Number(b?.item_no || 0)
    );
    let itemError = itemsRpc.error || directItems.error || null;

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
      if (!Number.isFinite(pts) || pts < 0 || Math.round(pts * 2) !== pts * 2) {
        setReviewError('Hãy nhập số điểm bonus hợp lệ (có thể dùng .5).');
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
      const isRetrySubmission = isSubmissionRetry(selectedSubmission);
      const retryHalfMax = Number(selectedSubmission?.missions?.max_points || 0) / 2;
      const { data, error } = isBonusSubmission
        ? await supabase.rpc('review_bonus_mission_submission', {
            p_submission_id: selectedSubmission.id,
            p_decision: decision,
            // Spotify Extra points are calculated securely by the database.
            p_points:
              selectedSubmission?.missions?.slug === 'spotify_extra'
                ? 0
                : decision === 'approved'
                  ? Math.min(
                      Number(bonusAwardPoints || 0),
                      isRetrySubmission ? retryHalfMax : Number(selectedSubmission?.missions?.max_points ?? Infinity)
                    )
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

      // Load normal Admin export data. Evidence is intentionally NOT read
      // directly here because submission_evidence can be protected by RLS.
      const [
        profilesRes,
        missionsRes,
        submissionsRes,
        itemsRes,
        ledgerRes
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, avatar_url, role, total_points, created_at'),

        supabase
          .from('missions')
          .select(`
            id, slug, name, action, description, hint, target, points,
            logo_url, sort_order, is_active, mission_type, unlock_rule,
            unit_quantity, points_per_unit, max_points, is_repeatable,
            resource_url, proof_note
          `)
          .order('sort_order', { ascending: true }),

        supabase
          .from('mission_submissions')
          .select(`
            id, user_id, mission_id, parent_submission_id, attempt_no,
            post_url, note, status, admin_comment, reviewed_by,
            submitted_at, reviewed_at, platform, content_url, account_id,
            redeem_code, external_action_id, quantity, points_awarded,
            verified_at, activity_date, game_day, round2_harvest_id
          `)
          .order('submitted_at', { ascending: false }),

        supabase
          .from('mission_submission_items')
          .select(`
            id, submission_id, item_no, platform, content_url, account_id,
            redeem_code, external_action_id, quantity, metadata,
            created_at, counted_at, proof_source
          `)
          .order('item_no', { ascending: true }),

        supabase
          .from('point_ledger')
          .select(`
            id, user_id, points, source_type, source_id, mission_id,
            submission_id, reason, admin_id, created_at
          `)
          .order('created_at', { ascending: false })
      ]);

      const failed = [
        profilesRes,
        missionsRes,
        submissionsRes,
        itemsRes,
        ledgerRes
      ].find(r => r.error);

      if (failed?.error) throw failed.error;

      const profiles = profilesRes.data || [];
      const missions = missionsRes.data || [];
      const submissions = submissionsRes.data || [];
      const allItems = itemsRes.data || [];
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

      /*
       * ============================================================
       * EVIDENCE: use the EXACT same Admin RPC + fallback logic
       * as openSubmission().
       *
       * DB:
       * mission_submissions.id
       *        ↓
       * submission_evidence.submission_id
       *        ↓
       * storage_bucket + storage_path
       * ============================================================
       */
      const evidenceWithUrls = [];

      for (const submission of submissions) {
        let rpcRows = [];
        let directRows = [];

        const evidenceRpc = await supabase.rpc(
          'get_admin_submission_evidence_v3',
          {
            p_submission_id: submission.id
          }
        );

        if (!evidenceRpc.error && Array.isArray(evidenceRpc.data)) {
          rpcRows = evidenceRpc.data;
        }

        /*
         * Always try the direct table as a second source too, exactly like
         * the Admin viewer. Merge by id/path so duplicate rows are removed.
         */
        const directEvidence = await supabase
          .from('submission_evidence')
          .select('*')
          .eq('submission_id', submission.id)
          .order('item_no', { ascending: true, nullsFirst: true })
          .order('created_at', { ascending: true });

        if (!directEvidence.error) {
          directRows = directEvidence.data || [];
        }

        const evidenceMap = new Map();

        for (const row of [...rpcRows, ...directRows]) {
          const key =
            row?.id ||
            `${row?.storage_path || row?.path || ''}|${row?.item_no ?? ''}|${row?.evidence_type || row?.type || ''}`;

          if (!evidenceMap.has(key)) {
            evidenceMap.set(key, row);
          }
        }

        const evidenceRows = Array.from(evidenceMap.values());

        for (const raw of evidenceRows) {
          const evidence = {
            ...raw,
            id: raw.id || raw.evidence_id,
            submission_id:
              raw.submission_id || submission.id,
            evidence_type:
              raw.evidence_type || raw.type || '',
            storage_bucket:
              raw.storage_bucket ||
              raw.bucket ||
              'mission-evidence',
            storage_path:
              raw.storage_path ||
              raw.path ||
              '',
            original_filename:
              raw.original_filename ||
              raw.filename ||
              '',
            mime_type:
              raw.mime_type ||
              raw.content_type ||
              '',
            file_size:
              raw.file_size ??
              raw.size ??
              null,
            created_at:
              raw.created_at ||
              raw.evidence_created_at ||
              null,
            item_no:
              raw.item_no ??
              raw.item_number ??
              null
          };

          let signedUrl = '';

          if (evidence.storage_path) {
            const signed = await supabase.storage
              .from(evidence.storage_bucket)
              .createSignedUrl(
                evidence.storage_path,
                60 * 60 * 24 * 30
              );

            if (!signed.error) {
              signedUrl = signed.data?.signedUrl || '';
            } else {
              console.warn(
                'Export evidence signed URL failed:',
                evidence.storage_bucket,
                evidence.storage_path,
                signed.error
              );
            }
          }

          evidenceWithUrls.push({
            ...evidence,
            signed_url: signedUrl
          });
        }
      }

      const submissionIds = new Set(
        submissions.map(s => s.id)
      );

      const items = allItems.filter(item =>
        submissionIds.has(item.submission_id)
      );

      const itemsBySubmission = {};
      for (const item of items) {
        if (!itemsBySubmission[item.submission_id]) {
          itemsBySubmission[item.submission_id] = [];
        }
        itemsBySubmission[item.submission_id].push(item);
      }

      const evidenceBySubmission = {};
      for (const evidence of evidenceWithUrls) {
        if (!evidenceBySubmission[evidence.submission_id]) {
          evidenceBySubmission[evidence.submission_id] = [];
        }
        evidenceBySubmission[evidence.submission_id].push(evidence);
      }

      const formatEvidence = evidence =>
        evidence
          .map((e, index) => {
            const label =
              e.original_filename ||
              `${e.evidence_type || 'proof'}${e.item_no != null ? ` · item ${e.item_no}` : ''}`;

            return e.signed_url
              ? `#${index + 1} ${label} — ${e.signed_url}`
              : `#${index + 1} ${label} — ${e.storage_path || 'Không lấy được URL'}`;
          })
          .join('\n');

      const submissionRows = submissions.map(s => {
        const profile = profileMap[s.user_id] || {};
        const mission = missionMap[s.mission_id] || {};
        const submissionItems = itemsBySubmission[s.id] || [];
        const evidence = evidenceBySubmission[s.id] || [];

        return {
          'Submission ID': s.id,
          'User ID': s.user_id,
          'Username': profile.username || 'PLAYER',
          'Mission': mission.name || '',
          'Mission Slug': mission.slug || '',
          'Mission Type': mission.mission_type || '',
          'Action': mission.action || '',
          'Game Day': s.game_day ?? '',
          'Round 2 Harvest ID': s.round2_harvest_id || '',
          'Attempt': s.attempt_no,
          'Status': s.status || '',
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
          'Reviewed At': s.reviewed_at
            ? new Date(s.reviewed_at).toLocaleString('vi-VN')
            : '',
          'Verified At': s.verified_at
            ? new Date(s.verified_at).toLocaleString('vi-VN')
            : '',
          'Points Awarded': s.points_awarded || 0,
          'Admin Comment': s.admin_comment || '',
          'Submitted Items': submissionItems
            .map(item =>
              [
                `#${item.item_no}`,
                item.platform || '',
                item.account_id ? `Account: ${item.account_id}` : '',
                item.content_url ? `Link: ${item.content_url}` : '',
                item.redeem_code ? `Redeem: ${item.redeem_code}` : '',
                item.quantity != null ? `Qty: ${item.quantity}` : '',
                item.proof_source
                  ? `Proof source: ${item.proof_source}`
                  : ''
              ]
                .filter(Boolean)
                .join(' | ')
            )
            .join('\n'),
          'Proof / Evidence': formatEvidence(evidence)
        };
      });

      const itemRows = items.map(item => {
        const submission =
          submissions.find(
            s => s.id === item.submission_id
          ) || {};
        const profile = profileMap[submission.user_id] || {};
        const mission = missionMap[submission.mission_id] || {};

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

      const evidenceRows = evidenceWithUrls.map(e => {
        const submission =
          submissions.find(
            s => s.id === e.submission_id
          ) || {};
        const profile = profileMap[submission.user_id] || {};
        const mission = missionMap[submission.mission_id] || {};

        return {
          'Submission ID': e.submission_id,
          'User ID': submission.user_id || '',
          'Username': profile.username || 'PLAYER',
          'Mission': mission.name || '',
          'Mission Slug': mission.slug || '',
          'Submission Status': submission.status || '',
          'Item No': e.item_no ?? '',
          'Evidence Type': e.evidence_type || '',
          'Original Filename': e.original_filename || '',
          'Proof URL': e.signed_url || '',
          'Storage Bucket': e.storage_bucket || '',
          'Storage Path': e.storage_path || '',
          'Mime Type': e.mime_type || '',
          'File Size (bytes)': e.file_size ?? '',
          'Created At': e.created_at || ''
        };
      });

      const proofLinkRows = evidenceWithUrls.map((e, index) => {
        const submission =
          submissions.find(
            s => s.id === e.submission_id
          ) || {};
        const profile = profileMap[submission.user_id] || {};
        const mission = missionMap[submission.mission_id] || {};

        return {
          'No.': index + 1,
          'Submission ID': e.submission_id,
          'Username': profile.username || 'PLAYER',
          'Mission': mission.name || '',
          'Status': submission.status || '',
          'Game Day': submission.game_day ?? '',
          'Attempt': submission.attempt_no ?? '',
          'Item No': e.item_no ?? '',
          'Evidence Type': e.evidence_type || '',
          'Filename': e.original_filename || '',
          'OPEN PROOF': e.signed_url || '',
          'Storage Path': e.storage_path || ''
        };
      });

      const ledgerRows = ledger
        .filter(row =>
          row.submission_id &&
          submissionIds.has(row.submission_id)
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

      const append = (
        name,
        rows,
        hyperlinkColumns = []
      ) => {
        const ws = XLSX.utils.json_to_sheet(rows || []);
        const keys = rows?.length
          ? Object.keys(rows[0])
          : [];

        ws['!cols'] = keys.map(key => ({
          wch:
            key === 'Proof URL' ||
            key === 'OPEN PROOF' ||
            key === 'Proof / Evidence'
              ? 65
              : Math.min(
                  55,
                  Math.max(12, key.length + 2)
                )
        }));

        ws['!freeze'] = {
          xSplit: 0,
          ySplit: 1
        };

        const range = XLSX.utils.decode_range(
          ws['!ref'] || 'A1:A1'
        );

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

            if (
              !cell ||
              !/^https?:\/\//i.test(value)
            ) {
              continue;
            }

            cell.l = {
              Target: value,
              Tooltip: 'Nhấn để mở minh chứng'
            };

            if (columnName === 'OPEN PROOF') {
              cell.v = 'MỞ MINH CHỨNG';
            }
          }
        }

        XLSX.utils.book_append_sheet(
          wb,
          ws,
          name
        );
      };

      append(
        'Submissions',
        submissionRows,
        ['Post URL', 'Content URL']
      );

      append(
        'Submission Items',
        itemRows,
        ['Content URL']
      );

      append(
        'Evidence',
        evidenceRows,
        ['Proof URL']
      );

      append(
        'Proof Links',
        proofLinkRows,
        ['OPEN PROOF']
      );

      append(
        'Points',
        ledgerRows
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
        `grow-with-the-light-submissions-${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`
      );

      notify(
        `Đã xuất ${submissions.length} submission · ${evidenceWithUrls.length} minh chứng.`
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
    padding: 8,
    boxSizing: 'border-box',
    overflow: 'hidden'
  };

  const panelStyle = {
    width: 'min(1220px, 100%)',
    height: 'min(calc(100dvh - 16px), 920px)',
    maxHeight: 'calc(100dvh - 16px)',
    background: '#f7f2df',
    border: '3px solid #20352b',
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow: '0 25px 90px rgba(0,0,0,.32)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
  };

  const tabButton = active => ({
    border: `2px solid ${active ? '#20352b' : '#d5d9cf'}`,
    background: active ? '#f2ca4d' : '#fffdf7',
    borderRadius: 999,
    padding: '8px 13px',
    fontWeight: 800,
    cursor: 'pointer'
  });

  const adminHeaderButtonCss = `
    .adminLogoutButton {
      min-height: 44px !important;
      padding: 0 20px !important;
      border: 2px solid #7b4037 !important;
      border-radius: 12px !important;
      background: #f4d8d1 !important;
      color: #7b4037 !important;
      font-size: 14px !important;
      font-weight: 900 !important;
      letter-spacing: .02em !important;
      cursor: pointer !important;
      box-shadow: 0 3px 0 #c79b92 !important;
      transition: transform .15s ease, box-shadow .15s ease, background .15s ease !important;
    }
    .adminLogoutButton:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 0 #c79b92 !important;
      background: #f8e2dc !important;
    }
    .adminLogoutButton:active {
      transform: translateY(2px);
      box-shadow: 0 1px 0 #c79b92 !important;
    }
    @media (max-width: 640px) {
      .adminHeaderActions {
        width: 100%;
        justify-content: stretch !important;
      }
      .adminHeaderActions > button {
        flex: 1 1 auto;
      }
      .adminHeaderActions > button:last-child {
        flex: 0 0 44px;
      }
      .adminLogoutButton {
        width: 100% !important;
      }
    }

    @media (max-width: 640px) {
      .adminLogoutFooter {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
    }
  `;

  return (
    <>
      <style>{adminHeaderButtonCss}</style>
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
           {/*{fullScreen && (
              <small style={{ display: 'block', marginTop: 4, opacity: .65 }}>
                Quyền quản trị · khu vực riêng
              </small>
            )}*/}
          </div>

          <div
            className="adminHeaderActions"
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            <button
              type="button"
              onClick={loadAdmin}
              style={{
                height: 44,
                padding: '0 17px',
                border: '2px solid #20352b',
                borderRadius: 12,
                background: '#eef6e8',
                color: '#20352b',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '.02em',
                cursor: 'pointer',
                boxShadow: '0 3px 0 #b8c9b0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                transition: 'transform .15s ease, box-shadow .15s ease, background .15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 5px 0 #b8c9b0';
                e.currentTarget.style.background = '#f5faef';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 0 #b8c9b0';
                e.currentTarget.style.background = '#eef6e8';
              }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 1px 0 #b8c9b0';
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 5px 0 #b8c9b0';
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>↻</span>
              <span>REFRESH</span>
            </button>

            <button
              type="button"
              onClick={exportExcel}
              style={{
                height: 44,
                padding: '0 17px',
                border: '2px solid #20352b',
                borderRadius: 12,
                background: '#f7cf55',
                color: '#20352b',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '.02em',
                cursor: 'pointer',
                boxShadow: '0 3px 0 #c39f32',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                transition: 'transform .15s ease, box-shadow .15s ease, background .15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 5px 0 #c39f32';
                e.currentTarget.style.background = '#ffda6d';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 0 #c39f32';
                e.currentTarget.style.background = '#f7cf55';
              }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 1px 0 #c39f32';
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 5px 0 #c39f32';
              }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>▣</span>
              <span>EXPORT EXCEL</span>
            </button>

            {!fullScreen && (
              <button
                type="button"
                onClick={onClose}
                title="Đóng"
                aria-label="Đóng"
                style={{
                  width: 44,
                  height: 44,
                  padding: 0,
                  border: '2px solid #7b4037',
                  borderRadius: 12,
                  background: '#f4d8d1',
                  color: '#7b4037',
                  fontSize: 25,
                  fontWeight: 900,
                  lineHeight: 1,
                  cursor: 'pointer',
                  boxShadow: '0 3px 0 #c79b92',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform .15s ease, box-shadow .15s ease, background .15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 0 #c79b92';
                  e.currentTarget.style.background = '#f8e2dc';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 0 #c79b92';
                  e.currentTarget.style.background = '#f4d8d1';
                }}
                onMouseDown={e => {
                  e.currentTarget.style.transform = 'translateY(2px)';
                  e.currentTarget.style.boxShadow = '0 1px 0 #c79b92';
                }}
                onMouseUp={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 0 #c79b92';
                }}
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <img src="/assets/icon_huongduong.png" alt="" aria-hidden="true" draggable="false" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                BONUS ({pending.filter(s => s.missions?.mission_type === 'bonus').length})
              </span>
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
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
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
                        {isSubmissionRetry(s) && (
                          <span style={{
                            marginLeft: 8,
                            padding: '3px 7px',
                            borderRadius: 999,
                            background: '#fff0b8',
                            border: '1px solid #d9ad35',
                            color: '#765400',
                            fontSize: 11,
                            fontWeight: 900
                          }}>
                            ↻ SUBMIT LẠI · 50% ĐIỂM
                          </span>
                        )}

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
                    background: '#fffdf7',
                    border: '1px solid #d5d9cf'
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
              flex: '0 0 auto',
              padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
              background: '#f7f2df',
              borderTop: '1px solid #d9ddcf',
              position: 'relative',
              zIndex: 2
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
                  {isSubmissionRetry(selectedSubmission) && (
                    <div style={{
                      marginTop: 7,
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '5px 9px',
                      borderRadius: 999,
                      background: '#fff0b8',
                      border: '1px solid #d9ad35',
                      color: '#765400',
                      fontSize: 11,
                      fontWeight: 900
                    }}>
                      ↻ ĐÂY LÀ SUBMIT LẠI LẦN DUY NHẤT · CHỈ DUYỆT 50% ĐIỂM
                    </div>
                  )}
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
                    <b style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {selectedSubmission?.missions?.mission_type === 'bonus' ? (
                        <>
                          <img
                            src="/assets/icon_huongduong.png"
                            alt=""
                            aria-hidden="true"
                            draggable="false"
                            style={{ width: 18, height: 18, objectFit: 'contain' }}
                          />
                          BONUS SUBMISSION
                        </>
                      ) : '📋 NỘI DUNG SUBMISSION'}
                    </b>
                  </div>

                  {(() => {
                  const slug = selectedSubmission?.missions?.slug;
                  const needsEvidence =
                    slug === 'spotify_extra' ||
                    slug === 'itunes_extra' ||
                    slug === 'youtube_extra';
                  const evidenceCount = details?.evidence?.length || 0;
                  if (!needsEvidence || evidenceCount > 0 || !details) return null;
                  return (
                    <div
                      style={{
                        padding: 12,
                        marginBottom: 10,
                        borderRadius: 10,
                        background: '#fff3f0',
                        border: '1px solid #e7b0a7',
                        color: '#8b3f35',
                        fontSize: 12,
                        lineHeight: 1.5
                      }}
                    >
                      <b>⚠️ Submission này chưa có bản ghi minh chứng trong database.</b>
                      <div>
                        Account/Redeem vẫn được lưu từ <code>mission_submission_items</code>,
                        nhưng ảnh chưa nằm trong <code>submission_evidence</code>.
                        Hãy chạy SQL <code>ROUND2_EVIDENCE_FINAL_FIX_v4.sql</code> rồi submit lại Bonus.
                      </div>
                    </div>
                  );
                })()}

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
                      <b style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <img src="/assets/icon_huongduong.png" alt="" aria-hidden="true" draggable="false" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                        SPOTIFY EXTRA — ĐIỂM TỰ ĐỘNG
                      </b>
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
                        {(() => {
                          const basePoints = Math.min(
                            15,
                            Math.floor(Number(selectedSubmission?.quantity || 0) / 15) * 5
                          );
                          const isRetry = isSubmissionRetry(selectedSubmission);
                          const expected = isRetry ? basePoints * 0.5 : basePoints;
                          return <>Dự kiến: +{Number(expected).toFixed(1).replace(/\.0$/, '')} điểm{isRetry ? ' · 50%' : ''}</>;
                        })()}
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
                      <b style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <img src="/assets/icon_huongduong.png" alt="" aria-hidden="true" draggable="false" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                        ĐIỂM BONUS DO ADMIN DUYỆT
                        {isSubmissionRetry(selectedSubmission) && ' · SUBMIT LẠI → TỐI ĐA 50%'}
                      </b>
                      <input
                        type="number"
                        min={0}
                        max={
                          isSubmissionRetry(selectedSubmission)
                            ? Number(selectedSubmission?.missions?.max_points || 0) / 2
                            : (selectedSubmission?.missions?.max_points ?? undefined)
                        }
                        step={0.5}
                        value={bonusAwardPoints}
                        onChange={e => {
                          const max = Number(selectedSubmission?.missions?.max_points ?? Infinity);
                          const effectiveMax = isSubmissionRetry(selectedSubmission)
                            ? max / 2
                            : max;
                          const value = e.target.value;
                          if (value === '') {
                            setBonusAwardPoints('');
                            return;
                          }
                          const number = Number(value);
                          setBonusAwardPoints(
                            Number.isFinite(number)
                              ? String(Math.min(Math.max(0, number), effectiveMax))
                              : ''
                          );
                        }}
                        placeholder={
                          isSubmissionRetry(selectedSubmission)
                            ? `Tối đa ${Number(selectedSubmission?.missions?.max_points || 0) / 2} điểm (retry)`
                            : 'Nhập số điểm'
                        }
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
                    {details.items.map((item, itemIndex) => {
                      const slug = selectedSubmission?.missions?.slug;
                      let itemEvidence = (details.evidence || []).filter(
                        evidence =>
                          Number(evidence.item_no) === Number(item.item_no)
                      );

                      // Spotify Extra stores one stats.fm image per account.
                      // If an older evidence RPC/row has no item_no, fall back
                      // to the evidence order so the image is still shown.
                      if (
                        itemEvidence.length === 0 &&
                        (slug === 'spotify' || slug === 'spotify_extra' || slug === 'itunes_extra')
                      ) {
                        const fallbackEvidenceTypes =
                          slug === 'itunes_extra'
                            ? ['itunes_web_code_screenshot', 'redeem_screenshot']
                            : ['stream_screenshot'];
                        const orderedEvidence = (details.evidence || []).filter(
                          evidence => fallbackEvidenceTypes.includes(evidence.evidence_type)
                        );
                        if (orderedEvidence[itemIndex]) {
                          itemEvidence = [orderedEvidence[itemIndex]];
                        }
                      }

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

                {/*
                 * Spotify Extra / iTunes Extra fallback:
                 * Some legacy item RPC rows may be missing or may not carry item_no.
                 * In that case, still render every uploaded proof in the Admin panel.
                 */}
                {(() => {
                  const slug = selectedSubmission?.missions?.slug;
                  const isExtraEvidenceMission =
                    slug === 'spotify_extra' || slug === 'itunes_extra';
                  const hasItems = Boolean(details?.items?.length);
                  const evidenceTypes =
                    slug === 'itunes_extra'
                      ? ['itunes_web_code_screenshot', 'redeem_screenshot']
                      : ['stream_screenshot'];
                  const fallbackEvidence = (details?.evidence || []).filter(
                    evidence => evidenceTypes.includes(evidence.evidence_type)
                  );

                  if (!isExtraEvidenceMission || hasItems || !fallbackEvidence.length) {
                    return null;
                  }

                  const label = index =>
                    slug === 'itunes_extra'
                      ? `REDEEM ${index + 1}`
                      : `ACCOUNT SPOTIFY ${index + 1}`;

                  return (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {fallbackEvidence.map((evidence, index) => (
                        <article
                          key={evidence.id}
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
                            <b>{label(index)}</b>
                            <small
                              style={{
                                padding: '3px 6px',
                                borderRadius: 99,
                                background: '#eef6ed',
                                color: '#356640',
                                fontWeight: 800
                              }}
                            >
                              MINH CHỨNG
                            </small>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              evidence.signedUrl && setSelectedEvidence(evidence)
                            }
                            disabled={!evidence.signedUrl}
                            style={{
                              width: '100%',
                              padding: 0,
                              border: '1px solid #d5d9cf',
                              borderRadius: 10,
                              overflow: 'hidden',
                              background: '#fff',
                              textAlign: 'left',
                              cursor: evidence.signedUrl ? 'zoom-in' : 'default'
                            }}
                          >
                            {evidence.signedUrl ? (
                              <img
                                src={evidence.signedUrl}
                                alt={evidence.original_filename || 'proof'}
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  maxHeight: 420,
                                  objectFit: 'contain',
                                  background: '#f7f8f5'
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  minHeight: 160,
                                  display: 'grid',
                                  placeItems: 'center',
                                  padding: 12,
                                  fontSize: 11,
                                  textAlign: 'center'
                                }}
                              >
                                {evidence.signedUrlError ||
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
                                title={evidence.original_filename || 'Minh chứng'}
                              >
                                {evidence.original_filename || 'Minh chứng'}
                              </b>
                              <small
                                style={{
                                  display: 'block',
                                  marginTop: 3,
                                  opacity: .55,
                                  fontSize: 9
                                }}
                              >
                                {evidence.evidence_type || 'MINH CHỨNG'}
                              </small>
                            </div>
                          </button>
                        </article>
                      ))}
                    </div>
                  );
                })()}

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

                  const slug = selectedSubmission?.missions?.slug;
                  if (slug === 'spotify_extra' || slug === 'itunes_extra') return null;
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
    </>
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
   SUNFLOWER GROWTH
   ========================================================= */

function Plant({ growthStage, done, active }) {
  const growthImage = GROWTH_IMAGE_ASSETS[growthStage];

  return (
    <div
      className={`growthPlant growth-${growthStage} ${
        done ? 'plantDone' : ''
      } ${active ? 'plantActive' : ''}`}
      aria-label={`Giai đoạn ${growthStage} của cây hướng dương`}
      style={{
        position: 'relative',
        overflow: 'visible'
      }}
    >
{growthImage && (
        <img
          className={`growthPlantImage growthPlantImage-${growthStage}`}
          src={growthImage}
          alt={`Cây hướng dương giai đoạn ${growthStage}`}
          draggable="false"
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '8px',
            transform: 'translateX(-50%)',
            width: growthStage === 1 ? '56px'
              : growthStage === 2 ? '82px'
              : growthStage === 3 ? '100px'
              : growthStage === 4 ? '114px'
              : '124px',
            height: 'auto',
            maxWidth: 'none',
            display: 'block',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />
      )}

      
    </div>
  );
}


/* =========================================================
   HOA HƯỚNG DƯƠNG — CSS-IN-JS
   ========================================================= */

function SunflowerFlower() {
  return (
    <div className="sunflowerFlower" aria-hidden="true">
      <span className="petal p1" />
      <span className="petal p2" />
      <span className="petal p3" />
      <span className="petal p4" />
      <span className="petal p5" />
      <span className="petal p6" />
      <span className="petal p7" />
      <span className="petal p8" />
      <span className="flowerCenter">
        <i />
      </span>
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

  const bonusMission = isBonus
    ? localMission
    : bonusMissionMap[mission.id]
      ? BONUS_MISSIONS.find(m => m.id === bonusMissionMap[mission.id])
      : null;

  const [submissionStep, setSubmissionStep] = useState(
    isBonus ? 'main-submit' : 'main'
  );
  // Round 2 Bonus starts with ZERO items. It must never inherit Round 1 items/progress.
  const [bonusItems, setBonusItems] = useState([]);
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

  // Mandatory missions are never locked by sequence.
  const isLocked = false;
  const isPending = status === 'pending_review';
  const isCompleted = status === 'completed' && !isBonus;
  const isBonusApprovedToday =
    isBonus && (
      status === 'approved_locked' ||
      latestSubmission?.status === 'approved'
    );
  const isBonusMaxed =
    isBonus && Number(count || 0) >= Number(localMission.target || 0);
  const isRejected = !isBonusApprovedToday && latestSubmission?.status === 'rejected';

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
      if (Number(quantity) < 1) { notify('Hãy nhập số stream lớn hơn 0.'); return false; }
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
        accountId: '',
        contentUrl: '',
        platform,
        metadata: {}
      }
    ]);
  };

  const removeBonusItem = index => {
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
    if (!bonusMission) return false;

    if (bonusMission.id === 'itunes_extra') {
      if (bonusItems.length < 1 || bonusItems.length > 10) { notify('iTunes Extra: bạn có thể gửi từ 1 đến 10 CODE.'); return false; }
      for (let i = 0; i < bonusItems.length; i++) {
        if (!bonusItunesProofFiles[i]) { notify(`iTunes Extra CODE ${i + 1}: cần ảnh minh chứng.`); return false; }
      }
    }

    if (bonusMission.id === 'youtube_extra') {
      if (!bonusItems.length || bonusItems.length > 5) { notify('YouTube Extra: mỗi gói Like + Comment = +2 điểm, tối đa 10 điểm.'); return false; }
      for (let i = 0; i < bonusItems.length; i++) {
        const item = bonusItems[i];
        const proofs = bonusYoutubeProofFiles[i] || {};
        if (!item?.accountId?.trim()) { notify(`YouTube Extra tài khoản #${i + 1}: cần account / username.`); return false; }
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

      for (let i = 0; i < bonusItems.length; i++) {
        const item = bonusItems[i];
        const acc = (item.accountId || '').trim();

        if (!acc) {
          notify(`Spotify Extra tài khoản #${i + 1}: hãy nhập account Spotify.`);
          return false;
        }

        if (Number(item.quantity || 0) < 15) {
          notify(`Spotify Extra tài khoản #${i + 1}: cần ít nhất 15 streams.`);
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
    // Round 2 is a completely separate form.
    // Never validate a Round 2 submission with Round 1 rules.
    if (isBonus) {
      if (!validateBonus()) return;
    } else {
      if (!mainMissionValidation()) return;
    }
    if (isBonus && isBonusApprovedToday) {
      notify('Bonus này đã được Admin duyệt hôm nay và đã khóa. Ngày mai bạn có thể submit lại.');
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    const uploaded = [];
    const bonusUploaded = [];
    let createdSubmissionId = null;
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
      for (const id of [createdSubmissionId]) {
        if (!id) continue;
        const { error } = await supabase.rpc('rollback_pending_submission', { p_submission_id: id });
        if (error) console.error('rollback pending submission:', error);
      }
      createdSubmissionId = null;
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

      // Round 2 Bonus proofs must be uploaded and linked to the submission later.
      // TikTok/Social use links as their evidence; iTunes, Spotify and YouTube
      // use per-item image evidence.
      if (isBonus) {
        if (mission.id === 'youtube_extra') {
          const proofTypes = [
            ['subscribe', 'youtube_subscribe_screenshot'],
            ['like', 'youtube_like_screenshot'],
            ['comment', 'youtube_comment_screenshot']
          ];
          for (let i = 0; i < bonusItems.length; i++) {
            const proofs = bonusYoutubeProofFiles[i] || {};
            for (const [proofType, evidenceType] of proofTypes) {
              const file = proofs[proofType];
              if (!file) throw new Error(`YouTube Extra tài khoản ${i + 1}: thiếu ảnh ${proofType}.`);
              const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
              const storagePath = `${user.id}/${mission.id}/${draftId}/account-${i + 1}-${proofType}-${Date.now()}-${safeName}`;
              const { error: uploadError } = await supabase.storage.from('mission-evidence').upload(storagePath, file, { contentType: file.type, upsert: false });
              if (uploadError) throw uploadError;
              bonusUploaded.push({ path: storagePath, type: evidenceType, file, itemNo: i + 1 });
            }
          }
        } else if (mission.id === 'spotify_extra') {
          for (let i = 0; i < bonusItems.length; i++) {
            const file = bonusSpotifyProofFiles[i];
            if (!file) throw new Error(`Spotify Extra tài khoản ${i + 1}: thiếu ảnh minh chứng stats.fm.`);
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const storagePath = `${user.id}/${mission.id}/${draftId}/account-${i + 1}-stats-${Date.now()}-${safeName}`;
            const { error: uploadError } = await supabase.storage.from('mission-evidence').upload(storagePath, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;
            bonusUploaded.push({ path: storagePath, type: 'stream_screenshot', file, itemNo: i + 1 });
          }
        } else if (mission.id === 'itunes_extra') {
          for (let i = 0; i < bonusItems.length; i++) {
            const file = bonusItunesProofFiles[i];
            if (!file) throw new Error(`iTunes Extra CODE ${i + 1}: thiếu ảnh minh chứng.`);
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const storagePath = `${user.id}/${mission.id}/${draftId}/item-${i + 1}-code-${Date.now()}-${safeName}`;
            const { error: uploadError } = await supabase.storage.from('mission-evidence').upload(storagePath, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;
            bonusUploaded.push({ path: storagePath, type: 'itunes_web_code_screenshot', file, itemNo: i + 1 });
          }
        }
      }

      const topQuantity = isBonus
        ? Number(
            mission.id === 'spotify_extra'
              ? bonusItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
              : bonusItems.length
          )
        : mission.id === 'spotify'
          ? Number(quantity)
          : (mission.target || items.length || 1);

      /*
       * Keep the existing submission RPC for all missions.
       * For YouTube, if anything below fails, rollback_pending_submission()
       * removes the just-created pending submission before we clean Storage.
       */
      const { data: submission, error: submitError } = isBonus
        ? await supabase.rpc('submit_round2_bonus_submission', {
            p_mission_slug: mission.id,
            p_quantity: topQuantity,
            p_content_url: null,
            p_note: note.trim() || null,
            p_platform: mission.id.replace('_extra', '')
          })
        : await supabase.rpc('submit_mission_v4', {
            p_mission_slug: mission.id,
            p_content_url: postUrl.trim() || null,
            p_note: note.trim() || null,
            p_platform: mission.id,
            p_account_id: accountId.trim() || null,
            p_redeem_code: redeemCode.trim() || null,
            p_external_action_id: externalActionId.trim() || null,
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
      const submissionItems = isBonus ? bonusItems : items;
      for (let i = 0; i < submissionItems.length; i++) {
        const item = submissionItems[i];

        const itemQuantity =
          mission.id === 'spotify_extra'
            ? Number(item.quantity || 0)
            : mission.id === 'spotify'
              ? Number(quantity)
              : item.quantity || 1;

        const metadata = {
          ...(item.metadata || {}),
          activity_date:
            mission.id === 'spotify'
              ? activityDate
              : mission.id === 'spotify_extra'
                ? item.activityDate
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
              mission.id === 'spotify'
                ? accountId.trim() || null
                : mission.id === 'spotify_extra'
                  ? item.accountId?.trim() || null
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
       * Write every uploaded file into submission_evidence directly.
       * The SQL fix creates a narrowly-scoped INSERT policy: a player may
       * insert evidence only for their own pending submission. This avoids
       * PostgREST RPC/schema-cache issues and keeps evidence + item_no exact.
       */
      const evidenceRowsToInsert = [...uploaded, ...bonusUploaded].map(item => ({
        submission_id: createdSubmissionId,
        evidence_type: item.type,
        storage_bucket: 'mission-evidence',
        storage_path: item.path,
        original_filename: item.file.name,
        mime_type: item.file.type || null,
        file_size: item.file.size ?? null,
        item_no: item.itemNo ?? null
      }));

      if (evidenceRowsToInsert.length > 0) {
        const { error: evidenceInsertError } = await supabase
          .from('submission_evidence')
          .insert(evidenceRowsToInsert);

        if (evidenceInsertError) {
          throw new Error(
            `Không lưu được minh chứng vào database: ${evidenceInsertError.message}`
          );
        }
      }

      // Verify that the rows really exist before marking the submit committed.
      const { count: evidenceRowCount, error: evidenceVerifyError } = await supabase
        .from('submission_evidence')
        .select('id', { count: 'exact', head: true })
        .eq('submission_id', createdSubmissionId);

      if (evidenceVerifyError) throw evidenceVerifyError;
      if (Number(evidenceRowCount || 0) < evidenceRowsToInsert.length) {
        throw new Error(
          `Database chưa lưu đủ minh chứng (${evidenceRowCount || 0}/${evidenceRowsToInsert.length}).`
        );
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
    !isBonusApprovedToday &&
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

        {!isBonus && <h2>{localMission.action}</h2>}
        <h3>{localMission.name}</h3>
        {!isBonus && mission.id !== 'youtube' && <p>{localMission.hint}</p>}

        {!isBonus && (
          <div className="modalRule">
            {localMission.rule || localMission.description}
          </div>
        )}

        {isCompleted && (
          <div className="submissionState success">
            ✓ NHIỆM VỤ ĐÃ ĐƯỢC ADMIN DUYỆT
          </div>
        )}

        {isBonusApprovedToday && (
          <div className="submissionState success">
            ✓ BONUS ĐÃ ĐƯỢC ADMIN DUYỆT HÔM NAY
            <p style={{ margin: '6px 0 0', opacity: .82 }}>
              Bonus này đã khóa cho hôm nay. Ngày tiếp theo sẽ mở lại.
            </p>
          </div>
        )}

        {isPending && (!isBonusApprovedToday) && (
          <div className="submissionState pending">
            ⏳ ĐÃ SUBMIT — ĐANG CHỜ ADMIN DUYỆT
          </div>
        )}

        {isRejected && (
          <div className="submissionState rejected bonusRejectedNotice">
            <b>✕ {localMission.name} · ĐÃ BỊ TỪ CHỐI</b>
            <p>
              {latestSubmission.admin_comment ||
                'Admin chưa để lại nhận xét.'}
            </p>
            <small>
              Hãy kiểm tra lại minh chứng và submit lại <strong>1 lần duy nhất</strong>.
              Nếu được duyệt, bạn sẽ nhận <strong>50% số điểm</strong>.
            </small>
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
              src="/assets/lastfm-guide.png"
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
            {!isBonus && (
              <>
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
                    min={1}
                    max={9999}
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
                  placeholder="Account / username"
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
                type="button"
                disabled={submitting}
                onClick={async () => {
                  if (!mainMissionValidation()) return;
                  // ROUND 1: bấm nút này là SUBMIT luôn.
                  // Không có bước "TIẾP THEO" và không hỏi Bonus trong modal.
                  await submit();
                }}
              >
                {submitting ? 'ĐANG SUBMIT...' : (isRejected ? '↻ SUBMIT LẠI' : '↑ SUBMIT')}
              </button>
            )}

            </>
            )}

            {false && !isBonus && submissionStep === 'bonus-choice' && (
              <div className="bonusChoicePanel">
                <div className="bonusChoiceMessage">
                  <b style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <img src="/assets/icon_huongduong.png" alt="" aria-hidden="true" draggable="false" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                      Bạn có muốn tham gia thêm {bonusMission?.name} không?
                    </b>
                  <small style={{ display: 'block', marginTop: 5, opacity: .7 }}>{bonusMission?.id === 'spotify_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. Spotify Extra cho phép thêm các account khác, mỗi account stream ít nhất 15 lần.' : bonusMission?.id === 'youtube_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. YouTube Extra cho phép thêm các account khác, mỗi account cần đủ Subscribe + Like + Comment.' : bonusMission?.id === 'tiktok_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. TikTok Extra cho phép gửi thêm các video hợp lệ.' : bonusMission?.id === 'social_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. Social Extra cho phép gửi thêm các bài đăng hợp lệ.' : bonusMission?.id === 'itunes_extra' ? 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo. iTunes Extra cho phép gửi thêm các CODE hợp lệ.' : 'Bạn có thể thêm minh chứng ngay trong bước tiếp theo.'}</small>
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

            {isBonus && submissionStep === 'main-submit' && bonusMission && (
              <div className="bonusFormPanel">
                <div className="bonusFormHeader">
                  <div className="bonusFormIcon">
                    <img
                      src={bonusMission.logo || '/assets/icon_huongduong.png'}
                      alt={bonusMission.name || ''}
                      aria-hidden="true"
                      draggable="false"
                      className="bonusFormIconImage"
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/icon_huongduong.png';
                      }}
                    />
                  </div>
                  <div>
                    <span className="bonusFormKicker">ROUND 2 · BONUS TỰ CHỌN</span>
                    <p>{bonusMission.rule}</p>
                    <span className="bonusRuleHint">Mỗi lượt stream, bài đăng social là một tia nắng nhỏ.
Cùng gom góp thật nhiều ánh sáng, để “bông hoa ấy” từng chút một nở rộ và tỏa sáng thật đẹp nhé.</span>
                  </div>
                </div>

                {bonusMission.id === 'spotify_extra' && (
                  <div className="bonusSection">
                    <div className="bonusItemsHeader">
                      <div>
                        <b>MINH CHỨNG SPOTIFY EXTRA</b>
                        <small> Admin sẽ tự kiểm tra account, ngày stream và ảnh stats.fm · mỗi account cần ít nhất 15 streams.</small>
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
                      <b style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <img
                          src="/assets/icon_huongduong.png"
                          alt=""
                          aria-hidden="true"
                          draggable="false"
                          style={{ width: 18, height: 18, objectFit: 'contain' }}
                        />
                        15 streams / account = +5 PTS
                      </b>
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
                              placeholder="Account / username"
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
                              min={15}
                              value={item.quantity || ''}
                              onChange={e => {
                                const value = Math.max(0, Number(e.target.value || 0));
                                updateBonusItem(index, 'quantity', value);
                                updateBonusMetadata(index, 'quantity', value);
                              }}
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
                        <span className="bonusQuestBadge">
                          <img src="/assets/icon_huongduong.png" alt="" aria-hidden="true" draggable="false" style={{ width: 16, height: 16, objectFit: 'contain', verticalAlign: 'middle', marginRight: 4 }} />
                          BONUS QUEST
                        </span>
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
                      <div>                         <small>Admin sẽ tự kiểm tra account và minh chứng.</small>
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
                          <label style={{ display: 'grid', gap: 5, marginBottom: 8 }}>
                            <span>TÀI KHOẢN / USERNAME</span>
                            <input
                              value={item.accountId || ''}
                              onChange={e => updateBonusItem(index, 'accountId', e.target.value)}
                              placeholder="Account / username"
                              disabled={submitting}
                            />
                          </label>
                          {/*<label style={{ display: 'grid', gap: 5, marginBottom: 8 }}>
                            <span>LINK VIDEO / BÀI ĐĂNG KIỂM CHỨNG</span>
                            <input
                              type="url"
                              value={item.contentUrl || ''}
                              onChange={e => updateBonusItem(index, 'contentUrl', e.target.value)}
                              placeholder="Link video YouTube"
                              disabled={submitting}
                            />
                          </label>*/}
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
                       {/* <small> Giống phần chính: mỗi bài chỉ cần link bài đăng.</small>*/}
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
                  <button type="button" className="softBackButton" onClick={close} disabled={submitting}>← ĐÓNG</button>
                  <button className="playButton submitButton" type="button" disabled={submitting} onClick={submit}>
                    {submitting ? 'ĐANG SUBMIT...' : (isRejected ? '↻ SUBMIT LẠI · 1 LẦN' : '↑ SUBMIT')}
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