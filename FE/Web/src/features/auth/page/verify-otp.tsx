import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const message = location.state?.message;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);


  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);


  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (email) {
      const storageKey = `resend_count_${email}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        const { count, timestamp } = JSON.parse(storedData);
        const hoursPassed = (Date.now() - timestamp) / (1000 * 60 * 60);
        
        if (hoursPassed < 24) {
          setResendCount(count);
        } else {

          localStorage.removeItem(storageKey);
          setResendCount(0);
        }
      }
    }
  }, [email]);

  const handleOtpChange = (index: number, value: string) => {

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');


    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      while (newOtp.length < 6) newOtp.push('');
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete OTP code (6 digits)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8001/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpString,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Verification successful! Redirecting to login page...');
        setTimeout(() => {
          // Clear resend count on success
          localStorage.removeItem(`resend_count_${email}`);
          navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
        }, 2000);
      } else {
        setError(data.message || 'Incorrect OTP code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Verify OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCount >= 5) {
      setError('You have exceeded the maximum number of OTP resend attempts (maximum 5 times in 24 hours)');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8001/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {

        const newCount = resendCount + 1;
        setResendCount(newCount);
        

        const storageKey = `resend_count_${email}`;
        localStorage.setItem(storageKey, JSON.stringify({
          count: newCount,
          timestamp: Date.now()
        }));

        setSuccess('OTP code has been resent. Please check your email.');
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Resend OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message || 'We have sent an OTP code to your email'}
          </p>
          <p className="mt-1 text-center text-sm font-medium text-blue-600">
            {email}
          </p>
        </div>

        <div className="mt-8 space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Enter OTP Code (6 digits)
            </label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              ))}
            </div>
          </div>


          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}


          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{success}</span>
            </div>
          )}


          <div>
            <button
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </div>


          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              {canResend ? (
                resendCount >= 5 ? (
                  <span className="text-red-600">
                    You have exceeded the OTP resend limit (5/5)
                  </span>
                ) : (
                  <span>
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Resend
                    </button>
                    {' '}
                    <span className="text-gray-500">({resendCount}/5)</span>
                  </span>
                )
              ) : (
                <span>
                  Resend code in <span className="font-medium text-blue-600">{countdown}s</span>
                  {' '}
                  <span className="text-gray-500">({resendCount}/5)</span>
                </span>
              )}
            </div>
          </div>


          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
