import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import API_BASE from '../api';
import { useTranslation } from 'react-i18next';

const OTP_EXPIRY_SECONDS = 600; // 10 minutes

const VerifyOTP = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/verify-otp`, { email, otp });
      // Store the reset token temporarily
      localStorage.setItem('resetToken', res.data.resetToken);
      navigate('/reset-password');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setResendMsg('New OTP sent!');
      setTimeout(() => setResendMsg(''), 4000);
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">{t('forgot.otpTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('forgot.otpSubtitle')} <strong>{email}</strong>
          </p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        {resendMsg && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm text-center">{resendMsg}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('forgot.otpLabel')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input-field text-center text-2xl font-bold tracking-widest"
              placeholder="• • • • • •"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-gray-500'}`}>
              ⏱ {t('forgot.expiresIn')}: {formatTime(timeLeft)}
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 540 || resending}
              className="flex items-center gap-1 text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3 h-3" />
              {resending ? 'Sending...' : t('forgot.resend')}
            </button>
          </div>

          <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Verifying...' : t('forgot.verify')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('forgot.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
