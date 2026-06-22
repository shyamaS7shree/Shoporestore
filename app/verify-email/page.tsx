'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid link.'); return; }

    fetch(`http://localhost:5285/api/Auth/verify-email?token=${token}`)
      .then(r => r.json())
      .then(data => { setStatus('success'); setMessage(data.message); })
      .catch(() => { setStatus('error'); setMessage('Something went wrong.'); });
  }, [token]);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', minHeight:'100vh', fontFamily:'Arial,sans-serif' }}>
      {status === 'loading' && <p>⏳ Verifying your email...</p>}
      {status === 'success' && (
        <>
          <div style={{ background:'#16a34a', color:'white', padding:'32px',
                        borderRadius:'12px', textAlign:'center', maxWidth:'400px' }}>
            <h2>✅ Email Verified!</h2>
            <p>{message}</p>
            <a href="/" style={{ color:'white', fontWeight:'bold' }}>Go to Home →</a>
          </div>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ background:'#dc2626', color:'white', padding:'32px',
                        borderRadius:'12px', textAlign:'center', maxWidth:'400px' }}>
            <h2>❌ Verification Failed</h2>
            <p>{message}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',justifyContent:'center',
                                    alignItems:'center',minHeight:'100vh'}}>
                          Loading...
                        </div>}>
      <VerifyContent />
    </Suspense>
  );
}