import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

type Phase = 'enter_phone' | 'enter_otp' | 'verifying';

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  // If user includes country code, keep it.
  if (raw.trim().startsWith('+')) return digits ? `+${digits}` : '';
  // Default to India (can be customized later)
  return `+${digits}`;
}

export default function PhoneOtpLogin({
  onVerified,
  onCancel,
}: {
  onVerified: () => void;
  onCancel?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('enter_phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const canSendOtp = useMemo(() => phone.trim().length >= 10, [phone]);
  const canVerifyOtp = useMemo(() => otp.replace(/\D+/g, '').length >= 4, [otp]);

  const sendOtp = async () => {
    const normalized = normalizePhone(phone);
    if (!normalized || normalized.length < 8) {
      toast.error('Enter a valid phone number.');
      return;
    }

    try {
      setPhase('enter_otp');
      // Triggers Twilio OTP.
      const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (error) throw error;
      toast.success('OTP sent. Enter the code to continue.');
    } catch (e: any) {
      setPhase('enter_phone');
      toast.error(e?.message || 'Failed to send OTP.');
    }
  };

  const verifyOtp = async () => {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      toast.error('Phone missing.');
      setPhase('enter_phone');
      return;
    }

    try {
      setPhase('verifying');
      // Supabase verifies OTP and completes login.
      const { error } = await supabase.auth.verifyOtp({
        phone: normalized,
        token: otp.replace(/\s+/g, ''),
        type: 'sms',
      });

      if (error) throw error;

      toast.success('Phone verified.');
      onVerified();
    } catch (e: any) {
      setPhase('enter_otp');
      toast.error(e?.message || 'Invalid/expired OTP.');
    }
  };

  return (
    <div className="space-y-4">
      {phase === 'enter_phone' && (
        <>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
            />
          </div>

          <button
            onClick={sendOtp}
            disabled={!canSendOtp}
            className="w-full rounded-2xl bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-5 py-3 text-sm font-semibold text-white hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            Send OTP
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-2xl border border-[hsl(var(--border))] px-5 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
            >
              Back
            </button>
          )}
        </>
      )}

      {phase !== 'enter_phone' && (
        <>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Verify OTP</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              Enter the SMS code sent to {phone || 'your phone'}.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">OTP</label>
            <input
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="1234"
              className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-blue))]/30"
            />
          </div>

          <button
            onClick={verifyOtp}
            disabled={!canVerifyOtp || phase === 'verifying'}
            className="w-full rounded-2xl bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] px-5 py-3 text-sm font-semibold text-white hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {phase === 'verifying' ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <button
            type="button"
            onClick={() => {
              setPhase('enter_phone');
              setOtp('');
            }}
            className="w-full rounded-2xl border border-[hsl(var(--border))] px-5 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
          >
            Change phone
          </button>
        </>
      )}
    </div>
  );
}

