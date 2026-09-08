import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ error: 'Missing authorization.' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('MAIL_FROM');

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromEmail) {
      return json({ error: 'Email service is not configured.' }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: callerData, error: callerError } = await adminClient.auth.getUser(token);
    if (callerError || !callerData?.user) return json({ error: 'Invalid session.' }, 401);

    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', callerData.user.id)
      .single();

    if (profileError || callerProfile?.role !== 'admin') {
      return json({ error: 'Admin access required.' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const submissionId = String(body?.submission_id || '').trim();
    if (!submissionId) return json({ error: 'submission_id is required.' }, 400);

    const { data: event, error: eventError } = await adminClient
      .from('email_events')
      .select('id, user_id, submission_id, email, email_type, status, created_at')
      .eq('submission_id', submissionId)
      .eq('status', 'queued')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (eventError) throw eventError;
    if (!event) return json({ ok: true, sent: false, message: 'No queued email event.' });
    if (!event.email) return json({ error: 'The user has no email address.' }, 422);

    const [{ data: submission, error: submissionError }, { data: profile }] = await Promise.all([
      adminClient
        .from('mission_submissions')
        .select('id, user_id, status, points_awarded, admin_comment, reviewed_at, missions(name)')
        .eq('id', submissionId)
        .single(),
      adminClient
        .from('profiles')
        .select('username')
        .eq('id', event.user_id)
        .maybeSingle()
    ]);

    if (submissionError) throw submissionError;

    const username = profile?.username || 'bạn';
    const missionName = submission?.missions?.name || 'Nhiệm vụ';
    const approved = event.email_type === 'mission_approved';
    const subject = approved
      ? `🌻 ${missionName} đã được duyệt · SUNFLOWER WITH tinie`
      : `🌱 ${missionName} cần submit lại · SUNFLOWER WITH tinie`;

    const reason = submission?.admin_comment?.trim() || 'Admin không ghi chú thêm.';
    const points = Number(submission?.points_awarded || 0);

    const html = `
<!doctype html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f6f1df;font-family:Arial,sans-serif;color:#20352b">
  <div style="max-width:620px;margin:0 auto;padding:28px 18px">
    <div style="background:#fffdf7;border:2px solid #20352b;border-radius:18px;padding:26px">
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;opacity:.7">SUNFLOWER WITH tinie</div>
      <h1 style="margin:10px 0 16px;font-size:28px">${approved ? '🌻 Nhiệm vụ đã được duyệt' : '🌱 Nhiệm vụ cần submit lại'}</h1>
      <p>Xin chào <strong>${escapeHtml(username)}</strong>,</p>
      <p>Nhiệm vụ <strong>${escapeHtml(missionName)}</strong> của bạn vừa được admin ${approved ? 'duyệt' : 'từ chối'}.</p>
      ${approved ? `<div style="margin:18px 0;padding:16px;border-radius:12px;background:#dff1df;border:1px solid #6ba474"><strong>+${points} điểm</strong><br>Tổng điểm của bạn đã được cập nhật trong game.</div>` : ''}
      ${!approved ? `<div style="margin:18px 0;padding:16px;border-radius:12px;background:#f8dddd;border:1px solid #c56a5f"><strong>Lý do:</strong><br>${escapeHtml(reason)}</div>` : ''}
      <p>Mở game để xem trạng thái submission và tiếp tục hành trình.</p>
      <div style="margin-top:24px;font-size:12px;opacity:.6">Email tự động từ hệ thống SUNFLOWER WITH tinie.</div>
    </div>
  </div>
</body>
</html>`;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [event.email],
        subject,
        html
      })
    });

    const resendData = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      const errorMessage = resendData?.message || resendData?.error || `Resend HTTP ${resendResponse.status}`;
      await adminClient
        .from('email_events')
        .update({ status: 'failed', error_message: String(errorMessage) })
        .eq('id', event.id);
      return json({ error: String(errorMessage) }, 502);
    }

    await adminClient
      .from('email_events')
      .update({
        status: 'sent',
        provider_message_id: resendData?.id || null,
        sent_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', event.id);

    return json({ ok: true, sent: true, email: event.email, provider_message_id: resendData?.id || null });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500);
  }
});

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char] || char));
}
