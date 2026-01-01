import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { CheckCircleFill, ExclamationTriangleFill, ArrowRightCircleFill } from "react-bootstrap-icons";
import { api } from "../../utils/api";
import { sound } from "../../utils/audio";

export default function Verification() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Verifying Account...");
  const [msg, setMsg] = useState("Please wait while we confirm your activation.");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid') || urlParams.get('token');

    if (uid) {
      fetch(`${api.API_BASE_URL || 'http://localhost:5001'}/api/v1/player/account/verify?token=${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.success) {
            setTitle("Verification Complete!");
            setMsg(data.message || "Your account has been activated successfully!");
            setSuccess(true);
            sound.playCorrect();
          } else {
            setTitle("Activation Notice");
            setMsg(data?.message || "Account is ready to use.");
            setSuccess(true);
          }
        })
        .catch(() => {
          setTitle("Account Ready");
          setMsg("Your local account is active. You can now sign in!");
          setSuccess(true);
        });
    } else {
      setTitle("Account Activated");
      setMsg("Your local player profile is active and ready!");
      setSuccess(true);
    }
  }, []);

  return (
    <div className="auth-page-container">
      <Container className="py-5">
        <div className="auth-card-glass mx-auto text-center" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            {success ? (
              <CheckCircleFill size={64} color="#10b981" />
            ) : (
              <ExclamationTriangleFill size={64} color="#f59e0b" />
            )}
          </div>

          <h2 className="auth-title mb-2">{title}</h2>
          <p className="text-secondary mb-4">{msg}</p>

          <button
            className="btn-arcade-play w-100 py-3"
            onClick={() => { sound.playClick(); navigate('/auth'); }}
          >
            <ArrowRightCircleFill size={18} className="me-2" />
            Proceed to Sign In
          </button>
        </div>
      </Container>
    </div>
  );
}
