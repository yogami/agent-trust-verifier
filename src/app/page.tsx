'use client';

import { useState } from 'react';

export default function Home() {
  const [did, setDid] = useState('did:web:agent-1');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [issuedVC, setIssuedVC] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/verify-agent', {
        method: 'POST',
        body: JSON.stringify({ did }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleIssueVC = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vc/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectDid: did,
          type: ['TrustCredential'],
          data: {
            trustScore: 0.95,
            reviews: 50,
          },
        }),
      });
      const data = await res.json();
      setIssuedVC(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Agent Trust Verifier
          </h1>
          <div className="text-sm text-neutral-400">DID Validation System</div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity Verification Panel */}
          <div className="bg-neutral-900/50 backdrop-blur p-6 rounded-2xl border border-neutral-800/50 hover:border-emerald-500/30 transition-all">
            <h2 className="text-xl font-semibold mb-4 text-emerald-200">Verify Agent Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Target DID</label>
                <input
                  type="text"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>
              <button
                onClick={handleVerifyAgent}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Agent'}
              </button>

              {verificationResult && (
                <div className="mt-4 p-4 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono overflow-auto">
                  <pre>{JSON.stringify(verificationResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Credential Issuance Panel */}
          <div className="bg-neutral-900/50 backdrop-blur p-6 rounded-2xl border border-neutral-800/50 hover:border-cyan-500/30 transition-all">
            <h2 className="text-xl font-semibold mb-4 text-cyan-200">Issue Trust Credential</h2>
            <div className="space-y-4">
              <div className="text-sm text-neutral-400">
                Issues a signed Verifiable Credential (VC) vouching for this agent's trust score.
              </div>
              <button
                onClick={handleIssueVC}
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Issuing...' : 'Issue VC'}
              </button>

              {issuedVC && (
                <div className="mt-4 p-4 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono overflow-auto">
                  <pre>{JSON.stringify(issuedVC, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Verification Log */}
        <section className="bg-neutral-900/30 rounded-2xl p-6 border border-neutral-800">
          <h3 className="text-lg font-medium mb-4">Latest Verifications</h3>
          <div className="text-neutral-500 text-sm italic">
            No verification logs available yet. database connection required.
          </div>
        </section>
      </div>
    </div>
  );
}
